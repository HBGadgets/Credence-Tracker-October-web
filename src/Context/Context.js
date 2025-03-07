
import { createContext, useEffect, useState } from 'react'

export const GlobalContext = createContext(null)

export default function GlobalState({ children }) {
 
  return (
    <GlobalContext.Provider value={{}}>
      {children}
    </GlobalContext.Provider>
  )
}
