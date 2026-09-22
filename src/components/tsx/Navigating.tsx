import { $navigating } from "@/lib/store/store"
import { useStore } from "@nanostores/react"

function Navigating() {
  const navigating = useStore($navigating)
  if (!navigating) {
    return null
  }

  return (
    <div className="animate-progress absolute -bottom-0.5 left-0 h-0.5 bg-blue-400 dark:bg-blue-600" />
  )
}

export default Navigating
