import { clusterApiUrl } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

const createEndpointConfig = () => clusterApiUrl(WalletAdapterNetwork.Devnet);

export { createEndpointConfig };
