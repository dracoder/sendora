import * as React from "react"

import { cn } from "@/lib/utils"
import { Label } from "./label";

const Textarea = React.forwardRef(({ className, errors, ...props }, ref) => {
    return (
        <React.Fragment>
            <textarea
                className={cn(
                    "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                    className
                )}
                ref={ref}
                errors={errors}
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
Textarea.displayName = "Textarea"

const LabeledTextarea = React.forwardRef(({ label, divClassName, labelClassName, required, ...props }, ref) => {
    return (
        <div className={cn('grid gap-2', divClassName)}>
            {label && <Label className={cn('capitalize', labelClassName)}>{label}{required && <span className="text-red-500"> *</span>}</Label>}
            <Textarea ref={ref} {...props} />
        </div>
    )
});

export { Textarea, LabeledTextarea }
