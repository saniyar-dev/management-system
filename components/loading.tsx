"use client";

import { Spinner } from "@heroui/spinner";

export default function Loading({ pending }: { pending: boolean }) {
  if (pending) {
    return (
      <div className="w-screen h-screen flex items-center justify-center z-50 fixed bottom-0 right-0 backdrop-blur-xs bg-white/10">
        <Spinner size="lg" />
      </div>
    );
  }
}
