import React, { useState, useEffect } from "react";
import AsyncSelect from 'react-select/async';
import { Controller } from "react-hook-form";
import { Label } from "./label";
import { cn } from "@/lib/utils";
import SelectOptionService from "@/Services/SelectOptionService";

export function CustomAsyncSelect({ 
  label, 
  labelClassName, 
  divClassName, 
  required, 
  errors, 
  control, 
  name,
  model,
  defaultValue,
  isMulti = false,
  placeholder,
  helper,
  className,
  ...props 
}) {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load options from the API
  const loadOptions = async (inputValue) => {
    setIsLoading(true);
    try {
      const params = {
        limit: props.limit || 10,
        search: inputValue,
        searchKeys: props.searchKeys || 'name',
        ...(props.filters && { filters: props.filters }),
        ...(props.scoped && { scoped: props.scoped })
      };

      const response = await SelectOptionService.fetch(model, params);
      
      if (response && response.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error loading options:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Load selected options by IDs
  const loadSelectedOptions = async (ids) => {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      setSelectedOptions([]);
      return;
    }

    setIsLoading(true);
    try {
      const params = {
        searchIds: ids,
        limit: 100
      };

      const response = await SelectOptionService.fetch(model, params);
      
      if (response && response.data && Array.isArray(response.data)) {
        setSelectedOptions(response.data);
      } else {
        setSelectedOptions([]);
      }
    } catch (error) {
      console.error('Error loading selected options:', error);
      setSelectedOptions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle initial value loading
  useEffect(() => {
    if (control && name) {
      const value = control._getWatch ? control._getWatch(name) : control._defaultValues[name];
      if (value) {
        const ids = isMulti 
          ? (Array.isArray(value) ? value : []) 
          : (value ? [value] : []);
        
        if (ids.length > 0) {
          loadSelectedOptions(ids);
        }
      }
    }
  }, [control, name, isMulti]);

  // Handle value change
  const handleChange = (selected, onChange) => {
    if (isMulti) {
      const values = selected ? selected.map(option => option.value) : [];
      onChange(values);
      setSelectedOptions(selected || []);
    } else {
      onChange(selected ? selected.value : null);
      setSelectedOptions(selected ? [selected] : []);
    }
  };

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: errors && errors[name] ? 'rgb(239, 68, 68)' : provided.borderColor,
      boxShadow: state.isFocused ? '0 0 0 1px var(--ring)' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? 'var(--ring)' : provided.borderColor,
      },
      minHeight: '36px',
      backgroundColor: 'hsl(var(--background))',
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 50,
      backgroundColor: 'hsl(var(--background))',
      borderRadius: '0.375rem',
      border: '1px solid hsl(var(--border))',
      boxShadow: 'var(--shadow)',
    }),
    menuList: (provided) => ({
      ...provided,
      backgroundColor: 'hsl(var(--background))',
      padding: '4px',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? 'hsl(var(--primary))' 
        : state.isFocused 
          ? 'hsl(var(--accent))' 
          : 'hsl(var(--background))',
      color: state.isSelected ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
      cursor: 'pointer',
      fontSize: '0.875rem',
      padding: '0.5rem 0.75rem',
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: 'hsl(var(--accent))',
      borderRadius: '0.25rem',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: 'hsl(var(--foreground))',
      fontSize: '0.75rem',
      padding: '0.125rem 0.25rem',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: 'hsl(var(--foreground))',
      '&:hover': {
        backgroundColor: 'hsl(var(--destructive))',
        color: 'hsl(var(--destructive-foreground))',
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: 'hsl(var(--muted-foreground))',
      fontSize: '0.875rem',
    }),
    input: (provided) => ({
      ...provided,
      color: 'hsl(var(--foreground))',
      fontSize: '0.875rem',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'hsl(var(--foreground))',
      fontSize: '0.875rem',
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: '0.25rem 0.75rem',
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      height: '36px',
    }),
  };

  return (
    <div className={cn("flex flex-col w-full gap-2 mb-4", divClassName, className)}>
      {label && (
        <Label className={cn('capitalize', labelClassName)}>
          {label}{required && <span className="text-red-500"> *</span>}
        </Label>
      )}
      
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <AsyncSelect
            {...props}
            isMulti={isMulti}
            cacheOptions
            defaultOptions
            loadOptions={loadOptions}
            value={isMulti 
              ? selectedOptions 
              : (selectedOptions.length > 0 ? selectedOptions[0] : null)
            }
            onChange={(selected) => handleChange(selected, field.onChange)}
            onBlur={field.onBlur}
            isLoading={isLoading}
            placeholder={placeholder || "Select..."}
            styles={customStyles}
            classNamePrefix="custom-select"
            className={cn(
              "custom-select-container",
              errors && errors[name] && "custom-select-error"
            )}
          />
        )}
      />
      
      {helper && (
        <p className="text-sm text-muted-foreground mt-1">{helper}</p>
      )}
      
      {errors && errors[name] && (
        <p className="text-red-500 text-sm font-normal mt-1">
          {errors[name].message || `${name.charAt(0).toUpperCase()}${name.slice(1)} is required.`}
        </p>
      )}
    </div>
  );
}

export function CustomSelect({ 
  label, 
  labelClassName, 
  divClassName, 
  required, 
  errors, 
  control, 
  name,
  options = [],
  isMulti = false,
  placeholder,
  helper,
  className,
  ...props 
}) {
  const safeOptions = Array.isArray(options) ? options : [];
  
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: errors && errors[name] ? 'rgb(239, 68, 68)' : provided.borderColor,
      boxShadow: state.isFocused ? '0 0 0 1px var(--ring)' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? 'var(--ring)' : provided.borderColor,
      },
      minHeight: '36px',
      backgroundColor: 'hsl(var(--background))',
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 50,
      backgroundColor: 'hsl(var(--background))',
      borderRadius: '0.375rem',
      border: '1px solid hsl(var(--border))',
      boxShadow: 'var(--shadow)',
    }),
    menuList: (provided) => ({
      ...provided,
      backgroundColor: 'hsl(var(--background))',
      padding: '4px',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? 'hsl(var(--primary))' 
        : state.isFocused 
          ? 'hsl(var(--accent))' 
          : 'hsl(var(--background))',
      color: state.isSelected ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
      cursor: 'pointer',
      fontSize: '0.875rem',
      padding: '0.5rem 0.75rem',
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: 'hsl(var(--accent))',
      borderRadius: '0.25rem',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: 'hsl(var(--foreground))',
      fontSize: '0.75rem',
      padding: '0.125rem 0.25rem',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: 'hsl(var(--foreground))',
      '&:hover': {
        backgroundColor: 'hsl(var(--destructive))',
        color: 'hsl(var(--destructive-foreground))',
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: 'hsl(var(--muted-foreground))',
      fontSize: '0.875rem',
    }),
    input: (provided) => ({
      ...provided,
      color: 'hsl(var(--foreground))',
      fontSize: '0.875rem',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'hsl(var(--foreground))',
      fontSize: '0.875rem',
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: '0.25rem 0.75rem',
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      height: '36px',
    }),
  };
  
  return (
    <div className={cn("flex flex-col w-full gap-2 mb-4", divClassName, className)}>
      {label && (
        <Label className={cn('capitalize', labelClassName)}>
          {label}{required && <span className="text-red-500"> *</span>}
        </Label>
      )}
      
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          // Find selected option(s)
          const getValue = () => {
            if (isMulti) {
              if (!field.value || !Array.isArray(field.value)) return [];
              return safeOptions.filter(option => 
                field.value.includes(option.value)
              );
            }
            
            return safeOptions.find(option => option.value === field.value) || null;
          };
          
          return (
            <AsyncSelect
              {...props}
              isMulti={isMulti}
              options={safeOptions}
              value={getValue()}
              onChange={(selected) => {
                if (isMulti) {
                  const values = selected ? selected.map(option => option.value) : [];
                  field.onChange(values);
                } else {
                  field.onChange(selected ? selected.value : null);
                }
              }}
              onBlur={field.onBlur}
              placeholder={placeholder || "Select..."}
              styles={customStyles}
              classNamePrefix="custom-select"
              className={cn(
                "custom-select-container",
                errors && errors[name] && "custom-select-error"
              )}
            />
          );
        }}
      />
      
      {helper && (
        <p className="text-sm text-muted-foreground mt-1">{helper}</p>
      )}
      
      {errors && errors[name] && (
        <p className="text-red-500 text-sm font-normal mt-1">
          {errors[name].message || `${name.charAt(0).toUpperCase()}${name.slice(1)} is required.`}
        </p>
      )}
    </div>
  );
}