/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { Sprout, Lock, Mail, User as UserIcon, AlertCircle, ArrowRight, CheckCircle2, KeyRound } from 'lucide-react';

interface AuthPageProps {
  onSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const { login, register, requestPasswordReset, resetPassword } = useAuth();
  const { t, language } = useLanguage();

  const [mode, setMode] = useState<'signin' | 'register' | 'forgot'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [hasTokenField, setHasTokenField] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('token') || params.get('resetToken');
      const urlMode = params.get('mode');
      if (urlToken) {
        setMode('forgot');
        setResetToken(urlToken);
        setHasTokenField(true);
        // Immediately sanitize URL to prevent token exposure in address bar or referrer
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (urlMode === 'reset' || urlMode === 'forgot') {
        setMode('forgot');
      }
    } catch {}
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        await login(email, password);
        onSuccess();
      } else if (mode === 'register') {
        await register(name, email, password);
        onSuccess();
      } else if (mode === 'forgot') {
        if (!resetToken) {
          const res = await requestPasswordReset(email);
          const fullMsg = res.deliveryNotice ? `${res.message} ${res.deliveryNotice}` : res.message;
          setInfoMessage(fullMsg);
          if (res.emailDeliveryConfigured === false) {
            setError(
              language === 'en'
                ? 'Outbound email delivery is currently unconfigured on this server. To enable recovery links, SMTP credentials must be set in environment variables.'
                : 'ఈ సర్వర్‌లో ఈమెయిల్ సర్వీస్ ఇంకా కాన్ఫిగర్ చేయబడలేదు. SMTP క్రెడెన్షియల్స్ అవసరం.'
            );
          }
          // Reveal token entry field so user can enter the token once received
          setHasTokenField(true);
        } else {
          const res = await resetPassword(resetToken, newPassword);
          setInfoMessage(res.message);
          setTimeout(() => {
            setMode('signin');
            setPassword('');
            setResetToken('');
            setNewPassword('');
            setHasTokenField(false);
          }, 2500);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4">
      <div className="bg-white rounded-3xl p-8 border border-[#E6E4DC] shadow-lg space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#1B4332] text-white flex items-center justify-center mx-auto shadow-xs">
            <Sprout className="w-7 h-7 text-[#74C69D]" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#143626]">
            {mode === 'signin' && (language === 'en' ? 'Sign In to RuralRise AI' : 'రూరల్‌రైజ్ AI లోకి లాగిన్ అవ్వండి')}
            {mode === 'register' && (language === 'en' ? 'Create Your Account' : 'కొత్త ఖాతాను ప్రారంభించండి')}
            {mode === 'forgot' && (language === 'en' ? 'Account Recovery' : 'పాస్‌వర్డ్ రీసెట్')}
          </h2>
          <p className="text-xs sm:text-sm text-[#52796F]">
            {language === 'en'
              ? 'Pilot Geography: Warangal District, Telangana'
              : 'పైలట్ ప్రాంతం: వరంగల్ జిల్లా, తెలంగాణ'}
          </p>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex rounded-xl bg-[#F0EEE6] p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(null); setInfoMessage(null); }}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              mode === 'signin' ? 'bg-white text-[#143626] shadow-xs' : 'text-[#718096]'
            }`}
          >
            {t('navSignIn')}
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); setInfoMessage(null); }}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              mode === 'register' ? 'bg-white text-[#143626] shadow-xs' : 'text-[#718096]'
            }`}
          >
            {language === 'en' ? 'Register' : 'రిజిస్టర్'}
          </button>
          <button
            type="button"
            onClick={() => { setMode('forgot'); setError(null); setInfoMessage(null); }}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              mode === 'forgot' ? 'bg-white text-[#143626] shadow-xs' : 'text-[#718096]'
            }`}
          >
            {language === 'en' ? 'Reset' : 'రీసెట్'}
          </button>
        </div>

        {/* Notices */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {infoMessage && (
          <div className="bg-[#E8F5E9] border border-[#C8E6C9] text-[#1B4332] text-xs rounded-xl p-3 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#2D3748] flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-[#52796F]" />
                <span>{language === 'en' ? 'Full Name' : 'పూర్తి పేరు'}</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={language === 'en' ? 'e.g., Rajeshwari Devi' : 'ఉదా: రాజేశ్వరి దేవి'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5D2C7] bg-[#FAF9F5] text-sm focus:outline-none focus:border-[#1B4332] focus:bg-white transition-colors"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#2D3748] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#52796F]" />
              <span>{language === 'en' ? 'Email Address' : 'ఈమెయిల్ చిరునామా'}</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5D2C7] bg-[#FAF9F5] text-sm focus:outline-none focus:border-[#1B4332] focus:bg-white transition-colors"
            />
          </div>

          {mode !== 'forgot' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#2D3748] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#52796F]" />
                <span>{language === 'en' ? 'Password' : 'పాస్‌వర్డ్'}</span>
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5D2C7] bg-[#FAF9F5] text-sm focus:outline-none focus:border-[#1B4332] focus:bg-white transition-colors"
              />
              {mode === 'register' && (
                <p className="text-[11px] text-[#718096]">
                  {language === 'en' ? 'Minimum 6 characters' : 'కనీసం 6 అక్షరాలు ఉండాలి'}
                </p>
              )}
            </div>
          )}

          {mode === 'forgot' && !hasTokenField && !resetToken && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setHasTokenField(true)}
                className="text-xs text-[#2D6A4F] font-semibold hover:underline cursor-pointer"
              >
                {language === 'en' ? 'Already have a recovery token? Click here' : 'మీ వద్ద ఇప్పటికే రికవరీ టోకెన్ ఉందా? ఇక్కడ క్లిక్ చేయండి'}
              </button>
            </div>
          )}

          {mode === 'forgot' && (hasTokenField || resetToken) && (
            <div className="space-y-3 pt-2 border-t border-[#E6E4DC]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#143626]">
                  {language === 'en' ? 'Enter Recovery Token & New Password' : 'రికవరీ టోకెన్ & కొత్త పాస్‌వర్డ్'}
                </span>
                <button
                  type="button"
                  onClick={() => { setHasTokenField(false); setResetToken(''); }}
                  className="text-[11px] text-[#718096] hover:underline cursor-pointer"
                >
                  {language === 'en' ? 'Request token again' : 'మళ్లీ టోకెన్ కోరండి'}
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#2D3748] flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#52796F]" />
                  <span>{language === 'en' ? 'Reset Token' : 'రీసెట్ టోకెన్'}</span>
                </label>
                <input
                  type="text"
                  required
                  value={resetToken}
                  onChange={e => setResetToken(e.target.value)}
                  placeholder={language === 'en' ? 'Paste 64-char recovery token' : 'రికవరీ టోకెన్ ఇక్కడ పేస్ట్ చేయండి'}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D5D2C7] bg-[#FAF9F5] text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#2D3748]">
                  {language === 'en' ? 'New Password' : 'కొత్త పాస్‌వర్డ్'}
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5D2C7] bg-[#FAF9F5] text-sm"
                />
                <p className="text-[11px] text-[#718096]">
                  {language === 'en' ? 'Minimum 6 characters' : 'కనీసం 6 అక్షరాలు ఉండాలి'}
                </p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#1B4332] text-white font-bold text-sm hover:bg-[#143626] transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <span>{t('loading')}</span>
            ) : (
              <>
                <span>
                  {mode === 'signin' && t('navSignIn')}
                  {mode === 'register' && (language === 'en' ? 'Create Account' : 'ఖాతా తెరవండి')}
                  {mode === 'forgot' && (!resetToken ? (language === 'en' ? 'Request Recovery Link' : 'లింక్ కోసం కోరండి') : (language === 'en' ? 'Submit New Password' : 'పాస్‌వర్డ్ మార్చండి'))}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Privacy Note */}
        <div className="pt-2 border-t border-[#E6E4DC] text-[11px] text-[#718096] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0" />
          <span>
            {language === 'en'
              ? 'Your account, profile, and business plans remain strictly isolated and confidential.'
              : 'మీ ఖాతా వివరాలు మరియు వ్యాపార ప్రణాళికలు పూర్తిగా గోప్యంగా ఉంటాయి.'}
          </span>
        </div>

      </div>
    </div>
  );
};
