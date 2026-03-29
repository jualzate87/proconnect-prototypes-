import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAppContext } from '../index';
import LeftNav from './LeftNav';
import Header from './Header';
import LeftSidebar from './LeftSidebar';
import RightRail from './RightRail';
import InputScreens from './InputScreens';
import AuditPanel from './AuditPanel';
import PreviewBanner from './PreviewBanner';
import DuplicateModal from './DuplicateModal';
import Toast from './Toast';
import './AppLayout.css';
export default function AppLayout() {
    const { isAuditPanelOpen, setAuditPanelOpen, previewVersionId } = useAppContext();
    return (_jsxs("div", { className: "app-layout", children: [_jsx(LeftNav, {}), _jsxs("div", { className: "app-main", children: [_jsx(Header, {}), _jsxs("div", { className: "app-body", children: [_jsx(LeftSidebar, {}), _jsxs("div", { className: "app-content", children: [previewVersionId && _jsx(PreviewBanner, {}), _jsx("div", { className: `app-form-area ${previewVersionId ? 'app-form-area--preview' : ''}`, children: _jsx(InputScreens, {}) })] }), _jsx(RightRail, { isAuditOpen: isAuditPanelOpen, onAuditToggle: () => setAuditPanelOpen(!isAuditPanelOpen) }), isAuditPanelOpen && (_jsx(AuditPanel, { onClose: () => setAuditPanelOpen(false) }))] })] }), _jsx(DuplicateModal, {}), _jsx(Toast, {})] }));
}
