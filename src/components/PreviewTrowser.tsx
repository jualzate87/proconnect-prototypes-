import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Version } from '../types'
import { AppContext, AppContextType } from '../lib/store'
import { useAppContext } from '../index'
import Income from './InputScreens/Income'
import Invest from './InputScreens/Invest'
import Interest from './InputScreens/Interest'
import Others from './InputScreens/Others'
import Dispositions from './InputScreens/Dispositions'
import K1s from './InputScreens/K1s'
import type { ScreenName } from '../types'

interface PreviewTrowserProps {
  version: Version
  onClose: () => void
}

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleDateString([], {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function getPrimarySection(fields: string[]): ScreenName {
  const counts: Record<string, number> = {}
  for (const f of fields) {
    const key = f.split('.')[0]
    counts[key] = (counts[key] || 0) + 1
  }
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0]
  const map: Record<string, ScreenName> = {
    income: 'income', interest: 'interest', investment: 'invest',
    invest: 'invest', other: 'others', others: 'others',
    dispositions: 'dispositions', k1s: 'k1s',
  }
  return map[top] ?? 'income'
}


function ScreenForSection({ screen }: { screen: ScreenName }) {
  switch (screen) {
    case 'income':       return <Income />
    case 'invest':       return <Invest />
    case 'interest':     return <Interest />
    case 'others':       return <Others />
    case 'dispositions': return <Dispositions />
    case 'k1s':          return <K1s />
    default:             return <Income />
  }
}

export default function PreviewTrowser({ version, onClose }: PreviewTrowserProps) {
  const ctx = useAppContext()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const relatedFields = version.relatedFields ?? []
  const screen = getPrimarySection(relatedFields)
  const snapshot = version.dataSnapshot

  // Build a context override: same as live ctx but with snapshot as displayTaxData
  // and a non-null previewVersionId so all inputs render read-only
  const overrideCtx: AppContextType = {
    ...ctx,
    displayTaxData: snapshot,
    previewVersionId: version.id,
    currentScreen: screen,
  }

  const content = (
    <>
      <div className="ptrowser-overlay" onClick={onClose} />
      <div className="ptrowser" role="dialog" aria-modal="true" aria-label="Preview version">

        {/* Header */}
        <div className="ptrowser-header">
          <h2 className="ptrowser-title">Preview version</h2>
          <button className="ptrowser-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Amber previewing banner */}
        <div className="ptrowser-body">
          <div className="ptrowser-amber">
            <span className="ptrowser-amber-label">Previewing:</span>
            <span className="ptrowser-amber-desc">{version.label}</span>
            <span className="ptrowser-amber-meta">· {formatTimestamp(version.timestamp)} · {version.author}</span>
          </div>

          {/* Full form section — read-only via context override */}
          <div className="ptrowser-form">
            <AppContext.Provider value={overrideCtx}>
              <ScreenForSection screen={screen} />
            </AppContext.Provider>
          </div>
        </div>
      </div>
    </>
  )

  return createPortal(content, document.body)
}
