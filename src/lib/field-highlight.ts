import type { CSSProperties } from 'react'

/** Purple 1100 — API import badge and field highlight (Megafirms) */
export const API_PURPLE_1100 = '#4A2291'

export function fieldInputHighlight(
  fieldPath: string,
  highlightedFields: string[],
  highlightColor: string,
): CSSProperties {
  if (!highlightColor || !highlightedFields.includes(fieldPath)) return {}
  return {
    borderColor: highlightColor,
    borderWidth: 2,
    borderStyle: 'solid',
  }
}
