export type FieldType = 'STRING' | 'CURRENCY' | 'BOOLEAN' | 'DATE' | 'SSN' | 'ENUM'
export type FieldScope = 'FEDERAL' | 'CA' | 'NY' | 'TX' | 'FL' | 'IL'
export type PrefixMode = 'static' | 'multi'
export type TaxpayerMode = 'TP' | 'SP' | 'Both'

export interface EnumValue {
  value: string
  label: string
}

export interface TaxField {
  sectionId: string
  label: string
  codeId: string
  type: FieldType
  scope: FieldScope
  prefix: PrefixMode
  taxpayer: TaxpayerMode
  maxLength?: number
  multiValue?: boolean   // true = suffix 1000+ (1000, 1001, 1002…); false/absent = suffix 1000 only
  enumValues?: EnumValue[]
}

export interface TaxSection {
  id: string
  category: string
  label: string
  seriesId: string
  prefix: PrefixMode
}

export interface Agency {
  value: string
  label: string
  stateCode?: string
}

export const RETURN_TYPES = [
  'Individual 1040',
  'Business 1120',
  'Partnership 1065',
  'S-Corp 1120S',
  'Fiduciary 1041',
]

export const AGENCIES: Agency[] = [
  { value: 'federal',    label: 'Federal' },
  { value: 'federal+ca', label: 'Federal + California', stateCode: 'CA' },
  { value: 'federal+ny', label: 'Federal + New York',   stateCode: 'NY' },
  { value: 'federal+tx', label: 'Federal + Texas',      stateCode: 'TX' },
  { value: 'federal+fl', label: 'Federal + Florida',    stateCode: 'FL' },
  { value: 'federal+il', label: 'Federal + Illinois',   stateCode: 'IL' },
]

export const SECTIONS: TaxSection[] = [
  // General
  { id: 'client-info',     category: 'General',      label: 'Client Information',             seriesId: '1',    prefix: 'static' },
  { id: 'dependents',      category: 'General',      label: 'Dependents',                     seriesId: '2',    prefix: 'multi'  },
  { id: 'misc-direct',     category: 'General',      label: 'Misc. Info./Direct Deposit',     seriesId: '3',    prefix: 'static' },
  { id: 'community-prop',  category: 'General',      label: 'Community Property Allocation',  seriesId: '3.1',  prefix: 'multi'  },
  { id: 'e-filing',        category: 'General',      label: 'Electronic Filing',              seriesId: '4.1',  prefix: 'static' },
  // Income
  { id: 'wages',           category: 'Income',       label: 'Wages and salaries',             seriesId: '10',   prefix: 'multi'  },
  { id: 'interest',        category: 'Income',       label: 'Interest Income (1099-INT-OID)', seriesId: '11',   prefix: 'multi'  },
  { id: 'dividends',       category: 'Income',       label: 'Dividend Income (1099-DIV)',     seriesId: '12',   prefix: 'multi'  },
  { id: 'pensions',        category: 'Income',       label: 'Pensions, IRAs (1099-R)',        seriesId: '13.1', prefix: 'multi'  },
  { id: 'gambling',        category: 'Income',       label: 'Gambling Winnings (W-2G)',       seriesId: '13.2', prefix: 'multi'  },
  { id: 'business',        category: 'Income',       label: 'Business Income (Sch C)',        seriesId: '16',   prefix: 'multi'  },
  { id: 'rental',          category: 'Income',       label: 'Rental and royalty income',      seriesId: '18',   prefix: 'multi'  },
  // Deductions
  { id: 'depreciation',   category: 'Deductions',   label: 'Depreciation',                   seriesId: '22',   prefix: 'multi'  },
  { id: 'itemized',        category: 'Deductions',   label: 'Itemized Deductions (Sch A)',    seriesId: '25',   prefix: 'static' },
  // Credits
  { id: 'dep-care',        category: 'Credits',      label: 'Dependent Care Credit (2441)',   seriesId: '31',   prefix: 'multi'  },
  // State & Local
  { id: 'state-local',     category: 'State & Local', label: 'Modifications / Adjustments',  seriesId: '60',   prefix: 'multi'  },
]

export const FIELDS: TaxField[] = [
  // ── Client Information (S1) ──────────────────────────────────────────────
  { sectionId: 'client-info', label: 'First Name & Initial',   codeId: '1000100002', type: 'STRING',   scope: 'FEDERAL', prefix: 'static', taxpayer: 'Both', maxLength: 35 },
  { sectionId: 'client-info', label: 'Last Name',              codeId: '1000100004', type: 'STRING',   scope: 'FEDERAL', prefix: 'static', taxpayer: 'Both', maxLength: 35 },
  { sectionId: 'client-info', label: 'Social Security No.',    codeId: '11',         type: 'SSN',      scope: 'FEDERAL', prefix: 'static', taxpayer: 'Both', maxLength: 9 },
  { sectionId: 'client-info', label: 'Occupation',             codeId: '25',         type: 'STRING',   scope: 'FEDERAL', prefix: 'static', taxpayer: 'Both', maxLength: 35 },
  { sectionId: 'client-info', label: 'Date of Birth',          codeId: '8',          type: 'DATE',     scope: 'FEDERAL', prefix: 'static', taxpayer: 'Both', maxLength: 10 },
  { sectionId: 'client-info', label: 'Filing Status',          codeId: '1000100010', type: 'ENUM',     scope: 'FEDERAL', prefix: 'static', taxpayer: 'TP',
    enumValues: [
      { value: '1', label: 'Single' },
      { value: '2', label: 'Married filing jointly' },
      { value: '3', label: 'Married filing separately' },
      { value: '4', label: 'Head of household' },
      { value: '5', label: 'Qualifying surviving spouse' },
    ]
  },

  // ── Dependents (S2) ──────────────────────────────────────────────────────
  { sectionId: 'dependents', label: 'First Name',              codeId: '1000200008', type: 'STRING',   scope: 'FEDERAL', prefix: 'multi', taxpayer: 'TP', maxLength: 16 },
  { sectionId: 'dependents', label: 'Last Name',               codeId: '1000200009', type: 'STRING',   scope: 'FEDERAL', prefix: 'multi', taxpayer: 'TP', maxLength: 16 },
  { sectionId: 'dependents', label: 'Relationship',            codeId: '1000200004', type: 'ENUM',     scope: 'FEDERAL', prefix: 'multi', taxpayer: 'TP',
    enumValues: [
      { value: '1', label: 'Child living with taxpayer' },
      { value: '2', label: 'Child not living with taxpayer' },
      { value: '3', label: 'Stepchild' },
      { value: '4', label: 'Foster child' },
      { value: '5', label: 'Parent' },
      { value: '6', label: 'Other' },
    ]
  },
  { sectionId: 'dependents', label: '1-Child Tax Credit',      codeId: '1000200013', type: 'BOOLEAN',  scope: 'FEDERAL', prefix: 'multi', taxpayer: 'TP', maxLength: 1 },
  { sectionId: 'dependents', label: 'Date of Birth',           codeId: '1000200005', type: 'DATE',     scope: 'FEDERAL', prefix: 'multi', taxpayer: 'TP', maxLength: 10 },
  { sectionId: 'dependents', label: 'Social Security No.',     codeId: '1000200006', type: 'SSN',      scope: 'FEDERAL', prefix: 'multi', taxpayer: 'TP', maxLength: 9 },

  // ── Misc. Info / Direct Deposit (S3) ─────────────────────────────────────
  { sectionId: 'misc-direct', label: 'Bank Name',              codeId: '100',        type: 'STRING',   scope: 'FEDERAL', prefix: 'static', taxpayer: 'TP', maxLength: 35 },
  { sectionId: 'misc-direct', label: 'Routing Number',         codeId: '101',        type: 'STRING',   scope: 'FEDERAL', prefix: 'static', taxpayer: 'TP', maxLength: 9 },
  { sectionId: 'misc-direct', label: 'Account Number',         codeId: '102',        type: 'STRING',   scope: 'FEDERAL', prefix: 'static', taxpayer: 'TP', maxLength: 17 },
  { sectionId: 'misc-direct', label: 'Account Type',           codeId: '103',        type: 'ENUM',     scope: 'FEDERAL', prefix: 'static', taxpayer: 'TP',
    enumValues: [
      { value: '1', label: 'Checking' },
      { value: '2', label: 'Savings' },
    ]
  },
  { sectionId: 'misc-direct', label: 'Amount to Deposit',      codeId: '104',        type: 'CURRENCY', scope: 'FEDERAL', prefix: 'static', taxpayer: 'TP' },

  // ── Community Property Allocation (S3.1) ─────────────────────────────────
  { sectionId: 'community-prop', label: 'Spouse First Name',   codeId: '1',          type: 'STRING',   scope: 'FEDERAL', prefix: 'multi', taxpayer: 'SP', maxLength: 35 },
  { sectionId: 'community-prop', label: 'Spouse SSN',          codeId: '2',          type: 'SSN',      scope: 'FEDERAL', prefix: 'multi', taxpayer: 'SP', maxLength: 9 },
  { sectionId: 'community-prop', label: 'Community Prop State',codeId: '3',          type: 'STRING',   scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', maxLength: 2 },
  { sectionId: 'community-prop', label: 'Allocated Income',    codeId: '10',         type: 'CURRENCY', scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', maxLength: 15 },

  // ── Electronic Filing (S4.1) ──────────────────────────────────────────────
  { sectionId: 'e-filing', label: 'ERO PIN',                   codeId: '1',          type: 'STRING',   scope: 'FEDERAL', prefix: 'static', taxpayer: 'TP', maxLength: 5 },
  { sectionId: 'e-filing', label: 'PTIN',                      codeId: '2',          type: 'STRING',   scope: 'FEDERAL', prefix: 'static', taxpayer: 'TP', maxLength: 9 },
  { sectionId: 'e-filing', label: 'EFIN',                      codeId: '3',          type: 'STRING',   scope: 'FEDERAL', prefix: 'static', taxpayer: 'TP', maxLength: 6 },
  { sectionId: 'e-filing', label: 'Firm Name',                 codeId: '4',          type: 'STRING',   scope: 'FEDERAL', prefix: 'static', taxpayer: 'TP', maxLength: 35 },

  // ── Wages, Salaries, Tips (S10) ───────────────────────────────────────────
  { sectionId: 'wages', label: 'Name of employer',             codeId: '800',        type: 'STRING',   scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', maxLength: 57 },
  { sectionId: 'wages', label: 'Employer EIN',                 codeId: '801',        type: 'STRING',   scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', maxLength: 9 },
  { sectionId: 'wages', label: 'Wages, tips, other comp.',     codeId: '3',          type: 'CURRENCY', scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', multiValue: true, maxLength: 15 },
  { sectionId: 'wages', label: 'Federal income tax withheld',  codeId: '4',          type: 'CURRENCY', scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', multiValue: true, maxLength: 15 },
  { sectionId: 'wages', label: 'Social security wages',        codeId: '5',          type: 'CURRENCY', scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', multiValue: true, maxLength: 15 },
  { sectionId: 'wages', label: 'Social security tax withheld', codeId: '6',          type: 'CURRENCY', scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', multiValue: true, maxLength: 15 },
  { sectionId: 'wages', label: 'Medicare wages and tips',      codeId: '7',          type: 'CURRENCY', scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', multiValue: true, maxLength: 15 },
  { sectionId: 'wages', label: 'Medicare tax withheld',        codeId: '8',          type: 'CURRENCY', scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', multiValue: true, maxLength: 15 },
  { sectionId: 'wages', label: 'State',                        codeId: '14',         type: 'STRING',   scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', maxLength: 2 },
  { sectionId: 'wages', label: 'State wages',                  codeId: '16',         type: 'CURRENCY', scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', multiValue: true, maxLength: 15 },
  { sectionId: 'wages', label: 'State income tax',             codeId: '17',         type: 'CURRENCY', scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', multiValue: true, maxLength: 15 },
  { sectionId: 'wages', label: 'State SDI',                    codeId: '15',         type: 'CURRENCY', scope: 'CA',      prefix: 'multi', taxpayer: 'Both', multiValue: true, maxLength: 15 },

  // ── Interest Income (S11) ────────────────────────────────────────────────
  { sectionId: 'interest', label: 'Payer name',                codeId: '100',        type: 'STRING',   scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', maxLength: 40 },
  { sectionId: 'interest', label: 'Payer EIN',                 codeId: '101',        type: 'STRING',   scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', maxLength: 9 },
  { sectionId: 'interest', label: 'Interest income',           codeId: '1',          type: 'CURRENCY', scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', multiValue: true, maxLength: 15 },
  { sectionId: 'interest', label: 'Tax-exempt interest',       codeId: '8',          type: 'CURRENCY', scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', multiValue: true, maxLength: 15 },
  { sectionId: 'interest', label: 'Bond premium',              codeId: '11',         type: 'CURRENCY', scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', multiValue: true, maxLength: 15 },
  { sectionId: 'interest', label: 'Original issue discount',   codeId: '13',         type: 'CURRENCY', scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', multiValue: true, maxLength: 15 },

  // ── Dividend Income (S12) ─────────────────────────────────────────────────
  { sectionId: 'dividends', label: 'Payer name',               codeId: '100',        type: 'STRING',   scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', maxLength: 40 },
  { sectionId: 'dividends', label: 'Payer EIN',                codeId: '101',        type: 'STRING',   scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', maxLength: 9 },
  { sectionId: 'dividends', label: 'Total ordinary dividends', codeId: '1',          type: 'CURRENCY', scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', multiValue: true, maxLength: 15 },
  { sectionId: 'dividends', label: 'Qualified dividends',      codeId: '2',          type: 'CURRENCY', scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', multiValue: true, maxLength: 15 },
  { sectionId: 'dividends', label: 'Capital gain distributions',codeId: '3',         type: 'CURRENCY', scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', multiValue: true, maxLength: 15 },
  { sectionId: 'dividends', label: 'Foreign tax paid',         codeId: '7',          type: 'CURRENCY', scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', multiValue: true, maxLength: 15 },

  // ── Pensions, IRAs (S13.1) ────────────────────────────────────────────────
  { sectionId: 'pensions', label: 'Payer name',                codeId: '100',        type: 'STRING',   scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', maxLength: 40 },
  { sectionId: 'pensions', label: 'Payer EIN',                 codeId: '101',        type: 'STRING',   scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', maxLength: 9 },
  { sectionId: 'pensions', label: 'Gross distribution',        codeId: '1',          type: 'CURRENCY', scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', multiValue: true, maxLength: 15 },
  { sectionId: 'pensions', label: 'Taxable amount',            codeId: '2',          type: 'CURRENCY', scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', multiValue: true, maxLength: 15 },
  { sectionId: 'pensions', label: 'Federal income tax withheld',codeId: '4',         type: 'CURRENCY', scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', multiValue: true, maxLength: 15 },
  { sectionId: 'pensions', label: 'Distribution code',         codeId: '7',          type: 'ENUM',     scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both',
    enumValues: [
      { value: '1', label: 'Early distribution, no known exception' },
      { value: '2', label: 'Early distribution, exception applies' },
      { value: '3', label: 'Disability' },
      { value: '4', label: 'Death' },
      { value: '7', label: 'Normal distribution' },
      { value: 'G', label: 'Direct rollover' },
    ]
  },

  // ── Gambling Winnings (S13.2) ─────────────────────────────────────────────
  { sectionId: 'gambling', label: 'Payer name',                codeId: '100',        type: 'STRING',   scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', maxLength: 40 },
  { sectionId: 'gambling', label: 'Gross winnings',            codeId: '1',          type: 'CURRENCY', scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', maxLength: 15 },
  { sectionId: 'gambling', label: 'Federal income tax withheld',codeId: '4',         type: 'CURRENCY', scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', maxLength: 15 },
  { sectionId: 'gambling', label: 'State winnings',            codeId: '14',         type: 'CURRENCY', scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', maxLength: 15 },

  // ── Business Income (S16) ─────────────────────────────────────────────────
  { sectionId: 'business', label: 'Business name',             codeId: '1',          type: 'STRING',   scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', maxLength: 35 },
  { sectionId: 'business', label: 'Business EIN',              codeId: '7',          type: 'STRING',   scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', maxLength: 9 },
  { sectionId: 'business', label: 'Principal business code',   codeId: '2',          type: 'STRING',   scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', maxLength: 6 },
  { sectionId: 'business', label: 'Business address',          codeId: '3',          type: 'STRING',   scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', maxLength: 35 },
  { sectionId: 'business', label: 'Gross receipts',            codeId: '4',          type: 'CURRENCY', scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', maxLength: 15 },
  { sectionId: 'business', label: 'Cost of goods sold',        codeId: '5',          type: 'CURRENCY', scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', maxLength: 15 },
  { sectionId: 'business', label: 'Net profit or loss',        codeId: '6',          type: 'CURRENCY', scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', maxLength: 15 },

  // ── Rental & Royalty Income (S18) ─────────────────────────────────────────
  { sectionId: 'rental', label: 'Property address',            codeId: '5',          type: 'STRING',   scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', maxLength: 45 },
  { sectionId: 'rental', label: 'Property type',               codeId: '6',          type: 'ENUM',     scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both',
    enumValues: [
      { value: '1', label: 'Single family residence' },
      { value: '2', label: 'Multi-family residence' },
      { value: '3', label: 'Vacation / short-term rental' },
      { value: '4', label: 'Commercial' },
      { value: '5', label: 'Land' },
      { value: '6', label: 'Royalties' },
      { value: '7', label: 'Self-rental' },
      { value: '8', label: 'Other' },
    ]
  },
  { sectionId: 'rental', label: 'Days rented',                 codeId: '3',          type: 'STRING',   scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', maxLength: 3 },
  { sectionId: 'rental', label: 'Rental income',               codeId: '1',          type: 'CURRENCY', scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', maxLength: 15 },
  { sectionId: 'rental', label: 'Rental expenses',             codeId: '2',          type: 'CURRENCY', scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', maxLength: 15 },
  { sectionId: 'rental', label: 'Depreciation',                codeId: '7',          type: 'CURRENCY', scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', maxLength: 15 },

  // ── Depreciation (S22) ───────────────────────────────────────────────────
  { sectionId: 'depreciation', label: 'Description of property', codeId: '1',        type: 'STRING',   scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', maxLength: 35 },
  { sectionId: 'depreciation', label: 'Date placed in service',  codeId: '2',        type: 'DATE',     scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', maxLength: 10 },
  { sectionId: 'depreciation', label: 'Cost or other basis',     codeId: '3',        type: 'CURRENCY', scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', maxLength: 15 },
  { sectionId: 'depreciation', label: 'Recovery period',         codeId: '4',        type: 'STRING',   scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', maxLength: 5 },
  { sectionId: 'depreciation', label: 'Depreciation deduction',  codeId: '5',        type: 'CURRENCY', scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', maxLength: 15 },

  // ── Itemized Deductions (S25) ─────────────────────────────────────────────
  { sectionId: 'itemized', label: 'Medical expenses',            codeId: '1',        type: 'CURRENCY', scope: 'FEDERAL', prefix: 'static', taxpayer: 'Both', maxLength: 15 },
  { sectionId: 'itemized', label: 'State and local taxes',       codeId: '2',        type: 'CURRENCY', scope: 'FEDERAL', prefix: 'static', taxpayer: 'Both', maxLength: 15 },
  { sectionId: 'itemized', label: 'Mortgage interest',           codeId: '3',        type: 'CURRENCY', scope: 'FEDERAL', prefix: 'static', taxpayer: 'Both', maxLength: 15 },
  { sectionId: 'itemized', label: 'Charitable contributions',    codeId: '4',        type: 'CURRENCY', scope: 'FEDERAL', prefix: 'static', taxpayer: 'Both', maxLength: 15 },
  { sectionId: 'itemized', label: 'Casualty and theft losses',   codeId: '5',        type: 'CURRENCY', scope: 'FEDERAL', prefix: 'static', taxpayer: 'Both', maxLength: 15 },

  // ── Dependent Care Credit (S31) ───────────────────────────────────────────
  { sectionId: 'dep-care', label: 'Provider name',               codeId: '1',        type: 'STRING',   scope: 'FEDERAL', prefix: 'multi', taxpayer: 'TP', maxLength: 35 },
  { sectionId: 'dep-care', label: 'Provider address',            codeId: '2',        type: 'STRING',   scope: 'FEDERAL', prefix: 'multi', taxpayer: 'TP', maxLength: 35 },
  { sectionId: 'dep-care', label: 'Provider EIN / SSN',          codeId: '3',        type: 'SSN',      scope: 'FEDERAL', prefix: 'multi', taxpayer: 'TP', maxLength: 9 },
  { sectionId: 'dep-care', label: 'Amount paid',                 codeId: '4',        type: 'CURRENCY', scope: 'FEDERAL', prefix: 'multi', taxpayer: 'TP', maxLength: 15 },
  { sectionId: 'dep-care', label: 'Dependent name',              codeId: '5',        type: 'STRING',   scope: 'FEDERAL', prefix: 'multi', taxpayer: 'TP', maxLength: 35 },

  // ── State & Local Modifications (S60) ────────────────────────────────────
  { sectionId: 'state-local', label: 'Modification type',        codeId: '1',        type: 'STRING',   scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', maxLength: 10 },
  { sectionId: 'state-local', label: 'Adjustment amount',        codeId: '2',        type: 'CURRENCY', scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', maxLength: 15 },
  { sectionId: 'state-local', label: 'Description',              codeId: '3',        type: 'STRING',   scope: 'FEDERAL', prefix: 'multi', taxpayer: 'Both', maxLength: 35 },
  { sectionId: 'state-local', label: 'CA SDI withheld',          codeId: '15',       type: 'CURRENCY', scope: 'CA',      prefix: 'multi', taxpayer: 'Both', maxLength: 15 },
  { sectionId: 'state-local', label: 'CA state wages',           codeId: '16',       type: 'CURRENCY', scope: 'CA',      prefix: 'multi', taxpayer: 'Both', maxLength: 15 },
  { sectionId: 'state-local', label: 'NY city tax withheld',     codeId: '17',       type: 'CURRENCY', scope: 'NY',      prefix: 'multi', taxpayer: 'Both', maxLength: 15 },
]

export const CATEGORY_ORDER = ['General', 'Income', 'Deductions', 'Credits', 'State & Local']
