import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { Controller } from "react-hook-form"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef(({ className, ...props }, ref) => (
    <SwitchPrimitives.Root
        className={cn(
            "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
            className
        )}
        {...props}
        ref={ref}>
        <SwitchPrimitives.Thumb
            className={cn(
                "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
            )} />
    </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

const FormSwitch = React.forwardRef(({ name, control, defaultValue = false, className, switchclassname, ...props }, ref) => (
    <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        render={({ field: { onChange, onBlur, value, ref } }) => (
            <Switch
                checked={value}
                onCheckedChange={onChange}
                onBlur={onBlur}
                ref={ref}
                className={className}
                switchclassname={switchclassname}
                {...props}
            />
        )}
    />
))
FormSwitch.displayName = "FormSwitch"

const LabeledFormSwitch = React.forwardRef(({ label, inline = false, name, required, errors, children, className, switchclassname, reversed = false, ...props }, ref) => {
    return <div className={cn('mb-4', className)}>
        {inline ? <div className="flex items-center justify-between mt-4">
            {!reversed ? (
                <>
                    <FormSwitch
                        name={name}
                        switchclassname={switchclassname}
                        {...props}
                    />
                    <label className="block font-medium text-sm text-gray-700 dark:text-gray-300 ml-2">
                        {label} {required && <span className="text-red-500">*</span>}
                    </label>
                </>
            ) : (
                <>
                    <label className="block font-medium text-sm text-gray-700 dark:text-gray-300 mr-2">
                        {label} {required && <span className="text-red-500">*</span>}
                    </label>
                    <FormSwitch
                        name={name}
                        switchclassname={switchclassname}
                        {...props}
                    />
                </>
            )}
        </div> :
            <>
                <label className="block font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
                <FormSwitch
                    name={name}
                    switchclassname={switchclassname}
                    {...props}
                />
                <p className="text-red-500 text-sm font-normal mt-2">
                    {errors && errors[name] && errors[name].message}
                </p>
            </>
        }
    </div >
})

LabeledFormSwitch.displayName = "LabeledFormSwitch"

export { Switch, FormSwitch, LabeledFormSwitch }
