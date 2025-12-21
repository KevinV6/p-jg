const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

// Hash de contraseña
const hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

// Verificar contraseña
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Respuesta estandarizada exitosa
const successResponse = (res, data, message = 'Operación exitosa', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

// Respuesta estandarizada de error
const errorResponse = (res, message = 'Error en la operación', statusCode = 400, details = null) => {
  const response = {
    success: false,
    error: message
  };
  
  if (details) {
    response.details = details;
  }
  
  return res.status(statusCode).json(response);
};

// Paginación
const paginate = (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  return {
    offset,
    limit: Math.min(limit, 100) // Máximo 100 registros
  };
};

// Construir respuesta paginada
const paginatedResponse = (res, data, total, page, limit, message = 'Datos obtenidos') => {
  const totalPages = Math.ceil(total / limit);
  
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
};

// Validar campos requeridos
const validateRequired = (data, requiredFields) => {
  const missing = [];
  
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missing.push(field);
    }
  }
  
  if (missing.length > 0) {
    return {
      valid: false,
      missing
    };
  }
  
  return { valid: true };
};

// Sanitizar objeto (eliminar campos undefined/null)
const sanitizeObject = (obj) => {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

// Formatear fecha para respuesta
const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toISOString();
};

// Generar código aleatorio
const generateCode = (length = 6) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

module.exports = {
  hashPassword,
  comparePassword,
  successResponse,
  errorResponse,
  paginate,
  paginatedResponse,
  validateRequired,
  sanitizeObject,
  formatDate,
  generateCode
};
