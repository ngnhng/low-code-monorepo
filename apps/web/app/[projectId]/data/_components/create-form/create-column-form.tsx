"use client";

import React, { useEffect, useState, useMemo } from "react";

import useSWR from "swr";
import { useMobxStore } from "lib/mobx/store-provider";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";

import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@repo/ui";
import { Button, Input } from "@repo/ui";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui";
import { ColumnDef } from "types/table-data";
import { toast } from "sonner";
import cn from "../../../../../lib";

interface CreateColumnFormProps {
  setLocalColumns: any;
  setLocalData: any;
  setNewReferenceTableId: any;
  tableId: string;
  createdColumns: Set<ColumnDef>;
}

const typeValues = ["date", "text", "number", "boolean", "link"] as const;

const formSchema = z
  .object({
    columnname: z.string().min(2, {
      message: "columnname must be at least 2 characters.",
    }),
    type: z.enum(typeValues),
    referenceTable: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.type === "link" && !data.referenceTable) {
        return false;
      }
      return true;
    },
    {
      message: "Reference Table is required for Link type.",
      path: ["referenceTable"],
    }
  )
  .refine(
    (data) => {
      if (data.type !== "link" && data.referenceTable) {
        return false;
      }
      return true;
    },
    {
      message: "Reference Table is not required for non-Link type.",
      path: ["referenceTable"],
    }
  );

const CreateColumnForm = ({
  setLocalColumns,
  setLocalData,
  tableId,
  setNewReferenceTableId,
  createdColumns,
}: CreateColumnFormProps) => {
  const [open, setOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<any>();
  const [, setColumnOfTable] = useState<any[]>();

  const {
    tableData: { fetchTables },
    projectData: { currentProjectId },
  } = useMobxStore();

  const { data: allTables, isLoading } = useSWR(
    `TABLE_DATA-${currentProjectId}-all`,
    () => fetchTables("")
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      columnname: "",
      type: undefined,
    },
  });

  const {
    control,
    setValue,
    formState: { isSubmitting },
  } = form;

  useEffect(() => {
    if (selectedTable) {
      console.log("Selected Table:", selectedTable);
      const columns = selectedTable.columns.map((col) => ({
        id: col.id,
        label: col.label,
      }));
      setColumnOfTable(columns);
    }
  }, [selectedTable]);

  // callback when validation succeed
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // reset condition for logic disabled reference table
    //setType('');

    // transform data from form schema
    // check logic naming for foreign key id
    let newColData: ColumnDef = {
      id: values.columnname.replaceAll(/\s/g, "").toLowerCase(),
      name: values.columnname,
      label: values.columnname,
      type: values.type,
      isActive: true,
      isPrimaryKey: false,
      isForeignKey: values.referenceTable ? true : false,
      foreignKeyId: values.referenceTable
        ? `${tableId}-${values.referenceTable}`
        : "",
    };

    console.log("Creating Column:", newColData);

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

      console.log("Existing:", existingColumns);

      if (existingColumns) {
        flag = true;
        return [...previous];
      }

      createdColumns.add(newColData);

      return [...previous, newColData];
    });

    if (flag) {
      form.reset();
      setOpen(false);
      toast.error("Column existing");
      return;
    }

    // set default value for type link and newReferencetableid
    if (values.type === "link") {
      setLocalData((previous) => {
        const newData = previous.map((row) => {
          const newRow = {
            ...row,
            [newColData.name]: {
              count: 0,
              children_ids: [],
              children_table: values.referenceTable,
            },
          };

          return newRow;
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

  // callback when validation failed
  const onError = (errors: any) => {
    console.log("Error:", errors);
    // reset the reference table if the type is not link
    setValue("referenceTable", undefined);
  };

  const references = useMemo(() => {
    return allTables?.map((data) => ({
      id: data.id,
      tablename: data.label,
    }));
  }, [allTables]);

  if (!allTables || isLoading) {
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
          <form
            onSubmit={form.handleSubmit(onSubmit, onError)}
            className="space-y-8"
          >
            <FormField
              control={control}
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
              control={control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={(e) => {
                      field.onChange(e);
                      //  setType(e);
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
              control={control}
              name="referenceTable"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Reference Table</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {references?.find((ref) => ref.id === field.value)
                            ?.tablename || "Select a category"}
                          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent>
                      <Command>
                        <CommandInput
                          placeholder="Search for a table"
                          className="w-full"
                        />
                        <CommandGroup>
                          {references &&
                            references.map((ref, index) => (
                              <CommandItem
                                key={index}
                                value={ref.id}
                                onSelect={(value) => {
                                  console.log("Selected:", value);
                                  setSelectedTable(
                                    allTables.find(
                                      (table) => table.id === value
                                    )
                                  );

                                  setValue(
                                    "referenceTable",
                                    value == field.value ? undefined : value
                                  );
                                }}
                                className={cn(
                                  "flex items-center",
                                  field.value === ref.id &&
                                    "bg-slate-950 text-white"
                                )}
                              >
                                {ref.tablename}
                                {field.value === ref.id && (
                                  <CheckIcon
                                    className={cn(
                                      "ml-auto h-4 w-4",
                                      ref.id === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                )}
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {/*<Select
                    onValueChange={(value) => {
                      const table = allTables.find(
                        (table) => table.id === value,
                      );
                      setSelectedTable(table);
                      return field.onChange(value);
                    }}
					defaultValue={undefined}
                    //disabled={type !== 'link'}
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
                  </Select>*/}
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
