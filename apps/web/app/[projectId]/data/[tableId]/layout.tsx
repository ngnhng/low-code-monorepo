'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui';
import React from 'react';
import { TextWithIcon } from '../../../../components/text/text-with-icon';
import { Table } from 'react-feather';

export default function Layout({
  fields,
  view,
  params,
}: {
  fields: React.ReactNode;
  view: React.ReactNode;
  params: { tableId: string };
}) {
  return (
    <div className="h-full">
      <Tabs defaultValue="view">
        <TabsList className="flex justify-between w-full px-4">
          <TextWithIcon icon={<Table />}>{params.tableId}</TextWithIcon>

          <div className="flex justify-center w-full">
            <TabsTrigger value="view">View</TabsTrigger>
            <TabsTrigger value="fields">Fields</TabsTrigger>
          </div>
        </TabsList>
        <TabsContent value="view">
          <div className="h-full">{view}</div>
        </TabsContent>
        <TabsContent value="fields">{fields}</TabsContent>
      </Tabs>
    </div>
  );
}
