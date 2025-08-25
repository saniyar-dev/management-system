"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Autocomplete, AutocompleteItem } from "@heroui/react";
import { SelectOption } from "@/lib/action/crud-types";

interface SelectorProps {
  label?: string;
  name: string;
  placeholder?: string;
  isRequired?: boolean;
  options:  SelectOption[];
  onSelectionChange?: (selectedOption: SelectOption | null) => void;
}

export function PersianSelector({
  name =  "client",
  label = "انتخاب مشتری",
  placeholder = "نام مشتری را تایپ کنید یا انتخاب کنید...",
  isRequired = false,
  onSelectionChange,
  options,
}: SelectorProps) {
  const [isLoading, startTransition] = useTransition();
  const [selectedOption, setSelectedOption] = useState<SelectOption | null>(
    null,
  );

  const handleSelectionChange = (key: React.Key | null) => {
    if (key) {
      const option = options.find((c) => c.id.toString() === key.toString());

      if (option) {
        setSelectedOption(option);
        onSelectionChange?.(option);
      }
    } else {
      setSelectedOption(null);
      onSelectionChange?.(null);
    }
  };

  return (
    <>
      <Autocomplete
        allowsCustomValue={false}
        className="w-full"
        defaultItems={options}
        isLoading={isLoading}
        isRequired={isRequired}
        label={label}
        menuTrigger="input"
        placeholder={placeholder}
        selectedKey={selectedOption?.id.toString() || null}
        variant="bordered"
        onSelectionChange={handleSelectionChange}
      >
        {(option) => (
          <AutocompleteItem key={option.id}>{option.name}</AutocompleteItem>
        )}
      </Autocomplete>

      {/* Hidden inputs for form submission */}
      <input name={`${name}_id`} type="hidden" value={selectedOption?.id || ""} />
      <input
        name={`${name}`}
        type="hidden"
        value={selectedOption?.name || ""}
      />
      <input
        name={`${name}_label`}
        type="hidden"
        value={selectedOption?.label|| ""}
      />
    </>
  );
}
