// Setup database schema via Supabase HTTP API
// This uses the PostgREST RPC endpoint which works over HTTPS (no IPv6 issue)

const SUPABASE_URL = "https://nunwgkhrjepxovnmvbjh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51bndna2hyamVweG92bm12YmpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MjIzNTUsImV4cCI6MjA5NzA5ODM1NX0.ErSlFSBEu4IN41SrFVSQL8lP7FJtM8zQsX5shWXMKoA";

// We'll create a temporary RPC function via the Supabase Management API,
// or use the pg_net extension. Let's try calling an SQL endpoint.

// First, let's check if we can create a helper function via REST
async function setupDatabase() {
  // Step 1: Create an RPC function that executes arbitrary SQL
  // This requires the service_role key, not the anon key
  // The anon key won't have permission to create tables
  
  console.log("⚠️  Cannot create database tables via the anon key.");
  console.log("");
  console.log("You need to run the schema SQL in the Supabase SQL Editor.");
  console.log("Here's how:");
  console.log("");
  console.log("1. Open: https://supabase.com/dashboard/project/nunwgkhrjepxovnmvbjh/sql/new");
  console.log("2. Copy and paste the SQL below");
  console.log("3. Click 'Run'");
  console.log("");
  console.log("Alternatively, you can provide your Supabase SERVICE ROLE key");
  console.log("(found in Project Settings → API → service_role key)");
  console.log("and I can set up the database programmatically.");
  
  // Try to see if tables already exist
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/User?select=id&limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    
    if (response.status === 200) {
      console.log("\n✅ 'User' table already exists! Tables may already be set up.");
      const data = await response.json();
      console.log(`   Found ${data.length} user(s) in the table.`);
    } else if (response.status === 404) {
      console.log("\n❌ 'User' table does NOT exist. You must run the schema SQL.");
    } else {
      const text = await response.text();
      console.log(`\n⚠️  Got status ${response.status}: ${text}`);
    }
  } catch (e) {
    console.log("\n❌ Error checking table existence:", e.message);
  }
}

setupDatabase();
