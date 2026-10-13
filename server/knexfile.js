import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const config = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: process.env.DATABASE_URL || path.resolve(__dirname, 'data/codeflow.sqlite3')
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.resolve(__dirname, 'src/db/migrations')
    },
    seeds: {
      directory: path.resolve(__dirname, 'src/db/seeds')
    }
  },

  test: {
    client: 'sqlite3',
    connection: {
      filename: process.env.DATABASE_URL || path.resolve(__dirname, 'data/codeflow.sqlite3')
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.resolve(__dirname, 'src/db/migrations')
    },
    seeds: {
      directory: path.resolve(__dirname, 'src/db/seeds')
    }
  },

  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    } : {
      filename: path.resolve(__dirname, 'data/codeflow.sqlite3')
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.resolve(__dirname, 'src/db/migrations')
    },
    seeds: {
      directory: path.resolve(__dirname, 'src/db/seeds')
    }
  }
};

export default config;
