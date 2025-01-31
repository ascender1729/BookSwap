// src/store/authStore.ts
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types/database';

interface AuthState {
  user: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initial state
  user: null,
  loading: true,

  // Sign in functionality
  signIn: async (email, password) => {
    // Attempt authentication with Supabase
    const { error, data } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    
    if (error) throw error;
    
    // If authentication successful, immediately fetch user profile
    if (data.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (profileError) throw profileError;
      
      // Update state with user profile
      set({ user: profile, loading: false });
    }
  },

  // Sign up functionality
  signUp: async (email, password, username) => {
    // Create new auth user
    const { error: signUpError, data } = await supabase.auth.signUp({ 
      email, 
      password 
    });
    
    if (signUpError) throw signUpError;

    if (data.user) {
      // Create associated profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ id: data.user.id, username }]);
      
      if (profileError) throw profileError;
      
      // Fetch and set the newly created profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      // Update state with new profile
      set({ user: profile, loading: false });
    }
  },

  // Sign out functionality
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    // Clear user state after successful sign out
    set({ user: null, loading: false });
  },

  // Fetch current user data
  fetchUser: async () => {
    try {
      // Check for existing session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // If session exists, fetch associated profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;
        
        set({ user: profile, loading: false });
      } else {
        set({ user: null, loading: false });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      set({ user: null, loading: false });
    }
  },
}));