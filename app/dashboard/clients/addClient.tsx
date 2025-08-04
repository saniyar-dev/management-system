"use client";

import React from "react";
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
  Link,
  Checkbox,
} from "@heroui/react";
import { PlusIcon, MailIcon, LockIcon } from "@/components/icons";

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
      <Modal ref={targetRef} isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader {...moveProps} className="flex flex-col gap-1">
                ایجاد مشتری جدید
              </ModalHeader>
              <form action={submit}>
                <ModalBody>
                  <Input
                    endContent={
                      <MailIcon className="text-2xl text-default-400 pointer-events-none shrink-0" />
                    }
                    label="نام و نام خاوادگی"
                    id="name"
                    name="name"
                    placeholder="نام مشتری"
                    variant="bordered"
                  />
                  <Input
                    endContent={
                      <LockIcon className="text-2xl text-default-400 pointer-events-none shrink-0" />
                    }
                    label="شماره موبایل"
                    id="phone"
                    name="phone"
                    placeholder="09900790244"
                    variant="bordered"
                  />
                  <div className="flex py-2 px-1 justify-between">
                    <Checkbox
                      classNames={{
                        label: "text-small",
                      }}
                    >
                      Remember me
                    </Checkbox>
                    <Link color="primary" href="#" size="sm">
                      Forgot password?
                    </Link>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="flat" onPress={onClose}>
                    Close
                  </Button>
                  <Button color="primary" type="submit">
                    Sign in
                  </Button>
                </ModalFooter>
              </form>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
