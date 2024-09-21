import { calculateDot } from '@helpers';

function StakingDetail({ stakingInfo, tokenSymbol }) {
  return (
    <div className={'w-full flex flex-col gap-4 justify-between'}>
      <div className={'w-full flex flex-col items-center justify-between gap-4 border border-gray-700 rounded-lg p-4'}>
        <h2>Total Staked</h2>
        <span>
          {calculateDot(stakingInfo.totalStaked)} {tokenSymbol}
        </span>
      </div>
      <div className={'w-full flex flex-col items-center justify-between gap-4 border border-gray-700 rounded-lg p-4'}>
        <h2>Avg Weight</h2>
        <span>{stakingInfo.avgWeight.toFixed(2)}X</span>
      </div>
      <div className={'w-full flex flex-col items-center justify-between gap-4 border border-gray-700 rounded-lg p-4'}>
        <h2>Total Weighted Stake</h2>
        <span>{calculateDot(stakingInfo.totalWeighted)}</span>
      </div>
    </div>
  );
}

export default StakingDetail;
