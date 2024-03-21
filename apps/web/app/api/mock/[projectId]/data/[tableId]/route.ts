/* eslint-disable no-unused-vars */
import fs from 'node:fs';
import fsa from 'node:fs/promises';
import path from 'node:path';
import { faker } from '@faker-js/faker';
import { NextRequest } from 'next/server';
import { ColumnDef, TableItem } from 'types/table-data';
import { NextResponse } from 'next/server';
// import * as _ from 'lodash';

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

// NEW GET WHEN POST PUT GO TRUE
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string; tableId: string } },
) {
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get('page') || 0;
  const limit = searchParams.get('limit') || 10;

  const tablePath = path.join(
    process.cwd(),
    `app/api/mock/[projectId]/data/[tableId]/${params.projectId}-${params.tableId}.json`,
  );

  // tablePath available
  try {
    const table = await JSON.parse(await fsa.readFile(tablePath, 'utf8'));

    const response = {
      data: {
        columns: table.columns,
        rows:
          table.rows.length > 30
            ? table.rows.slice(Number(page) * Number(limit), Number(limit))
            : table.rows,
        maxIndex: table.rows.length,
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
  } catch {
    return new NextResponse('Error fetching table ...', { status: 500 });
  }
}

export const translateData = (data): TableItem => {
  const tableId = data.tablename.replaceAll(/\s/g, '').toLowerCase();
  const referenceTables: string[] = [];
  const columns = data.requiredFields.map((item) => {
    const isForeignKey = item.referenceTable !== '';
    const foreignKeyId = item.referenceTable
      ? `${tableId}-${item.referenceTable}`
      : '';

    if (item.referenceTable) {
      referenceTables.push(item.referenceTable as string);

      return {
        id: item.id.replaceAll(/\s/g, '').toLowerCase(),
        label: item.id,
        type: item.type,
        isActive: true,
        isPrimaryKey: false,
        isForeignKey: isForeignKey,
        foreignKeyId: foreignKeyId,
        referenceTable: item.referenceTable,
      };
    }

    return {
      id: item.id.replaceAll(/\s/g, '').toLowerCase(),
      label: item.id,
      type: item.type,
      isActive: true,
      isPrimaryKey: false,
      isForeignKey: isForeignKey,
      foreignKeyId: foreignKeyId,
    };
  });

  return {
    id: tableId as string,
    name: data.tablename as string,
    source: 'Source 1',
    created: '2021-08-01',
    updated: '2021-08-01',
    status: 'Active',
    columns: columns,
    referenceTables: referenceTables,
  };
};

// OLD POST

// TEST TO REPLACE OLD POST
export async function POST(
  request: Request,
  { params }: { params: { projectId: string; tableId: string } },
) {
  const databasePath = path.join(
    process.cwd(),
    `app/api/mock/[projectId]/data/all/${params.projectId}.json`,
  );

  const { data } = await request.json();
  const translateDataToTable = translateData(data);

  console.log('[TRANSLATE_DATA]:', translateDataToTable);
  const database = JSON.parse(await fsa.readFile(databasePath, 'utf8'));

  // TODO: MOCK CHECK SAME TABLE ID

  // ADD COLUMNS INTO REFTABLE
  for (const column of data.requiredFields) {
    if (column.referenceTable) {
      const refPath = path.join(
        `app/api/mock/[projectId]/data/[tableId]/${params.projectId}-${column.referenceTable}.json`,
      );

      const refTableData = await JSON.parse(
        await fsa.readFile(refPath, 'utf8'),
      );

      const refTable = database.find(
        (table) => table.id === column.referenceTable,
      );

      if (refTable) {
        refTable.columns.push({
          id: `${translateDataToTable.id}-${refTable.id}`,
          label: `${translateDataToTable.id}-${refTable.id}`,
          type: column.type,
          isActive: true,
          isPrimaryKey: false,
          isForeignKey: true,
          foreignKeyId: `${translateDataToTable.id}-${refTable.id}`,
          referenceTable: params.tableId,
        });

        refTableData.columns = refTable.columns;

        refTableData.rows = refTableData.rows.map((row) => ({
          ...row,
          [`${translateDataToTable.id}-${refTable.id}`]: {
            referenceTableId: `${params.tableId}`,
            referenceRecords: [],
          },
        }));

        refTable.referenceTables.push(translateDataToTable.id);

        fs.writeFile(
          `app/api/mock/[projectId]/data/[tableId]/${params.projectId}-${column.referenceTable}.json`,
          JSON.stringify(refTableData, undefined, 2),
          (err) => {
            if (err) {
              console.log('Error writing file:', err);
            } else {
              console.log('Successfully wrote file');
            }
          },
        );
      }
    }
  }

  console.log('[AFTER_REF_TABLE]', database);
  database.push(translateDataToTable);

  // CREATE TABLE

  const tableData = {
    columns: translateDataToTable.columns,
    rows: [],
  };

  fs.writeFile(
    `app/api/mock/[projectId]/data/[tableId]/${params.projectId}-${params.tableId}.json`,
    JSON.stringify(tableData, undefined, 2),
    (err) => {
      if (err) {
        console.log('Error writing file:', err);
      } else {
        console.log('Successfully wrote file');
      }
    },
  );

  fs.writeFile(
    `app/api/mock/[projectId]/data/all/${params.projectId}.json`,
    JSON.stringify(database, undefined, 2),
    (err) => {
      if (err) {
        console.log('Error writing file:', err);
      } else {
        console.log('Successfully wrote file');
      }
    },
  );

  return new NextResponse('OK', {
    status: 200,
  });
}

export async function PUT(
  request: Request,
  { params }: { params: { projectId: string; tableId: string } },
) {
  const tablePath = path.join(
    process.cwd(),
    `app/api/mock/[projectId]/data/[tableId]/${params.projectId}-${params.tableId}.json`,
  );

  const databasePath = path.join(
    process.cwd(),
    `app/api/mock/[projectId]/data/all/${params.projectId}.json`,
  );

  const { data, newReferenceTableIds } = await request.json();

  // console.log('[DATA]: ' + JSON.stringify(data, undefined, 4));
  console.log(
    '[REF_TABLE]:' + JSON.stringify(newReferenceTableIds, undefined, 4),
  );

  const database = await JSON.parse(await fsa.readFile(databasePath, 'utf8'));

  // * UPDATE DATA
  const updateTableData = JSON.stringify(data, undefined, 4);

  fs.writeFile(
    `app/api/mock/[projectId]/data/[tableId]/${params.projectId}-${params.tableId}.json`,
    updateTableData,
    (err) => {
      if (err) {
        console.log('Error writing file:', err);
      } else {
        console.log('Successfully wrote file');
      }
    },
  );

  // * UPDATE COLUMN IN DATABASE

  const thisTable = database.find((table) => table.id === params.tableId);

  thisTable.columns = data.columns;

  // * TO CHECK IF UPDATE ALSO IN REF TABLE
  if (newReferenceTableIds.length > 0) {
    // thisTable
    thisTable.referenceTables.push(...newReferenceTableIds);

    //referenceTables
    for (const tableId of newReferenceTableIds) {
      const referenceTable = database.find(
        (table) => table.id === tableId && table.id !== params.tableId,
      );

      const refPath = path.join(
        `app/api/mock/[projectId]/data/[tableId]/${params.projectId}-${tableId}.json`,
      );

      const refTableData = await JSON.parse(
        await fsa.readFile(refPath, 'utf8'),
      );

      if (!referenceTable) {
        continue;
      }

      // TODO: May need to consider again the foreignkeyID
      // TODO: Consider if needed update also data in reference tables
      const newColumns: ColumnDef = {
        id: `${params.tableId}-${referenceTable.id}`,
        label: `${params.tableId}-${referenceTable.id}`,
        type: 'link',
        isActive: true,
        isPrimaryKey: false,
        isForeignKey: true,
        foreignKeyId: `${params.tableId}-${referenceTable.id}`,
      };

      referenceTable.columns.push(newColumns);
      referenceTable.referenceTables.push(params.tableId);
      console.log('REFERENCE_TABLE:', referenceTable);

      refTableData.columns.push(newColumns);
      refTableData.rows = refTableData.rows.map((row) => ({
        ...row,
        [`${params.tableId}-${referenceTable.id}`]: {
          referenceTableId: `${params.tableId}`,
          referenceRecords: [],
        },
      }));

      fs.writeFile(
        refPath,
        JSON.stringify(refTableData, undefined, 2),
        (err) => {
          if (err) {
            console.log('Error writing file:', err);
          } else {
            console.log('Successfully wrote file');
          }
        },
      );
    }
  }

  fs.writeFile(
    `app/api/mock/[projectId]/data/all/${params.projectId}.json`,
    JSON.stringify(database, undefined, 4),
    (err) => {
      if (err) {
        console.log('Error writing file:', err);
      } else {
        console.log('Successfully wrote file');
      }
    },
  );

  console.log('[THIS_TABLE:]', thisTable);

  return new NextResponse('Success Updated', {
    status: 200,
  });
}

export async function OLD_POST(
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

  try {
    const initData = await fsa.readFile(databasePath, 'utf8');

    const projectTables = JSON.parse(initData);

    for (const column of data.requiredFields) {
      if (column.referenceTable) {
        const referenceTable = projectTables.find(
          (table) => table.id === column.referenceTable,
        );

        if (referenceTable) {
          referenceTable.columns.push({
            id: `${realData.id}-${referenceTable.id}`,
            label: `${realData.id}-${referenceTable.id}`,
            type: column.type,
            isActive: true,
            isPrimaryKey: false,
            isForeignKey: true,
            foreignKeyId: `${realData.id}-${referenceTable.id}`,
            referenceTable: params.tableId,
          });

          referenceTable.referenceTables.push(realData.id);
        }
      }
    }

    // data.requiredFields.forEach((column) => {
    //   if (column.referenceTable) {
    //     const referenceTable = projectTables.find(table => table.id === column.referenceTable)

    //     if (referenceTable) {
    //       referenceTable.columns.push({
    //         id: `${realData.id}-${referenceTable.id}`,
    //         label: `${realData.id}-${referenceTable.id}`,
    //         type: 'text',
    //         isActive: true,
    //         isPrimaryKey: false,
    //         isForeignKey: true,
    //         foreignKeyId: `${realData.id}-${referenceTable.id}`,
    //       })

    //       referenceTable.referenceTables.push(realData.id);
    //     }
    //   }
    // })

    projectTables.push(realData);

    const dataToWrite = JSON.stringify(projectTables);

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
export async function OLD_GET(
  request: NextRequest,
  { params }: { params: { projectId: string; tableId: string } },
) {
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get('page') || 0;
  const limit = searchParams.get('limit') || 10;

  const databasePath = path.join(
    process.cwd(),
    `app/api/mock/[projectId]/data/[tableId]/${params.projectId}-${params.tableId}.json`,
  );

  if (!fs.existsSync(databasePath)) {
    try {
      const dbPath = path.join(
        process.cwd(),
        `app/api/mock/[projectId]/data/all/${params.projectId}.json`,
      );

      const data: TableItem[] = JSON.parse(await fsa.readFile(dbPath, 'utf8'));

      const tableData = data.find((table) => table.id === params.tableId);

      if (!tableData) {
        return new NextResponse('NO TABLE FOUND', {
          status: 404,
        });
      }

      const response = {
        data: {
          columns: tableData.columns,
          rows: [],
          maxIndex: 0,
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
    } catch (error) {
      console.log(error);
      return new NextResponse('', { status: 500 });
    }
  }

  try {
    const data = JSON.parse(await fsa.readFile(databasePath, 'utf8'));

    const dbPath = path.join(
      process.cwd(),
      `app/api/mock/[projectId]/data/all/${params.projectId}.json`,
    );

    const projectTables = JSON.parse(await fsa.readFile(dbPath, 'utf8'));

    const requestTable = projectTables.find(
      (table) => table.id === params.tableId,
    );

    const response = {
      data: {
        columns: requestTable
          ? // eslint-disable-next-line unicorn/no-nested-ternary
            requestTable.columns.length > data.columns.length
            ? requestTable.columns
            : data.columns
          : data.columns,
        rows:
          data.rows.length > 30
            ? data.rows.slice(Number(page) * Number(limit), Number(limit))
            : data.rows,
        maxIndex: data.rows.length,
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
  } catch (error) {
    console.log(error);
    return new NextResponse('', { status: 500 });
  }
}
