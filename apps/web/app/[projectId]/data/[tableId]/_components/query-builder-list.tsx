import React, { useState } from 'react'

import { Field, QueryBuilder, RuleGroupType } from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.css';
// import { ColumnDef } from 'types/table-data';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  // DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
} from "@repo/ui"
import { toast } from 'sonner'
// import { useRouter } from 'next/navigation';



const initialQuery: RuleGroupType = { combinator: 'and', rules: [] };

interface QueryBuilderListProps {
  columns: any;
}

const QueryBuilderList = ({
  columns
} 
  : QueryBuilderListProps) => {

  const [query, setQuery] = useState(initialQuery);
  // const router = useRouter();

  const queryFields: Field[] = columns.map((col) => ({
    name: col.id,
    label: col.label,
  }))

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const onSelect = (event: Event) => {
    event.preventDefault();
  }

  const onQuery = () => {
    toast.success("Column has been created.", {
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(query, undefined, 2)}</code>
        </pre>
      ),
    })
    
    // router.push(``);
  }

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={"default"}>
            Query Builder
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuLabel>Action Filter</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <QueryBuilder fields={queryFields} query={query} onQueryChange={q => setQuery(q)}/>
            <Button className='my-4' variant={"secondary"} onClick={onQuery}>
              Query
            </Button>
            <DropdownMenuItem className='' onSelect={onSelect}>
              Filter By Values
              <Input type="email" placeholder="Find ..."/>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div> 
  )
}

export default QueryBuilderList