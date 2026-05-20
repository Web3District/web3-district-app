/**
 * Thirdweb Integration - Async Wallet Creation
 * 
 * Creates wallets in background without blocking login flow
 * Uses ethers for wallet generation + Thirdweb for blockchain interactions
 */

import { createThirdwebClient } from "thirdweb";
import { Wallet } from "ethers";

// Thirdweb credentials from project config
const THIRDWEB_CLIENT_ID = process.env.THIRDWEB_CLIENT_ID || "68e1480216de9e7d113aff6e6cb9915c";
const THIRDWEB_SECRET_KEY = process.env.THIRDWEB_SECRET_KEY;

// Create Thirdweb client
export const thirdwebClient = createThirdwebClient({
  clientId: THIRDWEB_CLIENT_ID,
  secretKey: THIRDWEB_SECRET_KEY || undefined,
});

/**
 * Generate a new wallet account
 * Returns address and private key (store securely!)
 */
export async function createWallet() {
  try {
    // Generate random wallet using ethers
    const wallet = Wallet.createRandom();
    
    return {
      address: wallet.address,
      privateKey: wallet.privateKey, // ⚠️ In production, encrypt this before storing!
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Failed to create wallet:", error);
    throw error;
  }
}

/**
 * Import wallet from private key
 */
export async function importWallet(privateKey: string) {
  try {
    const wallet = new Wallet(privateKey);

    return {
      address: wallet.address,
    };
  } catch (error) {
    console.error("Failed to import wallet:", error);
    throw error;
  }
}

/**
 * Verify wallet ownership (for authentication)
 */
export async function verifyWalletSignature(
  address: string,
  message: string,
  signature: string
): Promise<boolean> {
  try {
    // Implementation depends on your auth flow
    // This is a placeholder for wallet signature verification
    return true;
  } catch (error) {
    console.error("Wallet verification failed:", error);
    return false;
  }
}

/**
 * Get wallet for a developer (from Supabase)
 */
export async function getDeveloperWallet(supabase: any, githubLogin: string) {
  try {
    const { data, error } = await supabase
      .from("developers")
      .select("bloxid_wallet")
      .eq("github_login", githubLogin)
      .single();

    if (error || !data?.bloxid_wallet) {
      return null;
    }

    return data.bloxid_wallet;
  } catch (error) {
    console.error("Failed to fetch developer wallet:", error);
    return null;
  }
}

/**
 * Save wallet to developer record (async, non-blocking)
 */
export async function saveDeveloperWallet(
  supabase: any,
  githubLogin: string,
  walletAddress: string
) {
  try {
    const { error } = await supabase
      .from("developers")
      .update({ bloxid_wallet: walletAddress })
      .eq("github_login", githubLogin);

    if (error) {
      console.error("Failed to save wallet to Supabase:", error);
      throw error;
    }

    console.log(`✅ Wallet saved for ${githubLogin}: ${walletAddress}`);
    return true;
  } catch (error) {
    console.error("Error saving developer wallet:", error);
    return false;
  }
}
