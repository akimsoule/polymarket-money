export interface Opportunity {
  marketId: string;
  question: string;
  outcome: string;
  currentPrice: number;
  expectedValue: number;
  roi: number;
  reasoning: string;
  riskLevel: "low" | "medium" | "high";
}

export interface ScanDiagnostics {
  marketsAnalyzed: number;
  marketsPassedFilters: number;
  rejectedByVolume: number;
  rejectedByLiquidity: number;
  weatherMarkets: number;
  weatherOpportunities: number;
  weatherRejectedPriceWindow: number;
  weatherRejectedEdge: number;
  arbBinaryMarkets: number;
  arbOpportunities: number;
  arbRejectedSpread: number;
  standardOutcomesAnalyzed: number;
  standardOpportunities: number;
  standardRejectedInvalidPrice: number;
  standardRejectedProbabilityRange: number;
  standardRejectedMinDifference: number;
  standardRejectedMinROI: number;
}

export interface ScannerConfig {
  minVolume: number;
  minLiquidity: number;
  minExpectedROI: number;
  maxSpread: number;
  arbMinSpread: number;
  mispricingMin: number;
  weatherMinPrice: number;
  weatherMaxPrice: number;
  weatherMinEdge: number;
}

export interface ScanApiResponse {
  marketsCount: number;
  diagnostics: ScanDiagnostics;
  opportunities: Opportunity[];
  totalOpportunities: number;
  config: ScannerConfig;
  generatedAt: string;
  blobKey?: string | null;
}
