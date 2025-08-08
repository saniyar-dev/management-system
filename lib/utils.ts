import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Selection } from "@heroui/react";

import { createClient } from "./supabase/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

export const supabase = createClient();

export function formatFilterParam(param: Selection): string[] {
  // If the parameter is the string 'all', return it wrapped in an array.
  if (param === "all") {
    return ["all"];
  }

  // If the parameter is a Set, convert it to an array.
  if (param instanceof Set) {
    return Array.from(param).map(String); // The spread syntax is a clean way to do this.
    // Alternatively: return Array.from(param);
  }

  // Optional: Handle cases where it might already be an array or is invalid.
  // This makes the function more robust.
  if (Array.isArray(param)) {
    return param; // It's already in the correct format.
  }

  // As a safe fallback, return ['all'] to prevent accidental filtering.
  console.warn("Unexpected filter param type. Defaulting to 'all'.", param);

  return ["all"];
}
