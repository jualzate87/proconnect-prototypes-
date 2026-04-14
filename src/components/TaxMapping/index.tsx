import { useState, useEffect, useMemo } from 'react'
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

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  // Derive state code from selected agency
  const stateCode = useMemo(() => {
    const ag = AGENCIES.find(a => a.value === agency)
    return ag?.stateCode ?? null
  }, [agency])

  // Compute visible fields
  const visibleFields = useMemo(() => {
    const showSection = (!isFullSchema && selectedSectionId) ? selectedSectionId : null

    return FIELDS.filter(f => {
      // Agency filter: hide state-specific fields unless that state is selected
      if (f.scope !== 'FEDERAL' && f.scope !== stateCode) return false
      // Section filter (single section mode)
      if (showSection && f.sectionId !== showSection) return false
      // Search filter
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

  // Show Section column when in full schema or searching
  const showSectionCol = isFullSchema || !!search || !selectedSectionId

  // Active section metadata
  const activeSection = SECTIONS.find(s => s.id === selectedSectionId)

  // Grouped view for full schema
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

  function copyCodeId(codeId: string) {
    navigator.clipboard.writeText(codeId).catch(() => {})
    setCopiedId(codeId)
    setTimeout(() => setCopiedId(null), 1500)
  }

  function buildCsvString(fields: TaxField[]) {
    const header = showSectionCol
      ? 'Field Label\tSection\tSeries\tCode ID\tPrefix\tType\tScope'
      : 'Field Label\tSeries\tCode ID\tPrefix\tType\tScope'
    const sectionMap = Object.fromEntries(SECTIONS.map(s => [s.id, s]))
    const rows = fields.map(f => {
      const sec = sectionMap[f.sectionId]
      const prefix = f.prefix === 'static' ? '1' : '[n]'
      if (showSectionCol) {
        return [f.label, sec?.label ?? '', sec?.seriesId ?? '', f.codeId, prefix, f.type, f.scope].join('\t')
      }
      return [f.label, sec?.seriesId ?? '', f.codeId, prefix, f.type, f.scope].join('\t')
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

  // Title for content header
  const contentTitle = isFullSchema
    ? 'Full Agency Schema'
    : activeSection?.label ?? 'Select a section'
  const contentSeries = activeSection ? `Series ${activeSection.seriesId}` : ''
  const agencyLabel = AGENCIES.find(a => a.value === agency)?.label ?? 'Federal'

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

    return (
      <tr key={`${field.sectionId}-${field.codeId}-${i}`}>
        <td className="tm-field-label">{field.label}</td>
        {showSection && (
          <td className="tm-section-cell">{section?.label}</td>
        )}
        <td>
          <span className="tm-badge-series">{section?.seriesId}</span>
        </td>
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
        <td>
          <span className={`tm-badge-prefix tm-badge-prefix--${field.prefix}`}>
            {field.prefix === 'static' ? '1' : '[n]'}
          </span>
        </td>
        <td>
          <span className="tm-badge-type">{field.type}</span>
        </td>
        <td>
          <span className={`tm-badge-scope ${field.scope === 'FEDERAL' ? 'tm-badge-scope--federal' : 'tm-badge-scope--state'}`}>
            {field.scope}
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
          <svg viewBox="0 0 14 14" fill="none" width="14" height="14">
            <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* ── Selection Row ── */}
      <div className="tm-selection">
        <span className="tm-selection-label">Select return type and agency</span>
        <select
          className="tm-select"
          value={returnType}
          onChange={e => setReturnType(e.target.value)}
        >
          {RETURN_TYPES.map(rt => (
            <option key={rt} value={rt}>{rt}</option>
          ))}
        </select>
        <select
          className="tm-select"
          value={agency}
          onChange={e => setAgency(e.target.value)}
        >
          {AGENCIES.map(ag => (
            <option key={ag.value} value={ag.value}>{ag.label}</option>
          ))}
        </select>
      </div>

      {/* ── Body ── */}
      <div className="tm-body">

        {/* ── Left Nav ── */}
        <nav className="tm-nav">
          {/* Search */}
          <div className="tm-nav-search-wrap">
            <div className="tm-nav-search">
              <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M10.5 10.5l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                placeholder="Search codes or fields…"
                value={search}
                onChange={e => { setSearch(e.target.value); if (e.target.value) setIsFullSchema(true) }}
              />
              {search && (
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 0 }}
                  onClick={() => setSearch('')}
                >
                  <svg viewBox="0 0 12 12" fill="none" width="12" height="12">
                    <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Full Schema Toggle */}
          <button
            className={`tm-nav-full-schema ${(isFullSchema && !search) ? 'tm-nav-full-schema--active' : ''}`}
            onClick={handleFullSchema}
          >
            <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
              <path d="M2 3h10M2 7h10M2 11h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            Entire agency schema
          </button>

          {/* Nav Tree */}
          <div className="tm-nav-tree">
            {categorizedSections.map(({ category, sections }) => (
              <div key={category} className="tm-nav-category">
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
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {section.label}
                    </span>
                    {section.prefix === 'multi' && (
                      <span className="tm-nav-multi-badge" title="Multi-instance — supports Prefix [n]">N</span>
                    )}
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
            <div>
              <h2 className="tm-content-title">{contentTitle}</h2>
              {(contentSeries || agencyLabel) && (
                <div className="tm-content-subtitle">
                  {contentSeries && <>{contentSeries} · </>}
                  Unified ProConnect Schema for {agencyLabel}
                </div>
              )}
            </div>
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
          {activeSection && (
            <div className="tm-info-box">
              <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M8 7v5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                <circle cx="8" cy="5" r="0.8" fill="currentColor"/>
              </svg>
              <span>
                {activeSection.prefix === 'static'
                  ? <><strong>Single-instance section (Prefix 1).</strong> Always use <code>1</code> as the prefix when mapping fields in this section.</>
                  : <><strong>Multi-instance section (Prefix [n]).</strong> This section supports multiple entries. Start at <code>1</code> and increment for each instance — e.g., 1st {activeSection.label} = Prefix 1, 2nd = Prefix 2.</>
                }
              </span>
            </div>
          )}
          {isFullSchema && !activeSection && (
            <div className="tm-info-box">
              <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M8 7v5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                <circle cx="8" cy="5" r="0.8" fill="currentColor"/>
              </svg>
              <span>
                <strong>Unified View.</strong> Showing all sections for <strong>{agencyLabel}</strong>. Use the <strong>Prefix</strong> column to determine mapping behavior — <span style={{ color: '#92400e', fontWeight: 600 }}>[n]</span> = multi-instance, <span style={{ fontWeight: 600 }}>1</span> = static.
              </span>
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
                    <th>Scope</th>
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
