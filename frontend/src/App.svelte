<script>
  import BitcoinDashboard from './lib/BitcoinDashboard.svelte';
</script>

<main>
  <div class="app-container">
    <header>
      <h1>ICP Bitcoin Integration</h1>
      <p class="subtitle">Your Bitcoin gateway on the Internet Computer</p>
    </header>
    
    <BitcoinDashboard />
    
    <footer>
      <p>Powered by Internet Computer Protocol's Bitcoin Integration</p>
      <p class="deployment-info">
        Deployed on {process.env.NODE_ENV === "production" ? "Mainnet" : "Local Development Environment"}
      </p>
    </footer>
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
    background: #f5f5f5;
    color: #333;
  }
  
  .app-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
  }
  
  header {
    text-align: center;
    margin-bottom: 30px;
  }
  
  h1 {
    color: #f7931a;
    margin-bottom: 5px;
  }
  
  .subtitle {
    color: #666;
    margin-top: 0;
  }
  
  footer {
    margin-top: 40px;
    text-align: center;
    font-size: 0.9em;
    color: #777;
    border-top: 1px solid #eee;
    padding-top: 20px;
  }
  
  .deployment-info {
    font-size: 0.8em;
    color: #999;
  }
</style>


