import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private readonly isBrowser: boolean;
  private listening = false;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  // Sends a GA4 event. No-op during prerender or if gtag is blocked.
  track(eventName: string, params: Record<string, unknown> = {}): void {
    if (!this.isBrowser) return;

    const gtag = (window as any).gtag;
    if (typeof gtag !== 'function') return;

    gtag('event', eventName, {
      page_path: window.location.pathname,
      ...params
    });
  }

  // One delegated listener covers every phone link on the site.
  trackPhoneClicks(): void {
    if (!this.isBrowser || this.listening) return;
    this.listening = true;

    this.document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement | null;
      const link = target?.closest?.('a[href^="tel:"], [onclick*="tel:"]');
      if (!link) return;

      this.track('phone_call_click', {
        link_text: (link.textContent || '').trim().slice(0, 100),
        link_location: this.locationOf(link)
      });
    }, true);
  }

  private locationOf(el: Element): string {
    if (el.closest('header, nav')) return 'header';
    if (el.closest('footer')) return 'footer';
    return 'page_body';
  }
}
