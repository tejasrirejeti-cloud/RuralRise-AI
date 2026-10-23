/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext.js';
import { api } from '../services/api.js';
import { GovernmentScheme } from '../types/index.js';
import { 
  Award, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  MapPin, 
  FileText, 
  Building2, 
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const SchemesPage: React.FC = () => {
  const { t, language } = useLanguage();

  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>('scheme-pmegp');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadSchemes() {
      try {
        const res = await api.getSchemes();
        setSchemes(res.schemes);
      } catch (err) {
        console.error('Failed to load schemes:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSchemes();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5E9] text-[#1B4332] text-xs font-semibold">
          <Award className="w-3.5 h-3.5 text-[#2D6A4F]" />
          <span>{language === 'en' ? 'Central & Telangana State Schemes' : 'కేంద్ర & తెలంగాణ ప్రభుత్వ పథకాలు'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#143626]">
          {t('schemesTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-[#52796F] max-w-3xl">
          {t('schemesSubtitle')}
        </p>
      </div>

      {/* Caution Banner */}
      <div className="bg-[#FFF3E0] border border-[#FFE0B2] rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-[#C45A30] shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-xs text-[#9C3814]">
          <span className="font-bold block">{language === 'en' ? 'Important Consumer Caution' : 'ముఖ్య గమనిక'}</span>
          <p className="leading-relaxed">{t('schemeCaution')}</p>
        </div>
      </div>

      {/* Schemes Accordion Cards */}
      <div className="space-y-4">
        {schemes.map(scheme => {
          const isExpanded = expandedId === scheme.id;
          return (
            <div
              key={scheme.id}
              className="bg-white rounded-3xl border border-[#E6E4DC] overflow-hidden shadow-xs hover:border-[#2D6A4F] transition-all"
            >
              {/* Card Header (Clickable) */}
              <div
                onClick={() => toggleExpand(scheme.id)}
                className="p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-[#FAF9F5] transition-colors"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2D6A4F] bg-[#E8F5E9] px-2 py-0.5 rounded">
                      {scheme.category.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-xs text-[#718096]">
                      {scheme.department.split('/')[0].trim()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#143626]">
                    {scheme.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#2D6A4F]">
                    {language === 'en' ? scheme.subsidyOrAssistanceEn : scheme.subsidyOrAssistanceTe}
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right hidden sm:block">
                    <span className="text-[11px] text-[#718096] block uppercase tracking-wider">{t('maxProjectCost')}</span>
                    <span className="text-sm font-extrabold text-[#143626]">
                      ₹{(scheme.maxProjectCostINR / 100000).toFixed(0)} Lakhs
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#FAF9F5] border border-[#D5D2C7] flex items-center justify-center text-[#143626]">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-6 sm:px-8 pb-8 pt-2 border-t border-[#F0EEE6] space-y-6">
                  
                  {/* Target Beneficiaries */}
                  <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#E2DFD2] space-y-1">
                    <span className="text-xs font-bold text-[#143626] block">
                      {t('eligibilityHeader')}
                    </span>
                    <p className="text-xs text-[#4A5568] leading-relaxed">
                      {language === 'en' ? scheme.targetBeneficiariesEn : scheme.targetBeneficiariesTe}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Eligibility Criteria */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#143626]">
                        {language === 'en' ? 'Eligibility Checklist' : 'అర్హత నిబంధనలు'}
                      </h4>
                      <ul className="space-y-1.5 text-xs text-[#4A5568]">
                        {(language === 'en' ? scheme.eligibilityCriteriaEn : scheme.eligibilityCriteriaTe).map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Step-by-Step Procedure */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#143626]">
                        {t('procedureHeader')}
                      </h4>
                      <ul className="space-y-1.5 text-xs text-[#4A5568]">
                        {(language === 'en' ? scheme.applicationProcedureEn : scheme.applicationProcedureTe).map((step, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-4 h-4 rounded-full bg-[#1B4332] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Documents & Local Office */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-[#F0EEE6]">
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#143626] flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#2D6A4F]" />
                        <span>{t('documentsHeader')}</span>
                      </h4>
                      <div className="grid grid-cols-1 gap-1 text-xs text-[#4A5568]">
                        {scheme.requiredDocuments.map((doc, i) => (
                          <p key={i} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F]" />
                            <span>{doc}</span>
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="p-4 rounded-2xl bg-[#E8F5E9] border border-[#C8E6C9] space-y-1">
                        <span className="text-xs font-bold text-[#1B4332] flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-[#2D6A4F]" />
                          <span>{t('localOfficeHeader')}</span>
                        </span>
                        <p className="text-xs text-[#2D6A4F] font-medium leading-relaxed">
                          {scheme.localWarangalOffice}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-[#718096]">
                          {t('lastVerified')}: {scheme.lastVerifiedDate}
                        </span>
                        <a
                          href={scheme.portalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1B4332] text-white text-xs font-bold hover:bg-[#143626] transition-colors shadow-2xs"
                        >
                          <span>{t('officialPortalLink')}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
