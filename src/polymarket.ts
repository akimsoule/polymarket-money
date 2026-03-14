import axios from 'axios';
import type { Market } from './types.js';

// Polymarket API endpoints
const POLYMARKET_API = 'https://gamma-api.polymarket.com';

export class PolymarketClient {
  private apiKey: string | null;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || null;
  }

  /**
   * Fetch all active markets from Polymarket
   */
  async getMarkets(limit: number = 100): Promise<Market[]> {
    try {
      const response = await axios.get(`${POLYMARKET_API}/markets`, {
        params: { limit, active: true },
        timeout: 10000,
      });
      
      // Handle both array and paginated responses
      const data = Array.isArray(response.data) ? response.data : response.data.data || response.data.markets || [];
      
      if (!Array.isArray(data)) {
        console.warn('Unexpected API response format');
        return [];
      }

      return data.map(this.normalizeMarket);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('API Error:', error.message);
      } else {
        console.error('Failed to fetch markets:', error);
      }
      return [];
    }
  }

  /**
   * Fetch a specific market by ID
   */
  async getMarket(marketId: string): Promise<Market | null> {
    try {
      const response = await axios.get(`${POLYMARKET_API}/markets/${marketId}`, {
        timeout: 10000,
      });
      return this.normalizeMarket(response.data);
    } catch (error) {
      console.error(`Failed to fetch market ${marketId}:`, error);
      return null;
    }
  }

  /**
   * Search markets by keyword
   */
  async searchMarkets(query: string): Promise<Market[]> {
    try {
      const response = await axios.get(`${POLYMARKET_API}/markets`, {
        params: { search: query, active: true },
        timeout: 10000,
      });

      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      return data.map(this.normalizeMarket);
    } catch (error) {
      console.error('Failed to search markets:', error);
      return [];
    }
  }

  /**
   * Normalize market data from API to standard format
   */
  private normalizeMarket(market: any): Market {
    return {
      id: market.id || market.marketId || '',
      question: market.question || market.title || '',
      outcomes: market.outcomes || market.tokens || [],
      volume24hr: market.volume24hr || market.volume || 0,
      liquidity: market.liquidity || market.liquidityPool || 0,
      createdAt: market.createdAt || market.created_at || new Date().toISOString(),
      expiresAt: market.expiresAt || market.endTime || market.maturationTime || new Date().toISOString(),
    };
  }
}
