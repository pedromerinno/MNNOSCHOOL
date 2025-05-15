
import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/user';
import { toast } from 'sonner';
import { useCache } from '@/hooks/useCache';

export const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fetchInProgress = useRef(false);
  const lastFetchTimestamp = useRef(0);
  const { getCache, setCache, clearCache } = useCache();
  
  // Reduced cache duration to 2 minutes to minimize stale data
  const CACHE_DURATION = 2 * 60 * 1000;
  const CACHE_KEY = 'user_profile';

  const fetchUserProfile = useCallback(async (userId: string) => {
    // Avoid duplicate simultaneous calls
    if (fetchInProgress.current) {
      console.log('A profile fetch is already in progress, avoiding duplicate call');
      return;
    }

    // Check cache timestamp to avoid frequent calls
    const now = Date.now();
    if (now - lastFetchTimestamp.current < CACHE_DURATION && userProfile) {
      console.log('Using cached user profile, less than 2 minutes since last fetch');
      return;
    }

    try {
      console.log(`Fetching user profile: ${userId}`);
      fetchInProgress.current = true;
      setIsLoading(true);
      
      // Optimized to use recently added RLS policy
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        if (error.code === 'PGRST116') {
          console.log('No profile found for user, might be first login');
        }
        return;
      }

      if (data) {
        const profile: UserProfile = {
          id: data.id,
          email: data.email,
          display_name: data.display_name,
          is_admin: data.is_admin,
          super_admin: data.super_admin,
          avatar: data.avatar,
          cargo_id: data.cargo_id,
          interesses: data.interesses,
          primeiro_login: data.primeiro_login,
          created_at: data.created_at
        };
        
        console.log('User profile loaded:', profile);
        setUserProfile(profile);
        lastFetchTimestamp.current = now;
        
        // Using our optimized caching utility
        setCache({ key: CACHE_KEY, expirationMinutes: 2 }, profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      fetchInProgress.current = false;
      setIsLoading(false);
    }
  }, [userProfile, setCache]);

  // Try to load profile from cache on initial load
  useEffect(() => {
    const cachedProfile = getCache<UserProfile>({ key: CACHE_KEY });
    if (cachedProfile) {
      console.log('Loading user profile from local cache');
      setUserProfile(cachedProfile);
    }
  }, [getCache]);

  // Clear profile if userId changes
  const clearProfile = useCallback(() => {
    setUserProfile(null);
    lastFetchTimestamp.current = 0;
    clearCache({ key: CACHE_KEY });
  }, [clearCache]);

  // Modified to return void consistently
  const updateUserProfile = useCallback((userData: Partial<UserProfile>) => {
    setUserProfile(prev => prev ? ({
      ...prev,
      ...userData,
    }) : null);
  }, []);

  const updateUserData = async (userId: string, userData: Partial<UserProfile>) => {
    if (!userId) {
      toast.error('No logged in user');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(userData)
        .eq('id', userId);

      if (error) {
        console.error('Error updating user data:', error);
        toast.error('Error updating data: ' + error.message);
        return;
      }

      // Update local state
      setUserProfile(prevProfile => prevProfile ? ({
        ...prevProfile,
        ...userData,
      }) : null);
      
      // Update cache using our optimized utility
      const cachedProfile = getCache<UserProfile>({ key: CACHE_KEY });
      if (cachedProfile) {
        setCache({ key: CACHE_KEY, expirationMinutes: 2 }, {
          ...cachedProfile,
          ...userData
        });
      }
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating user data:', error);
      toast.error('Error updating data: ' + error.message);
    }
  };

  return {
    userProfile,
    isLoading,
    fetchUserProfile,
    clearProfile,
    updateUserProfile,
    updateUserData,
    setUserProfile
  };
};
