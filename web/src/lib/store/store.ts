import { persistentAtom } from "@nanostores/persistent"
import { atom } from "nanostores"

export const $theme = persistentAtom<string>("theme")

export const $navigating = atom(false)
