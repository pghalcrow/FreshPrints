import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterOutlet, Router, NavigationEnd, RouterModule } from '@angular/router';
import { FadeImageDirective } from '../directives/fade-image.directive';

interface NavButton {
  label: string;
  url?: string;
  children?: NavButton[];
  isOpen?: boolean;
}

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, CommonModule, RouterModule, FadeImageDirective],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})

export class LayoutComponent implements OnInit {
  navButtons: NavButton[] = [];
  currentYear = new Date().getFullYear();

  constructor(private router: Router) {}

  toggleDropdown(button: NavButton) {
    button.isOpen = !button.isOpen;
  }

  closeDropdown(button: NavButton) {
    button.isOpen = false;
  }

  ngOnInit(): void {
    this.setNavButtons(this.router.url);

    // Listen to route changes
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.setNavButtons(event.urlAfterRedirects);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  private readonly allNavButtons = [
    { label: 'Home', url: '/' },
    { label: 'Upload Files', url: '/upload' },
    { label: 'About Us', url: '/about' },

    { 
      label: 'Products',
      children: [
        { label: 'Booklets', url: '/booklets' },
        { label: 'Catalogs', url: '/catalogs' },
        { label: 'Flyers', url: '/flyers' },
        { label: 'Labels', url: '/labels' },
        { label: 'Packaging', url: '/packaging' },
        { label: 'Postcards', url: '/postcards' },
        { label: 'Sleeves', url: '/sleeves'},
        { label: 'Stickers', url: '/stickers'},
      ]
    }
  ];

  private setNavButtons(url: string) {
    this.navButtons = this.allNavButtons.filter(btn => {
 
      if (url === '/' && btn.url === '/') return false;

      if (btn.url && url.startsWith(btn.url) && btn.url !== '/') return false;

      return true;
    });
  }
}
