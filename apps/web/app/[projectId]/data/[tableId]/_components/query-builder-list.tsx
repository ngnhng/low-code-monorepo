import React, { useState } from 'react'

import { Field, QueryBuilder, RuleGroupType } from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.css';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
} from "@repo/ui"
import { FlaskConical } from 'lucide-react';

const initialQuery: RuleGroupType = { combinator: 'and', rules: [] };

interface QueryBuilderListProps {

}

const QueryBuilderList = () => {
  const [query, setQuery] = useState();

  const onSelect = (event: Event) => {
    event.preventDefault();
  }

  const fields: Field[] = [
    { name: 'firstName', label: 'First Name' },
    { name: 'lastName', label: 'Last Name' },
  ];

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
            <QueryBuilder fields={fields}/>
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