import {
  Component,
  ElementRef,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  AfterViewInit,
  PLATFORM_ID,
  ViewChild,
  signal
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DailyStat } from './admin-api.service';

interface Series {
  key: 'pageViews' | 'visits';
  name: string;
  cssVar: string;
}

const SERIES: Series[] = [
  { key: 'pageViews', name: 'Page views', cssVar: 'var(--series-1)' },
  { key: 'visits', name: 'Visits', cssVar: 'var(--series-2)' }
];

const HEIGHT = 260;
const M = { top: 16, right: 96, bottom: 30, left: 48 };

@Component({
  selector: 'app-traffic-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-head">
      <ul class="legend" aria-label="Legend">
        @for (s of series; track s.key) {
          <li><span class="line-key" [style.background]="s.cssVar"></span>{{ s.name }}</li>
        }
      </ul>
      <button type="button" class="link-btn" (click)="showTable.set(!showTable())">
        {{ showTable() ? 'Show chart' : 'Show table' }}
      </button>
    </div>

    @if (!showTable()) {
      <div class="plot" #plot>
        <svg
          [attr.width]="width"
          [attr.height]="height"
          role="img"
          [attr.aria-label]="ariaLabel()"
        >
          <!-- grid + y ticks -->
          @for (t of yTicks; track t) {
            <line class="grid" [attr.x1]="m.left" [attr.x2]="width - m.right" [attr.y1]="y(t)" [attr.y2]="y(t)" />
            <text class="tick" [attr.x]="m.left - 8" [attr.y]="y(t)" text-anchor="end" dominant-baseline="middle">
              {{ t | number }}
            </text>
          }
          <line class="baseline" [attr.x1]="m.left" [attr.x2]="width - m.right" [attr.y1]="y(0)" [attr.y2]="y(0)" />

          <!-- x labels -->
          @for (i of xLabelIndexes; track i) {
            <text class="tick" [attr.x]="x(i)" [attr.y]="height - 8" text-anchor="middle">{{ shortDate(data[i].day) }}</text>
          }

          <!-- lines -->
          @for (s of series; track s.key) {
            <path class="line" [attr.d]="linePath(s.key)" [attr.stroke]="s.cssVar" />
          }

          <!-- end markers + direct labels -->
          @if (data.length) {
            @for (s of series; track s.key) {
              <circle class="dot" [attr.cx]="x(data.length - 1)" [attr.cy]="y(last(s.key))" r="4" [attr.fill]="s.cssVar" />
              @if (showEndLabels) {
                <text class="end-label" [attr.x]="x(data.length - 1) + 10" [attr.y]="y(last(s.key))" dominant-baseline="middle">
                  <tspan class="end-value">{{ last(s.key) | number }}</tspan>
                  <tspan class="end-name" dx="4">{{ s.name }}</tspan>
                </text>
              }
            }
          }

          <!-- crosshair -->
          @if (hover() !== null) {
            <line class="crosshair" [attr.x1]="x(hover()!)" [attr.x2]="x(hover()!)" [attr.y1]="m.top" [attr.y2]="y(0)" />
            @for (s of series; track s.key) {
              <circle class="dot" [attr.cx]="x(hover()!)" [attr.cy]="y(data[hover()!][s.key])" r="4" [attr.fill]="s.cssVar" />
            }
          }

          <!-- hit area -->
          <rect
            class="hit"
            [attr.x]="m.left"
            [attr.y]="m.top"
            [attr.width]="plotWidth"
            [attr.height]="height - m.top - m.bottom"
            tabindex="0"
            aria-label="Daily traffic. Use left and right arrow keys to read each day."
            (pointermove)="onPointer($event)"
            (pointerleave)="hover.set(null)"
            (focus)="hover.set(hover() ?? data.length - 1)"
            (blur)="hover.set(null)"
            (keydown)="onKey($event)"
          />
        </svg>

        @if (hover() !== null) {
          <div class="tooltip" [style.left.px]="tooltipLeft()" role="status">
            <div class="tt-date">{{ longDate(data[hover()!].day) }}</div>
            @for (s of series; track s.key) {
              <div class="tt-row">
                <span class="line-key" [style.background]="s.cssVar"></span>
                <strong>{{ data[hover()!][s.key] | number }}</strong>
                <span class="tt-name">{{ s.name }}</span>
              </div>
            }
          </div>
        }
      </div>
    } @else {
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr><th>Date</th><th class="num">Page views</th><th class="num">Visits</th></tr>
          </thead>
          <tbody>
            @for (d of data; track d.day) {
              <tr><td>{{ longDate(d.day) }}</td><td class="num">{{ d.pageViews | number }}</td><td class="num">{{ d.visits | number }}</td></tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
  styleUrls: ['./traffic-chart.component.css']
})
export class TrafficChartComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() data: DailyStat[] = [];
  @ViewChild('plot') plotRef?: ElementRef<HTMLElement>;

  readonly series = SERIES;
  readonly m = { ...M };
  readonly height = HEIGHT;
  readonly hover = signal<number | null>(null);
  readonly showTable = signal(false);

  width = 720;
  yMax = 1;
  yTicks: number[] = [0];
  xLabelIndexes: number[] = [];
  showEndLabels = true;

  private observer?: ResizeObserver;
  private readonly isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: object, private host: ElementRef<HTMLElement>) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  get plotWidth(): number {
    return Math.max(this.width - this.m.left - this.m.right, 10);
  }

  ngOnChanges(): void {
    this.hover.set(null);
    this.layout();
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser || typeof ResizeObserver === 'undefined') return;
    this.observer = new ResizeObserver((entries) => {
      const w = Math.floor(entries[0].contentRect.width);
      if (w > 0 && w !== this.width) {
        this.width = w;
        this.layout();
      }
    });
    this.observer.observe(this.host.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  x(i: number): number {
    if (this.data.length <= 1) return this.m.left + this.plotWidth / 2;
    return this.m.left + (i / (this.data.length - 1)) * this.plotWidth;
  }

  y(v: number): number {
    return this.m.top + (1 - v / this.yMax) * (HEIGHT - this.m.top - this.m.bottom);
  }

  last(key: Series['key']): number {
    return this.data.length ? this.data[this.data.length - 1][key] : 0;
  }

  linePath(key: Series['key']): string {
    return this.data.map((d, i) => `${i ? 'L' : 'M'}${this.x(i).toFixed(1)},${this.y(d[key]).toFixed(1)}`).join('');
  }

  tooltipLeft(): number {
    const i = this.hover();
    if (i === null) return 0;
    const px = this.x(i);
    const tooltipWidth = 168;
    return px + 12 + tooltipWidth > this.width ? px - 12 - tooltipWidth : px + 12;
  }

  onPointer(event: PointerEvent): void {
    const rect = (event.currentTarget as SVGRectElement).getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    this.hover.set(this.data.length <= 1 ? 0 : Math.round(Math.min(Math.max(ratio, 0), 1) * (this.data.length - 1)));
  }

  onKey(event: KeyboardEvent): void {
    const current = this.hover() ?? this.data.length - 1;
    if (event.key === 'ArrowLeft') this.hover.set(Math.max(current - 1, 0));
    else if (event.key === 'ArrowRight') this.hover.set(Math.min(current + 1, this.data.length - 1));
    else return;
    event.preventDefault();
  }

  ariaLabel(): string {
    const total = this.data.reduce((n, d) => n + d.pageViews, 0);
    return `Line chart of daily page views and visits, ${this.data.length} days, ${total} page views in total.`;
  }

  shortDate(day: string): string {
    return new Date(`${day}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  }

  longDate(day: string): string {
    return new Date(`${day}T12:00:00Z`).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC'
    });
  }

  private layout(): void {
    // Narrow screens: give the plot the room and let the legend carry identity.
    this.m.right = this.width < 480 ? 16 : M.right;

    const max = Math.max(1, ...this.data.flatMap((d) => [d.pageViews, d.visits]));
    const step = niceStep(max / 4);
    this.yMax = Math.ceil(max / step) * step;
    this.yTicks = [];
    for (let t = 0; t <= this.yMax; t += step) this.yTicks.push(t);

    const n = this.data.length;
    const maxLabels = Math.max(2, Math.floor(this.plotWidth / 72));
    const every = Math.max(1, Math.ceil(n / maxLabels));
    this.xLabelIndexes = [];
    for (let i = 0; i < n; i += every) this.xLabelIndexes.push(i);

    // End labels only when the two line ends are far enough apart to stay attached.
    const gap = Math.abs(this.y(this.last('pageViews')) - this.y(this.last('visits')));
    this.showEndLabels = this.width >= 480 && n > 0 && gap >= 16;
  }
}

function niceStep(raw: number): number {
  if (raw <= 1) return 1;
  const power = 10 ** Math.floor(Math.log10(raw));
  const unit = raw / power;
  return (unit <= 1 ? 1 : unit <= 2 ? 2 : unit <= 5 ? 5 : 10) * power;
}
