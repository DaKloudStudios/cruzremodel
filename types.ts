
export type ViewState = 'Dashboard' | 'Leads' | 'Clients' | 'Calls' | 'Estimates' | 'Projects' | 'Services' | 'Maintenance' | 'Calendar' | 'Pricebook' | 'Templates' | 'TimeClock' | 'ProposalViewer' | 'Settings' | 'DesignShowcase' | 'Gantt';

export type UserRole = 'Admin' | 'Office' | 'Foreman' | 'Laborer' | 'Deliverer' | 'Client';

export interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  allowedViews: ViewState[];
  dateAdded: string;
  photoUrl?: string;
  clientId?: string;
}

export interface TimeLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  clockIn: string;
  clockInLocation?: { lat: number, lng: number };
  projectId?: string;
  projectName?: string;
  photoUrl?: string;
  clockOut?: string | null; // Allow null for explicit Firestore querying
  clockOutPhotoUrl?: string;
  locationOut?: { lat: number, lng: number };
  durationMinutes?: number;
}

// --- NEW APPOINTMENT TYPE ---
export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientAddress?: string;
  title: string;
  date: string; // ISO Date String YYYY-MM-DD
  startTime: string; // "09:00"
  endTime: string; // "10:00"
  type: 'Site Visit' | 'Service Call' | 'Consultation' | 'Final Walkthrough';
  notes?: string;
  assignedTo?: string[]; // Array of employee IDs
  durationMinutes?: number;
}

export interface OverheadItem {
  id: string;
  name: string;
  amount: number;
  frequency: 'Monthly' | 'Annual';
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  payType: 'Hourly' | 'Salary';
  wage: number;
  laborBurdenPercent: number;
  utilizationPercent: number;
}

export interface BusinessProfile {
  businessName: string;
  currency: string;
  serviceArea: string;
  logoUrl?: string;
  email?: string;
  phone?: string;
  website?: string;
}

export interface BusinessSettings {
  profile: BusinessProfile;
  season: {
    weeksPerYear: number;
    daysPerWeek: number;
    hoursPerDay: number;
  };
  employees: Employee[];
  overhead: OverheadItem[];
  pricing: {
    targetMarginPercent: number;
    defaultMaterialMarkupPercent: number;
    taxLaborDefault: boolean;
  };
  rules: {
    minServiceCall: number;
    tripCharge: number;
    minHours: number;
    emergencySurchargePercent: number;
  };
  defaultTerms?: string;
  customTerms?: string;
  upsells?: ProposalUpsell[];
  showGallery?: boolean;
  galleryImages?: string[];
  showCompanyProfile?: boolean;
  companyProfileText?: string;
  showLineItemPricing?: boolean;
  showTotals?: boolean;
  coverImageTheme?: string;
  customCoverImageUrl?: string;
  accentColor?: string;
  fontFamily?: 'Sans' | 'Serif' | 'Mono';
  animationStyle?: 'None' | 'Fade' | 'Slide' | 'Zoom';
  isSetupComplete?: boolean;
}

export interface BusinessMetrics {
  overheadPerManHour: number;
  avgLaborBurdenPercent: number;
  avgHourlyWage: number;
  targetHourlyRate: number;
  productionDays?: number;
  seasonHours?: number;
  totalBillableHours?: number;
  totalAnnualCost?: number;
  totalOverhead?: number;
  breakEvenRate?: number;
}

export interface AppNotification {
  id: string;
  type: 'alert' | 'warning' | 'success' | 'info';
  title: string;
  message: string;
  timestamp: string;
  linkTo: ViewState;
}

export enum LeadStatus {
  NEW = 'New',
  CONTACTED = 'Contacted',
  SITE_VISIT = 'Site Visit',
  ESTIMATE_NEEDED = 'Estimate Needed',
  PROPOSAL_SENT = 'Proposal Sent',
  WON = 'Won',
  LOST = 'Lost'
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  serviceInterest: string;
  status: LeadStatus;
  notes: string;
  value?: number;
  dateCreated: string;
  nextAction?: string;
  nextActionDate?: string;
  tags?: string[];
  designProjectId?: string; // NEW: Link to a visual presentation
}

export type ClientTag = 'Maintenance' | 'Installation' | 'Irrigation' | 'Commercial' | 'HOA' | 'VIP' | 'Bad Payer' | 'New';

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  totalSpent: number;
  propertyNotes: string;
  gateCode: string;
  preferredContact: 'Phone' | 'Email' | 'Text';
  tags: ClientTag[];
  dateCreated: string;
}

export type CallOutcome = 'No Answer' | 'Left Voicemail' | 'Interested' | 'Scheduled Estimate' | 'Not Interested' | 'Service Question' | 'Other';

export interface CallLog {
  id: string;
  clientId?: string;
  leadId?: string;
  contactName: string;
  phone: string;
  date: string;
  durationMinutes: number;
  outcome: CallOutcome;
  notes: string;
  type: 'Inbound' | 'Outbound';
  followUpDate?: string;
  isFollowUpDone?: boolean;
}

export enum EstimateStatus {
  DRAFT = 'Draft',
  REVIEW_NEEDED = 'Review Needed',
  SENT = 'Sent',
  ACCEPTED = 'Accepted',
  DECLINED = 'Declined',
  EXPIRED = 'Expired'
}

// --- NEW ESTIMATING LOGIC TYPES ---
export interface SiteConditions {
  accessWidthInches: number;      // < 36 triggers hand labor
  soilType: 'Sand' | 'Clay' | 'Rocky';
  slopePercent: number;           // > 2 triggers regarding
  difficultyFactor: number;       // 1.1 - 1.5
  distanceToStreetFt: number;     // > 100 triggers pump
}

export interface EstimateZone {
  id: string;
  name: string;
  notes?: string;
}

export type EstimateItemType = 'Labor' | 'Material' | 'Equipment' | 'Subcontractor' | 'Fee';

export interface EstimateItem {
  id: string;
  type: EstimateItemType;
  description: string;
  quantity: number;
  cost: number;
  markupPercent: number;
  marginPercent?: number; // NEW: Standardize on margin for calculations
  rate: number;
  total: number;
  calcBasis?: string;
  isOverridden?: boolean;
  category?: string;       // Optional category for grouping (e.g. "Concrete", "Hardscape")
  sourcePricebookId?: string;
  unit?: string;           // NEW: Unit of measure (e.g., SF, CY, EA)
  zoneId?: string;       // NEW: Link to Zone
  assemblyId?: string;   // NEW: Link to source Assembly
}

export interface PricingSnapshot {
  overheadPerManHour: number;
  laborBurdenPercent: number;
  targetMarginPercent: number;
  baseLaborCost: number;
  targetHourlyRate: number;
  materialMarkupPercent: number;
}

export interface EstimateAdjustments {
  tripCharge: boolean;
  emergencySurcharge: boolean;
  applyTax: boolean;
  taxLabor: boolean;
  taxRate: number;
  minJobFeeApplied: boolean;
}

export interface ProposalUpsell {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface ProposalSettings {
  title: string;
  introMessage: string;
  coverImageTheme: 'Modern' | 'Natural' | 'Elegant' | 'Custom';
  customCoverImageUrl?: string;
  showLineItemPricing: boolean;
  showTotals: boolean;
  upsells?: ProposalUpsell[];
  animationStyle?: 'None' | 'Fade' | 'Slide' | 'Zoom';
  showGallery?: boolean;
  galleryImages?: string[];
  showCompanyProfile?: boolean;
  companyProfileText?: string;
  accentColor?: string;
  fontFamily?: 'Sans' | 'Serif' | 'Mono';
  customTerms?: string;
  paymentLink?: string;
  // New Customization Fields
  primaryColor?: string; // Main brand color (headers, buttons)
  secondaryColor?: string; // Accent elements
  proposalLabel?: string; // e.g. "Estimate", "Quote", "Proposal"
  buttonText?: string; // e.g. "Sign & Accept", "Approve"
  sectionOrder?: string[]; // IDs of sections in order
  heroOverlayOpacity?: number; // 0.0 to 1.0
}

export interface Estimate {
  id: string;
  clientId: string;
  clientName: string;
  items: EstimateItem[];
  total: number;
  status: EstimateStatus;
  dateCreated: string;
  lastUpdated: string;
  validUntil: string;
  pricingSnapshot: PricingSnapshot;
  adjustments?: EstimateAdjustments;
  proposalSettings?: ProposalSettings;
  signature?: string; // Base64 signature
  signedDate?: string;
  siteConditions?: SiteConditions; // NEW
  zones?: EstimateZone[];          // NEW
}

// --- DESIGN & PORTFOLIO TYPES ---
export interface DesignProject {
  id: string;
  title: string;
  description: string;
  beforeImageUrls: string[];
  afterImageUrls: string[];
  design3dUrl?: string; // Optional URL for iframe embeds (e.g. Sketchfab)
}

export enum ProjectStatus {
  SCHEDULED = 'Scheduled',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

export interface ProjectTask {
  id: string;
  description: string;
  isCompleted: boolean;
  assigneeId?: string;
  priority?: 'Low' | 'Medium' | 'High';
  dueDate?: string;
}

export interface ProjectExpense {
  id: string;
  date: string;
  vendor: string;
  category: 'Material' | 'Equipment' | 'Subcontractor' | 'Other';
  amount: number;
  description: string;
}

export interface ProjectInvoice {
  id: string;
  date: string;
  dueDate: string;
  amount: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
  items: any[];
}

export interface ProjectNote {
  id: string;
  date: string;
  author: string;
  content: string;
  type: 'Note' | 'Milestone' | 'Issue';
}

export interface ChangeOrder {
  id: string;
  // ...
}

export interface Project {
  id: string;
  clientId: string;
  clientName: string;
  estimateId: string;
  name: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  revenue: number;
  description: string;
  assignedCrewIds: string[];
  completionPercent: number;
  tasks: ProjectTask[];
  materialStatus: { estimateItemId: string, status: string, poNumber?: string }[];
  changeOrders: ChangeOrder[];
  notes: ProjectNote[];
  estimatedLaborHours?: number;
  actualLaborHours?: number;
  expenses?: ProjectExpense[];
  invoices?: ProjectInvoice[];
  assignedEquipmentIds?: string[];
}

export type PricebookCategory = 'Softscape' | 'Hardscape' | 'Irrigation' | 'Lighting' | 'Drainage' | 'Chemicals' | 'Other';

export interface PricebookItem {
  id: string;
  name: string;
  category: PricebookCategory;
  vendor: string;
  cost: number;
  unit: string;
  markupPercent: number;
  lastUpdated: string;
}

export type ProductionRateUnit = 'Sq. Ft.' | 'Cu. Yard' | 'Linear Ft.' | 'Count' | 'Zone' | 'Hour';

export interface ServiceTemplate {
  id: string;
  name: string;
  category: string; // NEW: Grouping (e.g., Concrete, Demo)
  description: string;
  rateUnit: ProductionRateUnit;
  productionRate: number;
  wastePercent?: number; // NEW: Default waste factor (e.g., 10%)
  linkedPricebookItemId?: string;
  tags?: string[];
}

export interface BusinessContextType {
  currentView: ViewState;
  navigateTo: (view: ViewState) => void;
  settingsLoading: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  activeProposalId: string | null;
  viewProposal: (id: string) => void;
  leads: Lead[];
  clients: Client[];
  calls: CallLog[];
  estimates: Estimate[];
  projects: Project[];
  appointments: Appointment[];
  pricebook: PricebookItem[];
  serviceTemplates: ServiceTemplate[];
  teamMembers: TeamMember[];
  designProjects: DesignProject[];

  // OPTIMIZED: Only active shifts are real-time
  activeTimeLogs: TimeLog[];
  // ACTION: Fetch history on demand
  fetchTimeLogs: (daysBack?: number) => Promise<TimeLog[]>;

  addLead: (lead: Omit<Lead, 'id' | 'dateCreated' | 'status' | 'tags'>) => Promise<void>;
  updateLeadStatus: (id: string, status: LeadStatus) => void;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  updateLeadDesign: (leadId: string, designId: string) => Promise<void>;
  convertLeadToClient: (leadId: string) => Promise<void>;
  addClient: (client: Omit<Client, 'id' | 'dateCreated' | 'totalSpent'>) => Promise<string>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addCall: (call: Omit<CallLog, 'id'>) => Promise<void>;
  addEstimate: (estimate: Omit<Estimate, 'id' | 'dateCreated' | 'lastUpdated' | 'status' | 'pricingSnapshot' | 'adjustments' | 'proposalSettings' | 'validUntil'> & { id?: string }) => string;
  updateEstimate: (id: string, updates: Partial<Estimate>) => Promise<void>;
  deleteEstimate: (id: string) => Promise<void>;
  updateEstimateStatus: (id: string, status: EstimateStatus) => void;
  duplicateEstimate: (id: string) => void;
  refreshEstimateRates: (id: string) => void;
  updateEstimateProposalSettings: (id: string, settings: ProposalSettings) => void;
  addProject: (project: Omit<Project, 'id' | 'status' | 'completionPercent' | 'tasks' | 'materialStatus' | 'changeOrders' | 'notes' | 'estimatedLaborHours' | 'expenses' | 'invoices'>) => Promise<void>;
  updateProjectStatus: (id: string, status: ProjectStatus) => void;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  addAppointment: (appt: Omit<Appointment, 'id'>) => Promise<void>;
  addPricebookItem: (item: Omit<PricebookItem, 'id' | 'lastUpdated'>) => Promise<void>;
  updatePricebookItem: (id: string, updates: Partial<PricebookItem>) => Promise<void>;
  deletePricebookItem: (id: string) => Promise<void>;
  addServiceTemplate: (template: Omit<ServiceTemplate, 'id'>) => Promise<void>;
  updateServiceTemplate: (id: string, updates: Partial<ServiceTemplate>) => Promise<void>;
  addTeamMember: (member: TeamMember) => Promise<void>;
  updateTeamMember: (email: string, updates: Partial<TeamMember>) => Promise<void>;
  removeTeamMember: (email: string) => Promise<void>;
  clockIn: (data: Omit<TimeLog, 'id' | 'clockOut'>) => Promise<void>;
  clockOut: (logId: string, data: { clockOut: string, locationOut?: { lat: number, lng: number }, clockOutPhotoUrl?: string }) => Promise<void>;
  updateTimeLog: (id: string, updates: Partial<TimeLog>) => Promise<void>;
  deleteTimeLog: (id: string) => Promise<void>;

  // --- SERVICES & MAINTENANCE ---
  serviceContracts: ServiceContract[];
  serviceVisits: ServiceVisit[];
  addServiceContract: (contract: Omit<ServiceContract, 'id'>) => Promise<void>;
  updateServiceContract: (id: string, updates: Partial<ServiceContract>) => Promise<void>;
  addServiceVisit: (visit: Omit<ServiceVisit, 'id'>) => Promise<void>;
  updateServiceVisit: (id: string, updates: Partial<ServiceVisit>) => Promise<void>;
  reorderServiceVisits: (visitIds: string[]) => Promise<void>;

  // --- EQUIPMENT & FLEET ---
  equipment: Equipment[];
  maintenanceLogs: MaintenanceLog[];
  addEquipment: (item: Omit<Equipment, 'id'>) => Promise<void>;
  updateEquipment: (id: string, updates: Partial<Equipment>) => Promise<void>;
  deleteEquipment: (id: string) => Promise<void>;
  logMaintenance: (log: Omit<MaintenanceLog, 'id'>) => Promise<void>;

  searchQuery: string;
  setSearchQuery: (query: string) => void;
  settings: BusinessSettings;
  updateSettings: (settings: BusinessSettings) => Promise<void>;
  completeSetup: () => Promise<void>;
  metrics: BusinessMetrics;
  notifications: AppNotification[];
}

// --- SERVICES & MAINTENANCE MODULE ---

export type ServiceFrequency = 'Weekly' | 'Bi-Weekly' | 'Monthly';

export interface ServiceContract {
  id: string;
  clientId: string;
  clientName: string;
  serviceAddress: string;
  frequency: ServiceFrequency;
  startDate: string;
  endDate?: string;
  status: 'Active' | 'Paused' | 'Cancelled';
  monthlyRate: number;
  visitRate: number; // If billing per visit
  billingType: 'Monthly' | 'PerVisit';
  description: string;
  assignedCrewIds?: string[]; // Supports multiple crew members
  preferredDayOfWeek?: string; // e.g. 'Monday'
}

export interface ServiceVisit {
  id: string;
  contractId: string;
  clientId: string;
  clientName: string;
  date: string;
  status: 'Scheduled' | 'En Route' | 'On Site' | 'Completed' | 'Skipped';
  assignedCrewIds?: string[]; // Supports multiple crew members
  completedBy?: string;
  completedAt?: string;
  notes?: string;
  photoUrl?: string;
  sequenceIndex?: number; // Used for daily route ordering
}

export interface Route {
  id: string;
  name: string;
  date: string;
  crewId: string;
  visits: ServiceVisit[]; // Ordered list of stops
  status: 'Draft' | 'Active' | 'Completed';
}

// --- COMPANY CAMERA TYPES ---

export interface ProjectImage {
  id: string;
  projectId: string;
  projectName: string;
  uploaderName: string;
  uploaderEmail: string;
  uploadDate: string; // ISO String
  url: string;
  path: string; // Storage path reference
}

// --- EQUIPMENT & FLEET TYPES ---

export interface MaintenanceLog {
  id: string;
  equipmentId: string;
  date: string;
  type: 'Oil Change' | 'Repair' | 'Inspection' | 'Other';
  description: string;
  cost: number;
  performedBy: string;
}

export type EquipmentStatus = 'Available' | 'On Job' | 'In Shop';

export interface Equipment {
  id: string;
  name: string;
  type: string; // e.g., 'Skid Steer', 'Mower', 'Truck'
  status: EquipmentStatus;
  location: string; // Can be 'Shop' or a Project Name/ID
  nextServiceDate?: string;
  notes?: string;
  projectId?: string; // ID of the project it's currently assigned to
}
