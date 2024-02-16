//Mock endpoint for database
// Spec:

// GET /api/mock/{projectId}/data/all: Get all data for a project

import { faker } from '@faker-js/faker';
import { type NextRequest } from 'next/server';
import { 
   columns, 
   addresses, 
   posts,
} from '../[tableId]/route';

import { TableItem } from 'types/table-data';

const TABLES: TableItem[] = [
   {
      id: '1',
      name: 'Table 1',
      source: 'Source 1',
      created: '2021-08-01',
      updated: '2021-08-01',
      status: 'Active',
      columns: columns,
    },
    {
      id: '2',
      name: 'Table 2',
      source: 'Source 2',
      created: '2021-08-01',
      updated: '2021-08-01',
      status: 'Active',
      columns: posts,
    },
    {
      id: '3',
      name: 'Table 3',
      source: 'Source 3',
      created: '2021-08-01',
      updated: '2021-08-01',
      status: 'Active',
      columns: addresses,
    },
];

export async function GET(request: Request) {
   const url = new URL(request.url);
   const projectId = url.pathname.split("/")[3];

   const tables = TABLES;

   return new Response(JSON.stringify(tables), {
      headers: { "content-type": "application/json" },
   });
}
