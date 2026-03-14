import type {
  Market,
  Opportunity,
  ScanDiagnostics,
  ScanResult,
  ScannerConfig,
} from "./types.js";

const WEATHER_KEYWORDS = [
  "weather",
  "temperature",
  "forecast",
  "rain",
  "snow",
  "storm",
  "precipitation",
  "humidity",
  "wind",
  "degrees",
  "fahrenheit",
  "celsius",
  "high temperature",
  "low temperature",
  "sunny",
  "cloudy",
  "noaa",
  "heat index",
  "wind chill",
  "°f",
  "°c",
];

const NON_WEATHER_KEYWORDS = [
  "win",
  "wins",
  "stanley cup",
  "nba finals",
  "world cup",
  "playoffs",
  "album",
  "qualify",
  "ceasefire",
  "election",
  "convicted",
  "gta vi",
];

export class OpportunityScanner {
  private readonly config: ScannerConfig;

  constructor(config: Partial<ScannerConfig> = {}) {
    this.config = {
      minVolume: config.minVolume ?? 1000,
      minLiquidity: config.minLiquidity ?? 500,
      minExpectedROI: config.minExpectedROI ?? 0.05, // 5%
      maxSpread: config.maxSpread ?? 0.1, // 10%
      arbMinSpread: config.arbMinSpread ?? 0.03,
      mispricingMin: config.mispricingMin ?? 0.02,
      weatherMinPrice: config.weatherMinPrice ?? 0.05,
      weatherMaxPrice: config.weatherMaxPrice ?? 0.15,
      weatherMinEdge: config.weatherMinEdge ?? 0.2,
    };
  }

  /**
   * Scan markets for profitable opportunities
   */
  scanMarkets(markets: Market[]): Opportunity[] {
    return this.scanMarketsWithDiagnostics(markets).opportunities;
  }

  scanMarketsWithDiagnostics(markets: Market[]): ScanResult {
    const opportunities: Opportunity[] = [];
    const diagnostics = this.createEmptyDiagnostics();

    for (const market of markets) {
      diagnostics.marketsAnalyzed += 1;

      const marketEligibility = this.evaluateMarketRequirements(market);
      if (!marketEligibility.passed) {
        if (!marketEligibility.meetsVolume) {
          diagnostics.rejectedByVolume += 1;
        }

        if (!marketEligibility.meetsLiquidity) {
          diagnostics.rejectedByLiquidity += 1;
        }

        continue;
      }

      diagnostics.marketsPassedFilters += 1;

      // Strategy 1: Weather markets (structured inefficiency)
      if (this.isWeatherMarket(market)) {
        diagnostics.weatherMarkets += 1;
        const weatherAnalysis = this.analyzeWeatherMarket(market);

        if (weatherAnalysis.opportunity) {
          diagnostics.weatherOpportunities += 1;
          opportunities.push(weatherAnalysis.opportunity);
        } else if (weatherAnalysis.reason === "price-window") {
          diagnostics.weatherRejectedPriceWindow += 1;
        } else if (weatherAnalysis.reason === "edge") {
          diagnostics.weatherRejectedEdge += 1;
        }
      }

      // Strategy 2: Combinatorial arbitrage (YES+NO != 1)
      const arbAnalysis = this.detectCombinatorialArbitrage(market);
      if (market.outcomes.length === 2) {
        diagnostics.arbBinaryMarkets += 1;
      }

      if (
        arbAnalysis.opportunity &&
        arbAnalysis.opportunity.roi >= this.config.minExpectedROI
      ) {
        diagnostics.arbOpportunities += 1;
        opportunities.push(arbAnalysis.opportunity);
      } else if (arbAnalysis.reason === "spread") {
        diagnostics.arbRejectedSpread += 1;
      }

      // Strategy 3: Standard mispricing detection
      for (const outcome of market.outcomes) {
        diagnostics.standardOutcomesAnalyzed += 1;
        const outcomeAnalysis = this.analyzeOutcome(market, outcome);

        if (outcomeAnalysis.opportunity) {
          diagnostics.standardOpportunities += 1;
          opportunities.push(outcomeAnalysis.opportunity);
        } else if (outcomeAnalysis.reason === "invalid-price") {
          diagnostics.standardRejectedInvalidPrice += 1;
        } else if (outcomeAnalysis.reason === "probability-range") {
          diagnostics.standardRejectedProbabilityRange += 1;
        } else if (outcomeAnalysis.reason === "min-difference") {
          diagnostics.standardRejectedMinDifference += 1;
        } else if (outcomeAnalysis.reason === "min-roi") {
          diagnostics.standardRejectedMinROI += 1;
        }
      }
    }

    return {
      opportunities: opportunities.toSorted((a, b) => b.roi - a.roi),
      diagnostics,
    };
  }

  /**
   * Detect if market is weather-related (key inefficiency source)
   */
  private isWeatherMarket(market: Market): boolean {
    const questionLower = (market.question || "").toLowerCase();

    if (
      NON_WEATHER_KEYWORDS.some((keyword) => questionLower.includes(keyword))
    ) {
      return false;
    }

    return WEATHER_KEYWORDS.some((keyword) => questionLower.includes(keyword));
  }

  /**
   * Analyze weather markets with NOAA-style probability inference
   */
  private analyzeWeatherMarket(market: Market): {
    opportunity: Opportunity | null;
    reason: "price-window" | "edge" | null;
  } {
    // For weather markets, look for extreme mispricings
    // Retail traders often misprice weather outcomes
    const outcomes = market.outcomes || [];

    for (const outcome of outcomes) {
      const price = outcome.price || 0;

      // Weather inefficiencies: buckets priced <15% often have higher true probability
      if (
        price > this.config.weatherMinPrice &&
        price < this.config.weatherMaxPrice
      ) {
        const inferredProbability = this.estimateWeatherProbability(outcome);

        if (inferredProbability > price + this.config.weatherMinEdge) {
          return {
            opportunity: {
              marketId: market.id,
              question: market.question,
              outcome: outcome.name || "Unknown",
              currentPrice: price,
              expectedValue: inferredProbability,
              roi: (inferredProbability - price) / price,
              reasoning: `Weather market inefficiency: ${outcome.name} priced at ${(price * 100).toFixed(1)}% but estimated ${(inferredProbability * 100).toFixed(1)}% probability. Retail mispricing typical in weather markets.`,
              riskLevel: price < 0.1 ? "high" : "medium",
            },
            reason: null,
          };
        }
      }
    }

    const hasPriceWindowCandidate = outcomes.some(
      (outcome) =>
        outcome.price > this.config.weatherMinPrice &&
        outcome.price < this.config.weatherMaxPrice,
    );

    return {
      opportunity: null,
      reason: hasPriceWindowCandidate ? "edge" : "price-window",
    };
  }

  /**
   * Simple weather probability estimator
   * (In production, integrate real NOAA API)
   */
  private estimateWeatherProbability(outcome: { name: string }): number {
    const name = (outcome.name || "").toLowerCase();

    // Placeholder: In production, call NOAA API for actual forecasts
    // For now, apply heuristics for common weather buckets

    if (name.includes("above") || name.includes("over")) {
      return 0.55; // Average warm bias
    }
    if (name.includes("below") || name.includes("under")) {
      return 0.45; // Average cool bias
    }
    if (name.includes("rain") || name.includes("snow")) {
      return 0.35; // Precipitation less common
    }

    return 0.5; // Neutral estimate
  }

  /**
   * Detect combinatorial arbitrage: YES + NO != 1.0
   */
  private detectCombinatorialArbitrage(market: Market): {
    opportunity: Opportunity | null;
    reason: "shape" | "spread" | null;
  } {
    const outcomes = market.outcomes || [];

    // Look for binary yes/no pairs
    if (outcomes.length !== 2) {
      return { opportunity: null, reason: "shape" };
    }

    const prices = outcomes.map((o) => o.price || 0);
    const sum = prices.reduce((a, b) => a + b, 0);
    const spread = Math.abs(sum - 1);

    // Arbitrage opportunity if sum deviates from 1
    if (spread > this.config.arbMinSpread && spread <= this.config.maxSpread) {
      const overpriced = prices[0] > prices[1] ? 0 : 1;
      const underpriced = 1 - overpriced;

      // Profit = sell overpriced, buy underpriced, wait for convergence
      const arbProfit =
        spread / Math.max(prices[overpriced], prices[underpriced]);

      return {
        opportunity: {
          marketId: market.id,
          question: market.question,
          outcome: `Pair: ${outcomes[overpriced].name} + ${outcomes[underpriced].name}`,
          currentPrice: prices[overpriced],
          expectedValue: prices[overpriced] - spread / 2,
          roi: arbProfit,
          reasoning: `Combinatorial arbitrage detected: YES+NO sum is ${(sum * 100).toFixed(1)}% (should be 100%). Exploit by selling overpriced ${outcomes[overpriced].name} at ${(prices[overpriced] * 100).toFixed(1)}% and buying underpriced ${outcomes[underpriced].name} at ${(prices[underpriced] * 100).toFixed(1)}%. Converges to 1.0 at profit.`,
          riskLevel: "low",
        },
        reason: null,
      };
    }

    return { opportunity: null, reason: "spread" };
  }

  /**
   * Check if market meets minimum volume and liquidity requirements
   */
  private evaluateMarketRequirements(market: Market): {
    passed: boolean;
    meetsVolume: boolean;
    meetsLiquidity: boolean;
  } {
    const meetsVolume = market.volume24hr >= this.config.minVolume;
    const meetsLiquidity = market.liquidity >= this.config.minLiquidity;

    return {
      passed: meetsVolume && meetsLiquidity,
      meetsVolume,
      meetsLiquidity,
    };
  }

  /**
   * Analyze a specific outcome for profitability
   */
  private analyzeOutcome(
    market: Market,
    outcome: { name: string; price: number; probability: number },
  ): {
    opportunity: Opportunity | null;
    reason:
      | "invalid-price"
      | "probability-range"
      | "min-difference"
      | "min-roi"
      | null;
  } {
    const currentPrice = outcome.price || outcome.probability || 0;
    const probability = outcome.probability || outcome.price || 0;

    // Skip invalid prices
    if (currentPrice <= 0 || currentPrice >= 1) {
      return { opportunity: null, reason: "invalid-price" };
    }

    // Skip extreme probabilities
    if (probability < 0.01 || probability > 0.99) {
      return { opportunity: null, reason: "probability-range" };
    }

    // Calculate expected value (mispricing opportunity)
    const mispricing = Math.abs(probability - currentPrice);

    // Only consider if there's meaningful mispricing
    if (mispricing < this.config.mispricingMin) {
      return { opportunity: null, reason: "min-difference" };
    }

    const expectedValue =
      mispricing > 0 ? currentPrice + mispricing : currentPrice;
    const roi = mispricing / currentPrice;

    if (roi < this.config.minExpectedROI) {
      return { opportunity: null, reason: "min-roi" };
    }

    // Determine risk level based on probability extremes
    let riskLevel: "low" | "medium" | "high" = "medium";
    if (probability > 0.7 || probability < 0.3) riskLevel = "low";
    if (probability > 0.9 || probability < 0.1) riskLevel = "high";

    return {
      opportunity: {
        marketId: market.id,
        question: market.question,
        outcome: outcome.name || "Unknown",
        currentPrice,
        expectedValue,
        roi,
        reasoning: this.generateReasoning(
          currentPrice,
          probability,
          market.liquidity,
        ),
        riskLevel,
      },
      reason: null,
    };
  }

  private createEmptyDiagnostics(): ScanDiagnostics {
    return {
      marketsAnalyzed: 0,
      marketsPassedFilters: 0,
      rejectedByVolume: 0,
      rejectedByLiquidity: 0,
      weatherMarkets: 0,
      weatherOpportunities: 0,
      weatherRejectedPriceWindow: 0,
      weatherRejectedEdge: 0,
      arbBinaryMarkets: 0,
      arbOpportunities: 0,
      arbRejectedSpread: 0,
      standardOutcomesAnalyzed: 0,
      standardOpportunities: 0,
      standardRejectedInvalidPrice: 0,
      standardRejectedProbabilityRange: 0,
      standardRejectedMinDifference: 0,
      standardRejectedMinROI: 0,
    };
  }

  /**
   * Generate human-readable reasoning for an opportunity
   */
  private generateReasoning(
    price: number,
    probability: number,
    liquidity: number,
  ): string {
    const mispricing = Math.abs(probability - price) * 100;
    const liquidityStatus = liquidity > 10000 ? "high" : "moderate";

    return `Market is pricing this at ${(price * 100).toFixed(1)}% but implied probability is ${(probability * 100).toFixed(1)}% (${mispricing.toFixed(1)}% spread). ${liquidityStatus} liquidity available.`;
  }
}
