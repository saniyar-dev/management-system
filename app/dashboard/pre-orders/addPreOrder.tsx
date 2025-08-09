"use client";

import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  useDisclosure,
} from "@heroui/react";

import { AddPreOrder } from "@/lib/action/pre-order";
import { PlusIcon } from "@/components/icons";
import { ClientSelector } from "@/components/ClientSelector";

// Main component that renders the button and modal
export function AddPreOrderComponent() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    try {
      const result = await AddPreOrder(formData);
      if (result.success) {
        onOpenChange();
        // Refresh the page to show new data
        window.location.reload();
      } else {
        console.error(result.message);
      }
    } catch (error) {
      console.error("خطا در ثبت پیش سفارش:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button color="primary" endContent={<PlusIcon />} onPress={onOpen}>
        افزودن پیش سفارش
      </Button>
      <AddPreOrderModal
        isOpen={isOpen}
        isLoading={isLoading}
        onOpenChange={onOpenChange}
        onSubmit={handleSubmit}
      />
    </>
  );
}

// Modal component
interface AddPreOrderModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onOpenChange: () => void;
  onSubmit: (formData: FormData) => void;
}

function AddPreOrderModal({
  isOpen,
  isLoading,
  onOpenChange,
  onSubmit,
}: AddPreOrderModalProps) {
  return (
    <Modal isOpen={isOpen} size="2xl" onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <form action={onSubmit}>
            <ModalHeader className="flex flex-col gap-1">
              افزودن پیش سفارش جدید
            </ModalHeader>
            <ModalBody>
              <div className="grid grid-cols-1 gap-4">
                <ClientSelector
                  label="انتخاب مشتری"
                  placeholder="نام مشتری را تایپ کنید یا انتخاب کنید..."
                  isRequired
                />
                <Textarea
                  isRequired
                  label="شرح پیش سفارش"
                  name="description"
                  placeholder="توضیحات پیش سفارش را وارد کنید"
                />
                <Input
                  isRequired
                  label="مبلغ تخمینی (ریال)"
                  name="estimated_amount"
                  placeholder="مبلغ تخمینی را وارد کنید"
                  type="number"
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                لغو
              </Button>
              <Button
                color="primary"
                isLoading={isLoading}
                type="submit"
              >
                ثبت پیش سفارش
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
}