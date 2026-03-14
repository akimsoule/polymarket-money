export interface Market {
  id: string;
  question: string;
  outcomes: Outcome[];
  volume24hr: number;
  liquidity: number;
  createdAt: string;
  expiresAt: string;
}

export interface Outcome {
  name: string;
  price: number;
  probability: number;
}

export interface Opportunity {
  marketId: string;
  question: string;
  outcome: string;
  currentPrice: number;
  expectedValue: number;
  roi: number;
  reasoning: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface ScannerConfig {
  minVolume: number;
  minLiquidity: number;
  minExpectedROI: number;
  maxSpread: number;
}
