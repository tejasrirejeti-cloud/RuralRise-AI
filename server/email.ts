/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import nodemailer from 'nodemailer';

export interface EmailConfigStatus {
  isConfigured: boolean;
  provider: 'smtp' | 'resend' | 'none';
  host?: string;
  fromAddress?: string;
  missingFields: string[];
}

/**
 * Validates outbound email configuration.
 * Note: Having SMTP_HOST alone is NOT sufficient; credentials and sender address are also verified.
 */
export function getEmailConfigStatus(): EmailConfigStatus {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const from = process.env.SMTP_FROM?.trim();
  const resendKey = process.env.RESEND_API_KEY?.trim();

  const missingFields: string[] = [];

  // Check SMTP setup
  if (host) {
    if (!user) missingFields.push('SMTP_USER');
    if (!pass) missingFields.push('SMTP_PASS');
    if (!from) missingFields.push('SMTP_FROM');

    if (missingFields.length === 0) {
      return {
        isConfigured: true,
        provider: 'smtp',
        host,
        fromAddress: from,
        missingFields: []
      };
    }

    return {
      isConfigured: false,
      provider: 'none',
      host,
      missingFields
    };
  }

  // Check Resend setup (optional alternate provider)
  if (resendKey && resendKey !== 're_placeholder_key') {
    return {
      isConfigured: true,
      provider: 'resend',
      fromAddress: from || 'noreply@ruralrise.in',
      missingFields: []
    };
  }

  return {
    isConfigured: false,
    provider: 'none',
    missingFields: ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM']
  };
}

export interface SendRecoveryResult {
  success: boolean;
  dispatched: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Dispatches a password recovery email using the configured email provider.
 * Strictly adheres to security rules:
 * - Does not log usable recovery tokens
 * - Does not claim delivery succeeded unless the provider actually confirms delivery
 * - Accurately reports missing configuration or provider connection errors
 */
export async function sendPasswordRecoveryEmail(
  recipientEmail: string,
  rawToken: string
): Promise<SendRecoveryResult> {
  const status = getEmailConfigStatus();

  if (!status.isConfigured) {
    // Info log: never log the rawToken
    console.info(
      `[RuralRise Auth] Password recovery initiated for ${recipientEmail}. Email dispatch skipped: email provider not configured (${status.missingFields.join(', ')} missing).`
    );
    return {
      success: false,
      dispatched: false,
      error: `Email provider not configured (missing: ${status.missingFields.join(', ')})`
    };
  }

  const appUrl = (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');
  const resetLink = `${appUrl}/?mode=reset&token=${encodeURIComponent(rawToken)}`;

  if (status.provider === 'smtp') {
    try {
      const port = Number(process.env.SMTP_PORT) || 587;
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 8000
      });

      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || 'RuralRise AI <noreply@ruralrise.in>',
        to: recipientEmail,
        subject: 'RuralRise AI — Account Recovery Link',
        text: `Hello,\n\nA password recovery request was received for your RuralRise AI account.\n\nClick the link below to set a new password:\n${resetLink}\n\nThis single-use link expires in 15 minutes.\nIf you did not make this request, you can safely ignore this message.\n\nRuralRise AI Support Team\nWarangal District, Telangana, India`,
        html: `
          <div style="font-family: sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #E6E4DC; border-radius: 16px; background-color: #FAF9F5;">
            <h2 style="color: #143626; margin-top: 0;">RuralRise AI — Password Recovery</h2>
            <p style="color: #2D3748; line-height: 1.6;">Hello,</p>
            <p style="color: #2D3748; line-height: 1.6;">A password recovery request was initiated for your account. Click the button below to choose a new password:</p>
            <div style="margin: 28px 0; text-align: center;">
              <a href="${resetLink}" style="background-color: #1B4332; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>
            <p style="color: #718096; font-size: 12px; line-height: 1.5;">This single-use recovery link will expire in 15 minutes. If you did not request this, no action is required.</p>
            <hr style="border: none; border-top: 1px solid #E6E4DC; margin: 24px 0;" />
            <p style="color: #A0AEC0; font-size: 11px; margin-bottom: 0;">RuralRise AI — Warangal Pilot, Telangana, India</p>
          </div>
        `
      });

      console.info(
        `[RuralRise Auth] Password recovery email dispatched successfully to ${recipientEmail} (messageId: ${info.messageId})`
      );

      return {
        success: true,
        dispatched: true,
        messageId: info.messageId
      };
    } catch (err: any) {
      console.error(`[RuralRise Auth] SMTP delivery failure for ${recipientEmail}:`, err.message || err);
      return {
        success: false,
        dispatched: false,
        error: `SMTP delivery failed: ${err.message || 'Connection failed'}`
      };
    }
  }

  if (status.provider === 'resend') {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: process.env.SMTP_FROM || 'RuralRise AI <onboarding@resend.dev>',
          to: recipientEmail,
          subject: 'RuralRise AI — Account Recovery Link',
          text: `Hello,\n\nA password recovery request was received for your RuralRise AI account.\n\nClick the link below to set a new password:\n${resetLink}\n\nThis single-use link expires in 15 minutes.\nIf you did not make this request, you can safely ignore this message.\n\nRuralRise AI Support Team\nWarangal District, Telangana, India`,
          html: `
            <div style="font-family: sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #E6E4DC; border-radius: 16px; background-color: #FAF9F5;">
              <h2 style="color: #143626; margin-top: 0;">RuralRise AI — Password Recovery</h2>
              <p style="color: #2D3748; line-height: 1.6;">Hello,</p>
              <p style="color: #2D3748; line-height: 1.6;">A password recovery request was initiated for your account. Click the button below to choose a new password:</p>
              <div style="margin: 28px 0; text-align: center;">
                <a href="${resetLink}" style="background-color: #1B4332; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
              </div>
              <p style="color: #718096; font-size: 12px; line-height: 1.5;">This single-use recovery link will expire in 15 minutes. If you did not request this, no action is required.</p>
              <hr style="border: none; border-top: 1px solid #E6E4DC; margin: 24px 0;" />
              <p style="color: #A0AEC0; font-size: 11px; margin-bottom: 0;">RuralRise AI — Warangal Pilot, Telangana, India</p>
            </div>
          `
        })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const errorDetail = (data as any).message || response.statusText || 'Resend API rejected request';
        console.error(`[RuralRise Auth] Resend API delivery failure for ${recipientEmail}:`, errorDetail);
        return {
          success: false,
          dispatched: false,
          error: `Resend delivery failed: ${errorDetail}`
        };
      }

      console.info(
        `[RuralRise Auth] Password recovery email dispatched successfully via Resend to ${recipientEmail} (messageId: ${(data as any).id})`
      );

      return {
        success: true,
        dispatched: true,
        messageId: (data as any).id
      };
    } catch (err: any) {
      console.error(`[RuralRise Auth] Resend delivery network error for ${recipientEmail}:`, err.message || err);
      return {
        success: false,
        dispatched: false,
        error: `Resend delivery failed: ${err.message || 'Network error'}`
      };
    }
  }

  return {
    success: false,
    dispatched: false,
    error: 'Unsupported email provider'
  };
}
