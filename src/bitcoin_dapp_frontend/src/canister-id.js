/**
 * Canister IDs for both local and production environments
 */

export const canisterIds = {
  bitcoin_dapp: {
    local: 'bkyz2-fmaaa-aaaaa-qaaaq-cai',
    ic: 'cjrjj-3yaaa-aaaai-athdq-cai'
  },
  bitcoin_dapp_backend: {
    local: 'bd3sg-teaaa-aaaaa-qaaba-cai',
    ic: 'de7nh-uqaaa-aaaai-athea-cai'
  },
  bitcoin_dapp_frontend: {
    local: 'be2us-64aaa-aaaaa-qaabq-cai',
    ic: 'dd6lt-ziaaa-aaaai-atheq-cai'
  }
};

// Detect if we're running on the IC by checking the hostname
export const isProduction = typeof window !== 'undefined' && 
  (window.location.hostname.endsWith('.ic0.app') || 
   window.location.hostname.endsWith('.icp0.io') ||
   window.location.hostname.endsWith('.raw.ic0.app'));

// Dynamically determine the host based on the current domain
function determineHost() {
  if (typeof window === 'undefined') {
    return "http://127.0.0.1:8000"; // Default for server-side rendering
  }
  
  const hostname = window.location.hostname;
  
  // Local development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return "http://127.0.0.1:8000";
  }
  
  // Production - determine which boundary node we're on
  if (hostname.endsWith('.ic0.app')) {
    return "https://ic0.app";
  } else if (hostname.endsWith('.icp0.io')) {
    return "https://icp0.io";
  } else if (hostname.endsWith('.raw.ic0.app')) {
    return "https://raw.ic0.app";
  }
  
  // Default fallback
  return "https://icp0.io";
}

// Export specific canister IDs based on environment
export const bitcoinDappCanisterId = isProduction 
  ? canisterIds.bitcoin_dapp.ic 
  : canisterIds.bitcoin_dapp.local;

export const backendCanisterId = isProduction 
  ? canisterIds.bitcoin_dapp_backend.ic 
  : canisterIds.bitcoin_dapp_backend.local;

export const frontendCanisterId = isProduction 
  ? canisterIds.bitcoin_dapp_frontend.ic 
  : canisterIds.bitcoin_dapp_frontend.local;

// Get the appropriate host based on environment and current domain
export const host = determineHost();

// Export all for easy access
export default {
  canisterIds,
  isProduction,
  bitcoinDappCanisterId,
  backendCanisterId,
  frontendCanisterId,
  host
};