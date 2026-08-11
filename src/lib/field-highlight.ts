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
    background: `${highlightColor}1a`,
    borderColor: highlightColor,
    boxShadow: `inset 3px 0 0 ${highlightColor}`,
  }
}
