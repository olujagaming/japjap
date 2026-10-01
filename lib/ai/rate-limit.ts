/**
 * Einfaches Sliding-Window-Limit pro Schlüssel (z. B. Nutzer-ID oder IP), im Speicher
 * des Server-Prozesses. Schützt vor versehentlichen Schleifen und grobem Missbrauch;
 * für mehrere Instanzen wäre ein gemeinsamer Speicher (z. B. Redis) nötig.
 */
export class RateLimiter {
  private hits = new Map<string, number[]>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {}

  /** true = erlaubt (und gezählt), false = Limit erreicht. */
  take(key: string, now = Date.now()): boolean {
    const recent = (this.hits.get(key) ?? []).filter((t) => now - t < this.windowMs);
    if (recent.length >= this.limit) {
      this.hits.set(key, recent);
      return false;
    }
    recent.push(now);
    this.hits.set(key, recent);
    return true;
  }
}
