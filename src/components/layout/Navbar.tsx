/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { 
  Sprout, 
  Compass, 
  Calculator, 
  BarChart3, 
  FileText, 
  Award, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X, 
  Globe2,
  LayoutDashboard,
  Rocket
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { language, toggleLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { id: 'landing', label: t('navHome'), icon: Sprout },
    { id: 'explore', label: t('navExplore'), icon: Compass },
    { id: 'calculator', label: t('navCalculator'), icon: Calculator },
    { id: 'plan', label: t('navPlan'), icon: Rocket },
    { id: 'market', label: t('navMarket'), icon: BarChart3 },
    { id: 'schemes', label: t('navSchemes'), icon: Award },
  ];

  if (user) {
    navItems.splice(1, 0, { id: 'dashboard', label: t('navDashboard'), icon: LayoutDashboard });
  }

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F5]/95 backdrop-blur-md border-b border-[#E6E4DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo & Brand */}
          <button 
            onClick={() => handleNav('landing')} 
            className="flex items-center gap-3 text-left focus:outline-none group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#1B4332] flex items-center justify-center text-white shadow-xs transition-transform group-hover:scale-105">
              <Sprout className="w-6 h-6 text-[#74C69D]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-[#143626]">RuralRise AI</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#2D6A4F] bg-[#D8F3DC] px-2 py-0.5 rounded">
                  Warangal Pilot
                </span>
              </div>
              <p className="text-xs text-[#52796F] line-clamp-1 hidden sm:block">
                {t('tagline')}
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#1B4332] text-white shadow-xs'
                      : 'text-[#2D3748] hover:text-[#143626] hover:bg-[#EAE8E0]'
                  }`}
                >
                  <Icon className="w-4 h-4 opacity-80" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Side: Language Toggle & User Actions */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D5D2C7] bg-white text-xs font-semibold text-[#1B4332] hover:bg-[#F2F0E8] transition-colors cursor-pointer shadow-2xs"
              title="Toggle between English and Telugu"
            >
              <Globe2 className="w-3.5 h-3.5 text-[#2D6A4F]" />
              <span>{language === 'en' ? 'తెలుగు' : 'English'}</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-[#E2DFD2]">
                <button
                  onClick={() => handleNav('dashboard')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#EAE8E0] text-xs font-semibold text-[#143626] hover:bg-[#DFDCD2] transition-colors cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#2D6A4F]" />
                  <span className="max-w-[120px] truncate">{user.name}</span>
                </button>
                <button
                  onClick={() => logout()}
                  title={t('navSignOut')}
                  className="p-1.5 text-[#718096] hover:text-[#C53030] rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNav('auth')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#1B4332] hover:bg-[#EAE8E0] transition-colors cursor-pointer"
                >
                  {t('navSignIn')}
                </button>
                <button
                  onClick={() => handleNav('auth')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#1B4332] text-white hover:bg-[#143626] transition-colors shadow-2xs cursor-pointer"
                >
                  {t('navGetStarted')}
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1 rounded border border-[#D5D2C7] bg-white text-xs font-bold text-[#1B4332]"
            >
              {language === 'en' ? 'తెలుగు' : 'EN'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#1B4332] hover:bg-[#EAE8E0] focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF9F5] border-b border-[#E6E4DC] px-4 pt-2 pb-6 space-y-1 shadow-lg">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-[#1B4332] text-white'
                    : 'text-[#2D3748] hover:bg-[#EAE8E0]'
                }`}
              >
                <Icon className="w-5 h-5 opacity-90" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-4 mt-2 border-t border-[#E6E4DC] flex flex-col gap-2">
            {user ? (
              <div className="flex items-center justify-between px-4 py-2 bg-[#F0EEE6] rounded-xl">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-[#2D6A4F]" />
                  <span className="text-sm font-semibold text-[#143626]">{user.name}</span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-1 text-xs font-semibold text-[#C53030] hover:underline"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('navSignOut')}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleNav('auth')}
                  className="w-full py-2.5 text-center text-sm font-semibold rounded-xl border border-[#D5D2C7] bg-white text-[#1B4332]"
                >
                  {t('navSignIn')}
                </button>
                <button
                  onClick={() => handleNav('auth')}
                  className="w-full py-2.5 text-center text-sm font-semibold rounded-xl bg-[#1B4332] text-white"
                >
                  {t('navGetStarted')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
