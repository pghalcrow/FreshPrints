import { Component, AfterViewInit, OnDestroy, ElementRef, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-faq',
  imports: [RouterLink],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.css'
})
export class FaqComponent implements AfterViewInit, OnDestroy {
  constructor(
    private seo: SeoService,
    private host: ElementRef<HTMLElement>,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.seo.updatePageMeta({
      title: 'FAQ | Emergency Printing San Diego | Fresh Prints',
      description: 'Answers about emergency printing in San Diego: turnaround times, rush volume, delivery areas and file formats. Fresh Prints. Call 619-500-1959.',
      keywords: 'emergency printing FAQ San Diego, rush printing questions, same-day printing San Diego, Fresh Prints FAQ',
      canonical: 'https://realfreshprints.com/faq',
      ogImage: 'https://realfreshprints.com/assets/images/fresh_prints.png',
      breadcrumb: 'FAQ'
    });
  }

  ngOnDestroy(): void {
    this.seo.setJsonLd('faq-schema', null);
  }

  // Built from the rendered questions so the schema always matches the page
  private setFaqSchema(): void {
    const clean = (text: string | null | undefined) => (text ?? '').replace(/\s+/g, ' ').trim();
    const items: HTMLElement[] = Array.from(this.host.nativeElement.querySelectorAll('details.faq-item'));

    const questions = items.map(item => ({
      '@type': 'Question',
      name: clean(item.querySelector('summary')?.textContent),
      acceptedAnswer: {
        '@type': 'Answer',
        text: clean(item.querySelector('.answer')?.textContent)
      }
    })).filter(q => q.name && q.acceptedAnswer.text);

    this.seo.setJsonLd('faq-schema', questions.length ? {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: questions
    } : null);
  }

  ngAfterViewInit(): void {
    this.setFaqSchema();

    if (!isPlatformBrowser(this.platformId)) return;

    const navLinks = document.querySelectorAll<HTMLAnchorElement>('.faq-nav a[href^="#"]');
    const sections = Array.from(document.querySelectorAll<HTMLElement>('.faq-category'));

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });

    sections.forEach(s => observer.observe(s));

    navLinks.forEach(l => l.addEventListener('click', (e) => {
      const href = l.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const t = document.querySelector<HTMLElement>(href);
        if (t) window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 24, behavior: 'smooth' });
      }
    }));

    const searchInput = document.querySelector<HTMLInputElement>('.faq-intro .search input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const q = (e.target as HTMLInputElement).value.trim().toLowerCase();
        document.querySelectorAll<HTMLDetailsElement>('.faq-item').forEach(item => {
          const text = item.textContent?.toLowerCase() ?? '';
          item.style.display = (!q || text.includes(q)) ? '' : 'none';
          if (q && text.includes(q)) item.setAttribute('open', '');
          if (!q) item.removeAttribute('open');
        });
        document.querySelectorAll<HTMLElement>('.faq-category').forEach(cat => {
          const anyVisible = Array.from(cat.querySelectorAll<HTMLElement>('.faq-item')).some(i => i.style.display !== 'none');
          cat.style.display = anyVisible ? '' : 'none';
        });
      });
    }
  }
}
