"use client";

import React from "react";

import axios from "axios";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "sonner";
import {
  Button,
  Checkbox,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@repo/ui";
import { useLocalStorage } from "hooks/use-local-storage";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  spreadsheetsId: z
    .string()
    .regex(new RegExp(/^([\w-]+)+$/), "Must be a valid spreadsheet identifier"),
  sheetRange: z.string(),
  headerTitle: z.boolean().default(true),
});

export const SheetAddForm = () => {
  const [yalcToken] = useLocalStorage("yalc_at", "");
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      headerTitle: true,
    },
  });

  const { isSubmitting, isValid } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${yalcToken}`,
        },
      };
      await axios.post(`http://localhost:3000/api/data/sheet`, values, config);
      console.log("YALC", yalcToken);

      toast.success("Event has been created.", {
        description: (
          <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            <code className="text-white">
              {JSON.stringify(values, undefined, 2)}
            </code>
          </pre>
        ),
      });

      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="spreadsheetsId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SpreadSheets Id</FormLabel>
                <FormControl>
                  <Input placeholder="spreadsheet id" {...field} />
                </FormControl>
                <FormDescription>
                  https://docs.google.com/spreadsheets/d/
                  <span className="text-rose-500">this-part</span>
                  /edit
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sheetRange"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sheet Range</FormLabel>
                <FormControl>
                  <Input placeholder="sheet values range" {...field} />
                </FormControl>
                <FormDescription>
                  Format:<span className="text-rose-500"> SheetId!A1:B10</span>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="headerTitle"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Header Title?</FormLabel>
                  <FormDescription>
                    Is your first row a title row?
                  </FormDescription>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button variant={"outline"} disabled={isSubmitting || !isValid}>
            Import
          </Button>
        </form>
      </Form>
    </>
  );
};
