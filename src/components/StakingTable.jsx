import { useState } from 'react';

function StakingTable({ userStakingInfo, handleClaim, handleWithdraw }) {
  const [data, setData] = useState(userStakingInfo);

  const onFillFakeData = () => {
    setData([
      {
        isFake: true,
        amount: 10,
        weight: 2.5,
        stakedAt: 1635331200000,
        unlockedAt: 1635331200000,
        remainingDays: 10,
      },
      {
        isFake: true,
        amount: 20,
        weight: 3.5,
        stakedAt: 1635331200000,
        unlockedAt: 1635331200000,
        remainingDays: 20,
      },
      {
        isFake: true,
        amount: 30,
        weight: 4.5,
        stakedAt: 1635331200000,
        unlockedAt: 1635331200000,
        remainingDays: 30,
      },
    ]);
  };

  return (
    <div className={'w-full mx-auto border p-4 rounded-lg border-gray-700'}>
      <button
        onClick={onFillFakeData}
        className={'btn btn-error text-white mb-4'}>
        <span className={'text-primary-type-medium'}>Fill fake data</span>
      </button>
      <table className='w-full'>
        <thead className={'text-primary-type-medium text-left'}>
          <tr>
            {['Amount', 'Weight', 'Staked At', 'Unlock Date', 'Remaining Days', 'Actions'].map((title, index) => (
              <th
                className={'p-1 font-medium text-sm md:text-base'}
                key={index}>
                {title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {!data.length ? (
            <tr className={'border-b border-gray-700 text-lg'}>
              <td
                className={'p-2 orange-gradient-text font-bold'}
                colSpan={6}>
                No active stakes
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr
                className={'border-b border-gray-700 text-sm md:text-lg'}
                key={index}>
                <td className={'p-2 orange-gradient-text font-bold'}>{item.amount}</td>
                <td className={'p-2 orange-gradient-text font-bold'}>{item.weight.toFixed(2)}X</td>
                <td className={'p-2 orange-gradient-text font-bold min-w-20'}>
                  {' '}
                  {new Date(item.stakedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    day: '2-digit',
                    hour12: true,
                  })}
                </td>
                <td className={'p-2 orange-gradient-text font-bold min-w-20'}>
                  {new Date(item.unlockedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    day: '2-digit',
                    hour12: true,
                  })}
                </td>
                <td className={'p-2 orange-gradient-text font-bold'}>{item.remainingDays}</td>
                <td className={'p-2 font-bold flex gap-2 items-end'}>
                  <button
                    className={'btn btn-primary text-white'}
                    onClick={() =>
                      handleClaim({
                        nonce: index,
                      })
                    }>
                    Claim
                  </button>
                  <button
                    onClick={() => handleWithdraw({ nonce: index })}
                    className={'btn btn-info text-white'}>
                    Withdraw
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default StakingTable;
