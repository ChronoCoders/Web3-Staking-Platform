import React, { useState } from 'react';

function StakingActions({ stakingData, onStake, onWithdraw, onClaim }) {
  const [stakeAmount, setStakeAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const { tokenBalance, stakedBalance, earnedRewards, isLoading } = stakingData;
  
  const handleStake = () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) return;
    onStake(stakeAmount);
    setStakeAmount('');
  };
  
  const handleWithdraw = () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return;
    onWithdraw(withdrawAmount);
    setWithdrawAmount('');
  };
  
  const handleMaxStake = () => {
    setStakeAmount(tokenBalance);
  };
  
  const handleMaxWithdraw = () => {
    setWithdrawAmount(stakedBalance);
  };
  
  return (
    <div className="card">
      <div className="card-header">Staking Actions</div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">Stake Tokens</h5>
                <div className="input-group mb-3">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Amount to stake"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    disabled={isLoading}
                  />
                  <button 
                    className="btn btn-outline-secondary" 
                    type="button"
                    onClick={handleMaxStake}
                    disabled={isLoading}
                  >
                    Max
                  </button>
                </div>
                <div className="d-grid">
                  <button 
                    className="btn btn-primary" 
                    onClick={handleStake}
                    disabled={isLoading || !stakeAmount || parseFloat(stakeAmount) <= 0 || parseFloat(stakeAmount) > parseFloat(tokenBalance)}
                  >
                    Stake
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">Withdraw Tokens</h5>
                <div className="input-group mb-3">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Amount to withdraw"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    disabled={isLoading}
                  />
                  <button 
                    className="btn btn-outline-secondary" 
                    type="button"
                    onClick={handleMaxWithdraw}
                    disabled={isLoading}
                  >
                    Max
                  </button>
                </div>
                <div className="d-grid">
                  <button 
                    className="btn btn-warning" 
                    onClick={handleWithdraw}
                    disabled={isLoading || !withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > parseFloat(stakedBalance)}
                  >
                    Withdraw
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">Claim Rewards</h5>
                <p>Available Rewards: {earnedRewards} STK</p>
                <div className="d-grid">
                  <button 
                    className="btn btn-success" 
                    onClick={onClaim}
                    disabled={isLoading || parseFloat(earnedRewards) <= 0}
                  >
                    Claim Rewards
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StakingActions;