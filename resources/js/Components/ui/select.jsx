import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import debounce, { cn } from "@/lib/utils"
import { Label } from "./label"
import AsyncSelect from 'react-select/async';
import { Controller, useController } from "react-hook-form"
import ReactSelect, { components } from 'react-select';
import SelectOptionService from "@/Services/SelectOptionService"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
    <SelectPrimitive.Trigger
        ref={ref}
        className={cn(
            "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
            className
        )}
        {...props}>
        {children}
        <SelectPrimitive.Icon asChild>
            <ChevronDown className="h-4 w-4 opacity-50" />
        </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef(({ className, ...props }, ref) => (
    <SelectPrimitive.ScrollUpButton
        ref={ref}
        className={cn("flex cursor-default items-center justify-center py-1", className)}
        {...props}>
        <ChevronUp className="h-4 w-4" />
    </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef(({ className, ...props }, ref) => (
    <SelectPrimitive.ScrollDownButton
        ref={ref}
        className={cn("flex cursor-default items-center justify-center py-1", className)}
        {...props}>
        <ChevronDown className="h-4 w-4" />
    </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
    SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => (
    <SelectPrimitive.Portal>
        <SelectPrimitive.Content
            ref={ref}
            className={cn(
                "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
                position === "popper" &&
                "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
                className
            )}
            position={position}
            {...props}>
            <SelectScrollUpButton />
            <SelectPrimitive.Viewport
                className={cn("p-1", position === "popper" &&
                    "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]")}>
                {children}
            </SelectPrimitive.Viewport>
            <SelectScrollDownButton />
        </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef(({ className, ...props }, ref) => (
    <SelectPrimitive.Label
        ref={ref}
        className={cn("px-2 py-1.5 text-sm font-semibold", className)}
        {...props} />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item
        ref={ref}
        className={cn(
            "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
            className
        )}
        {...props}>
        <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
            <SelectPrimitive.ItemIndicator>
                <Check className="h-4 w-4" />
            </SelectPrimitive.ItemIndicator>
        </span>
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => (
    <SelectPrimitive.Separator
        ref={ref}
        className={cn("-mx-1 my-1 h-px bg-muted", className)}
        {...props} />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

const LabeledFormSelect = React.forwardRef(({ label, divClassName, labelClassName, required, className, options, name, errors, watch = null, ...props }, ref) => {
    return (
        <React.Fragment>
            <div className={cn('grid gap-2', divClassName)}>
                {label && <Label className={cn('capitalize', labelClassName)}>{label}{required && <span className="text-red-500"> *</span>}</Label>}
                <Select value={watch ? watch(name) : ''} className={className} errors={errors} name={name} onValueChange={(value) => props.onChange({ target: { name, value } })} required={required} {...props}>
                    <SelectTrigger ref={ref}>
                        {watch && <SelectValue aria-label={watch(name)}>
                            {options && options.find(option => option.value === watch(name))?.label}
                        </SelectValue>}
                    </SelectTrigger>
                    <SelectContent>
                        {options && options.map((option, index) => (
                            <SelectItem key={index} value={option.value}>{option.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {
                errors && errors[props.name] && (
                    <p className="text-red-500 text-sm font-normal mt-2">
                        {errors[props.name].message || `${props.name.charAt(0).toUpperCase()}${props.name.slice(1)} is required.`}
                    </p>
                )
            }
        </React.Fragment>
    );
});


// Common styles for inputs
const asyncInputStyles = {
    indicatorSeparator: () => ({ display: 'none' }),
    clearIndicator: (base) => ({ ...base, padding: '0px' }),
    dropdownIndicator: (base) => ({ ...base, padding: '0px' }),
    menuPortal: (base) => ({
        ...base,
        zIndex: 9999,
        height: '100%',
        width: '100%',
    }),
    control: (baseStyles, state) => ({ // input
        ...baseStyles,
        height: '80%',
        width: '100%',
        cursor: 'pointer',
        backgroundColor: 'hsl(var(--background))',
        borderColor: 'hsl(var(--input))',
        borderWidth: '1px',
        padding: '2px 3px',
        boxShadow: state.isFocused ? `0 0 0 1px hsl(var(--ring))` : 'none',
        '&:hover': {
            borderColor: 'hsl(var(--input))',
        },
        '&:disabled': {
            cursor: 'not-allowed',
            opacity: 0.5,
        }
    }),
    input: (base) => ({ // input
        ...base,
        color: 'hsl(var(--text))',
    }),
    singleValue: (base) => ({ // selected value
        ...base,
        color: 'hsl(var(--text))',
        fontSize: '0.875rem',
    }),
    multiValue: (base) => ({ // multi selected value
        ...base,
        backgroundColor: 'hsl(var(--border))',
    }),
    multiValueLabel: (base) => ({ // multi selected value label
        ...base,
        color: 'hsl(var(--text))',
        fontSize: '0.875rem',
    }),
    menu: (base) => ({ // popup do select
        ...base,
        backgroundColor: 'hsl(var(--background))',
        borderColor: 'hsl(var(--input))',
        borderWidth: '1px',
        zIndex: 9999
    }),
    option: (provided, state) => ({ // menu options
        ...provided,
        backgroundColor: state.isSelected
            ? 'hsl(var(--muted))'
            : state.isFocused
                ? 'hsl(var(--muted))'
                : provided.backgroundColor,
    }),
    placeholder: (defaultStyles) => ({
        ...defaultStyles,
        fontSize: '0.875rem',
    }),
};

/**
 * LabeledAsyncSelect based on react-select
 * @param {string} className
 * @param {object} control
 * @param {object} errors
 * @param {string} name
 * @param {string} label
 * @param {boolean} required
 * @param {string} placeholder
 * @param {boolean} preload - Preload options on component mount
 * @param {string} model - Model to fetch options from
 * @param {string} labelKey - Key to be used as value in the options e.g. { id: 1, name: 'This is a title' } => labelKey = 'title' - If necessary to concat id and label, you can use like CONCAT(first_name, ' ', last_name)
 * @param {array} concat - Concatenate fields e.g. id, it will return id and label as (id) - title if concat is not null
 * @param {array} searchKeys - Keys to be used for searching e.g. ['title', 'description']
 * @param {array} filters - Filters to be applied to the options e.g. { status: 'active' }
 * @param {string} orderBy - Key to order the options by
 * @param {string} order - Order of the options e.g. 'asc' or 'desc'
 * @param {boolean} isMulti - Enable multi select
 * @param {boolean} useSelectModel - Indicates that must use the selectOption function from Model instead of using the default one
 * @param {array} additionalOptions - Additional options to be added to the select
 * @param {string} inputClasses - Additional classes for the input
 * @param {boolean} displayArrow - Display arrow icon
 * @param {object} prefixIcon - Icon to be displayed before the input
 * @param {function} onChange - Function to be called on change
 * @param {array} hideIds - IDs to be hidden from the options
 * @param {object} styles - Custom styles for the select
 * @param {boolean} returnFullSelected - Return the full select object in the custom onChange function
 * @param {object} props
 */
const LabeledAsyncSelect = React.forwardRef(({ className, control, errors, name, label, required, placeholder, preload = false, model, labelKey = 'name', concat = [], searchKeys, filters, orderBy, order = 'asc', isMulti, additionalOptions = [], inputClasses = '', useSelectModel = false, displayArrow = true, prefixIcon = null, onChange, returnFullSelected, hideIds, styles = {}, scoped = [], helper = '', ...props }, ref) => {
    const [searchOptions, setSearchOptions] = React.useState([]);
    const memorizedSearchOptions = React.useMemo(() => searchOptions, [searchOptions]);

    const { field } = useController({
        name: name,
        control: control,
        rules: { required: required }
    });

    /**
     * Determines whether to fetch options by ID based on the current field value and memorized search options.
     * @returns {boolean} True if options should be fetched by ID, false otherwise.
     */
    const shouldFetchOptionsById = () => {
        if (!field.value) {
            return false;
        }

        if (!memorizedSearchOptions.length) {
            return true;
        }

        if (isMulti) {
            return field.value.some(value => !memorizedSearchOptions.find(option => option.value === value));
        }

        return !memorizedSearchOptions.find(option => option.value === field.value);
    }

    React.useEffect(() => {
        if (shouldFetchOptionsById()) {
            getById(field.value)
        }
    }, [field.value]);

    const getById = async (ids) => {
        try {
            let requestParams = {
                limit: 10,
                searchIds: JSON.stringify(isMulti ? ids : [ids]),
                labelKey,
                concat: JSON.stringify(concat),
                useSelectModel,
                filters: JSON.stringify(filters),
                scoped: scoped ? JSON.stringify(scoped) : null,
            };

            const data = await fetchData(requestParams);
            if (data.length > 0) {
                field.onChange(isMulti ? data.map(item => item.value) : data[0].value);
            }
            setSearchOptions(data);
        } catch (error) {
            console.error(error);
        }
    };

    const loadOptions = debounce(async (inputValue, callback) => {
        if (!preload) {
            return callback([]);
        }

        let requestParams = {
            limit: 10,
            labelKey,
            searchKeys: searchKeys?.join(','),
            search: inputValue,
            orderBy: orderBy ?? 'id',
            order,
            filters: JSON.stringify(filters),
            concat: JSON.stringify(concat),
            useSelectModel,
            hideIds: hideIds?.join(','),
            scoped: scoped ? JSON.stringify(scoped) : null,
        };

        try {
            const data = await fetchData(requestParams);

            callback(data);
            setSearchOptions(prevOptions => {
                const updatedOptions = [...new Map([...prevOptions, ...data].map(item => [item.value, item])).values()];
                return updatedOptions;
            });
        } catch (error) {
            console.error(error);
            callback([]);
        }
    }, 500);

    const fetchData = async (requestParams) => {
        const response = await SelectOptionService.fetch(model, requestParams);

        const formattedOptions = response.data?.map(item => ({
            value: item.value,
            label: item.label,
        }));

        if (additionalOptions.length > 0) {
            formattedOptions.unshift(...additionalOptions);
        }

        return formattedOptions;
    };

    const noOptionMessage = (e) => {
        let message = 'No results found';

        return message;
    }

    return (
        <div className={cn("mb-4", className)}>
            {label && <label className="block font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>}
            <AsyncSelect
                {...field}
                components={{
                    IndicatorSeparator: () => null,
                    DropdownIndicator: displayArrow ? components.DropdownIndicator : () => null,
                    Placeholder: ({ children, ...props }) => {
                        return <components.Placeholder {...props} className='flex flex-row items-center gap-2'>{prefixIcon} {children}</components.Placeholder>
                    },
                    SingleValue: ({ children, ...props }) => {
                        return <components.SingleValue {...props} className='flex flex-row items-center gap-2'>{prefixIcon} {children}</components.SingleValue>
                    }
                }}
                className={inputClasses}
                ref={ref}
                defaultOptions={true}
                loadOptions={loadOptions}
                cacheOptions
                isClearable
                isSearchable
                placeholder={placeholder}
                noOptionsMessage={(e) => noOptionMessage(e)}
                styles={{ ...asyncInputStyles, ...styles }}
                value={
                    isMulti ?
                        memorizedSearchOptions.filter(option => field.value?.includes(option.value)) :
                        memorizedSearchOptions?.find(option => option.value === field.value) || null}
                onChange={(selectedOption) => {
                    if (selectedOption?.length === 0) {
                        field.onChange(null);
                        return;
                    }
                    field.onChange(isMulti ? selectedOption.map(option => option.value) : selectedOption ? selectedOption.value : null);

                    onChange && onChange(isMulti ? selectedOption.map(option => option.value) : !selectedOption ? null : returnFullSelected ? selectedOption : selectedOption.value);
                }}
                {...props}
                isMulti={isMulti}
            />
            {helper && <small className="text-gray-700">{helper}</small>}
            {
                errors && errors[name] && <p className="text-red-500 text-sm font-normal mt-2">
                    {errors[name].message || `${name.charAt(0).toUpperCase()}${name.slice(1)} is required`}
                </p>
            }
        </div>
    );
});

const SearchableSelect = React.forwardRef(({ label, divClassName, labelClassName, required, className, options, name, errors, watch = null, control, isMulti = false, ...props }, ref) => {
    const CustomOption = (props) => {
        return (
            <components.Option {...props}>
                {props.label}
            </components.Option>
        );
    };

    const CustomSingleValue = (props) => {
        return (
            <components.SingleValue {...props}>
                {props.children}
            </components.SingleValue>
        );
    };
    return (
        <div className={cn('grid gap-2', divClassName)}>
            {label && <Label className={cn('capitalize', labelClassName)}>{label}{required && <span className="text-red-500"> *</span>}</Label>}
            <Controller
                control={control}
                name={name}
                rules={{ required: required, ...props.rules }}
                render={({ field }) => (
                    <ReactSelect
                        ref={field.ref}
                        {...field}
                        components={{ Option: CustomOption, SingleValue: CustomSingleValue }}
                        className={className}
                        styles={{
                            ...asyncInputStyles,
                            placeholder: (defaultStyles) => ({
                                ...defaultStyles,
                                fontSize: '0.875rem',
                                lineHeight: '1.25rem',
                                fontWeight: '400',
                            }),
                            menuPortal: (base) => ({ ...base, zIndex: 9999 }), // Ensure dropdown is above modal
                            clearIndicator: () => ({ display: 'none' }),
                        }}
                        maxMenuHeight={200}
                        options={options}
                        isSearchable
                        isMulti={isMulti}
                        value={watch ? watch(name) : ''}
                        errors={errors}
                        name={name}
                        required={required}
                        {...props}
                    />
                )}
            />
            {
                errors && errors[props.name] && (
                    <p className="text-red-500 text-sm font-normal mt-2">
                        {errors[props.name].message || `${props.name.charAt(0).toUpperCase()}${props.name.slice(1)} is required.`}
                    </p>
                )
            }
        </div>
    );
});


export {
    Select,
    SelectGroup,
    SelectValue,
    SelectTrigger,
    SelectContent,
    SelectLabel,
    SelectItem,
    SelectSeparator,
    SelectScrollUpButton,
    SelectScrollDownButton,
    LabeledFormSelect,
    LabeledAsyncSelect,
    SearchableSelect
}
