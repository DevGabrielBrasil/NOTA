"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type AppContextType = {
  dataVersion: number
  refreshData: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [dataVersion, setDataVersion] = useState(0)

  const refreshData = () => {
    setDataVersion((prev) => prev + 1)
  }

  return <AppContext.Provider value={{ dataVersion, refreshData }}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}
