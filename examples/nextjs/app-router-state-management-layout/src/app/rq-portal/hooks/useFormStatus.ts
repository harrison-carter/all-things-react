"use client";

import { useMutationState } from "@tanstack/react-query";
import { FORM_MUTATION_KEY } from "./useFormMutation";

type Status = "idle" | "pending" | "success" | "error";

export function useFormStatus(): Status {
  const statuses = useMutationState({
    filters: { mutationKey: [...FORM_MUTATION_KEY] },
    select: (mutation) => mutation.state.status as Status,
  });

  return statuses[statuses.length - 1] ?? "idle";
}
