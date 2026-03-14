import type { ScannerConfig } from "./types.js";

export function readNumberEnv(key: string, fallback: number): number {
  const raw = process.env[key];
  if (!raw) {
    return fallback;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    console.warn(
      `⚠️ Invalid value for ${key}: "${raw}". Using default ${fallback}.`,
    );
    return fallback;
  }

  return parsed;
}

export function loadScannerConfigFromEnv(): ScannerConfig {
  return {
    minVolume: readNumberEnv("SCAN_MIN_VOLUME", 5000),
    minLiquidity: readNumberEnv("SCAN_MIN_LIQUIDITY", 2000),
    minExpectedROI: readNumberEnv("SCAN_MIN_ROI", 0.08),
    maxSpread: readNumberEnv("SCAN_MAX_SPREAD", 0.15),
    arbMinSpread: readNumberEnv("SCAN_ARB_MIN_SPREAD", 0.03),
    mispricingMin: readNumberEnv("SCAN_MISPRICING_MIN", 0.02),
    weatherMinPrice: readNumberEnv("SCAN_WEATHER_MIN_PRICE", 0.05),
    weatherMaxPrice: readNumberEnv("SCAN_WEATHER_MAX_PRICE", 0.15),
    weatherMinEdge: readNumberEnv("SCAN_WEATHER_MIN_EDGE", 0.2),
  };
}

export function loadTopNFromEnv(): number {
  return readNumberEnv("SCAN_TOP_N", 10);
}

export function diagnosticsEnabled(): boolean {
  const raw = process.env.SCAN_DIAGNOSTICS;
  return raw === "1" || raw === "true";
}
