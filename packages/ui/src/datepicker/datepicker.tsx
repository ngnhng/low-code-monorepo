"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "../lib/utils";
import { Button } from "../button";
import { Calendar } from "../calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";

export function DatePicker({ onChange }: { onChange?: any }) {
    const [date, setDate] = React.useState<Date>();

    const handleChange = (value?: Date) => {
        setDate(value);
        if (!onChange) return;
        if (value) onChange(format(value, "yyyy-MM-dd"));
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleChange}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
}
