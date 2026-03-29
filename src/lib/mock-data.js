const SCHEMA_VERSION = 6;
const HOUR = 3600000;
const DAY = 86400000;
// ── Change-type color palette (not author-based) ──────────────────────────────
export const CHANGE_TYPE_COLORS = {
    manual_entry: '#2563eb', // blue
    document_import: '#16a34a', // green
    api_import: '#7c3aed', // violet
    revert: '#d97706', // amber
    copy: '#6b7280', // gray
};
export function getChangeTypeColor(changeType) {
    return CHANGE_TYPE_COLORS[changeType] || '#6b7280';
}
// ── Screen name mapping — matches left nav labels exactly ─────────────────────
export const SECTION_DISPLAY = {
    income: 'Wages & Salaries',
    investment: 'Capital Gains & Losses',
    interest: 'Interest & Dividends',
    other: 'Rental & Other Income',
    dispositions: 'Dispositions (Schedule D)',
    k1: 'Passthrough K-1s',
};
// ── Base empty snapshot ───────────────────────────────────────────────────────
const snap0 = {
    income: {
        employerId: '', employerName: '', streetAddress: '',
        city: '', state: '', zip: '',
        w2Wages: 0, fedTaxWithheld: 0, ssWages: 0, ssTaxWithheld: 0,
        medicareWages: 0, medicareTax: 0, seIncome: 0, notes: '',
        tcEmployerId: '', tcEmployerName: '', tcStreetAddress: '',
        tcCity: '', tcState: '', tcZip: '',
        tcW2Wages: 0, tcFedTaxWithheld: 0, tcSsWages: 0, tcSsTaxWithheld: 0,
        tcMedicareWages: 0, tcMedicareTax: 0,
    },
    investment: { capitalGains: 0, shortTermGains: 0, stockSales: '', notes: '' },
    interest: {
        p1Name: '', p1EIN: '', p1Interest: 0, p1FedTax: 0,
        p2Name: '', p2EIN: '', p2Interest: 0, p2FedTax: 0,
        dividendIncome: 0, qualifiedDividends: 0,
        interestIncome: 0, sources: '', notes: '',
    },
    other: {
        propertyAddress: '', propertyCity: '', propertyState: '',
        daysRented: 0, rentalIncome: 0, rentalExpenses: 0,
        k1PartnerName: '', passiveIncome: 0, notes: '',
    },
    guides: { selectedGuides: [] },
};
// v1 — Bing Equipment W-2 document import
const snap1 = {
    ...snap0,
    income: {
        ...snap0.income,
        employerId: '47-2381942', employerName: 'Bing Equipment',
        streetAddress: '3833 Soundtech Ct SE', city: 'Kentwood', state: 'MI', zip: '49512',
        w2Wages: 78420, fedTaxWithheld: 9843, ssWages: 78420,
        ssTaxWithheld: 4862, medicareWages: 78420, medicareTax: 1137,
    },
};
// v2 — SE Income entered manually
const snap2 = {
    ...snap1,
    income: { ...snap1.income, seIncome: 12500 },
};
// v3 — TaxDome API: bulk interest & dividend import (8 fields across 1 section)
const snap3 = {
    ...snap2,
    interest: {
        p1Name: 'First Federal Savings', p1EIN: '72-3849271',
        p1Interest: 2840, p1FedTax: 35,
        p2Name: '', p2EIN: '', p2Interest: 0, p2FedTax: 0,
        dividendIncome: 980, qualifiedDividends: 720,
        interestIncome: 2840, sources: 'First Federal Savings', notes: '',
    },
};
// v4 — Tech Circle W-2 OCR document import (12 fields)
const snap4 = {
    ...snap3,
    income: {
        ...snap3.income,
        tcEmployerId: '88-1234567', tcEmployerName: 'Tech Circle Inc',
        tcStreetAddress: '321 Main Orchard Dr', tcCity: 'Reno', tcState: 'NV', tcZip: '89501',
        tcW2Wages: 64304, tcFedTaxWithheld: 5987, tcSsWages: 64304,
        tcSsTaxWithheld: 3987, tcMedicareWages: 64304, tcMedicareTax: 932,
    },
};
// v5 — Capital gains & short-term gains entered manually
const snap5 = {
    ...snap4,
    investment: { capitalGains: 8200, shortTermGains: 1450, stockSales: 'AAPL 100sh · MSFT 50sh', notes: '' },
};
// v6 — Alfred API: dividend update + short-term gains correction (3 fields, 2 sections)
const snap6 = {
    ...snap5,
    interest: { ...snap5.interest, dividendIncome: 1240, qualifiedDividends: 940 },
    investment: { ...snap5.investment, shortTermGains: 2100 },
};
// v7 — 1099-INT Citi Bank document import (5 fields)
const snap7 = {
    ...snap6,
    interest: {
        ...snap6.interest,
        p2Name: 'Citi Bank', p2EIN: '13-0000601',
        p2Interest: 280, p2FedTax: 0,
        interestIncome: 3120, sources: 'First Federal Savings, Citi Bank',
    },
};
// v8 — Bing Equipment wages corrected manually
const snap8 = {
    ...snap7,
    income: {
        ...snap7.income,
        w2Wages: 79150, ssWages: 79150, ssTaxWithheld: 4907,
        medicareWages: 79150, medicareTax: 1148,
    },
};
// v9 — Rental income + property details entered manually (6 fields)
const snap9 = {
    ...snap8,
    other: {
        propertyAddress: '4821 Oak Creek Lane', propertyCity: 'Grand Rapids', propertyState: 'MI',
        daysRented: 220, rentalIncome: 4800, rentalExpenses: 1920,
        k1PartnerName: '', passiveIncome: 0, notes: '',
    },
};
// v10 — TaxDome API: K-1 / passive income import (CURRENT, 2 fields)
const snap10 = {
    ...snap9,
    other: {
        ...snap9.other,
        k1PartnerName: 'Green Valley Partners LLC',
        passiveIncome: 2200,
    },
};
export const initialTaxData = snap10;
export function createInitialAuditLog() {
    const now = Date.now();
    const versions = [
        // ── Last 30 days ─────────────────────────────────────────────────────────
        {
            id: 'v1',
            timestamp: now - 34 * DAY,
            author: 'Jason Hansen',
            label: 'Bing Equipment W-2 Import',
            changeType: 'document_import',
            description: 'Imported W-2 · Bing Equipment Inc.',
            dataSnapshot: snap1,
            changes: [
                { field: 'income.employerName', oldValue: '', newValue: 'Bing Equipment' },
                { field: 'income.w2Wages', oldValue: 0, newValue: 78420 },
                { field: 'income.fedTaxWithheld', oldValue: 0, newValue: 9843 },
                { field: 'income.ssWages', oldValue: 0, newValue: 78420 },
                { field: 'income.ssTaxWithheld', oldValue: 0, newValue: 4862 },
                { field: 'income.medicareWages', oldValue: 0, newValue: 78420 },
                { field: 'income.medicareTax', oldValue: 0, newValue: 1137 },
            ],
            relatedFields: [
                'income.employerId', 'income.employerName', 'income.streetAddress',
                'income.city', 'income.state', 'income.zip',
                'income.w2Wages', 'income.fedTaxWithheld', 'income.ssWages',
                'income.ssTaxWithheld', 'income.medicareWages', 'income.medicareTax',
            ],
        },
        {
            id: 'v2',
            timestamp: now - 28 * DAY,
            author: 'Sarah Miller',
            label: 'SE Income Entry',
            changeType: 'manual_entry',
            description: 'Entered self-employment income',
            dataSnapshot: snap2,
            changes: [
                { field: 'income.seIncome', oldValue: 0, newValue: 12500 },
            ],
            relatedFields: ['income.seIncome'],
        },
        {
            id: 'v3',
            timestamp: now - 20 * DAY,
            author: 'David Hansen',
            label: 'TaxDome Interest & Dividend Import',
            changeType: 'api_import',
            apiSource: 'TaxDome',
            description: 'Imported interest & dividend data from TaxDome API',
            dataSnapshot: snap3,
            changes: [
                { field: 'interest.p1Name', oldValue: '', newValue: 'First Federal Savings' },
                { field: 'interest.p1EIN', oldValue: '', newValue: '72-3849271' },
                { field: 'interest.p1Interest', oldValue: 0, newValue: 2840 },
                { field: 'interest.p1FedTax', oldValue: 0, newValue: 35 },
                { field: 'interest.dividendIncome', oldValue: 0, newValue: 980 },
                { field: 'interest.qualifiedDividends', oldValue: 0, newValue: 720 },
                { field: 'interest.interestIncome', oldValue: 0, newValue: 2840 },
                { field: 'interest.sources', oldValue: '', newValue: 'First Federal Savings' },
            ],
            relatedFields: [
                'interest.p1Name', 'interest.p1EIN', 'interest.p1Interest', 'interest.p1FedTax',
                'interest.dividendIncome', 'interest.qualifiedDividends',
                'interest.interestIncome', 'interest.sources',
            ],
        },
        // ── Last 7 days ───────────────────────────────────────────────────────────
        {
            id: 'v4',
            timestamp: now - 6 * DAY,
            author: 'Jason Hansen',
            label: 'Tech Circle W-2 Import',
            changeType: 'document_import',
            description: 'Imported W-2 · Tech Circle Inc. (new employer tab)',
            dataSnapshot: snap4,
            changes: [
                { field: 'income.tcEmployerName', oldValue: '', newValue: 'Tech Circle Inc' },
                { field: 'income.tcW2Wages', oldValue: 0, newValue: 64304 },
                { field: 'income.tcFedTaxWithheld', oldValue: 0, newValue: 5987 },
                { field: 'income.tcSsWages', oldValue: 0, newValue: 64304 },
                { field: 'income.tcSsTaxWithheld', oldValue: 0, newValue: 3987 },
                { field: 'income.tcMedicareWages', oldValue: 0, newValue: 64304 },
                { field: 'income.tcMedicareTax', oldValue: 0, newValue: 932 },
            ],
            relatedFields: [
                'income.tcEmployerId', 'income.tcEmployerName', 'income.tcStreetAddress',
                'income.tcCity', 'income.tcState', 'income.tcZip',
                'income.tcW2Wages', 'income.tcFedTaxWithheld', 'income.tcSsWages',
                'income.tcSsTaxWithheld', 'income.tcMedicareWages', 'income.tcMedicareTax',
            ],
        },
        {
            id: 'v5',
            timestamp: now - 4 * DAY - 2 * HOUR,
            author: 'Sarah Miller',
            label: 'Capital Gains Entry',
            changeType: 'manual_entry',
            description: 'Entered capital gains — Investments',
            dataSnapshot: snap5,
            changes: [
                { field: 'investment.capitalGains', oldValue: 0, newValue: 8200 },
                { field: 'investment.shortTermGains', oldValue: 0, newValue: 1450 },
                { field: 'investment.stockSales', oldValue: '', newValue: 'AAPL 100sh · MSFT 50sh' },
            ],
            relatedFields: ['investment.capitalGains', 'investment.shortTermGains', 'investment.stockSales'],
        },
        {
            id: 'v6',
            timestamp: now - 3 * DAY,
            author: 'David Hansen',
            label: 'Alfred Dividend & Gains Update',
            changeType: 'api_import',
            apiSource: 'Alfred',
            description: 'Imported dividend & short-term gains data from Alfred API',
            dataSnapshot: snap6,
            changes: [
                { field: 'interest.dividendIncome', oldValue: 980, newValue: 1240 },
                { field: 'interest.qualifiedDividends', oldValue: 720, newValue: 940 },
                { field: 'investment.shortTermGains', oldValue: 1450, newValue: 2100 },
            ],
            relatedFields: [
                'interest.dividendIncome', 'interest.qualifiedDividends',
                'investment.shortTermGains',
            ],
        },
        // ── Yesterday ─────────────────────────────────────────────────────────────
        {
            id: 'v7',
            timestamp: now - DAY - 4 * HOUR,
            author: 'Sarah Miller',
            label: '1099-INT Citi Bank Import',
            changeType: 'document_import',
            description: 'Imported 1099-INT · Citi Bank',
            dataSnapshot: snap7,
            changes: [
                { field: 'interest.p2Name', oldValue: '', newValue: 'Citi Bank' },
                { field: 'interest.p2EIN', oldValue: '', newValue: '13-0000601' },
                { field: 'interest.p2Interest', oldValue: 0, newValue: 280 },
                { field: 'interest.p2FedTax', oldValue: 0, newValue: 0 },
                { field: 'interest.interestIncome', oldValue: 2840, newValue: 3120 },
            ],
            relatedFields: [
                'interest.p2Name', 'interest.p2EIN', 'interest.p2Interest',
                'interest.p2FedTax', 'interest.interestIncome', 'interest.sources',
            ],
        },
        {
            id: 'v8',
            timestamp: now - DAY - 1.5 * HOUR,
            author: 'David Hansen',
            label: 'Bing Equipment Wage Correction',
            changeType: 'manual_entry',
            description: 'Corrected W-2 wages · Bing Equipment',
            dataSnapshot: snap8,
            changes: [
                { field: 'income.w2Wages', oldValue: 78420, newValue: 79150 },
                { field: 'income.ssWages', oldValue: 78420, newValue: 79150 },
                { field: 'income.ssTaxWithheld', oldValue: 4862, newValue: 4907 },
                { field: 'income.medicareTax', oldValue: 1137, newValue: 1148 },
            ],
            relatedFields: [
                'income.w2Wages', 'income.ssWages', 'income.ssTaxWithheld',
                'income.medicareWages', 'income.medicareTax',
            ],
        },
        // ── Today ─────────────────────────────────────────────────────────────────
        {
            id: 'v9',
            timestamp: now - 3 * HOUR,
            author: 'Sarah Miller',
            label: 'Rental Property Entry',
            changeType: 'manual_entry',
            description: 'Entered rental property income & details',
            dataSnapshot: snap9,
            changes: [
                { field: 'other.rentalIncome', oldValue: 0, newValue: 4800 },
                { field: 'other.rentalExpenses', oldValue: 0, newValue: 1920 },
                { field: 'other.daysRented', oldValue: 0, newValue: 220 },
                { field: 'other.propertyAddress', oldValue: '', newValue: '4821 Oak Creek Lane' },
            ],
            relatedFields: [
                'other.propertyAddress', 'other.propertyCity', 'other.propertyState',
                'other.daysRented', 'other.rentalIncome', 'other.rentalExpenses',
            ],
        },
        {
            id: 'v10',
            timestamp: now - 45 * 60000,
            author: 'David Hansen',
            label: 'TaxDome K-1 Passive Income Import',
            changeType: 'api_import',
            apiSource: 'TaxDome',
            description: 'Imported K-1 partnership income from TaxDome API',
            dataSnapshot: snap10,
            changes: [
                { field: 'other.k1PartnerName', oldValue: '', newValue: 'Green Valley Partners LLC' },
                { field: 'other.passiveIncome', oldValue: 0, newValue: 2200 },
            ],
            relatedFields: ['other.k1PartnerName', 'other.passiveIncome'],
        },
    ];
    return {
        versions,
        currentVersionId: 'v10',
        createdAt: now - 34 * DAY,
        lastModified: now - 45 * 60000,
        schemaVersion: SCHEMA_VERSION,
    };
}
export const SCHEMA_VER = SCHEMA_VERSION;
export const SCREEN_LABELS = {
    income: 'Income',
    invest: 'Investments',
    interest: 'Interest & Dividends',
    others: 'Other Income',
    guides: 'Tax Guides',
};
