/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { api } from '../services/api.js';
import { Opportunity } from '../types/index.js';
import { WorkflowStepper } from '../components/common/WorkflowStepper.js';
import { 
  Search, 
  Bookmark, 
  BookmarkCheck, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  ExternalLink, 
  ArrowRight, 
  Calculator, 
  FileText, 
  X,
  MapPin,
  ShieldCheck,
  Cpu,
  UserCheck,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface OpportunityExplorerPageProps {
  onNavigate: (tab: string, param?: string) => void;
  initialFilterCategory?: string;
}

export const OpportunityExplorerPage: React.FC<OpportunityExplorerPageProps> = ({ 
  onNavigate,
  initialFilterCategory 
}) => {
  const { user, profile } = useAuth();
  const { t, language } = useLanguage();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>(initialFilterCategory || 'all');
  const [selectedBudget, setSelectedBudget] = useState<string>('any');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [modalTruthTab, setModalTruthTab] = useState<'all' | 'facts' | 'assumptions' | 'missing'>('all');
  const [loading, setLoading] = useState(true);

  // Fetch opportunities and saved status
  const loadOpportunities = async () => {
    setLoading(true);
    try {
      let maxBudgetNum: number | undefined;
      if (selectedBudget === '50k') maxBudgetNum = 50000;
      if (selectedBudget === '200k') maxBudgetNum = 200000;
      if (selectedBudget === '500k') maxBudgetNum = 500000;

      const res = await api.getOpportunities({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        maxBudget: maxBudgetNum,
        search: searchQuery.trim() || undefined
      });

      setOpportunities(res.opportunities);

      if (user) {
        const savedRes = await api.getSavedOpportunities().catch(() => ({ savedOpportunities: [] }));
        const idSet = new Set<string>(savedRes.savedOpportunities.map((s: any) => s.opportunity.id));
        setSavedIds(idSet);
      }
    } catch (err) {
      console.error('Failed to load opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOpportunities();
  }, [selectedCategory, selectedBudget]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadOpportunities();
  };

  const toggleSave = async (oppId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      onNavigate('auth');
      return;
    }

    try {
      if (savedIds.has(oppId)) {
        await api.removeSavedOpportunity(oppId);
        setSavedIds(prev => {
          const next = new Set(prev);
          next.delete(oppId);
          return next;
        });
      } else {
        await api.saveOpportunity(oppId);
        setSavedIds(prev => new Set(prev).add(oppId));
      }
    } catch (err) {
      console.error('Error toggling save opportunity:', err);
    }
  };

  const categoriesList = [
    { id: 'all', labelEn: 'All Sectors', labelTe: 'అన్ని రంగాలు' },
    { id: 'food_processing', labelEn: 'Food & Spice Processing', labelTe: 'ఆహార & మసాలా ప్రాసెసింగ్' },
    { id: 'dairy_livestock', labelEn: 'Dairy & Livestock', labelTe: 'పాడి & పశుపోషణ' },
    { id: 'handloom_crafts', labelEn: 'Warangal GI Dhurries', labelTe: 'వరంగల్ GI దర్రీలు' },
    { id: 'digital_services', labelEn: 'Digital Services', labelTe: 'డిజిటల్ సేవలు' },
    { id: 'repair_maintenance', labelEn: 'Rural Repair', labelTe: 'రిపేర్ వర్క్‌షాప్' },
    { id: 'agri_allied', labelEn: 'Agri Allied', labelTe: 'వ్యవసాయ అనుబంధ' },
  ];

  // Helper to generate dynamic dual-sided suitability analysis based on user profile
  const getSuitabilityDetails = (opp: Opportunity) => {
    const userBudget = profile?.startingBudget || 100000;
    const has3Phase = profile?.resources?.hasThreePhasePower ?? false;
    const userMandal = profile?.mandal || 'Warangal District';

    const whySuits: string[] = [];
    const whyNotSuits: string[] = [];

    // Capital fit
    if (userBudget >= opp.minCapitalINR + opp.suggestedWorkingCapitalINR) {
      whySuits.push(
        language === 'en'
          ? `Your starting budget of ₹${userBudget.toLocaleString('en-IN')} comfortably covers the equipment capex (₹${opp.minCapitalINR.toLocaleString('en-IN')}) plus working capital reserve (₹${opp.suggestedWorkingCapitalINR.toLocaleString('en-IN')}).`
          : `మీ వద్ద ఉన్న ₹${userBudget.toLocaleString('en-IN')} పెట్టుబడి యంత్రాలు మరియు ప్రారంభ వర్కింగ్ క్యాపిటల్‌కు సరిపోతుంది.`
      );
    } else if (userBudget >= opp.minCapitalINR) {
      whyNotSuits.push(
        language === 'en'
          ? `Budget Alert: While ₹${userBudget.toLocaleString('en-IN')} covers basic machinery, your working capital cushion will be limited. You will need credit assistance (PMEGP/Mudra) to maintain 2 months of operational inventory.`
          : `బడ్జెట్ హెచ్చరిక: మీ పెట్టుబడి యంత్రాలకే సరిపోతుంది; ముడి సరుకు నిల్వల కోసం ప్రభుత్వ రుణం (ముద్రా/PMEGP) తీసుకోవాల్సి ఉంటుంది.`
      );
    } else {
      whyNotSuits.push(
        language === 'en'
          ? `Capital Shortfall: Minimum setup requires ₹${opp.minCapitalINR.toLocaleString('en-IN')}. A government subsidy scheme (such as PMFME 35% or PMEGP) is necessary before committing funds.`
          : `పెట్టుబడి కొరత: కనీస ఖర్చు ₹${opp.minCapitalINR.toLocaleString('en-IN')} అవుతుంది. ప్రభుత్వ పథకాల ద్వారా సబ్సిడీ పొందిన తర్వాతే ప్రారంభించాలి.`
      );
    }

    // Power & Infrastructure Fit
    if (opp.category === 'food_processing' || opp.category === 'repair_maintenance') {
      if (has3Phase) {
        whySuits.push(
          language === 'en'
            ? 'Your shed/workspace has 3-phase power available, which is required for commercial heavy-duty motors without tripping.'
            : 'మీ వద్ద 3-ఫేజ్ విద్యుత్ కనెక్షన్ ఉన్నందున హెవీ మోటార్లు నడపడానికి ఎలాంటి ఆటంకం ఉండదు.'
        );
      } else {
        whyNotSuits.push(
          language === 'en'
            ? 'Infrastructure Requirement: Commercial pulverizers/compressors require a 3-Phase power connection. If you only have single-phase domestic power, budget ₹15,000-₹25,000 for a TSSPDCL commercial connection upgrade.'
          : 'విద్యుత్ పరిమితి: ఈ పరిశ్రమకు 3-ఫేజ్ కరెంట్ తప్పనిసరి. సాధారణ గృహ విద్యుత్‌పై నడపలేరు.'
        );
      }
    }

    // Mandal Locality Fit
    whySuits.push(
      language === 'en'
        ? `Pilot Proximity: In ${userMandal}, access to Warangal wholesale trade routes enables direct distribution without intermediaries.`
        : `${userMandal} మండల పరిధిలో రవాణా సౌకర్యాలు మరియు స్థానిక మార్కెట్లు అందుబాటులో ఉన్నాయి.`
    );

    // Seasonal & credit constraints
    whyNotSuits.push(
      language === 'en'
        ? 'Rural Credit Constraint: Village retailers often demand 15-30 days credit (udhari). You must not expend all cash on machinery without retaining rolling liquidity.'
        : 'గ్రామీణ ఉధారి పరిమితి: స్థానిక దుకాణదారులు సరుకు అమ్మిన తర్వాతే డబ్బులిస్తారు. చేతిలో రన్నింగ్ క్యాష్ తప్పనిసరిగా ఉండాలి.'
    );

    return { whySuits, whyNotSuits };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Integrated Workflow Stepper */}
      <WorkflowStepper 
        currentStep={1} 
        onStepClick={(step) => {
          if (step === 2) onNavigate('calculator');
          if (step === 3) onNavigate('plan');
        }}
      />

      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF7EE] text-[#1B4332] text-xs font-bold border border-[#C7E9CE]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2D6A4F]" />
          <span>{language === 'en' ? 'Evidence-to-Decision Engine' : 'సాక్ష్యాధారాల ఆధారిత నిర్ణయ ఇంజిన్'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#143626]">
          {t('exploreTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-[#52796F] max-w-3xl leading-relaxed">
          {t('exploreSubtitle')}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E6E4DC] shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#718096] absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D5D2C7] bg-[#FAF9F5] text-sm focus:outline-none focus:border-[#1B4332]"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#1B4332] text-white text-xs font-bold hover:bg-[#143626] cursor-pointer"
          >
            {language === 'en' ? 'Search' : 'వెతకండి'}
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#F0EEE6]">
          {/* Sector Buttons */}
          <div className="flex flex-wrap gap-1.5">
            {categoriesList.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-[#1B4332] text-white shadow-xs'
                    : 'bg-[#FAF9F5] text-[#52796F] border border-[#E6E4DC] hover:bg-[#F0EEE6]'
                }`}
              >
                {language === 'en' ? cat.labelEn : cat.labelTe}
              </button>
            ))}
          </div>

          {/* Budget Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#718096] whitespace-nowrap">{t('filterBudget')}:</span>
            <select
              value={selectedBudget}
              onChange={e => setSelectedBudget(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#D5D2C7] bg-[#FAF9F5] text-xs font-medium focus:outline-none focus:border-[#1B4332] cursor-pointer"
            >
              <option value="any">{t('budgetAny')}</option>
              <option value="50k">{t('budgetUnder50k')}</option>
              <option value="200k">{t('budget50kTo200k')}</option>
              <option value="500k">{t('budget200kTo500k')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Opportunities Grid */}
      {loading ? (
        <div className="text-center py-16 text-[#52796F] text-sm animate-pulse">
          {t('loading')}
        </div>
      ) : opportunities.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-[#E6E4DC] text-center space-y-3">
          <p className="text-sm text-[#52796F]">
            {language === 'en' ? 'No opportunities match your filter criteria.' : 'ఎంచుకున్న ఫిల్టర్‌కు సరిపోయే వ్యాపారాలు లేవు.'}
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedBudget('any');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-[#FAF9F5] border border-[#D5D2C7] text-xs font-semibold text-[#143626] hover:bg-[#F0EEE6] cursor-pointer"
          >
            {language === 'en' ? 'Reset Filters' : 'ఫిల్టర్లు రీసెట్ చేయండి'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map(opp => {
            const isSaved = savedIds.has(opp.id);
            return (
              <div
                key={opp.id}
                onClick={() => setSelectedOpportunity(opp)}
                className="bg-white rounded-2xl border border-[#E6E4DC] overflow-hidden shadow-xs hover:shadow-md transition-shadow cursor-pointer flex flex-col group"
              >
                {/* Photo & Attribution */}
                <div className="relative h-48 w-full overflow-hidden bg-[#FAF9F5]">
                  <img
                    src={opp.imageUrl}
                    alt={opp.imageAlt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Category Pill */}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-xs text-[10px] font-bold text-[#143626] uppercase tracking-wider shadow-xs">
                    {language === 'en' ? opp.sectorEn : opp.sectorTe}
                  </span>

                  {/* Bookmark Button */}
                  <button
                    onClick={(e) => toggleSave(opp.id, e)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-xs hover:bg-white text-[#143626] shadow-xs cursor-pointer transition-transform active:scale-95"
                    title={isSaved ? t('savedOpportunity') : t('saveOpportunity')}
                  >
                    {isSaved ? (
                      <BookmarkCheck className="w-4 h-4 text-[#2D6A4F] fill-current" />
                    ) : (
                      <Bookmark className="w-4 h-4 text-[#52796F]" />
                    )}
                  </button>

                  {/* Sourced Badge */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[10px] text-white/90 font-medium">
                    <span className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-sm backdrop-blur-xs">
                      <ShieldCheck className="w-3 h-3 text-[#52B788]" />
                      <span>{language === 'en' ? 'Grounded in Warangal Evidence' : 'వరంగల్ వాస్తవ గణాంకాలు'}</span>
                    </span>
                    <span className="text-white/70 text-[9px]">
                      {opp.sources.length} {language === 'en' ? 'sources' : 'ఆధారాలు'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-base text-[#143626] group-hover:text-[#2D6A4F] transition-colors line-clamp-1">
                      {language === 'en' ? opp.titleEn : opp.titleTe}
                    </h3>
                    <p className="text-xs text-[#52796F] line-clamp-2 leading-relaxed">
                      {language === 'en' ? opp.summaryEn : opp.summaryTe}
                    </p>
                  </div>

                  {/* Financial Quick Specs */}
                  <div className="pt-3 border-t border-[#F0EEE6] grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-[#718096] uppercase tracking-wider block">
                        {t('capitalRequired')}
                      </span>
                      <span className="font-extrabold text-sm text-[#143626]">
                        ₹{opp.minCapitalINR.toLocaleString('en-IN')} - ₹{opp.maxCapitalINR.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#718096] uppercase tracking-wider block">
                        {language === 'en' ? 'Working Reserve' : 'వర్కింగ్ క్యాపిటల్'}
                      </span>
                      <span className="font-bold text-xs text-[#2D6A4F]">
                        ₹{opp.suggestedWorkingCapitalINR.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Missing Evidence Warning Indicator */}
                  {opp.missingEvidenceChecklist && opp.missingEvidenceChecklist.length > 0 && (
                    <div className="bg-[#FAF9F5] p-2.5 rounded-xl border border-[#E6E4DC] flex items-center justify-between text-[11px] text-[#52796F]">
                      <span className="flex items-center gap-1.5 font-medium">
                        <AlertCircle className="w-3.5 h-3.5 text-[#C45A30]" />
                        <span>{opp.missingEvidenceChecklist.length} {language === 'en' ? 'ground checks to verify' : 'క్షేత్రస్థాయి తనిఖీలు'}</span>
                      </span>
                      <span className="text-[#2D6A4F] font-bold text-[10px]">
                        {language === 'en' ? 'Details →' : 'వివరాలు →'}
                      </span>
                    </div>
                  )}

                  {/* Action CTA */}
                  <div className="pt-2 flex items-center justify-between text-xs font-bold text-[#1B4332] group-hover:text-[#2D6A4F]">
                    <span>{t('viewDetails')}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Deep-Dive Evidence-to-Decision Assessment Modal */}
      {selectedOpportunity && (() => {
        const suitability = getSuitabilityDetails(selectedOpportunity);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto border border-[#E6E4DC] shadow-xl my-4">
              
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-[#F0EEE6] pb-4 gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EBF7EE] text-[#1B4332] text-[10px] font-bold uppercase tracking-wider">
                    <ShieldCheck className="w-3 h-3 text-[#2D6A4F]" />
                    <span>{t('evidenceModalTitle')}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#143626]">
                    {language === 'en' ? selectedOpportunity.titleEn : selectedOpportunity.titleTe}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#52796F] leading-relaxed">
                    {language === 'en' ? selectedOpportunity.summaryEn : selectedOpportunity.summaryTe}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOpportunity(null)}
                  className="p-2 rounded-full hover:bg-[#F0EEE6] text-[#718096] shrink-0 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 4 Truth Layers Visual Legend */}
              <div className="bg-[#FAF9F5] p-3 rounded-2xl border border-[#E6E4DC] space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#718096] block">
                  {language === 'en' ? 'Evidence Transparency Framework' : 'సాక్ష్యాధారాల పారదర్శకత స్థాయిలు'}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                  <div className="bg-white p-2 rounded-xl border border-[#C7E9CE] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#2D6A4F]"></span>
                    <span className="font-bold text-[#143626]">{t('truthFactBadge')}</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-[#BAE6FD] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#0284C7]"></span>
                    <span className="font-bold text-[#0369A1]">{t('truthUserBadge')}</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-[#FED7AA] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#EA580C]"></span>
                    <span className="font-bold text-[#C2410C]">{t('truthEstimateBadge')}</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-[#E9D5FF] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#9333EA]"></span>
                    <span className="font-bold text-[#7E22CE]">{t('truthAdvisoryBadge')}</span>
                  </div>
                </div>
              </div>

              {/* Truth Layer Filter Tabs */}
              <div className="flex flex-wrap gap-1.5 border-b border-[#F0EEE6] pb-2 text-xs">
                <button
                  onClick={() => setModalTruthTab('all')}
                  className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
                    modalTruthTab === 'all'
                      ? 'bg-[#143626] text-white'
                      : 'bg-[#FAF9F5] text-[#52796F] hover:bg-[#F0EEE6]'
                  }`}
                >
                  {language === 'en' ? 'All Sections' : 'అన్ని విభాగాలు'}
                </button>
                <button
                  onClick={() => setModalTruthTab('facts')}
                  className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
                    modalTruthTab === 'facts'
                      ? 'bg-[#2D6A4F] text-white'
                      : 'bg-[#FAF9F5] text-[#52796F] hover:bg-[#F0EEE6]'
                  }`}
                >
                  {t('truthFactBadge')}
                </button>
                <button
                  onClick={() => setModalTruthTab('assumptions')}
                  className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
                    modalTruthTab === 'assumptions'
                      ? 'bg-[#C2410C] text-white'
                      : 'bg-[#FAF9F5] text-[#52796F] hover:bg-[#F0EEE6]'
                  }`}
                >
                  {t('truthEstimateBadge')}
                </button>
                <button
                  onClick={() => setModalTruthTab('missing')}
                  className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
                    modalTruthTab === 'missing'
                      ? 'bg-[#B91C1C] text-white'
                      : 'bg-[#FAF9F5] text-[#52796F] hover:bg-[#F0EEE6]'
                  }`}
                >
                  {language === 'en' ? 'Missing Evidence (Verify Locally)' : 'క్షేత్రస్థాయి తనిఖీలు'}
                </button>
              </div>

              {/* SECTION: Dual-Sided Suitability Evaluation */}
              {(modalTruthTab === 'all' || modalTruthTab === 'facts') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Why it suits */}
                  <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] space-y-2">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#166534] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                      <span>{t('whySuitsTitle')}</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-[#14532D]">
                      {suitability.whySuits.map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="font-bold text-[#16A34A]">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Why it might NOT suit */}
                  <div className="p-4 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] space-y-2">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#92400E] flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-[#D97706]" />
                      <span>{t('whyNotSuitsTitle')}</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-[#78350F]">
                      {suitability.whyNotSuits.map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="font-bold text-[#D97706]">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* SECTION: Missing Evidence Checklist (Verify locally before spending money!) */}
              {(modalTruthTab === 'all' || modalTruthTab === 'missing') && selectedOpportunity.missingEvidenceChecklist && (
                <div className="space-y-3 p-4 rounded-2xl bg-[#FEF2F2] border border-[#FECACA]">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#991B1B] flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-[#DC2626]" />
                        <span>{t('missingEvidenceHeader')}</span>
                      </h4>
                      <p className="text-[11px] text-[#7F1D1D] mt-0.5">
                        {t('missingEvidenceSub')}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-[#DC2626] text-white text-[10px] font-bold">
                      {language === 'en' ? 'Physical Check' : 'క్షేత్ర తనిఖీ'}
                    </span>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    {selectedOpportunity.missingEvidenceChecklist.map((item, i) => (
                      <div key={i} className="bg-white p-3 rounded-xl border border-[#FCA5A5] space-y-1 text-xs">
                        <span className="font-bold text-[#991B1B] block">
                          {i + 1}. {language === 'en' ? item.itemEn : item.itemTe}
                        </span>
                        <div className="text-[11px] text-[#7F1D1D] space-y-0.5">
                          <p>
                            <span className="font-semibold">{t('whyCrucialLabel')}</span> {language === 'en' ? item.whyCrucialEn : item.whyCrucialTe}
                          </p>
                          <p className="text-[#166534] bg-[#F0FDF4] p-1.5 rounded-md border border-[#BBF7D0]">
                            <span className="font-semibold">{t('howToVerifyLabel')}</span> {language === 'en' ? item.howToVerifyLocallyEn : item.howToVerifyLocallyTe}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: Verified Ground Facts */}
              {(modalTruthTab === 'all' || modalTruthTab === 'facts') && selectedOpportunity.verifiedFacts && (
                <div className="space-y-2">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#143626] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#2D6A4F]" />
                    <span>{t('verifiedFactsHeader')}</span>
                  </h4>
                  <div className="space-y-2">
                    {selectedOpportunity.verifiedFacts.map((fact, i) => (
                      <div key={i} className="bg-[#FAF9F5] p-3 rounded-xl border border-[#E6E4DC] text-xs space-y-1">
                        <p className="text-[#143626] font-medium leading-relaxed">
                          {language === 'en' ? fact.factEn : fact.factTe}
                        </p>
                        <div className="flex flex-wrap items-center justify-between text-[10px] text-[#52796F] pt-1 border-t border-[#EAE8DE]">
                          <span>{fact.sourceName} ({fact.geographicCoverage})</span>
                          <a href={fact.sourceUrl} target="_blank" rel="noreferrer" className="text-[#2D6A4F] font-bold underline flex items-center gap-1">
                            <span>{language === 'en' ? 'Official Portal' : 'పోర్టల్ లింక్'}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: Engineering Assumptions & Standard Metrics */}
              {(modalTruthTab === 'all' || modalTruthTab === 'assumptions') && selectedOpportunity.engineeringAssumptions && (
                <div className="space-y-2">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#C2410C] flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-[#EA580C]" />
                    <span>{t('assumptionsHeader')}</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {selectedOpportunity.engineeringAssumptions.map((asm, i) => (
                      <div key={i} className="p-3 rounded-xl bg-white border border-[#FED7AA] space-y-1">
                        <span className="font-bold text-[#7C2D12] block">{asm.parameter}</span>
                        <p className="text-xs font-semibold text-[#143626]">{asm.assumedValue}</p>
                        <p className="text-[10px] text-[#9A3412]">{asm.basis}</p>
                        <span className="inline-block text-[9px] font-mono text-[#52796F] bg-[#FAF9F5] px-1.5 py-0.5 rounded border border-[#E6E4DC]">
                          {asm.formulaOrStandard}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Equipment Breakdown */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#143626] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
                  <span>{t('equipmentNeeded')}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {selectedOpportunity.equipmentChecklist.map((eq, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-white border border-[#E6E4DC] flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-[#143626]">{eq.item}</span>
                        <span className="text-[10px] text-[#718096] block uppercase tracking-wider">
                          {eq.necessity}
                        </span>
                      </div>
                      <span className="font-bold text-[#2D6A4F]">₹{eq.estimatedCostINR.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Primary Traceable Sources */}
              <div className="space-y-2 pt-2 border-t border-[#E6E4DC]">
                <h4 className="font-bold text-[10px] uppercase tracking-wider text-[#718096]">
                  {t('dataSources')}
                </h4>
                <div className="space-y-1 text-[11px] text-[#52796F]">
                  {selectedOpportunity.sources.map((src, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span>{src.name} — Observed: {src.observationDate} ({src.coverage})</span>
                      <a href={src.url} target="_blank" rel="noreferrer" className="text-[#2D6A4F] font-bold underline flex items-center gap-1">
                        <span>Portal</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Primary Connected Workflow CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#E6E4DC]">
                <button
                  onClick={() => {
                    const id = selectedOpportunity.id;
                    setSelectedOpportunity(null);
                    onNavigate('calculator', id);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#143626] text-white text-xs font-bold hover:bg-[#0D261A] cursor-pointer shadow-sm transition-transform active:scale-98"
                >
                  <Calculator className="w-4 h-4 text-[#52B788]" />
                  <span>{t('calculateWithThis')}</span>
                </button>

                <button
                  onClick={() => {
                    const id = selectedOpportunity.id;
                    setSelectedOpportunity(null);
                    onNavigate('plan', id);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border border-[#D5D2C7] bg-[#FAF9F5] text-[#143626] text-xs font-bold hover:bg-[#F0EEE6] cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-[#2D6A4F]" />
                  <span>{t('startPlanWithThis')}</span>
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
};
