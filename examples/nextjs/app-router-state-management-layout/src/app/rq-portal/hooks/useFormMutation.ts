"use client";

import { useMutation } from "@tanstack/react-query";
import { submitForm } from "@/lib/api";

export const FORM_MUTATION_KEY = ["submit-form"] as const;

export function useFormMutation() {
  return useMutation({
    mutationKey: FORM_MUTATION_KEY,
    mutationFn: submitForm,
  });
}
