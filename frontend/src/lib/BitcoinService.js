import { Actor, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { idlFactory } from "../../../src/declarations/bitcoin_dapp/bitcoin_dapp.did.js";

// Create an agent and actor instance for interacting with the Bitcoin canister
export class BitcoinService {
  constructor() {
    // Create an agent - use the local replica in development
    // For production, use a different host (e.g., ic0.app)
    const isLocal = import.meta.env.MODE !== "production";
    const host = import.meta.env.VITE_HOST || (isLocal ? "http://127.0.0.1:8000" : "https://ic0.app");
    
    console.log("Connecting to IC host:", host);
    
    this.agent = new HttpAgent({ 
      host,
      verifyQuerySignatures: !isLocal // Only disable for local development
    });
    
    // Only for local development - fetch root key
    if (isLocal) {
      console.log("Fetching root key for local development");
      this.agent.fetchRootKey().catch(e => {
        console.warn("Unable to fetch root key. Check to ensure that your local replica is running");
        console.error(e);
      });
    }
    
    // Get canister ID from environment or use correct default
    let canisterId = import.meta.env.VITE_CANISTER_ID_BITCOIN_DAPP;
    
    // If no environment variable is set, use the default ID based on environment
    if (!canisterId) {
      canisterId = isLocal ? "bkyz2-fmaaa-aaaaa-qaaaq-cai" : "cjrjj-3yaaa-aaaai-athdq-cai"; // Updated to use the actual production canister ID
    }
    
    // Strip any quotation marks that might be included in the environment variable
    canisterId = canisterId.replace(/['"]/g, '');
    
    console.log("Using Bitcoin dapp canister ID:", canisterId);
    
    // Create actor
    try {
      this.actor = Actor.createActor(idlFactory, {
        agent: this.agent,
        canisterId,
      });
      console.log("Actor created successfully");
      this.useMockData = false;
    } catch (error) {
      console.error("Failed to create actor:", error);
      this.useMockData = true; // Use mock data if actor creation fails
    }
  }

  // Register user and get Bitcoin address
  async registerUser() {
    try {
      if (this.useMockData) {
        console.log("Using mock data (Bitcoin API unavailable)");
        return "bcrt1qsample9address0for0demonstration0purposes0only";
      }
      
      // Check if the user already has an address
      const existingAddress = await this.getUserAddress();
      if (existingAddress && existingAddress !== null) {
        console.log("User already has address:", existingAddress);
        return existingAddress;
      }
      
      // If not, register to get a new address
      console.log("Registering user for new Bitcoin address");
      const address = await this.actor.registerUser();
      console.log("New address registered:", address);
      return address;
    } catch (error) {
      console.error("Error registering user:", error);
      this.useMockData = true;
      return "bcrt1qsample9address0for0demonstration0purposes0only";
    }
  }

  // Get user's Bitcoin address if already registered
  async getUserAddress() {
    try {
      if (this.useMockData) {
        console.log("Using mock data (Bitcoin API unavailable)");
        return "bcrt1qsample9address0for0demonstration0purposes0only";
      }
      
      console.log("Getting user's Bitcoin address");
      const addressOpt = await this.actor.getUserAddress();
      
      // Handle null case from backend (opt variant)
      if (addressOpt === null || addressOpt.length === 0) {
        console.log("No address registered for this user yet");
        return null;
      }
      
      console.log("User address retrieved:", addressOpt);
      return addressOpt;
    } catch (error) {
      console.error("Error getting user address:", error);
      // Don't set useMockData here as we might still want to try registering
      return null;
    }
  }

  // Get Bitcoin balance for the user
  async getBalance(network = "regtest") {
    try {
      if (this.useMockData) {
        console.log("Using mock data (Bitcoin API unavailable)");
        return {
          satoshis: 5000000,
          btc: "0.05000000",
          formatted: "0.05000000 BTC"
        };
      }
      // For mainnet deployment, change default to "mainnet"
      const balance = await this.actor.getBalance(network);
      // Format balance for display
      const btcAmount = Number(balance) / 100_000_000;
      return {
        satoshis: balance,
        btc: btcAmount.toFixed(8),
        formatted: `${btcAmount.toFixed(8)} BTC`
      };
    } catch (error) {
      console.error("Error getting balance:", error);
      this.useMockData = true;
      return {
        satoshis: 5000000,
        btc: "0.05000000",
        formatted: "0.05000000 BTC"
      };
    }
  }

  // Get transaction history
  async getTransactionHistory(network = "regtest") {
    try {
      if (this.useMockData) {
        console.log("Using mock data (Bitcoin API unavailable)");
        return [
          {
            txid: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
            height: 100,
            value: 2000000,
            btc: "0.02000000",
            formattedValue: "0.02000000 BTC"
          },
          {
            txid: "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789",
            height: 95,
            value: 3000000,
            btc: "0.03000000",
            formattedValue: "0.03000000 BTC"
          }
        ];
      }
      
      const transactions = await this.actor.getTransactionHistory(network);
      
      // Format the transactions for display
      return transactions.map(tx => ({
        txid: tx.txid,
        height: Number(tx.height),
        value: Number(tx.value),
        btc: (Number(tx.value) / 100_000_000).toFixed(8),
        formattedValue: `${(Number(tx.value) / 100_000_000).toFixed(8)} BTC`
      }));
    } catch (error) {
      console.error("Error getting transaction history:", error);
      this.useMockData = true;
      return [
        {
          txid: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
          height: 100,
          value: 2000000,
          btc: "0.02000000",
          formattedValue: "0.02000000 BTC"
        },
        {
          txid: "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789",
          height: 95,
          value: 3000000,
          btc: "0.03000000",
          formattedValue: "0.03000000 BTC"
        }
      ];
    }
  }

  // Get fee estimates
  async getRecommendedFees() {
    try {
      if (this.useMockData) {
        console.log("Using mock data (Bitcoin API unavailable)");
        return {
          slow: 1,
          medium: 5, 
          fast: 20
        };
      }
      
      return await this.actor.getRecommendedFees();
    } catch (error) {
      console.error("Error getting recommended fees:", error);
      this.useMockData = true;
      return {
        slow: 1,
        medium: 5, 
        fast: 20
      };
    }
  }

  // Estimate transaction fee
  async estimateTransactionFee(satsPerByte, txSize = null) {
    try {
      if (this.useMockData) {
        console.log("Using mock data (Bitcoin API unavailable)");
        const fee = satsPerByte * (txSize || 250);
        return {
          satoshis: fee,
          btc: (fee / 100_000_000).toFixed(8)
        };
      }
      
      // For optional parameters, we need to format them correctly for Candid
      const txSizeOpt = txSize === null ? [] : [BigInt(txSize)];
      
      const fee = await this.actor.estimateTransactionFee(BigInt(satsPerByte), txSizeOpt);
      return {
        satoshis: fee,
        btc: (Number(fee) / 100_000_000).toFixed(8)
      };
    } catch (error) {
      console.error("Error estimating fee:", error);
      this.useMockData = true;
      const fee = satsPerByte * (txSize || 250);
      return {
        satoshis: fee,
        btc: (fee / 100_000_000).toFixed(8)
      };
    }
  }
}

// Create and export a singleton instance
export const bitcoinService = new BitcoinService();
export default bitcoinService;