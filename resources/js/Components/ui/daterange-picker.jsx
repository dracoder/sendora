import React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { useController } from "react-hook-form"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "./label"

const DateRangePicker = React.forwardRef(({ label, labelClassName, divClassName, required, errors, onChange = () => { }, ...props }, ref) => {
    const [calendarOpen, setCalendarOpen] = React.useState(false);
    const [countChanged, setCountChanged] = React.useState(1);

    const { field } = useController({
        name: props.name,
        control: props.control,
        rules: { required: true },
    });

    const handleChange = (value) => {
        const { from, to } = value
        field.onChange({ from, to })

        onChange(value, props.name); // onChange to send the value to the Datatable component

        // This is a hack to close the calendar after selecting the date range
        setCountChanged(countChanged + 1)
        if (countChanged === 2) {
            setCountChanged(1)
        }

        if (countChanged === 2 && (from !== undefined && to !== undefined)) {
            setCalendarOpen(false);
        }
    }

    const getFromDateString = () => {
        if (!field.value || !field.value.from) return 'From';
        let _return;
        try {
            _return = format(field.value.from, 'dd/MM/yyyy');
        } catch (error) {
            let date = new Date(field.value.from)
            _return = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear()
        }
        return _return
    }

    const getToDateString = () => {
        if (!field.value || !field.value.to) return 'To';
        let _return;
        try {
            _return = format(field.value.to, 'dd/MM/yyyy');
        } catch (error) {
            let date = new Date(field.value.to)
            _return = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear()
        }
        return _return
    }

    return (
        <div className={cn("flex flex-col w-full gap-2", divClassName)} ref={ref}>
            {label && <Label className={cn('capitalize', labelClassName)}>{label}{required && <span className="text-red-500"> *</span>}</Label>}

            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            "w-full justify-start text-left font-normal",
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        <span>{getFromDateString()} - {getToDateString()}</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        required={required}
                        numberOfMonths={2}
                        defaultMonth={field.value?.from}
                        selected={field.value}
                        onSelect={handleChange}
                        value={field.value}
                        name={field.name}
                        inputRef={field.ref}
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

export { DateRangePicker }
