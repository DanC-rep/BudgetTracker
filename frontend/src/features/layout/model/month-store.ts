import { create } from 'zustand'

type MonthState = {
   month: Date
}

type MonthActions = {
   shiftMonth: (delta: number) => void
}

type MonthStore = MonthState & MonthActions

const initialState: MonthState = {
   month: new Date(),
}

/** Selected month from the header month switcher; consumed by dashboard queries */
export const useMonthStore = create<MonthStore>(set => ({
   ...initialState,

   shiftMonth: delta =>
      set(state => ({
         month: new Date(state.month.getFullYear(), state.month.getMonth() + delta, 1),
      })),
}))
