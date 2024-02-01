"use client"
 
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
 
import { Button } from "@repo/ui"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui"
import { Input } from "@repo/ui"

interface DbConnectionFormProps {
  requiredFields: string[];
}

const formSchema = z.object({
  // privateKey: z.string().min(1).optional().or(z.literal(''))
  privateKey: z.string().min(1).optional(),
  host: z.string().min(1).optional(),
  port: z.string().min(1).optional(),
  database: z.string().min(1).optional(),
  username: z.string().min(1).optional(),
  password: z.string().min(1).optional(),
  ssl: z.boolean().optional(),
  //  TODO: url - header - type - etc...
  // url: z.string().optional(),
})
export function DBAddForm({ requiredFields }: DbConnectionFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      privateKey: "",
      host: "",
    },
  })
 
  const { isSubmitting, isValid } = form.formState;

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name='privateKey'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Private Key</FormLabel>
              <FormControl>
                <Input placeholder="Enter private key" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='host'
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
          name='port'
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

        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter username" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <Button 
            type="submit" 
            disabled={isSubmitting || !isValid}
          >
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
  )
}

