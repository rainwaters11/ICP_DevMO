<script>
  import { onMount } from 'svelte';
  import bitcoinService from './BitcoinService.js';

  // State variables
  let loading = true;
  let error = null;
  let address = null;
  let balance = null;
  let transactions = [];
  let fees = { slow: 1, medium: 5, fast: 20 };
  let estimatedFee = null;
  let selectedFeeRate = 5;
  let transactionSize = 250;
  let network = "regtest"; // Change to "mainnet" for production
  let registering = false;
  let transactionsLoading = false;

  // Initialize dashboard on component mount
  onMount(async () => {
    try {
      await initializeDashboard();
    } catch (err) {
      error = `Error initializing: ${err.message || err}`;
    } finally {
      loading = false;
    }
  });

  // Initialize user's Bitcoin dashboard
  async function initializeDashboard() {
    try {
      // Check if user has an address already
      const userAddress = await bitcoinService.getUserAddress();
      
      if (userAddress && userAddress.length) {
        address = userAddress;
        await Promise.all([
          loadBalance(),
          loadTransactions(),
          loadFeeEstimates()
        ]);
      }
    } catch (err) {
      console.error("Dashboard initialization error:", err);
      error = `Failed to initialize: ${err.message || err}`;
    }
  }

  // Register user and get Bitcoin address
  async function registerUser() {
    registering = true;
    error = null;
    
    try {
      address = await bitcoinService.registerUser();
      await Promise.all([
        loadBalance(),
        loadTransactions()
      ]);
    } catch (err) {
      console.error("Registration error:", err);
      error = `Failed to register: ${err.message || err}`;
    } finally {
      registering = false;
    }
  }

  // Load user's Bitcoin balance
  async function loadBalance() {
    try {
      balance = await bitcoinService.getBalance(network);
    } catch (err) {
      console.error("Balance loading error:", err);
      error = `Failed to load balance: ${err.message || err}`;
      balance = null;
    }
  }

  // Load transaction history
  async function loadTransactions() {
    transactionsLoading = true;
    try {
      transactions = await bitcoinService.getTransactionHistory(network);
    } catch (err) {
      console.error("Transaction loading error:", err);
      error = `Failed to load transactions: ${err.message || err}`;
      transactions = [];
    } finally {
      transactionsLoading = false;
    }
  }

  // Load fee estimates
  async function loadFeeEstimates() {
    try {
      fees = await bitcoinService.getRecommendedFees();
      updateFeeEstimate();
    } catch (err) {
      console.error("Fee loading error:", err);
    }
  }

  // Update fee estimate based on selected rate and transaction size
  async function updateFeeEstimate() {
    try {
      estimatedFee = await bitcoinService.estimateTransactionFee(selectedFeeRate, transactionSize);
    } catch (err) {
      console.error("Fee estimation error:", err);
    }
  }

  // Switch network and reload data
  async function switchNetwork(newNetwork) {
    network = newNetwork;
    await Promise.all([
      loadBalance(),
      loadTransactions(),
      loadFeeEstimates()
    ]);
  }

  // Watch for changes to fee related inputs
  $: if (selectedFeeRate && transactionSize) {
    updateFeeEstimate();
  }
</script>

<div class="bitcoin-dashboard">
  <h2>Bitcoin Dashboard</h2>
  
  {#if loading}
    <div class="loading">Loading your Bitcoin dashboard...</div>
  {:else if error}
    <div class="error">
      <p>{error}</p>
      <button on:click={() => { error = null; initializeDashboard(); }}>Retry</button>
    </div>
  {:else}
    <div class="network-selector">
      <label>
        Network:
        <select bind:value={network} on:change={() => switchNetwork(network)}>
          <option value="regtest">Regtest</option>
          <option value="testnet">Testnet</option>
          <option value="mainnet">Mainnet</option>
        </select>
      </label>
    </div>
    
    <div class="address-section">
      <h3>Your Bitcoin Address</h3>
      {#if address}
        <div class="address">
          <p>{address}</p>
        </div>
      {:else}
        <button class="register-btn" on:click={registerUser} disabled={registering}>
          {registering ? 'Registering...' : 'Register for a Bitcoin Address'}
        </button>
      {/if}
    </div>

    {#if address}
      <div class="balance-section">
        <h3>Balance</h3>
        <button class="refresh-btn" on:click={loadBalance}>↻</button>
        {#if balance}
          <div class="balance">
            <p class="balance-amount">{balance.formatted}</p>
            <p class="balance-sats">({balance.satoshis} satoshis)</p>
          </div>
        {:else}
          <p>Loading balance...</p>
        {/if}
      </div>

      <div class="transaction-section">
        <h3>Transaction History</h3>
        <button class="refresh-btn" on:click={loadTransactions}>↻</button>
        {#if transactionsLoading}
          <p>Loading transactions...</p>
        {:else if transactions.length === 0}
          <p>No transactions found.</p>
        {:else}
          <table>
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Block Height</th>
                <th>Amount (BTC)</th>
              </tr>
            </thead>
            <tbody>
              {#each transactions as tx}
                <tr>
                  <td class="txid">
                    <a href={`https://mempool.space/${network !== 'mainnet' ? network + '/' : ''}tx/${tx.txid}`} 
                       target="_blank" rel="noopener noreferrer">
                      {tx.txid.substring(0, 10)}...
                    </a>
                  </td>
                  <td>{tx.height}</td>
                  <td>{tx.formattedValue}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        {/if}
      </div>

      <div class="fee-calculator">
        <h3>Fee Calculator</h3>
        <div class="fee-inputs">
          <label>
            Fee Rate (sats/byte):
            <input type="range" bind:value={selectedFeeRate} min={fees.slow} max={fees.fast} step="1" />
            <span>{selectedFeeRate} sats/byte</span>
          </label>
          
          <div class="fee-suggestions">
            <button on:click={() => selectedFeeRate = fees.slow}>Slow ({fees.slow})</button>
            <button on:click={() => selectedFeeRate = fees.medium}>Medium ({fees.medium})</button>
            <button on:click={() => selectedFeeRate = fees.fast}>Fast ({fees.fast})</button>
          </div>
          
          <label>
            Transaction Size (bytes):
            <input type="number" bind:value={transactionSize} min="100" max="1000" />
          </label>
        </div>
        
        {#if estimatedFee}
          <div class="estimated-fee">
            <p>Estimated Fee: <strong>{estimatedFee.btc} BTC</strong> ({estimatedFee.satoshis} sats)</p>
          </div>
        {/if}
      </div>
    {/if}
  {/if}
</div>

<style>
  .bitcoin-dashboard {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  h2 {
    color: #f7931a; /* Bitcoin orange */
    text-align: center;
    margin-bottom: 30px;
  }

  h3 {
    margin-top: 25px;
    margin-bottom: 15px;
    color: #4a4a4a;
    border-bottom: 1px solid #eaeaea;
    padding-bottom: 10px;
  }

  .loading, .error {
    text-align: center;
    padding: 20px;
    border-radius: 4px;
  }

  .error {
    background-color: #fff0f0;
    color: #d32f2f;
  }

  .address {
    background: #f5f5f5;
    padding: 15px;
    border-radius: 4px;
    word-break: break-all;
    font-family: monospace;
    margin: 10px 0;
  }

  .register-btn {
    background: #f7931a;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    width: 100%;
  }

  .register-btn:disabled {
    background: #cccccc;
  }

  .balance-amount {
    font-size: 1.5em;
    font-weight: bold;
    color: #2e7d32;
    margin: 0;
  }

  .balance-sats {
    color: #757575;
    margin: 0;
  }

  .refresh-btn {
    background: none;
    border: 1px solid #ddd;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
    float: right;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 15px;
  }

  th, td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }

  th {
    background-color: #f9f9f9;
  }

  .txid a {
    color: #1976d2;
    text-decoration: none;
  }

  .fee-inputs {
    margin-top: 15px;
  }

  .fee-inputs label {
    display: block;
    margin-bottom: 15px;
  }

  .fee-suggestions {
    margin: 15px 0;
    display: flex;
    gap: 10px;
  }

  .fee-suggestions button {
    flex: 1;
    padding: 8px;
    background: #f0f0f0;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
  }

  .estimated-fee {
    margin-top: 20px;
    padding: 15px;
    background-color: #f0f7ff;
    border-radius: 4px;
  }

  .network-selector {
    margin-bottom: 20px;
  }

  .network-selector select {
    padding: 5px;
    border-radius: 4px;
    border: 1px solid #ddd;
  }
</style>