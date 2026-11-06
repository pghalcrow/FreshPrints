import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService, Ranked, Stats } from './admin-api.service';
import { TrafficChartComponent } from './traffic-chart.component';
import { demoStats } from './demo-stats';

const DEMO_KEY = 'fp_admin_demo';

type Preset = 'today' | '7' | '30' | '90' | '365' | 'custom';

const PRESETS: { value: Preset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: '365', label: 'Last 12 months' },
  { value: 'custom', label: 'Custom range' }
];

const SITE_TIME_ZONE = 'America/Los_Angeles';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, TrafficChartComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  readonly presets = PRESETS;
  preset: Preset = '30';
  from = '';
  to = '';
  readonly today = siteToday();

  // Sample data switch, offered only when running locally.
  readonly isLocal = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);
  demo = this.isLocal && readFlag(DEMO_KEY, true);

  readonly stats = signal<Stats | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly showAllPages = signal(false);

  readonly visiblePages = computed(() => {
    const pages = this.stats()?.pages ?? [];
    return this.showAllPages() ? pages : pages.slice(0, 10);
  });

  constructor(private api: AdminApiService) {}

  ngOnInit(): void {
    this.applyPreset();
  }

  applyPreset(): void {
    if (this.preset === 'custom') {
      if (!this.from || !this.to) {
        this.to = this.today;
        this.from = addDays(this.today, -29);
      }
      this.load();
      return;
    }
    this.to = this.today;
    this.from = this.preset === 'today' ? this.today : addDays(this.today, -(Number(this.preset) - 1));
    this.load();
  }

  onCustomChange(): void {
    if (this.from && this.to && this.from <= this.to) this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      this.stats.set(this.demo ? demoStats(this.from, this.to) : await this.api.getStats(this.from, this.to));
    } catch (err: any) {
      this.error.set(err?.message || "Couldn't load stats.");
    } finally {
      this.loading.set(false);
    }
  }

  toggleDemo(): void {
    try {
      localStorage.setItem(DEMO_KEY, this.demo ? '1' : '0');
    } catch {}
    this.load();
  }

  share(item: Ranked, list: Ranked[]): number {
    const total = list.reduce((n, r) => n + r.count, 0);
    return total ? item.count / total : 0;
  }

  barWidth(item: Ranked, list: Ranked[]): number {
    const max = list[0]?.count || 1;
    return (item.count / max) * 100;
  }

  duration(seconds: number): string {
    if (!seconds) return '0s';
    const s = Math.round(seconds);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    return m < 60 ? `${m}m ${String(s % 60).padStart(2, '0')}s` : `${Math.floor(m / 60)}h ${m % 60}m`;
  }

  time(ts: number): string {
    return new Date(ts).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: SITE_TIME_ZONE
    });
  }
}

function readFlag(key: string, fallback: boolean): boolean {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value === '1';
  } catch {
    return fallback;
  }
}

function siteToday(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: SITE_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

function addDays(day: string, n: number): string {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
