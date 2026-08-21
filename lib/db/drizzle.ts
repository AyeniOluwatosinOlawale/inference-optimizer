import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

const POSTGRES_URL = process.env.POSTGRES_URL || 'postgresql://placeholder:placeholder@localhost:5432/placeholder';

export const client = postgres(POSTGRES_URL, { max: 1 });
export const db = drizzle(client, { schema });
