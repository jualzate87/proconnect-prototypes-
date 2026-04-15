import { useState, useEffect, useMemo, useRef } from 'react'
import { useAppContext } from '../../index'
import {
  RETURN_TYPES, AGENCIES, SECTIONS, FIELDS, CATEGORY_ORDER,
  TaxField, TaxSection,
} from './TaxMappingData'
import './TaxMapping.css'

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

  const returnTypeRef = useRef<HTMLDivElement>(null)
  const agencyRef     = useRef<HTMLDivElement>(null)
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

  function buildCsvString(fields: TaxField[]) {
    const header = showSectionCol
      ? 'Field Label\tSection\tSeries\tCode ID\tPrefix\tType\tAgency'
      : 'Field Label\tSeries\tCode ID\tPrefix\tType\tAgency'
    const sectionMap = Object.fromEntries(SECTIONS.map(s => [s.id, s]))
    const rows = fields.map(f => {
      const sec = sectionMap[f.sectionId]
      const prefix = f.prefix === 'static' ? '1' : '1+'
      const agencyVal = f.scope === 'FEDERAL' ? 'Federal' : AGENCIES.find(a => a.stateCode === f.scope)?.label.replace('Federal + ', '') ?? f.scope
      if (showSectionCol) {
        return [f.label, sec?.label ?? '', sec?.seriesId ?? '', f.codeId, prefix, f.type, agencyVal].join('\t')
      }
      return [f.label, sec?.seriesId ?? '', f.codeId, prefix, f.type, agencyVal].join('\t')
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
            <td colSpan={7}>{section.label} · Series {section.seriesId}</td>
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
    const agencyVal = field.scope === 'FEDERAL'
      ? 'Federal'
      : AGENCIES.find(a => a.stateCode === field.scope)?.label.replace('Federal + ', '') ?? field.scope

    return (
      <tr key={`${field.sectionId}-${field.codeId}-${i}`}>
        <td className="tm-field-label">{field.label}</td>
        {showSection && (
          <td className="tm-section-cell">{section?.label}</td>
        )}
        <td style={{ fontFamily: 'var(--font)', fontSize: 14 }}>{section?.seriesId}</td>
        <td>
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
        <td style={{ fontFamily: 'var(--font)', fontSize: 14 }}>
          {field.prefix === 'static' ? '1' : '1+'}
        </td>
        <td>
          <span className="tm-badge-type">{field.type}</span>
        </td>
        <td>
          <span className={`tm-badge-scope ${field.scope === 'FEDERAL' ? 'tm-badge-scope--federal' : 'tm-badge-scope--state'}`}>
            {agencyVal}
          </span>
        </td>
      </tr>
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
            Each field in ProConnect Tax has a unique code you can use to inject data via the API.{' '}
            <a
              href="https://developer.intuit.com/app/developer/qbotax/docs/api-reference"
              target="_blank"
              rel="noopener noreferrer"
              className="tm-intro-link"
            >
              View full API documentation →
            </a>
          </p>
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
              <button className="tm-action-btn" onClick={handleCopyTable} title="Copy table as CSV">
                <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                  <rect x="5" y="5" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M4 9H3a1 1 0 01-1-1V3a1 1 0 011-1h5a1 1 0 011 1v1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                Copy table
              </button>
              <button className="tm-action-btn tm-action-btn--primary" onClick={handleDownloadCsv} title="Download as CSV">
                <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                  <path d="M7 2v7M4 6l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 11h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                Download CSV
              </button>
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
                    <th>Field Label</th>
                    {showSectionCol && <th>Section</th>}
                    <th>Series</th>
                    <th>Code ID</th>
                    <th>Prefix</th>
                    <th>Type</th>
                    <th>Agency</th>
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
    </div>
  )
}
