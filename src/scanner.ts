import type { Market, Opportunity, ScannerConfig } from './types.js';

export class OpportunityScanner {
  private config: ScannerConfig;

  constructor(config: Partial<ScannerConfig> = {}) {
    this.config = {
      minVolume: config.minVolume ?? 1000,
      minLiquidity: config.minLiquidity ?? 500,
      minExpectedROI: config.minExpectedROI ?? 0.05, // 5%
      maxSpread: config.maxSpread ?? 0.1, // 10%
    };
  }

  /**
   * Scan markets for profitable opportunities
   */
  scanMarkets(markets: Market[]): Opportunity[] {
    const opportunities: Opportunity[] = [];

    for (const market of markets) {
      if (!this.meetsVolumeRequirements(market)) continue;

      // Strategy 1: Weather markets (structured inefficiency)
      if (this.isWeatherMarket(market)) {
        const weatherOpp = this.analyzeWeatherMarket(market);
        if (weatherOpp) opportunities.push(weatherOpp);
      }

      // Strategy 2: Combinatorial arbitrage (YES+NO != 1)
      const arbOpp = this.detectCombinatorialArbitrage(market);
      if (arbOpp && arbOpp.roi >= this.config.minExpectedROI) {
        opportunities.push(arbOpp);
      }

      // Strategy 3: Standard mispricing detection
      for (const outcome of market.outcomes) {
        const opportunity = this.analyzeOutcome(market, outcome);
        if (opportunity && opportunity.roi >= this.config.minExpectedROI) {
          opportunities.push(opportunity);
        }
      }
    }

    return opportunities.sort((a, b) => b.roi - a.roi);
  }

  /**
   * Detect if market is weather-related (key inefficiency source)
   */
  private isWeatherMarket(market: Market): boolean {
    const keywords = ['weather', 'temperature', 'rain', 'snow', 'nyc', 'chicago', 'seattle', 'atlanta', 'dallas', 'miami', 'celsius', 'fahrenheit', 'forecast', 'noaa'];
    const questionLower = (market.question || '').toLowerCase();
    return keywords.some(kw => questionLower.includes(kw));
  }

  /**
   * Analyze weather markets with NOAA-style probability inference
   */
  private analyzeWeatherMarket(market: Market): Opportunity | null {
    // For weather markets, look for extreme mispricings
    // Retail traders often misprice weather outcomes
    const outcomes = market.outcomes || [];
    
    for (const outcome of outcomes) {
      const price = outcome.price || 0;
      
      // Weather inefficiencies: buckets priced <15% often have higher true probability
      if (price > 0.05 && price < 0.15) {
        const inferredProbability = this.estimateWeatherProbability(outcome);
        
        if (inferredProbability > price + 0.20) {
          return {
            marketId: market.id,
            question: market.question,
            outcome: outcome.name || 'Unknown',
            currentPrice: price,
            expectedValue: inferredProbability,
            roi: (inferredProbability - price) / price,
            reasoning: `Weather market inefficiency: ${outcome.name} priced at ${(price * 100).toFixed(1)}% but estimated ${(inferredProbability * 100).toFixed(1)}% probability. Retail mispricing typical in weather markets.`,
            riskLevel: price < 0.10 ? 'high' : 'medium',
          };
        }
      }
    }
    
    return null;
  }

  /**
   * Simple weather probability estimator
   * (In production, integrate real NOAA API)
   */
  private estimateWeatherProbability(outcome: any): number {
    const name = (outcome.name || '').toLowerCase();
    
    // Placeholder: In production, call NOAA API for actual forecasts
    // For now, apply heuristics for common weather buckets
    
    if (name.includes('above') || name.includes('over')) {
      return 0.55; // Average warm bias
    }
    if (name.includes('below') || name.includes('under')) {
      return 0.45; // Average cool bias
    }
    if (name.includes('rain') || name.includes('snow')) {
      return 0.35; // Precipitation less common
    }
    
    return 0.50; // Neutral estimate
  }

  /**
   * Detect combinatorial arbitrage: YES + NO != 1.0
   */
  private detectCombinatorialArbitrage(market: Market): Opportunity | null {
    const outcomes = market.outcomes || [];
    
    // Look for binary yes/no pairs
    if (outcomes.length !== 2) return null;
    
    const prices = outcomes.map(o => o.price || 0);
    const sum = prices.reduce((a, b) => a + b, 0);
    const spread = Math.abs(sum - 1.0);
    
    // Arbitrage opportunity if sum deviates from 1
    if (spread > 0.03) {  // 3% deviation
      const overpriced = prices[0] > prices[1] ? 0 : 1;
      const underpriced = 1 - overpriced;
      
      // Profit = sell overpriced, buy underpriced, wait for convergence
      const arbProfit = spread / Math.max(prices[overpriced], prices[underpriced]);
      
      return {
        marketId: market.id,
        question: market.question,
        outcome: `Pair: ${outcomes[overpriced].name} + ${outcomes[underpriced].name}`,
        currentPrice: prices[overpriced],
        expectedValue: prices[overpriced] - (spread / 2),
        roi: arbProfit,
        reasoning: `Combinatorial arbitrage detected: YES+NO sum is ${(sum * 100).toFixed(1)}% (should be 100%). Exploit by selling overpriced ${outcomes[overpriced].name} at ${(prices[overpriced] * 100).toFixed(1)}% and buying underpriced ${outcomes[underpriced].name} at ${(prices[underpriced] * 100).toFixed(1)}%. Converges to 1.0 at profit.`,
        riskLevel: 'low',  // Arb is market-neutral
      };
    }
    
    return null;
  }

  /**
   * Check if market meets minimum volume and liquidity requirements
   */
  private meetsVolumeRequirements(market: Market): boolean {
    return (
      market.volume24hr >= this.config.minVolume &&
      market.liquidity >= this.config.minLiquidity
    );
  }

  /**
   * Analyze a specific outcome for profitability
   */
  private analyzeOutcome(market: Market, outcome: any): Opportunity | null {
    const currentPrice = outcome.price || outcome.probability || 0;
    const probability = outcome.probability || outcome.price || 0;

    // Skip invalid prices
    if (currentPrice <= 0 || currentPrice >= 1) {
      return null;
    }

    // Skip extreme probabilities
    if (probability < 0.01 || probability > 0.99) {
      return null;
    }

    // Calculate expected value (mispricing opportunity)
    const mispricing = Math.abs(probability - currentPrice);
    
    // Only consider if there's meaningful mispricing
    if (mispricing < 0.02) {
      return null;
    }

    const expectedValue = mispricing > 0 ? currentPrice + mispricing : currentPrice;
    const roi = mispricing / currentPrice;

    // Determine risk level based on probability extremes
    let riskLevel: 'low' | 'medium' | 'high' = 'medium';
    if (probability > 0.7 || probability < 0.3) riskLevel = 'low';
    if (probability > 0.9 || probability < 0.1) riskLevel = 'high';

    return {
      marketId: market.id,
      question: market.question,
      outcome: outcome.name || outcome.title || 'Unknown',
      currentPrice,
      expectedValue,
      roi,
      reasoning: this.generateReasoning(currentPrice, probability, market.liquidity),
      riskLevel,
    };
  }

  /**
   * Generate human-readable reasoning for an opportunity
   */
  private generateReasoning(price: number, probability: number, liquidity: number): string {
    const mispricing = Math.abs(probability - price) * 100;
    const liquidityStatus = liquidity > 10000 ? 'high' : 'moderate';

    return `Market is pricing this at ${(price * 100).toFixed(1)}% but implied probability is ${(probability * 100).toFixed(1)}% (${mispricing.toFixed(1)}% spread). ${liquidityStatus} liquidity available.`;
  }
}
