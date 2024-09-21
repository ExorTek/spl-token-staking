import { AnchorProvider, Program } from '@project-serum/anchor';
import { SPL_TOKEN_STAKING_ID, SplTokenStakingIDL } from '@mithraic-labs/token-staking';
import { createEndpointConfig } from '@lib';
import { Connection } from '@solana/web3.js';

const createStakeAnchorProgram = ({ anchorWallet }) => {
  const endpoint = createEndpointConfig();
  const connection = new Connection(endpoint);
  const provider = new AnchorProvider(connection, anchorWallet);
  const program = new Program(SplTokenStakingIDL, SPL_TOKEN_STAKING_ID, provider);
  return {
    program: program,
    connection: provider.connection,
  };
};

export { createStakeAnchorProgram };
