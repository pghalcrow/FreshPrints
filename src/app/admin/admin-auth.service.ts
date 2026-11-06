import { Injectable, Inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';
import { IGNORE_TRAFFIC_KEY } from '../services/traffic.service';

// Sign-in for /admin, calling Cognito's public user-pool API directly
// (no SDK needed). Tokens are kept in localStorage so a refresh keeps you signed in.

const SESSION_KEY = 'fp_admin_session';
const REFRESH_MARGIN_MS = 2 * 60 * 1000;

interface Session {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresAt: number;
  email: string;
}

export type SignInResult =
  | { kind: 'signed-in' }
  | { kind: 'new-password-required'; session: string }
  | { kind: 'reset-required' };

export class AuthError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private readonly isBrowser: boolean;
  private readonly endpoint = `https://cognito-idp.${environment.analytics.region}.amazonaws.com/`;
  private readonly clientId = environment.analytics.userPoolClientId;
  private session: Session | null = null;
  private refreshing: Promise<string | null> | null = null;

  readonly email = signal<string | null>(null);

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      try {
        this.session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
      } catch {
        this.session = null;
      }
      this.email.set(this.session?.email ?? null);
    }
  }

  get configured(): boolean {
    return !!this.clientId && !!environment.analytics.apiUrl;
  }

  get signedIn(): boolean {
    return !!this.session;
  }

  async signIn(email: string, password: string): Promise<SignInResult> {
    try {
      const res = await this.call('InitiateAuth', {
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: this.clientId,
        AuthParameters: { USERNAME: email, PASSWORD: password }
      });
      if (res.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
        return { kind: 'new-password-required', session: res.Session };
      }
      this.store(res.AuthenticationResult);
      return { kind: 'signed-in' };
    } catch (err) {
      if (err instanceof AuthError && err.code === 'PasswordResetRequiredException') return { kind: 'reset-required' };
      throw err;
    }
  }

  async completeNewPassword(email: string, newPassword: string, session: string): Promise<void> {
    const res = await this.call('RespondToAuthChallenge', {
      ChallengeName: 'NEW_PASSWORD_REQUIRED',
      ClientId: this.clientId,
      Session: session,
      ChallengeResponses: { USERNAME: email, NEW_PASSWORD: newPassword }
    });
    this.store(res.AuthenticationResult);
  }

  async forgotPassword(email: string): Promise<void> {
    await this.call('ForgotPassword', { ClientId: this.clientId, Username: email });
  }

  async confirmForgotPassword(email: string, code: string, newPassword: string): Promise<void> {
    await this.call('ConfirmForgotPassword', {
      ClientId: this.clientId,
      Username: email,
      ConfirmationCode: code,
      Password: newPassword
    });
  }

  // A valid access token, refreshed when close to expiry. Null means signed out.
  async getAccessToken(forceRefresh = false): Promise<string | null> {
    if (!this.session) return null;
    if (!forceRefresh && this.session.expiresAt - Date.now() > REFRESH_MARGIN_MS) return this.session.accessToken;

    this.refreshing ??= this.refresh().finally(() => (this.refreshing = null));
    return this.refreshing;
  }

  async signOut(): Promise<void> {
    const refreshToken = this.session?.refreshToken;
    this.clear();
    if (refreshToken) {
      await this.call('RevokeToken', { ClientId: this.clientId, Token: refreshToken }).catch(() => {});
    }
  }

  private async refresh(): Promise<string | null> {
    const current = this.session;
    if (!current) return null;
    try {
      const res = await this.call('InitiateAuth', {
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        ClientId: this.clientId,
        AuthParameters: { REFRESH_TOKEN: current.refreshToken }
      });
      this.store({ ...res.AuthenticationResult, RefreshToken: current.refreshToken });
      return this.session!.accessToken;
    } catch {
      this.clear();
      return null;
    }
  }

  private store(result: { AccessToken: string; IdToken: string; RefreshToken: string; ExpiresIn: number }): void {
    const claims = decodeJwt(result.IdToken);
    this.session = {
      accessToken: result.AccessToken,
      idToken: result.IdToken,
      refreshToken: result.RefreshToken,
      expiresAt: Date.now() + result.ExpiresIn * 1000,
      email: String(claims['email'] || '')
    };
    this.email.set(this.session.email);
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(this.session));
      // Admins' own browsing shouldn't show up in the traffic stats.
      localStorage.setItem(IGNORE_TRAFFIC_KEY, '1');
    } catch {}
  }

  private clear(): void {
    this.session = null;
    this.email.set(null);
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {}
  }

  private async call(action: string, body: object): Promise<any> {
    let res: Response;
    try {
      res = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-amz-json-1.1',
          'X-Amz-Target': `AWSCognitoIdentityProviderService.${action}`
        },
        body: JSON.stringify(body)
      });
    } catch {
      throw new AuthError('NetworkError', "Couldn't reach the sign-in service. Check your connection and try again.");
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const code = String(data.__type || '').split('#').pop() || 'Error';
      throw new AuthError(code, friendlyMessage(code, data.message));
    }
    return data;
  }
}

function friendlyMessage(code: string, raw = ''): string {
  switch (code) {
    case 'NotAuthorizedException':
      if (/disabled/i.test(raw)) return 'This account has been disabled. Contact an administrator.';
      if (/temporary password has expired/i.test(raw)) return 'Your temporary password has expired. Ask an administrator to resend your invitation.';
      return 'Incorrect email or password.';
    case 'UserNotFoundException':
      return 'Incorrect email or password.';
    case 'CodeMismatchException':
      return 'That code is incorrect. Check the email and try again.';
    case 'ExpiredCodeException':
      return 'That code has expired. Request a new one.';
    case 'InvalidPasswordException':
      return 'Password must be at least 12 characters and include upper and lowercase letters and a number.';
    case 'LimitExceededException':
    case 'TooManyRequestsException':
    case 'TooManyFailedAttemptsException':
      return 'Too many attempts. Please wait a few minutes and try again.';
    default:
      return raw || 'Something went wrong. Please try again.';
  }
}

function decodeJwt(token: string): Record<string, unknown> {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(escape(atob(payload))));
  } catch {
    return {};
  }
}
