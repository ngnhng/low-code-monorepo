"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button, Textarea, Input, Switch } from "@repo/ui";
import {
  Form,
  FormControl,
  // FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui";

interface DbConnectionFormProps {
  requiredFields: string[];
}

// TODO: Toast messages
// TODO: Maybe need to update Regex

const formSchema = z.object({
  // privateKey: z.string().min(1).optional().or(z.literal(''))
  privateKey: z.string().min(1).optional(),
  host: z.string().min(1).optional(),
  port: z.string().min(1).optional(),
  database: z.string().min(1).optional(),
  username: z.string().min(1).optional(),
  password: z.string().min(1).optional(),
  ssl: z.boolean().optional(),
  // TODO: url - header - type - etc...
  // TODO: query params
  url: z.string().min(1).url({
    message: "Input must be an url `www.example.com`",
  }),
});
export function DBAddForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const { isSubmitting, isValid } = form.formState;

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // TODO: axios data
      console.log(values);
      toast.success("Event has been created.");
    } catch {
      toast.error("Something went wrong");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="privateKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Private Key</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter private key" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between items-center">
          <FormField
            control={form.control}
            name="host"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Host</FormLabel>
                <FormControl>
                  <Input placeholder="Enter host" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="port"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Port</FormLabel>
                <FormControl>
                  <Input placeholder="Enter port" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="Enter password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Url</FormLabel>
              <FormControl>
                <Input placeholder="Enter url" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ssl"
          render={() => (
            <FormItem>
              <div className="flex items-center space-x-2">
                <FormLabel htmlFor="ssl-mode">Ssl</FormLabel>
                <FormControl>
                  <Switch id="ssl-mode" />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center">
          <Button type="submit" disabled={isSubmitting || !isValid}>
            Submit
          </Button>
          <Button
            variant={"ghost"}
            className="ml-4 border"
            type="submit"
            disabled={isSubmitting || !isValid}
          >
            Test Connection
          </Button>
        </div>
      </form>
    </Form>
  );
}
