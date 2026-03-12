"use client";

import { createContext, useContext } from "react";
import { useMutation } from "@tanstack/react-query";
import { submitForm, type FormData } from "@/lib/api";

type FormContextValue = {
  status: "idle" | "pending" | "success" | "error";
  submit: (data: FormData) => void;
  reset: () => void;
};

const FormContext = createContext<FormContextValue | null>(null);

export function FormContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const mutation = useMutation({
    mutationFn: submitForm,
  });

  return (
    <FormContext.Provider
      value={{
        status: mutation.status,
        submit: mutation.mutate,
        reset: mutation.reset,
      }}
    >
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext() {
  const ctx = useContext(FormContext);
  if (!ctx) throw new Error("useFormContext must be used within FormContextProvider");
  return ctx;
}
