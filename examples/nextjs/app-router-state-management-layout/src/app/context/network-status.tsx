"use client";

import { NetworkStatusDisplay } from "@/components/network-status-display";
import { useFormContext } from "./form-context";

export function ContextNetworkStatus() {
  const { status } = useFormContext();
  return <NetworkStatusDisplay status={status} />;
}
