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
// import useSWR from "swr";
import { ColumnDef, ColumnType } from "types/table-data";
import { mappingValueDate } from "app/api/dbms/_utils/utils";

const initialQuery: RuleGroupType = { combinator: "and", rules: [] };

interface QueryBuilderListProps {
  columns: ColumnDef[];
  tableId: string;
  yalcToken: string;
  setLocalColumns: any;
  setLocalData: any;
  localColumns: ColumnDef[];
}

const QueryBuilderList = ({
  tableId,
  columns,
  yalcToken,
  // setLocalColumns,
  setLocalData,
  localColumns,
}: QueryBuilderListProps) => {
  const [query, setQuery] = useState(initialQuery);
  const [groupby, setGroupBy] = useState<string>();
  const [sortby, setSortBy] = useState<string>();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const {
    // projectData: {  },
    tableData: { fetchTableData },
  } = useMobxStore();

  const transformData = localColumns.map((column) => {
    return {
      name: `${column.name}`,
      label: `${column.label}`,
      inputType: formatTypeIntoInputType(column.type),
    };
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

    await fetchTableData({ tableId, query: postValues }, yalcToken).then(
      (response) => {
        console.log("QUERY:", response.rows);
        setIsOpen(false);
        setLocalData(mappingValueDate(localColumns, response.rows));
        toast.success("Query Success");
      }
    );
  };

  return (
    <div>
      <DropdownMenu open={isOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant={"primary"} onClick={() => setIsOpen(true)}>
            Query Builder
          </Button>
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

          <Button className="my-4" variant={"primary"} onClick={onQuery}>
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
