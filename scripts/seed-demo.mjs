/**
 * Demo Profile Seed Script (REST API version)
 * Uses Supabase JS client (PostgREST) — no direct DB connection required.
 * Usage: node scripts/seed-demo.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL     = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEMO_EMAIL       = 'demo@scholarx.app';
const DEMO_PASSWORD    = 'Demo@1234';
const DEMO_NAME        = 'Alex Demo';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const now = new Date().toISOString();

async function upsert(table, data, conflictOn) {
  const { error } = await supabase.from(table).upsert(data, { onConflict: conflictOn });
  if (error) throw new Error(`[${table}] ${error.message} | code: ${error.code}`);
  console.log(`  ✅ ${table}`);
}

async function main() {
  console.log('\n🌱  Seeding demo profile...\n');

  // ── 1. Auth user ─────────────────────────────────────────────────────────
  console.log('Step 1: Auth user');
  const { data: listData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const existing = listData?.users?.find(u => u.email === DEMO_EMAIL);

  let userId;
  if (existing) {
    userId = existing.id;
    await supabase.auth.admin.updateUserById(userId, { password: DEMO_PASSWORD });
    console.log(`  ✅ Already exists (${userId}) — password reset`);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { first_name: 'Alex', last_name: 'Demo' }
    });
    if (error) throw new Error('Auth create failed: ' + error.message);
    userId = data.user.id;
    console.log(`  ✅ Created (${userId})`);
  }

  // ── 2. Clean up existing DB profile ──────────────────────────────────────
  console.log('\nStep 2: Cleanup old profile data');
  await supabase.from('CareerGoal').delete().eq('userId', userId);
  await supabase.from('CountryPreference').delete().eq('userId', userId);
  await supabase.from('Interest').delete().eq('userId', userId);
  await supabase.from('TestScores').delete().eq('userId', userId);
  await supabase.from('StudentProfile').delete().eq('userId', userId);
  await supabase.from('User').delete().eq('id', userId);
  console.log('  ✅ Old records removed');

  // ── 3. Insert DB records ──────────────────────────────────────────────────
  console.log('\nStep 3: Database records');

  await upsert('User', {
    id: userId,
    name: DEMO_NAME,
    role: 'STUDENT',
    growthStage: 'SEED',
    growthPercent: 0,
    createdAt: now,
    updatedAt: now,
  }, 'id');

  await upsert('StudentProfile', {
    id: randomUUID(),
    userId,
    educationLevel: 'HSC',
    hscGpa: 4.89,
    institutionName: 'Dhaka Residential Model College',
    country: 'Bangladesh',
    district: 'Dhaka',
    city: 'Dhaka',
    familyIncome: 'Medium',
    extracurricularScore: 0,
    createdAt: now,
    updatedAt: now,
  }, 'userId');

  await upsert('TestScores', {
    id: randomUUID(),
    userId,
    ielts: 7.0,
    toefl: 100,
    duolingo: 120,
    sat: 1350,
  }, 'userId');

  const { error: intErr } = await supabase.from('Interest').insert([
    { id: randomUUID(), userId, field: 'Computer Science' },
    { id: randomUUID(), userId, field: 'Artificial Intelligence' },
    { id: randomUUID(), userId, field: 'Data Science' },
  ]);
  if (intErr) throw new Error(`[Interest] ${intErr.message}`);
  console.log('  ✅ Interest');

  const { error: cpErr } = await supabase.from('CountryPreference').insert([
    { id: randomUUID(), userId, country: 'USA' },
    { id: randomUUID(), userId, country: 'Canada' },
    { id: randomUUID(), userId, country: 'Germany' },
  ]);
  if (cpErr) throw new Error(`[CountryPreference] ${cpErr.message}`);
  console.log('  ✅ CountryPreference');

  await upsert('CareerGoal', {
    id: randomUUID(),
    userId,
    desiredDegree: "Bachelor's",
    longTermGoal: 'Become an AI researcher and contribute to open-source technology.',
  }, 'userId');

  // ── Done ──────────────────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(50));
  console.log('✅  Demo profile ready!\n');
  console.log('  Email    : ' + DEMO_EMAIL);
  console.log('  Password : ' + DEMO_PASSWORD);
  console.log('  User ID  : ' + userId);
  console.log('='.repeat(50) + '\n');
}

main().catch(e => {
  console.error('\n❌  Seed failed:', e.message);
  process.exit(1);
});
