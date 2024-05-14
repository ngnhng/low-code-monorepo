"use client";

import React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button, Input } from "@repo/ui";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@repo/ui";
import { useMobxStore } from "../../../lib/mobx/store-provider";
import { toast } from "sonner";

const FormSchema = z.object({
    projectName: z.string().min(2, {
        message: "projectName must be at least 2 characters.",
    }),
});

export const CreateSratch = () => {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            projectName: "",
        },
    });

    const {
        projectData: { createProject },
    } = useMobxStore();

    const onSubmit = async (data: z.infer<typeof FormSchema>) => {
        console.log("[SUBMIT]:", data);
        await createProject(data.projectName)
            .then(() => {
                toast.success("Project created successfully.");
            })
            .catch(() => {
                toast.error("Failed to create project.");
            });
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full space-y-6"
            >
                <FormField
                    control={form.control}
                    name="projectName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Project Name</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Project Name: Business Dashboard, ..."
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Create New</Button>
            </form>
        </Form>
    );
};
