export interface TaxReturnData {
  income?: {
    // Primary employer (Bing Equipment)
    employerId: string;
    employerName: string;
    streetAddress: string;
    city: string;
    state: string;
    zip: string;
    w2Wages: number;
    fedTaxWithheld: number;
    ssWages: number;
    ssTaxWithheld: number;
    medicareWages: number;
    medicareTax: number;
    seIncome: number;
    notes: string;
    // Second employer (Tech Circle — OCR import)
    tcEmployerId: string;
    tcEmployerName: string;
    tcStreetAddress: string;
    tcCity: string;
    tcState: string;
    tcZip: string;
    tcW2Wages: number;
    tcFedTaxWithheld: number;
    tcSsWages: number;
    tcSsTaxWithheld: number;
    tcMedicareWages: number;
    tcMedicareTax: number;
  };
  investment?: {
    capitalGains: number;      // long-term
    shortTermGains: number;    // short-term
    stockSales: string;
    notes: string;
  };
  interest?: {
    // Payer 1 — First Federal Savings (TaxDome API import)
    p1Name: string;
    p1EIN: string;
    p1Interest: number;
    p1FedTax: number;
    // Payer 2 — Citi Bank (1099-INT document import)
    p2Name: string;
    p2EIN: string;
    p2Interest: number;
    p2FedTax: number;
    // Dividends
    dividendIncome: number;
    qualifiedDividends: number;
    // Totals / summary
    interestIncome: number;
    sources: string;
    notes: string;
  };
  other?: {
    // Rental property
    propertyAddress: string;
    propertyCity: string;
    propertyState: string;
    daysRented: number;
    rentalIncome: number;
    rentalExpenses: number;
    // K-1 / passive income
    k1PartnerName: string;
    passiveIncome: number;
    notes: string;
  };
  guides?: {
    selectedGuides: string[];
  };
}

export interface Change {
  field: string;
  oldValue: any;
  newValue: any;
}

export type ChangeType = 'manual_entry' | 'document_import' | 'api_import' | 'revert' | 'copy';

export interface Version {
  id: string;
  timestamp: number;
  author: string;
  label: string;
  changeType: ChangeType;
  description: string;
  dataSnapshot: TaxReturnData;
  changes?: Change[];
  relatedFields?: string[];
  apiSource?: string;
}

export interface AuditLog {
  versions: Version[];
  currentVersionId: string;
  createdAt: number;
  lastModified: number;
  schemaVersion?: number;
}

export interface FilterState {
  dateFrom?: number;
  dateTo?: number;
  author?: string;
  changeType?: string;   // 'manual_entry' | 'document_import' | 'api_import'
  searchQuery?: string;
}
