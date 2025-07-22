'use client'

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase_client';

export const checkUsername = ({ username, userExists, setUserExists }) => {

    const check = async () => {
      const { data, error } = await supabase
        .from('codex')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      if (error) {
        console.error('DB error:', error);
        setUserExists(false);
        return;
      }

      setUserExists(!!data);
    };

    check();
  }

