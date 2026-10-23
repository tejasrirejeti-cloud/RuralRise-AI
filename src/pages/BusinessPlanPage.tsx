/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { api } from '../services/api.js';
import { BusinessPlan, LaunchChecklistItem } from '../types/index.js';
import { WorkflowStepper } from '../components/common/WorkflowStepper.js';
import { 
  FileText, 
  Printer, 
  Save, 
  Sparkles, 
  CheckCircle2, 
  MapPin, 
  Wallet, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  Calendar,
  Plus,
  Trash2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Rocket,
  CheckSquare,
  Square,
  Clock,
  Layers,
  Building2,
  PhoneCall
} from 'lucide-react';

interface BusinessPlanPageProps {
  onNavigate: (tab: string, param?: string) => void;
  planIdOrMode?: string;
}

const DEFAULT_LAUNCH_CHECKLIST: LaunchChecklistItem[] = [
  // Phase 1: Demand & Price Validation
  {
    id: 'chk-1-1',
    phase: 'demand_validation',
    titleEn: 'Interview 5 local retail kiranas in your mandal center',
    titleTe: 'మీ మండలంలో 5 స్థానిక కిరాణా దుకాణదారులతో మాట్లాడండి',
    descriptionEn: 'Verify prevailing wholesale purchase prices, packaging size preferences (250g vs 500g), and whether they require credit (udhari) for 15-30 days.',
    descriptionTe: 'స్థానిక దుకాణదారులు ఏ ధరకు కొంటున్నారు, ఏ సైజు ప్యాకెట్లు ఎక్కువ అమ్ముడవుతాయి మరియు ఉధారి అడుగుతారా అని తెలుసుకోండి.',
    verifiedSourceRef: 'Field Demand Validation',
    completed: false
  },
  {
    id: 'chk-1-2',
    phase: 'demand_validation',
    titleEn: 'Check wholesale arrivals and benchmark rates at Enumamula Market Yard',
    titleTe: 'ఎనుమాముల వ్యవసాయ మార్కెట్ యార్డ్‌లో తాజా హోల్‌సేల్ ధరలు పరిశీలించండి',
    descriptionEn: 'Review real-time mandi prices on agmarknet.gov.in or visit the terminal yard to compare farm-gate rates against trading quotes.',
    descriptionTe: 'AGMARKNET పోర్టల్‌లో లేదా నేరుగా ఎనుమాముల యార్డులో ముడి సరుకు కనీస మరియు గరిష్ట ధరలను సరిచూసుకోండి.',
    verifiedSourceRef: 'AGMARKNET Enumamula AMC',
    verifiedSourceUrl: 'https://agmarknet.gov.in',
    completed: false
  },

  // Phase 2: Equipment Quotations & Specs
  {
    id: 'chk-2-1',
    phase: 'cost_quotations',
    titleEn: 'Obtain 2 written machinery quotations with GST and warranty terms',
    titleTe: 'యంత్రాల కొనుగోలుకు GST మరియు వారంటీతో కూడిన 2 రాతపూర్వక కొటేషన్లు తీసుకోండి',
    descriptionEn: 'Request detailed commercial proforma invoices from vendors in Warangal Industrial Area or Hyderabad. Verify freight and installation terms.',
    descriptionTe: 'వరంగల్ లేదా హైదరాబాద్ యంత్రాల డీలర్ల నుండి స్పెక్స్, ట్రాన్స్‌పోర్ట్ మరియు వారంటీ వివరాలతో కొటేషన్లు పొందండి.',
    verifiedSourceRef: 'Vendor Equipment Verification',
    completed: false
  },
  {
    id: 'chk-2-2',
    phase: 'cost_quotations',
    titleEn: 'Verify electrical load compatibility with TSSPDCL local assistant',
    titleTe: 'విద్యుత్ శాఖ (TSSPDCL) స్థానిక అధికారితో 3-ఫేజ్ లోడ్ సరిపోతుందో లేదో చూడండి',
    descriptionEn: 'Inspect whether commercial 3-phase power is available at the workshop shed or if a transformer upgrade application is required.',
    descriptionTe: 'షెడ్డు వద్ద 3-ఫేజ్ విద్యుత్ అందుబాటులో ఉందా లేదా కొత్త కనెక్షన్ కోసం దరఖాస్తు చేయాలా అని ధృవీకరించండి.',
    verifiedSourceRef: 'TSSPDCL Warangal Circle',
    verifiedSourceUrl: 'https://www.tssouthernpower.com',
    completed: false
  },

  // Phase 3: Workspace & Resource Checks
  {
    id: 'chk-3-1',
    phase: 'resource_checks',
    titleEn: 'Finalize workshop lease with minimum 11-month lock-in agreement',
    titleTe: 'కనీసం 11 నెలల లీజు ఒప్పందంతో వర్క్‌షాప్ గది/షెడ్డును ఖరారు చేయండి',
    descriptionEn: 'Ensure premises have commercial road access for loading tempos, secure concrete flooring, and water access.',
    descriptionTe: 'టెంపో వాహనాలు వచ్చిపోయే రహదారి, దృఢమైన ఫ్లోరింగ్ మరియు నీటి సదుపాయం ఉన్న షెడ్డును ఎంచుకోండి.',
    verifiedSourceRef: 'Physical Premises Audit',
    completed: false
  },
  {
    id: 'chk-3-2',
    phase: 'resource_checks',
    titleEn: 'Set up moisture-proof raw material storage pallets and ventilation',
    titleTe: 'ముడి సరుకు బూజు పట్టకుండా సురక్షితమైన స్టోరేజ్ రాక్స్ మరియు ఎగ్జాస్ట్ ఏర్పాటు చేయండి',
    descriptionEn: 'Store agricultural pods or grains at least 6 inches above floor level on wooden/plastic pallets to prevent ground dampness.',
    descriptionTe: 'వర్షాకాలంలో నేల నుండి తేమ సోకకుండా చెక్క ప్యాలెట్లపై బస్తాలను భద్రపరచండి.',
    verifiedSourceRef: 'Storage & Hygiene Standard',
    completed: false
  },

  // Phase 4: Official Scheme & Statutory Compliance
  {
    id: 'chk-4-1',
    phase: 'scheme_verification',
    titleEn: 'Register free MSME Udyam Certificate at udyamregistration.gov.in',
    titleTe: 'ఉద్యమ్ పోర్టల్‌లో ఉచితంగా MSME రిజిస్ట్రేషన్ సర్టిఫికేట్ పొందండి',
    descriptionEn: 'Mandatory free registration providing micro-enterprise status, bank priority sector lending eligibility, and interest subvention benefits.',
    descriptionTe: 'బ్యాంకు రుణాలు మరియు సబ్సిడీల కోసం అధికారిక MSME గుర్తింపు సర్టిఫికేట్ ఉచితంగా డౌన్‌లోడ్ చేసుకోండి.',
    verifiedSourceRef: 'Ministry of MSME, Govt of India',
    verifiedSourceUrl: 'https://udyamregistration.gov.in',
    completed: false
  },
  {
    id: 'chk-4-2',
    phase: 'scheme_verification',
    titleEn: 'Visit District Industries Centre (DIC) Subedari, Hanamkonda',
    titleTe: 'హనుమకొండ సుబేదారిలోని జిల్లా పరిశ్రమల కేంద్రం (DIC) ను సంప్రదించండి',
    descriptionEn: 'Consult General Manager DIC or PMFME District Resource Person (DRP) to verify PMEGP 35% capital subsidy or T-PRIDE eligibility.',
    descriptionTe: 'PMEGP లేదా T-PRIDE పథకం కింద 35% సబ్సిడీ కోసం DIC కార్యాలయంలో అధికారులను కలవండి.',
    verifiedSourceRef: 'DIC Warangal / Hanamkonda (0870-2577626)',
    verifiedSourceUrl: 'https://ipass.telangana.gov.in',
    completed: false
  },
  {
    id: 'chk-4-3',
    phase: 'scheme_verification',
    titleEn: 'Apply for FSSAI Basic Food Registration or Panchayat Trade License',
    titleTe: 'FSSAI ఫుడ్ రిజిస్ట్రేషన్ (సంవత్సరానికి ₹100) లేదా పంచాయతీ ట్రేడ్ లైసెన్స్ పొందండి',
    descriptionEn: 'Basic FSSAI registration is required for food processing units with turnover under ₹12 Lakhs. Apply on foscos.fssai.gov.in.',
    descriptionTe: 'ఆహార పదార్థాల విక్రయానికి FSSAI రిజిస్ట్రేషన్ తప్పనిసరి. ఆన్‌లైన్‌లో సులభంగా పొందవచ్చు.',
    verifiedSourceRef: 'Food Safety and Standards Authority of India',
    verifiedSourceUrl: 'https://foscos.fssai.gov.in',
    completed: false
  },
  {
    id: 'chk-4-4',
    phase: 'scheme_verification',
    titleEn: 'Open dedicated current account at local bank branch (SBI / TGGB)',
    titleTe: 'స్థానిక బ్యాంకు శాఖలో (SBI లేదా TGGB) ప్రత్యేక కరెంట్ ఖాతా తెరవండి',
    descriptionEn: 'Separate business funds from personal household money to establish a clean financial footprint for future bank loan enhancements.',
    descriptionTe: 'వ్యాపార లావాదేవీలను కుటుంబ ఖర్చులతో కలపకుండా బ్యాంక్ కరెంట్ అకౌంట్ మాత్రమే వాడండి.',
    verifiedSourceRef: 'Banking Norms',
    completed: false
  },

  // Phase 5: Operational Trial & Working Capital Protection
  {
    id: 'chk-5-1',
    phase: 'operational_launch',
    titleEn: 'Conduct small test batch run to verify processing loss and packaging seals',
    titleTe: 'చిన్న నమూనా బ్యాచ్‌తో యంత్రం నాణ్యత మరియు ప్యాకింగ్ సీలింగ్‌ను పరీక్షించండి',
    descriptionEn: 'Process 25 kg raw material to calibrate pulverizer sieve, test pouch heat seal integrity under water submersion test, and calculate exact yield.',
    descriptionTe: '25 కేజీల ముడి సరుకుతో ట్రయల్ రన్ చేసి ప్యాకింగ్ సరిగ్గా ఉందో లేదో చూడండి.',
    verifiedSourceRef: 'Standard Quality Control',
    completed: false
  },
  {
    id: 'chk-5-2',
    phase: 'operational_launch',
    titleEn: 'Procure raw materials for maximum 15 days of production only',
    titleTe: 'ప్రారంభంలో కేవలం 15 రోజులకు సరిపడా ముడి సరుకు మాత్రమే కొనండి',
    descriptionEn: 'Protect liquid working capital reserves. Never buy 3 months of inventory on day one before testing customer repeat demand.',
    descriptionTe: 'ప్రారంభంలోనే ఎక్కువ సరుకు కొని డబ్బులను ఇరుక్కోకుండా కాపాడుకోండి.',
    verifiedSourceRef: 'Working Capital Preservation Rule',
    completed: false
  },
  {
    id: 'chk-5-3',
    phase: 'operational_launch',
    titleEn: 'Record first 10 sales transactions in physical daily cash register',
    titleTe: 'మొదటి 10 అమ్మకాల లావాదేవీలను రోజువారీ లెక్కల పుస్తకంలో నమోదు చేయండి',
    descriptionEn: 'Track cash receipts, pending udhari credit receivables, and daily raw material expenses from day one.',
    descriptionTe: 'వచ్చిన నగదు మరియు ఇంకా రావాల్సిన బాకీలను మొదటి రోజు నుండే పక్కాగా రికార్డ్ చేయండి.',
    verifiedSourceRef: 'Rural Bookkeeping Protocol',
    completed: false
  }
];

export const BusinessPlanPage: React.FC<BusinessPlanPageProps> = ({ 
  onNavigate,
  planIdOrMode 
}) => {
  const { user, profile } = useAuth();
  const { t, language } = useLanguage();

  const [plans, setPlans] = useState<BusinessPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<BusinessPlan | null>(null);
  const [activePlanTab, setActivePlanTab] = useState<'checklist' | 'plan' | 'ai'>('checklist');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiRefining, setAiRefining] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Load plans
  useEffect(() => {
    async function loadPlans() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.getBusinessPlans();
        setPlans(res.plans);

        if (res.plans.length > 0) {
          if (planIdOrMode && planIdOrMode !== 'new' && planIdOrMode !== 'from_calculator') {
            const matched = res.plans.find(p => p.id === planIdOrMode || p.opportunityId === planIdOrMode);
            setCurrentPlan(matched || res.plans[0]);
          } else if (planIdOrMode === 'new') {
            handleCreateNewPlan();
          } else {
            setCurrentPlan(res.plans[0]);
          }
        } else {
          handleCreateNewPlan();
        }
      } catch (err) {
        console.error('Failed to load business plans:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPlans();
  }, [user, planIdOrMode]);

  const handleCreateNewPlan = () => {
    const mandal = profile?.mandal || 'Warangal (Urban)';
    const budget = profile?.startingBudget || 120000;

    const draft: BusinessPlan = {
      id: `draft-${Date.now()}`,
      userId: user?.id || 'guest',
      title: `${mandal} Rural Micro-Enterprise Project Plan`,
      status: 'draft',
      concept: {
        summary: `Establish a viable rural micro-enterprise in ${mandal} mandal, Warangal District, to create sustainable non-farm income.`,
        productServiceDescription: 'Hygienic local production and packaging of essential products tailored for rural consumers.',
        locationMandal: mandal,
        uniqueness: 'Direct procurement from local Warangal agricultural clusters, minimal transport markups, zero adulteration.'
      },
      market: {
        targetCustomers: 'Local mandal center kirana stores, weekly village shandies, and local town catering services.',
        localCompetition: 'Currently supplied by distant city distributors with added transport cost margins.',
        pricingStrategy: 'Competitive local pricing offering superior freshness and direct entrepreneur service.',
        salesChannels: 'Direct deliveries to village retailers and weekly morning market stalls.'
      },
      operations: {
        equipmentList: 'Commercial machinery, digital weighing scale, continuous pouch heat sealer, power backup.',
        rawMaterialSources: 'Local Warangal farmers and Enumamula Agricultural Market Yard.',
        powerAndWaterNeeds: 'Dedicated commercial 3-phase power connection, borewell water supply.',
        laborRequirements: 'Entrepreneur full-time operator + 1 family assistant.'
      },
      financials: {
        capitalNeeded: budget,
        ownContribution: Math.round(budget * 0.25),
        expectedLoanOrScheme: Math.round(budget * 0.75),
        monthlyProjectedRevenue: Math.round(budget * 0.6),
        monthlyProjectedExpenses: Math.round(budget * 0.45),
        monthlyExpectedSurplus: Math.round(budget * 0.15),
        breakEvenUnits: 160
      },
      risksAndMitigations: [
        {
          risk: 'Seasonal raw material price variation',
          mitigation: 'Procure bulk raw materials during peak harvest arrivals at Enumamula market.'
        },
        {
          risk: 'Working capital strain from retailer credit',
          mitigation: 'Enforce maximum 15-day credit cycle and maintain 2-month cash operating reserve.'
        }
      ],
      milestones: [
        { month: 'Month 1', task: 'Obtain free Udyam MSME and Gram Panchayat trade NOC', completed: false },
        { month: 'Month 2', task: 'Apply for PMEGP / Mudra loan sanction at Lead Bank', completed: false },
        { month: 'Month 3', task: 'Machinery installation, 3-phase power inspection, and trial batch', completed: false },
        { month: 'Month 4', task: 'Commercial production launch and first 10 retailer tie-ups', completed: false }
      ],
      applicableSchemes: ['PMEGP (35% Rural Capital Subsidy)', 'PMFME ODOP Scheme', 'Pradhan Mantri Mudra Yojana'],
      launchChecklist: DEFAULT_LAUNCH_CHECKLIST,
      launchReadinessPercent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setCurrentPlan(draft);
  };

  const handleToggleChecklistItem = (itemId: string) => {
    if (!currentPlan) return;
    const currentList = currentPlan.launchChecklist || DEFAULT_LAUNCH_CHECKLIST;
    const updated = currentList.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          completed: !item.completed,
          completedAt: !item.completed ? new Date().toISOString() : undefined
        };
      }
      return item;
    });

    const completedCount = updated.filter(i => i.completed).length;
    const readiness = Math.round((completedCount / updated.length) * 100);

    const newPlanState = {
      ...currentPlan,
      launchChecklist: updated,
      launchReadinessPercent: readiness
    };

    setCurrentPlan(newPlanState);
  };

  const handleUpdateChecklistNote = (itemId: string, noteText: string) => {
    if (!currentPlan) return;
    const currentList = currentPlan.launchChecklist || DEFAULT_LAUNCH_CHECKLIST;
    const updated = currentList.map(item => {
      if (item.id === itemId) {
        return { ...item, notes: noteText };
      }
      return item;
    });

    setCurrentPlan({
      ...currentPlan,
      launchChecklist: updated
    });
  };

  const handleSavePlan = async () => {
    if (!currentPlan) return;
    if (!user) {
      onNavigate('auth');
      return;
    }

    setSaving(true);
    try {
      if (currentPlan.id.startsWith('draft-')) {
        const { id, userId, createdAt, updatedAt, ...payload } = currentPlan;
        const res = await api.createBusinessPlan(payload);
        setCurrentPlan(res.plan);
        setPlans(prev => [res.plan, ...prev]);
      } else {
        const res = await api.updateBusinessPlan(currentPlan.id, currentPlan);
        setCurrentPlan(res.plan);
        setPlans(prev => prev.map(p => p.id === res.plan.id ? res.plan : p));
      }

      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3500);
    } catch (err) {
      console.error('Failed to save business plan:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCurrentPlan = async () => {
    if (!currentPlan) return;
    setDeleting(true);
    try {
      if (!currentPlan.id.startsWith('draft-')) {
        await api.deleteBusinessPlan(currentPlan.id);
      }
      const remaining = plans.filter(p => p.id !== currentPlan.id);
      setPlans(remaining);
      if (remaining.length > 0) {
        setCurrentPlan(remaining[0]);
      } else {
        handleCreateNewPlan();
      }
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error('Failed to delete plan:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleAIRefine = async () => {
    if (!currentPlan) return;
    setAiRefining(true);
    setAiError(null);

    try {
      const res = await api.refineBusinessPlanWithAI(currentPlan);
      const updatedPlan: BusinessPlan = {
        ...currentPlan,
        aiRefinement: res.refinement
      };
      setCurrentPlan(updatedPlan);

      if (!currentPlan.id.startsWith('draft-') && user) {
        await api.updateBusinessPlan(currentPlan.id, { aiRefinement: res.refinement });
      }
      setActivePlanTab('ai');
    } catch (err: any) {
      setAiError(
        err.message ||
          (language === 'en'
            ? 'AI refinement service requires GEMINI_API_KEY configuration on the server. You can continue creating, calculating, and managing your business plan manually.'
            : 'AI ఫీచర్ కోసం సర్వర్‌లో GEMINI_API_KEY కాన్ఫిగరేషన్ అవసరం. మీరు మీ ప్రణాళికను నేరుగా లెక్కించి నిర్వహించుకోవచ్చు.')
      );
    } finally {
      setAiRefining(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto my-16 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] text-[#1B4332] flex items-center justify-center mx-auto">
          <Rocket className="w-6 h-6 text-[#2D6A4F]" />
        </div>
        <h2 className="text-2xl font-bold text-[#143626]">
          {language === 'en' ? 'Sign In to Access Your Launch Navigator' : 'లాంచ్ నావిగేటర్ కోసం లాగిన్ అవ్వండి'}
        </h2>
        <p className="text-xs sm:text-sm text-[#52796F]">
          {language === 'en'
            ? 'Account isolation ensures your launch checklist progress and financial project plans remain confidential.'
            : 'మీ లాంచ్ ప్రణాళికలు మరియు చెక్‌లిస్టులు మీ ఖాతాలోనే సురక్షితంగా ఉంటాయి.'}
        </p>
        <button
          onClick={() => onNavigate('auth')}
          className="px-6 py-3 rounded-xl bg-[#1B4332] text-white text-xs font-bold hover:bg-[#143626] transition-colors cursor-pointer"
        >
          {t('navSignIn')}
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-16 text-[#52796F] text-sm animate-pulse">{t('loading')}</div>;
  }

  const checklistItems = currentPlan?.launchChecklist || DEFAULT_LAUNCH_CHECKLIST;
  const completedCount = checklistItems.filter(i => i.completed).length;
  const readinessPercent = Math.round((completedCount / checklistItems.length) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 print:p-0 print:m-0">
      
      {/* Integrated Workflow Stepper */}
      <div className="print:hidden">
        <WorkflowStepper 
          currentStep={3} 
          opportunityName={currentPlan?.title}
          onStepClick={(step) => {
            if (step === 1) onNavigate('explore');
            if (step === 2) onNavigate('calculator', currentPlan?.opportunityId);
          }}
        />
      </div>

      {/* Header Actions (Hidden in Print Mode) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF7EE] text-[#1B4332] text-xs font-bold border border-[#C7E9CE]">
            <Rocket className="w-3.5 h-3.5 text-[#2D6A4F]" />
            <span>{language === 'en' ? 'Idea-to-Launch Navigator' : 'ఐడియా-టు-లాంచ్ నావిగేటర్'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#143626]">
            {t('planTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-[#52796F]">
            {t('planSubtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {plans.length > 1 && (
            <select
              value={currentPlan?.id || ''}
              onChange={e => {
                const found = plans.find(p => p.id === e.target.value);
                if (found) setCurrentPlan(found);
              }}
              className="px-3 py-2 rounded-xl border border-[#D5D2C7] bg-white text-xs font-semibold text-[#143626] focus:outline-none cursor-pointer"
            >
              {plans.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          )}

          <button
            onClick={handleCreateNewPlan}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#D5D2C7] bg-white text-[#143626] text-xs font-bold hover:bg-[#FAF9F5] transition-colors cursor-pointer"
            title="Create fresh plan"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'New Plan' : 'కొత్తది'}</span>
          </button>

          <button
            onClick={handleAIRefine}
            disabled={aiRefining}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#E8F5E9] text-[#1B4332] text-xs font-bold hover:bg-[#D8F3DC] transition-colors border border-[#C8E6C9] cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C45A30]" />
            <span>{aiRefining ? t('aiRefiningText') : t('aiRefineBtn')}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#D5D2C7] bg-white text-[#143626] text-xs font-bold hover:bg-[#FAF9F5] transition-colors shadow-2xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[#52796F]" />
            <span>{t('exportPdfBtn')}</span>
          </button>

          <button
            onClick={handleSavePlan}
            disabled={saving}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#1B4332] text-white text-xs font-bold hover:bg-[#143626] transition-colors shadow-xs cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? t('loading') : t('savePlanBtn')}</span>
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2.5 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-800 transition-colors cursor-pointer border border-transparent hover:border-red-200"
            title="Delete this business plan"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Save Success Banner */}
      {savedNotice && (
        <div className="bg-[#E8F5E9] border border-[#A7D7B9] text-[#143626] text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2 print:hidden animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
          <span>{t('planSavedNotice')}</span>
        </div>
      )}

      {/* AI Error Banner */}
      {aiError && (
        <div className="bg-[#FFF3E0] border border-[#FFE0B2] text-[#9C3814] text-xs p-4 rounded-2xl flex items-start gap-2.5 print:hidden">
          <AlertCircle className="w-4 h-4 text-[#C45A30] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">{language === 'en' ? 'AI Ground Advisory' : 'AI సలహా గమనిక'}</span>
            <p className="leading-relaxed">{aiError}</p>
          </div>
        </div>
      )}

      {currentPlan && (
        <div className="space-y-8">
          
          {/* Plan Header Card & Launch Readiness Score */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E6E4DC] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <input
                type="text"
                value={currentPlan.title}
                onChange={e => setCurrentPlan({ ...currentPlan, title: e.target.value })}
                className="text-xl sm:text-2xl font-extrabold text-[#143626] w-full border-b border-transparent hover:border-[#D5D2C7] focus:border-[#1B4332] focus:outline-none transition-colors"
                placeholder="Business Plan Title"
              />
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#2D6A4F] bg-[#D8F3DC] px-3 py-1 rounded-full">
                  {currentPlan.status.toUpperCase()}
                </span>
                <span className="text-xs text-[#718096]">
                  {language === 'en' ? 'Mandal:' : 'మండలం:'} <strong>{currentPlan.concept?.locationMandal || 'Warangal'}</strong>
                </span>
              </div>
            </div>

            {/* Launch Readiness Meter */}
            <div className="bg-[#FAF9F5] p-4 sm:p-5 rounded-2xl border border-[#E6E4DC] space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#143626] flex items-center gap-1.5">
                  <Rocket className="w-4 h-4 text-[#2D6A4F]" />
                  <span>{t('launchReadinessScore')}</span>
                </span>
                <span className="text-[#2D6A4F] text-sm">
                  {readinessPercent}% ({completedCount} / {checklistItems.length} {language === 'en' ? 'Verified' : 'పూర్తయ్యాయి'})
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-[#EAE8DE] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#2D6A4F] transition-all duration-500 rounded-full"
                  style={{ width: `${readinessPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#52796F]">
                <span>
                  {readinessPercent >= 80 
                    ? (language === 'en' ? '✓ Ready for DIC PMEGP / Bank Loan Submission' : '✓ బ్యాంకు లేదా DIC లో సమర్పించడానికి సిద్ధంగా ఉంది')
                    : (language === 'en' ? 'Complete remaining physical checks before bank application' : 'బ్యాంకు దరఖాస్తుకు ముందు మిగిలిన తనిఖీలను పూర్తి చేయండి')}
                </span>
                <span className="font-semibold text-[#143626]">
                  {readinessPercent >= 80 ? 'High Confidence' : 'In Progress'}
                </span>
              </div>
            </div>

            {/* Tab Switcher for Plan Views */}
            <div className="flex flex-wrap gap-2 border-b border-[#F0EEE6] pb-1 print:hidden text-xs">
              <button
                onClick={() => setActivePlanTab('checklist')}
                className={`px-4 py-2 rounded-xl font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${
                  activePlanTab === 'checklist'
                    ? 'bg-[#143626] text-white shadow-xs'
                    : 'bg-[#FAF9F5] text-[#52796F] hover:bg-[#F0EEE6]'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>{language === 'en' ? '5-Phase Launch Checklist' : '5 దశల లాంచ్ చెక్‌లిస్ట్'}</span>
              </button>

              <button
                onClick={() => setActivePlanTab('plan')}
                className={`px-4 py-2 rounded-xl font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${
                  activePlanTab === 'plan'
                    ? 'bg-[#143626] text-white shadow-xs'
                    : 'bg-[#FAF9F5] text-[#52796F] hover:bg-[#F0EEE6]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Bankable Business Plan' : 'బ్యాంకు ప్రాజెక్ట్ రిపోర్ట్'}</span>
              </button>

              {currentPlan.aiRefinement && (
                <button
                  onClick={() => setActivePlanTab('ai')}
                  className={`px-4 py-2 rounded-xl font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${
                    activePlanTab === 'ai'
                      ? 'bg-[#143626] text-white shadow-xs'
                      : 'bg-[#FAF9F5] text-[#52796F] hover:bg-[#F0EEE6]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C45A30]" />
                  <span>{language === 'en' ? 'AI Ground Guidance' : 'AI క్షేత్ర పరిశీలన'}</span>
                </button>
              )}
            </div>

          </div>

          {/* TAB 1: 5-Phase Interactive Launch Checklist */}
          {(activePlanTab === 'checklist' || typeof window === 'undefined') && (
            <div className="space-y-6">
              
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E6E4DC] shadow-xs space-y-6">
                <div className="space-y-1">
                  <h3 className="font-extrabold text-lg text-[#143626] flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-[#2D6A4F]" />
                    <span>{t('launchChecklistHeader')}</span>
                  </h3>
                  <p className="text-xs text-[#52796F]">
                    {t('launchChecklistSub')}
                  </p>
                </div>

                {/* Checklist Grouped by Phase */}
                {[
                  { id: 'demand_validation', titleEn: t('phaseDemandValidation'), titleTe: t('phaseDemandValidation'), icon: TrendingUp },
                  { id: 'cost_quotations', titleEn: t('phaseCostQuotations'), titleTe: t('phaseCostQuotations'), icon: Wallet },
                  { id: 'resource_checks', titleEn: t('phaseResourceChecks'), titleTe: t('phaseResourceChecks'), icon: Building2 },
                  { id: 'scheme_verification', titleEn: t('phaseSchemeVerification'), titleTe: t('phaseSchemeVerification'), icon: ShieldCheck },
                  { id: 'operational_launch', titleEn: t('phaseOperationalLaunch'), titleTe: t('phaseOperationalLaunch'), icon: Rocket }
                ].map(phase => {
                  const itemsInPhase = checklistItems.filter(i => i.phase === phase.id);
                  if (itemsInPhase.length === 0) return null;
                  const Icon = phase.icon;
                  const phaseCompleted = itemsInPhase.filter(i => i.completed).length;

                  return (
                    <div key={phase.id} className="space-y-3 pt-3 border-t border-[#F0EEE6]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-[#2D6A4F]" />
                          <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#143626]">
                            {language === 'en' ? phase.titleEn : phase.titleTe}
                          </h4>
                        </div>
                        <span className="text-[11px] text-[#52796F] font-semibold">
                          {phaseCompleted} / {itemsInPhase.length} Done
                        </span>
                      </div>

                      <div className="space-y-3">
                        {itemsInPhase.map((item) => (
                          <div
                            key={item.id}
                            className={`p-4 rounded-2xl border transition-colors space-y-2.5 ${
                              item.completed
                                ? 'bg-[#F2F8F4] border-[#C7E9CE]'
                                : 'bg-[#FAF9F5] border-[#E6E4DC]'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <button
                                onClick={() => handleToggleChecklistItem(item.id)}
                                className="mt-0.5 text-[#2D6A4F] cursor-pointer shrink-0 transition-transform active:scale-90"
                              >
                                {item.completed ? (
                                  <CheckCircle2 className="w-5 h-5 fill-[#2D6A4F] text-white" />
                                ) : (
                                  <Square className="w-5 h-5 text-[#8B9B90]" />
                                )}
                              </button>

                              <div className="flex-1 min-w-0 space-y-1">
                                <span
                                  className={`text-xs font-bold block ${
                                    item.completed ? 'text-[#143626] line-through opacity-80' : 'text-[#143626]'
                                  }`}
                                >
                                  {language === 'en' ? item.titleEn : item.titleTe}
                                </span>
                                <p className="text-[11px] text-[#52796F] leading-relaxed">
                                  {language === 'en' ? item.descriptionEn : item.descriptionTe}
                                </p>
                              </div>

                              {item.verifiedSourceUrl && (
                                <a
                                  href={item.verifiedSourceUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] font-bold text-[#2D6A4F] underline flex items-center gap-1 shrink-0 bg-white px-2.5 py-1 rounded-md border border-[#D5D2C7] hover:bg-[#F0EEE6]"
                                >
                                  <span>{language === 'en' ? 'Official Link' : 'పోర్టల్'}</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                            </div>

                            {/* User Field Verification Note Input */}
                            <div className="pl-8 pt-1">
                              <input
                                type="text"
                                value={item.notes || ''}
                                onChange={e => handleUpdateChecklistNote(item.id, e.target.value)}
                                placeholder={language === 'en' ? 'Record physical verification note (e.g. visited vendor, quote received)...' : 'క్షేత్రస్థాయి పరిశీలన నోట్ రాయండి...'}
                                className="w-full px-3 py-1.5 rounded-lg border border-[#E6E4DC] bg-white text-[11px] text-[#143626] placeholder-[#8B9B90] focus:outline-none focus:border-[#2D6A4F]"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB 2: Bankable Business Plan Document */}
          {(activePlanTab === 'plan' || typeof window === 'undefined') && (
            <div className="space-y-8">
              
              {/* Section 1: Executive Concept & Value Proposition */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E6E4DC] shadow-xs space-y-4">
                <h3 className="font-bold text-base text-[#143626] border-b border-[#F0EEE6] pb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#2D6A4F]" />
                  <span>{t('businessConcept')}</span>
                </h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-[#52796F] block mb-1">
                      {language === 'en' ? 'Executive Project Summary' : 'ప్రాజెక్ట్ సారాంశం'}
                    </label>
                    <textarea
                      rows={3}
                      value={currentPlan.concept?.summary || ''}
                      onChange={e => setCurrentPlan({
                        ...currentPlan,
                        concept: { ...currentPlan.concept, summary: e.target.value }
                      })}
                      className="w-full p-3 rounded-xl border border-[#D5D2C7] bg-[#FAF9F5] focus:outline-none focus:border-[#1B4332]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#52796F] block mb-1">
                      {language === 'en' ? 'Competitive Advantage & Local Sourcing' : 'స్థానిక పోటీతత్వం & ముడి సరుకు ప్రయోజనం'}
                    </label>
                    <textarea
                      rows={2}
                      value={currentPlan.concept?.uniqueness || ''}
                      onChange={e => setCurrentPlan({
                        ...currentPlan,
                        concept: { ...currentPlan.concept, uniqueness: e.target.value }
                      })}
                      className="w-full p-3 rounded-xl border border-[#D5D2C7] bg-[#FAF9F5] focus:outline-none focus:border-[#1B4332]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Market & Distribution Channels */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E6E4DC] shadow-xs space-y-4">
                <h3 className="font-bold text-base text-[#143626] border-b border-[#F0EEE6] pb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#2D6A4F]" />
                  <span>{t('marketAndCustomers')}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-[#52796F] block mb-1">
                      {language === 'en' ? 'Target Customers in Warangal' : 'లక్షిత వినియోగదారులు'}
                    </label>
                    <textarea
                      rows={3}
                      value={currentPlan.market?.targetCustomers || ''}
                      onChange={e => setCurrentPlan({
                        ...currentPlan,
                        market: { ...currentPlan.market, targetCustomers: e.target.value }
                      })}
                      className="w-full p-3 rounded-xl border border-[#D5D2C7] bg-[#FAF9F5] focus:outline-none focus:border-[#1B4332]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#52796F] block mb-1">
                      {language === 'en' ? 'Sales & Delivery Channels' : 'అమ్మకాల మార్గాలు'}
                    </label>
                    <textarea
                      rows={3}
                      value={currentPlan.market?.salesChannels || ''}
                      onChange={e => setCurrentPlan({
                        ...currentPlan,
                        market: { ...currentPlan.market, salesChannels: e.target.value }
                      })}
                      className="w-full p-3 rounded-xl border border-[#D5D2C7] bg-[#FAF9F5] focus:outline-none focus:border-[#1B4332]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Operations & Equipment List */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E6E4DC] shadow-xs space-y-4">
                <h3 className="font-bold text-base text-[#143626] border-b border-[#F0EEE6] pb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#2D6A4F]" />
                  <span>{t('operationsSection')}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-[#52796F] block mb-1">
                      {language === 'en' ? 'Equipment & Tools List' : 'యంత్రాలు & పనిముట్లు'}
                    </label>
                    <textarea
                      rows={3}
                      value={currentPlan.operations?.equipmentList || ''}
                      onChange={e => setCurrentPlan({
                        ...currentPlan,
                        operations: { ...currentPlan.operations, equipmentList: e.target.value }
                      })}
                      className="w-full p-3 rounded-xl border border-[#D5D2C7] bg-[#FAF9F5] focus:outline-none focus:border-[#1B4332]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#52796F] block mb-1">
                      {language === 'en' ? 'Raw Material Procurement Sources' : 'ముడి సరుకు సేకరణ మూలాలు'}
                    </label>
                    <textarea
                      rows={3}
                      value={currentPlan.operations?.rawMaterialSources || ''}
                      onChange={e => setCurrentPlan({
                        ...currentPlan,
                        operations: { ...currentPlan.operations, rawMaterialSources: e.target.value }
                      })}
                      className="w-full p-3 rounded-xl border border-[#D5D2C7] bg-[#FAF9F5] focus:outline-none focus:border-[#1B4332]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Financial Summary & Projections */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E6E4DC] shadow-xs space-y-4">
                <h3 className="font-bold text-base text-[#143626] border-b border-[#F0EEE6] pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-[#2D6A4F]" />
                    <span>{t('financialSection')}</span>
                  </div>
                  <button
                    onClick={() => onNavigate('calculator', currentPlan.opportunityId)}
                    className="text-xs text-[#2D6A4F] hover:underline cursor-pointer flex items-center gap-1 font-semibold"
                  >
                    <span>{language === 'en' ? 'Recalculate in Simulator' : 'సిమ్యులేటర్‌లో లెక్కించు'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-[#FAF9F5] p-3 rounded-xl border border-[#E6E4DC]">
                    <span className="text-[10px] text-[#718096] block uppercase tracking-wider">Total Capital</span>
                    <span className="text-base font-extrabold text-[#143626]">
                      ₹{currentPlan.financials?.capitalNeeded?.toLocaleString('en-IN') || '0'}
                    </span>
                  </div>

                  <div className="bg-[#FAF9F5] p-3 rounded-xl border border-[#E6E4DC]">
                    <span className="text-[10px] text-[#718096] block uppercase tracking-wider">Own Promoter Margin</span>
                    <span className="text-base font-extrabold text-[#2D6A4F]">
                      ₹{currentPlan.financials?.ownContribution?.toLocaleString('en-IN') || '0'}
                    </span>
                  </div>

                  <div className="bg-[#FAF9F5] p-3 rounded-xl border border-[#E6E4DC]">
                    <span className="text-[10px] text-[#718096] block uppercase tracking-wider">Bank Loan / Subsidy</span>
                    <span className="text-base font-extrabold text-[#0369A1]">
                      ₹{currentPlan.financials?.expectedLoanOrScheme?.toLocaleString('en-IN') || '0'}
                    </span>
                  </div>

                  <div className="bg-[#FAF9F5] p-3 rounded-xl border border-[#E6E4DC]">
                    <span className="text-[10px] text-[#718096] block uppercase tracking-wider">Monthly Operating Surplus</span>
                    <span className="text-base font-extrabold text-[#166534]">
                      ₹{currentPlan.financials?.monthlyExpectedSurplus?.toLocaleString('en-IN') || '0'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 5: Official Warangal Schemes & Application Desk */}
              <div className="bg-[#FAF9F5] rounded-3xl p-6 sm:p-8 border border-[#E6E4DC] space-y-4">
                <h3 className="font-bold text-base text-[#143626] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#2D6A4F]" />
                  <span>{language === 'en' ? 'Target Schemes & Warangal DIC Facilitation Desk' : 'లక్షిత పథకాలు & జిల్లా పరిశ్రమల కేంద్రం'}</span>
                </h3>

                <p className="text-xs text-[#52796F] leading-relaxed">
                  {language === 'en'
                    ? 'Present this structured document along with your Udyam Certificate and vendor quotation to General Manager DIC, Subedari, Hanamkonda (Phone: 0870-2577626) for PMEGP 35% subsidy or T-PRIDE assistance.'
                    : 'ఈ ప్రాజెక్ట్ రిపోర్ట్, ఉద్యమ్ సర్టిఫికేట్ మరియు కొటేషన్లతో హనుమకొండ సుబేదారిలోని జిల్లా పరిశ్రమల కేంద్రాన్ని సంప్రదించండి.'}
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  {(currentPlan.applicableSchemes || ['PMEGP', 'Mudra', 'PMFME']).map((sc, i) => (
                    <span key={i} className="px-3 py-1 rounded-lg bg-white border border-[#D5D2C7] text-xs font-semibold text-[#143626]">
                      {sc}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: AI Ground Guidance Details */}
          {activePlanTab === 'ai' && currentPlan.aiRefinement && (
            <div className="bg-white border-2 border-[#2D6A4F]/40 rounded-3xl p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between border-b border-[#F0EEE6] pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#C45A30]" />
                  <h3 className="font-bold text-base text-[#143626]">
                    {language === 'en' ? 'AI Ground Intelligence Assessment (Gemini 3.8 Flash)' : 'రూరల్‌రైజ్ AI క్షేత్ర పరిశీలన'}
                  </h3>
                </div>
                <span className="text-[11px] text-[#52796F]">
                  Analyzed against Warangal Market Realities
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                {/* Strengths */}
                <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#E6E4DC] space-y-2">
                  <span className="font-bold text-[#143626] block flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
                    <span>{t('aiStrengthsTitle')}</span>
                  </span>
                  <ul className="space-y-1.5 text-[#4A5568]">
                    {currentPlan.aiRefinement.strengths.map((str, i) => (
                      <li key={i}>• {str}</li>
                    ))}
                  </ul>
                </div>

                {/* Ground Tips */}
                <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#E6E4DC] space-y-2">
                  <span className="font-bold text-[#C45A30] block flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#C45A30]" />
                    <span>{t('aiTipsTitle')}</span>
                  </span>
                  <ul className="space-y-1.5 text-[#4A5568]">
                    {currentPlan.aiRefinement.localGroundTips.map((tip, i) => (
                      <li key={i}>• {tip}</li>
                    ))}
                  </ul>
                </div>

                {/* Action Steps */}
                <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#E6E4DC] space-y-2">
                  <span className="font-bold text-[#0369A1] block flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#0369A1]" />
                    <span>{t('aiActionStepsTitle')}</span>
                  </span>
                  <ul className="space-y-1.5 text-[#4A5568]">
                    {currentPlan.aiRefinement.suggestedActionSteps.map((step, i) => (
                      <li key={i}>• {step}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 border border-[#E6E4DC] shadow-xl text-center">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#143626]">
              {language === 'en' ? 'Delete this business plan?' : 'ఈ ప్రణాళికను తొలగించాలా?'}
            </h3>
            <p className="text-xs text-[#52796F]">
              {language === 'en'
                ? 'This action cannot be undone. All custom notes and checklist records will be permanently removed.'
                : 'ఈ చర్యను వెనక్కి తీసుకోలేరు. అన్ని వివరాలు తొలగించబడతాయి.'}
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#D5D2C7] bg-[#FAF9F5] text-xs font-semibold hover:bg-[#F0EEE6] cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleDeleteCurrentPlan}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 cursor-pointer"
              >
                {deleting ? t('loading') : t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
