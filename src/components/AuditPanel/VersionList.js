import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import VersionEntry from './VersionEntry';
const GROUP_ORDER = [
    'Today',
    'Yesterday',
    'Last 7 days',
    'Last 30 days',
    'Last 90 days',
    'This year',
    'Last year',
];
function getTimeGroup(timestamp) {
    const DAY = 86400000;
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayMs = todayStart.getTime();
    const yesterdayMs = todayMs - DAY;
    if (timestamp >= todayMs)
        return 'Today';
    if (timestamp >= yesterdayMs)
        return 'Yesterday';
    if (timestamp >= todayMs - 7 * DAY)
        return 'Last 7 days';
    if (timestamp >= todayMs - 30 * DAY)
        return 'Last 30 days';
    if (timestamp >= todayMs - 90 * DAY)
        return 'Last 90 days';
    const entryYear = new Date(timestamp).getFullYear();
    const currentYear = now.getFullYear();
    if (entryYear === currentYear)
        return 'This year';
    if (entryYear === currentYear - 1)
        return 'Last year';
    return 'Older';
}
export default function ActivityList({ versions }) {
    // Group versions by time bucket
    const groups = {};
    for (const v of versions) {
        const group = getTimeGroup(v.timestamp);
        if (!groups[group])
            groups[group] = [];
        groups[group].push(v);
    }
    const activeGroups = GROUP_ORDER.filter(g => groups[g]?.length);
    return (_jsx("div", { className: "version-list", children: activeGroups.map(groupName => (_jsxs("div", { className: "activity-group", children: [_jsx("div", { className: "activity-group-label", children: groupName }), groups[groupName].map(version => (_jsx(VersionEntry, { version: version }, version.id)))] }, groupName))) }));
}
