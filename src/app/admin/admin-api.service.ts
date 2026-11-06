import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AdminAuthService } from './admin-auth.service';

export interface Ranked {
  name: string;
  count: number;
}

export interface PageStat {
  path: string;
  title: string;
  views: number;
  visitors: number;
  entrances: number;
  avgTimeSec: number;
}

export interface DailyStat {
  day: string;
  pageViews: number;
  visits: number;
  phoneClicks: number;
  fileUploads: number;
}

export interface RecentView {
  ts: number;
  path: string;
  browser: string;
  os: string;
  device: string;
  timeSec: number;
  ref: string;
  location: string;
}

export interface Stats {
  from: string;
  to: string;
  totals: {
    pageViews: number;
    visits: number;
    avgTimeOnPageSec: number;
    avgVisitDurationSec: number;
    pagesPerVisit: number;
    singlePageVisitRate: number;
    phoneClicks: number;
    fileUploads: number;
  };
  phoneClicksByPage: Ranked[];
  daily: DailyStat[];
  pages: PageStat[];
  browsers: Ranked[];
  operatingSystems: Ranked[];
  devices: Ranked[];
  referrers: Ranked[];
  locations: {
    locatedVisits: number; // visits whose IP could be placed
    sanDiegoVisits: number; // ...within the San Diego metro area
    cities: Ranked[];
    regions: Ranked[]; // US states, or the country for visits from abroad
    countries: Ranked[];
  };
  recent: RecentView[];
}

export interface AdminUser {
  id: string;
  email: string;
  status: string; // CONFIRMED | FORCE_CHANGE_PASSWORD | RESET_REQUIRED | ...
  enabled: boolean;
  created: string;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly base = environment.analytics.apiUrl;

  constructor(private auth: AdminAuthService) {}

  getStats(from: string, to: string): Promise<Stats> {
    return this.request('GET', `/stats?from=${from}&to=${to}`);
  }

  listUsers(): Promise<{ users: AdminUser[]; me: string }> {
    return this.request('GET', '/users');
  }

  createUser(email: string): Promise<{ message: string }> {
    return this.request('POST', '/users', { email });
  }

  userAction(id: string, action: 'disable' | 'enable' | 'reset' | 'resend'): Promise<{ message: string }> {
    return this.request('POST', `/users/${encodeURIComponent(id)}/${action}`);
  }

  deleteUser(id: string): Promise<{ message: string }> {
    return this.request('DELETE', `/users/${encodeURIComponent(id)}`);
  }

  private async request<T>(method: string, path: string, body?: object, retried = false): Promise<T> {
    const token = await this.auth.getAccessToken(retried);
    if (!token) throw new ApiError(401, 'Your session has ended. Please sign in again.');

    let res: Response;
    try {
      res = await fetch(`${this.base}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(body ? { 'Content-Type': 'application/json' } : {})
        },
        body: body ? JSON.stringify(body) : undefined
      });
    } catch {
      throw new ApiError(0, "Couldn't reach the server. Check your connection and try again.");
    }

    // An expired or revoked token: refresh once, then give up.
    if (res.status === 401 && !retried) return this.request(method, path, body, true);

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 401) await this.auth.signOut();
      throw new ApiError(res.status, data.message || 'Something went wrong. Please try again.');
    }
    return data as T;
  }
}
