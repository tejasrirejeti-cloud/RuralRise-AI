/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LanguageProvider } from './context/LanguageContext.js';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Navbar } from './components/layout/Navbar.js';
import { Footer } from './components/layout/Footer.js';
import { LandingPage } from './pages/LandingPage.js';
import { AuthPage } from './pages/AuthPage.js';
import { OnboardingPage } from './pages/OnboardingPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { OpportunityExplorerPage } from './pages/OpportunityExplorerPage.js';
import { CalculatorPage } from './pages/CalculatorPage.js';
import { MarketIntelligencePage } from './pages/MarketIntelligencePage.js';
import { SchemesPage } from './pages/SchemesPage.js';
import { BusinessPlanPage } from './pages/BusinessPlanPage.js';
import { EntrepreneurshipAssistant } from './components/common/EntrepreneurshipAssistant.js';

function MainApp() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [navParam, setNavParam] = useState<string | undefined>(undefined);

  const handleNavigate = (tab: string, param?: string) => {
    setActiveTab(tab);
    setNavParam(param);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] text-[#1E2922]">
      <Navbar activeTab={activeTab} setActiveTab={handleNavigate} />
      
      <main className="flex-1">
        {activeTab === 'landing' && (
          <LandingPage onNavigate={handleNavigate} />
        )}

        {activeTab === 'auth' && (
          <AuthPage onSuccess={() => handleNavigate('dashboard')} />
        )}

        {activeTab === 'onboarding' && (
          <OnboardingPage onComplete={() => handleNavigate('dashboard')} />
        )}

        {activeTab === 'dashboard' && (
          user ? (
            <DashboardPage onNavigate={handleNavigate} />
          ) : (
            <AuthPage onSuccess={() => handleNavigate('dashboard')} />
          )
        )}

        {activeTab === 'explore' && (
          <OpportunityExplorerPage 
            onNavigate={handleNavigate} 
            initialFilterCategory={navParam} 
          />
        )}

        {activeTab === 'calculator' && (
          <CalculatorPage 
            onNavigate={handleNavigate} 
            initialOpportunityId={navParam} 
          />
        )}

        {activeTab === 'market' && (
          <MarketIntelligencePage />
        )}

        {activeTab === 'schemes' && (
          <SchemesPage />
        )}

        {activeTab === 'plan' && (
          <BusinessPlanPage 
            onNavigate={handleNavigate} 
            planIdOrMode={navParam} 
          />
        )}
      </main>

      <Footer onNavigate={handleNavigate} />

      {/* Floating RuralRise AI Entrepreneurship Assistant */}
      <EntrepreneurshipAssistant 
        currentTab={activeTab} 
        opportunityId={navParam} 
        onNavigate={handleNavigate} 
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </LanguageProvider>
  );
}
