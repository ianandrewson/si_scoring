import { useState, useEffect } from 'react';
import { getDatabase } from '@/lib/database/connection';
import { Profile } from '@/types';

export const useProfiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = async () => {
    try {
      const db = await getDatabase();
      const result = await db.getAllAsync<{
        id: number;
        name: string;
        created_at: string;
        last_used_at: string;
      }>('SELECT * FROM profiles ORDER BY last_used_at DESC');

      const mappedProfiles: Profile[] = result.map((row) => ({
        id: row.id,
        name: row.name,
        createdAt: row.created_at,
        lastUsedAt: row.last_used_at,
      }));

      setProfiles(mappedProfiles);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (name: string): Promise<Profile | null> => {
    try {
      const db = await getDatabase();
      const result = await db.runAsync(
        'INSERT INTO profiles (name) VALUES (?)',
        [name]
      );

      const newProfile = await db.getFirstAsync<{
        id: number;
        name: string;
        created_at: string;
        last_used_at: string;
      }>('SELECT * FROM profiles WHERE id = ?', [result.lastInsertRowId]);

      if (newProfile) {
        const profile: Profile = {
          id: newProfile.id,
          name: newProfile.name,
          createdAt: newProfile.created_at,
          lastUsedAt: newProfile.last_used_at,
        };
        await fetchProfiles();
        return profile;
      }
      return null;
    } catch (error) {
      console.error('Error creating profile:', error);
      return null;
    }
  };

  const getProfileById = async (id: number): Promise<Profile | null> => {
    try {
      const db = await getDatabase();
      const result = await db.getFirstAsync<{
        id: number;
        name: string;
        created_at: string;
        last_used_at: string;
      }>('SELECT * FROM profiles WHERE id = ?', [id]);

      if (result) {
        return {
          id: result.id,
          name: result.name,
          createdAt: result.created_at,
          lastUsedAt: result.last_used_at,
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  };

  const updateLastUsed = async (id: number): Promise<void> => {
    try {
      const db = await getDatabase();
      await db.runAsync(
        "UPDATE profiles SET last_used_at = datetime('now') WHERE id = ?",
        [id]
      );
      await fetchProfiles();
    } catch (error) {
      console.error('Error updating last used:', error);
    }
  };

  const deleteProfile = async (id: number): Promise<void> => {
    try {
      const db = await getDatabase();
      await db.runAsync('DELETE FROM profiles WHERE id = ?', [id]);
      await fetchProfiles();
    } catch (error) {
      console.error('Error deleting profile:', error);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  return {
    profiles,
    loading,
    fetchProfiles,
    createProfile,
    getProfileById,
    updateLastUsed,
    deleteProfile,
  };
};
