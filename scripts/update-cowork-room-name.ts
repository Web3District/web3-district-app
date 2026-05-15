#!/usr/bin/env node
/**
 * Update arcade room name: Last room → "Web4City Agency"
 * Run this script to rename the last featured room in the COWORK page
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
    .eq('is_featured', true)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ Error fetching rooms:', error.message);
    process.exit(1);
  }

  if (!rooms || rooms.length === 0) {
    console.error('❌ No featured rooms found');
    process.exit(1);
  }

  console.log(`📋 Found ${rooms.length} featured rooms:`);
  rooms.forEach((room, i) => {
    console.log(`   ${i + 1}. ${room.name} (${room.slug})`);
  });

  const lastRoom = rooms[rooms.length - 1];
  console.log(`\n✏️  Updating last room: "${lastRoom.name}" → "Web4City Agency"`);

  const { error: updateError } = await supabase
    .from('arcade_rooms')
    .update({ 
      name: 'Web4City Agency',
      description: 'Official Web4City agency room',
      updated_at: new Date().toISOString()
    })
    .eq('id', lastRoom.id);

  if (updateError) {
    console.error('❌ Error updating room:', updateError.message);
    process.exit(1);
  }

  console.log('✅ Successfully updated room name!');
  console.log('🌐 Visit https://web4city.xyz/arcade to see the change');
}

updateLastRoom();
