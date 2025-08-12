"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Autocomplete, AutocompleteItem } from "@heroui/react";

import { GetAllClientNames, ClientOption } from "@/lib/action/client-search";

interface ClientSelectorProps {
  label?: string;
  placeholder?: string;
  isRequired?: boolean;
  onSelectionChange?: (
    clientId: string | null,
    clientName: string | null,
    clientType: string | null,
  ) => void;
}

export function ClientSelector({
  label = "انتخاب مشتری",
  placeholder = "نام مشتری را تایپ کنید یا انتخاب کنید...",
  isRequired = false,
  onSelectionChange,
}: ClientSelectorProps) {
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [isLoading, startTransition] = useTransition();
  const [selectedClient, setSelectedClient] = useState<ClientOption | null>(
    null,
  );

  useEffect(() => {
    startTransition(async () => {
      const response = await GetAllClientNames();

      if (response.success && response.data) {
        setClients(response.data);
      }
    });
  }, []);

  const handleSelectionChange = (key: React.Key | null) => {
    if (key) {
      const client = clients.find((c) => c.id.toString() === key.toString());

      if (client) {
        setSelectedClient(client);
        onSelectionChange?.(client.id, client.name, client.type);
      }
    } else {
      setSelectedClient(null);
      onSelectionChange?.(null, null, null);
    }
  };

  return (
    <>
      <Autocomplete
        allowsCustomValue={false}
        className="w-full"
        defaultItems={clients}
        isLoading={isLoading}
        isRequired={isRequired}
        label={label}
        menuTrigger="input"
        placeholder={placeholder}
        selectedKey={selectedClient?.id.toString() || null}
        variant="bordered"
        onSelectionChange={handleSelectionChange}
      >
        {(client) => (
          <AutocompleteItem key={client.id}>{client.name}</AutocompleteItem>
        )}
      </Autocomplete>

      {/* Hidden inputs for form submission */}
      <input name="client_id" type="hidden" value={selectedClient?.id || ""} />
      <input
        name="client_name"
        type="hidden"
        value={selectedClient?.name || ""}
      />
      <input
        name="client_type"
        type="hidden"
        value={selectedClient?.type || ""}
      />
    </>
  );
}
