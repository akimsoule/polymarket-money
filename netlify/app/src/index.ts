import "dotenv/config";
import { executeScan } from "./scan-service.js";
import {
  diagnosticsEnabled,
  loadScannerConfigFromEnv,
  loadTopNFromEnv,
} from "./scan-config.js";
import type { Opportunity, ScanDiagnostics } from "./types.js";

function printDiagnostics(diagnostics: ScanDiagnostics): void {
  console.log("📋 Scan diagnostics\n");
  console.log(`Markets analyzed: ${diagnostics.marketsAnalyzed}`);
  console.log(
    `Markets passed volume/liquidity filters: ${diagnostics.marketsPassedFilters}`,
  );
  console.log(`Rejected by volume: ${diagnostics.rejectedByVolume}`);
  console.log(`Rejected by liquidity: ${diagnostics.rejectedByLiquidity}`);
  console.log(`Weather markets inspected: ${diagnostics.weatherMarkets}`);
  console.log(`Weather opportunities: ${diagnostics.weatherOpportunities}`);
  console.log(
    `Weather rejected by price window: ${diagnostics.weatherRejectedPriceWindow}`,
  );
  console.log(
    `Weather rejected by edge threshold: ${diagnostics.weatherRejectedEdge}`,
  );
  console.log(
    `Binary markets inspected for arbitrage: ${diagnostics.arbBinaryMarkets}`,
  );
  console.log(`Arbitrage opportunities: ${diagnostics.arbOpportunities}`);
  console.log(
    `Arbitrage rejected by spread threshold: ${diagnostics.arbRejectedSpread}`,
  );
  console.log(
    `Standard outcomes analyzed: ${diagnostics.standardOutcomesAnalyzed}`,
  );
  console.log(`Standard opportunities: ${diagnostics.standardOpportunities}`);
  console.log(
    `Standard rejected invalid price: ${diagnostics.standardRejectedInvalidPrice}`,
  );
  console.log(
    `Standard rejected probability range: ${diagnostics.standardRejectedProbabilityRange}`,
  );
  console.log(
    `Standard rejected min difference: ${diagnostics.standardRejectedMinDifference}`,
  );
  console.log(
    `Standard rejected min ROI: ${diagnostics.standardRejectedMinROI}`,
  );
  console.log();
}

async function runScan(): Promise<void> {
  console.log("🚀 Polymarket Opportunity Scanner\n");

  const scannerConfig = loadScannerConfigFromEnv();
  const topN = loadTopNFromEnv();
  const showDiagnostics = diagnosticsEnabled();

  try {
    console.log("📊 Fetching markets from Polymarket...");
    const scanResult = await executeScan({ config: scannerConfig });
    const { marketsCount, opportunities, diagnostics } = scanResult;

    if (marketsCount === 0) {
      console.log("❌ No markets found. Check your API connection.");
      return;
    }

    console.log(`✓ Found ${marketsCount} markets\n`);
    console.log(`⚙️ Active thresholds: ${JSON.stringify(scannerConfig)}\n`);

    console.log("🔍 Scanning for profitable opportunities...\n");

    if (opportunities.length === 0) {
      console.log("❌ No profitable opportunities found matching criteria.");
      printDiagnostics(diagnostics);
      return;
    }

    if (showDiagnostics) {
      printDiagnostics(diagnostics);
    }

    console.log(`✓ Found ${opportunities.length} opportunities!\n`);
    console.log("━".repeat(120));
    console.log("TOP OPPORTUNITIES:");
    console.log("━".repeat(120) + "\n");

    // Display top configurable opportunities
    opportunities
      .slice(0, Math.max(1, Math.floor(topN)))
      .forEach((opp: Opportunity, index: number) => {
        const roiPercent = (opp.roi * 100).toFixed(2);
        const pricePercent = (opp.currentPrice * 100).toFixed(1);
        const evPercent = (opp.expectedValue * 100).toFixed(1);

        console.log(`${index + 1}. ${opp.question}`);
        console.log(`   Outcome: ${opp.outcome}`);
        console.log(
          `   Current Price: ${pricePercent}% | Expected Value: ${evPercent}% | ROI: ${roiPercent}%`,
        );
        console.log(
          `   Risk: ${opp.riskLevel.toUpperCase()} | ${opp.reasoning}`,
        );
        console.log();
      });

    console.log("━".repeat(120));
    console.log(
      "\n💡 Tip: Run npm run auth:check to validate POLYMARKET_PRIVATE_KEY against the CLOB API.\n",
    );
  } catch (error) {
    console.error("Error during scan:", error);
  }
}

await runScan();
