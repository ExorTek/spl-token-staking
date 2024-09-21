import { calculateDot } from '@helpers';
function StakeForm({ stakeForm, stakingInfo, handleStake, stakingStarted, handeAmountChange, handleDuration, userBalance, tokenSymbol }) {
  stakingInfo.multiplier = stakingInfo.multiplier || 0;
  stakingInfo.userReward = stakingInfo.userReward === 'NaN' ? 0 : stakingInfo.userReward;
  return (
    <form
      onSubmit={handleStake}
      className={'w-full flex flex-col gap-8 border border-gray-700 p-8 rounded-lg'}>
      <div className='w-full border border-gray-700 flex flex-col gap-4 justify-between p-8 rounded-2xl'>
        <h1 className='text-base md:text-xl font-bold'>Amount to stake</h1>
        <div className={'flex flex-col gap-1'}>
          <div className={'w-full flex items-center border border-gray-700 px-4 py-4 rounded-lg'}>
            <input
              placeholder={'0.0'}
              className='w-full bg-transparent focus:outline-none h-full'
              onChange={handeAmountChange}
              name='amount'
              value={stakeForm.stakeAmount || ''}
              required
              type='number'
            />
            <button
              type={'button'}
              className={'text-sm'}
              onClick={() => {
                if (stakeForm.stakeAmount <= 0) return;
                handeAmountChange({ target: { name: 'amount', value: userBalance } });
              }}>
              {stakeForm.stakeAmount > 0 ? 'Max' : tokenSymbol}
            </button>
          </div>
          <span className={'text-xs md:text-sm text-primary-type-medium ml-1'}>
            Balance:{' '}
            <span className={'orange-gradient-text'}>
              {calculateDot(userBalance - stakeForm.stakeAmount)} {tokenSymbol}
            </span>
          </span>
        </div>
        <div className={'w-full flex flex-col gap-4'}>
          <span className={'text-sm md:text-base'}>Duration</span>
          <div className={'w-full flex flex-col md:flex-row items-center gap-4'}>
            <div className={'flex flex-col gap-1 w-full'}>
              <div className={'w-full flex items-center border border-gray-700 gap-2 px-4 py-4 rounded-lg'}>
                <input
                  placeholder='Years'
                  className='w-full bg-transparent focus:outline-none h-full'
                  name={'years'}
                  value={stakeForm.stakeYears ? stakeForm.stakeYears : ''}
                  onChange={handleDuration}
                  type={'number'}
                  required={!stakeForm.stakeDays}
                />
                <span>Years</span>
              </div>
              <span className={'text-xs md:text-sm text-primary-type-medium ml-1'}>Min: {stakingInfo.minDurationDays} Days</span>
            </div>
            <div className={'flex flex-col gap-1 w-full'}>
              <div className={'w-full flex items-center border border-gray-700 gap-2 px-4 py-4 rounded-lg'}>
                <input
                  placeholder='Days'
                  className='w-full bg-transparent focus:outline-none h-full'
                  name={'days'}
                  value={stakeForm.stakeDays ? stakeForm.stakeDays : ''}
                  type={'number'}
                  onChange={handleDuration}
                  required={!stakeForm.stakeYears}
                />
                <span>Days</span>
              </div>
              <span className={'text-xs md:text-sm text-primary-type-medium mr-1'}>Max: {stakingInfo.maxDurationYears} Years</span>
            </div>
          </div>
        </div>
        <div className={'flex flex-col gap-4'}>
          <h2 className={'text-sm md:text-base'}>Details</h2>
          <div className={'flex flex-col items-center gap-4'}>
            <div className={'w-full flex flex-col md:flex-row items-center gap-4'}>
              <div className={'flex flex-col items-center justify-center w-full border border-gray-700 rounded-2xl p-4 gap-3'}>
                <span className={'text-primary-type-medium'}>Max Multiplier</span>
                <span className={'orange-gradient-text text-2xl font-bold'}>{stakingInfo.maxWeight}X</span>
              </div>
              <div className={'flex flex-col items-center justify-center w-full border border-gray-700 rounded-2xl p-4 gap-3'}>
                <span className={'text-primary-type-medium'}>Your Multiplier</span>
                <span className={'orange-gradient-text text-2xl font-bold'}>{stakingInfo.multiplier.toFixed(2)}X</span>
              </div>
            </div>
            <div className={'flex flex-col w-full items-center border border-gray-700 rounded-2xl p-4 gap-3'}>
              <span className={'text-primary-type-medium'}>Total Weight</span>
              <span className={'orange-gradient-text text-2xl font-bold'}>{stakingInfo.userReward}</span>
            </div>
          </div>
        </div>
        <button
          type={'submit'}
          disabled={stakingStarted || !stakeForm.stakeAmount || (!stakeForm.stakeYears && !stakeForm.stakeDays) || userBalance <= 0}
          className={'btn btn-success w-full text-white font-bold text-2xl'}>
          Stake {tokenSymbol}
        </button>
      </div>
    </form>
  );
}

export default StakeForm;
