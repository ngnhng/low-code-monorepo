'use client';

import React, { useState } from 'react';

import {
  Field,
  QueryBuilder,
  RuleGroupType,
  RuleType,
  defaultOperators,
} from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.css';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
} from '@repo/ui';
import { toast } from 'sonner';
import { useMobxStore } from 'lib/mobx/store-provider';
import useSWR from 'swr';

const initialQuery: RuleGroupType = { combinator: 'and', rules: [] };

interface QueryBuilderListProps {
  columns: any;
}

const QueryBuilderList = ({ columns }: QueryBuilderListProps) => {
  const [query, setQuery] = useState(initialQuery);

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

  const queryFields: Field[] = columns.map((col) => ({
    name: col.id,
    label: col.label,
  }));

  const onSelect = (event: Event) => {
    event.preventDefault();
  };

  const onQuery = () => {
    toast.success('Column has been created.', {
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">
            {JSON.stringify(query, undefined, 2)}
          </code>
        </pre>
      ),
    });

    // router.push(``);
  };

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={'default'}>Query Builder</Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuLabel>Action Filter</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <QueryBuilder
              fields={queryFields}
              query={query}
              onQueryChange={(q) => setQuery(q)}
            />
            <Button className="my-4" variant={'secondary'} onClick={onQuery}>
              Query
            </Button>
            <DropdownMenuItem className="" onSelect={onSelect}>
              Filter By Values
              <Input type="email" placeholder="Find ..." />
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default QueryBuilderList;
