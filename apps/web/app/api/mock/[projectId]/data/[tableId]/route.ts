import fs from 'fs/promises';
import path from 'path';
import { faker } from '@faker-js/faker';
import { type NextRequest } from 'next/server';

const columns = [
  {
    id: 'id',
    label: 'ID',
    type: 'number',
    isActive: true,
    isPrimaryKey: 'true',
    isForeignKey: 'false',
    foreignKeyId: '',
  },
  {
    id: 'name',
    label: 'Name',
    type: 'text',
    isActive: true,
    isPrimaryKey: 'false',
    isForeignKey: 'false',
    foreignKeyId: '',
  },
  {
    id: 'username',
    label: 'Username',
    type: 'text',
    isActive: true,
    isPrimaryKey: 'false',
    isForeignKey: 'false',
    foreignKeyId: '',
  },
  {
    id: 'phone',
    label: 'Phone',
    type: 'text',
    isActive: true,
    isPrimaryKey: 'false',
    isForeignKey: 'false',
    foreignKeyId: '',
  },
  {
    id: 'website',
    label: 'Website',
    type: 'text',
    isActive: true,
    isPrimaryKey: 'false',
    isForeignKey: 'false',
    foreignKeyId: '',
  },
];

function createRandomUser() {
  return {
    name: faker.person.fullName(),
    username: faker.person.lastName(),
    phone: faker.phone.number(),
    website: faker.internet.domainName(),
  };
}

function generateMockData(size: number): any[] {
  const data: any = [];
  for (let i = 1; i < size; i++) {
    data.push({
      id: i,
      ...createRandomUser(),
    });
  }

  return data;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get('page') || 0;
  const limit = searchParams.get('limit') || 10;

  if (Number.isNaN(Number(page)) || Number.isNaN(Number(limit))) {
    return new Response(undefined, {
      status: 400,
    });
  }

  const data = generateMockData(100);
  const response = {
    data: {
      columns,
      rows: data.slice(Number(page) * Number(limit), Number(limit)),
	  maxIndex: data.length,
    },
    meta: {
      page,
      pageSize: limit,
      totalPage: 10,
    },
  };
  return new Response(JSON.stringify(response), {
    headers: { 'content-type': 'application/json' },
  });
}

export async function POST(request: Request) {
  const databasePath = path.join(
    process.cwd(),
    'app/api/mock/[projectId]/data/[tableId]/database.json',
  );
  try {
    const database = await fs.readFile(databasePath, 'utf-8');
    return new Response(database, {
      headers: { 'content-type': 'application/json' },
    });
  } catch (err) {
    return new Response(undefined, {
      status: 404,
    });
  }
}
