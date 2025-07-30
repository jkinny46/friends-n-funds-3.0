'use client';

import { useEffect, useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { supabase } from './supabase';

export function useAuth() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isConnected && address) {
      authenticateUser();
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [isConnected, address]);

  const authenticateUser = async () => {
    try {
      setLoading(true);
      
      // Check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', address.toLowerCase())
        .single();

      if (existingUser) {
        setUser(existingUser);
      } else {
        // Create new user
        const { data: newUser, error } = await supabase
          .from('users')
          .insert([
            {
              wallet_address: address.toLowerCase(),
              username: `Player${address.slice(-4)}`,
            }
          ])
          .select()
          .single();

        if (error) throw error;
        setUser(newUser);
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, refetchUser: authenticateUser };
}
