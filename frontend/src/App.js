import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import WalletConnect from './components/WalletConnect';
import StakingInfo from './components/StakingInfo';
import StakingActions from './components/StakingActions';
import web3Service from './services/web3Service';

function App() {
  const [account, setAccount] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [stakingData, setStakingData] = useState({
    stakedBalance: '0',
    earnedRewards: '0',
    tokenBalance: '0',
    isLoading: false
  });

  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await web3Service.checkIfConnected();
      if (isConnected) {
        setAccount(web3Service.account);
        loadData();
      }
    };

    checkConnection();
  }, []);

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      const connected = await web3Service.connectWallet();
      if (connected) {
        setAccount(web3Service.account);
        loadData();
      }
    } catch (error) {
      console.error("Connection error:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const loadData = async () => {
    setStakingData(prev => ({ ...prev, isLoading: true }));
    
    try {
      const stakedBalance = await web3Service.getStakedBalance();
      const earnedRewards = await web3Service.getEarnedRewards();
      const tokenBalance = await web3Service.getTokenBalance();
      
      setStakingData({
        stakedBalance,
        earnedRewards,
        tokenBalance,
        isLoading: false
      });
    } catch (error) {
      console.error("Error loading data:", error);
      setStakingData(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleStake = async (amount) => {
    setStakingData(prev => ({ ...prev, isLoading: true }));
    
    try {
      const success = await web3Service.stakeTokens(amount);
      if (success) {
        loadData();
      }
    } catch (error) {
      console.error("Staking error:", error);
      setStakingData(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleWithdraw = async (amount) => {
    setStakingData(prev => ({ ...prev, isLoading: true }));
    
    try {
      const success = await web3Service.withdrawTokens(amount);
      if (success) {
        loadData();
      }
    } catch (error) {
      console.error("Withdrawal error:", error);
      setStakingData(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleClaim = async () => {
    setStakingData(prev => ({ ...prev, isLoading: true }));
    
    try {
      const success = await web3Service.claimRewards();
      if (success) {
        loadData();
      }
    } catch (error) {
      console.error("Claim rewards error:", error);
      setStakingData(prev => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <div className="container">
      <Header />
      
      <div className="row">
        <div className="col-12">
          <WalletConnect 
            account={account} 
            connectWallet={connectWallet} 
            isConnecting={isConnecting} 
          />
        </div>
      </div>
      
      {account && (
        <>
          <div className="row mt-4">
            <div className="col-12">
              <StakingInfo 
                stakingData={stakingData} 
                refreshData={loadData} 
              />
            </div>
          </div>
          
          <div className="row mt-4">
            <div className="col-12">
              <StakingActions 
                stakingData={stakingData}
                onStake={handleStake}
                onWithdraw={handleWithdraw}
                onClaim={handleClaim}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;