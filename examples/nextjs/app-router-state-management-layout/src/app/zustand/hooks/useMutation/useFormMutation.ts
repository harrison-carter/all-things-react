"use client";

import { useMutation } from "@tanstack/react-query";
import { submitForm } from "@/lib/api";
import { useFormStore } from "./store";
import { useEffect } from "react";

export function useFormMutation() {
  const setStatus = useFormStore((s) => s.setStatus);

  const mutation = useMutation({
    mutationFn: submitForm,
  });

  useEffect(() => {
    setStatus(mutation.status);
  }, [mutation.status, setStatus]);

  return mutation;
}
