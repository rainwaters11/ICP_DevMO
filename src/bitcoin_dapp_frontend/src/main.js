import App from './App';
import './index.scss';
import { idlFactory as bitcoinDappIdl } from 'declarations/bitcoin_dapp/bitcoin_dapp.did.js';
import { idlFactory as backendIdl } from 'declarations/bitcoin_dapp_backend/bitcoin_dapp_backend.did.js';
import { Actor, HttpAgent } from "@dfinity/agent";

// Create a new agent with the proper configuration for IC API v2
const agent = new HttpAgent({ 
  host: 'http://127.0.0.1:8000',
  verifyQuerySignatures: false // Required for local development
});

// When developing locally, we need to fetch the root key
if (process.env.NODE_ENV !== "production") {
  agent.fetchRootKey().catch(err => {
    console.warn("Unable to fetch root key. Check to ensure that your local replica is running");
    console.error(err);
  });
}

// Get the latest canister IDs from dfx
const bitcoinDappCanisterId = 'bkyz2-fmaaa-aaaaa-qaaaq-cai';
const backendCanisterId = 'bd3sg-teaaa-aaaaa-qaaba-cai';

console.log("Using canister IDs:", {
  bitcoinDapp: bitcoinDappCanisterId,
  backend: backendCanisterId
});

try {
  // Create actors directly
  window.bitcoin_dapp = Actor.createActor(bitcoinDappIdl, {
    agent,
    canisterId: bitcoinDappCanisterId
  });
  
  window.bitcoin_dapp_backend = Actor.createActor(backendIdl, {
    agent,
    canisterId: backendCanisterId
  });
  
  console.log("Successfully created canister actors");
  
  // Test the connection immediately
  window.bitcoin_dapp.getBitcoinAddress()
    .then(address => {
      console.log("Bitcoin address retrieved successfully:", address);
    })
    .catch(err => {
      console.error("Failed to get Bitcoin address:", err);
      setupMockActors();
    });
} catch (error) {
  console.error("Error creating canister actors:", error);
  setupMockActors();
}

// Setup mock actors if real ones fail
function setupMockActors() {
  console.warn("Setting up mock actors due to connection issues");
  window.bitcoin_dapp = {
    getBitcoinAddress: async () => "Mock Bitcoin Address (bcrt1quqrw3nyqyzcsf48aqrfnnctld0uxdjke8k6e5j)",
    getBalance: async () => 123456789,
    getMockBalance: async () => 123456789,
    formatBTC: async (sats) => "1.23456789 BTC"
  };
  
  window.bitcoin_dapp_backend = {
    greet: async (name) => `Hello, ${name}! (Mock response)`
  };
}

const app = new App();
