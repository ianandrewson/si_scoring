import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Profile } from '@/types';
import { useProfiles } from '@/hooks/useProfiles';

const ACTIVE_PROFILE_KEY = '@si_scoring:active_profile_id';

interface AppContextType {
  activeProfile: Profile | null;
  hasCompletedSetup: boolean;
  viewAllProfiles: boolean;
  loading: boolean;
  createAndActivateProfile: (name: string) => Promise<Profile | null>;
  switchProfile: (profile: Profile) => Promise<void>;
  refreshProfiles: () => Promise<void>;
  setViewAllProfiles: (value: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { profiles, loading: profilesLoading, createProfile, getProfileById, updateLastUsed, fetchProfiles } = useProfiles();
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [viewAllProfiles, setViewAllProfiles] = useState(false);
  const [loading, setLoading] = useState(true);

  // Determine if setup has been completed (at least one profile exists)
  const hasCompletedSetup = profiles.length > 0;

  // Load the active profile on mount
  useEffect(() => {
    const loadActiveProfile = async () => {
      if (profilesLoading) {
        return;
      }

      try {
        // If no profiles exist, we're done loading
        if (profiles.length === 0) {
          setActiveProfile(null);
          setLoading(false);
          return;
        }

        // Try to load the saved active profile ID
        const savedProfileId = await AsyncStorage.getItem(ACTIVE_PROFILE_KEY);

        if (savedProfileId) {
          const profile = await getProfileById(parseInt(savedProfileId, 10));
          if (profile) {
            setActiveProfile(profile);
            await updateLastUsed(profile.id);
            setLoading(false);
            return;
          }
        }

        // If no saved profile or saved profile not found, use the most recently used profile
        if (profiles.length > 0) {
          const mostRecent = profiles[0]; // Already sorted by last_used_at DESC
          setActiveProfile(mostRecent);
          await updateLastUsed(mostRecent.id);
          await AsyncStorage.setItem(ACTIVE_PROFILE_KEY, mostRecent.id.toString());
        }
      } catch (error) {
        console.error('Error loading active profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadActiveProfile();
  }, [profiles, profilesLoading]);

  const createAndActivateProfile = async (name: string): Promise<Profile | null> => {
    try {
      const newProfile = await createProfile(name);
      if (newProfile) {
        setActiveProfile(newProfile);
        await updateLastUsed(newProfile.id);
        await AsyncStorage.setItem(ACTIVE_PROFILE_KEY, newProfile.id.toString());
        return newProfile;
      }
      return null;
    } catch (error) {
      console.error('Error creating and activating profile:', error);
      return null;
    }
  };

  const switchProfile = async (profile: Profile): Promise<void> => {
    try {
      setActiveProfile(profile);
      await updateLastUsed(profile.id);
      await AsyncStorage.setItem(ACTIVE_PROFILE_KEY, profile.id.toString());
    } catch (error) {
      console.error('Error switching profile:', error);
    }
  };

  const refreshProfiles = async (): Promise<void> => {
    try {
      await fetchProfiles();
      // Refresh the active profile data if one is selected
      if (activeProfile) {
        const updated = await getProfileById(activeProfile.id);
        if (updated) {
          setActiveProfile(updated);
        }
      }
    } catch (error) {
      console.error('Error refreshing profiles:', error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeProfile,
        hasCompletedSetup,
        viewAllProfiles,
        loading,
        createAndActivateProfile,
        switchProfile,
        refreshProfiles,
        setViewAllProfiles,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
