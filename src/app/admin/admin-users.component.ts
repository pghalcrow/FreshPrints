import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService, AdminUser } from './admin-api.service';

type Action = 'disable' | 'enable' | 'reset' | 'resend' | 'delete';

const STATUS_LABELS: Record<string, string> = {
  CONFIRMED: 'Active',
  FORCE_CHANGE_PASSWORD: 'Invited',
  RESET_REQUIRED: 'Password reset pending',
  UNCONFIRMED: 'Unconfirmed'
};

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="card">
      <h2>Add an admin</h2>
      <p class="muted">They'll get an email with a temporary password and a link to sign in. Every admin can see all stats and manage users.</p>
      <form class="invite" (ngSubmit)="invite()" #inviteForm="ngForm">
        <label class="sr-only" for="invite-email">Email address</label>
        <input
          id="invite-email"
          type="email"
          name="email"
          [(ngModel)]="email"
          required
          placeholder="name@company.com"
          autocomplete="off"
        />
        <button type="submit" class="primary-btn" [disabled]="busy() || !email.trim()">Send invite</button>
      </form>
    </section>

    @if (message()) {
      <p class="notice" role="status">{{ message() }}</p>
    }
    @if (error()) {
      <p class="alert" role="alert">{{ error() }}</p>
    }

    <section class="card">
      <h2>Admins</h2>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr><th>Email</th><th>Status</th><th>Added</th><th><span class="sr-only">Actions</span></th></tr>
          </thead>
          <tbody>
            @for (u of users(); track u.id) {
              <tr [class.disabled-row]="!u.enabled">
                <td>
                  {{ u.email }}
                  @if (u.id === me()) { <span class="you">You</span> }
                </td>
                <td>{{ u.enabled ? statusLabel(u.status) : 'Disabled' }}</td>
                <td class="nowrap">{{ u.created | date: 'mediumDate' }}</td>
                <td class="actions">
                  @if (u.status === 'FORCE_CHANGE_PASSWORD' && u.enabled) {
                    <button type="button" class="ghost-btn" (click)="act(u, 'resend')" [disabled]="busy()">Resend invite</button>
                  }
                  @if (u.status === 'CONFIRMED' && u.enabled) {
                    <button type="button" class="ghost-btn" (click)="act(u, 'reset')" [disabled]="busy()">Reset password</button>
                  }
                  @if (u.id !== me()) {
                    @if (u.enabled) {
                      <button type="button" class="ghost-btn" (click)="act(u, 'disable')" [disabled]="busy()">Disable</button>
                    } @else {
                      <button type="button" class="ghost-btn" (click)="act(u, 'enable')" [disabled]="busy()">Enable</button>
                    }
                    <button type="button" class="danger-btn" (click)="act(u, 'delete')" [disabled]="busy()">Delete</button>
                  }
                </td>
              </tr>
            } @empty {
              <tr><td colspan="4" class="muted">{{ busy() ? 'Loading…' : 'No admins found.' }}</td></tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `,
  styles: [
    `
      .invite { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
      .invite input { flex: 1 1 240px; }
      .actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 6px; }
      .you { margin-left: 6px; padding: 1px 6px; border-radius: 999px; font-size: 11px; background: var(--chip); color: var(--text-secondary); }
      .disabled-row td:not(.actions) { color: var(--text-muted-strong); }
      .nowrap { white-space: nowrap; }
    `
  ]
})
export class AdminUsersComponent implements OnInit {
  readonly users = signal<AdminUser[]>([]);
  readonly me = signal('');
  readonly busy = signal(false);
  readonly message = signal('');
  readonly error = signal('');
  email = '';

  constructor(private api: AdminApiService) {}

  ngOnInit(): void {
    this.refresh();
  }

  statusLabel(status: string): string {
    return STATUS_LABELS[status] || status;
  }

  async refresh(): Promise<void> {
    await this.run(async () => {
      const res = await this.api.listUsers();
      this.users.set(res.users);
      this.me.set(res.me);
    }, false);
  }

  async invite(): Promise<void> {
    const email = this.email.trim();
    if (!email) return;
    await this.run(async () => {
      const res = await this.api.createUser(email);
      this.email = '';
      this.message.set(res.message);
      const list = await this.api.listUsers();
      this.users.set(list.users);
    });
  }

  async act(user: AdminUser, action: Action): Promise<void> {
    const confirmText: Partial<Record<Action, string>> = {
      delete: `Delete ${user.email}? They will lose access immediately. This can't be undone.`,
      disable: `Disable ${user.email}? They'll be signed out and can't sign in until re-enabled.`,
      reset: `Send ${user.email} a password reset? Their current password will stop working.`
    };
    if (confirmText[action] && !confirm(confirmText[action])) return;

    await this.run(async () => {
      const res = action === 'delete' ? await this.api.deleteUser(user.id) : await this.api.userAction(user.id, action);
      this.message.set(res.message);
      const list = await this.api.listUsers();
      this.users.set(list.users);
    });
  }

  private async run(work: () => Promise<void>, clearMessage = true): Promise<void> {
    this.busy.set(true);
    this.error.set('');
    if (clearMessage) this.message.set('');
    try {
      await work();
    } catch (err: any) {
      this.error.set(err?.message || 'Something went wrong.');
    } finally {
      this.busy.set(false);
    }
  }
}
