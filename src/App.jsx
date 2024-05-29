import SolanaProvider from './SolanaProvider.jsx';
import StakingDetail from './StakingDetail.jsx';
import StakingForm from './StakeForm.jsx';

function App() {
  return (
    <SolanaProvider>
      {/*<div className={'w-full flex items-center justify-items-stretch gap-12 p-10'}>*/}
      {/*  <StakingForm />*/}
      {/*  <StakingDetail />*/}
      {/*</div>*/}
      <table>
        <thead>
          {['Amount', 'Weight', 'Staked At', 'Unlock Date', 'Remaining Days', 'Actions'].map((title, index) => (
            <th
              className={'p-1 font-medium text-base'}
              key={index}>
              {title}
            </th>
          ))}
        </thead>
        <tbody>
          <tr>
            <td>0.00000000 SOL</td>
            <td>0X</td>
            <td>2021-09-10</td>
            <td>2022-09-10</td>
            <td>365</td>
            <td>
              <button className={'btn btn-primary'}>Unstake</button>
            </td>
          </tr>
        </tbody>
      </table>
    </SolanaProvider>
  );
}

export default App;
