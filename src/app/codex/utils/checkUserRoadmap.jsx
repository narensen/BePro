'use client'

import { useEffect, useState } from 'react';
import { supabase } from './client';

const CheckUsername = ({ username }) => {
  const [userExists, setUserExists] = useState(null);

  useEffect(() => {
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
  }, [username]);
};
