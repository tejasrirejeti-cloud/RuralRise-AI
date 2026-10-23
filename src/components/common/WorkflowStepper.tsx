/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useLanguage } from '../../context/LanguageContext.js';
import { ShieldCheck, Calculator, Rocket, ArrowRight } from 'lucide-react';

interface WorkflowStepperProps {
  currentStep: 1 | 2 | 3;
  onStepClick?: (step: 1 | 2 | 3) => void;
  opportunityName?: string;
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  currentStep,
  onStepClick,
  opportunityName
}) => {
  const { t, language } = useLanguage();

  const steps = [
    {
      num: 1 as const,
      id: 'explore',
      title: t('workflowStep1'),
      desc: t('workflowStep1Desc'),
      icon: ShieldCheck
    },
    {
      num: 2 as const,
      id: 'calculator',
      title: t('workflowStep2'),
      desc: t('workflowStep2Desc'),
      icon: Calculator
    },
    {
      num: 3 as const,
      id: 'plan',
      title: t('workflowStep3'),
      desc: t('workflowStep3Desc'),
      icon: Rocket
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#E6E4DC] p-3.5 sm:p-5 shadow-xs mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 sm:pb-4 border-b border-[#F0EEE6] gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2D6A4F] animate-pulse"></span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#52796F]">
            {t('workflowTitle')}
          </span>
        </div>
        {opportunityName && (
          <div className="text-xs text-[#52796F] flex items-center gap-1.5">
            <span className="text-[#8B9B90]">{language === 'en' ? 'Active Focus:' : 'ప్రస్తుత వ్యాపారం:'}</span>
            <span className="font-semibold text-[#143626] bg-[#FAF9F5] px-2.5 py-1 rounded-md border border-[#E6E4DC]">
              {opportunityName}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 sm:pt-4">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          const isActive = currentStep === s.num;
          const isPast = currentStep > s.num;

          return (
            <div
              key={s.num}
              onClick={() => onStepClick && onStepClick(s.num)}
              className={`relative rounded-xl p-3 sm:p-3.5 transition-all text-left flex items-start gap-3 border ${
                onStepClick ? 'cursor-pointer hover:border-[#2D6A4F]' : ''
              } ${
                isActive
                  ? 'bg-[#F2F8F4] border-[#2D6A4F] shadow-xs'
                  : isPast
                  ? 'bg-[#FAF9F5] border-[#D5D2C7] opacity-90'
                  : 'bg-white border-[#E6E4DC] opacity-70'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                  isActive
                    ? 'bg-[#143626] text-white'
                    : isPast
                    ? 'bg-[#2D6A4F] text-white'
                    : 'bg-[#EAE8DE] text-[#52796F]'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${
                      isActive ? 'text-[#143626]' : 'text-[#3D5A4C]'
                    }`}
                  >
                    {s.title}
                  </span>
                  {idx < 2 && (
                    <ArrowRight className="w-3.5 h-3.5 text-[#A3B18A] hidden md:block shrink-0 ml-1" />
                  )}
                </div>
                <p className="text-[11px] text-[#52796F] line-clamp-2 mt-0.5 leading-snug">
                  {s.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
