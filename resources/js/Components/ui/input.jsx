import * as React from "react"

import { cn } from "@/lib/utils"
import { Label } from "./label";

export const PHONE_REGULAR_EXPRESSION = /^(([+])39)?((3[1-6][0-9]))(\d{7})$/gm;

export const handlePhoneChange = (changeFunc) => (event) => {
    const phoneValue = event.target.value.replace(/\D/g, '');
    if (phoneValue.length > 10) {
        event.target.value = phoneValue.slice(0, 10).replace(PHONE_REGULAR_EXPRESSION, '($1) $2 $3');
        return;
    }
    event.target.value = phoneValue.replace(PHONE_REGULAR_EXPRESSION, '($1) $2 $3');
    changeFunc(event);
}

export const handleMaskedChange = (changeFunc, mask) => (event) => {
    switch (mask) {
        case 'phone':
            handlePhoneChange(changeFunc)(event);
            break;
        default:
            changeFunc(e);
            break;
    }
}

const Input = React.forwardRef(({ className, errors, onChange, mask, ...props }, ref) => {
    return (
        <React.Fragment>
            <input
                className={cn(
                    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                    className
                )}
                ref={ref}
                errors={errors}
                onChange={mask ? handleMaskedChange(onChange, mask) : onChange}
                {...props} />
            {
                errors && errors[props.name] && (
                    <p className="text-red-500 text-sm font-normal mt-2">
                        {errors[props.name].message || `${props.name.charAt(0).toUpperCase()}${props.name.slice(1)} is required.`}
                    </p>
                )
            }
        </React.Fragment>
    );
})
Input.displayName = "Input"

const LabeledInput = React.forwardRef(({ label, divClassName, labelClassName, required, helper = '', ...props }, ref) => {
    return (
        <div className={cn('grid gap-2', divClassName)}>
            {label && <Label className={cn('capitalize', labelClassName)}>{label}{required && <span className="text-red-500"> *</span>}</Label>}
            <Input ref={ref} {...props} />
            {helper && <span className="text-xs text-gray-500">{helper}</span>}
        </div>
    )
});

export { Input, LabeledInput }
