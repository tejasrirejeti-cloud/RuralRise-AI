/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext.js';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { FinancialInputs, FinancialEvaluation, ScenarioResult } from '../types/index.js';
import { WorkflowStepper } from '../components/common/WorkflowStepper.js';
import { 
  Calculator, 
  RotateCcw, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  TrendingUp, 
  Wallet,
  Coins,
  Save,
  Bookmark,
  ShieldAlert,
  Calendar,
  Layers,
  HelpCircle,
  Clock
} from 'lucide-react';

interface CalculatorPageProps {
  onNavigate: (tab: string, param?: string) => void;
  initialOpportunityId?: string;
}

export const CalculatorPage: React.FC<CalculatorPageProps> = ({ 
  onNavigate, 
  initialOpportunityId 
}) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [presets, setPresets] = useState<Record<string, FinancialInputs>>({});
  const [activePresetKey, setActivePresetKey] = useState<string>('chilli_unit');
  const [inputs, setInputs] = useState<FinancialInputs>({
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
  });

  const [evaluation, setEvaluation] = useState<FinancialEvaluation | null>(null);
  const [selectedStressScenario, setSelectedStressScenario] = useState<'base' | 'volumeShock' | 'inputPriceShock' | 'downtimeShock' | 'creditDelayShock'>('base');
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);
  const [savingSnapshot, setSavingSnapshot] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Load presets
  useEffect(() => {
    async function loadPresets() {
      try {
        const res = await api.getCalculatorPresets();
        setPresets(res.presets);

        if (initialOpportunityId) {
          if (initialOpportunityId.includes('chilli') && res.presets.chilli_unit) {
            setInputs(res.presets.chilli_unit);
            setActivePresetKey('chilli_unit');
          } else if (initialOpportunityId.includes('poultry') && res.presets.poultry_farm) {
            setInputs(res.presets.poultry_farm);
            setActivePresetKey('poultry_farm');
          } else if (initialOpportunityId.includes('digital') && res.presets.digital_kiosk) {
            setInputs(res.presets.digital_kiosk);
            setActivePresetKey('digital_kiosk');
          } else if (initialOpportunityId.includes('oil') && res.presets.cold_press_oil) {
            setInputs(res.presets.cold_press_oil);
            setActivePresetKey('cold_press_oil');
          } else if (initialOpportunityId.includes('dhurr') && res.presets.dhurry_weaving) {
            setInputs(res.presets.dhurry_weaving);
            setActivePresetKey('dhurry_weaving');
          } else if (initialOpportunityId.includes('repair') && res.presets.ev_repair) {
            setInputs(res.presets.ev_repair);
            setActivePresetKey('ev_repair');
          }
        }
      } catch (err) {
        console.error('Failed to load presets:', err);
      }
    }
    loadPresets();
  }, [initialOpportunityId]);

  // Recalculate evaluation when inputs change
  useEffect(() => {
    async function runEval() {
      try {
        const result = await api.evaluateCalculator(inputs);
        setEvaluation(result);
      } catch (err) {
        console.error('Calculation error:', err);
      }
    }
    runEval();
  }, [inputs]);

  const handleInputChange = (field: keyof FinancialInputs, value: string | number) => {
    setInputs(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? (field === 'businessName' ? value : Number(value) || 0) : value
    }));
  };

  const handleApplyPreset = (key: string) => {
    if (presets[key]) {
      setInputs(presets[key]);
      setActivePresetKey(key);
    }
  };

  const handleSaveSnapshot = async () => {
    if (!user) {
      onNavigate('auth');
      return;
    }

    if (!evaluation) return;

    setSavingSnapshot(true);
    try {
      await api.saveCalculatorSnapshot(inputs.businessName, inputs, evaluation);
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 3500);
    } catch (err) {
      console.error('Failed to save calculation snapshot:', err);
    } finally {
      setSavingSnapshot(false);
    }
  };

  // Get currently selected stress scenario result
  const getCurrentScenarioResult = (): ScenarioResult | undefined => {
    if (!evaluation) return undefined;
    if (selectedStressScenario === 'base') return evaluation.baseScenario;
    if (selectedStressScenario === 'volumeShock') return evaluation.stressScenarios?.volumeShock;
    if (selectedStressScenario === 'inputPriceShock') return evaluation.stressScenarios?.inputPriceShock;
    if (selectedStressScenario === 'downtimeShock') return evaluation.stressScenarios?.downtimeShock;
    if (selectedStressScenario === 'creditDelayShock') return evaluation.stressScenarios?.creditDelayShock;
    return evaluation.baseScenario;
  };

  const currentScenario = getCurrentScenarioResult();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Integrated Workflow Stepper */}
      <WorkflowStepper 
        currentStep={2} 
        opportunityName={inputs.businessName}
        onStepClick={(step) => {
          if (step === 1) onNavigate('explore');
          if (step === 3) onNavigate('plan', initialOpportunityId || 'from_calculator');
        }}
      />

      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF7EE] text-[#1B4332] text-xs font-bold border border-[#C7E9CE]">
          <Calculator className="w-3.5 h-3.5 text-[#2D6A4F]" />
          <span>{language === 'en' ? 'Deterministic Financial Simulator' : 'నిర్ణయాత్మక ఆర్థిక సాధ్యత సిమ్యులేటర్'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#143626]">
          {t('calcTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-[#52796F] max-w-3xl leading-relaxed">
          {t('calcSubtitle')}
        </p>
      </div>

      {/* Presets Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E6E4DC] shadow-xs space-y-2.5">
        <label className="text-xs font-bold text-[#143626] block">
          {t('calcPresetPrompt')}
        </label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(presets).map(([key, val]) => (
            <button
              key={key}
              onClick={() => handleApplyPreset(key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                activePresetKey === key
                  ? 'bg-[#1B4332] text-white shadow-xs'
                  : 'bg-[#FAF9F5] text-[#52796F] border border-[#E6E4DC] hover:bg-[#F0EEE6]'
              }`}
            >
              {val.businessName.split('(')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Non-Guarantee Transparency Disclosure Notice */}
      <div className="bg-[#FAF9F5] rounded-2xl p-4 border border-[#E6E4DC] flex items-start gap-3 text-xs text-[#52796F]">
        <Info className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {t('calcDisclaimer')}
        </p>
      </div>

      {/* Interactive Main Layout: Left Form, Right Evaluation Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Input Parameters (7 cols) */}
        <div className="lg:col-span-7 space-y-6">

          {/* Business Name Field */}
          <div className="bg-white rounded-2xl p-5 border border-[#E6E4DC] shadow-xs space-y-3">
            <label className="text-xs font-bold text-[#143626] block uppercase tracking-wider">
              {language === 'en' ? 'Enterprise Proposal Title' : 'ప్రతిపాదిత వ్యాపారం పేరు'}
            </label>
            <input
              type="text"
              value={inputs.businessName}
              onChange={e => handleInputChange('businessName', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#D5D2C7] bg-[#FAF9F5] text-sm font-semibold text-[#143626] focus:outline-none focus:border-[#1B4332]"
            />
          </div>

          {/* Section 1: One-Time Capex */}
          <div className="bg-white rounded-2xl p-5 border border-[#E6E4DC] shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-[#143626] flex items-center justify-between border-b border-[#F0EEE6] pb-3">
              <span>{t('calcCapexHeader')}</span>
              <span className="text-xs text-[#2D6A4F] font-bold">
                Total: ₹{(inputs.equipmentCost + inputs.setupCost).toLocaleString('en-IN')}
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#52796F] font-medium block mb-1.5">
                  {t('calcEquipmentCost')}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-[#718096]">₹</span>
                  <input
                    type="number"
                    value={inputs.equipmentCost}
                    onChange={e => handleInputChange('equipmentCost', e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#D5D2C7] bg-[#FAF9F5] text-xs font-semibold focus:outline-none focus:border-[#1B4332]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#52796F] font-medium block mb-1.5">
                  {t('calcSetupCost')}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-[#718096]">₹</span>
                  <input
                    type="number"
                    value={inputs.setupCost}
                    onChange={e => handleInputChange('setupCost', e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#D5D2C7] bg-[#FAF9F5] text-xs font-semibold focus:outline-none focus:border-[#1B4332]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Monthly Fixed Overhead Expenses */}
          <div className="bg-white rounded-2xl p-5 border border-[#E6E4DC] shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-[#143626] flex items-center justify-between border-b border-[#F0EEE6] pb-3">
              <span>{t('calcOpexHeader')}</span>
              <span className="text-xs text-[#2D6A4F] font-bold">
                Monthly: ₹{(
                  inputs.monthlyRent + 
                  inputs.monthlyUtilities + 
                  inputs.monthlyTransportPackaging + 
                  inputs.monthlySelfSalary + 
                  inputs.monthlyHiredLabor + 
                  inputs.monthlyOtherFixed +
                  (inputs.monthlyLoanEmi || 0)
                ).toLocaleString('en-IN')}
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#52796F] font-medium block mb-1.5">
                  {t('calcRent')}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-[#718096]">₹</span>
                  <input
                    type="number"
                    value={inputs.monthlyRent}
                    onChange={e => handleInputChange('monthlyRent', e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#D5D2C7] bg-[#FAF9F5] text-xs font-semibold focus:outline-none focus:border-[#1B4332]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#52796F] font-medium block mb-1.5">
                  {t('calcUtilities')}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-[#718096]">₹</span>
                  <input
                    type="number"
                    value={inputs.monthlyUtilities}
                    onChange={e => handleInputChange('monthlyUtilities', e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#D5D2C7] bg-[#FAF9F5] text-xs font-semibold focus:outline-none focus:border-[#1B4332]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#52796F] font-medium block mb-1.5">
                  {t('calcTransport')}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-[#718096]">₹</span>
                  <input
                    type="number"
                    value={inputs.monthlyTransportPackaging}
                    onChange={e => handleInputChange('monthlyTransportPackaging', e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#D5D2C7] bg-[#FAF9F5] text-xs font-semibold focus:outline-none focus:border-[#1B4332]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#52796F] font-medium block mb-1.5">
                  {t('calcSelfSalary')}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-[#718096]">₹</span>
                  <input
                    type="number"
                    value={inputs.monthlySelfSalary}
                    onChange={e => handleInputChange('monthlySelfSalary', e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#D5D2C7] bg-[#FAF9F5] text-xs font-semibold focus:outline-none focus:border-[#1B4332]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#52796F] font-medium block mb-1.5">
                  {t('calcHiredLabor')}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-[#718096]">₹</span>
                  <input
                    type="number"
                    value={inputs.monthlyHiredLabor}
                    onChange={e => handleInputChange('monthlyHiredLabor', e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#D5D2C7] bg-[#FAF9F5] text-xs font-semibold focus:outline-none focus:border-[#1B4332]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#52796F] font-medium block mb-1.5">
                  {t('calcOtherFixed')}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-[#718096]">₹</span>
                  <input
                    type="number"
                    value={inputs.monthlyOtherFixed}
                    onChange={e => handleInputChange('monthlyOtherFixed', e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#D5D2C7] bg-[#FAF9F5] text-xs font-semibold focus:outline-none focus:border-[#1B4332]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#52796F] font-medium block mb-1.5 flex items-center justify-between">
                  <span>{language === 'en' ? 'Bank Loan / Mudra EMI' : 'బ్యాంకు ముద్ర లోన్ ఈఎంఐ'}</span>
                  <span className="text-[10px] text-[#718096]">({language === 'en' ? 'Optional' : 'ఐచ్ఛికం'})</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-[#718096]">₹</span>
                  <input
                    type="number"
                    value={inputs.monthlyLoanEmi || ''}
                    onChange={e => handleInputChange('monthlyLoanEmi', e.target.value)}
                    placeholder="0"
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#D5D2C7] bg-[#FAF9F5] text-xs font-semibold focus:outline-none focus:border-[#1B4332]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Monthly Volume & Unit Economics */}
          <div className="bg-white rounded-2xl p-5 border border-[#E6E4DC] shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-[#143626] border-b border-[#F0EEE6] pb-3">
              {t('calcUnitHeader')}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#52796F] font-medium block mb-1.5">
                  {t('calcUnitsSold')}
                </label>
                <input
                  type="number"
                  value={inputs.expectedUnitsSoldPerMonth}
                  onChange={e => handleInputChange('expectedUnitsSoldPerMonth', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5D2C7] bg-[#FAF9F5] text-xs font-semibold focus:outline-none focus:border-[#1B4332]"
                />
              </div>

              <div>
                <label className="text-xs text-[#52796F] font-medium block mb-1.5">
                  {t('calcSellingPrice')}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-[#718096]">₹</span>
                  <input
                    type="number"
                    value={inputs.sellingPricePerUnit}
                    onChange={e => handleInputChange('sellingPricePerUnit', e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#D5D2C7] bg-[#FAF9F5] text-xs font-semibold focus:outline-none focus:border-[#1B4332]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#52796F] font-medium block mb-1.5">
                  {t('calcRawMaterialCost')}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-[#718096]">₹</span>
                  <input
                    type="number"
                    value={inputs.rawMaterialCostPerUnit}
                    onChange={e => handleInputChange('rawMaterialCostPerUnit', e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#D5D2C7] bg-[#FAF9F5] text-xs font-semibold focus:outline-none focus:border-[#1B4332]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#52796F] font-medium block mb-1.5">
                  {t('calcBufferMonths')}
                </label>
                <select
                  value={inputs.workingCapitalBufferMonths}
                  onChange={e => handleInputChange('workingCapitalBufferMonths', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5D2C7] bg-[#FAF9F5] text-xs font-semibold focus:outline-none focus:border-[#1B4332]"
                >
                  <option value={1}>1 Month (High Risk)</option>
                  <option value={2}>2 Months (Recommended Minimum)</option>
                  <option value={3}>3 Months (Safe Rural Buffer)</option>
                  <option value={4}>4 Months (High Seasonality Buffer)</option>
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Feasibility Results & Resilience Stress Tests (5 cols) */}
        <div className="lg:col-span-5 space-y-6">

          {evaluation && (
            <>
              {/* Main Summary Metric Card */}
              <div className="bg-[#143626] rounded-3xl p-6 text-white shadow-md space-y-6">
                <div>
                  <span className="text-[10px] text-[#A3B18A] uppercase font-bold tracking-wider block">
                    {t('calcTotalInitialInvestment')}
                  </span>
                  <div className="text-3xl sm:text-4xl font-black mt-1 text-white">
                    ₹{evaluation.initialInvestment.toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-[#A3B18A] mt-1 flex items-center gap-2">
                    <span>Capex: ₹{evaluation.initialCapex.toLocaleString('en-IN')}</span>
                    <span>•</span>
                    <span>Reserve: ₹{evaluation.initialOpexReserve.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#2D6A4F] text-xs">
                  <div>
                    <span className="text-[#A3B18A] block text-[11px]">{t('calcBreakEvenVolume')}</span>
                    <span className="text-lg font-bold text-white">
                      {evaluation.breakEvenUnits} {language === 'en' ? 'units/mo' : 'యూనిట్లు/నెల'}
                    </span>
                    <span className="text-[10px] text-[#A3B18A] block">
                      ₹{evaluation.breakEvenRevenueINR.toLocaleString('en-IN')} {language === 'en' ? 'sales' : 'అమ్మకాలు'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#A3B18A] block text-[11px]">
                      {language === 'en' ? 'Zero-Sales Runway' : 'కనీస నగదు రక్షణ'}
                    </span>
                    <span className="text-lg font-bold text-[#52B788]">
                      {evaluation.cashRunwayZeroSalesMonths} {language === 'en' ? 'months' : 'నెలలు'}
                    </span>
                    <span className="text-[10px] text-[#A3B18A] block">
                      {language === 'en' ? 'Before cash depletion' : 'డబ్బు నిలిచిపోయే వరకు'}
                    </span>
                  </div>
                </div>

                {/* Contribution Margin Banner */}
                <div className="bg-[#1D4A36] p-3 rounded-xl border border-[#2D6A4F] flex items-center justify-between text-xs">
                  <span className="text-[#A3B18A]">{language === 'en' ? 'Unit Contribution Margin:' : 'యూనిట్ లాభ మార్జిన్:'}</span>
                  <span className="font-bold text-white">
                    ₹{evaluation.contributionMarginPerUnit.toLocaleString('en-IN')} ({(evaluation.contributionMarginRatio * 100).toFixed(1)}%)
                  </span>
                </div>

                {/* Primary Action Button: Launch Navigator */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      onNavigate('plan', initialOpportunityId || 'from_calculator');
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#52B788] text-[#143626] text-xs font-extrabold hover:bg-[#74C69D] cursor-pointer shadow-sm transition-transform active:scale-98"
                  >
                    <span>{t('proceedToNavigatorBtn')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Warnings Box if any */}
              {evaluation.warnings && evaluation.warnings.length > 0 && (
                <div className="bg-[#FFFBEB] rounded-2xl p-4 border border-[#FDE68A] space-y-2 text-xs text-[#92400E]">
                  <h4 className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-[#D97706]" />
                    <span>{language === 'en' ? 'Financial Feasibility Cautions' : 'ఆర్థిక సాధ్యత హెచ్చరికలు'}</span>
                  </h4>
                  <ul className="space-y-1 text-[11px] list-disc list-inside">
                    {evaluation.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 4 Adverse Stress Scenarios Selector */}
              <div className="bg-white rounded-2xl p-5 border border-[#E6E4DC] shadow-xs space-y-4">
                <div className="space-y-1">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-[#143626] flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-[#C45A30]" />
                    <span>{t('stressScenariosHeader')}</span>
                  </h3>
                  <p className="text-[11px] text-[#52796F]">
                    {t('stressScenariosSub')}
                  </p>
                </div>

                {/* Stress Scenario Radio Buttons */}
                <div className="space-y-2">
                  {[
                    { id: 'base' as const, labelEn: 'Baseline Expected', labelTe: 'సాధారణ అంచనా', badge: 'Normal' },
                    { id: 'volumeShock' as const, labelEn: 'Adverse 1: Demand Drop (-25% Sales)', labelTe: 'ప్రతికూలత 1: అమ్మకాలు 25% తగ్గితే', badge: 'Demand Shock' },
                    { id: 'inputPriceShock' as const, labelEn: 'Adverse 2: Raw Material Surge (+15%)', labelTe: 'ప్రతికూలత 2: ముడి సరుకు ధరలు 15% పెరిగితే', badge: 'Price Shock' },
                    { id: 'downtimeShock' as const, labelEn: 'Adverse 3: Machine / Grid Breakdown (15 Days Lost)', labelTe: 'ప్రతికూలత 3: మెషిన్ మరమ్మతు (15 రోజులు బంద్)', badge: 'Downtime' },
                    { id: 'creditDelayShock' as const, labelEn: 'Adverse 4: Kirana Credit Delays (30% Udhari)', labelTe: 'ప్రతికూలత 4: కిరాణా ఉధారి 30% ఆలస్యం', badge: 'Credit Delay' },
                  ].map(sc => (
                    <button
                      key={sc.id}
                      onClick={() => setSelectedStressScenario(sc.id)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-colors flex items-center justify-between cursor-pointer ${
                        selectedStressScenario === sc.id
                          ? 'bg-[#F2F8F4] border-[#2D6A4F] font-bold text-[#143626]'
                          : 'bg-[#FAF9F5] border-[#E6E4DC] text-[#52796F] hover:bg-[#F0EEE6]'
                      }`}
                    >
                      <span>{language === 'en' ? sc.labelEn : sc.labelTe}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-[#D5D2C7] font-semibold text-[#143626]">
                        {sc.badge}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Active Scenario Result Box */}
                {currentScenario && (
                  <div className="bg-[#FAF9F5] p-4 rounded-xl border border-[#E6E4DC] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#52796F]">{language === 'en' ? 'Net Monthly Surplus / (Loss):' : 'నికర నెలవారీ లాభం / (నష్టం):'}</span>
                      <span
                        className={`text-base font-extrabold ${
                          currentScenario.monthlyNetSurplusOrLoss >= 0 ? 'text-[#166534]' : 'text-[#DC2626]'
                        }`}
                      >
                        {currentScenario.monthlyNetSurplusOrLoss >= 0 ? '+' : ''}
                        ₹{currentScenario.monthlyNetSurplusOrLoss.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#EAE8DE] text-[11px] text-[#52796F]">
                      <div>
                        <span>Sales Revenue:</span>{' '}
                        <span className="font-bold text-[#143626]">₹{currentScenario.monthlyRevenue.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span>Annual Impact:</span>{' '}
                        <span className={`font-bold ${currentScenario.annualSurplusOrLoss >= 0 ? 'text-[#166534]' : 'text-[#DC2626]'}`}>
                          ₹{currentScenario.annualSurplusOrLoss.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Save Snapshot to Account */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={handleSaveSnapshot}
                  disabled={savingSnapshot}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-[#D5D2C7] bg-white text-[#143626] text-xs font-bold hover:bg-[#FAF9F5] cursor-pointer"
                >
                  <Save className="w-4 h-4 text-[#2D6A4F]" />
                  <span>{savingSnapshot ? t('loading') : (language === 'en' ? 'Save Snapshot to Account' : 'ఖాతాలో సేవ్ చేయండి')}</span>
                </button>
                {saveSuccessNotice && (
                  <span className="text-xs text-[#166534] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Saved!</span>
                  </span>
                )}
              </div>

            </>
          )}

        </div>

      </div>

      {/* SECTION: 12-Month Month-by-Month Deterministic Cash Flow & Seasonality Timeline */}
      {evaluation && evaluation.monthlyCashFlow12Months && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E6E4DC] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0EEE6] pb-4">
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-[#143626] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#2D6A4F]" />
                <span>{t('seasonalityCashFlowHeader')}</span>
              </h3>
              <p className="text-xs text-[#52796F] max-w-2xl">
                {t('seasonalityCashFlowSub')}
              </p>
            </div>
            <div className="text-xs bg-[#FAF9F5] p-2.5 rounded-xl border border-[#E6E4DC] flex items-center gap-3">
              <div>
                <span className="text-[#718096] block text-[10px]">Lowest Cash Month:</span>
                <span className="font-bold text-[#C45A30]">
                  Month {evaluation.lowestCashMonth} (₹{evaluation.lowestCashBalance.toLocaleString('en-IN')})
                </span>
              </div>
            </div>
          </div>

          {/* Month-by-Month Responsive Grid */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-[#FAF9F5] text-[#52796F] border-b border-[#E6E4DC]">
                  <th className="py-2.5 px-3 font-bold">Month</th>
                  <th className="py-2.5 px-3 font-bold">Season Index</th>
                  <th className="py-2.5 px-3 font-bold">Volume</th>
                  <th className="py-2.5 px-3 font-bold">Revenue</th>
                  <th className="py-2.5 px-3 font-bold">Overheads</th>
                  <th className="py-2.5 px-3 font-bold">Net Flow</th>
                  <th className="py-2.5 px-3 font-bold">Cash Reserve</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EEE6]">
                {evaluation.monthlyCashFlow12Months.map((m) => {
                  const isLowest = m.month === evaluation.lowestCashMonth;
                  return (
                    <tr
                      key={m.month}
                      className={`hover:bg-[#FAF9F5] ${
                        isLowest ? 'bg-[#FFFBEB] font-semibold' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-[#143626] font-bold">
                        {m.monthName} ({m.month})
                      </td>
                      <td className="py-2.5 px-3 text-[#52796F]">
                        {(m.seasonFactor * 100).toFixed(0)}%
                      </td>
                      <td className="py-2.5 px-3 text-[#143626]">
                        {m.unitsSold}
                      </td>
                      <td className="py-2.5 px-3 text-[#143626]">
                        ₹{m.grossRevenue.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-[#52796F]">
                        ₹{m.fixedOverheads.toLocaleString('en-IN')}
                      </td>
                      <td
                        className={`py-2.5 px-3 font-bold ${
                          m.netCashFlow >= 0 ? 'text-[#166534]' : 'text-[#DC2626]'
                        }`}
                      >
                        {m.netCashFlow >= 0 ? '+' : ''}
                        ₹{m.netCashFlow.toLocaleString('en-IN')}
                      </td>
                      <td
                        className={`py-2.5 px-3 font-extrabold ${
                          m.closingCashReserve >= 0 ? 'text-[#143626]' : 'text-[#DC2626]'
                        }`}
                      >
                        ₹{m.closingCashReserve.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION: Transparent Formula Explanations Accordion */}
      {evaluation && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E6E4DC] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-extrabold text-sm text-[#143626] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#2D6A4F]" />
                <span>{t('formulaExplanationsHeader')}</span>
              </h3>
              <p className="text-xs text-[#52796F]">
                {t('formulaExplanationsSub')}
              </p>
            </div>
            <button
              onClick={() => setShowFormulaDetails(!showFormulaDetails)}
              className="text-xs font-bold text-[#2D6A4F] hover:underline cursor-pointer"
            >
              {showFormulaDetails ? (language === 'en' ? 'Hide Details ▲' : 'దాచు ▲') : (language === 'en' ? 'Show All Formulas ▼' : 'సూత్రాలు చూడండి ▼')}
            </button>
          </div>

          {showFormulaDetails && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-[#F0EEE6]">
              {evaluation.formulaExplanations.map((f, i) => (
                <div key={i} className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E6E4DC] space-y-2 text-xs">
                  <span className="font-bold text-[#143626] block">{f.metric}</span>
                  <div className="font-mono text-[11px] text-[#2D6A4F] bg-white p-2 rounded-lg border border-[#E6E4DC]">
                    {f.formula}
                  </div>
                  <div className="text-[11px] text-[#52796F]">
                    <span className="font-semibold text-[#143626]">Your numbers:</span> {f.userCalculation}
                  </div>
                  <p className="text-[10px] text-[#718096] italic">
                    {f.significance}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
