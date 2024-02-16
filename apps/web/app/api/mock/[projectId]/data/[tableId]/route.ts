import fs from 'fs/promises';
import path from 'path';
import { faker } from '@faker-js/faker';
import { type NextRequest } from 'next/server';
import { ColumnDef } from 'types/table-data';

// * User Column
export const columns: ColumnDef[] = [
  {
    id: 'id',
    label: 'ID',
    type: 'number',
    isActive: true,
    isPrimaryKey: true,
    isForeignKey: false,
    foreignKeyId: '',
  },
  {
    id: 'name',
    label: 'Name',
    type: 'text',
    isActive: true,
    isPrimaryKey: false,
    isForeignKey: false,
    foreignKeyId: '',
  },
  {
    id: 'username',
    label: 'Username',
    type: 'text',
    isActive: true,
    isPrimaryKey: false,
    isForeignKey: false,
    foreignKeyId: '',
  },
  {
    id: 'phone',
    label: 'Phone',
    type: 'text',
    isActive: true,
    isPrimaryKey: false,
    isForeignKey: false,
    foreignKeyId: '',
  },
  {
    id: 'website',
    label: 'Website',
    type: 'text',
    isActive: true,
    isPrimaryKey: false,
    isForeignKey: false,
    foreignKeyId: '',
  },
];

export const addresses: ColumnDef[] = [
  {
    id: 'id',
    label: 'ID',
    type: 'number',
    isActive: true,
    isPrimaryKey: true,
    isForeignKey: false,
    foreignKeyId: '',
  },
  {
    id: 'city',
    label: 'City',
    type: 'text',
    isActive: true,
    isPrimaryKey: false,
    isForeignKey: true,
    foreignKeyId: '',
  },
  {
    id: 'country',
    label: 'Country',
    type: 'text',
    isActive: true,
    isPrimaryKey: false,
    isForeignKey: false,
    foreignKeyId: '',
  },
  {
    id: 'userID',
    label: 'User',
    type: 'number',
    isActive: true,
    isPrimaryKey: false,
    isForeignKey: true,
    foreignKeyId: 'id',
  },
];

export const posts: ColumnDef[] = [
  {
    id: 'id',
    label: 'ID',
    type: 'number',
    isActive: true,
    isPrimaryKey: true,
    isForeignKey: false,
    foreignKeyId: '',
  },
  {
    id: 'title',
    label: 'Title',
    type: 'text',
    isActive: true,
    isPrimaryKey: false,
    isForeignKey: false,
    foreignKeyId: '',
  },
];

export function createRandomAddresses() {
  return {
    city: faker.location.city(),
    country: faker.location.country(),
  };
}

export function createRandomPosts() {
  return {
    title: faker.lorem.sentence(),
  };
}

export function createRandomUser() {
  return {
    name: faker.person.fullName(),
    username: faker.person.lastName(),
    phone: faker.phone.number(),
    website: faker.internet.domainName(),
  };
}

export function generateMockAddresses(size: number) {
  const data: any = [];
  for (let i = 1; i < size; i++) {
    data.push({
      id: i,
      ...createRandomAddresses(),
    });
  }

  return data;
}

export function generateMockPosts(size: number) {
  const data: any = [];
  for (let i = 1; i < size; i++) {
    data.push({
      id: i,
      ...createRandomPosts(),
    });
  }

  return data;
}

export function generateMockData(size: number): any[] {
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
