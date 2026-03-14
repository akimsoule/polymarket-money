import { PolymarketClient } from './polymarket.js';
import { OpportunityScanner } from './scanner.js';

async function main() {
  console.log('🚀 Polymarket Opportunity Scanner\n');

  const apiKey = process.env.POLYMARKET_API_KEY;
  const client = new PolymarketClient(apiKey);

  // Initialize scanner with custom config
  const scanner = new OpportunityScanner({
    minVolume: 5000,
    minLiquidity: 2000,
    minExpectedROI: 0.08, // 8%
    maxSpread: 0.15,
  });

  try {
    console.log('📊 Fetching markets from Polymarket...');
    const markets = await client.getMarkets();

    if (markets.length === 0) {
      console.log('❌ No markets found. Check your API connection.');
      return;
    }

    console.log(`✓ Found ${markets.length} markets\n`);

    console.log('🔍 Scanning for profitable opportunities...\n');
    const opportunities = scanner.scanMarkets(markets);

    if (opportunities.length === 0) {
      console.log('❌ No profitable opportunities found matching criteria.');
      return;
    }

    console.log(`✓ Found ${opportunities.length} opportunities!\n`);
    console.log('━'.repeat(120));
    console.log('TOP OPPORTUNITIES:');
    console.log('━'.repeat(120) + '\n');

    // Display top 10 opportunities
    opportunities.slice(0, 10).forEach((opp: any, index: number) => {
      const roiPercent = (opp.roi * 100).toFixed(2);
      const pricePercent = (opp.currentPrice * 100).toFixed(1);
      const evPercent = (opp.expectedValue * 100).toFixed(1);

      console.log(`${index + 1}. ${opp.question}`);
      console.log(`   Outcome: ${opp.outcome}`);
      console.log(`   Current Price: ${pricePercent}% | Expected Value: ${evPercent}% | ROI: ${roiPercent}%`);
      console.log(`   Risk: ${opp.riskLevel.toUpperCase()} | ${opp.reasoning}`);
      console.log();
    });

    console.log('━'.repeat(120));
    console.log(`\n💡 Tip: Set POLYMARKET_API_KEY env variable to access private portfolio data.\n`);

  } catch (error) {
    console.error('Error during scan:', error);
  }
}

main();
