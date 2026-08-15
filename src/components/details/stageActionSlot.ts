import { createContext, useContext } from 'react'

/**
 * Element in the work bar that stage workspaces render their buttons into, so every
 * actionable button sits in the same row as the Auto Sourcing / Auto Tender button.
 * Null outside the case shell, where each stage keeps its own bar.
 */
const StageActionSlot = createContext<HTMLElement | null>(null)

export const StageActionSlotProvider = StageActionSlot.Provider
export const useStageActionSlot = () => useContext(StageActionSlot)
