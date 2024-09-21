import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useCallback, useEffect, useState } from 'react';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

const useTokenBalance = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState(0);

  const refreshBalance = useCallback(async () => {
    if (!publicKey) {
      setBalance(0);
      return;
    }

    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
      programId: TOKEN_PROGRAM_ID,
    });

    const tokenAddress = import.meta.env.VITE_TOKEN_MINT_ADDRESS;

    console.log('tokenAccounts', tokenAccounts);
    const parsedBalance = tokenAccounts.value.reduce((acc, item) => {
      if (item.account.data.parsed.info.mint === tokenAddress) {
        return acc + item.account.data.parsed.info.tokenAmount.uiAmount;
      }
      return acc;
    }, 0);

    setBalance(parsedBalance);
  }, [publicKey, connection]);

  useEffect(() => {
    refreshBalance();
    const intervalId = setInterval(refreshBalance, 60 * 1000);
    return () => clearInterval(intervalId);
  }, [refreshBalance]);

  return balance;
};

export default useTokenBalance;
