import * as SQLite from 'expo-sqlite';
import { initializeDatabase } from './schema';

let database: SQLite.SQLiteDatabase | null = null;

export const openDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (database) {
    return database;
  }

  database = await SQLite.openDatabaseAsync('spirit_island_scores.db');
  await initializeDatabase(database);

  return database;
};

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!database) {
    return await openDatabase();
  }
  return database;
};
