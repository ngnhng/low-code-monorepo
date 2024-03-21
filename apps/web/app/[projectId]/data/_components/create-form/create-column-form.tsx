'use client';

import React, { useEffect, useState } from 'react';

import useSWR from 'swr';
import { useMobxStore } from 'lib/mobx/store-provider';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Sheet, SheetContent, SheetTrigger } from '@repo/ui';
import { Button, Input } from '@repo/ui';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui';
import { ColumnDef } from 'types/table-data';
import { toast } from 'sonner';

interface CreateColumnFormProps {
  setLocalColumns: any;
  setLocalData: any;
  setNewReferenceTableId: any;
  tableId: string;
}

const typeValues = ['date', 'text', 'number', 'boolean', 'link'] as const;

const formSchema = z.object({
  columnname: z.string().min(2, {
    message: 'columnname must be at least 2 characters.',
  }),
  type: z.enum(typeValues),
  referenceTable: z.string().optional(),
});

const CreateColumnForm = ({
  setLocalColumns,
  setLocalData,
  tableId,
  setNewReferenceTableId,
}: CreateColumnFormProps) => {
  const [open, setOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<any>();
  // eslint-disable-next-line no-unused-vars
  const [columnOfTable, setColumnOfTable] = useState<any[]>();
  const [type, setType] = useState<string>('');

  const {
    tableData: { fetchTables },
    projectData: { currentProjectId },
  } = useMobxStore();

  const { data, isLoading } = useSWR(`TABLE_DATA-${currentProjectId}-all`, () =>
    fetchTables(),
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      columnname: '',
      type: undefined,
    },
  });

  const { isSubmitting } = form.formState;

  useEffect(() => {
    if (selectedTable) {
      console.log('Selected Table:', selectedTable);
      const columns = selectedTable.columns.map((col) => ({
        id: col.id,
        label: col.label,
      }));
      setColumnOfTable(columns);
    }
  }, [selectedTable]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // reset condition for logic disabled reference table
    setType('');

    // transform data from form schema
    // check logic naming for foreign key id
    let newColData: ColumnDef = {
      id: values.columnname.replaceAll(/\s/g, '').toLowerCase(),
      label: values.columnname,
      type: values.type,
      isActive: true,
      isPrimaryKey: false,
      isForeignKey: values.referenceTable ? true : false,
      foreignKeyId: values.referenceTable
        ? `${tableId}-${values.referenceTable}`
        : '',
    };

    console.log('Creating Column:', newColData);

    if (values.referenceTable) {
      newColData = {
        ...newColData,
        referenceTable: values.referenceTable,
      };
    }

    // Check if existing column with same function and add column to localCol
    let flag = false;

    setLocalColumns((previous) => {
      const existingColumns = previous.find((col) => {
        if (col.id.toLowerCase() === newColData.id.toLowerCase()) {
          return col;
        }

        if (
          col.referenceTable &&
          col.referenceTable?.toLowerCase() ===
            newColData.referenceTable?.toLowerCase()
        ) {
          return col;
        }

        return;
      });

      console.log('Existing:', existingColumns);

      if (existingColumns) {
        flag = true;
        return [...previous];
      }

      return [...previous, newColData];
    });

    if (flag) {
      form.reset();
      setOpen(false);
      toast.error('Column existing');
      return;
    }

    // set default value for type link and newReferencetableid
    if (values.type === 'link') {
      setLocalData((previous) => {
        const newData = previous.map((row) => {
          row[newColData.id] = {
            referenceTableId: `${values.referenceTable}`,
            referenceRecords: [],
          };

          console.log('New Created', row[values.columnname]);
          return row;
        });

        return newData;
      });
    }

    if (values.referenceTable) {
      setNewReferenceTableId((previous) => [
        ...previous,
        values.referenceTable,
      ]);
    }

    form.reset();
    setOpen(false);

    // toast.success('Column has been created.', {
    //   description: (
    //     <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
    //       <code className="text-white">
    //         {JSON.stringify(data, undefined, 2)}
    //       </code>
    //     </pre>
    //   ),
    // });
  };

  const references = data?.map((data) => ({
    id: data.id,
    tablename: data.name,
  }));

  if (!data || isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="default" onClick={() => setOpen(true)}>
          Add Column
        </Button>
      </SheetTrigger>

      <SheetContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="columnname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Column Name</FormLabel>
                  <FormControl>
                    <Input placeholder="shadcn" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={(e) => {
                      field.onChange(e);
                      setType(e);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a type for column" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="text" className="flex items-center">
                        Text
                      </SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="link">Link</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="referenceTable"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference Table</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      const table = data.find((table) => table.id === value);
                      setSelectedTable(table);
                      return field.onChange(value);
                    }}
                    disabled={type !== 'link'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {references &&
                        references.map((ref, index) => (
                          <SelectItem key={index} value={ref.id}>
                            {ref.tablename}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              Submit
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default CreateColumnForm;
