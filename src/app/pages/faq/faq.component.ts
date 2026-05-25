import { Component, AfterViewInit } from '@angular/core';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-faq',
  imports: [],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.css'
})
export class FaqComponent implements AfterViewInit {
  constructor(private seo: SeoService) {
    this.seo.updatePageMeta({
      title: 'FAQ | Emergency Printing San Diego | Fresh Prints',
      description: 'Common questions about emergency printing turnarounds, file formats, pricing, delivery and business accounts. Fresh Prints — San Diego rush printing. Call 619-500-1959.',
      keywords: 'emergency printing FAQ San Diego, rush printing questions, same-day printing San Diego, Fresh Prints FAQ',
      canonical: 'https://realfreshprints.com/faq',
      ogImage: 'https://realfreshprints.com/assets/images/fresh_prints.png'
    });
  }

  ngAfterViewInit(): void {
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
