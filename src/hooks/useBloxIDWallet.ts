/**
 * useBloxIDWallet Hook
 * 
 * Creates Thirdweb wallet in background AFTER login completes
 * Non-blocking - runs in useEffect after render
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { createWallet, saveDeveloperWallet, getDeveloperWallet } from "@/lib/thirdweb";

interface WalletState {
  address: string | null;
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
}

export function useBloxIDWallet(githubLogin: string | undefined) {
  const supabase = useSupabase();
  const [state, setState] = useState<WalletState>({
    address: null,
    isLoading: true,
    isCreating: false,
    error: null,
  });

  // Fetch existing wallet on mount
  useEffect(() => {
    if (!githubLogin || !supabase) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    let mounted = true;

    const fetchWallet = async () => {
      try {
        const address = await getDeveloperWallet(supabase, githubLogin);
        if (mounted) {
          setState({
            address: address || null,
            isLoading: false,
            isCreating: false,
            error: null,
          });
        }
      } catch (error) {
        console.error("Failed to fetch wallet:", error);
        if (mounted) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: "Failed to load wallet",
          }));
        }
      }
    };

    fetchWallet();

    return () => {
      mounted = false;
    };
  }, [githubLogin, supabase]);

  // Create wallet in background (non-blocking)
  const createWalletAsync = useCallback(async () => {
    if (!githubLogin || !supabase || state.address) {
      return;
    }

    setState((prev) => ({ ...prev, isCreating: true }));

    try {
      // Fire-and-forget pattern - don't await in login flow
      const wallet = await createWallet();
      
      const saved = await saveDeveloperWallet(supabase, githubLogin, wallet.address);
      
      if (saved) {
        setState((prev) => ({
          ...prev,
          address: wallet.address,
          isCreating: false,
          error: null,
        }));
        
        // Dispatch event for UI to update (badge appears on next render)
        window.dispatchEvent(new CustomEvent("bloxid-wallet-created", {
          detail: { address: wallet.address },
        }));
      }
    } catch (error) {
      console.error("Background wallet creation failed:", error);
      setState((prev) => ({
        ...prev,
        isCreating: false,
        error: error instanceof Error ? error.message : "Wallet creation failed",
      }));
      // Silent fail - will retry on next login
    }
  }, [githubLogin, supabase, state.address]);

  // Auto-create wallet if user doesn't have one
  useEffect(() => {
    if (githubLogin && !state.address && !state.isCreating && !state.isLoading) {
      createWalletAsync();
    }
  }, [githubLogin, state.address, state.isCreating, state.isLoading, createWalletAsync]);

  return {
    ...state,
    createWalletAsync,
  };
}

/**
 * Hook for components to check wallet status
 */
export function useWalletStatus() {
  const [hasWallet, setHasWallet] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    const handleWalletCreated = (event: CustomEvent<{ address: string }>) => {
      setHasWallet(true);
      setWalletAddress(event.detail.address);
    };

    window.addEventListener("bloxid-wallet-created", handleWalletCreated as EventListener);

    return () => {
      window.removeEventListener("bloxid-wallet-created", handleWalletCreated as EventListener);
    };
  }, []);

  return { hasWallet, walletAddress };
}
