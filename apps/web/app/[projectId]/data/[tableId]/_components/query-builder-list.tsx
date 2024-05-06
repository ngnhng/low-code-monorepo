"use client";

import React, { useState } from "react";

import {
  Field,
  QueryBuilder,
  RuleGroupType,
  formatQuery,
} from "react-querybuilder";
import "react-querybuilder/dist/query-builder.css";

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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui";
import { toast } from "sonner";
import { useMobxStore } from "lib/mobx/store-provider";
import useSWR from "swr";
import { ColumnDef, ColumnType } from "types/table-data";

const initialQuery: RuleGroupType = { combinator: "and", rules: [] };

interface QueryBuilderListProps {
  columns: ColumnDef[];
  tableId: string;
  yalcToken: string;
  setLocalColumns: any;
  setLocalData: any;
}

const QueryBuilderList = ({
  tableId,
  columns,
  yalcToken,
  setLocalColumns,
  setLocalData,
}: QueryBuilderListProps) => {
  const [query, setQuery] = useState(initialQuery);
  const [groupby, setGroupBy] = useState<string>();
  const [sortby, setSortBy] = useState<string>();

  const {
    projectData: { currentProjectId },
    tableData: { fetchTables, fetchTableData },
  } = useMobxStore();

  const { data, isLoading } = useSWR(`TABLE_DATA-${currentProjectId}-all`, () =>
    fetchTables(yalcToken)
  );

  if (!data || isLoading) {
    return <div>Loading...</div>;
  }

  const transformData = data.map((table) => {
    return table.columns.map((column) => ({
      name: `"${column.id}"`,
      label: `${table.name} - ${column.label}`,
      inputType: formatTypeIntoInputType(column.type),
    }));
  });

  const queryFields: Field[] = transformData.flat();

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const onSelect = (event: Event) => {
    event.preventDefault();
  };

  const onQuery = async () => {
    const postValues = {
      ...formatQuery(query, "parameterized"),
      groupby: groupby,
      sortby: sortby,
    };
    console.log("onQuery:", postValues);
    console.log("onTEST", formatQuery(query, "sql"));

    const response = await fetchTableData(
      { tableId, query: postValues },
      yalcToken
    );

    setLocalColumns(response.columns);
    setLocalData(response.rows);

    toast.success("Column has been created.", {
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">
            {JSON.stringify(postValues, undefined, 2)}
          </code>
          {/* <p className="font-bold text-white">Group by: {groupby}</p> */}
        </pre>
      ),
    });
  };

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={"primary"}>Query Builder</Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="min-w-[750px] max-w-full">
          <DropdownMenuLabel>Query Fields</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <QueryBuilder
              fields={queryFields}
              query={query}
              onQueryChange={(q) => setQuery(q)}
              autoSelectField={false}
              translations={{
                fields: {
                  placeholderLabel: "Field format: table - column...",
                },
              }}
            />
            <div className="flex items-center justify-between">
              <DropdownMenuItem className="mt-4" onSelect={onSelect}>
                <span className="font-bold mr-4">Group by</span>
                <Select onValueChange={(value) => setGroupBy(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select ..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {columns.map((col) => (
                        <SelectItem key={col.id} value={col.id}>
                          {col.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </DropdownMenuItem>

              <DropdownMenuItem className="mt-4" onSelect={onSelect}>
                <span className="font-bold mr-4">Sort By</span>
                <Select onValueChange={(value) => setSortBy(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select ..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="asc">ASC</SelectItem>
                      <SelectItem value="desc">DESC</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </DropdownMenuItem>

              <div />
            </div>
            <DropdownMenuItem className="" onSelect={onSelect}>
              <span>Preview SQL</span>
              <Input
                disabled
                value={formatQuery(query, "sql")}
                className="font-bold text-blue-700"
              />
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <Button className="my-4" variant={"secondary"} onClick={onQuery}>
            Query
          </Button>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

function formatTypeIntoInputType(type: ColumnType) {
  switch (type) {
    case "text": {
      return "text";
    }
    case "date": {
      return "date";
    }
    case "number": {
      return "number";
    }
    case "boolean": {
      return "checkbox";
    }
    default: {
      return "text";
    }
  }
}

export default QueryBuilderList;
