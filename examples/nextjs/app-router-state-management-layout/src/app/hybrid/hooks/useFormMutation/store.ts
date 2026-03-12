import { create } from "zustand";

type Status = "idle" | "pending" | "success" | "error";

interface FormStore {
  status: Status;
  setStatus: (status: Status) => void;
}

export const useFormStore = create<FormStore>((set) => ({
  status: "idle",
  setStatus: (status) => set({ status }),
}));
