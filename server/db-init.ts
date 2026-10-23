/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SQLiteDatabase } from './db.js';
import { getDatabasePath } from './config.js';

/**
 * Clean database initialization utility.
 * Creates the required schema, indices, and tables without inserting any mock/private data.
 */
function initDb(): void {
  const dbPath = getDatabasePath();
  console.log(`[RuralRise DB Init] Initializing clean database at: ${dbPath}`);
  
  const db = new SQLiteDatabase(dbPath);
  const health = db.healthCheck();
  
  if (health.healthy) {
    console.log('[RuralRise DB Init] Database initialized successfully.');
    console.log(`[RuralRise DB Init] Tables confirmed: ${health.tables.join(', ')}`);
    console.log(`[RuralRise DB Init] Total user records: ${health.userCount} (clean installation)`);
  } else {
    console.error('[RuralRise DB Init] Database initialization failed:', health.error);
    process.exit(1);
  }
  
  db.close();
}

initDb();
