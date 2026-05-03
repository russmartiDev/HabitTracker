// Standalone migration runner. Usage: npm run migrate
import { getDb, closeDb } from '@/lib/db';

const db = getDb();
const count = (db.prepare('SELECT COUNT(*) AS n FROM _migrations').get() as { n: number }).n;
console.log(`[migrate] migrations applied: ${count}`);
closeDb();
