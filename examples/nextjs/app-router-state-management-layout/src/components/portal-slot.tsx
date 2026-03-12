"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { createPortal } from "react-dom";

const PortalSlotContext = createContext<string | null>(null);

export function PortalSlotProvider({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <PortalSlotContext.Provider value={id}>
      {children}
    </PortalSlotContext.Provider>
  );
}

export function PortalTarget({ id }: { id: string }) {
  return <div id={id} />;
}

export function PortalInject({ children }: { children: React.ReactNode }) {
  const id = useContext(PortalSlotContext);
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!id) return;
    const el = document.getElementById(id);
    if (el) setTarget(el);
  }, [id]);

  if (!target) return null;
  return createPortal(children, target);
}
