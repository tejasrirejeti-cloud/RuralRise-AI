/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext.js';
import { api } from '../services/api.js';
import { MarketEvidenceItem } from '../types/index.js';
import { 
  BarChart3, 
  MapPin, 
  ShieldCheck, 
  Calendar, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  Filter,
  FileCheck2,
  Info
} from 'lucide-react';

export const MarketIntelligencePage: React.FC = () => {
  const { t, language } = useLanguage();

  const [datasets, setDatasets] = useState<MarketEvidenceItem[]>([]);
  const [mandals, setMandals] = useState<string[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getMarketIntelligence();
        setDatasets(res.datasets);
        setMandals(res.mandals);
      } catch (err) {
        console.error('Failed to load market data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = selectedFilter === 'all' 
    ? datasets 
    : datasets.filter(d => d.category === selectedFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5E9] text-[#1B4332] text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2D6A4F]" />
          <span>{language === 'en' ? 'Verified Government Data Sources' : 'అధికారిక ప్రభుత్వ సమాచార ఆధారాలు'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#143626]">
          {t('marketTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-[#52796F] max-w-3xl">
          {t('marketSubtitle')}
        </p>
      </div>

      {/* Freshness Status Banner */}
      <div className="bg-[#FAF9F5] border border-[#E2DFD2] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#2D6A4F] animate-pulse" />
          <div>
            <span className="text-xs font-bold text-[#143626]">
              {language === 'en' ? 'Evidence Freshness Guarantee' : 'సమాచార ఖచ్చితత్వ హామీ'}
            </span>
            <p className="text-[11px] text-[#52796F]">
              {language === 'en'
                ? 'Every data point is independently audited against AGMARKNET, Udyam MSME, and Telangana Open Data.'
                : 'ప్రతి గణాంకం ప్రభుత్వ వెబ్‌సైట్ల నుండి పరిశీలించబడింది.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-[#143626] bg-white px-3 py-1.5 rounded-lg border border-[#D5D2C7]">
          <Calendar className="w-3.5 h-3.5 text-[#2D6A4F]" />
          <span>{language === 'en' ? 'Last Verified: March 2026' : 'పరిశీలించిన తేదీ: మార్చి 2026'}</span>
        </div>
      </div>

      {/* Headline Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {datasets.map(item => (
          <div 
            key={item.id} 
            className="bg-white rounded-2xl p-5 border border-[#E6E4DC] shadow-2xs space-y-2 hover:border-[#2D6A4F] transition-all"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#2D6A4F] bg-[#E8F5E9] px-2 py-0.5 rounded">
              {item.sourceName.split('-')[0].trim().slice(0, 24)}
            </span>
            <p className="text-2xl font-black text-[#143626]">{item.headlineMetric}</p>
            <h4 className="font-bold text-xs text-[#2D3748] line-clamp-1">
              {language === 'en' ? item.titleEn : item.titleTe}
            </h4>
            <p className="text-[11px] text-[#52796F] line-clamp-2">
              {language === 'en' ? item.metricDescriptionEn : item.metricDescriptionTe}
            </p>
          </div>
        ))}
      </div>

      {/* Deep-Dive Evidence Register Table */}
      <div className="bg-white rounded-3xl border border-[#E6E4DC] shadow-sm overflow-hidden space-y-4 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0EEE6] pb-4">
          <div>
            <h3 className="font-bold text-lg text-[#143626] flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-[#2D6A4F]" />
              <span>{t('evidenceRegisterTitle')}</span>
            </h3>
            <p className="text-xs text-[#52796F]">
              {t('evidenceProvenanceNotice')}
            </p>
          </div>

          <div className="flex gap-2">
            {['all', 'chilli_spices', 'handloom_crafts', 'msme_density', 'dairy_livestock'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  selectedFilter === cat
                    ? 'bg-[#1B4332] text-white'
                    : 'bg-[#FAF9F5] text-[#4A5568] hover:bg-[#EAE8E0]'
                }`}
              >
                {cat === 'all' ? (language === 'en' ? 'All' : 'అన్నీ') :
                 cat === 'chilli_spices' ? 'Chilli' :
                 cat === 'handloom_crafts' ? 'Handloom' :
                 cat === 'msme_density' ? 'MSME' : 'Dairy'}
              </button>
            ))}
          </div>
        </div>

        {/* Evidence Items Detail List */}
        <div className="space-y-6 pt-2">
          {filtered.map(item => (
            <div 
              key={item.id} 
              className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#E2DFD2] space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="font-bold text-base text-[#143626]">
                  {language === 'en' ? item.titleEn : item.titleTe}
                </h4>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[#718096]">Coverage: <strong>{item.geographicCoverage}</strong></span>
                </div>
              </div>

              {/* Warangal Context */}
              <div className="text-xs sm:text-sm text-[#2D3748] bg-white p-3.5 rounded-xl border border-[#E6E4DC] leading-relaxed">
                <span className="font-bold text-[#143626] block mb-1">
                  {language === 'en' ? 'Warangal Ground Reality:' : 'వరంగల్ క్షేత్రస్థాయి వాస్తవం:'}
                </span>
                {language === 'en' ? item.warangalContextEn : item.warangalContextTe}
              </div>

              {/* Provenance & Limitations Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-3 rounded-xl bg-white border border-[#E6E4DC] space-y-1">
                  <span className="font-semibold text-[#143626] flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-[#2D6A4F]" />
                    <span>{t('sourceColumn')}</span>
                  </span>
                  <p className="text-[11px] text-[#4A5568]">{item.sourceName}</p>
                  <a 
                    href={item.sourceUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-[#2D6A4F] text-[11px] font-bold underline inline-flex items-center gap-1"
                  >
                    <span>{item.sourceUrl}</span>
                  </a>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#E6E4DC] space-y-1">
                  <span className="font-semibold text-[#C45A30] flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-[#C45A30]" />
                    <span>{t('limitationsColumn')}</span>
                  </span>
                  <p className="text-[11px] text-[#4A5568]">
                    {language === 'en' ? item.limitationsEn : item.limitationsTe}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#718096] pt-1">
                <span>Observed Date: {item.observationDate}</span>
                <span>Last Verified in Audit: {item.retrievalDate}</span>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};
