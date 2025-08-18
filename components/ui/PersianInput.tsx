"use client";

import React, { useState, useEffect } from "react";
import { Input, InputProps } from "@heroui/react";
import { convertPersianToEnglish, convertEnglishToPersian } from "@/lib/utils/persian-validation";

interface PersianInputProps extends Omit<InputProps, 'onChange' | 'onValueChange'> {
  allowNumbers?: boolean;
  displayPersianNumbers?: boolean;
  onValueChange?: (value: string) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function PersianInput({
  allowNumbers = true,
  displayPersianNumbers = true,
  onValueChange,
  onChange,
  value: controlledValue,
  defaultValue,
  ...props
}: PersianInputProps) {
  const [displayValue, setDisplayValue] = useState(() => {
    const initialValue = controlledValue || defaultValue || '';
    return displayPersianNumbers && allowNumbers ? 
      convertEnglishToPersian(initialValue.toString()) : 
      initialValue.toString();
  });

  // Update display value when controlled value changes
  useEffect(() => {
    if (controlledValue !== undefined) {
      const newDisplayValue = displayPersianNumbers && allowNumbers ? 
        convertEnglishToPersian(controlledValue.toString()) : 
        controlledValue.toString();
      setDisplayValue(newDisplayValue);
    }
  }, [controlledValue, displayPersianNumbers, allowNumbers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    if (allowNumbers) {
      // Convert Persian numbers to English for internal processing
      const englishValue = convertPersianToEnglish(inputValue);
      
      // Update display value (show Persian numbers if enabled)
      const newDisplayValue = displayPersianNumbers ? 
        convertEnglishToPersian(englishValue) : 
        englishValue;
      
      setDisplayValue(newDisplayValue);
      
      // Create a new event with English numbers for form processing
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: englishValue
        }
      } as React.ChangeEvent<HTMLInputElement>;
      
      // Call callbacks with English numbers
      if (onValueChange) {
        onValueChange(englishValue);
      }
      if (onChange) {
        onChange(syntheticEvent);
      }
    } else {
      // No number conversion needed
      setDisplayValue(inputValue);
      if (onValueChange) {
        onValueChange(inputValue);
      }
      if (onChange) {
        onChange(e);
      }
    }
  };

  return (
    <Input
      {...props}
      value={displayValue}
      onChange={handleInputChange}
      dir="rtl"
      className={`text-right ${props.className || ''}`}
      classNames={{
        input: "text-right",
        inputWrapper: "text-right",
        ...props.classNames
      }}
    />
  );
}