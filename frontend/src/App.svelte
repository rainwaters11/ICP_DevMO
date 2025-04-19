<script>
  import { onMount }        from 'svelte';
  import { Actor, HttpAgent } from '@dfinity/agent';

  // Pull in your Candid factory and canister ID
  import { idlFactory, canisterId } from '$canisters/bitcoin_dapp';

  // Create an actor to talk to your canister
  const agent = new HttpAgent({ host: 'http://127.0.0.1:8000' });
  const bitcoinDapp = Actor.createActor(idlFactory, {
    agent,
    canisterId,
  });

  // Local state
  let address = '';
  let balance = 0n;

  onMount(async () => {
    address = await bitcoinDapp.getBitcoinAddress();
    balance = await bitcoinDapp.getBalance();
  });
</script>

<main>
  <h1>🚀 ICP Bitcoin Dapp</h1>
  <p><strong>Address:</strong> {address}</p>
  <p><strong>Balance:</strong> {balance} sats</p>
</main>


