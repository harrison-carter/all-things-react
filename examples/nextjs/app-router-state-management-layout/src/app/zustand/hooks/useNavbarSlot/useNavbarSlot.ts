"use client";

import { useEffect } from "react";
import { useNavbarSlotStore } from "./store";

type SlotType = "save-status" | "back-link" | "history-actions";

export function useNavbarSlot(type: SlotType) {
  const setSlotType = useNavbarSlotStore((s) => s.setSlotType);

  useEffect(() => {
    setSlotType(type);
    return () => setSlotType(null);
  }, [type, setSlotType]);
}
