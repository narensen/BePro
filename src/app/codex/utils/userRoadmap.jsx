'use client'

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase_client';
export const checkUsername = async (username) => {
  const { data, error } = await supabase
    .from('codex')
    .select('username')
    .eq('username', username)
    .maybeSingle();

  if (error) {
    console.log('DB error:', error);
    return false;
  }

  return !!data;
};
export const loadMissions = async (username) => {
  const { data, error } = await supabase
    .from('codex')
    .select('roadmap')
    .eq('username', username)
    .maybeSingle();

  if (error || !data) {
    console.log('DB error:', error);
    return null;
  }

  console.log(data.roadmap);
  return data.roadmap;
};

