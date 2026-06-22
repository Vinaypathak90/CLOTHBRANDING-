const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
// Using the administrative service role key to manage full CMS capabilities securely from the server
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[CRITICAL FAILURE]: Supabase environmental credentials are completely absent.');
  process.exit(1);
}

// Initializing the master connection matrix
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false // Prevents memory leaks inside Node server environments
  }
});

const connectDB = async () => {
  try {
    // Perform a lightweight health check query on our configuration table to ensure handshake integrity
    const { data, error } = await supabase.from('site_config').select('config_key').limit(1);
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is simply "no rows found", which is clean
      throw error;
    }
    console.log('[DATABASE COMPONENT ACTIVE]: Connected to Supabase PostgreSQL instance successfully.');
  } catch (error) {
    console.error(`[DATABASE CRITICAL ERROR]: Handshake validation failure: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { supabase, connectDB };
