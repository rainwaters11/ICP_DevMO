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

  constructor() {
    this.#fetchBitcoinData();
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
      </main>
    `;
    render(body, document.getElementById('root'));
    
    // Add event listener after rendering
    const form = document.querySelector('form');
    if (form) {
      form.removeEventListener('submit', this.#handleSubmit);
      form.addEventListener('submit', this.#handleSubmit);
    }
    
    // Add event listener to the refresh button after rendering
    const refreshButton = document.querySelector('.bitcoin-info button');
    if (refreshButton) {
      refreshButton.removeEventListener('click', this.#fetchBitcoinData);
      refreshButton.addEventListener('click', this.#fetchBitcoinData);
    }
  }
}

export default App;
