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

import { AddOrder } from "@/lib/action/order";
import { PlusIcon } from "@/components/icons";
import { ClientSelector } from "@/components/ClientSelector";

// Main component that renders the button and modal
export function AddOrderComponent() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    try {
      const result = await AddOrder(formData);
      if (result.success) {
        onOpenChange();
        // Refresh the page to show new data
        window.location.reload();
      } else {
        console.error(result.message);
      }
    } catch (error) {
      console.error("خطا در ثبت سفارش:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button color="primary" endContent={<PlusIcon />} onPress={onOpen}>
        افزودن سفارش
      </Button>
      <AddOrderModal
        isOpen={isOpen}
        isLoading={isLoading}
        onOpenChange={onOpenChange}
        onSubmit={handleSubmit}
      />
    </>
  );
}

// Modal component
interface AddOrderModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onOpenChange: () => void;
  onSubmit: (formData: FormData) => void;
}

function AddOrderModal({
  isOpen,
  isLoading,
  onOpenChange,
  onSubmit,
}: AddOrderModalProps) {
  return (
    <Modal isOpen={isOpen} size="2xl" onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <form action={onSubmit}>
            <ModalHeader className="flex flex-col gap-1">
              افزودن سفارش جدید
            </ModalHeader>
            <ModalBody>
              <div className="grid grid-cols-1 gap-4">
                <ClientSelector
                  label="انتخاب مشتری"
                  placeholder="نام مشتری را تایپ کنید یا انتخاب کنید..."
                  isRequired
                />
                <Input
                  label="شناسه پیش سفارش (اختیاری)"
                  name="pre_order_id"
                  placeholder="در صورت تبدیل از پیش سفارش، شناسه را وارد کنید"
                  type="number"
                />
                <Textarea
                  isRequired
                  label="شرح سفارش"
                  name="description"
                  placeholder="توضیحات سفارش را وارد کنید"
                />
                <Input
                  isRequired
                  label="مبلغ کل (ریال)"
                  name="total_amount"
                  placeholder="مبلغ کل سفارش را وارد کنید"
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
                ثبت سفارش
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
}