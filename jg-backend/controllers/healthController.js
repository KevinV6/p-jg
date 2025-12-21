const { getAdminConnection } = require('../config/database');

// Health check endpoint
const healthCheck = async (req, res) => {
  try {
    console.log('[Health] Health check solicitado');
    
    // Verificar conexión a Supabase
    const supabase = getAdminConnection();
    const { error } = await supabase.from('usuario').select('count').limit(1);
    
    if (error) {
      console.error('[Health] Error en health check:', error.message);
      return res.status(503).json({
        success: false,
        error: 'Database connection error',
        timestamp: new Date().toISOString()
      });
    }
    
    console.log('[Health] Sistema operativo ✓');
    res.json({
      success: true,
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    console.error('[Health] Error crítico en health check:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  healthCheck
};
