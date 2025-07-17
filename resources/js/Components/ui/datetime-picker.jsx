import React, { useEffect, useState } from "react"
import { setHours, setMinutes, format } from "date-fns";
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
import { LabeledInput } from "./input"

const DateTimePicker = React.forwardRef(({ label, labelClassName, divClassName, required, errors, onChange = () => { }, watch, ...props }, ref) => {
    const [calendarOpen, setCalendarOpen] = React.useState(false);
    const [date, setDate] = useState();
    const [timeValue, setTimeValue] = useState('');

    const handleTimeChange = (e) => {
        const time = e.target.value;
        console.log(time)
        if (!date) {
            setTimeValue(time);
            return;
        }
        const [hours, minutes] = time.split(":").map((str) => parseInt(str, 10));
        const newSelectedDate = setHours(setMinutes(date, minutes), hours);
        setDate(newSelectedDate);
        let _value = format(newSelectedDate, 'yyyy-MM-dd kk:mm:ss')
        onChange(_value);
        setTimeValue(time);
    };

    const handleChange = (value) => {
        if (!timeValue || !value) {
            console.log(timeValue, value)
            setDate(new Date(value));
            onChange(format(value, 'yyyy-MM-dd kk:mm:ss'));
            return;
        }
        const [hours, minutes] = timeValue
            .split(":")
            .map((str) => parseInt(str, 10));
        const newDate = new Date(
            value.getFullYear(),
            value.getMonth(),
            value.getDate(),
            hours,
            minutes
        );

        setDate(newDate);
        let _value = format(newDate, 'yyyy-MM-dd kk:mm:ss')
        onChange(_value);
        setCalendarOpen(false);
    }

    useEffect(() => {
        if (props.name && watch(props.name)) {
            let _date = watch(props.name);
            setDate(_date);
            setTimeValue(format(_date, 'kk:mm:ss'));
        }
    }, [props]);

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
                        {date ? format(date, "dd/MM/yyyy K:mma") : <span>Pick a date and time</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <LabeledInput divClassName="px-4 pt-2" label="Time" type="time" value={timeValue} onChange={handleTimeChange} />
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

export { DateTimePicker }
