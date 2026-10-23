/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = 'en' | 'te';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface UserProfile {
  userId: string;
  state: string;
  district: string;
  mandal: string;
  village?: string;
  preferredLanguage: Language;
  skills: string[];
  businessInterests: string[];
  startingBudget: number; // in INR
  budgetTier: 'micro_under_50k' | 'small_50k_200k' | 'medium_200k_500k' | 'above_500k';
  resources: {
    hasLand: boolean;
    hasWorkspace: boolean;
    hasVehicle: boolean;
    hasSmartphone: boolean;
    hasThreePhasePower: boolean;
    familyWorkersCount: number;
    notes?: string;
  };
  timeAvailable: 'full_time' | 'part_time' | 'seasonal';
  existingBusiness: 'none' | 'small_shop' | 'farming' | 'artisan' | 'services';
  businessGoals: string[];
  updatedAt: string;
}

export interface GroundEvidenceFact {
  factEn: string;
  factTe: string;
  sourceName: string;
  sourceUrl: string;
  observationDate: string;
  retrievalDate: string;
  geographicCoverage: string;
}

export interface EngineeringAssumption {
  parameter: string;
  assumedValue: string;
  basis: string;
  formulaOrStandard: string;
}

export interface MissingEvidenceItem {
  itemEn: string;
  itemTe: string;
  whyCrucialEn: string;
  whyCrucialTe: string;
  howToVerifyLocallyEn: string;
  howToVerifyLocallyTe: string;
}

export interface SuitabilityBreakdown {
  capitalFit: 'ideal' | 'tight' | 'insufficient';
  infrastructureFit: 'ready' | 'needs_upgrade';
  mandalFit: 'high' | 'moderate';
  timeLaborFit: 'compatible' | 'demanding';
  whySuitsEn: string[];
  whySuitsTe: string[];
  whyMightNotSuitEn: string[];
  whyMightNotSuitTe: string[];
}

export interface Opportunity {
  id: string;
  slug: string;
  titleEn: string;
  titleTe: string;
  category: 'agri_allied' | 'food_processing' | 'dairy_livestock' | 'handloom_crafts' | 'retail_commerce' | 'digital_services' | 'repair_maintenance';
  sectorEn: string;
  sectorTe: string;
  imageUrl: string;
  imageAlt: string;
  imageAttribution: string;
  summaryEn: string;
  summaryTe: string;
  minCapitalINR: number;
  maxCapitalINR: number;
  suggestedWorkingCapitalINR: number;
  equipmentChecklist: Array<{ item: string; estimatedCostINR: number; necessity: 'essential' | 'recommended' }>;
  targetCustomersEn: string[];
  targetCustomersTe: string[];
  localWarangalAdvantageEn: string;
  localWarangalAdvantageTe: string;
  keyRisksEn: string[];
  keyRisksTe: string[];
  questionsToInvestigateEn: string[];
  questionsToInvestigateTe: string[];
  requiredSkills: string[];
  regulatoryRequirements: string[];
  applicableSchemes: string[];
  sources: Array<{
    name: string;
    url: string;
    coverage: string;
    observationDate: string;
    lastCheckedDate: string;
  }>;
  suitabilityScore?: number;
  matchReasonsEn?: string[];
  matchReasonsTe?: string[];
  // Grounded Evidence & Feasibility Additions
  verifiedFacts?: GroundEvidenceFact[];
  engineeringAssumptions?: EngineeringAssumption[];
  missingEvidenceChecklist?: MissingEvidenceItem[];
  seasonalityNotesEn?: string;
  seasonalityNotesTe?: string;
  monthlySeasonalityMultipliers?: number[]; // 12 elements (Jan-Dec)
}

export interface FinancialInputs {
  businessName: string;
  equipmentCost: number;
  setupCost: number;
  monthlyRent: number;
  monthlyUtilities: number;
  monthlyTransportPackaging: number;
  monthlySelfSalary: number;
  monthlyHiredLabor: number;
  monthlyOtherFixed: number;
  monthlyLoanEmi?: number; // Optional bank/Mudra loan monthly installment
  expectedUnitsSoldPerMonth: number;
  sellingPricePerUnit: number;
  rawMaterialCostPerUnit: number;
  workingCapitalBufferMonths: number;
}

export interface ScenarioResult {
  scenarioName?: string;
  description?: string;
  unitsSold: number;
  monthlyRevenue: number;
  monthlyCostOfGoodsSold: number;
  monthlyGrossSurplus: number;
  monthlyFixedExpenses: number;
  monthlyNetSurplusOrLoss: number;
  annualSurplusOrLoss: number;
}

export interface MonthlyCashFlowStep {
  month: number;
  monthName: string;
  seasonFactor: number;
  unitsSold: number;
  grossRevenue: number;
  cogs: number;
  fixedOverheads: number;
  netCashFlow: number;
  closingCashReserve: number;
  isDeficit: boolean;
}

export interface FormulaExplanation {
  metric: string;
  formula: string;
  userCalculation: string;
  significance: string;
}

export interface FinancialEvaluation {
  initialInvestment: number;
  initialCapex: number;
  initialOpexReserve: number;
  monthlyFixedCosts: number;
  variableCostPerUnit: number;
  contributionMarginPerUnit: number;
  contributionMarginRatio: number;
  breakEvenUnits: number;
  breakEvenRevenueINR: number;
  isBreakEvenFeasible: boolean;
  baseScenario: ScenarioResult;
  conservativeScenario: ScenarioResult; // -25% units
  optimisticScenario: ScenarioResult;   // +25% units
  stressScenarios: {
    volumeShock: ScenarioResult;
    inputPriceShock: ScenarioResult;
    downtimeShock: ScenarioResult;
    creditDelayShock: ScenarioResult;
  };
  monthlyCashFlow12Months: MonthlyCashFlowStep[];
  lowestCashBalance: number;
  lowestCashMonth: number;
  cashRunwayZeroSalesMonths: number;
  formulaExplanations: FormulaExplanation[];
  estimatedPaybackPeriodMonths: number | null;
  assumptionsNotes: string[];
  warnings?: string[];
  disclosureNotice: string;
}

export interface CalculatorSnapshot {
  id: string;
  userId: string;
  name: string;
  inputs: FinancialInputs;
  results: FinancialEvaluation;
  createdAt: string;
}

export interface MarketEvidenceItem {
  id: string;
  titleEn: string;
  titleTe: string;
  category: 'chilli_spices' | 'cotton_textiles' | 'grains_pulses' | 'dairy_livestock' | 'msme_density' | 'handloom_crafts';
  headlineMetric: string;
  metricDescriptionEn: string;
  metricDescriptionTe: string;
  sourceName: string;
  sourceUrl: string;
  geographicCoverage: string;
  observationDate: string;
  retrievalDate: string;
  dataType: 'official_stat' | 'market_arrival' | 'gi_registry' | 'policy_benchmark';
  limitationsEn: string;
  limitationsTe: string;
  warangalContextEn: string;
  warangalContextTe: string;
}

export interface GovernmentScheme {
  id: string;
  name: string;
  department: string;
  portalUrl: string;
  category: 'central' | 'state_telangana' | 'bank_credit' | 'women_shg';
  targetBeneficiariesEn: string;
  targetBeneficiariesTe: string;
  subsidyOrAssistanceEn: string;
  subsidyOrAssistanceTe: string;
  maxProjectCostINR: number;
  eligibilityCriteriaEn: string[];
  eligibilityCriteriaTe: string[];
  applicationProcedureEn: string[];
  applicationProcedureTe: string[];
  requiredDocuments: string[];
  localWarangalOffice: string;
  lastVerifiedDate: string;
  cautionNoticeEn: string;
  cautionNoticeTe: string;
}

export interface LaunchChecklistItem {
  id: string;
  phase: 'demand_validation' | 'cost_quotations' | 'resource_checks' | 'scheme_verification' | 'operational_launch';
  titleEn: string;
  titleTe: string;
  descriptionEn: string;
  descriptionTe: string;
  verifiedSourceRef?: string;
  verifiedSourceUrl?: string;
  completed: boolean;
  completedAt?: string;
  notes?: string;
}

export interface BusinessPlan {
  id: string;
  userId: string;
  opportunityId?: string;
  title: string;
  status: 'draft' | 'in_review' | 'ready';
  concept: {
    summary: string;
    productServiceDescription: string;
    locationMandal: string;
    uniqueness: string;
  };
  market: {
    targetCustomers: string;
    localCompetition: string;
    pricingStrategy: string;
    salesChannels: string;
  };
  operations: {
    equipmentList: string;
    rawMaterialSources: string;
    powerAndWaterNeeds: string;
    laborRequirements: string;
  };
  financials: {
    capitalNeeded: number;
    ownContribution: number;
    expectedLoanOrScheme: number;
    monthlyProjectedRevenue: number;
    monthlyProjectedExpenses: number;
    monthlyExpectedSurplus: number;
    breakEvenUnits: number;
  };
  risksAndMitigations: Array<{ risk: string; mitigation: string }>;
  milestones: Array<{ month: string; task: string; completed: boolean }>;
  applicableSchemes: string[];
  launchChecklist?: LaunchChecklistItem[];
  launchReadinessPercent?: number;
  feasibilitySnapshot?: FinancialEvaluation;
  aiRefinement?: {
    strengths: string[];
    localGroundTips: string[];
    suggestedActionSteps: string[];
    lastRefinedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  sources?: Array<{ name: string; url: string }>;
}

export interface ChatRequest {
  messages: Array<{ role: 'user' | 'model'; content: string }>;
  language: Language;
  context?: {
    currentTab?: string;
    opportunityId?: string;
    profile?: Partial<UserProfile>;
  };
}

export interface ChatResponse {
  reply: string;
  sources?: Array<{ name: string; url: string }>;
}

export interface TranscribeResponse {
  transcript: string;
}
