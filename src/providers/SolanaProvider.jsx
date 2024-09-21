import { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { createEndpointConfig } from '@lib';

function SolanaProvider({ children }) {
  const endpoint = useMemo(() => createEndpointConfig(), []);
  const wallets = useMemo(() => [], []); // Phantom & Solflare wallet is default wallet
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider
        wallets={wallets}
        autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default SolanaProvider;
