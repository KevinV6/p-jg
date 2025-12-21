const jwt = require('jsonwebtoken');
const { getAdminConnection } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'jg-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

// Genera tokens de acceso y refresh
const generateTokens = (user) => {
  const payload = {
    idusuario: user.idusuario,
    nombreusuario: user.nombreusuario,
    rol: user.rol
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const refreshToken = jwt.sign(
    { ...payload, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );

  return { token, refreshToken };
};

// Verifica y decodifica un token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Middleware de autenticación
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        error: 'Token de acceso requerido' 
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ 
        success: false,
        error: 'Token inválido o expirado' 
      });
    }

    // Verificar que la sesión existe y está activa
    const supabase = getAdminConnection();
    const { data: session, error } = await supabase
      .from('sesion_token')
      .select('*')
      .eq('token', token)
      .eq('estado', 1)
      .single();

    if (error || !session) {
      return res.status(401).json({ 
        success: false,
        error: 'Sesión no válida o expirada' 
      });
    }

    // Verificar expiración
    if (new Date(session.fechaexpiracion) < new Date()) {
      // Marcar sesión como expirada
      await supabase
        .from('sesion_token')
        .update({ estado: 0 })
        .eq('idsesion', session.idsesion);
        
      return res.status(401).json({ 
        success: false,
        error: 'Sesión expirada' 
      });
    }

    req.user = decoded;
    req.sessionId = session.idsesion;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ 
      success: false,
      error: 'Error de autenticación' 
    });
  }
};

// Middleware opcional (no falla si no hay token)
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      
      if (decoded) {
        req.user = decoded;
      }
    }
    next();
  } catch (error) {
    next();
  }
};

// Middleware de roles
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        error: 'No autenticado' 
      });
    }

    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ 
        success: false,
        error: 'No tienes permisos para esta acción' 
      });
    }

    next();
  };
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  requireRole,
  generateTokens,
  verifyToken,
  JWT_SECRET,
  JWT_EXPIRES_IN
};
