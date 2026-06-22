import { useState, useEffect, useMemo, useRef } from 'react'
import { useAppContext } from '../../index'
import {
  RETURN_TYPES, AGENCIES, SECTIONS, FIELDS, CATEGORY_ORDER,
  TaxField, TaxSection, EnumValue,
} from './TaxMappingData'

import './TaxMapping.css'
import TaxMappingGuide from './TaxMappingGuide'

// Column header with tooltip
function ColHeader({ label, tip }: { label: string; tip: string }) {
  return (
    <span className="tm-th-wrap">
      {label}
      <span className="tm-th-tooltip-anchor">
        <svg className="tm-th-info" viewBox="0 0 14 14" fill="none" width="12" height="12">
          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M7 6.5v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          <circle cx="7" cy="4.5" r="0.7" fill="currentColor"/>
        </svg>
        <span className="tm-th-tooltip">{tip}</span>
      </span>
    </span>
  )
}

interface Props {
  onClose: () => void
}

export default function TaxMappingPortal({ onClose }: Props) {
  const { setToast } = useAppContext()

  const [returnType, setReturnType]           = useState('Individual 1040')
  const [agency, setAgency]                   = useState('federal')
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
  const [isFullSchema, setIsFullSchema]       = useState(false)
  const [search, setSearch]                   = useState('')
  const [copiedId, setCopiedId]               = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(CATEGORY_ORDER)
  )
  const [returnTypeOpen, setReturnTypeOpen]   = useState(false)
  const [agencyOpen, setAgencyOpen]           = useState(false)
  const [showGuide, setShowGuide]             = useState(window.location.hash.includes('guide'))
  const [downloadOpen, setDownloadOpen]       = useState(false)
  const [expandedEnumKey, setExpandedEnumKey] = useState<string | null>(null)

  const returnTypeRef = useRef<HTMLDivElement>(null)
  const agencyRef     = useRef<HTMLDivElement>(null)
  const downloadRef   = useRef<HTMLDivElement>(null)
  const searchRef     = useRef<HTMLInputElement>(null)

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  // Close dropdowns on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (returnTypeRef.current && !returnTypeRef.current.contains(e.target as Node)) setReturnTypeOpen(false)
      if (agencyRef.current && !agencyRef.current.contains(e.target as Node)) setAgencyOpen(false)
      if (downloadRef.current && !downloadRef.current.contains(e.target as Node)) setDownloadOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Derive state code from selected agency
  const stateCode = useMemo(() => {
    const ag = AGENCIES.find(a => a.value === agency)
    return ag?.stateCode ?? null
  }, [agency])

  // Compute visible fields
  const visibleFields = useMemo(() => {
    const showSection = (!isFullSchema && selectedSectionId) ? selectedSectionId : null

    return FIELDS.filter(f => {
      if (f.scope !== 'FEDERAL' && f.scope !== stateCode) return false
      if (showSection && f.sectionId !== showSection) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          f.label.toLowerCase().includes(q) ||
          f.codeId.toLowerCase().includes(q) ||
          f.sectionId.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [selectedSectionId, isFullSchema, stateCode, search])

  const showSectionCol = isFullSchema || !!search || !selectedSectionId
  const activeSection = SECTIONS.find(s => s.id === selectedSectionId)

  const groupedFields = useMemo(() => {
    if (!showSectionCol) return null
    const groups: { section: TaxSection; fields: TaxField[] }[] = []
    for (const section of SECTIONS) {
      const fields = visibleFields.filter(f => f.sectionId === section.id)
      if (fields.length > 0) groups.push({ section, fields })
    }
    return groups
  }, [visibleFields, showSectionCol])

  function toggleCategory(cat: string) {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  function handleSectionClick(sectionId: string) {
    setSelectedSectionId(sectionId)
    setIsFullSchema(false)
    setSearch('')
  }

  function handleFullSchema() {
    setSelectedSectionId(null)
    setIsFullSchema(true)
    setSearch('')
  }

  function copyCodeId(key: string) {
    setCopiedId(key)
    setTimeout(() => setCopiedId(null), 1500)
  }

  function buildApiKey(f: TaxField): string {
    const sec = SECTIONS.find(s => s.id === f.sectionId)
    const series = sec?.seriesId ?? ''
    const tsj = f.taxpayer === 'Both' ? 'TP' : f.taxpayer
    return `${series}.1.${f.codeId}.${tsj}`
  }

  function buildValidValues(f: TaxField): string {
    if (!f.enumValues?.length) return ''
    return f.enumValues.map(ev => `${ev.value}=${ev.label}`).join(' | ')
  }

  function buildCsvString(fields: TaxField[]) {
    const header = [
      'Section',
      'Series',
      'Field',
      'API Key',
      'Code',
      'TSJ',
      'Type',
      'Suffix',
      'Char Limit',
      'Valid Values',
      'Agency',
    ].join('\t')

    const sectionMap = Object.fromEntries(SECTIONS.map(s => [s.id, s]))
    const rows = fields.map(f => {
      const sec = sectionMap[f.sectionId]
      const agencyVal = f.scope === 'FEDERAL' ? 'Federal' : AGENCIES.find(a => a.stateCode === f.scope)?.label.replace('Federal + ', '') ?? f.scope
      const tsj = f.taxpayer === 'TP' ? '0 (Taxpayer)' : f.taxpayer === 'SP' ? '1 (Spouse)' : 'Both'
      const suffix = f.multiValue ? '1000, 1001, 1002…' : '1000'
      const charLimit = f.maxLength ? String(f.maxLength) : ''

      return [
        sec?.label ?? '',
        sec?.seriesId ?? '',
        f.label,
        buildApiKey(f),
        f.codeId,
        tsj,
        f.type,
        suffix,
        charLimit,
        buildValidValues(f),
        agencyVal,
      ].join('\t')
    })
    return [header, ...rows].join('\n')
  }

  function handleCopyTable() {
    const csv = buildCsvString(visibleFields)
    navigator.clipboard.writeText(csv).catch(() => {})
    setToast('Table copied to clipboard')
  }

  function handleDownloadCsv() {
    const csv = buildCsvString(visibleFields)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const sectionSlug = selectedSectionId ?? 'full-schema'
    const agencySlug = agency.replace('+', '-')
    a.href = url
    a.download = `tax-mapping-${sectionSlug}-${agencySlug}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setDownloadOpen(false)
  }

  function handleDownloadJson() {
    const sectionMap = Object.fromEntries(SECTIONS.map(s => [s.id, s]))
    const data = visibleFields.map(f => {
      const sec = sectionMap[f.sectionId]
      const entry: Record<string, unknown> = {
        section:     sec?.label ?? f.sectionId,
        seriesId:    sec?.seriesId ?? null,
        field:       f.label,
        apiKey:      buildApiKey(f),
        codeId:      f.codeId,
        prefix:      f.prefix === 'static' ? '1' : '1+',
        taxpayer:    f.taxpayer === 'Both' ? 'Both' : f.taxpayer === 'TP' ? 'Taxpayer' : 'Spouse',
        type:        f.type,
        agency:      f.scope === 'FEDERAL' ? 'Federal' : AGENCIES.find(a => a.stateCode === f.scope)?.label.replace('Federal + ', '') ?? f.scope,
      }
      if (f.enumValues?.length) {
        entry.validValues = Object.fromEntries(f.enumValues.map(ev => [ev.value, ev.label]))
      }
      if (f.maxLength) {
        entry.maxLength = f.maxLength
      }
      return entry
    })
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const sectionSlug = selectedSectionId ?? 'full-schema'
    const agencySlug = agency.replace('+', '-')
    a.href = url
    a.download = `tax-mapping-${sectionSlug}-${agencySlug}.json`
    a.click()
    URL.revokeObjectURL(url)
    setDownloadOpen(false)
  }

  const contentTitle = isFullSchema
    ? 'Full Agency Schema'
    : activeSection?.label ?? 'Select a section'
  const agencyLabel = AGENCIES.find(a => a.value === agency)?.label ?? 'Federal'
  const returnTypeLabel = returnType
  const agencyDisplayLabel = AGENCIES.find(a => a.value === agency)?.label ?? 'Federal'

  function renderTableRows() {
    if (showSectionCol && groupedFields) {
      return groupedFields.map(({ section, fields }) => (
        <>
          <tr key={`group-${section.id}`} className="tm-section-group-row">
            <td colSpan={10}>{section.label} · Series {section.seriesId}</td>
          </tr>
          {fields.map((field, i) => renderFieldRow(field, i, true))}
        </>
      ))
    }
    return visibleFields.map((field, i) => renderFieldRow(field, i, false))
  }

  function renderFieldRow(field: TaxField, i: number, showSection: boolean) {
    const section = SECTIONS.find(s => s.id === field.sectionId)
    const copyKey = field.codeId + field.sectionId + i
    const enumKey = field.sectionId + field.codeId + i
    const agencyVal = field.scope === 'FEDERAL'
      ? 'Federal'
      : AGENCIES.find(a => a.stateCode === field.scope)?.label.replace('Federal + ', '') ?? field.scope
    const tsjNum  = field.taxpayer === 'TP' ? '0' : field.taxpayer === 'SP' ? '1' : null
    const tsjLabel = field.taxpayer === 'TP' ? 'Taxpayer' : field.taxpayer === 'SP' ? 'Spouse' : 'Both'
    const hasEnum = !!field.enumValues?.length
    const isEnumExpanded = expandedEnumKey === enumKey
    // section(1) + series(1) + field(1) + code(1) + prefix(1) + tsj(1) + type(1) + suffix(1) + charlimit(1) + agency(1) = 10 with section, 8 without
    const colSpan = showSection ? 10 : 8

    return (
      <>
        <tr key={`${field.sectionId}-${field.codeId}-${i}`}>
          {showSection && (
            <>
              <td className="tm-section-col">{section?.label}</td>
              <td className="tm-series-col">{section?.seriesId}</td>
            </>
          )}
          <td className="tm-field-col">{field.label}</td>
          {/* API Key — pre-assembled, copyable */}
          <td className="tm-codeid-col">
            <button
              className="tm-code-id-btn"
              onClick={() => { copyCodeId(copyKey); navigator.clipboard.writeText(field.codeId).catch(() => {}) }}
              title={`Copy ${field.codeId}`}
            >
              {copiedId === copyKey
                ? <span className="tm-copied-label">Copied!</span>
                : (
                  <>
                    {field.codeId}
                    <span className="tm-copy-icon">
                      <svg viewBox="0 0 14 14" fill="none" width="12" height="12">
                        <rect x="5" y="5" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                        <path d="M4 9H3a1 1 0 01-1-1V3a1 1 0 011-1h5a1 1 0 011 1v1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                    </span>
                  </>
                )
              }
            </button>
          </td>
          <td>
            {field.prefix === 'static' ? (
              <span className="tm-prefix-single">1</span>
            ) : (
              <span className="tm-prefix-multi">
                1+
                <span className="tm-affix-info-anchor">
                  <svg className="tm-affix-info-icon" viewBox="0 0 14 14" fill="none" width="12" height="12">
                    <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/>
                    <path d="M7 6.5v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    <circle cx="7" cy="4.5" r="0.7" fill="currentColor"/>
                  </svg>
                  <span className="tm-affix-tooltip">
                    This section can repeat for multiple entries (e.g., multiple W-2s). The prefix increments per entry: 1, 2, 3…
                  </span>
                </span>
              </span>
            )}
          </td>
          <td>
            <span className={`tm-badge-type tm-badge-tpsp--${field.taxpayer.toLowerCase()}`}>
              {tsjNum !== null ? <><strong>{tsjNum}</strong> · </> : null}{tsjLabel}
            </span>
          </td>
          <td>
            {hasEnum ? (
              <button
                className={`tm-enum-badge ${isEnumExpanded ? 'tm-enum-badge--active' : ''}`}
                onClick={() => setExpandedEnumKey(isEnumExpanded ? null : enumKey)}
                title={isEnumExpanded ? 'Hide valid values' : 'Show valid values'}
              >
                ENUM
                <svg
                  viewBox="0 0 10 6" fill="none" width="8" height="8"
                  className={`tm-enum-chevron ${isEnumExpanded ? 'tm-enum-chevron--open' : ''}`}
                >
                  <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            ) : (
              <span className="tm-badge-type">{field.type}</span>
            )}
          </td>
          <td>
            {field.multiValue ? (
              <span className="tm-suffix-multi">
                1000+
                <span className="tm-affix-info-anchor">
                  <svg className="tm-affix-info-icon" viewBox="0 0 14 14" fill="none" width="12" height="12">
                    <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/>
                    <path d="M7 6.5v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    <circle cx="7" cy="4.5" r="0.7" fill="currentColor"/>
                  </svg>
                  <span className="tm-affix-tooltip">
                    This field supports multiple sub-values. Each additional value increments the suffix: 1000, 1001, 1002… The API aggregates them into one total.
                  </span>
                </span>
              </span>
            ) : (
              <span className="tm-suffix-single">1000</span>
            )}
          </td>
          <td>
            {field.maxLength
              ? <span className="tm-charlimit">{field.maxLength}</span>
              : <span className="tm-charlimit tm-charlimit--none">—</span>
            }
          </td>
          <td>
            <span className={`tm-badge-scope ${field.scope === 'FEDERAL' ? 'tm-badge-scope--federal' : 'tm-badge-scope--state'}`}>
              {agencyVal}
            </span>
          </td>
        </tr>
        {hasEnum && isEnumExpanded && (
          <tr key={`enum-${enumKey}`} className="tm-enum-row">
            <td colSpan={colSpan}>
              <div className="tm-enum-values">
                <span className="tm-enum-values-label">Valid values</span>
                <ul className="tm-enum-list">
                  {field.enumValues!.map((ev: EnumValue) => (
                    <li key={ev.value} className="tm-enum-item">
                      <span className="tm-enum-value-code">{ev.value}</span>
                      <span className="tm-enum-value-sep">=</span>
                      <span className="tm-enum-value-label">{ev.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </td>
          </tr>
        )}
      </>
    )
  }

  const categorizedSections = CATEGORY_ORDER.map(cat => ({
    category: cat,
    sections: SECTIONS.filter(s => s.category === cat),
  }))

  return (
    <div className="tm-overlay">
      {/* ── Trowser Header ── */}
      <div className="tm-header">
        <h2 className="tm-header-title">Tax Mapping</h2>
        <button className="tm-close-btn" onClick={onClose} title="Close">
          <svg viewBox="0 0 14 14" fill="none" width="16" height="16">
            <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* ── Intro: centered title + dropdowns ── */}
      <div className="tm-intro">
        <div className="tm-intro-text">
          <h3 className="tm-intro-title">Find the right code for any ProConnect field</h3>
          <p className="tm-intro-desc">
            Each field in ProConnect Tax has a unique code you can use to inject data via the API.
          </p>
          <div className="tm-intro-links">
            <button className="tm-intro-link-btn" onClick={() => setShowGuide(true)}>
              <svg viewBox="0 0 16 16" fill="none" width="15" height="15" style={{flexShrink: 0}}>
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M6.5 6.5C6.5 5.67 7.17 5 8 5s1.5.67 1.5 1.5c0 .7-.46 1.3-1.1 1.52L8 8.25V9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                <circle cx="8" cy="11.5" r="0.75" fill="currentColor"/>
              </svg>
              How to read this table
            </button>
          </div>
        </div>
        <div className="tm-intro-selects">
          {/* Return Type pill dropdown */}
          <div className="filter-pill-wrap tm-filter-pill-wrap" ref={returnTypeRef}>
            <button
              className={`filter-pill ${returnTypeOpen ? 'filter-pill--active' : ''}`}
              onClick={() => { setReturnTypeOpen(v => !v); setAgencyOpen(false) }}
            >
              {returnTypeLabel}
              <svg viewBox="0 0 10 6" fill="none" width="10" height="6">
                <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {returnTypeOpen && (
              <div className="filter-dropdown tm-filter-dropdown">
                {RETURN_TYPES.map(rt => (
                  <button
                    key={rt}
                    className={`filter-dropdown-item ${rt === returnType ? 'active' : ''}`}
                    onClick={() => { setReturnType(rt); setReturnTypeOpen(false) }}
                  >
                    {rt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Agency pill dropdown */}
          <div className="filter-pill-wrap tm-filter-pill-wrap" ref={agencyRef}>
            <button
              className={`filter-pill ${agencyOpen ? 'filter-pill--active' : ''}`}
              onClick={() => { setAgencyOpen(v => !v); setReturnTypeOpen(false) }}
            >
              {agencyDisplayLabel}
              <svg viewBox="0 0 10 6" fill="none" width="10" height="6">
                <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {agencyOpen && (
              <div className="filter-dropdown tm-filter-dropdown">
                {AGENCIES.map(ag => (
                  <button
                    key={ag.value}
                    className={`filter-dropdown-item ${ag.value === agency ? 'active' : ''}`}
                    onClick={() => { setAgency(ag.value); setAgencyOpen(false) }}
                  >
                    {ag.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="tm-body">

        {/* ── Left Nav ── */}
        <nav className="tm-nav">
          {/* Search — audit-log style */}
          <div className="tm-nav-search-wrap">
            <div className="audit-search-wrap" style={{ padding: 0 }}>
              <div className="audit-search-inner">
                <span className="audit-search-icon">
                  <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                    <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
                    <path d="M16.5 16.5l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </span>
                <input
                  ref={searchRef}
                  className="audit-search-input"
                  type="text"
                  placeholder="Search codes or fields"
                  value={search}
                  onChange={e => { setSearch(e.target.value); if (e.target.value) setIsFullSchema(true) }}
                />
                {search && (
                  <button
                    className="audit-search-clear"
                    onClick={() => { setSearch(''); searchRef.current?.focus() }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <svg viewBox="0 0 12 12" fill="none" width="12" height="12">
                      <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Full Schema Toggle */}
          <button
            className={`tm-nav-full-schema ${(isFullSchema && !search) ? 'tm-nav-full-schema--active' : ''}`}
            onClick={handleFullSchema}
          >
            Entire agency schema
            {/* menu-expand icon: 3 lines + right arrow */}
            <svg viewBox="0 0 20 20" fill="none" width="18" height="18" style={{ marginLeft: 'auto', flexShrink: 0 }}>
              <path d="M3 5h10M3 10h10M3 15h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M16 10l-3-3m3 3l-3 3m3-3H10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Nav Tree */}
          <div className="tm-nav-tree">
            {categorizedSections.map(({ category, sections }) => (
              <div key={category}>
                <button
                  className="tm-nav-category-btn"
                  onClick={() => toggleCategory(category)}
                >
                  {category}
                  <svg
                    className={`tm-nav-category-chevron ${expandedCategories.has(category) ? 'tm-nav-category-chevron--open' : ''}`}
                    viewBox="0 0 10 6" fill="none" width="10" height="6"
                  >
                    <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {expandedCategories.has(category) && sections.map(section => (
                  <button
                    key={section.id}
                    className={`tm-nav-item ${selectedSectionId === section.id && !isFullSchema ? 'tm-nav-item--active' : ''}`}
                    onClick={() => handleSectionClick(section.id)}
                    title={section.label}
                  >
                    {section.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </nav>

        {/* ── Content ── */}
        <div className="tm-content">
          {/* Content Header */}
          <div className="tm-content-header">
            <h2 className="tm-content-title">{contentTitle}</h2>
            {activeSection && (
              <span className="tm-scope-badge">Federal</span>
            )}
            {(activeSection?.seriesId) && (
              <span className="tm-content-subtitle">Series {activeSection.seriesId} · {agencyLabel}</span>
            )}
            <div className="tm-content-actions">
              <button className="tm-action-btn" onClick={handleCopyTable} title="Copy table as tab-separated values (paste into Excel or Google Sheets)">
                <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                  <rect x="5" y="5" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M4 9H3a1 1 0 01-1-1V3a1 1 0 011-1h5a1 1 0 011 1v1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                Copy table
              </button>
              <div className="tm-download-wrap" ref={downloadRef}>
                <button
                  className={`tm-action-btn tm-action-btn--primary tm-download-btn ${downloadOpen ? 'tm-action-btn--open' : ''}`}
                  onClick={() => setDownloadOpen(v => !v)}
                >
                  <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                    <path d="M7 2v7M4 6l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 11h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                  Download
                  <svg viewBox="0 0 10 6" fill="none" width="9" height="9" className="tm-download-chevron">
                    <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {downloadOpen && (
                  <div className="tm-download-dropdown">
                    <button className="tm-download-option" onClick={handleDownloadCsv}>
                      <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                        <rect x="2" y="2" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                        <path d="M4 5h6M4 7.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                      CSV — spreadsheet
                    </button>
                    <button className="tm-download-option" onClick={handleDownloadJson}>
                      <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                        <path d="M4 2H3a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1V5l-3-3z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                        <path d="M8 2v3h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      JSON — API payload
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info Box */}
          {(activeSection || (isFullSchema && !activeSection)) && (
            <div className="tm-info-box">
              <svg viewBox="0 0 20 20" fill="none" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                <circle cx="10" cy="10" r="8.5" fill="#0077c5"/>
                <path d="M10 9v6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="10" cy="6.5" r="1" fill="#fff"/>
              </svg>
              <ul className="tm-info-list">
                {activeSection ? (
                  <>
                    <li>
                      {activeSection.prefix === 'static'
                        ? <>Use prefix <strong>1</strong> for all fields in this section.</>
                        : <>This section supports <strong>multiple entries</strong> — increment the <strong>prefix</strong> for each instance (1, 2, 3…).</>
                      }
                    </li>
                    {stateCode && (
                      <li><strong>Federal</strong> and <strong>{agencyLabel.replace('Federal + ', '')}-specific</strong> fields are shown together. Check the <strong>Agency</strong> column to see which apply to your state.</li>
                    )}
                  </>
                ) : (
                  <>
                    <li>Showing all sections for <strong>{agencyLabel}</strong>. Sections marked <strong>1+</strong> support <strong>multiple entries</strong> — use an incrementing prefix for each.</li>
                    {stateCode && (
                      <li><strong>Federal</strong> and <strong>{agencyLabel.replace('Federal + ', '')}-specific</strong> fields are combined. Check the <strong>Agency</strong> column to see which apply to your state.</li>
                    )}
                  </>
                )}
              </ul>
            </div>
          )}

          {/* Table */}
          <div className="tm-table-wrap">
            {visibleFields.length === 0 ? (
              <div className="tm-empty">
                <svg viewBox="0 0 24 24" fill="none" width="32" height="32">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M16.5 16.5l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <p>No fields match your search.</p>
              </div>
            ) : (
              <table className="tm-table">
                <thead>
                  <tr>
                    {showSectionCol && (
                      <>
                        <th>
                          <ColHeader
                            label="Section"
                            tip="The ProConnect form section this field belongs to"
                          />
                        </th>
                        <th>
                          <ColHeader
                            label="Series"
                            tip="The API identifier for this section — the numeric equivalent of the section name"
                          />
                        </th>
                      </>
                    )}
                    <th>
                      <ColHeader
                        label="Field"
                        tip="The field label as it appears in ProConnect Tax"
                      />
                    </th>
                    <th>
                      <ColHeader
                        label="Code"
                        tip="The unique identifier for this field in the API. Use this code in your payload to target the exact field. Click to copy."
                      />
                    </th>
                    <th>
                      <ColHeader
                        label="Prefix"
                        tip="1 = single entry per return. 1+ = multiple instances allowed (e.g. multiple W-2s). Increment the number for each additional entry."
                      />
                    </th>
                    <th>
                      <ColHeader
                        label="TSJ"
                        tip="Who this field belongs to: 0 = Taxpayer, 1 = Spouse, Both = applies to joint filers"
                      />
                    </th>
                    <th>
                      <ColHeader
                        label="Type"
                        tip="The data type expected by the API: String (text), Currency (dollar amount), Boolean (true/false), Date, or Enum (select from valid values)"
                      />
                    </th>
                    <th>
                      <ColHeader
                        label="Suffix"
                        tip="1000 = single value only. 1000, 1001, 1002… = field supports multiple values that aggregate into one total (e.g. wages from multiple states)"
                      />
                    </th>
                    <th>
                      <ColHeader
                        label="Char limit"
                        tip="Maximum number of characters accepted by the API for this field"
                      />
                    </th>
                    <th>
                      <ColHeader
                        label="Agency"
                        tip="Whether this field is required by the IRS (Federal) or a specific state tax authority"
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {renderTableRows()}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {showGuide && <TaxMappingGuide onClose={() => setShowGuide(false)} />}
    </div>
  )
}
