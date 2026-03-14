import { PolymarketClient } from "./polymarket.js";
import { OpportunityScanner } from "./scanner.js";
import type { ScanResult, ScannerConfig } from "./types.js";

export interface ExecuteScanOptions {
  config: ScannerConfig;
  marketLimit?: number;
}

export interface ExecuteScanResponse extends ScanResult {
  marketsCount: number;
}

export async function executeScan(
  options: ExecuteScanOptions,
): Promise<ExecuteScanResponse> {
  const client = new PolymarketClient();
  const scanner = new OpportunityScanner(options.config);
  const markets = await client.getMarkets(options.marketLimit ?? 100);
  const scanResult = scanner.scanMarketsWithDiagnostics(markets);

  return {
    ...scanResult,
    marketsCount: markets.length,
  };
}
