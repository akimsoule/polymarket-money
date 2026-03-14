import { getStore } from "@netlify/blobs";
import type { ExecuteScanResponse } from "./scan-service.js";
import type { ScannerConfig } from "./types.js";

type ScanSource = "api" | "cron";

export interface ScanSnapshot extends ExecuteScanResponse {
  generatedAt: string;
  source: ScanSource;
  totalOpportunities: number;
  config: ScannerConfig;
  topN?: number;
  marketLimit?: number;
}

function buildScanKey(generatedAt: string): string {
  const safeTimestamp = generatedAt.replaceAll(/[:.]/g, "-");
  return `scans/${safeTimestamp}.json`;
}

export async function saveScanSnapshot(
  snapshot: ScanSnapshot,
): Promise<string> {
  const storeName = process.env.SCAN_BLOB_STORE_NAME ?? "scanner-history";
  const store = getStore(storeName);
  const key = buildScanKey(snapshot.generatedAt);
  const payload = JSON.stringify(snapshot);

  await store.set(key, payload);
  await store.set("latest.json", payload);

  return key;
}
