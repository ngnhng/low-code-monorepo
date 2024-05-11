import React from "react";
import { CardButtonWithIcon } from "@repo/ui";
import { PlusSquare, XCircle } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import axios from "axios";

import { Sheet, SheetContent, SheetTrigger } from "@repo/ui";
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

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMobxStore } from "lib/mobx/store-provider";
import useSWR from "swr";

interface CreateTableFormProps {
  projectId: string;
  yalcToken: string;
}

const requiredFieldsSchema = z.object({
  id: z.string().trim().min(2, {
    message: "Key must be at least 2 characters.",
  }),
  type: z.string().min(1, {
    message: "Type is required",
  }),
  // referenceTable: z.string().optional().default(""),
  // defaultValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
  // isActive: z.boolean().default(true),
  // isPrimaryKey: z.boolean().default(false),
  // isForeignKey: z.boolean().default(false),
  // foreignKeyId: z.string().default(""),
});

const arrayRequiredFields = z.array(requiredFieldsSchema);

const formSchema = z.object({
  tablename: z.string().min(2, {
    message: "Tablename must be at least 2 characters.",
  }),
  requiredFields: arrayRequiredFields,
});

const CreateTableForm = ({ projectId, yalcToken }: CreateTableFormProps) => {
  const router = useRouter();

  const {
    tableData: { fetchTables },
    projectData: { currentProjectId },
  } = useMobxStore();

  const { data, isLoading, mutate } = useSWR(
    `TABLE_DATA-${currentProjectId}-all`,
    () => fetchTables(yalcToken)
  );

  // const references = data?.map((data) => ({
  //   id: data.id,
  //   tablename: data.name,
  // }));

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const {
    fields: requiredFields,
    append: requiredFieldsAppend,
    remove: requiredFieldsRemove,
    // register
  } = useFieldArray({
    control: form.control,
    name: "requiredFields",
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const configs = {
      headers: {
        Authorization: `Bearer ${yalcToken}`,
      },
    };

    const submitData = {
      table: {
        label: values.tablename,
        columns: values.requiredFields.map((field) => ({
          label: field.id,
          type: mappingType(field.type),
        })),
      },
    };

    try {
      await axios.post(`/api/dbms/${projectId}`, submitData, configs);
      toast.success("Table has been created.", {
        description: (
          <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            <code className="text-white">
              {JSON.stringify(values, undefined, 2)}
            </code>
          </pre>
        ),
      });
      mutate();
      router.refresh();
      // router.push(`/${projectId}/data/${values.tablename}`)
    } catch {
      toast.error("Something went wrong");
    }
  };

  if (!data || isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Sheet>
      <SheetTrigger>
        <CardButtonWithIcon
          className="flex flex-col justify-between items-start space-y-2 w-64 h-32 p-4 hover:bg-gray-200 "
          icon={<PlusSquare size={40} />}
          onClick={() => console.log("Card")}
        >
          <span className="text-xl font-light">Add Table</span>
        </CardButtonWithIcon>
      </SheetTrigger>

      <SheetContent className="sm:max-w-[33rem]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="tablename"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Table Name</FormLabel>
                  <FormControl>
                    <Input placeholder="shadcn" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {requiredFields.map((item, index) => {
              return (
                <div className="relative" key={index}>
                  <FormField
                    control={form.control}
                    name={`requiredFields.${index}`}
                    render={(field) => (
                      <div className="flex items-center justify-center">
                        <FormItem>
                          <FormLabel>Key</FormLabel>
                          <FormControl>
                            <Input
                              {...form.register(`requiredFields.${index}.id`)}
                              placeholder="Input Key"
                              className="w-[13rem] mr-2"
                            />
                          </FormControl>
                        </FormItem>

                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <div className="w-[13rem] mr-2">
                            <Select
                              onValueChange={(value) => {
                                field.field.value.type = value;
                                // return field.field.onChange(value);
                              }}
                              defaultValue={""}
                              {...form.register(`requiredFields.${index}.type`)}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="text">text</SelectItem>
                                <SelectItem value="number">number</SelectItem>
                                <SelectItem value="boolean">boolean</SelectItem>
                                <SelectItem value="date">date</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </FormItem>
                        <XCircle
                          size={24}
                          className="absolute right-[0.1rem] bottom-2"
                          onClick={() => requiredFieldsRemove(index)}
                        />
                      </div>
                    )}
                  />
                </div>
              );
            })}

            <Button
              disabled={isSubmitting}
              variant={"ghost"}
              className="mr-4"
              type="button"
              onClick={() =>
                requiredFieldsAppend({
                  id: "",
                  type: "text",
                })
              }
            >
              Add a column
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Submit
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

function mappingType(type: string) {
  switch (type) {
    case "text": {
      return "string";
    }
    case "number": {
      return "integer";
    }
    case "boolean": {
      return "boolean";
    }
    case "date": {
      return "date";
    }
    case "link": {
      return "link";
    }
    default: {
      return "string";
    }
  }
}

export default CreateTableForm;
