/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { WARANGAL_MANDALS } from '../../server/data/warangalData.js';
import { 
  Sprout, 
  MapPin, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Wallet, 
  Wrench, 
  Home, 
  Zap, 
  Smartphone, 
  Truck, 
  Clock, 
  Target 
} from 'lucide-react';

interface OnboardingPageProps {
  onComplete: () => void;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ onComplete }) => {
  const { profile, updateProfile } = useAuth();
  const { t, language } = useLanguage();

  const [step, setStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);

  // Form states initialized from existing profile or defaults
  const [mandal, setMandal] = useState(profile?.mandal || 'Narsampet');
  const [village, setVillage] = useState(profile?.village || '');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(profile?.skills || ['Food handling basics', 'Machine operation']);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(profile?.businessInterests || ['Food & Spice Processing']);
  const [budget, setBudget] = useState<number>(profile?.startingBudget || 150000);
  const [hasLand, setHasLand] = useState<boolean>(Boolean(profile?.resources?.hasLand));
  const [hasWorkspace, setHasWorkspace] = useState<boolean>(profile?.resources?.hasWorkspace ?? true);
  const [hasVehicle, setHasVehicle] = useState<boolean>(Boolean(profile?.resources?.hasVehicle));
  const [hasThreePhasePower, setHasThreePhasePower] = useState<boolean>(Boolean(profile?.resources?.hasThreePhasePower));
  const [timeAvailable, setTimeAvailable] = useState<'full_time' | 'part_time' | 'seasonal'>(profile?.timeAvailable || 'full_time');
  const [familyWorkers, setFamilyWorkers] = useState<number>(profile?.resources?.familyWorkersCount || 1);

  const availableSkillsList = [
    { id: 'Food handling basics', labelEn: 'Food handling & processing', labelTe: 'ఆహార పదార్థాల ప్రాసెసింగ్' },
    { id: 'Machine operation', labelEn: 'Machinery & equipment operation', labelTe: 'యంత్రాలు నడపడం' },
    { id: 'Basic bookkeeping', labelEn: 'Accounting & daily bookkeeping', labelTe: 'ఖాతా పుస్తకాలు నిర్వహణ' },
    { id: 'Loom operation & warp setting', labelEn: 'Handloom weaving & textiles', labelTe: 'మగ్గం నేత & చేనేత' },
    { id: 'Bird handling & brooding', labelEn: 'Poultry & livestock care', labelTe: 'కోళ్లు & పశువుల సంరక్షణ' },
    { id: 'Computer literacy & basic typing', labelEn: 'Computer & smartphone digital skills', labelTe: 'కంప్యూటర్ & మొబైల్ వినియోగం' },
    { id: 'IC engine troubleshooting', labelEn: 'Motor vehicle & mechanical repair', labelTe: 'మోటార్ బైక్ / మెకానిక్ పని' },
    { id: 'Local retail sales', labelEn: 'Customer interaction & retail sales', labelTe: 'కస్టమర్లతో మాట్లాడటం & విక్రయాలు' }
  ];

  const interestSectorsList = [
    { id: 'Food & Spice Processing', labelEn: 'Food & Spice Processing (Chilli/Oil/Flour)', labelTe: 'ఆహార & మసాలా ప్రాసెసింగ్ (మిర్చి/నూనె)' },
    { id: 'Dairy & Livestock', labelEn: 'Dairy & Desi Poultry Rearing', labelTe: 'పాడి & నాటుకోళ్ల పెంపకం' },
    { id: 'Handloom & Crafts (Warangal GI)', labelEn: 'Warangal Dhurries & Handloom', labelTe: 'వరంగల్ దర్రీలు & చేనేత వస్త్రాలు' },
    { id: 'Digital Services & Financial Inclusion', labelEn: 'MeeSeva & Digital Citizen Kiosk', labelTe: 'మీసేవ & డిజిటల్ సిటిజన్ సెంటర్' },
    { id: 'Rural Repair & Mechanics', labelEn: 'Two-Wheeler & EV Repair Point', labelTe: 'ద్విచక్ర వాహనాలు & EV రిపేర్ వర్క్‌షాప్' },
    { id: 'Agriculture & Allied', labelEn: 'Custom Farm Tool Hiring', labelTe: 'వ్యవసాయ పరికరాల అద్దె కేంద్రం' }
  ];

  const toggleSkill = (skillId: string) => {
    setSelectedSkills(prev => 
      prev.includes(skillId) ? prev.filter(s => s !== skillId) : [...prev, skillId]
    );
  };

  const toggleInterest = (sectorId: string) => {
    setSelectedInterests(prev =>
      prev.includes(sectorId) ? prev.filter(s => s !== sectorId) : [...prev, sectorId]
    );
  };

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      const budgetTier = 
        budget < 50000 ? 'micro_under_50k' :
        budget <= 200000 ? 'small_50k_200k' :
        budget <= 500000 ? 'medium_200k_500k' : 'above_500k';

      await updateProfile({
        state: 'Telangana',
        district: 'Warangal',
        mandal,
        village: village.trim() || undefined,
        preferredLanguage: language,
        skills: selectedSkills,
        businessInterests: selectedInterests,
        startingBudget: budget,
        budgetTier,
        resources: {
          hasLand,
          hasWorkspace,
          hasVehicle,
          hasSmartphone: true,
          hasThreePhasePower,
          familyWorkersCount: familyWorkers
        },
        timeAvailable,
        updatedAt: new Date().toISOString()
      });

      onComplete();
    } catch (err) {
      console.error('Failed to save profile during onboarding:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-10 px-4">
      <div className="bg-white rounded-3xl border border-[#E6E4DC] shadow-lg p-6 sm:p-10 space-y-8">
        
        {/* Progress header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-[#52796F]">
            <span>{language === 'en' ? `Step ${step} of 4` : `దశ ${step} / 4`}</span>
            <span>{Math.round((step / 4) * 100)}% {language === 'en' ? 'Completed' : 'పూర్తయింది'}</span>
          </div>
          <div className="w-full bg-[#EAE8E0] h-2 rounded-full overflow-hidden">
            <div 
              className="bg-[#1B4332] h-full transition-all duration-300 rounded-full"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: Location */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] text-[#1B4332] flex items-center justify-center mb-3">
                <MapPin className="w-5 h-5 text-[#2D6A4F]" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#143626]">
                {language === 'en' ? 'Where will your enterprise operate?' : 'మీ వ్యాపారం ఏ ప్రాంతంలో ఉంటుంది?'}
              </h2>
              <p className="text-xs sm:text-sm text-[#52796F] mt-1">
                {language === 'en'
                  ? 'All recommendations are calibrated for Warangal & Hanamkonda mandals.'
                  : 'వరంగల్ మరియు హనుమకొండ మండలాల మార్కెట్లకు అనుగుణంగా సూచనలు ఉంటాయి.'}
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2D3748]">
                  {language === 'en' ? 'Select Mandal in Warangal District' : 'వరంగల్ జిల్లాలోని మండలాన్ని ఎంచుకోండి'}
                </label>
                <select
                  value={mandal}
                  onChange={e => setMandal(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#D5D2C7] bg-[#FAF9F5] text-sm font-semibold text-[#143626] focus:outline-none focus:border-[#1B4332]"
                >
                  {WARANGAL_MANDALS.map(m => (
                    <option key={m} value={m}>{m} Mandal</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2D3748]">
                  {language === 'en' ? 'Village / Town / Locality (Optional)' : 'గ్రామం లేదా కాలనీ పేరు (ఐచ్ఛికం)'}
                </label>
                <input
                  type="text"
                  value={village}
                  onChange={e => setVillage(e.target.value)}
                  placeholder={language === 'en' ? 'e.g., Maheswaram, Kothawada, Shayampet' : 'ఉదా: మహేశ్వరం, కోతవాడ, శాయంపేట'}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D5D2C7] bg-[#FAF9F5] text-sm focus:outline-none focus:border-[#1B4332]"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Skills & Interests */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] text-[#1B4332] flex items-center justify-center mb-3">
                <Wrench className="w-5 h-5 text-[#2D6A4F]" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#143626]">
                {language === 'en' ? 'What skills or experience do you have?' : 'మీకున్న నైపుణ్యాలు & ఆసక్తులు ఏమిటి?'}
              </h2>
              <p className="text-xs sm:text-sm text-[#52796F] mt-1">
                {language === 'en' ? 'Select all that apply. Practical hands-on skills count!' : 'మీకు తెలిసిన పనులను ఎంచుకోండి.'}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#2D3748]">
                {language === 'en' ? 'Your Existing Skills' : 'మీకున్న నైపుణ్యాలు'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {availableSkillsList.map(item => {
                  const selected = selectedSkills.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleSkill(item.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                        selected
                          ? 'border-[#1B4332] bg-[#E8F5E9] text-[#143626]'
                          : 'border-[#D5D2C7] bg-white text-[#4A5568] hover:border-[#A0AEC0]'
                      }`}
                    >
                      <span>{language === 'en' ? item.labelEn : item.labelTe}</span>
                      {selected && <Check className="w-4 h-4 text-[#1B4332] shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#E6E4DC]">
              <label className="text-xs font-bold text-[#2D3748]">
                {language === 'en' ? 'Sectors You Wish to Explore' : 'మీకు ఆసక్తి ఉన్న రంగాలు'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {interestSectorsList.map(item => {
                  const selected = selectedInterests.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleInterest(item.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                        selected
                          ? 'border-[#C45A30] bg-[#FFF3E0] text-[#9C3814]'
                          : 'border-[#D5D2C7] bg-white text-[#4A5568] hover:border-[#A0AEC0]'
                      }`}
                    >
                      <span>{language === 'en' ? item.labelEn : item.labelTe}</span>
                      {selected && <Check className="w-4 h-4 text-[#C45A30] shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Capital & Physical Assets */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] text-[#1B4332] flex items-center justify-center mb-3">
                <Wallet className="w-5 h-5 text-[#2D6A4F]" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#143626]">
                {language === 'en' ? 'What starting capital & resources are available?' : 'మీ వద్ద అందుబాటులో ఉన్న పెట్టుబడి & వనరులు?'}
              </h2>
              <p className="text-xs sm:text-sm text-[#52796F] mt-1">
                {language === 'en'
                  ? 'We use this strictly to calculate realistic feasibility, not to disqualify you.'
                  : 'వాస్తవిక వ్యయాలు లెక్కించడానికి మాత్రమే ఇది ఉపయోగపడుతుంది.'}
              </p>
            </div>

            <div className="space-y-3 bg-[#FAF9F5] p-5 rounded-2xl border border-[#E2DFD2]">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#2D3748]">
                  {language === 'en' ? 'Starting Own Budget' : 'మీ సొంత పెట్టుబడి'}
                </span>
                <span className="text-lg font-extrabold text-[#1B4332]">
                  ₹{budget.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min={20000}
                max={500000}
                step={10000}
                value={budget}
                onChange={e => setBudget(Number(e.target.value))}
                className="w-full accent-[#1B4332] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#718096]">
                <span>₹20,000 (Micro)</span>
                <span>₹1,50,000 (Small)</span>
                <span>₹5,00,000+ (Medium)</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#2D3748]">
                {language === 'en' ? 'Available Physical Assets (Select all that apply)' : 'మీకున్న భౌతిక వనరులు'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setHasWorkspace(!hasWorkspace)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                    hasWorkspace ? 'border-[#1B4332] bg-[#E8F5E9] text-[#143626]' : 'border-[#D5D2C7] bg-white text-[#4A5568]'
                  }`}
                >
                  <Home className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                  <span>{language === 'en' ? 'Covered shed / Room / Shop' : 'సొంత షెడ్డు / గది / దుకాణం'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setHasLand(!hasLand)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                    hasLand ? 'border-[#1B4332] bg-[#E8F5E9] text-[#143626]' : 'border-[#D5D2C7] bg-white text-[#4A5568]'
                  }`}
                >
                  <Sprout className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                  <span>{language === 'en' ? 'Open land / Yard space' : 'ఖాళీ స్థలం / తోట'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setHasThreePhasePower(!hasThreePhasePower)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                    hasThreePhasePower ? 'border-[#1B4332] bg-[#E8F5E9] text-[#143626]' : 'border-[#D5D2C7] bg-white text-[#4A5568]'
                  }`}
                >
                  <Zap className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                  <span>{language === 'en' ? '3-Phase Electric Connection' : '3-ఫేజ్ కరెంట్ కనెక్షన్'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setHasVehicle(!hasVehicle)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                    hasVehicle ? 'border-[#1B4332] bg-[#E8F5E9] text-[#143626]' : 'border-[#D5D2C7] bg-white text-[#4A5568]'
                  }`}
                >
                  <Truck className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                  <span>{language === 'en' ? 'Two / Three-Wheeler Vehicle' : 'బైక్ / ఆటో లేదా వాహనం'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Time Commitment & Family Support */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] text-[#1B4332] flex items-center justify-center mb-3">
                <Clock className="w-5 h-5 text-[#2D6A4F]" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#143626]">
                {language === 'en' ? 'Time commitment & workforce' : 'సమయం & పనివారు'}
              </h2>
              <p className="text-xs sm:text-sm text-[#52796F] mt-1">
                {language === 'en' ? 'Helps determine whether full-time or seasonal ventures suit you best.' : 'మీ సమయానికి తగిన వ్యాపారాన్ని సూచించడానికి ఇది సహాయపడుతుంది.'}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#2D3748]">
                {language === 'en' ? 'How much time will you dedicate?' : 'మీరు ఎంత సమయం కేటాయించగలరు?'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'full_time', labelEn: 'Full-Time (8+ hrs/day)', labelTe: 'పూర్తి సమయం (రోజంతా)' },
                  { id: 'part_time', labelEn: 'Part-Time (3-4 hrs/day)', labelTe: 'పాక్షిక సమయం (3-4 గంటలు)' },
                  { id: 'seasonal', labelEn: 'Post-Harvest / Seasonal', labelTe: 'సీజనల్ (పంటల తర్వాత)' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTimeAvailable(opt.id as any)}
                    className={`p-3.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                      timeAvailable === opt.id
                        ? 'border-[#1B4332] bg-[#E8F5E9] text-[#143626] shadow-xs'
                        : 'border-[#D5D2C7] bg-white text-[#4A5568]'
                    }`}
                  >
                    {language === 'en' ? opt.labelEn : opt.labelTe}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#E6E4DC]">
              <label className="text-xs font-bold text-[#2D3748]">
                {language === 'en' ? 'Family workers available to assist' : 'సహాయపడే కుటుంబ సభ్యుల సంఖ్య'}
              </label>
              <div className="flex gap-3">
                {[1, 2, 3, 4].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setFamilyWorkers(n)}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                      familyWorkers === n
                        ? 'border-[#1B4332] bg-[#1B4332] text-white'
                        : 'border-[#D5D2C7] bg-white text-[#4A5568]'
                    }`}
                  >
                    {n} {n === 1 ? (language === 'en' ? 'Person' : 'వ్యక్తి') : (language === 'en' ? 'People' : 'వ్యక్తులు')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Wizard Navigation Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-[#E6E4DC]">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#D5D2C7] bg-white text-xs font-semibold text-[#2D3748] hover:bg-[#F0EEE6] cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('back')}</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1B4332] text-white text-xs font-bold hover:bg-[#143626] transition-colors cursor-pointer"
            >
              <span>{t('next')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2D6A4F] text-white text-xs font-bold hover:bg-[#1B4332] transition-colors shadow-sm cursor-pointer"
            >
              <span>{submitting ? t('loading') : t('finish')}</span>
              <Check className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
