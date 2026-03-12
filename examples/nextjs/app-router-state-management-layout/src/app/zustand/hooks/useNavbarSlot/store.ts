import { create } from "zustand";

type SlotType = "save-status" | "back-link" | "history-actions" | null;

interface NavbarSlotStore {
  slotType: SlotType;
  setSlotType: (type: SlotType) => void;
}

export const useNavbarSlotStore = create<NavbarSlotStore>((set) => ({
  slotType: null,
  setSlotType: (slotType) => set({ slotType }),
}));
