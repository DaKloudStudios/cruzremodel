import { Lead, LeadStatus, Client, CallLog, Estimate, EstimateStatus, Project, ProjectStatus, PricebookItem, ServiceTemplate } from '../types';

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'l1',
    name: 'Alice Johnson',
    phone: '555-0101',
    email: 'alice@test.com',
    address: '123 Maple Dr',
    serviceInterest: 'Lawn Mowing',
    status: LeadStatus.NEW,
    notes: 'Interested in weekly service. Saw truck in neighborhood.',
    dateCreated: new Date().toISOString(),
    nextAction: 'Call to schedule visit',
    nextActionDate: new Date().toISOString(), // Due today
    tags: ['Maintenance', 'Residential']
  },
  {
    id: 'l2',
    name: 'Bob Smith',
    phone: '555-0102',
    address: '456 Oak Ln',
    serviceInterest: 'Hardscaping',
    status: LeadStatus.SITE_VISIT,
    notes: 'Needs a patio quote. Wants pavers.',
    dateCreated: new Date(Date.now() - 86400000).toISOString(),
    nextAction: 'Visit Property',
    nextActionDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    tags: ['Installation', 'High Value']
  },
  {
    id: 'l3',
    name: 'Charlie Davis',
    phone: '555-0103',
    address: '789 Pine St',
    serviceInterest: 'Tree Removal',
    status: LeadStatus.PROPOSAL_SENT,
    notes: 'Large oak tree near house. Proposal sent via email.',
    dateCreated: new Date(Date.now() - 172800000).toISOString(),
    nextAction: 'Follow up on quote',
    nextActionDate: new Date(Date.now() - 86400000).toISOString(), // Overdue
    tags: ['Tree Service']
  }
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'Evergreen Apartments',
    phone: '555-9999',
    email: 'manager@evergreen.com',
    address: '900 Main St',
    totalSpent: 12500,
    propertyNotes: 'Gate code 1234. Park in rear.',
    gateCode: '1234',
    preferredContact: 'Email',
    tags: ['Commercial', 'Maintenance', 'VIP'],
    dateCreated: new Date(Date.now() - 1000000000).toISOString()
  },
  {
    id: 'c2',
    name: 'Martha Stewart',
    phone: '555-8888',
    email: 'martha@example.com',
    address: '55 Estate Blvd',
    totalSpent: 4500,
    propertyNotes: 'Dog in backyard (Buster). Knock first.',
    gateCode: '',
    preferredContact: 'Phone',
    tags: ['Maintenance', 'HOA'],
    dateCreated: new Date(Date.now() - 500000000).toISOString()
  }
];

export const INITIAL_CALLS: CallLog[] = [
  {
    id: 'cl1',
    clientId: 'c2', // Linked to Martha
    contactName: 'Martha Stewart',
    phone: '555-8888',
    date: new Date().toISOString(),
    durationMinutes: 5,
    outcome: 'Scheduled Estimate',
    notes: 'Customer wants spring cleanup ASAP.',
    type: 'Outbound',
    followUpDate: undefined
  },
  {
    id: 'cl2',
    contactName: 'Unknown Caller',
    phone: '555-0000',
    date: new Date(Date.now() - 3600000).toISOString(),
    durationMinutes: 1,
    outcome: 'No Answer',
    notes: 'Left voicemail regarding flyer.',
    type: 'Outbound',
    followUpDate: new Date(Date.now() + 86400000).toISOString() // Tomorrow
  }
];

export const INITIAL_ESTIMATES: Estimate[] = [
  {
    id: 'e1',
    clientId: 'c2',
    clientName: 'Martha Stewart',
    items: [
      { id: 'i1', type: 'Labor', description: 'Spring Cleanup', quantity: 8, cost: 20, markupPercent: 0, rate: 65, total: 520 },
      { id: 'i2', type: 'Material', description: 'Mulch (Yards)', quantity: 4, cost: 45, markupPercent: 50, rate: 67.5, total: 270 }
    ],
    total: 790,
    status: EstimateStatus.SENT,
    dateCreated: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    validUntil: new Date(Date.now() + 604800000).toISOString(),
    pricingSnapshot: {
      overheadPerManHour: 22.50,
      laborBurdenPercent: 15,
      targetMarginPercent: 20,
      baseLaborCost: 20,
      targetHourlyRate: 65,
      materialMarkupPercent: 50
    },
    adjustments: { tripCharge: false, emergencySurcharge: false, applyTax: false, taxLabor: false, taxRate: 8, minJobFeeApplied: false },
    proposalSettings: {
      title: 'Spring Cleanup Proposal',
      introMessage: 'We appreciate the opportunity to provide this proposal. Please review the scope below.',
      coverImageTheme: 'Modern',
      showLineItemPricing: true,
      showTotals: true
    }
  },
  {
    id: 'e2',
    clientId: 'c1',
    clientName: 'Evergreen Apartments',
    items: [
      { id: 'i3', type: 'Labor', description: 'Irrigation Repair', quantity: 4, cost: 20, markupPercent: 0, rate: 65, total: 260 },
      { id: 'i4', type: 'Material', description: 'Rotor Heads', quantity: 10, cost: 12.50, markupPercent: 50, rate: 18.75, total: 187.50 }
    ],
    total: 447.50,
    status: EstimateStatus.DRAFT,
    dateCreated: new Date(Date.now() - 86400000).toISOString(),
    lastUpdated: new Date(Date.now() - 86400000).toISOString(),
    validUntil: new Date(Date.now() + 604800000).toISOString(),
    pricingSnapshot: {
      overheadPerManHour: 22.50,
      laborBurdenPercent: 15,
      targetMarginPercent: 20,
      baseLaborCost: 20,
      targetHourlyRate: 65,
      materialMarkupPercent: 50
    },
    adjustments: { tripCharge: false, emergencySurcharge: false, applyTax: false, taxLabor: false, taxRate: 8, minJobFeeApplied: false },
    proposalSettings: {
      title: 'Irrigation Repair Proposal',
      introMessage: 'Repair estimate for zone 4 irrigation issues.',
      coverImageTheme: 'Modern',
      showLineItemPricing: true,
      showTotals: true
    }
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p1',
    clientId: 'c1',
    clientName: 'Evergreen Apartments',
    estimateId: 'old-est-1',
    name: 'Weekly Maintenance',
    status: ProjectStatus.IN_PROGRESS,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 2592000000).toISOString(),
    revenue: 2500,
    description: 'Weekly mowing and edging',
    assignedCrewIds: [],
    completionPercent: 35,
    tasks: [
      { id: 't1', description: 'Mow front lawn', isCompleted: true },
      { id: 't2', description: 'Edge walkways', isCompleted: true },
      { id: 't3', description: 'Blow debris', isCompleted: false },
      { id: 't4', description: 'Trim hedges', isCompleted: false }
    ],
    materialStatus: [],
    changeOrders: [],
    notes: [
      { id: 'n1', date: new Date().toISOString(), author: 'System', content: 'Project created from estimate.', type: 'Milestone' }
    ],
    estimatedLaborHours: 40
  }
];

export const INITIAL_PRICEBOOK: PricebookItem[] = [
  // --- EXISTING ITEMS ---
  {
    id: 'pb1',
    name: 'Black Mulch - Premium',
    category: 'Softscape',
    vendor: 'SiteOne',
    cost: 42.50,
    unit: 'Cu. Yard',
    markupPercent: 50,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'pb2',
    name: 'Red Shredded Mulch',
    category: 'Softscape',
    vendor: 'Home Depot',
    cost: 3.85,
    unit: 'Bag (2cf)',
    markupPercent: 65,
    lastUpdated: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'pb3',
    name: 'Belgard Pavers (Holland Stone)',
    category: 'Hardscape',
    vendor: 'Ewing Hardscape',
    cost: 4.25,
    unit: 'Sq. Ft.',
    markupPercent: 25,
    lastUpdated: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'pb4',
    name: 'Topsoil - Screened',
    category: 'Softscape',
    vendor: 'Local Quarry',
    cost: 35.00,
    unit: 'Cu. Yard',
    markupPercent: 50,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'pb5',
    name: 'Rainbird 5000 Rotor',
    category: 'Irrigation',
    vendor: 'SiteOne',
    cost: 12.50,
    unit: 'Each',
    markupPercent: 80,
    lastUpdated: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'pb6',
    name: 'Kentucky Bluegrass Sod',
    category: 'Softscape',
    vendor: 'Green Acres',
    cost: 0.65,
    unit: 'Sq. Ft.',
    markupPercent: 40,
    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },

  // --- CONCRETE ITEMS ---
  {
    id: 'conc-1',
    name: 'Concrete 3000 PSI',
    category: 'Hardscape',
    vendor: 'ReadyMix Co',
    cost: 145.00,
    unit: 'Cu. Yard',
    markupPercent: 20,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'conc-2',
    name: 'Road Base (Gravel)',
    category: 'Hardscape',
    vendor: 'Local Quarry',
    cost: 45.00,
    unit: 'Ton',
    markupPercent: 30,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'conc-3',
    name: 'Rebar #3 (10ft)',
    category: 'Hardscape',
    vendor: 'Steel Supply',
    cost: 12.00,
    unit: 'Stick',
    markupPercent: 30,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'conc-4',
    name: 'Wire Mesh (Roll)',
    category: 'Hardscape',
    vendor: 'Home Depot',
    cost: 150.00,
    unit: 'Roll',
    markupPercent: 25,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'conc-5',
    name: 'Form Boards 2x4',
    category: 'Hardscape',
    vendor: 'Lumber Yard',
    cost: 1.25,
    unit: 'Linear Ft.',
    markupPercent: 30,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'conc-6',
    name: 'Concrete Pump Truck',
    category: 'Hardscape',
    vendor: 'Pumps R Us',
    cost: 850.00,
    unit: 'Day',
    markupPercent: 15,
    lastUpdated: new Date().toISOString()
  },
  // --- SYNTHETIC TURF ITEMS ---
  {
    id: 'turf-1',
    name: 'Premium Fescue (80oz)',
    category: 'Softscape',
    vendor: 'Turf Distributor',
    cost: 2.25,
    unit: 'Sq. Ft.',
    markupPercent: 40,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'turf-2',
    name: 'Pet Pro Turf (60oz)',
    category: 'Softscape',
    vendor: 'Turf Distributor',
    cost: 2.65,
    unit: 'Sq. Ft.',
    markupPercent: 40,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'turf-3',
    name: 'Decomposed Granite (Fines)',
    category: 'Hardscape',
    vendor: 'Local Quarry',
    cost: 55.00,
    unit: 'Ton',
    markupPercent: 30,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'turf-4',
    name: 'Weed Barrier (Commercial)',
    category: 'Softscape',
    vendor: 'SiteOne',
    cost: 0.15,
    unit: 'Sq. Ft.',
    markupPercent: 50,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'turf-5',
    name: 'Silica Sand (50lb Bag)',
    category: 'Hardscape',
    vendor: 'Home Depot',
    cost: 8.50,
    unit: 'Bag',
    markupPercent: 40,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'turf-6',
    name: 'Zeolite Pet Infill (50lb)',
    category: 'Hardscape',
    vendor: 'Specialty Supply',
    cost: 22.00,
    unit: 'Bag',
    markupPercent: 35,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'turf-7',
    name: 'Turf Glue (1 Gal)',
    category: 'Other',
    vendor: 'Supply Co',
    cost: 65.00,
    unit: 'Each',
    markupPercent: 30,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'turf-8',
    name: 'Seam Tape (12" Wide)',
    category: 'Other',
    vendor: 'Supply Co',
    cost: 0.75,
    unit: 'Linear Ft.',
    markupPercent: 50,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'turf-9',
    name: '60D Galvanized Nails (50lb)',
    category: 'Other',
    vendor: 'Home Depot',
    cost: 85.00,
    unit: 'Box',
    markupPercent: 30,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'turf-10',
    name: 'Dump Fee (Mixed Debris)',
    category: 'Other',
    vendor: 'Landfill',
    cost: 65.00,
    unit: 'Ton',
    markupPercent: 15,
    lastUpdated: new Date().toISOString()
  },
];

export const INITIAL_TEMPLATES: ServiceTemplate[] = [
  {
    id: 't1',
    name: 'Mulch Installation',
    description: 'Install premium hardwood mulch to 3" depth.',
    rateUnit: 'Cu. Yard',
    productionRate: 1.5, // 1.5 CY per man-hour
    linkedPricebookItemId: 'pb1', // Black Mulch
    category: 'Softscape'
  },
  {
    id: 't2',
    name: 'Weekly Mowing',
    description: 'Mow, trim, edge, and blow hard surfaces.',
    rateUnit: 'Sq. Ft.',
    productionRate: 15000,
    linkedPricebookItemId: undefined,
    category: 'General'
  },
  {
    id: 't3',
    name: 'Sod Installation',
    description: 'Fine grading and installation of sod rolls.',
    rateUnit: 'Sq. Ft.',
    productionRate: 400, // 400 sqft per man-hour
    linkedPricebookItemId: 'pb6', // KY Bluegrass Sod
    category: 'Softscape'
  },
  {
    id: 't4',
    name: 'Paver Patio Install',
    description: 'Base prep, screeding, and laying pavers.',
    rateUnit: 'Sq. Ft.',
    productionRate: 10, // 10 sqft per man-hour (slow due to prep)
    linkedPricebookItemId: 'pb3', // Belgard Pavers
    category: 'Hardscape'
  }
];