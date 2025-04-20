import { html, render } from 'lit-html';
import logo from './logo2.svg';

class App {
  greeting = '';
  bitcoinAddress = '';
  bitcoinBalance = '';
  formattedBalance = '';
  errorMessage = '';
  isUsingMockData = false;
  isLoading = false;
  frontendStatus = 'Unknown';
  canisterInfo = {};

  constructor() {
    this.#fetchBitcoinData();
    this.#checkFrontendStatus();
    this.#getCanisterInfo();
    this.#render();
  }

  #fetchBitcoinData = async () => {
    this.isLoading = true;
    this.errorMessage = '';
    this.isUsingMockData = false;
    this.#render(); // Render immediately to show loading state
    
    try {
      if (!window.bitcoin_dapp) {
        throw new Error("Bitcoin canister actor not initialized");
      }
      
      // Get Bitcoin address
      this.bitcoinAddress = await window.bitcoin_dapp.getBitcoinAddress();
      console.log("Bitcoin address fetched:", this.bitcoinAddress);
      
      // Try to get real balance
      try {
        const balance = await window.bitcoin_dapp.getBalance();
        this.bitcoinBalance = String(balance);
        this.formattedBalance = await window.bitcoin_dapp.formatBTC(balance);
        console.log("Bitcoin balance fetched:", this.bitcoinBalance);
      } catch (balanceError) {
        console.warn('Failed to get real balance, using mock data instead:', balanceError);
        // Fall back to mock balance if real balance fails
        this.isUsingMockData = true;
        const mockBalance = await window.bitcoin_dapp.getMockBalance();
        this.bitcoinBalance = String(mockBalance);
        this.formattedBalance = await window.bitcoin_dapp.formatBTC(mockBalance);
      }
    } catch (error) {
      console.error('Error fetching Bitcoin data:', error);
      this.errorMessage = `Error: ${error.message || 'Failed to fetch Bitcoin data'}`;
      this.isUsingMockData = true;
    } finally {
      this.isLoading = false;
      this.#render();
    }
  };

  #checkFrontendStatus = async () => {
    try {
      if (window.bitcoin_dapp_frontend && typeof window.bitcoin_dapp_frontend.status === 'function') {
        this.frontendStatus = await window.bitcoin_dapp_frontend.status();
      } else {
        this.frontendStatus = "Frontend canister actor not available";
      }
    } catch (error) {
      console.error('Error checking frontend status:', error);
      this.frontendStatus = `Error: ${error.message || 'Failed to check frontend status'}`;
    }
    this.#render();
  };

  #getCanisterInfo = () => {
    if (window.debugICP && typeof window.debugICP.getCanisterIds === 'function') {
      this.canisterInfo = window.debugICP.getCanisterIds();
      
      // Add environment info
      if (typeof window.debugICP.getEnvironment === 'function') {
        this.canisterInfo.env = window.debugICP.getEnvironment();
      }
    } else {
      this.canisterInfo = { error: "Debug information unavailable" };
    }
    this.#render();
  };
  
  #reloadActors = async () => {
    try {
      if (window.debugICP && typeof window.debugICP.reloadActors === 'function') {
        const result = await window.debugICP.reloadActors();
        if (result) {
          this.errorMessage = "Actors reloaded successfully";
        } else {
          this.errorMessage = "Failed to reload actors";
        }
      } else {
        this.errorMessage = "Reload function not available";
      }
    } catch (error) {
      console.error('Error reloading actors:', error);
      this.errorMessage = `Error reloading: ${error.message}`;
    }
    
    // Refresh data and status after reload attempt
    this.#fetchBitcoinData();
    this.#checkFrontendStatus();
    this.#getCanisterInfo();
  };

  #handleSubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    try {
      this.greeting = await window.bitcoin_dapp_backend.greet(name);
    } catch (error) {
      console.error('Error greeting:', error);
      this.greeting = `Error greeting: ${error.message}`;
    }
    this.#render();
  };

  #render() {
    let body = html`
      <main>
        <img src="${logo}" alt="DFINITY logo" />
        <br />
        <br />
        <form action="#">
          <label for="name">Enter your name: &nbsp;</label>
          <input id="name" alt="Name" type="text" />
          <button type="submit">Click Me!</button>
        </form>
        <section id="greeting">${this.greeting}</section>
        
        <div class="bitcoin-info">
          <h2>Bitcoin Canister Functionality</h2>
          ${this.errorMessage ? html`<p class="error">${this.errorMessage}</p>` : ''}
          ${this.isUsingMockData ? html`<p class="mock-data-notice">⚠️ Using mock data for demonstration (Bitcoin API unavailable)</p>` : ''}
          ${this.isLoading ? 
            html`<p class="loading">Loading Bitcoin data...</p>` : 
            html`
              <p><strong>Bitcoin Address:</strong> ${this.bitcoinAddress || 'Not available'}</p>
              <p><strong>Balance (raw):</strong> ${this.bitcoinBalance || 'Not available'} satoshis</p>
              <p><strong>Formatted Balance:</strong> ${this.formattedBalance || 'Not available'}</p>
            `
          }
          <button @click=${this.#fetchBitcoinData} ?disabled=${this.isLoading}>
            ${this.isLoading ? 'Loading...' : 'Refresh Bitcoin Data'}
          </button>
        </div>

        <div class="canister-debug-info">
          <h2>Canister Debug Information</h2>
          <p><strong>Frontend Status:</strong> ${this.frontendStatus}</p>
          
          <div class="canister-ids">
            <h3>Canister IDs:</h3>
            <pre>${JSON.stringify(this.canisterInfo, null, 2)}</pre>
          </div>

          <div class="debug-actions">
            <button @click=${this.#reloadActors}>Reload Canister Actors</button>
            <button @click=${this.#checkFrontendStatus}>Check Frontend Status</button>
          </div>
        </div>
      </main>

      <style>
        .canister-debug-info {
          margin-top: 30px;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 5px;
          background-color: #f9f9f9;
        }
        
        .canister-debug-info h2 {
          color: #333;
          border-bottom: 1px solid #ddd;
          padding-bottom: 10px;
        }
        
        .canister-ids pre {
          background-color: #eee;
          padding: 10px;
          border-radius: 3px;
          overflow-x: auto;
          font-family: monospace;
          font-size: 14px;
        }
        
        .debug-actions {
          margin-top: 15px;
        }
        
        .debug-actions button {
          margin-right: 10px;
          padding: 8px 12px;
          background-color: #f0ad4e;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .debug-actions button:hover {
          background-color: #ec971f;
        }
        
        .error {
          color: #d9534f;
          font-weight: bold;
        }
      </style>
    `;
    render(body, document.getElementById('root'));
    
    // Add event listener after rendering
    const form = document.querySelector('form');
    if (form) {
      form.removeEventListener('submit', this.#handleSubmit);
      form.addEventListener('submit', this.#handleSubmit);
    }
    
    // Add event listeners for all buttons
    const refreshButton = document.querySelector('.bitcoin-info button');
    if (refreshButton) {
      refreshButton.removeEventListener('click', this.#fetchBitcoinData);
      refreshButton.addEventListener('click', this.#fetchBitcoinData);
    }
    
    const reloadButton = document.querySelector('.debug-actions button:nth-child(1)');
    if (reloadButton) {
      reloadButton.removeEventListener('click', this.#reloadActors);
      reloadButton.addEventListener('click', this.#reloadActors);
    }
    
    const checkFrontendButton = document.querySelector('.debug-actions button:nth-child(2)');
    if (checkFrontendButton) {
      checkFrontendButton.removeEventListener('click', this.#checkFrontendStatus);
      checkFrontendButton.addEventListener('click', this.#checkFrontendStatus);
    }
  }
}

export default App;
