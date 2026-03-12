"use client";

import { createContext, useContext } from "react";
import { useMutation } from "@tanstack/react-query";
import { submitForm, type FormData } from "@/lib/api";

type FormContextValue = {
  status: "idle" | "pending" | "success" | "error";
  submit: (data: FormData) => void;
  reset: () => void;
};

const PortalFormContext = createContext<FormContextValue | null>(null);

export function PortalFormContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const mutation = useMutation({
    mutationFn: submitForm,
  });

  return (
    <PortalFormContext.Provider
      value={{
        status: mutation.status,
        submit: mutation.mutate,
        reset: mutation.reset,
      }}
    >
      {children}
    </PortalFormContext.Provider>
  );
}

export function usePortalFormContext() {
  const ctx = useContext(PortalFormContext);
  if (!ctx)
    throw new Error(
      "usePortalFormContext must be used within PortalFormContextProvider"
    );
  return ctx;
}
