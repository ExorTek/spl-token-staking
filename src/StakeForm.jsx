function StakeForm() {
  return (
    <form className={'w-full flex flex-col gap-8 border border-gray-700 p-8 rounded-lg'}>
      <div className={'w-full flex flex-col gap-4'}>
        <h1>Amount to stake</h1>
        <div className={'flex flex-col items-start gap-2 w-full'}>
          <input
            type='number'
            placeholder='Amount'
            className='input input-bordered w-full'
          />
          <div className={'text-sm flex items-center gap-2'}>
            <span className={''}>Balance</span>
            <span className={''}>0.00000000 SOL</span>
          </div>
        </div>
        <div className={'flex items-center gap-4 w-full'}>
          <div className={'flex flex-col items-start gap-2 w-full'}>
            <input
              type='number'
              placeholder='Years'
              className='input input-bordered w-full'
            />
            <div className={'text-sm flex items-center gap-2'}>
              <span className={''}>Min:</span>
              <span className={''}>30 Days</span>
            </div>
          </div>
          <div className={'flex flex-col items-start gap-2 w-full'}>
            <input
              type='number'
              placeholder='Days'
              className='input input-bordered w-full'
            />
            <div className={'text-sm flex items-center gap-2'}>
              <span className={''}>Max:</span>
              <span className={''}> 1 Years</span>
            </div>
          </div>
        </div>
      </div>
      <div className={'w-full flex flex-col gap-4'}>
        <h1>Details</h1>
        <div className={'flex items-center gap-6'}>
          <div className={'w-full h-32 border border-gray-700 rounded-lg flex flex-col gap-2 items-center justify-center'}>
            <span className={''}>Max Multiplier</span>
            <span>5X</span>
          </div>
          <div className={'w-full h-32 border border-gray-700 rounded-lg flex flex-col gap-2 items-center justify-center'}>
            <span className={''}>Your Multiplier</span>
            <span>0X</span>
          </div>
        </div>
        <div className={'w-full h-32 border border-gray-700 rounded-lg flex flex-col gap-2 items-center justify-center'}>
          <span className={''}>Total Weight </span>
          <span>0</span>
        </div>
      </div>
      <button className={'btn btn-success w-full text-white font-bold text-2xl'}>Stake</button>
    </form>
  );
}

export default StakeForm;
