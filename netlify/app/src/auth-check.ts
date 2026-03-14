import "dotenv/config";
import { ClobClient } from "@polymarket/clob-client";
import { Wallet } from "ethers";

const CLOB_HOST =
  process.env.POLYMARKET_CLOB_HOST || "https://clob.polymarket.com";
const CHAIN_ID = Number(process.env.POLYMARKET_CHAIN_ID || 137);

function getPrivateKey(): string {
  const configuredPrivateKey = process.env.POLYMARKET_PRIVATE_KEY;
  if (configuredPrivateKey) {
    return configuredPrivateKey;
  }

  throw new Error("Missing POLYMARKET_PRIVATE_KEY.");
}

function maskValue(
  value: string,
  visibleStart: number = 6,
  visibleEnd: number = 4,
): string {
  if (value.length <= visibleStart + visibleEnd) {
    return value;
  }

  return `${value.slice(0, visibleStart)}...${value.slice(-visibleEnd)}`;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return JSON.stringify(error);
}

async function runAuthCheck(): Promise<void> {
  const privateKey = getPrivateKey();
  const signer = new Wallet(privateKey);

  console.log("Checking Polymarket CLOB authentication...");
  console.log(`Host: ${CLOB_HOST}`);
  console.log(`Chain ID: ${CHAIN_ID}`);
  console.log(`Signer: ${signer.address}`);

  const l1Client = new ClobClient(CLOB_HOST, CHAIN_ID, signer);
  const credentials = await l1Client.createOrDeriveApiKey();

  const l2Client = new ClobClient(
    CLOB_HOST,
    CHAIN_ID,
    signer,
    credentials,
    0,
    signer.address,
  );

  const apiKeys = await l2Client.getApiKeys();

  console.log("Auth check succeeded.");
  console.log(`Derived API key: ${maskValue(credentials.key)}`);
  console.log(`Readable API keys count: ${apiKeys.apiKeys.length}`);
}

try {
  await runAuthCheck();
} catch (error) {
  console.error(`Auth check failed: ${getErrorMessage(error)}`);
  process.exitCode = 1;
}
