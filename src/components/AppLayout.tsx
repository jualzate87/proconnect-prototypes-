
import { useAppContext } from '../index'
import LeftNav from './LeftNav'
import Header from './Header'
import LeftSidebar from './LeftSidebar'
import RightRail from './RightRail'
import InputScreens from './InputScreens'
import AuditPanel from './AuditPanel'
import PreviewBanner from './PreviewBanner'
import Toast from './Toast'
import { AuditScenario } from '../lib/store'
import './AppLayout.css'

const SCENARIOS: { value: AuditScenario; label: string }[] = [
  { value: 'empty',        label: 'Empty state' },
  { value: 'with-entries', label: 'With entries' },
  { value: 'error',        label: 'Error' },
]

export default function AppLayout() {
  const { isAuditPanelOpen, setAuditPanelOpen, previewVersionId, auditScenario, setAuditScenario } = useAppContext()

  return (
    <div className="app-layout">
      {/* Far-left blue PTO navigation */}
      <LeftNav />

      {/* Main content column */}
      <div className="app-main">
        <Header />

        <div className="app-body">
          {/* Left sidebar navigation tree */}
          <LeftSidebar />

          {/* Center content area — shrinks when audit panel opens */}
          <div className="app-content">
            {previewVersionId && <PreviewBanner />}
            <div className={`app-form-area ${previewVersionId ? 'app-form-area--preview' : ''}`}>
              <InputScreens />
            </div>
          </div>

          {/* Right icon rail — always LEFT of the audit panel */}
          <RightRail
            isAuditOpen={isAuditPanelOpen}
            onAuditToggle={() => setAuditPanelOpen(!isAuditPanelOpen)}
          />

          {/* Audit panel — flex sibling at the far right, pushes content left */}
          {isAuditPanelOpen && (
            <div className="audit-panel-with-scenario">
              <div className="audit-scenario-bar">
                <span className="audit-scenario-label">Scenario:</span>
                {SCENARIOS.map(s => (
                  <button
                    key={s.value}
                    className={`audit-scenario-btn${auditScenario === s.value ? ' audit-scenario-btn--active' : ''}`}
                    onClick={() => setAuditScenario(s.value)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <AuditPanel onClose={() => setAuditPanelOpen(false)} />
            </div>
          )}
        </div>
      </div>

      <Toast />
    </div>
  )
}
