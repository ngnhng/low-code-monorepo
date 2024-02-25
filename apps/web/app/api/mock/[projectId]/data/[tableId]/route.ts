import fs from 'fs';
import fsa from 'fs/promises';
import path from 'path';
import { faker } from '@faker-js/faker';
import { NextRequest } from 'next/server';
import { ColumnDef, TableItem } from 'types/table-data';
import { NextResponse } from 'next/server';

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

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string; tableId: string } },
) {
  // const databasePath = path.join(
  //   process.cwd(),
  //   `app/api/mock/[projectId]/data/[tableId]/example.json`,
  // );

  // try {
  //   const data = await fsa.readFile(databasePath, 'utf-8')

  //   console.log("data: " + JSON.stringify(data));
  // } catch (error) {
  //   console.log(error);
  //   return new NextResponse("", { status: 500 });
  // }
  // --------------------------------- CURRENT VERSIONS --------------------------------
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get('page') || 0;
  const limit = searchParams.get('limit') || 10;

  if (Number.isNaN(Number(page)) || Number.isNaN(Number(limit))) {
    return new Response(undefined, {
      status: 400,
    });
  }

  let data: any = generateMockData(100);
  let cols: any = columns;

  if (params.tableId === '0') {
    data = generateMockData(100);
    cols = columns;
  }

  if (params.tableId === '1') {
    data = generateMockAddresses(100);
    cols = addresses;
  }

  if (params.tableId === '2') {
    data = generateMockPosts(100);
    cols = posts;
  }

  const response = {
    data: {
      columns: cols,
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

const translateData = (data) => {
  const columns = data.requiredFields.map((item) => {
    return {
      id: item.id,
      label: item.id,
      type: item.type,
      isActive: true,
      isPrimaryKey: false,
      isForeignKey: false,
      foreignKeyId: '',
    };
  });

  return {
    id: data.tablename as string,
    name: data.tablename as string,
    source: 'Source 1',
    created: '2021-08-01',
    updated: '2021-08-01',
    status: 'Active',
    columns: columns,
    foreignKey: '',
  };
};

export async function POST(
  request: Request,
  { params }: { params: { projectId: string; tableId: string } },
) {
  const databasePath = path.join(
    process.cwd(),
    `app/api/mock/[projectId]/data/all/${params.projectId}.json`,
  );

  console.error(databasePath);

  const { data } = await request.json();
  const realData = translateData(data);
  // const arrayData = [realData]

  try {
    const initData = await fsa.readFile(databasePath, 'utf-8');

    const initObject = JSON.parse(initData);

    initObject.push(realData);

    const dataToWrite = JSON.stringify(initObject);

    fs.writeFile(databasePath, dataToWrite, (err) => {
      if (err) {
        console.log('Error writing file:', err);
      } else {
        console.log('Successfully wrote file');
      }
    });

    return NextResponse.json(dataToWrite, { status: 200 });
  } catch (error) {
    console.log(error);
    return new NextResponse('', { status: 500 });
  }

  console.log('DATA POSTED', realData);

  // try {
  //   const dataToWrite = JSON.stringify(initObject);

  //   fs.writeFile(databasePath, dataToWrite, (err) => {
  //     if (err) {
  //         console.log('Error writing file:', err);
  //     } else {
  //         console.log('Successfully wrote file');
  //     }
  //   });

  //   return NextResponse.json(dataToWrite);
  // } catch (err) {
  //   return new NextResponse("Error in posting data!", {
  //     status: 500,
  //   });
  // }
}

export async function PUT(
  request: Request,
  { params }: { params: { projectId: string; tableId: string } },
) {
  const databasePath = path.join(
    process.cwd(),
    `app/api/mock/[projectId]/data/[tableId]/${params.projectId}-${params.tableId}.json`,
  );

  console.error(databasePath);

  const { data } = await request.json();

  console.log('DATA POSTED', data);

  try {
    const dataToWrite = JSON.stringify(data);

    fs.writeFile(databasePath, dataToWrite, (err) => {
      if (err) {
        console.log('Error writing file:', err);
      } else {
        console.log('Successfully wrote file');
      }
    });

    return NextResponse.json(dataToWrite);
  } catch (err) {
    return new NextResponse('Something went wrong!', {
      status: 500,
    });
  }
}
