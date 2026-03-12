"use client";

import { createContext, useContext, useState, useEffect } from "react";

type LayoutSlotContextValue = {
  slotContent: React.ReactNode;
  setSlotContent: (content: React.ReactNode) => void;
};

const LayoutSlotContext = createContext<LayoutSlotContextValue | null>(null);

export function LayoutSlotProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [slotContent, setSlotContent] = useState<React.ReactNode>(null);

  return (
    <LayoutSlotContext.Provider value={{ slotContent, setSlotContent }}>
      {children}
    </LayoutSlotContext.Provider>
  );
}

export function useLayoutSlot() {
  const ctx = useContext(LayoutSlotContext);
  if (!ctx)
    throw new Error("useLayoutSlot must be used within LayoutSlotProvider");
  return ctx;
}

export function SlotContent({ children }: { children: React.ReactNode }) {
  const { setSlotContent } = useLayoutSlot();

  useEffect(() => {
    setSlotContent(children);
    return () => setSlotContent(null);
  });

  return null;
}

export function LayoutSlot() {
  const { slotContent } = useLayoutSlot();
  return <>{slotContent}</>;
}
