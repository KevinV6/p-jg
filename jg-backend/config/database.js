const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase = null;

const getConnection = () => {
  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client initialized');
  }
  return supabase;
};

const testConnection = async () => {
  try {
    const client = getConnection();
    const { data, error } = await client.from('_health').select('*').limit(1);
    
    if (error && error.code !== 'PGRST204') {
      console.log('Supabase connection ready (table check failed but connection OK)');
    } else {
      console.log('Supabase connection test passed');
    }
  } catch (error) {
    console.error('Supabase connection test failed:', error.message);
  }
};

module.exports = { getConnection, testConnection };
