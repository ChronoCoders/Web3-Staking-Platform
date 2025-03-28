import React from 'react';

function StakingInfo({ stakingData, refreshData }) {
  const { stakedBalance, earnedRewards, tokenBalance, isLoading } = stakingData;
  
  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <div>Staking Information</div>
        <button 
          className="btn btn-sm btn-secondary" 
          onClick={refreshData}
          disabled={isLoading}
        >
          Refresh
        </button>
      </div>
      <div className="card-body">
        {isLoading ? (
          <div className="text-center py-4">
            <div className="loader"></div>
            <p className="mt-3">Loading data...</p>
          </div>
        ) : (
          <div className="row">
            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body text-center">
                  <h6>Available Balance</h6>
                  <div className="staking-info mt-2">{tokenBalance} STK</div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body text-center">
                  <h6>Staked Balance</h6>
                  <div className="staking-info mt-2">{stakedBalance} STK</div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body text-center">
                  <h6>Earned Rewards</h6>
                  <div className="staking-info mt-2">{earnedRewards} STK</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StakingInfo;