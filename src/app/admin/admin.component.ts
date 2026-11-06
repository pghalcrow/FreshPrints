import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID, ViewEncapsulation, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { AdminAuthService, AuthError } from './admin-auth.service';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { AdminUsersComponent } from './admin-users.component';

type Screen = 'loading' | 'not-configured' | 'sign-in' | 'new-password' | 'forgot' | 'reset' | 'app';
type Tab = 'traffic' | 'users';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminDashboardComponent, AdminUsersComponent],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AdminComponent implements OnInit, OnDestroy {
  readonly screen = signal<Screen>('loading');
  readonly tab = signal<Tab>('traffic');
  readonly busy = signal(false);
  readonly error = signal('');
  readonly notice = signal('');

  email = '';
  password = '';
  newPassword = '';
  confirmPassword = '';
  code = '';
  private challengeSession = '';
  private readonly isBrowser: boolean;
  private readonly robotsTag: HTMLMetaElement | null;

  constructor(
    readonly auth: AdminAuthService,
    title: Title,
    private meta: Meta,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    title.setTitle('Admin | Fresh Prints');
    this.robotsTag = meta.addTag({ name: 'robots', content: 'noindex, nofollow' });
  }

  ngOnInit(): void {
    if (!this.isBrowser) return; // prerender shows the loading state
    if (!this.auth.configured) return this.screen.set('not-configured');
    this.screen.set(this.auth.signedIn ? 'app' : 'sign-in');
  }

  ngOnDestroy(): void {
    if (this.robotsTag) this.meta.removeTagElement(this.robotsTag);
  }

  // The API service signs out on an expired session; follow it back to the sign-in screen.
  get signedOut(): boolean {
    return this.screen() === 'app' && !this.auth.email();
  }

  go(screen: Screen): void {
    this.error.set('');
    this.notice.set('');
    this.password = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.code = '';
    this.screen.set(screen);
  }

  async signIn(): Promise<void> {
    await this.run(async () => {
      const result = await this.auth.signIn(this.email.trim(), this.password);
      if (result.kind === 'signed-in') {
        this.password = '';
        this.screen.set('app');
      } else if (result.kind === 'new-password-required') {
        this.challengeSession = result.session;
        this.go('new-password');
      } else {
        await this.auth.forgotPassword(this.email.trim());
        this.go('reset');
        this.notice.set('An administrator reset your password. We emailed you a code to set a new one.');
      }
    });
  }

  async setNewPassword(): Promise<void> {
    if (!this.passwordsMatch()) return;
    await this.run(async () => {
      await this.auth.completeNewPassword(this.email.trim(), this.newPassword, this.challengeSession);
      this.go('app');
    });
  }

  async sendResetCode(): Promise<void> {
    await this.run(async () => {
      await this.auth.forgotPassword(this.email.trim());
      this.go('reset');
      this.notice.set(`If ${this.email.trim()} has an account, we've emailed it a 6-digit code.`);
    });
  }

  async confirmReset(): Promise<void> {
    if (!this.passwordsMatch()) return;
    await this.run(async () => {
      await this.auth.confirmForgotPassword(this.email.trim(), this.code.trim(), this.newPassword);
      this.go('sign-in');
      this.notice.set('Password updated. Sign in with your new password.');
    });
  }

  async signOut(): Promise<void> {
    await this.auth.signOut();
    this.go('sign-in');
  }

  private passwordsMatch(): boolean {
    if (this.newPassword !== this.confirmPassword) {
      this.error.set("The passwords don't match.");
      return false;
    }
    return true;
  }

  private async run(work: () => Promise<void>): Promise<void> {
    this.busy.set(true);
    this.error.set('');
    try {
      await work();
    } catch (err) {
      this.error.set(err instanceof AuthError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      this.busy.set(false);
    }
  }
}
