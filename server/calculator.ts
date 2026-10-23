/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  FinancialInputs, 
  FinancialEvaluation, 
  ScenarioResult, 
  MonthlyCashFlowStep, 
  FormulaExplanation 
} from '../src/types/index.js';

// Warangal agricultural & festive seasonal index (12 months from Jan to Dec)
// Jan-Feb: Post-harvest arrivals & Sankranti festive spending (1.10 - 1.20)
// Mar-May: Peak summer chilli/grain trading at Enumamula yard, high heat (1.15 - 1.05)
// Jun-Aug: Monsoon planting, rural liquidity diverted to farming inputs, lower non-essential retail (0.80 - 0.85)
// Sep-Oct: Dussehra festive pickup, Bathukamma festival demand (1.10 - 1.15)
// Nov-Dec: Post-kharif harvest, marriage season surge (1.15 - 1.25)
const DEFAULT_SEASONALITY_FACTORS: number[] = [
  1.15, // Jan (Sankranti harvest)
  1.10, // Feb (Wedding season)
  1.15, // Mar (Peak agricultural arrivals)
  1.05, // Apr (Late harvest)
  0.95, // May (Severe summer heat)
  0.80, // Jun (Monsoon sowing starts, liquidity diverted)
  0.85, // Jul (Agricultural focus)
  0.90, // Aug (Mid monsoon)
  1.10, // Sep (Bathukamma / Navratri festival)
  1.15, // Oct (Dussehra festival peak)
  1.20, // Nov (Post-kharif harvest cash)
  1.25  // Dec (Year-end & winter wedding season)
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function calculateFinancialFeasibility(
  inputs: FinancialInputs,
  customSeasonality?: number[]
): FinancialEvaluation {
  const equipmentCost = Math.max(0, Number(inputs.equipmentCost) || 0);
  const setupCost = Math.max(0, Number(inputs.setupCost) || 0);
  const monthlyRent = Math.max(0, Number(inputs.monthlyRent) || 0);
  const monthlyUtilities = Math.max(0, Number(inputs.monthlyUtilities) || 0);
  const monthlyTransportPackaging = Math.max(0, Number(inputs.monthlyTransportPackaging) || 0);
  const monthlySelfSalary = Math.max(0, Number(inputs.monthlySelfSalary) || 0);
  const monthlyHiredLabor = Math.max(0, Number(inputs.monthlyHiredLabor) || 0);
  const monthlyOtherFixed = Math.max(0, Number(inputs.monthlyOtherFixed) || 0);
  const monthlyLoanEmi = Math.max(0, Number(inputs.monthlyLoanEmi) || 0);

  const expectedUnitsSold = Math.max(0, Number(inputs.expectedUnitsSoldPerMonth) || 0);
  const sellingPrice = Math.max(0, Number(inputs.sellingPricePerUnit) || 0);
  const rawMaterialCost = Math.max(0, Number(inputs.rawMaterialCostPerUnit) || 0);
  const bufferMonths = Math.max(1, Math.min(12, Number(inputs.workingCapitalBufferMonths) || 2));

  const initialCapex = equipmentCost + setupCost;
  const monthlyFixedCosts = monthlyRent + monthlyUtilities + monthlyTransportPackaging + monthlySelfSalary + monthlyHiredLabor + monthlyOtherFixed + monthlyLoanEmi;
  const initialOpexReserve = monthlyFixedCosts * bufferMonths;
  const initialInvestment = initialCapex + initialOpexReserve;

  const variableCostPerUnit = rawMaterialCost;
  const contributionMarginPerUnit = sellingPrice - variableCostPerUnit;
  const contributionMarginRatio = sellingPrice > 0 ? (contributionMarginPerUnit / sellingPrice) : 0;

  const isBreakEvenFeasible = contributionMarginPerUnit > 0;
  const breakEvenUnits = isBreakEvenFeasible ? Math.ceil(monthlyFixedCosts / contributionMarginPerUnit) : 0;
  const breakEvenRevenueINR = breakEvenUnits * sellingPrice;

  // Helper scenario builder
  const calculateScenario = (
    units: number, 
    unitPrice: number = sellingPrice, 
    unitVarCost: number = rawMaterialCost, 
    fixedExpenses: number = monthlyFixedCosts,
    name?: string,
    desc?: string
  ): ScenarioResult => {
    const monthlyRevenue = Math.round(units * unitPrice);
    const monthlyCostOfGoodsSold = Math.round(units * unitVarCost);
    const monthlyGrossSurplus = monthlyRevenue - monthlyCostOfGoodsSold;
    const monthlyNetSurplusOrLoss = monthlyGrossSurplus - fixedExpenses;
    return {
      scenarioName: name,
      description: desc,
      unitsSold: units,
      monthlyRevenue,
      monthlyCostOfGoodsSold,
      monthlyGrossSurplus,
      monthlyFixedExpenses: fixedExpenses,
      monthlyNetSurplusOrLoss,
      annualSurplusOrLoss: monthlyNetSurplusOrLoss * 12
    };
  };

  const baseScenario = calculateScenario(
    expectedUnitsSold,
    sellingPrice,
    rawMaterialCost,
    monthlyFixedCosts,
    'Baseline Expected',
    'Standard operational forecast with user-specified expected monthly volume and pricing.'
  );

  const conservativeScenario = calculateScenario(
    Math.round(expectedUnitsSold * 0.75),
    sellingPrice,
    rawMaterialCost,
    monthlyFixedCosts,
    'Conservative (-25% Sales)',
    'Accounts for mild sluggishness, competition, or off-season dips.'
  );

  const optimisticScenario = calculateScenario(
    Math.round(expectedUnitsSold * 1.25),
    sellingPrice,
    rawMaterialCost,
    monthlyFixedCosts,
    'Optimistic (+25% Sales)',
    'Reflects peak festive demand, high harvest flow, or bulk institutional supply.'
  );

  // Four Adverse Stress Scenarios
  const stressScenarios = {
    // 1. Demand Shock (-25% sales volume)
    volumeShock: calculateScenario(
      Math.round(expectedUnitsSold * 0.75),
      sellingPrice,
      rawMaterialCost,
      monthlyFixedCosts,
      'Adverse 1: Local Demand Shock (-25%)',
      'Sudden localized dip in footfall or emergence of alternative supplier in mandal.'
    ),
    // 2. Input Price Shock (+15% raw material spike)
    inputPriceShock: calculateScenario(
      expectedUnitsSold,
      sellingPrice,
      Math.round(rawMaterialCost * 1.15),
      monthlyFixedCosts,
      'Adverse 2: Raw Material Cost Surge (+15%)',
      'Unseasonal rains or mandi crop arrival shortfall raising procurement prices without immediate retail price pass-through.'
    ),
    // 3. Machinery & Power Downtime Shock (15 days lost production, 50% fixed overhead with 0 revenue)
    downtimeShock: calculateScenario(
      Math.round(expectedUnitsSold * 0.5),
      sellingPrice,
      rawMaterialCost,
      monthlyFixedCosts,
      'Adverse 3: Machine Breakdown / Grid Disruption (15 Days Offline)',
      'Transformer outage or delayed spare parts delivery cutting monthly productive days in half.'
    ),
    // 4. Working Capital Credit Delay Shock (30% delayed on kirana credit for 45 days)
    creditDelayShock: calculateScenario(
      expectedUnitsSold,
      Math.round(sellingPrice * 0.70), // Cash collected in month
      rawMaterialCost,
      monthlyFixedCosts,
      'Adverse 4: Retail Credit Delays (30% Pending Udhari)',
      'Local grocery stores taking goods on credit, delaying cash inflow by 30 to 45 days.'
    )
  };

  // 12-Month Month-by-Month Deterministic Cash Flow Simulation
  const seasonality = (customSeasonality && customSeasonality.length === 12) 
    ? customSeasonality 
    : DEFAULT_SEASONALITY_FACTORS;

  let rollingCashBalance = initialOpexReserve; // Start with the working capital reserve
  let lowestCashBalance = rollingCashBalance;
  let lowestCashMonth = 1;

  const monthlyCashFlow12Months: MonthlyCashFlowStep[] = [];

  for (let m = 0; m < 12; m++) {
    const factor = seasonality[m];
    const monthUnits = Math.round(expectedUnitsSold * factor);
    const grossRev = Math.round(monthUnits * sellingPrice);
    const monthCogs = Math.round(monthUnits * rawMaterialCost);
    const netFlow = grossRev - monthCogs - monthlyFixedCosts;
    rollingCashBalance += netFlow;

    if (rollingCashBalance < lowestCashBalance) {
      lowestCashBalance = rollingCashBalance;
      lowestCashMonth = m + 1;
    }

    monthlyCashFlow12Months.push({
      month: m + 1,
      monthName: MONTH_NAMES[m],
      seasonFactor: factor,
      unitsSold: monthUnits,
      grossRevenue: grossRev,
      cogs: monthCogs,
      fixedOverheads: monthlyFixedCosts,
      netCashFlow: netFlow,
      closingCashReserve: rollingCashBalance,
      isDeficit: netFlow < 0
    });
  }

  // Cash Runway in months if sales completely dry up (zero sales)
  const cashRunwayZeroSalesMonths = monthlyFixedCosts > 0 
    ? Math.round((initialOpexReserve / monthlyFixedCosts) * 10) / 10 
    : 12;

  // Payback period (safeguarded against 0 investment or negative surplus)
  let estimatedPaybackPeriodMonths: number | null = null;
  if (baseScenario.monthlyNetSurplusOrLoss > 0 && initialInvestment > 0) {
    estimatedPaybackPeriodMonths = Math.round((initialInvestment / baseScenario.monthlyNetSurplusOrLoss) * 10) / 10;
  }

  // Formula Explanations for Complete Transparency
  const formulaExplanations: FormulaExplanation[] = [
    {
      metric: 'Initial Capital (Capex + Working Capital)',
      formula: 'Equipment Cost + Setup/Workshop Cost + (Monthly Fixed Costs × Buffer Months)',
      userCalculation: `₹${equipmentCost.toLocaleString('en-IN')} + ₹${setupCost.toLocaleString('en-IN')} + (₹${monthlyFixedCosts.toLocaleString('en-IN')} × ${bufferMonths}) = ₹${initialInvestment.toLocaleString('en-IN')}`,
      significance: 'Protects the enterprise from going bankrupt before first revenue arrives. Never launch with capex alone.'
    },
    {
      metric: 'Unit Contribution Margin',
      formula: 'Selling Price per Unit - Direct Raw Material Cost per Unit',
      userCalculation: `₹${sellingPrice.toLocaleString('en-IN')} - ₹${variableCostPerUnit.toLocaleString('en-IN')} = ₹${contributionMarginPerUnit.toLocaleString('en-IN')} per unit`,
      significance: 'The surplus generated by every single unit sold that goes towards paying down fixed overheads.'
    },
    {
      metric: 'Break-Even Sales Volume',
      formula: 'Monthly Fixed Overheads ÷ Unit Contribution Margin',
      userCalculation: `₹${monthlyFixedCosts.toLocaleString('en-IN')} ÷ ₹${contributionMarginPerUnit.toLocaleString('en-IN')} = ${breakEvenUnits} units/month`,
      significance: 'The exact survival threshold. Below this monthly volume, the business loses money every month.'
    },
    {
      metric: 'Working Capital Zero-Sales Runway',
      formula: 'Initial Cash Reserve ÷ Monthly Fixed Expenses',
      userCalculation: `₹${initialOpexReserve.toLocaleString('en-IN')} ÷ ₹${monthlyFixedCosts.toLocaleString('en-IN')} = ${cashRunwayZeroSalesMonths} months`,
      significance: 'How long the business can survive severe emergencies, crop failure, or lockdown before cash runs out.'
    }
  ];

  if (monthlyLoanEmi > 0) {
    formulaExplanations.push({
      metric: 'Monthly Debt Service (Loan EMI)',
      formula: 'Bank Mudra / PMEGP Term Loan Monthly Installment',
      userCalculation: `₹${monthlyLoanEmi.toLocaleString('en-IN')}/month`,
      significance: 'Fixed monthly obligation owed to bank. Must be serviced regardless of monthly sales fluctuations.'
    });
  }

  const assumptionsNotes = [
    `Fixed operating overheads calculated strictly at ₹${monthlyFixedCosts.toLocaleString('en-IN')}/month.`,
    `Working capital reserve covers ${bufferMonths} months of fixed costs (₹${initialOpexReserve.toLocaleString('en-IN')}).`,
    `Unit contribution margin is ₹${contributionMarginPerUnit.toLocaleString('en-IN')} (${(contributionMarginRatio * 100).toFixed(1)}% of price).`,
    `Break-even point requires selling at least ${breakEvenUnits} units per month to cover fixed expenses.`,
    `Seasonality indices reflect Warangal harvest arrivals (Enumamula market) and Telangana festive cycles.`
  ];

  const warnings: string[] = [];

  if (sellingPrice <= 0) {
    warnings.push('Selling price is ₹0. Please enter a valid expected unit price.');
  }
  if (expectedUnitsSold <= 0) {
    warnings.push('Expected sales volume is 0 units. Enter an estimated monthly sales volume.');
  }
  if (rawMaterialCost >= sellingPrice && sellingPrice > 0) {
    warnings.push(`Direct cost per unit (₹${rawMaterialCost}) equals or exceeds selling price (₹${sellingPrice}). Each unit sold incurs an operational cash loss.`);
  }
  if (isBreakEvenFeasible && expectedUnitsSold > 0 && expectedUnitsSold < breakEvenUnits) {
    warnings.push(`Expected monthly volume (${expectedUnitsSold} units) is below the break-even volume (${breakEvenUnits} units). The enterprise will experience an operating deficit of ₹${Math.abs(baseScenario.monthlyNetSurplusOrLoss).toLocaleString('en-IN')}/month unless volume increases or fixed costs are reduced.`);
  }
  if (lowestCashBalance < 0) {
    warnings.push(`Seasonal Cash Deficit Warning: Due to low-volume monsoon months (Month ${lowestCashMonth}), cash reserves drop to -₹${Math.abs(lowestCashBalance).toLocaleString('en-IN')}. Consider increasing the working capital buffer by at least ₹${Math.abs(lowestCashBalance).toLocaleString('en-IN')} before launch.`);
  }

  return {
    initialInvestment,
    initialCapex,
    initialOpexReserve,
    monthlyFixedCosts,
    variableCostPerUnit,
    contributionMarginPerUnit,
    contributionMarginRatio,
    breakEvenUnits,
    breakEvenRevenueINR,
    isBreakEvenFeasible,
    baseScenario,
    conservativeScenario,
    optimisticScenario,
    stressScenarios,
    monthlyCashFlow12Months,
    lowestCashBalance,
    lowestCashMonth,
    cashRunwayZeroSalesMonths,
    formulaExplanations,
    estimatedPaybackPeriodMonths,
    assumptionsNotes,
    warnings: warnings.length > 0 ? warnings : undefined,
    disclosureNotice: 'Notice: These projections are deterministic mathematical simulations derived from user-specified assumptions and regional seasonal indices. Projections do NOT guarantee profitability. Rural market prices and demand fluctuate with seasonal crop arrivals at Enumamula market yard, monsoons, and local kirana credit arrangements.'
  };
}

export const CALCULATOR_PRESETS: Record<string, FinancialInputs> = {
  chilli_unit: {
    businessName: 'Chilli Powder & Spice Packaging Unit (Warangal ODOP)',
    equipmentCost: 110000,
    setupCost: 35000,
    monthlyRent: 4000,
    monthlyUtilities: 3500,
    monthlyTransportPackaging: 4500,
    monthlySelfSalary: 15000,
    monthlyHiredLabor: 8000,
    monthlyOtherFixed: 2000,
    expectedUnitsSoldPerMonth: 600,
    sellingPricePerUnit: 180,
    rawMaterialCostPerUnit: 110,
    workingCapitalBufferMonths: 2
  },
  poultry_farm: {
    businessName: 'Desi Country Chicken Farm (Natukodi Rearing)',
    equipmentCost: 55000,
    setupCost: 20000,
    monthlyRent: 1500,
    monthlyUtilities: 1800,
    monthlyTransportPackaging: 2200,
    monthlySelfSalary: 12000,
    monthlyHiredLabor: 4000,
    monthlyOtherFixed: 1500,
    expectedUnitsSoldPerMonth: 120,
    sellingPricePerUnit: 480,
    rawMaterialCostPerUnit: 210,
    workingCapitalBufferMonths: 2
  },
  digital_kiosk: {
    businessName: 'Rural Digital & Banking Service Kiosk (MeeSeva/CSC)',
    equipmentCost: 62000,
    setupCost: 18000,
    monthlyRent: 3000,
    monthlyUtilities: 2200,
    monthlyTransportPackaging: 1200,
    monthlySelfSalary: 14000,
    monthlyHiredLabor: 0,
    monthlyOtherFixed: 1600,
    expectedUnitsSoldPerMonth: 750,
    sellingPricePerUnit: 45,
    rawMaterialCostPerUnit: 6,
    workingCapitalBufferMonths: 2
  },
  cold_press_oil: {
    businessName: 'Cold-Pressed Groundnut Oil (Ghani Mill)',
    equipmentCost: 180000,
    setupCost: 40000,
    monthlyRent: 5000,
    monthlyUtilities: 4500,
    monthlyTransportPackaging: 5000,
    monthlySelfSalary: 18000,
    monthlyHiredLabor: 9000,
    monthlyOtherFixed: 2500,
    expectedUnitsSoldPerMonth: 450,
    sellingPricePerUnit: 280,
    rawMaterialCostPerUnit: 175,
    workingCapitalBufferMonths: 2
  },
  dhurry_weaving: {
    businessName: 'Warangal GI Dhurry & Cotton Rug Modernization Unit',
    equipmentCost: 85000,
    setupCost: 25000,
    monthlyRent: 3500,
    monthlyUtilities: 2000,
    monthlyTransportPackaging: 3000,
    monthlySelfSalary: 14000,
    monthlyHiredLabor: 8000,
    monthlyOtherFixed: 1500,
    expectedUnitsSoldPerMonth: 70,
    sellingPricePerUnit: 850,
    rawMaterialCostPerUnit: 420,
    workingCapitalBufferMonths: 2
  },
  ev_repair: {
    businessName: 'Two-Wheeler & EV Scooter Multi-Brand Service Point',
    equipmentCost: 80000,
    setupCost: 25000,
    monthlyRent: 4500,
    monthlyUtilities: 2800,
    monthlyTransportPackaging: 1500,
    monthlySelfSalary: 16000,
    monthlyHiredLabor: 6000,
    monthlyOtherFixed: 2000,
    expectedUnitsSoldPerMonth: 180,
    sellingPricePerUnit: 260,
    rawMaterialCostPerUnit: 65,
    workingCapitalBufferMonths: 2
  }
};
