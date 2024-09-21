import { BN } from '@project-serum/anchor';
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { createStakeAnchorProgram } from '@lib';
import { getNextUnusedStakeReceiptNonce } from '@mithraic-labs/token-staking';
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';

const NONCE = 0; // Nonce for the stake pool
const SPL_TOKEN_MINT = new PublicKey(import.meta.env.VITE_TOKEN_MINT_ADDRESS); // SPL Token mint address
const SPL_TOKEN_AUTHORITY = new PublicKey(import.meta.env.VITE_TOKEN_STAKE_AUTHORITY); // SPL Token authority address

/**
 * @description Get remaining accounts and pre-instructions for a user for staking.
 * @param {Object} params - Parameters for the function.
 * @param {Object} params.connection - Solana connection object.
 * @param {PublicKey} params.userWallet - Public key of the user's wallet.
 * @param {Array} params.rewardPools - Array of reward pool objects.
 * @returns {Promise<Object>} - Object containing remaining accounts and preInstructions.
 */
const getRemainingAccAndPreInstructions = async ({ connection, userWallet, rewardPools }) => {
  const remainingAccounts = [];
  const preInstructions = [];
  for (let i = 0; i < rewardPools.length; i++) {
    const pool = rewardPools[i];
    const vaultInfo = await connection.getParsedAccountInfo(pool.rewardVault);
    const mint = new PublicKey(vaultInfo.value?.data?.parsed?.info?.mint);
    const depositUserRewardAccessKey = await getAssociatedTokenAddress(mint, userWallet);
    const accountInfo = await connection.getAccountInfo(depositUserRewardAccessKey);
    remainingAccounts.push({
      pubkey: pool.rewardVault,
      isWritable: true,
      isSigner: false,
    });
    remainingAccounts.push({
      pubkey: depositUserRewardAccessKey,
      isWritable: true,
      isSigner: false,
    });
    if (!accountInfo) {
      const instruction = createAssociatedTokenAccountInstruction(userWallet, depositUserRewardAccessKey, userWallet, mint, TOKEN_PROGRAM_ID);
      preInstructions.push(instruction);
    }
  }
  return { remainingAccounts, preInstructions };
};

/**
 * @description Get the stake pool public key.
 * @param {Object} params - Parameters for the function.
 * @param {PublicKey} params.programId - Public key of the staking program.
 * @returns {PublicKey} - Public key of the stake pool.
 */
const getStakePoolKey = ({ programId }) => {
  const [stakingPoolKey] = PublicKey.findProgramAddressSync(
    [new BN(NONCE).toArrayLike(Buffer, 'le', 1), SPL_TOKEN_MINT.toBuffer(), SPL_TOKEN_AUTHORITY.toBuffer(), Buffer.from('stakePool', 'utf-8')],
    programId
  );
  return stakingPoolKey;
};

/**
 * @description Get the vault public key for the stake pool.
 * @param {Object} params - Parameters for the function.
 * @param {PublicKey} params.stakingPoolKey - Public key of the staking pool.
 * @param {PublicKey} params.programId - Public key of the staking program.
 * @returns {PublicKey} - Public key of the vault.
 */
const getStakeVaultKey = ({ stakingPoolKey, programId }) => {
  const [vaultKey] = PublicKey.findProgramAddressSync([stakingPoolKey.toBuffer(), Buffer.from('vault', 'utf-8')], programId);
  return vaultKey;
};

/**
 * @description Get the number of decimals for an SPL token mint.
 * @param {Object} params - Parameters for the function.
 * @param {Object} params.connection - Solana connection object.
 * @param {PublicKey} params.splTokenMint - Public key of the SPL token mint.
 * @returns {Promise<number>} - Number of decimals for the token.
 */
const getSplTokenDecimals = async ({ connection, splTokenMint }) => {
  const accountInfo = await connection.getParsedAccountInfo(splTokenMint);
  return accountInfo?.value?.data?.parsed?.info?.decimals || 0;
};

/**
 * @description Get the total staked amount in a vault.
 * @param {Object} params - Parameters for the function.
 * @param {Object} params.connection - Solana connection object.
 * @param {PublicKey} params.vaultKey - Public key of the vault.
 * @param {number} params.accountDecimals - Number of decimals for the account.
 * @returns {Promise<number>} - Total staked amount.
 */
const getTotalStaked = async ({ connection, vaultKey, accountDecimals }) => {
  const vaultInfo = await connection.getParsedAccountInfo(vaultKey);
  return Number(vaultInfo?.value?.data?.parsed?.info?.tokenAmount?.amount) / Math.pow(10, accountDecimals) || 0;
};

/**
 * @description Get the stake mint and associated account key.
 * @param {Object} params - Parameters for the function.
 * @param {PublicKey} params.stakingPoolKey - Public key of the staking pool.
 * @param {PublicKey} params.programId - Public key of the staking program.
 * @param {PublicKey} params.userWallet - Public key of the user's wallet.
 * @returns {Promise<Object>} - Object containing the stake mint and associated account key.
 */
const getStakeMintAndAccountKey = async ({ stakingPoolKey, programId, userWallet }) => {
  const [stakeMint] = PublicKey.findProgramAddressSync([stakingPoolKey.toBuffer(), Buffer.from('stakeMint', 'utf-8')], programId);
  const stakeMintAccountKey = await getAssociatedTokenAddress(stakeMint, userWallet, false, TOKEN_PROGRAM_ID);
  return {
    stakeMint,
    stakeMintAccountKey,
  };
};

/**
 * @description Get information about the stake mint account.
 * @param {Object} params - Parameters for the function.
 * @param {Object} params.connection - Solana connection object.
 * @param {PublicKey} params.stakeMintAccountKey - Public key of the stake mint account.
 * @returns {Promise<Object>} - Account information.
 */
const getStakeMintAccountInfo = async ({ connection, stakeMintAccountKey }) => {
  return await connection.getAccountInfo(stakeMintAccountKey);
};

/**
 * @description Get the stake receipt public key.
 * @param {Object} params - Parameters for the function.
 * @param {PublicKey} params.userWallet - Public key of the user's wallet.
 * @param {PublicKey} params.stakingPoolKey - Public key of the staking pool.
 * @param {number} params.nextNonce - Next available nonce.
 * @param {PublicKey} params.programId - Public key of the staking program.
 * @returns {Promise<PublicKey>} - Public key of the stake receipt.
 */
const getStakeReceiptKey = async ({ userWallet, stakingPoolKey, nextNonce, programId }) => {
  const [stakeReceiptKey] = PublicKey.findProgramAddressSync(
    [userWallet.toBuffer(), stakingPoolKey.toBuffer(), new BN(nextNonce).toArrayLike(Buffer, 'le', 4), Buffer.from('stakeDepositReceipt', 'utf-8')],
    programId
  );
  return stakeReceiptKey;
};

/**
 * @description Get staking pool information for a mint.
 * @param {Object} params - Parameters for the function.
 * @param {Object} params.anchorWallet - Anchor wallet object.
 * @returns {Promise<Object>} - Pool information including total staked and reward pools.
 */
const getMintStakingPoolInfo = ({ anchorWallet }) =>
  new Promise(async (resolve, reject) => {
    const { program, connection } = createStakeAnchorProgram({ anchorWallet });

    const stakingPoolKey = getStakePoolKey({ programId: program.programId });
    const vaultKey = getStakeVaultKey({ stakingPoolKey, programId: program.programId });

    const sa = 50000000;
    const poolInfo = await program.account.stakePool.fetch(stakingPoolKey).catch(err => reject(err));
    const accountDecimals = await getSplTokenDecimals({ connection: connection, splTokenMint: SPL_TOKEN_MINT }).catch(err => reject(err));
    let totalStaked = await getTotalStaked({ connection: connection, vaultKey, accountDecimals }).catch(err => reject(err));
    totalStaked = totalStaked + sa;
    const totalWeightedStake = poolInfo.totalWeightedStake.div(new BN(Math.pow(10, accountDecimals))).toString();
    const totalWeightedStakeNumber = parseInt(totalWeightedStake, 10);
    let totalWeighted = totalWeightedStakeNumber / Math.pow(10, accountDecimals);
    totalWeighted = totalWeighted + sa;
    const data = {
      minDuration: poolInfo.minDuration.toNumber(), // in seconds, minimum staking period
      maxDuration: poolInfo.maxDuration.toNumber(), // in seconds maximum staking period
      baseWeight: poolInfo.baseWeight.div(new BN(Math.pow(10, accountDecimals))).toNumber(), // base weight, multiplied by the duration and the amount staked
      maxWeight: poolInfo.maxWeight
        .div(new BN(Math.pow(10, accountDecimals)))
        .toNumber()
        .toFixed(2), // max weight, multiplied by the duration and the amount staked
      totalWeighted: totalWeighted, // total weighted stake
      decimals: accountDecimals, // decimals of the token
      multiplier: poolInfo.baseWeight.div(new BN(Math.pow(10, accountDecimals))).toNumber(), // multiplier
      minDurationDays: Math.floor(poolInfo.minDuration.toNumber() / 86400), // minimum staking period in days
      maxDurationYears: Math.floor(poolInfo.maxDuration.toNumber() / 31536000), // maximum staking period in years
      rewardPools: poolInfo.rewardPools, // reward pools
      totalStaked: totalStaked, // total staked amount
      userReward: 0, // user reward default
      avgWeight: totalWeighted / totalStaked, // average weight
    };
    resolve(data);
  });

/**
 * @description Get user staking information.
 * @param {Object} params - Parameters for the function.
 * @param {Object} params.anchorWallet - Anchor wallet object.
 * @param {PublicKey} params.userWallet - Public key of the user's wallet.
 * @returns {Promise<Array>} - Array of user's staking information.
 */
const getUserStakingInfo = ({ anchorWallet, userWallet }) =>
  new Promise(async (resolve, reject) => {
    const { program, connection } = createStakeAnchorProgram({ anchorWallet });

    const stakingPoolKey = getStakePoolKey({ programId: program.programId });
    const nextNonce = await getNextUnusedStakeReceiptNonce(connection, program.programId, userWallet, stakingPoolKey).catch(err => reject(err));

    if (!nextNonce) resolve([]);

    const decimals = await getSplTokenDecimals({ connection, splTokenMint: SPL_TOKEN_MINT });
    const poolInfo = await program.account.stakePool.fetch(stakingPoolKey).catch(err => reject(err));
    const baseWeight = poolInfo.baseWeight.div(new BN(Math.pow(10, decimals))).toNumber();
    const maxWeight = poolInfo.maxWeight.div(new BN(Math.pow(10, decimals))).toNumber();
    const maxDuration = poolInfo.maxDuration.toNumber();

    const data = await Promise.all(
      Array.from({ length: nextNonce }, async (_, i) => {
        const [stakeReceiptKey] = PublicKey.findProgramAddressSync(
          [userWallet.toBuffer(), stakingPoolKey.toBuffer(), new BN(i).toArrayLike(Buffer, 'le', 4), Buffer.from('stakeDepositReceipt', 'utf-8')],
          program.programId
        );

        const data = await program.account.stakeDepositReceipt.fetch(stakeReceiptKey).catch(err => reject(err));
        const { depositTimestamp, lockupDuration, depositAmount, claimedAmounts } = data;

        const startDate = new Date(depositTimestamp.toNumber() * 1000);
        const endDate = new Date(lockupDuration.toNumber() * 1000 + depositTimestamp.toNumber() * 1000);
        const diffSeconds = Math.floor((endDate - startDate) / 1000);
        const remainingDays = Math.floor((lockupDuration.toNumber() * 1000 + depositTimestamp.toNumber() * 1000 - Date.now()) / 86400000) || 0;
        const weight = baseWeight + (maxWeight - baseWeight) * (diffSeconds / maxDuration);

        return {
          stakedAt: depositTimestamp.toNumber() * 1000, //
          unlockedAt: lockupDuration.toNumber() * 1000 + data.depositTimestamp.toNumber() * 1000,
          amount: new BN(depositAmount).div(new BN(Math.pow(10, decimals))).toNumber(),
          claimedAmounts: claimedAmounts.map(claimedAmount => claimedAmount.toNumber()),
          remainingDays: remainingDays > 0 ? remainingDays : 0,
          weight,
        };
      })
    );

    resolve(data);
  });

/**
 * @description Stake SPL tokens.
 * @param {Object} params - Parameters for the function.
 * @param {Object} params.anchorWallet - Anchor wallet object.
 * @param {PublicKey} params.userWallet - Public key of the user's wallet.
 * @param {number} params.amount - Amount of tokens to stake.
 * @param {number} params.duration - Duration for staking in seconds.
 * @param {Array} params.rewardPoolWallets - Array of reward pool wallets.
 * @returns {Promise<string>} - Transaction signature of the staking operation.
 */
const stakeSplToken = ({ anchorWallet, userWallet, amount, duration, rewardPoolWallets }) =>
  new Promise(async (resolve, reject) => {
    const { program, connection } = createStakeAnchorProgram({ anchorWallet });

    const stakingPoolKey = getStakePoolKey({ programId: program.programId });

    const vaultKey = getStakeVaultKey({ stakingPoolKey, programId: program.programId });

    const { stakeMintAccountKey, stakeMint } = await getStakeMintAndAccountKey({
      stakingPoolKey,
      programId: program.programId,
      userWallet,
    });

    const preInstructions = [];

    const stakeMintAccountInfo = await getStakeMintAccountInfo({ connection, stakeMintAccountKey });

    if (!stakeMintAccountInfo) {
      const instruction = createAssociatedTokenAccountInstruction(userWallet, stakeMintAccountKey, userWallet, stakeMint, TOKEN_PROGRAM_ID);
      preInstructions.push(instruction);
    }
    const mintToBeStakedAccount = await getAssociatedTokenAddress(SPL_TOKEN_MINT, userWallet, false, TOKEN_PROGRAM_ID);

    const nextNonce = await getNextUnusedStakeReceiptNonce(connection, program.programId, userWallet, stakingPoolKey);

    const stakeReceiptKey = await getStakeReceiptKey({ userWallet, stakingPoolKey, nextNonce, programId: program.programId });

    const decimals = await getSplTokenDecimals({ connection, splTokenMint: SPL_TOKEN_MINT });

    const remainingAccounts = rewardPoolWallets.map(wallet => ({
      pubkey: new PublicKey(wallet.rewardVault),
      isWritable: false,
      isSigner: false,
    }));

    const tx = await program.methods
      .deposit(new BN(nextNonce), new BN(amount * Math.pow(10, decimals)), new BN(duration))
      .accounts({
        payer: userWallet,
        owner: userWallet,
        from: mintToBeStakedAccount,
        stakePool: stakingPoolKey,
        vault: vaultKey,
        stakeMint,
        destination: stakeMintAccountKey,
        stakeDepositReceipt: stakeReceiptKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId,
      })
      .remainingAccounts(remainingAccounts)
      .preInstructions(preInstructions)
      .rpc({ skipPreflight: true })
      .catch(err => reject(err));

    resolve(tx);
  });

/**
 * @description Claim staking rewards.
 * @param {Object} params - Parameters for the function.
 * @param {Object} params.anchorWallet - Anchor wallet object.
 * @param {PublicKey} params.userWallet - Public key of the user's wallet.
 * @param {Array} params.rewardPoolWallets - Array of reward pool wallets.
 * @param {number} params.nonce - Nonce of the stake.
 * @returns {Promise<string>} - Transaction signature for claiming rewards.
 */
const claimStakingRewards = ({ anchorWallet, userWallet, rewardPoolWallets, nonce }) =>
  new Promise(async (resolve, reject) => {
    const { program, connection } = createStakeAnchorProgram({ anchorWallet });
    const stakingPoolKey = getStakePoolKey({ programId: program.programId });
    const stakeReceiptKey = await getStakeReceiptKey({ userWallet, stakingPoolKey, nonce, programId: program.programId });

    const clearedRewardPoolWallets = rewardPoolWallets.filter(pool => pool.rewardVault.toString() !== SystemProgram.programId.toString());

    if (!clearedRewardPoolWallets.length) reject(new Error('No rewards to claim'));

    const { remainingAccounts, preInstructions } = await getRemainingAccAndPreInstructions({ connection, userWallet, rewardPools: clearedRewardPoolWallets });

    const tx = await program.methods
      .claimAll()
      .accounts({
        claimBase: {
          owner: userWallet,
          stakeDepositReceipt: stakeReceiptKey,
          stakePool: stakingPoolKey,
        },
      })
      .remainingAccounts(remainingAccounts)
      .preInstructions(preInstructions)
      .rpc({ skipPreflight: true })
      .catch(err => reject(err));

    resolve(tx);
  });

/**
 * @description Withdraw staked SPL tokens.
 * @param {Object} params - Parameters for the function.
 * @param {Object} params.anchorWallet - Anchor wallet object.
 * @param {PublicKey} params.userWallet - Public key of the user's wallet.
 * @param {Array} params.rewardPools - Array of reward pools.
 * @param {number} params.nonce - Nonce of the stake.
 * @returns {Promise<string>} - Transaction signature for the withdrawal.
 */
const withdrawSplToken = ({ anchorWallet, userWallet, rewardPools, nonce }) =>
  new Promise(async (resolve, reject) => {
    const { program, connection } = createStakeAnchorProgram({ anchorWallet });
    const stakingPoolKey = getStakePoolKey({ programId: program.programId });
    const stakeReceiptKey = await getStakeReceiptKey({ userWallet, stakingPoolKey, nonce, programId: program.programId });
    const vaultKey = getStakeVaultKey({ stakingPoolKey, programId: program.programId });
    const { stakeMint, stakeMintAccountKey } = await getStakeMintAndAccountKey({
      stakingPoolKey,
      programId: program.programId,
      userWallet,
    }).catch(err => reject(err));

    const mintToBeStakedAccount = await getAssociatedTokenAddress(SPL_TOKEN_MINT, userWallet, false, TOKEN_PROGRAM_ID);

    const clearedRewardPoolWallets = rewardPools.filter(pool => pool.rewardVault.toString() !== SystemProgram.programId.toString());

    const { remainingAccounts, preInstructions } = await getRemainingAccAndPreInstructions({ connection, userWallet, rewardPools: clearedRewardPoolWallets });

    const accountInfo = await connection.getAccountInfo(mintToBeStakedAccount);
    if (!accountInfo) {
      const instruction = createAssociatedTokenAccountInstruction(userWallet, mintToBeStakedAccount, userWallet, SPL_TOKEN_MINT, TOKEN_PROGRAM_ID);
      preInstructions.push(instruction);
    }

    const tx = await program.methods
      .withdraw()
      .accounts({
        claimBase: {
          owner: userWallet,
          stakePool: stakingPoolKey,
          stakeDepositReceipt: stakeReceiptKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
        vault: vaultKey,
        stakeMint,
        from: stakeMintAccountKey,
        destination: mintToBeStakedAccount,
      })
      .remainingAccounts(remainingAccounts)
      .preInstructions(preInstructions)
      .rpc({ skipPreflight: true })
      .catch(err => reject(err));

    resolve(tx);
  });

export { getMintStakingPoolInfo, getUserStakingInfo, stakeSplToken, claimStakingRewards, withdrawSplToken };
