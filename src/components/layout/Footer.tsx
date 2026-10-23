/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useLanguage } from '../../context/LanguageContext.js';
import { Sprout, ShieldCheck, MapPin, ExternalLink } from 'lucide-react';

export const Footer: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-[#143626] text-[#D8E2DC] pt-14 pb-12 border-t border-[#1B4332]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#2D6A4F] flex items-center justify-center text-white">
                <Sprout className="w-5 h-5 text-[#95D5B2]" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">RuralRise AI</span>
            </div>
            <p className="text-sm text-[#B7E4C7] leading-relaxed">
              {t('tagline')}
            </p>
            <div className="flex items-start gap-2 text-xs text-[#95D5B2] bg-[#081C15]/50 p-3 rounded-lg border border-[#2D6A4F]/40">
              <MapPin className="w-4 h-4 text-[#52B788] shrink-0 mt-0.5" />
              <span>
                {language === 'en' 
                  ? 'Active Pilot: Warangal & Hanamkonda Districts, Telangana, India.' 
                  : 'పైలట్ ప్రాంతం: వరంగల్ & హనుమకొండ జిల్లాలు, తెలంగాణ, భారతదేశం.'}
              </span>
            </div>
          </div>

          {/* Quick Nav */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 tracking-wider uppercase">
              {language === 'en' ? 'Platform Navigation' : 'ప్లాట్‌ఫామ్ నావిగేషన్'}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => onNavigate('explore')} className="hover:text-white transition-colors cursor-pointer">
                  {t('navExplore')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('calculator')} className="hover:text-white transition-colors cursor-pointer">
                  {t('navCalculator')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('market')} className="hover:text-white transition-colors cursor-pointer">
                  {t('navMarket')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('schemes')} className="hover:text-white transition-colors cursor-pointer">
                  {t('navSchemes')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('plan')} className="hover:text-white transition-colors cursor-pointer">
                  {t('navPlan')}
                </button>
              </li>
            </ul>
          </div>

          {/* Official Ground Data Sources */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 tracking-wider uppercase">
              {language === 'en' ? 'Verified Ground Sources' : 'అధికారిక సమాచార మూలాలు'}
            </h4>
            <ul className="space-y-2 text-xs text-[#B7E4C7]">
              <li className="flex items-center gap-1.5 hover:text-white">
                <ExternalLink className="w-3 h-3 text-[#52B788]" />
                <a href="https://agmarknet.gov.in" target="_blank" rel="noreferrer" className="underline">
                  Enumamula Market Yard (AGMARKNET)
                </a>
              </li>
              <li className="flex items-center gap-1.5 hover:text-white">
                <ExternalLink className="w-3 h-3 text-[#52B788]" />
                <a href="https://pmfme.mofpi.gov.in" target="_blank" rel="noreferrer" className="underline">
                  MoFPI PMFME (ODOP Warangal Chilli)
                </a>
              </li>
              <li className="flex items-center gap-1.5 hover:text-white">
                <ExternalLink className="w-3 h-3 text-[#52B788]" />
                <a href="https://udyamregistration.gov.in" target="_blank" rel="noreferrer" className="underline">
                  Ministry of MSME (Udyam Portal)
                </a>
              </li>
              <li className="flex items-center gap-1.5 hover:text-white">
                <ExternalLink className="w-3 h-3 text-[#52B788]" />
                <a href="https://data.telangana.gov.in" target="_blank" rel="noreferrer" className="underline">
                  Telangana Open Data Portal
                </a>
              </li>
              <li className="flex items-center gap-1.5 hover:text-white">
                <ExternalLink className="w-3 h-3 text-[#52B788]" />
                <a href="https://ipindia.gov.in" target="_blank" rel="noreferrer" className="underline">
                  GI Registry (Warangal Dhurries No. 341)
                </a>
              </li>
            </ul>
          </div>

          {/* Trust & Transparency */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm mb-3 tracking-wider uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#52B788]" />
              <span>{language === 'en' ? 'Evidence Guarantee' : 'విశ్వసనీయత హామీ'}</span>
            </h4>
            <p className="text-xs text-[#B7E4C7] leading-relaxed">
              {language === 'en'
                ? 'RuralRise AI never displays synthetic market claims, fabricated customer reviews, or unverified loan guarantees. Projections reflect transparent user assumptions.'
                : 'రూరల్‌రైజ్ AI ఎలాంటి కృత్రిమ గణాంకాలను లేదా అబద్ధపు రుణ వాగ్దానాలను ప్రదర్శించదు. అన్ని ఫలితాలు అధికారిక మార్కెట్ సమాచారం ఆధారంగానే రూపొందించబడ్డాయి.'}
            </p>
            <div className="pt-2 text-[11px] text-[#74C69D]/80">
              © 2026 RuralRise AI · Built for Indian Rural Micro-Enterprises
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#1B4332] flex flex-col sm:flex-row items-center justify-between text-xs text-[#95D5B2] gap-4">
          <p>
            {language === 'en'
              ? 'Pilot Project for Warangal District, Telangana, India. All government scheme names are trademarks of their respective departments.'
              : 'వరంగల్ జిల్లా పైలట్ ప్రాజెక్ట్, తెలంగాణ. ప్రభుత్వ పథకాల వివరాలు సంబంధిత శాఖల నిబంధనలకు లోబడి ఉంటాయి.'}
          </p>
          <div className="flex gap-4">
            <span className="text-[#52B788]">English · తెలుగు</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
