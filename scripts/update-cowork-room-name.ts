#!/usr/bin/env node
/**
 * Update arcade room name: E.Arcade Lobby → "Web4City Agency"
 * Run this script to rename the lobby room in the COWORK page
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateLastRoom() {
  console.log('🔍 Fetching arcade rooms...');
  
  const { data: rooms, error } = await supabase
    .from('arcade_rooms')
    .select('id, slug, name, is_featured')
    .eq('slug', 'lobby');  // Target: E.Arcade Lobby

  if (error) {
    console.error('❌ Error fetching rooms:', error.message);
    process.exit(1);
  }

  if (!rooms || rooms.length === 0) {
    console.error('❌ No room found with slug "lobby"');
    process.exit(1);
  }

  const room = rooms[0];
  console.log(`📋 Found room: ${room.name} (${room.slug})`);
  console.log(`\n✏️  Updating: "${room.name}" → "Web4City Agency"`);

  const { error: updateError } = await supabase
    .from('arcade_rooms')
    .update({ 
      name: 'Web4City Agency',
      description: 'Official Web4City agency room',
      updated_at: new Date().toISOString()
    })
    .eq('id', room.id);

  if (updateError) {
    console.error('❌ Error updating room:', updateError.message);
    process.exit(1);
  }

  console.log('✅ Successfully updated room name!');
  console.log('🌐 Visit https://web4city.xyz/arcade to see the change');
}

updateLastRoom();
