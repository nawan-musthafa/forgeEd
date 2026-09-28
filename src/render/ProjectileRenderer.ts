import { Application, Graphics } from 'pixi.js';
import type { FrameState } from '../engine/SimulationRunner';
import type { LevelSchema, TrajectorySample, Vec2 } from '../engine/types';

const COLORS = {
  gridMinor: 0xffffff,
  gridMajor: 0xffffff,
  ground: 0x0b1220,
  groundLine: 0x38bdf8,
  launcher: 0xf8fafc,
  launcherGlow: 0x38bdf8,
  trail: 0xfbbf24,
  trailGlow: 0xfcd34d,
  preview: 0x7dd3fc,
  ballBase: 0xdc2626,
  ballMid: 0xf87171,
  ballRim: 0x7f1d1d,
  ballHighlight: 0xffffff,
  ballGlow: 0xef4444,
  vxArrow: 0x38bdf8,
  vyArrow: 0x34d399,
  vArrow: 0xf472b6,
} as const;

/** Fixed screen fractions — the launcher NEVER moves on-screen. */
export const LAUNCHER_SCREEN_X = 0.14;
export const LAUNCHER_SCREEN_Y = 0.82;
const TOP_RESERVE = 0.14;
const RIGHT_RESERVE = 0.06;

const VECTOR_PIXELS_PER_U = 58;

export interface RendererMetrics {
  /** Screen pixels per world metre. */
  scale: number;
  worldWidth: number;
  worldHeight: number;
  canvasWidth: number;
  canvasHeight: number;
}

export class ProjectileRenderer {
  private app: Application | null = null;
  private level: LevelSchema | null = null;
  private host: HTMLElement | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private metricsCallback: ((m: RendererMetrics) => void) | null = null;

  private readonly staticLayer = new Graphics();
  private readonly trailLayer = new Graphics();
  private readonly previewLayer = new Graphics();
  private readonly vectorsLayer = new Graphics();
  private readonly projectileLayer = new Graphics();

  private scale = 1;
  private originX = 0;
  private originY = 0;

  setMetricsCallback(cb: ((m: RendererMetrics) => void) | null): void {
    this.metricsCallback = cb;
    this.emitMetrics();
  }

  async init(host: HTMLElement, level: LevelSchema): Promise<void> {
    this.host = host;
    this.level = level;

    const app = new Application();
    await app.init({
      backgroundAlpha: 0,
      antialias: true,
      autoDensity: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      width: Math.max(host.clientWidth, 320),
      height: Math.max(host.clientHeight, 240),
    });

    this.app = app;
    host.appendChild(app.canvas);
    app.stage.addChild(
      this.staticLayer,
      this.trailLayer,
      this.previewLayer,
      this.vectorsLayer,
      this.projectileLayer,
    );

    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(host);

    this.layout();
    this.drawStatic();
  }

  setLevel(level: LevelSchema): void {
    this.level = level;
    this.layout();
    this.drawStatic();
  }

  destroy(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    const app = this.app;
    this.app = null;
    if (app) app.destroy(true, { children: true, texture: true });
    this.host = null;
    this.level = null;
  }

  draw(frame: FrameState, preview: readonly TrajectorySample[] | null): void {
    if (!this.app || !this.level) return;
    this.drawTrail(frame);
    this.drawPreview(frame, preview);
    this.drawVectors(frame);
    this.drawProjectile(frame);
  }

  private handleResize(): void {
    const { app, host } = this;
    if (!app || !host) return;
    app.renderer.resize(
      Math.max(host.clientWidth, 320),
      Math.max(host.clientHeight, 240),
    );
    this.layout();
    this.drawStatic();
  }

  private layout(): void {
    const { app, level } = this;
    if (!app || !level) return;

    const W = app.screen.width;
    const H = app.screen.height;

    // Launcher is pinned to a fixed screen pixel — the world scales around it.
    this.originX = W * LAUNCHER_SCREEN_X;
    this.originY = H * LAUNCHER_SCREEN_Y;

    const availableW = W - this.originX - W * RIGHT_RESERVE;
    const availableH = this.originY - H * TOP_RESERVE;

    this.scale = Math.min(
      availableW / Math.max(level.world.width, 0.2),
      availableH / Math.max(level.world.height, 0.2),
    );

    this.emitMetrics();
  }

  private emitMetrics(): void {
    if (!this.metricsCallback || !this.app || !this.level) return;
    this.metricsCallback({
      scale: this.scale,
      worldWidth: this.level.world.width,
      worldHeight: this.level.world.height,
      canvasWidth: this.app.screen.width,
      canvasHeight: this.app.screen.height,
    });
  }

  private toScreen(p: Vec2): { x: number; y: number } {
    return {
      x: this.originX + p.x * this.scale,
      y: this.originY - p.y * this.scale,
    };
  }

  private niceGridStep(worldWidth: number): number {
    const target = worldWidth / 10;
    const steps = [0.1, 0.25, 0.5, 1, 2, 5, 10, 20, 25, 50, 100, 200, 500, 1000];
    return steps.find((s) => s >= target) ?? 1000;
  }

  private drawStatic(): void {
    const { level, app } = this;
    const g = this.staticLayer;
    g.clear();
    if (!level || !app) return;

    const groundLeft = { x: 0, y: this.originY };
    const groundRight = { x: app.screen.width, y: this.originY };

    // Minor grid
    const minor = this.niceGridStep(level.world.width) / 5;
    for (let x = 0; x <= level.world.width * 1.3; x += minor) {
      const a = this.toScreen({ x, y: 0 });
      const b = this.toScreen({ x, y: level.world.height });
      if (a.x > app.screen.width) break;
      g.moveTo(a.x, a.y).lineTo(b.x, b.y);
    }
    for (let y = 0; y <= level.world.height * 1.3; y += minor) {
      const a = this.toScreen({ x: 0, y });
      const b = this.toScreen({ x: level.world.width, y });
      g.moveTo(a.x, a.y).lineTo(b.x, b.y);
    }
    g.stroke({ width: 1, color: COLORS.gridMinor, alpha: 0.05 });

    // Major grid
    const major = this.niceGridStep(level.world.width);
    for (let x = 0; x <= level.world.width * 1.3; x += major) {
      const a = this.toScreen({ x, y: 0 });
      const b = this.toScreen({ x, y: level.world.height });
      if (a.x > app.screen.width) break;
      g.moveTo(a.x, a.y).lineTo(b.x, b.y);
    }
    for (let y = 0; y <= level.world.height * 1.3; y += major) {
      const a = this.toScreen({ x: 0, y });
      const b = this.toScreen({ x: level.world.width, y });
      g.moveTo(a.x, a.y).lineTo(b.x, b.y);
    }
    g.stroke({ width: 1, color: COLORS.gridMajor, alpha: 0.11 });

    // Ground line
    g.moveTo(groundLeft.x, groundLeft.y)
      .lineTo(groundRight.x, groundRight.y)
      .stroke({ width: 2, color: COLORS.groundLine, alpha: 0.6 });

    // Launcher marker
    const pad = this.toScreen(level.launcher.position);
    g.circle(pad.x, pad.y, 12).fill({ color: COLORS.launcherGlow, alpha: 0.18 });
    g.circle(pad.x, pad.y, 6).fill({ color: COLORS.launcher });
  }

  private drawTrail(frame: FrameState): void {
    const g = this.trailLayer;
    g.clear();
    const trail = frame.trail;
    if (trail.length < 2) return;

    const first = this.toScreen(trail[0]);
    g.moveTo(first.x, first.y);
    for (let i = 1; i < trail.length; i += 1) {
      const p = this.toScreen(trail[i]);
      g.lineTo(p.x, p.y);
    }
    g.stroke({ width: 5, color: COLORS.trailGlow, alpha: 0.16 });
    g.stroke({ width: 2.5, color: COLORS.trail, alpha: 0.95 });
  }

  private drawPreview(
    frame: FrameState,
    preview: readonly TrajectorySample[] | null,
  ): void {
    const g = this.previewLayer;
    g.clear();
    if (!frame.active && preview && preview.length > 1) {
      for (let i = 0; i < preview.length; i += 3) {
        const p = this.toScreen(preview[i].position);
        g.circle(p.x, p.y, 2).fill({ color: COLORS.preview, alpha: 0.5 });
      }
    }
  }

  private drawVectors(frame: FrameState): void {
    const g = this.vectorsLayer;
    g.clear();
    if (!this.level) return;

    const origin = frame.projectile.position;
    const refSpeed = Math.max(frame.aim.speed, 1);
    const pxPerU = VECTOR_PIXELS_PER_U / refSpeed;
    const vx = frame.projectile.velocity.x;
    const vy = frame.projectile.velocity.y;
    const start = this.toScreen(origin);

    if (Math.abs(vx) > 1e-3) {
      const tip = { x: start.x + vx * pxPerU, y: start.y };
      this.arrow(g, start, tip, COLORS.vxArrow);
    }
    if (Math.abs(vy) > 1e-3) {
      const tip = { x: start.x, y: start.y - vy * pxPerU };
      this.arrow(g, start, tip, COLORS.vyArrow);
    }
    const vMag = Math.hypot(vx, vy);
    if (vMag > 1e-3 && frame.active) {
      const tip = { x: start.x + vx * pxPerU, y: start.y - vy * pxPerU };
      this.arrow(g, start, tip, COLORS.vArrow, 0.6);
    }
  }

  private arrow(
    g: Graphics,
    from: { x: number; y: number },
    to: { x: number; y: number },
    color: number,
    alpha = 0.95,
  ): void {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.hypot(dx, dy);
    if (len < 3) return;

    const ux = dx / len;
    const uy = dy / len;

    g.moveTo(from.x, from.y).lineTo(to.x, to.y);

    const head = Math.min(11, len * 0.35);
    const leftX = to.x - ux * head - uy * head * 0.55;
    const leftY = to.y - uy * head + ux * head * 0.55;
    const rightX = to.x - ux * head + uy * head * 0.55;
    const rightY = to.y - uy * head - ux * head * 0.55;

    g.moveTo(to.x, to.y).lineTo(leftX, leftY);
    g.moveTo(to.x, to.y).lineTo(rightX, rightY);
    g.stroke({ width: 2.5, color, alpha });
  }

  private drawProjectile(frame: FrameState): void {
    const g = this.projectileLayer;
    g.clear();
    if (!this.app) return;

    const center = this.toScreen(frame.projectile.position);

    // Fixed pixel radius — polished ball at every zoom level.
    const radius = Math.max(9, Math.min(18, this.app.screen.width * 0.014));

    g.circle(center.x, center.y, radius * 2.4).fill({ color: COLORS.ballGlow, alpha: 0.18 });
    g.circle(center.x, center.y, radius).fill({ color: COLORS.ballRim });
    g.circle(center.x, center.y, radius * 0.94).fill({ color: COLORS.ballBase });
    g.circle(
      center.x - radius * 0.2,
      center.y - radius * 0.22,
      radius * 0.72,
    ).fill({ color: COLORS.ballMid, alpha: 0.9 });
    g.circle(
      center.x - radius * 0.32,
      center.y - radius * 0.36,
      radius * 0.22,
    ).fill({ color: COLORS.ballHighlight, alpha: 0.95 });

    if (this.level) {
      const ground = this.toScreen({ x: frame.projectile.position.x, y: 0 });
      const heightRatio = Math.max(
        0,
        1 - frame.projectile.position.y / this.level.world.height,
      );
      const shadowRadius = radius * (0.9 + 0.6 * heightRatio);
      g.ellipse(ground.x, ground.y + 3, shadowRadius, shadowRadius * 0.28).fill({
        color: 0x000000,
        alpha: 0.35 * heightRatio,
      });
    }
  }
}