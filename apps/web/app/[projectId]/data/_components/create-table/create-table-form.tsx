import React, { useState } from 'react'
import { CardButtonWithIcon } from '@repo/ui'
import { PlusSquare, XCircle } from 'lucide-react'
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { uuid } from 'uuidv4';

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui"
import { Button, Textarea, Input, Switch, Label } from "@repo/ui"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui"

import { toast } from 'sonner'


interface CreateTableFormProps {

}

const requiredFieldsSchema = z.object({
  key: z.string().trim().min(2, {
    message: 'Key must be at least 2 characters.',
  }),
  type: z.string().min(1, {
    message: "Type is required",
  }),
  defaultValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
})

const arrayRequiredFields = z.array(requiredFieldsSchema);

const formSchema = z.object({
  tablename: z.string().min(2, {
    message: "Tablename must be at least 2 characters.",
  }),
  requiredFields: arrayRequiredFields,
})

const CreateTableForm = () => {

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    // defaultValues: {
    //   tablename: "",
    //   requiredFields: [{
    //     "key": "",
    //     "type": "",
    //     // "defaultValue": "",
    //   }]
    // },
  })

  const {
    fields: requiredFields,
    append: requiredFieldsAppend,
    remove: requiredFieldsRemove,
    // register
  } = useFieldArray({
    control: form.control,
    name: "requiredFields",
  })

  const { isSubmitting, isValid } = form.formState;
 
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // TODO: axios data
      toast.success("Table has been created.", {
        description: (
          <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            <code className="text-white">{JSON.stringify(values, null, 2)}</code>
          </pre>
        ),
      })
      // TODO: router
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  return (
    <Sheet>
      <SheetTrigger>
        <CardButtonWithIcon
          className="flex flex-col justify-between items-start space-y-2 w-64 h-32 p-4 hover:bg-gray-200 "
          icon={<PlusSquare size={40} />}
          onClick={() => console.log('Card')}
        >
          <span className="text-xl font-light">Add Table</span>
        </CardButtonWithIcon>
      </SheetTrigger>

      <SheetContent className='sm:max-w-[45rem]'>  
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
                <FormField 
                  key={index}
                  control={form.control}
                  name={`requiredFields.${index}`}
                  render={(field) => (
                    <div className='flex items-center justify-center'>
                      <FormItem>
                        <FormLabel>Key</FormLabel>
                        <FormControl>
                          <Input {...form.register(`requiredFields.${index}.key`)} placeholder="Input Key" className='w-[13rem] mr-2'/>
                        </FormControl>
                        {/* <FormMessage /> */}
                      </FormItem>

                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <div className='w-[13rem] mr-2'>
                          <Select 
                            onValueChange={(value) => {
                              field.field.value.type = value;
                            }} 
                            defaultValue={field.field.value.type}
                            {...form.register(`requiredFields.${index}.type`)}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Type" />
                              </SelectTrigger>
                            </FormControl>
                            {/* <FormMessage /> */}
                            <SelectContent>
                              <SelectItem value="string">string</SelectItem>
                              <SelectItem value="number">number</SelectItem>
                              <SelectItem value="boolean">boolean</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {/* <FormControl>
                          <Input {...form.register(`requiredFields.${index}.type`)} placeholder="Input type" className='w-[13rem] mr-2'/>
                        </FormControl> */}
                      </FormItem>

                      <FormItem>
                        <FormLabel>Default</FormLabel>
                        <FormControl>
                          <Input {...form.register(`requiredFields.${index}.defaultValue`)} placeholder="Default" className='w-[13rem] mr-2'/>
                        </FormControl>
                        {/* <FormMessage /> */}
                      </FormItem>
                      <XCircle size={24} onClick={() => requiredFieldsRemove(index)}/>
                    </div>
                  )}
                />
              )
            })}

            <Button disabled={isSubmitting} variant={"ghost"} className="mr-4" type="button" onClick={() => requiredFieldsAppend({
              key: "",
              type: "",
              defaultValue: "",
            })}>Add a column</Button>
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>


    
  )
}

export default CreateTableForm