/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { api } from '../services/api.js';
import { Opportunity, BusinessPlan, CalculatorSnapshot } from '../types/index.js';
import { 
  Sprout, 
  MapPin, 
  Wallet, 
  Compass, 
  FileText, 
  Calculator, 
  Sparkles, 
  Bookmark, 
  CheckCircle2, 
  ArrowRight, 
  Plus, 
  TrendingUp, 
  ShieldCheck, 
  Trash2, 
  AlertCircle,
  HelpCircle,
  Calendar,
  Clock
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: string, param?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user, profile, deleteAccount } = useAuth();
  const { t, language } = useLanguage();

  const [topOpportunities, setTopOpportunities] = useState<Opportunity[]>([]);
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [plans, setPlans] = useState<BusinessPlan[]>([]);
  const [snapshots, setSnapshots] = useState<CalculatorSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [oppsRes, savedRes, plansRes, snapsRes] = await Promise.all([
          api.getOpportunities(),
          api.getSavedOpportunities().catch(() => ({ savedOpportunities: [] })),
          api.getBusinessPlans().catch(() => ({ plans: [] })),
          api.getCalculatorSnapshots().catch(() => ({ snapshots: [] }))
        ]);

        setTopOpportunities(oppsRes.opportunities.slice(0, 3));
        setSavedItems(savedRes.savedOpportunities || []);
        setPlans(plansRes.plans || []);
        setSnapshots(snapsRes.snapshots || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      onNavigate('landing');
    } catch (err) {
      console.error('Failed to delete account:', err);
      setDeleting(false);
    }
  };

  // Compile real activity log derived strictly from authentic user records
  const realActivities: Array<{ title: string; date: string; icon: any }> = [];
  if (profile?.updatedAt) {
    realActivities.push({
      title: language === 'en' ? 'Entrepreneur profile updated' : 'ప్రొఫైల్ వివరాలు నవీకరించబడ్డాయి',
      date: new Date(profile.updatedAt).toLocaleDateString(),
      icon: MapPin
    });
  }
  for (const p of plans) {
    realActivities.push({
      title: `${language === 'en' ? 'Business plan created:' : 'వ్యాపార ప్రణాళిక:'} ${p.title}`,
      date: new Date(p.updatedAt).toLocaleDateString(),
      icon: FileText
    });
  }
  for (const s of snapshots) {
    realActivities.push({
      title: `${language === 'en' ? 'Feasibility calculation saved:' : 'వ్యయాల లెక్కింపు:'} ${s.name}`,
      date: new Date(s.createdAt).toLocaleDateString(),
      icon: Calculator
    });
  }
  for (const o of savedItems) {
    realActivities.push({
      title: `${language === 'en' ? 'Opportunity bookmarked:' : 'సేవ్ చేసిన వ్యాపారం:'} ${language === 'en' ? o.opportunity.titleEn : o.opportunity.titleTe}`,
      date: new Date(o.record.savedAt).toLocaleDateString(),
      icon: Bookmark
    });
  }

  // Sort activities by date descending
  realActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-[#143626] text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2D6A4F] text-[#95D5B2] text-xs font-semibold">
              <MapPin className="w-3.5 h-3.5 text-[#52B788]" />
              <span>
                {profile?.mandal ? `${profile.mandal} Mandal, Warangal District` : 'Warangal District, Telangana'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {t('dashboardWelcome')} {user?.name || 'Entrepreneur'}
            </h1>
            <p className="text-xs sm:text-sm text-[#D8E2DC] max-w-xl">
              {t('dashboardProfileSubtitle')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('onboarding')}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors border border-white/20 cursor-pointer"
            >
              {profile ? t('editProfile') : (language === 'en' ? 'Complete Profile' : 'ప్రొఫైల్ పూర్తి చేయండి')}
            </button>
            <button
              onClick={() => onNavigate('plan', 'new')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#52B788] hover:bg-[#74C69D] text-[#081C15] text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('createPlanCta')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real Summary Metrics Snapshot */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E6E4DC] shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-[#718096] uppercase tracking-wider">{t('budgetLabel')}</span>
          <p className="text-lg font-extrabold text-[#143626]">
            {profile ? `₹${profile.startingBudget.toLocaleString('en-IN')}` : 'Not Specified'}
          </p>
          <span className="text-[10px] text-[#2D6A4F] font-semibold">
            {profile?.resources?.hasWorkspace 
              ? (language === 'en' ? 'Shed/Room Available' : 'షెడ్డు అందుబాటులో ఉంది')
              : (language === 'en' ? 'Workspace Not Set' : 'స్థలం నమోదు కాలేదు')}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E6E4DC] shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-[#718096] uppercase tracking-wider">{t('locationLabel')}</span>
          <p className="text-lg font-extrabold text-[#143626]">
            {profile?.mandal || 'Warangal'}
          </p>
          <span className="text-[10px] text-[#52796F]">
            {profile?.village || 'Warangal District'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E6E4DC] shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-[#718096] uppercase tracking-wider">
            {language === 'en' ? 'Your Plans' : 'వ్యాపార ప్రణాళికలు'}
          </span>
          <p className="text-lg font-extrabold text-[#143626]">{plans.length}</p>
          <span className="text-[10px] text-[#C45A30] font-semibold">
            {plans.length > 0 ? (language === 'en' ? 'Saved in Account' : 'భద్రపరచబడింది') : (language === 'en' ? 'None Created' : 'ఇంకా రాయలేదు')}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E6E4DC] shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-[#718096] uppercase tracking-wider">
            {language === 'en' ? 'Saved Businesses' : 'సేవ్ చేసిన వ్యాపారాలు'}
          </span>
          <p className="text-lg font-extrabold text-[#143626]">{savedItems.length}</p>
          <span className="text-[10px] text-[#2D6A4F]">
            {savedItems.length > 0 ? (language === 'en' ? 'Bookmarked' : 'జాబితాలో ఉన్నాయి') : (language === 'en' ? 'None Bookmarked' : 'ఏమీ లేవు')}
          </span>
        </div>
      </div>

      {/* Profile Incomplete Callout if profile is not filled */}
      {!profile && (
        <div className="bg-[#FAF9F5] border-2 border-dashed border-[#2D6A4F]/40 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-base text-[#143626]">
              {language === 'en' ? 'Complete your entrepreneur profile for tailored recommendations' : 'సరైన వ్యాపార అవకాశాల కోసం మీ ప్రొఫైల్ వివరాలు పూర్తి చేయండి'}
            </h3>
            <p className="text-xs text-[#52796F]">
              {language === 'en'
                ? 'Specify your mandal, available budget, tools, and background skills.'
                : 'మీ మండలం, పెట్టుబడి మరియు నైపుణ్యాలను నమోదు చేయండి.'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('onboarding')}
            className="px-5 py-2.5 rounded-xl bg-[#1B4332] text-white text-xs font-bold hover:bg-[#143626] cursor-pointer shrink-0"
          >
            {language === 'en' ? 'Start 4-Step Setup' : 'ప్రొఫైల్ నమోదు చేయండి'}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Top Matched Opportunities & Saved Snapshots */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#143626] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#2D6A4F]" />
                <span>{language === 'en' ? 'Matched Business Opportunities' : 'మీకు సరిపోయే వ్యాపారాలు'}</span>
              </h2>
              <p className="text-xs text-[#52796F]">
                {language === 'en'
                  ? 'Grounded in your stated budget, resources, and Warangal district conditions.'
                  : 'మీ పెట్టుబడి మరియు వరంగల్ ముడి సరుకుల ఆధారంగా సూచించబడినవి.'}
              </p>
            </div>
            <button
              onClick={() => onNavigate('explore')}
              className="text-xs font-bold text-[#1B4332] hover:text-[#2D6A4F] flex items-center gap-1 cursor-pointer"
            >
              <span>{language === 'en' ? 'Browse catalog' : 'అన్నీ చూడండి'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {topOpportunities.map(opp => (
              <div
                key={opp.id}
                className="bg-white rounded-2xl border border-[#E6E4DC] p-5 shadow-2xs hover:border-[#2D6A4F] transition-all flex flex-col sm:flex-row gap-5 items-start"
              >
                <div className="w-full sm:w-36 h-28 rounded-xl overflow-hidden bg-[#EAE8E0] shrink-0">
                  <img
                    src={opp.imageUrl}
                    alt={language === 'en' ? opp.titleEn : opp.titleTe}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#2D6A4F] bg-[#E8F5E9] px-2.5 py-0.5 rounded-md">
                      {language === 'en' ? opp.sectorEn : opp.sectorTe}
                    </span>
                    {opp.suitabilityScore && (
                      <span className="text-xs font-extrabold text-[#1B4332] bg-[#D8F3DC] px-2.5 py-0.5 rounded-md">
                        {opp.suitabilityScore}% {language === 'en' ? 'Match' : 'సరిపోలిక'}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-[#143626]">
                    {language === 'en' ? opp.titleEn : opp.titleTe}
                  </h3>

                  <p className="text-xs text-[#4A5568] line-clamp-2">
                    {language === 'en' ? opp.summaryEn : opp.summaryTe}
                  </p>

                  {opp.matchReasonsEn && opp.matchReasonsEn.length > 0 && (
                    <div className="text-[11px] text-[#2D6A4F] font-medium bg-[#FAF9F5] p-2 rounded-lg border border-[#EAE8E0] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" />
                      <span>{language === 'en' ? opp.matchReasonsEn[0] : opp.matchReasonsTe?.[0]}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between pt-2 gap-3 border-t border-[#F0EEE6]">
                    <div className="text-xs">
                      <span className="text-[#718096]">{t('capitalRequired')}: </span>
                      <span className="font-bold text-[#143626]">₹{opp.minCapitalINR.toLocaleString('en-IN')} - ₹{opp.maxCapitalINR.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onNavigate('calculator', opp.id)}
                        className="px-3 py-1.5 rounded-lg border border-[#D5D2C7] bg-[#FAF9F5] text-xs font-semibold text-[#1B4332] hover:bg-[#F0EEE6] cursor-pointer"
                      >
                        {language === 'en' ? 'Calculate' : 'లెక్కింపు'}
                      </button>
                      <button
                        onClick={() => onNavigate('explore', opp.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#1B4332] text-white text-xs font-bold hover:bg-[#143626] cursor-pointer"
                      >
                        {language === 'en' ? 'View Details' : 'వివరాలు'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Saved Calculator Snapshots */}
          {snapshots.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-[#E6E4DC] shadow-2xs space-y-4">
              <h3 className="font-bold text-base text-[#143626] flex items-center gap-2">
                <Calculator className="w-4 h-4 text-[#2D6A4F]" />
                <span>{language === 'en' ? 'Your Saved Feasibility Calculations' : 'మీరు సేవ్ చేసిన వ్యయాల లెక్కింపులు'}</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {snapshots.map(snap => (
                  <div key={snap.id} className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E2DFD2] space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-xs text-[#143626] line-clamp-1">{snap.name}</h4>
                      <button
                        onClick={async () => {
                          await api.deleteCalculatorSnapshot(snap.id);
                          setSnapshots(prev => prev.filter(s => s.id !== snap.id));
                        }}
                        className="text-[#718096] hover:text-red-600 p-1 cursor-pointer"
                        title="Delete calculation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-[11px] text-[#4A5568] space-y-0.5">
                      <p>Total Capital: <strong>₹{snap.results.initialInvestment.toLocaleString('en-IN')}</strong></p>
                      <p>Break-Even: <strong>{snap.results.breakEvenUnits} units/month</strong></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Saved Opportunities (Bookmarks) */}
          <div className="bg-white rounded-3xl p-6 border border-[#E6E4DC] shadow-2xs space-y-4">
            <h3 className="font-bold text-base text-[#143626] flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-[#2D6A4F]" />
              <span>{t('savedOpportunitiesTitle')}</span>
            </h3>

            {savedItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {savedItems.map(item => (
                  <div
                    key={item.record.id}
                    onClick={() => onNavigate('explore', item.opportunity.id)}
                    className="p-3.5 rounded-xl border border-[#E6E4DC] hover:border-[#1B4332] bg-[#FAF9F5] hover:bg-white transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-[#143626]">
                        {language === 'en' ? item.opportunity.titleEn : item.opportunity.titleTe}
                      </h4>
                      <span className="text-[10px] text-[#52796F]">
                        {t('capitalRequired')}: ₹{item.opportunity.minCapitalINR.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#2D6A4F]" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-[#718096] space-y-2">
                <p>{t('noSavedOpportunities')}</p>
                <button
                  onClick={() => onNavigate('explore')}
                  className="px-4 py-2 rounded-xl bg-[#FAF9F5] border border-[#D5D2C7] text-xs font-bold text-[#1B4332] cursor-pointer"
                >
                  {t('navExplore')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Plans & Verified Activity Log */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Active Business Plans Card */}
          <div className="bg-white rounded-3xl border border-[#E6E4DC] p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-[#143626] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#2D6A4F]" />
                <span>{t('activePlansTitle')}</span>
              </h3>
              <button
                onClick={() => onNavigate('plan', 'new')}
                className="text-xs font-bold text-[#2D6A4F] hover:underline cursor-pointer"
              >
                + {language === 'en' ? 'New Plan' : 'కొత్తది'}
              </button>
            </div>

            {plans.length > 0 ? (
              <div className="space-y-3">
                {plans.map(plan => (
                  <div
                    key={plan.id}
                    onClick={() => onNavigate('plan', plan.id)}
                    className="p-3.5 rounded-xl border border-[#E6E4DC] hover:border-[#1B4332] bg-[#FAF9F5] hover:bg-white transition-all cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#2D6A4F] bg-[#D8F3DC] px-2 py-0.5 rounded">
                        {plan.status.toUpperCase()}
                      </span>
                      <span className="text-[11px] text-[#718096]">
                        {new Date(plan.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#143626] line-clamp-1">
                      {plan.title}
                    </h4>
                    <p className="text-[11px] text-[#52796F] line-clamp-1">
                      {plan.concept?.summary || 'Plan draft'}
                    </p>
                    <div className="text-[11px] font-semibold text-[#2D6A4F] pt-1 flex items-center gap-1">
                      <span>{t('continuePlan')}</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-[#718096] space-y-3">
                <p>{language === 'en' ? 'No saved business plans yet.' : 'మీరు ఇంకా వ్యాపార ప్రణాళికను రూపొందించలేదు.'}</p>
                <button
                  onClick={() => onNavigate('plan', 'new')}
                  className="px-4 py-2 rounded-xl bg-[#1B4332] text-white text-xs font-bold hover:bg-[#143626] cursor-pointer"
                >
                  {t('createPlanCta')}
                </button>
              </div>
            )}
          </div>

          {/* Genuine Activity Log (Derived strictly from real records) */}
          <div className="bg-white rounded-3xl border border-[#E6E4DC] p-6 shadow-2xs space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#718096] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#2D6A4F]" />
              <span>{language === 'en' ? 'Your Activity Log' : 'మీ కార్యాచరణ రికార్డు'}</span>
            </h3>

            {realActivities.length > 0 ? (
              <div className="space-y-2.5">
                {realActivities.slice(0, 5).map((act, i) => {
                  const Icon = act.icon;
                  return (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <Icon className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-[#2D3748] line-clamp-1">{act.title}</p>
                        <span className="text-[10px] text-[#718096]">{act.date}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-[#718096]">
                {language === 'en' ? 'No activity recorded yet.' : 'ఇంకా ఎలాంటి కార్యాచరణ నమోదు కాలేదు.'}
              </p>
            )}
          </div>

          {/* Account Privacy & Deletion Card */}
          <div className="bg-[#FAF9F5] rounded-3xl border border-[#E6E4DC] p-6 space-y-3">
            <h4 className="font-bold text-xs text-[#143626] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#2D6A4F]" />
              <span>{language === 'en' ? 'Account Privacy & Data Control' : 'ఖాతా భద్రత & నియంత్రణ'}</span>
            </h4>
            <p className="text-xs text-[#52796F] leading-relaxed">
              {language === 'en'
                ? 'Your business ideas, financial figures, and plans are stored in an account-isolated database. You can permanently delete your account and all associated records at any time.'
                : 'మీ వ్యాపార ఆలోచనలు మరియు ప్రణాళికలు పూర్తిగా గోప్యంగా ఉంటాయి.'}
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="text-xs font-bold text-red-700 hover:text-red-900 flex items-center gap-1 pt-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Delete Account & Purge Data' : 'ఖాతా మరియు వివరాలను తొలగించండి'}</span>
            </button>
          </div>

        </div>

      </div>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#E6E4DC] shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-[#143626]">
              {language === 'en' ? 'Permanently Delete Account?' : 'ఖాతాను శాశ్వతంగా తొలగించాలా?'}
            </h3>
            <p className="text-xs text-[#4A5568] leading-relaxed">
              {language === 'en'
                ? 'This action cannot be undone. All your profile information, created business plans, saved opportunities, and financial calculator snapshots will be permanently removed from the server database.'
                : 'ఈ చర్యను రద్దు చేయలేరు. మీ ప్రొఫైల్, వ్యాపార ప్రణాళికలు మరియు డేటా మొత్తం శాశ్వతంగా తొలగించబడతాయి.'}
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl border border-[#D5D2C7] bg-[#FAF9F5] text-xs font-semibold text-[#2D3748] cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-red-700 text-white text-xs font-bold hover:bg-red-800 transition-colors cursor-pointer"
              >
                {deleting ? t('loading') : (language === 'en' ? 'Yes, Purge My Account' : 'అవును, తొలగించు')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
