"use client";

import { useSearchParams } from "next/navigation";
import { createContext, useContext } from "react";

interface SessionContextType {
  sessionId: string | null;
}

const SessionContext = createContext<SessionContextType>({ sessionId: null });

export const useSession = () => useContext(SessionContext);

interface TableSessionWrapperProps {
  children: React.ReactNode;
}

export function TableSessionWrapper({ children }: TableSessionWrapperProps) {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session");

  return (
    <SessionContext.Provider value={{ sessionId }}>
      {children}
    </SessionContext.Provider>
  );
}