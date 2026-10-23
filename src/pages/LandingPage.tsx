/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useLanguage } from '../context/LanguageContext.js';
import { useAuth } from '../context/AuthContext.js';
import { 
  Sprout, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Compass, 
  Calculator, 
  FileText, 
  BarChart2, 
  MapPin,
  ExternalLink
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (tab: string, filterCategory?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const handleStart = () => {
    if (user) {
      onNavigate('dashboard');
    } else {
      onNavigate('auth');
    }
  };

  const sectors = [
    {
      id: 'food_processing',
      titleEn: 'Food & Spice Processing',
      titleTe: 'ఆహార & మసాలా ప్రాసెసింగ్',
      subEn: 'ODOP Warangal Chilli & Turmeric milling, packaging and cold-press oil expellers',
      subTe: 'వరంగల్ ఎండుమిర్చి, పసుపు ప్రాసెసింగ్ మరియు కట్టె గానుగ నూనె తయారీ',
      img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
      badge: 'Warangal ODOP'
    },
    {
      id: 'dairy_livestock',
      titleEn: 'Dairy & Desi Poultry',
      titleTe: 'పాడి & నాటుకోళ్ల పెంపకం',
      subEn: 'Natukodi rearing, mini-hatcheries, Vijaya Dairy milk chilling center supplies',
      subTe: 'నాటుకోళ్ల పెంపకం, హేచరీ మరియు విజయ డైరీ సరఫరా యూనిట్లు',
      img: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=600&q=80',
      badge: 'Allied Agriculture'
    },
    {
      id: 'handloom_crafts',
      titleEn: 'Warangal GI Dhurries & Handloom',
      titleTe: 'వరంగల్ GI దర్రీలు & చేనేత',
      subEn: 'GI Tag No. 341 geometric cotton carpets, modern yoga mats and artisan cooperatives',
      subTe: 'భౌగోళిక గుర్తింపు (GI) పొందిన వరంగల్ కాటన్ దర్రీలు & చేనేత వస్త్రాలు',
      img: 'https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=600&q=80',
      badge: 'GI Tag 341'
    },
    {
      id: 'digital_services',
      titleEn: 'Digital & Financial Services',
      titleTe: 'డిజిటల్ & మీసేవ సేవలు',
      subEn: 'MeeSeva applications, AePS Micro-ATM banking, farmer scheme registrations',
      subTe: 'గ్రామీణ మీసేవ, ఆధార్ విత్‌డ్రా (AePS) మరియు డిజిటల్ సిటిజన్ సేవలు',
      img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
      badge: 'Low Initial Capital'
    },
    {
      id: 'repair_maintenance',
      titleEn: 'Two-Wheeler & EV Repair',
      titleTe: 'ద్విచక్ర వాహనాలు & EV రిపేర్',
      subEn: 'Motorcycle maintenance, tyre fitting, electric scooter diagnostics along mandal corridors',
      subTe: 'మోటార్‌సైకిల్ సర్వీస్, న్యూమాటిక్ టూల్స్ మరియు ఎలక్ట్రిక్ స్కూటర్ రిపేర్',
      img: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80',
      badge: 'Essential Service'
    },
    {
      id: 'agri_allied',
      titleEn: 'Farm Mechanization & Hiring',
      titleTe: 'వ్యవసాయ యంత్రాల అద్దె కేంద్రం',
      subEn: 'Custom hiring centers for power weeders, sprayers, and rotavators during peak sowing',
      subTe: 'పవర్ వీడర్లు, స్ప్రేయర్లు మరియు చిన్న ట్రాక్టర్ పరికరాల అద్దె కేంద్రాలు',
      img: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
      badge: 'Seasonal High Yield'
    }
  ];

  return (
    <div className="space-y-16 pb-16">
      
      {/* Pilot Banner */}
      <div className="bg-[#EBF7EE] border-b border-[#C7E9CE] py-2 px-4 text-center">
        <p className="text-xs sm:text-sm font-medium text-[#1B4332] flex items-center justify-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-[#2D6A4F]" />
          <span>{t('pilotTag')}</span>
          <span className="hidden md:inline text-[#52796F]">·</span>
          <span className="hidden md:inline text-xs text-[#2D6A4F]">{t('heroTrustBadge')}</span>
        </p>
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5E9] text-[#1B4332] text-xs font-semibold border border-[#C8E6C9]">
              <Sprout className="w-3.5 h-3.5 text-[#2E7D32]" />
              <span>{language === 'en' ? 'Grounded Rural Intelligence' : 'గ్రామీణ వ్యాపార సమాచారం'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#143626] tracking-tight leading-[1.18]">
              {t('heroTitle')}
            </h1>

            <p className="text-base sm:text-lg text-[#3D5A4C] leading-relaxed max-w-2xl">
              {t('heroSubtitle')}
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('explore')}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#1B4332] text-white font-semibold text-base hover:bg-[#143626] transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                <span>{t('heroCtaPrimary')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('calculator')}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-[#D5D2C7] text-[#1B4332] font-semibold text-base hover:bg-[#F2F0E8] transition-colors shadow-2xs cursor-pointer"
              >
                <Calculator className="w-4 h-4 text-[#2D6A4F]" />
                <span>{t('heroCtaSecondary')}</span>
              </button>

              <button
                onClick={handleStart}
                className="flex items-center justify-center gap-1.5 px-5 py-3.5 rounded-xl bg-[#E8F5E9] text-[#1B4332] text-sm font-semibold hover:bg-[#D8F3DC] transition-colors cursor-pointer border border-[#C8E6C9]"
              >
                <span>{user ? t('navDashboard') : (language === 'en' ? 'Create Account / Sign In' : 'ఖాతా తెరవండి / లాగిన్')}</span>
              </button>
            </div>

            {/* Micro Trust Bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#E6E4DC] text-xs text-[#2D3748]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                <span>{language === 'en' ? 'Traceable market yard sources' : 'అధికారిక మార్కెట్ ఆధారాలు'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                <span>{language === 'en' ? 'PMEGP & PMFME 35% subsidies' : 'PMEGP & PMFME 35% సబ్సిడీలు'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                <span>{language === 'en' ? 'Bilingual: Telugu & English' : 'తెలుగు మరియు ఇంగ్లీష్ మద్దతు'}</span>
              </div>
            </div>
          </div>

          {/* Authentic Photographic Hero Banner */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-[#D5D2C7] aspect-4/3 bg-[#EAE8E0]">
              <img
                src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1000&q=80"
                alt="Rural small business entrepreneur in India handling vibrant agricultural produce"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-5 text-white">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#95D5B2]">
                  {language === 'en' ? 'Warangal ODOP Hub' : 'వరంగల్ ODOP క్లస్టర్'}
                </span>
                <p className="text-base font-bold text-white leading-snug">
                  {language === 'en'
                    ? 'Chilli, Spices & Agro-Processing Opportunities'
                    : 'మిర్చి, పసుపు మరియు వ్యవసాయ ప్రాసెసింగ్ అవకాశాలు'}
                </p>
                <p className="text-xs text-gray-300 mt-0.5">
                  {language === 'en' ? 'Enumamula Terminal Market, Warangal' : 'ఎనుమాముల టెర్మినల్ మార్కెట్, వరంగల్'}
                </p>
              </div>
            </div>

            {/* Float badge */}
            <div className="absolute -bottom-4 -left-4 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-[#D5D2C7] shadow-lg hidden sm:flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#1B4332] text-white flex items-center justify-center font-bold text-sm">
                GI
              </div>
              <div>
                <p className="text-xs font-bold text-[#143626]">
                  {language === 'en' ? 'GI Tag No. 341' : 'భౌగోళిక గుర్తింపు No. 341'}
                </p>
                <p className="text-[11px] text-[#52796F]">
                  {language === 'en' ? 'Warangal Cotton Dhurries' : 'వరంగల్ కాటన్ దర్రీలు'}
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Trust & Transparency Pillars */}
      <section className="bg-white border-y border-[#E6E4DC] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#E8F5E9] text-[#1B4332] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-[#2D6A4F]" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-bold text-base text-[#143626]">{t('trustEvidenceTitle')}</h3>
                <p className="text-sm text-[#4A5568] leading-relaxed">{t('trustEvidenceDesc')}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#FFF3E0] text-[#C45A30] flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-[#C45A30]" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-bold text-base text-[#143626]">{t('trustPrivacyTitle')}</h3>
                <p className="text-sm text-[#4A5568] leading-relaxed">{t('trustPrivacyDesc')}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#E0F2FE] text-[#0369A1] flex items-center justify-center shrink-0">
                <BarChart2 className="w-6 h-6 text-[#0369A1]" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-bold text-base text-[#143626]">{t('trustBilingualTitle')}</h3>
                <p className="text-sm text-[#4A5568] leading-relaxed">{t('trustBilingualDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works (4 Step Practical Journey) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#143626]">
            {t('howItWorksTitle')}
          </h2>
          <p className="text-sm sm:text-base text-[#52796F] mt-2">
            {language === 'en'
              ? 'A practical step-by-step roadmap designed for first-time rural entrepreneurs, farmers, and women self-help groups.'
              : 'గ్రామీణ యువత, మహిళా సంఘాలు మరియు రైతుల కోసం సులభమైన 4-దశల వ్యాపార ప్రణాళిక.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <div className="bg-white rounded-2xl p-6 border border-[#E6E4DC] shadow-xs space-y-3 relative hover:border-[#2D6A4F] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#1B4332] text-white flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="font-bold text-base text-[#143626]">{t('step1Title')}</h3>
            <p className="text-xs sm:text-sm text-[#4A5568] leading-relaxed">{t('step1Desc')}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#E6E4DC] shadow-xs space-y-3 relative hover:border-[#2D6A4F] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#2D6A4F] text-white flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h3 className="font-bold text-base text-[#143626]">{t('step2Title')}</h3>
            <p className="text-xs sm:text-sm text-[#4A5568] leading-relaxed">{t('step2Desc')}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#E6E4DC] shadow-xs space-y-3 relative hover:border-[#2D6A4F] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#C45A30] text-white flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h3 className="font-bold text-base text-[#143626]">{t('step3Title')}</h3>
            <p className="text-xs sm:text-sm text-[#4A5568] leading-relaxed">{t('step3Desc')}</p>
          </div>
        </div>
      </section>

      {/* Sectors Grid with Real Photographs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#143626]">
              {t('categoriesTitle')}
            </h2>
            <p className="text-sm sm:text-base text-[#52796F] mt-1">
              {t('categoriesSubtitle')}
            </p>
          </div>
          <button
            onClick={() => onNavigate('explore')}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#1B4332] hover:text-[#2D6A4F] cursor-pointer"
          >
            <span>{language === 'en' ? 'View all opportunities' : 'అన్ని అవకాశాలను చూడండి'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectors.map(sector => (
            <div
              key={sector.id}
              onClick={() => onNavigate('explore', sector.id)}
              className="group bg-white rounded-2xl overflow-hidden border border-[#E6E4DC] hover:border-[#2D6A4F] hover:shadow-md transition-all cursor-pointer flex flex-col"
            >
              <div className="h-44 overflow-hidden relative bg-[#EAE8E0]">
                <img
                  src={sector.img}
                  alt={language === 'en' ? sector.titleEn : sector.titleTe}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <span className="absolute top-3 left-3 bg-[#143626]/85 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-md">
                  {sector.badge}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-lg text-[#143626] group-hover:text-[#2D6A4F] transition-colors">
                    {language === 'en' ? sector.titleEn : sector.titleTe}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#4A5568] mt-1 leading-relaxed">
                    {language === 'en' ? sector.subEn : sector.subTe}
                  </p>
                </div>
                <div className="flex items-center text-xs font-semibold text-[#2D6A4F] group-hover:translate-x-1 transition-transform">
                  <span>{language === 'en' ? 'Explore verified businesses' : 'వ్యాపార వివరాలు చూడండి'}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Warangal Market Evidence Highlight Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#143626] text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#74C69D] bg-[#2D6A4F] px-3 py-1 rounded-full">
                {language === 'en' ? 'Warangal Market Evidence' : 'వరంగల్ మార్కెట్ అధికారిక సమాచారం'}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                {language === 'en' 
                  ? 'Grounded In Real Warangal District Benchmarks' 
                  : 'వరంగల్ జిల్లా వాస్తవ మార్కెట్ ఆధారాలు'}
              </h3>
              <p className="text-sm sm:text-base text-[#D8E2DC] leading-relaxed max-w-2xl">
                {language === 'en'
                  ? 'Access verified trading data from Enumamula Market Yard (chilli and agro commodities), Udyam MSME density records, and Kothawada GI Dhurry artisan registries.'
                  : 'ఎనుమాముల వ్యవసాయ మార్కెట్ యార్డ్ విక్రయాలు, MSME ఉద్యమ్ రిజిస్ట్రేషన్లు మరియు కోతవాడ చేనేత దర్రీల అధికారిక రికార్డులను పరిశీలించండి.'}
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={() => onNavigate('market')}
                  className="px-5 py-2.5 bg-[#52B788] text-[#081C15] font-bold text-sm rounded-xl hover:bg-[#74C69D] transition-colors cursor-pointer"
                >
                  {t('navMarket')}
                </button>
                <button
                  onClick={() => onNavigate('schemes')}
                  className="px-5 py-2.5 bg-transparent border border-[#52B788]/60 text-white font-semibold text-sm rounded-xl hover:bg-[#2D6A4F] transition-colors cursor-pointer"
                >
                  {t('navSchemes')}
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 bg-[#081C15]/60 rounded-2xl p-6 border border-[#2D6A4F] space-y-4">
              <div className="border-b border-[#2D6A4F] pb-3">
                <p className="text-xs text-[#95D5B2]">
                  {language === 'en' ? 'Enumamula Benchmark Volume' : 'ఎనుమాముల మిర్చి సీజనల్ దిగుబడి'}
                </p>
                <p className="text-xl font-bold text-white">15,000+ Bags/Day (Peak)</p>
                <span className="text-[10px] text-gray-400 block mt-0.5">Source: AGMARKNET Yard Reports</span>
              </div>
              <div className="border-b border-[#2D6A4F] pb-3">
                <p className="text-xs text-[#95D5B2]">
                  {language === 'en' ? 'Warangal Registered MSMEs' : 'వరంగల్ నమోదైన సూక్ష్మ పరిశ్రమలు'}
                </p>
                <p className="text-xl font-bold text-white">28,400+ Units (Official)</p>
                <span className="text-[10px] text-gray-400 block mt-0.5">Source: Ministry of MSME Udyam</span>
              </div>
              <div>
                <p className="text-xs text-[#95D5B2]">
                  {language === 'en' ? 'PMEGP Rural Capital Subsidy' : 'గ్రామీణ PMEGP సబ్సిడీ'}
                </p>
                <p className="text-xl font-bold text-[#52B788]">Up to 35% Credit Subsidy</p>
                <span className="text-[10px] text-gray-400 block mt-0.5">Source: KVIC / DIC Warangal</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action footer banner */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-4">
        <h3 className="text-2xl font-bold text-[#143626]">
          {language === 'en' ? 'Ready to Evaluate Your Rural Enterprise Idea?' : 'మీ వ్యాపార ఆలోచనను ఆచరణలో పెట్టడానికి సిద్ధంగా ఉన్నారా?'}
        </h3>
        <p className="text-sm text-[#4A5568]">
          {language === 'en'
            ? 'No technical jargon. No fees. Plain English and Telugu guidance tailored to Warangal.'
            : 'ఎలాంటి రుసుము లేదు, సులభమైన తెలుగు మరియు ఇంగ్లీష్ మార్గదర్శకత్వం.'}
        </p>
        <button
          onClick={handleStart}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#1B4332] text-white font-bold text-base hover:bg-[#143626] transition-all shadow-md cursor-pointer"
        >
          <span>{user ? t('navDashboard') : (language === 'en' ? 'Start Personalized Planning' : 'వ్యాపార ప్రణాళికను ప్రారంభించండి')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

    </div>
  );
};
