"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Autocomplete, AutocompleteItem } from "@heroui/react";
import { GetAllClientNames, ClientOption } from "@/lib/action/client-search";

interface ClientSelectorProps {
    label?: string;
    placeholder?: string;
    isRequired?: boolean;
    onSelectionChange?: (clientId: number | null, clientName: string | null) => void;
}

export function ClientSelector({
    label = "انتخاب مشتری",
    placeholder = "نام مشتری را تایپ کنید یا انتخاب کنید...",
    isRequired = false,
    onSelectionChange,
}: ClientSelectorProps) {
    const [clients, setClients] = useState<ClientOption[]>([]);
    const [isLoading, startTransition] = useTransition()
    const [selectedClient, setSelectedClient] = useState<ClientOption | null>(null);

    useEffect(() => {
        startTransition(async () => {
            const response = await GetAllClientNames();
            if (response.success && response.data) {
                setClients(response.data);
            }
            console.log("from component")
            console.log(response)
            console.log(clients)
        });
    }, []);

    const handleSelectionChange = (key: React.Key | null) => {
        if (key) {
            const client = clients.find(c => c.id.toString() === key.toString());
            if (client) {
                setSelectedClient(client);
                onSelectionChange?.(client.id, client.name);
            }
        } else {
            setSelectedClient(null);
            onSelectionChange?.(null, null);
        }
    };

    return (
        <>
            <Autocomplete
                label={label}
                placeholder={placeholder}
                isRequired={isRequired}
                isLoading={isLoading}
                selectedKey={selectedClient?.id.toString() || null}
                onSelectionChange={handleSelectionChange}
                className="w-full"
                variant="bordered"
                allowsCustomValue={false}
                menuTrigger="input"
                defaultItems={clients}
            >
            {(client) => <AutocompleteItem key={client.id}>{client.name}</AutocompleteItem>}
            </Autocomplete>

            {/* Hidden inputs for form submission */}
            <input
                type="hidden"
                name="client_id"
                value={selectedClient?.id || ""}
            />
            <input
                type="hidden"
                name="client_name"
                value={selectedClient?.name || ""}
            />
        </>
    );
}