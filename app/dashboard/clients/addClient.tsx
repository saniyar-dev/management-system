"use client";

import React from "react";
import { Card, CardFooter, Image } from "@heroui/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  useDraggable,
  Input,
} from "@heroui/react";
import { PlusIcon, MailIcon, LockIcon } from "@/components/icons";
import JobsComponent from "./jobs";

export function AddClientComponent() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const targetRef = React.useRef(null);
  const { moveProps } = useDraggable({
    targetRef,
    canOverflow: true,
    isDisabled: !isOpen,
  });

  const submit = (formData: FormData) => {
    const phone = formData.get("phone");
    const name = formData.get("name");

    console.log(phone, name);
  };

  return (
    <>
      <Button color="primary" endContent={<PlusIcon />} onPress={onOpen}>
        ایجاد مشتری جدید
      </Button>
      <Modal
        ref={targetRef}
        isOpen={isOpen}
        size="5xl"
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader {...moveProps} className="flex flex-col gap-1">
                ایجاد مشتری جدید
              </ModalHeader>
              <section className="flex justify-between py-6">
                <form action={submit} className="w-xl">
                  <ModalBody>
                    <Input
                      label="نام و نام خاوادگی"
                      id="name"
                      name="name"
                      placeholder="نام مشتری"
                      variant="bordered"
                    />
                    <Input
                      label="شماره موبایل"
                      id="phone"
                      name="phone"
                      placeholder="09900790244"
                      variant="bordered"
                    />
                  </ModalBody>
                  <ModalFooter>
                    <Button color="danger" variant="flat" onPress={onClose}>
                      بستن
                    </Button>
                    <Button color="primary" type="submit">
                      ثبت
                    </Button>
                  </ModalFooter>
                </form>
                <section className="flex flex-col px-6">
                  <JobsComponent />
                </section>
              </section>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
