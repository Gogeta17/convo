
import { create } from 'zustand'

export const useThemeStore = create((set)=>({
    theme: localStorage.getItem("convo-theme") || "coffee",
    setTheme: (theme) => {
        localStorage.setItem("convo-theme", theme)
        set({ theme })}
}))