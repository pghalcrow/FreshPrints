import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// First-party page view tracking for the /admin dashboard (backend/analytics).
// No cookies and no personal data: a random visit ID lives in sessionStorage and
// expires after 30 minutes of inactivity. Time on page counts only while the tab is visible.

const TRACKED_HOSTS = ['realfreshprints.com', 'www.realfreshprints.com'];
const EXCLUDED_PATHS = /^\/(admin|files)(\/|$)/;
const VISIT_KEY = 'fp_visit';
const VISIT_TIMEOUT_MS = 30 * 60 * 1000;
export const IGNORE_TRAFFIC_KEY = 'fp_ignore_traffic'; // set on admins' browsers

interface CurrentView {
  id: string;
  ts: number;
  engagedMs: number;
  visibleSince: number | null;
  lastSentMs: number;
}

@Injectable({ providedIn: 'root' })
export class TrafficService {
  // Sent through CloudFront so page views carry the visitor's approximate location.
  private readonly endpoint = environment.analytics.collectUrl;
  private current: CurrentView | null = null;
  private started = false;

  constructor(
    private router: Router,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  start(): void {
    if (this.started || !this.shouldTrack()) return;
    this.started = true;

    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.onPageView(e.urlAfterRedirects));

    this.document.addEventListener('visibilitychange', () => {
      if (!this.current) return;
      if (this.document.visibilityState === 'hidden') {
        this.pauseClock();
        this.sendEngagement();
      } else {
        this.current.visibleSince = Date.now();
      }
    });

    // pagehide fires on tab close and navigation away, including on iOS.
    window.addEventListener('pagehide', () => {
      this.pauseClock();
      this.sendEngagement();
    });
  }

  // Records an action for the dashboard: a phone-number click or a finished file upload.
  trackAction(name: 'phone_click' | 'file_upload'): void {
    if (!this.started) return;
    const { id: visitId } = this.touchVisit();
    this.send({ t: 'x', n: name, id: randomId(), ts: Date.now(), vid: visitId, p: window.location.pathname || '/' });
  }

  private shouldTrack(): boolean {
    if (!isPlatformBrowser(this.platformId) || !this.endpoint) return false;
    if (!TRACKED_HOSTS.includes(window.location.hostname)) return false;
    if (navigator.webdriver) return false;
    try {
      if (localStorage.getItem(IGNORE_TRAFFIC_KEY)) return false;
    } catch {}
    return true;
  }

  private onPageView(url: string): void {
    const path = url.split(/[?#]/)[0] || '/';

    // Close out the previous page before starting the next one.
    if (this.current) {
      this.pauseClock();
      this.sendEngagement();
      this.current = null;
    }
    if (EXCLUDED_PATHS.test(path)) return;

    const { id: visitId, isNew } = this.touchVisit();
    const now = Date.now();
    this.current = {
      id: randomId(),
      ts: now,
      engagedMs: 0,
      visibleSince: this.document.visibilityState === 'visible' ? now : null,
      lastSentMs: 0
    };

    this.send({
      t: 'v',
      id: this.current.id,
      ts: this.current.ts,
      vid: visitId,
      nv: isNew,
      p: path,
      ti: this.document.title,
      r: isNew ? this.document.referrer : '',
      w: window.screen?.width || 0,
      tch: navigator.maxTouchPoints > 1
    });
  }

  private pauseClock(): void {
    const view = this.current;
    if (!view || view.visibleSince === null) return;
    view.engagedMs += Date.now() - view.visibleSince;
    view.visibleSince = null;
  }

  private sendEngagement(): void {
    const view = this.current;
    if (!view || view.engagedMs < 1000 || view.engagedMs === view.lastSentMs) return;
    view.lastSentMs = view.engagedMs;
    this.send({ t: 'e', id: view.id, ts: view.ts, d: view.engagedMs });
  }

  // A visit continues until 30 minutes pass without a page view.
  private touchVisit(): { id: string; isNew: boolean } {
    const now = Date.now();
    try {
      const saved = JSON.parse(sessionStorage.getItem(VISIT_KEY) || 'null');
      const isNew = !saved || now - saved.last > VISIT_TIMEOUT_MS;
      const id = isNew ? randomId() : saved.id;
      sessionStorage.setItem(VISIT_KEY, JSON.stringify({ id, last: now }));
      return { id, isNew };
    } catch {
      return { id: randomId(), isNew: true };
    }
  }

  private send(payload: Record<string, unknown>): void {
    const body = JSON.stringify(payload);
    try {
      // text/plain keeps this a "simple" request: no CORS preflight.
      if (navigator.sendBeacon?.(this.endpoint, new Blob([body], { type: 'text/plain' }))) return;
    } catch {}
    fetch(this.endpoint, { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'text/plain' } }).catch(() => {});
  }
}

function randomId(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}
