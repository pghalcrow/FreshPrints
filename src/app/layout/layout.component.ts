import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterOutlet, Router, NavigationEnd, RouterModule } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, CommonModule, RouterModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})

export class LayoutComponent implements OnInit {
  navButtons: { label: string; url: string }[] = [];
  currentYear = new Date().getFullYear();

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.setNavButtons(this.router.url);

    // Listen to route changes
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.setNavButtons(event.urlAfterRedirects);
      }
    });
  }

  private setNavButtons(url: string) {
    if (url.startsWith('/upload')) {
      this.navButtons = [
        { label: 'Home', url: '/' },
        { label: 'About Us', url: '/about' }
      ];
    } else if (url.startsWith('/about')) {
      this.navButtons = [
        { label: 'Home', url: '/' },
        { label: 'Upload Files', url: '/upload' }
      ];
    } else {
      // Default nav buttons
      this.navButtons = [
        { label: 'Upload Files', url: '/upload' },
        { label: 'About Us', url: '/about' }
      ];
    }
  }
}
