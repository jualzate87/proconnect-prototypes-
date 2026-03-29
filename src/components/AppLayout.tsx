
import { useAppContext } from '../index'
import LeftNav from './LeftNav'
import Header from './Header'
import LeftSidebar from './LeftSidebar'
import RightRail from './RightRail'
import InputScreens from './InputScreens'
import AuditPanel from './AuditPanel'
import PreviewBanner from './PreviewBanner'
import DuplicateModal from './DuplicateModal'
import Toast from './Toast'
import './AppLayout.css'

export default function AppLayout() {
  const { isAuditPanelOpen, setAuditPanelOpen, previewVersionId } = useAppContext()

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
            <AuditPanel onClose={() => setAuditPanelOpen(false)} />
          )}
        </div>
      </div>

      <DuplicateModal />
      <Toast />
    </div>
  )
}
