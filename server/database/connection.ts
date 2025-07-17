import { Kysely, SqliteDialect } from 'kysely';
import Database from 'better-sqlite3';
import { DatabaseSchema } from './schema.js';
import path from 'path';

const dataDir = process.env.DATA_DIRECTORY || './data';
const dbPath = path.join(dataDir, 'database.sqlite');

console.log('Connecting to database at:', dbPath);

const sqliteDb = new Database(dbPath);

export const db = new Kysely<DatabaseSchema>({
  dialect: new SqliteDialect({
    database: sqliteDb,
  }),
  log: ['query', 'error']
});
