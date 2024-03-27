'use client';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Button,
  Label,
  Separator,
  DialogHeader,
  DialogTitle,
  CardButtonWithIcon,
} from '@repo/ui';

import useSWR from 'swr';

import { Database, Download, Table, User } from 'react-feather';
import { DataTable, columns } from './_components/table-list/table-list';

import DBList from './_components/db-list/db-list';
import React from 'react';

import { TextWithIcon } from 'components/text/text-with-icon';
import { OptionDialog } from './_components/table-list/options-cards';
import { useMobxStore } from '../../../lib/mobx/store-provider';
import CreateTableForm from './_components/create-form/create-table-form';

export default function Page() {
  const {
    projectData: { currentProjectId },
    tableData: { fetchTables },
  } = useMobxStore();

  const { data, isLoading } = useSWR(`TABLE_DATA-${currentProjectId}-all`, () =>
    fetchTables(),
  );

  if (!data || isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <DatabaseTabs
        data={data}
        columns={columns}
        projectId={currentProjectId}
      />
    </>
  );
}

const HorizontalList = ({ children, ...props }) => (
  <ul className="flex space-x-4" {...props}>
    {children}
  </ul>
);

export function DatabaseTabs({ data, columns, projectId }) {
  // const tableRef = useRef<ReactComponentElement>(null);

  return (
    <Tabs defaultValue="tables" className="w-11/12 m-4">
      <TabsList className="flex justify-start space-x-28">
        <TabsTrigger value="tables">
          <TextWithIcon icon={<Table />}>Tables</TextWithIcon>
        </TabsTrigger>
        <TabsTrigger value="members">
          <TextWithIcon icon={<User />}>Members</TextWithIcon>
        </TabsTrigger>
        <TabsTrigger value="sources">
          <TextWithIcon icon={<Download />}>Data Sources</TextWithIcon>
        </TabsTrigger>
      </TabsList>

      <Separator className="my-4" />

      <TabsContent value="tables">
        <div className="container mr-auto">
          <HorizontalList>
            <CreateTableForm projectId={projectId} />

            <CardButtonWithIcon
              className="flex flex-col justify-between items-start space-y-2 w-64 h-32 p-4 hover:bg-gray-200 "
              icon={<Download size={40} />}
              onClick={() => console.log('Card')}
            >
              <span className="text-xl font-light">Import</span>
            </CardButtonWithIcon>
            <OptionDialog
              trigger={
                <CardButtonWithIcon
                  className="flex flex-col justify-between items-start space-y-2 w-64 h-32 p-4 hover:bg-gray-200 "
                  icon={<Database size={40} />}
                  onClick={() => console.log('Card')}
                >
                  <span className="text-xl font-light">Add Data Source</span>
                </CardButtonWithIcon>
              }
            >
              <DialogHeader>
                <DialogTitle>Databases</DialogTitle>
              </DialogHeader>
              <DBList></DBList>
            </OptionDialog>
          </HorizontalList>

          <Separator className="my-4" />

          <DataTable columns={columns} data={data} />
        </div>
      </TabsContent>
      <TabsContent value="members">
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
            <CardDescription>
              Change your members here. After saving, you'll be logged out.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="current">Current members</Label>
              <Input id="current" type="members" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">New members</Label>
              <Input id="new" type="members" />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save members</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="sources">Comming Soon</TabsContent>
    </Tabs>
  );
}
