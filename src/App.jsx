import '@solana/wallet-adapter-react-ui/styles.css';
import './global.css';
import 'react-toastify/dist/ReactToastify.css';
import { StakingForm, StakingDetail, StakingTable } from '@components';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ToastContainer, toast } from 'react-toastify';
import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { claimStakingRewards, getMintStakingPoolInfo, getUserStakingInfo, stakeSplToken, withdrawSplToken } from '@lib';
import { useTokenBalance } from '@hooks';
const tokenSymbol = import.meta.env.VITE_TOKEN_SYMBOL;

function App() {
  const defaultStakingInfo = {
    minDuration: 0,
    maxDuration: 0,
    baseWeight: 0,
    maxWeight: 0,
    totalWeighted: 0,
    decimals: 0,
    multiplier: 0,
    minDurationDays: 0,
    maxDurationYears: 0,
    rewardPools: 0,
    totalStaked: 0,
    userReward: 0,
    avgWeight: 0,
  };

  const anchorWallet = useAnchorWallet();
  const wallet = useWallet();
  const userBalance = useTokenBalance();

  const [stakingInfo, setStakingInfo] = useState(defaultStakingInfo);
  const [loading, setLoading] = useState(false);
  const [stakingStarted, setStakingStarted] = useState(false);
  const [userStakingInfo, setUserStakingInfo] = useState([]);
  const [stakeForm, setStakeForm] = useState({
    stakeAmount: 0,
    stakeYears: 0,
    stakeDays: 0,
  });

  const handleMultiplier = ({ years, days }) => {
    const duration = (years * 360 + days) * 24 * 60 * 60;
    const minWeight = stakingInfo.baseWeight;
    const maxWeight = stakingInfo.maxWeight;
    const multiplier = minWeight + (maxWeight - minWeight) * (duration / stakingInfo.maxDuration);
    setStakingInfo({ ...stakingInfo, multiplier: multiplier, userReward: (stakeForm.stakeAmount * multiplier).toFixed(2) });
  };

  const handeAmountChange = ({ target: { value } }) => {
    if (isNaN(value)) handleStakeForm([{ stakeAmount: 0 }]);
    value = parseFloat(value || '0');
    if (value > userBalance) value = userBalance;
    handleStakeForm([{ stakeAmount: value }]);
  };

  const handleStakeForm = form => {
    if (userBalance <= 0) return toast.info(`Please buy ${tokenSymbol} to stake!`);
    if (!stakingInfo.baseWeight || !stakingInfo.maxWeight || !stakingInfo.maxDuration) return toast.info('Staking info not available!');
    setStakeForm(prevState => {
      return form.reduce(
        (newState, item) => {
          const [key, value] = Object.entries(item)[0];
          return { ...newState, [key]: value };
        },
        { ...prevState }
      );
    });
  };

  const handleDuration = ({ target: { name, value } }) => {
    value = parseInt(value);
    if (isNaN(value)) {
      if (name === 'years') handleStakeForm([{ stakeYears: 0 }]);
      if (name === 'days') handleStakeForm([{ stakeDays: 0 }]);
    } else {
      if (name === 'years') handleStakeForm([{ stakeYears: Math.min(value, stakingInfo.maxDurationYears) }, { stakeDays: 0 }]);
      if (name === 'days') {
        if (value > 365) handleStakeForm([{ stakeYears: stakingInfo.maxDurationYears }, { stakeDays: 0 }]);
        else handleStakeForm([{ stakeYears: 0 }, { stakeDays: value }]);
      }
    }
  };

  const getStakingData = () => {
    setLoading(true);
    Promise.all([getMintStakingPoolInfo({ anchorWallet }), getUserStakingInfo({ anchorWallet, userWallet: wallet.publicKey })])
      .then(([info, userStakingInfo]) => {
        setStakingInfo(info);
        setUserStakingInfo(userStakingInfo);
        setLoading(false);
      })
      .catch(err => {
        toast.error(err.message);
        setStakingInfo(defaultStakingInfo);
        setUserStakingInfo([]);
        setLoading(false);
      });
  };

  const validateStakeForm = (amount, duration, stakingInfo) => {
    const result = { isValid: true, message: '' };
    if (amount <= 0) {
      result.isValid = false;
      result.message = `Please enter a valid ${tokenSymbol} amount!`;
    }
    if (amount > userBalance) {
      result.isValid = false;
      result.message = `You do not have enough ${tokenSymbol}!`;
    }
    if (duration < stakingInfo.minDuration) {
      result.isValid = false;
      result.message = 'Staking duration is too short!';
    }
    if (duration > stakingInfo.maxDuration) {
      result.isValid = false;
      result.message = 'Staking duration is too long!';
    }
    return result;
  };

  const handleStake = e => {
    e.preventDefault();
    setStakingStarted(true);

    const amount = stakeForm.stakeAmount;
    const duration = (stakeForm.stakeYears * 365 + stakeForm.stakeDays) * 24 * 60 * 60;

    const { isValid, message } = validateStakeForm(amount, duration, stakingInfo);
    if (!isValid) {
      toast.error(message);
      setStakingStarted(false);
      return;
    }

    stakeSplToken({
      anchorWallet,
      userWallet: wallet.publicKey,
      amount: stakeForm.stakeAmount,
      duration: duration,
      rewardPoolWallets: stakingInfo.rewardPools,
    })
      .then(tx => {
        toast.success(`${tokenSymbol} Staked Successfully! Click this message to view transaction`, {
          onClick: () => {
            window.open(`https://explorer.solana.com/tx/${tx}`, '_blank');
          },
        });
        handleStakeForm([{ stakeAmount: 0 }, { stakeYears: 0 }, { stakeDays: 0 }]);
        setStakingStarted(false);
        getStakingData();
      })
      .catch(err => {
        console.error('Error: ', err.message);
        const getMessage = () => {
          const errMessage = {
            code: 1,
            message: err.message,
            actionString: '',
          };

          if (err.message.includes('AccountNotInitialized')) {
            errMessage.code = 2;
            errMessage.message = 'The program expected this account to be already initialized.';
          }
          if (err.message.includes('not confirmed in 30.00 seconds')) {
            const txSignature = err?.message?.split('signature ')[1]?.split(' ')[0];
            errMessage.actionString = txSignature ? `https://explorer.solana.com/tx/${txSignature}` : 'https://explorer.solana.com/';
            errMessage.actionString = 'https://explorer.solana.com/';
            errMessage.code = 3;
            errMessage.message = 'Transaction was not confirmed in 30.00 seconds. It is unknown if it succeeded or failed. Click this message to view transaction.';
          }

          return errMessage;
        };
        const message = getMessage();

        toast.error(message.message, {
          onClick: () => {
            if (message.code === 3) {
              window.open(message.actionString, '_blank').focus();
            }
          },
        });

        handleStakeForm([{ stakeAmount: 0 }, { stakeYears: 0 }, { stakeDays: 0 }]);
        setStakingStarted(false);
      });
  };

  const handleWithdraw = ({ nonce }) => {
    withdrawSplToken({
      anchorWallet,
      userWallet: wallet.publicKey,
      rewardPools: stakingInfo.rewardPools,
      nonce: nonce,
    })
      .then(tx => {
        toast.success('Withdrawn Successfully! Click this message to view transaction', {
          onClick: () => {
            window.open(`https://explorer.solana.com/tx/${tx}`, '_blank');
          },
        });
      })
      .catch(err => {
        const message = err.message.includes('StakeStillLocked') ? 'Stake is still locked!' : err.message;
        toast.error(message);
      });
  };

  const handleClaim = ({ nonce }) => {
    claimStakingRewards({
      anchorWallet,
      userWallet: wallet.publicKey,
      rewardPoolWallets: stakingInfo.rewardPools,
      nonce: nonce,
    })
      .then(tx => {
        toast.success('Claimed Successfully! Click this message to view transaction', {
          onClick: () => {
            window.open(`https://explorer.solana.com/tx/${tx}`, '_blank');
          },
        });
      })
      .catch(err => {
        toast.error(err.message);
        console.log(err.message);
      });
  };

  useEffect(() => {
    if (anchorWallet) return getStakingData();
    else {
      setStakingInfo(defaultStakingInfo);
      setUserStakingInfo([]);
      setLoading(false);
      setStakeForm({ stakeAmount: 0, stakeYears: 0, stakeDays: 0 });
    }
    return () => {};
  }, [anchorWallet]);

  useEffect(() => {
    handleMultiplier({ years: stakeForm.stakeYears, days: stakeForm.stakeDays });
    return () => {};
  }, [stakeForm]);

  if (loading) return <div className={'w-full min-h-screen flex items-center justify-center'}>Loading...</div>;

  return (
    <div className={'w-full min-h-screen flex flex-col items-center justify-center gap-10 p-12'}>
      <ToastContainer
        toastStyle={{
          backgroundColor: '#1E293B',
          color: '#F9FAFB',
          boxShadow: '0 0 10px #1E293B',
        }}
        position={'bottom-right'}
      />
      <div className={'flex items-center justify-center gap-12'}>
        <h1 className={'text-4xl font-bold'}>Solana Network Staking</h1>
        <WalletMultiButton />
      </div>
      <div className={'w-full flex items-start gap-10'}>
        <StakingForm
          tokenSymbol={tokenSymbol}
          stakeForm={stakeForm}
          stakingInfo={stakingInfo}
          handleStake={handleStake}
          stakingStarted={stakingStarted}
          handeAmountChange={handeAmountChange}
          handleDuration={handleDuration}
          userBalance={userBalance}
        />
        <StakingDetail
          stakingInfo={stakingInfo}
          tokenSymbol={tokenSymbol}
        />
      </div>
      <StakingTable
        userStakingInfo={userStakingInfo}
        handleClaim={handleClaim}
        handleWithdraw={handleWithdraw}
      />
    </div>
  );
}

export default App;
