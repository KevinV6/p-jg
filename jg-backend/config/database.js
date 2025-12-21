const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

let supabase = null;
let supabaseAdmin = null;

// Cliente normal (respeta RLS)
const getConnection = () => {
  if (!supabase) {
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials in environment variables');
    }
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: false
      }
    });
    console.log('Supabase client initialized');
  }
  return supabase;
};

// Cliente admin (bypass RLS) - para operaciones del servidor
const getAdminConnection = () => {
  if (!supabaseAdmin) {
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase service key in environment variables');
    }
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    console.log('Supabase admin client initialized');
  }
  return supabaseAdmin;
};

const testConnection = async () => {
  try {
    const client = getAdminConnection();
    const { data, error } = await client.from('usuario').select('count').limit(1);
    
    if (error) {
      console.log('Supabase connection warning:', error.message);
    } else {
      console.log('✓ Supabase connection successful');
    }
    return true;
  } catch (error) {
    console.error('✗ Supabase connection failed:', error.message);
    return false;
  }
};

module.exports = { 
  getConnection, 
  getAdminConnection, 
  testConnection,
  supabaseUrl 
};
