import React, { useEffect, useState } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "./label"

const DatePicker = React.forwardRef(({ label, labelClassName, divClassName, required, errors, onChange = () => { }, watch, ...props }, ref) => {
    const [calendarOpen, setCalendarOpen] = React.useState(false);
    const [date, setDate] = useState();

    const handleChange = (value) => {
        let _value = format(value, 'yyyy-MM-dd')
        setDate(new Date(value));
        onChange(_value);
        setCalendarOpen(false);
    }

    useEffect(() => {
        if (props.name && watch(props.name)) {
            const dateValue = watch(props.name);
            // remove the time part
            const dateOnly = dateValue.split("T")[0];
            // in DB, only stores the date, not the time
            setDate(new Date(dateOnly + 'T00:00:00'));
        }
    }, []);

    return (
        <div className={cn("flex flex-col w-full gap-2", divClassName)} ref={ref}>
            {label && <Label className={cn('capitalize', labelClassName)}>{label}{required && <span className="text-red-500"> *</span>}</Label>}

            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "dd/MM/yyyy") : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="single"
                        selected={date}
                        required={required}
                        onSelect={handleChange}
                    />
                </PopoverContent>
            </Popover>
            {
                errors && errors[props.name] && (
                    <p className="text-red-500 text-sm font-normal mt-2">
                        {errors[props.name].message || `${props.name.charAt(0).toUpperCase()}${props.name.slice(1)} is required.`}
                    </p>
                )
            }
        </div >
    )
})

export { DatePicker }
