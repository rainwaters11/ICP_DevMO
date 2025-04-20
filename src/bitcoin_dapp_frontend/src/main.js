import App from './App';
import './index.scss';
import { 
  bitcoinDappCanisterId, 
  backendCanisterId, 
  frontendCanisterId, 
  host,
  isProduction 
} from './canister-id';

import { Actor, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";

// Set up canister interfaces
// Use static imports instead of dynamic imports for CSP compliance
import { idlFactory as bitcoinDappIdlFactory } from 'bitcoin_dapp_declarations/bitcoin_dapp.did.js';
import { idlFactory as backendIdlFactory } from 'bitcoin_dapp_backend_declarations/bitcoin_dapp_backend.did.js';
import { idlFactory as frontendIdlFactory } from 'bitcoin_dapp_frontend_declarations/bitcoin_dapp_frontend.did.js';

// Initialize application logic
async function initApp() {
  console.log("Environment:", isProduction ? "Production" : "Development");
  console.log("Using host:", host);
  console.log("Using canister IDs:", {
    bitcoinDapp: bitcoinDappCanisterId,
    backend: backendCanisterId,
    frontend: frontendCanisterId
  });
  
  // Create a new agent with the proper configuration
  const agent = new HttpAgent({ 
    host: host,
    verifyQuerySignatures: isProduction // Only disable for local development
  });
  
  // When developing locally, we need to fetch the root key
  if (!isProduction) {
    try {
      await agent.fetchRootKey();
    } catch (err) {
      console.warn("Unable to fetch root key. Check to ensure that your local replica is running");
      console.error(err);
    }
  }
  
  try {
    // Create actors directly
    window.bitcoin_dapp = Actor.createActor(bitcoinDappIdlFactory, {
      agent,
      canisterId: bitcoinDappCanisterId
    });
    
    window.bitcoin_dapp_backend = Actor.createActor(backendIdlFactory, {
      agent,
      canisterId: backendCanisterId
    });
    
    window.bitcoin_dapp_frontend = Actor.createActor(frontendIdlFactory, {
      agent,
      canisterId: frontendCanisterId
    });
    
    console.log("Successfully created canister actors");
    
    // Add a custom wrapper to handle principal errors for address generation
    const originalGenerateBitcoinAddress = window.bitcoin_dapp.generateBitcoinAddress;
    window.bitcoin_dapp.generateBitcoinAddress = async function(principal) {
      try {
        // Ensure we have a valid principal
        let validPrincipal;
        if (typeof principal === 'string') {
          try {
            validPrincipal = Principal.fromText(principal);
          } catch (err) {
            console.error("Invalid principal string:", principal);
            throw new Error("Invalid principal string provided");
          }
        } else {
          validPrincipal = principal;
        }
        
        console.log("Generating address for principal:", Principal.toText(validPrincipal));
        return await originalGenerateBitcoinAddress(validPrincipal);
      } catch (err) {
        console.error("Failed to generate Bitcoin address:", err);
        // Return a placeholder for frontend display
        return "error-generating-address";
      }
    };
    
    // Test the connection immediately
    try {
      const address = await window.bitcoin_dapp.getBitcoinAddress();
      console.log("Bitcoin address retrieved successfully:", address);
    } catch (err) {
      console.error("Failed to get Bitcoin address:", err);
      console.warn("Falling back to mock actors");
      setupMockActors();
    }
  } catch (error) {
    console.error("Error creating canister actors:", error);
    console.warn("Falling back to mock actors");
    setupMockActors();
  }
  
  // Setup debug helpers
  setupDebugHelpers(agent);
  
  // Initialize the application
  const app = new App();
  
  return app;
}

// Setup mock actors if real ones fail
function setupMockActors() {
  console.warn("Setting up mock actors due to connection issues");
  window.bitcoin_dapp = {
    getBitcoinAddress: async () => "Mock Bitcoin Address (bcrt1quqrw3nyqyzcsf48aqrfnnctld0uxdjke8k6e5j)",
    getBalance: async () => 123456789,
    getMockBalance: async () => 123456789,
    formatBTC: async (sats) => "1.23456789 BTC",
    generateBitcoinAddress: async (principal) => {
      console.log("Mock generating address for principal:", principal);
      return "mock-bcrt1q" + (principal ? Principal.toText(principal).substring(0, 10) : "fallback");
    },
    getUserAddress: async () => "Mock Bitcoin Address (bcrt1quqrw3nyqyzcsf48aqrfnnctld0uxdjke8k6e5j)",
    getTransactionHistory: async () => [
      { txid: "f7dc6ec0f9ec25b0f0d5afb97d45df3c5fc5471e39f3710f773b2b8aabbf55fd", height: 150000, value: 50_000_000 },
      { txid: "a9s8d76f9876a9s8d7f6a9s8d76fa9s8d76fa9s87d6fa9s8d76fa9s8d76f9as", height: 150100, value: 25_000_000 },
    ]
  };
  
  window.bitcoin_dapp_backend = {
    greet: async (name) => `Hello, ${name}! (Mock response)`
  };
  
  window.bitcoin_dapp_frontend = {
    status: async () => "Frontend Mock Status: OK"
  };
}

// Add debug helpers to window for easier canister interaction in the console
function setupDebugHelpers(agent) {
  window.debugICP = {
    getCanisterIds: () => ({
      bitcoinDapp: bitcoinDappCanisterId,
      backend: backendCanisterId,
      frontend: frontendCanisterId
    }),
    getEnvironment: () => ({
      isProduction: isProduction,
      host: host
    }),
    reloadActors: async () => {
      try {
        window.bitcoin_dapp = Actor.createActor(bitcoinDappIdlFactory, {
          agent,
          canisterId: bitcoinDappCanisterId
        });
        window.bitcoin_dapp_backend = Actor.createActor(backendIdlFactory, {
          agent,
          canisterId: backendCanisterId
        });
        window.bitcoin_dapp_frontend = Actor.createActor(frontendIdlFactory, {
          agent,
          canisterId: frontendCanisterId
        });
        console.log("Actors reloaded successfully");
        return true;
      } catch (error) {
        console.error("Failed to reload actors:", error);
        return false;
      }
    }
  };
}

// Start the application
initApp().catch(error => {
  console.error("Failed to initialize application:", error);
  setupMockActors();
  // Still create the app even if initialization fails
  new App();
});
