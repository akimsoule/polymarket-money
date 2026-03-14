import axios from "axios";
import type { Market, Outcome } from "./types.js";

// Polymarket API endpoints
const POLYMARKET_API = "https://gamma-api.polymarket.com";
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 300;

type UnknownRecord = Record<string, unknown>;

export class PolymarketClient {
  /**
   * Fetch all active markets from Polymarket
   */
  async getMarkets(limit: number = 100): Promise<Market[]> {
    try {
      const data = await this.fetchWithRetry(`${POLYMARKET_API}/markets`, {
        params: { limit, active: true, closed: false },
      });

      // Handle both array and paginated responses
      const markets = this.extractMarketsList(data);

      if (!markets) {
        console.warn("Unexpected API response format");
        return [];
      }

      return markets.map((market) => this.normalizeMarket(market));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("API Error:", error.message);
      } else {
        console.error("Failed to fetch markets:", error);
      }
      return [];
    }
  }

  /**
   * Fetch a specific market by ID
   */
  async getMarket(marketId: string): Promise<Market | null> {
    try {
      const data = await this.fetchWithRetry(
        `${POLYMARKET_API}/markets/${marketId}`,
      );
      return this.normalizeMarket(data);
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
      const data = await this.fetchWithRetry(`${POLYMARKET_API}/markets`, {
        params: { search: query, active: true, closed: false },
      });

      const markets = this.extractMarketsList(data);
      return markets
        ? markets.map((market) => this.normalizeMarket(market))
        : [];
    } catch (error) {
      console.error("Failed to search markets:", error);
      return [];
    }
  }

  /**
   * Normalize market data from API to standard format
   */
  private normalizeMarket(market: unknown): Market {
    const marketRecord = this.asRecord(market) ?? {};

    return {
      id:
        this.toStringValue(marketRecord.id) ||
        this.toStringValue(marketRecord.marketId) ||
        "",
      question:
        this.toStringValue(marketRecord.question) ||
        this.toStringValue(marketRecord.title) ||
        "",
      outcomes: this.parseOutcomes(
        marketRecord.outcomes ?? marketRecord.tokens,
        marketRecord.outcomePrices,
      ),
      volume24hr:
        this.toNumber(marketRecord.volume24hr) ??
        this.toNumber(marketRecord.volume) ??
        0,
      liquidity:
        this.toNumber(marketRecord.liquidity) ??
        this.toNumber(marketRecord.liquidityPool) ??
        0,
      createdAt:
        this.toStringValue(marketRecord.createdAt) ||
        this.toStringValue(marketRecord.created_at) ||
        new Date().toISOString(),
      expiresAt:
        this.toStringValue(marketRecord.expiresAt) ||
        this.toStringValue(marketRecord.endTime) ||
        this.toStringValue(marketRecord.maturationTime) ||
        new Date().toISOString(),
    };
  }

  private async fetchWithRetry(
    url: string,
    options?: { params?: Record<string, string | number | boolean> },
  ): Promise<unknown> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
      try {
        const response = await axios.get(url, {
          params: options?.params,
          timeout: REQUEST_TIMEOUT_MS,
        });
        return response.data;
      } catch (error) {
        lastError = error;
        const shouldRetry = this.isRetryableError(error);

        if (!shouldRetry || attempt === MAX_RETRIES) {
          throw error;
        }

        const delayMs = RETRY_BASE_DELAY_MS * attempt;
        await this.sleep(delayMs);
      }
    }

    throw lastError;
  }

  private isRetryableError(error: unknown): boolean {
    if (!axios.isAxiosError(error)) {
      return false;
    }

    const status = error.response?.status;
    if (!status) {
      return true;
    }

    return status >= 500 || status === 429;
  }

  private extractMarketsList(data: unknown): unknown[] | null {
    if (Array.isArray(data)) {
      return data;
    }

    const dataRecord = this.asRecord(data);
    if (!dataRecord) {
      return null;
    }

    if (Array.isArray(dataRecord.data)) {
      return dataRecord.data;
    }

    if (Array.isArray(dataRecord.markets)) {
      return dataRecord.markets;
    }

    return null;
  }

  private parseOutcomes(outcomes: unknown, outcomePrices: unknown): Outcome[] {
    const parsedOutcomes = this.parseMaybeJsonArray(outcomes);
    if (!parsedOutcomes) {
      return [];
    }

    const parsedPrices = this.parseMaybeJsonArray(outcomePrices);

    // Gamma often returns outcomes/outcomePrices as JSON-encoded string arrays.
    if (parsedOutcomes.every((item) => typeof item === "string")) {
      return parsedOutcomes.map((item, index) => {
        const name = this.toStringValue(item) || `Outcome ${index + 1}`;
        const price = this.toNumber(parsedPrices?.[index]) ?? 0;

        return {
          name,
          price,
          probability: price,
        };
      });
    }

    return parsedOutcomes.map((outcome, index) => {
      const outcomeRecord = this.asRecord(outcome);
      const name =
        this.toStringValue(outcomeRecord?.name) ||
        this.toStringValue(outcomeRecord?.title) ||
        `Outcome ${index + 1}`;
      const price =
        this.toNumber(outcomeRecord?.price) ??
        this.toNumber(parsedPrices?.[index]) ??
        this.toNumber(outcomeRecord?.probability) ??
        0;
      const probability = this.toNumber(outcomeRecord?.probability) ?? price;

      return {
        name,
        price,
        probability,
      };
    });
  }

  private asRecord(value: unknown): UnknownRecord | null {
    if (typeof value !== "object" || value === null) {
      return null;
    }

    return value as UnknownRecord;
  }

  private parseMaybeJsonArray(value: unknown): unknown[] | null {
    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value !== "string") {
      return null;
    }

    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  private toNumber(value: unknown): number | null {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string") {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
  }

  private toStringValue(value: unknown): string | null {
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }

    return null;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
