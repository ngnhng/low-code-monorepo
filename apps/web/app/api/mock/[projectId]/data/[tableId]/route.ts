import fs from 'node:fs/promises';
import path from 'node:path';

export async function GET() {
  const databasePath = path.join(
    process.cwd(),
    'app/api/mock/[projectId]/data/[tableId]/database.json',
  );
  try {
    const database = await fs.readFile(databasePath, 'utf8');
    return new Response(database, {
      headers: { 'content-type': 'application/json' },
    });
  } catch {
    return new Response(undefined, {
      status: 404,
    });
  }
}
