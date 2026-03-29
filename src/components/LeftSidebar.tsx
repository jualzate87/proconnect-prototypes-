import { useState } from 'react'
import { useAppContext } from '../index'
import { ScreenName } from '../types'
import './LeftSidebar.css'

interface NavItem {
  id: ScreenName
  label: string
  expandable?: boolean
}

interface NavSection {
  id: string
  label: string
  items?: NavItem[]
}

const NAVIGATION: NavSection[] = [
  { id: 'general', label: 'General' },
  {
    id: 'income',
    label: 'Income',
    items: [
      { id: 'income',       label: 'Wages and salaries' },
      { id: 'interest',     label: 'Interest Income (1099-INT-OID)' },
      { id: 'invest',       label: 'Dividend Income (1099-DIV)' },
      { id: 'others',       label: 'Net operating loss' },
      { id: 'others',       label: 'Rental and royalty income' },
      { id: 'others',       label: 'Business income' },
      { id: 'dispositions', label: 'Dispositions (Schedule D, 4797)' },
      { id: 'k1s',          label: 'Passthrough K-1s', expandable: true },
    ]
  },
  { id: 'deductions', label: 'Deductions' },
  { id: 'credits', label: 'Credits' },
  { id: 'taxes', label: 'Taxes' },
  { id: 'other', label: 'Other' },
  { id: 'misc', label: 'Miscellaneous Forms' },
  {
    id: 'manual',
    label: 'Manual Entry Forms',
    items: [
      { id: 'guides', label: 'Tax Guides & References' },
    ]
  },
]

export default function LeftSidebar() {
  const { currentScreen, setCurrentScreen } = useAppContext()
  const [activeView, setActiveView] = useState<'all' | 'inuse'>('all')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['income']))

  const toggleSection = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleItemClick = (screenId: ScreenName) => {
    setCurrentScreen(screenId)
    // Expand the parent section if needed
    for (const section of NAVIGATION) {
      if (section.items?.some(i => i.id === screenId)) {
        setExpanded(prev => new Set([...prev, section.id]))
      }
    }
  }

  const filteredNav = search
    ? NAVIGATION.map(s => ({
        ...s,
        items: s.items?.filter(i => i.label.toLowerCase().includes(search.toLowerCase()))
      })).filter(s => s.label.toLowerCase().includes(search.toLowerCase()) || (s.items && s.items.length > 0))
    : NAVIGATION

  return (
    <aside className="left-sidebar">
      {/* Views tabs */}
      <div className="sidebar-views">
        <span className="sidebar-views-label">Views</span>
        <div className="sidebar-views-tabs">
          <button
            className={`sidebar-view-tab ${activeView === 'all' ? 'active' : ''}`}
            onClick={() => setActiveView('all')}
          >All</button>
          <button
            className={`sidebar-view-tab ${activeView === 'inuse' ? 'active' : ''}`}
            onClick={() => setActiveView('inuse')}
          >In use</button>
        </div>
        <button className="sidebar-icon-btn" title="Table settings">
          <svg viewBox="0 0 20 20" fill="none" width="16" height="16"><path d="M4 5h12M4 10h12M4 15h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </button>
      </div>

      {/* Search */}
      <div className="sidebar-search">
        <svg viewBox="0 0 20 20" fill="none" width="14" height="14" className="sidebar-search-icon">
          <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="sidebar-search-input"
        />
      </div>

      {/* Table of content label */}
      <div className="sidebar-toc-header">
        <span>Table of content</span>
        <button className="sidebar-icon-btn">
          <svg viewBox="0 0 20 20" fill="none" width="14" height="14"><path d="M4 5h12M4 10h12M4 15h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </button>
      </div>

      {/* Navigation tree */}
      <nav className="sidebar-nav">
        {filteredNav.map(section => {
          const isOpen = expanded.has(section.id)
          const hasItems = section.items && section.items.length > 0

          return (
            <div key={section.id} className="sidebar-section">
              <button
                className={`sidebar-section-header ${hasItems ? '' : 'sidebar-section-header--leaf'}`}
                onClick={() => hasItems ? toggleSection(section.id) : undefined}
              >
                {hasItems && (
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    width="14"
                    height="14"
                    className={`sidebar-chevron ${isOpen ? 'sidebar-chevron--open' : ''}`}
                  >
                    <path d="M7 8l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {!hasItems && <span className="sidebar-section-spacer" />}
                <span className="sidebar-section-label">{section.label}</span>
              </button>

              {hasItems && isOpen && (
                <div className="sidebar-items">
                  {section.items!.map((item, idx) => (
                    <button
                      key={`${item.id}-${idx}`}
                      className={`sidebar-item ${currentScreen === item.id ? 'sidebar-item--active' : ''}`}
                      onClick={() => handleItemClick(item.id)}
                    >
                      {item.expandable && (
                        <svg viewBox="0 0 14 14" fill="none" width="12" height="12" style={{ marginRight: 4, flexShrink: 0 }}>
                          <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
