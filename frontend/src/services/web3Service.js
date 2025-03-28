import { ethers } from 'ethers';
import StakingPoolArtifact from '../contracts/StakingPool.json';
import RewardTokenArtifact from '../contracts/RewardToken.json';

// Contract addresses - replace with your deployed contract addresses
const CONTRACT_ADDRESSES = {
  1: { // Mainnet
    stakingPool: '0x1234567890abcdef1234567890abcdef12345678',
    rewardToken: '0xabcdef1234567890abcdef1234567890abcdef12'
  },
  5: { // Goerli
    stakingPool: '0x9876543210abcdef9876543210abcdef98765432',
    rewardToken: '0xfedcba9876543210fedcba9876543210fedcba98'
  },
  31337: { // Hardhat local
    stakingPool: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    rewardToken: '0x5FbDB2315678afecb367f032d93F642f64180aa3'
  }
};

class Web3Service {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.account = null;
    this.chainId = null;
    this.stakingPool = null;
    this.rewardToken = null;
  }
  
  async checkIfConnected() {
    if (window.ethereum) {
      try {
        this.provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await this.provider.listAccounts();
        
        if (accounts.length > 0) {
          this.signer = await this.provider.getSigner();
          this.account = await this.signer.getAddress();
          this.chainId = (await this.provider.getNetwork()).chainId;
          
          await this.initializeContracts();
          return true;
        }
      } catch (error) {
        console.error("Error checking connection:", error);
      }
    }
    
    return false;
  }
  
  async connectWallet() {
    if (!window.ethereum) {
      alert("Please install MetaMask to use this application");
      return false;
    }
    
    try {
      this.provider = new ethers.BrowserProvider(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      this.signer = await this.provider.getSigner();
      this.account = await this.signer.getAddress();
      this.chainId = (await this.provider.getNetwork()).chainId;
      
      await this.initializeContracts();
      return true;
    } catch (error) {
      console.error("Connection error:", error);
      return false;
    }
  }
  
  async initializeContracts() {
    // Get contract addresses for the current network
    const addresses = CONTRACT_ADDRESSES[this.chainId.toString()] || CONTRACT_ADDRESSES['31337'];
    
    if (!addresses) {
      console.error("Network not supported");
      return false;
    }
    
    // Initialize contracts
    this.stakingPool = new ethers.Contract(
      addresses.stakingPool,
      StakingPoolArtifact.abi,
      this.signer
    );
    
    this.rewardToken = new ethers.Contract(
      addresses.rewardToken,
      RewardTokenArtifact.abi,
      this.signer
    );
    
    return true;
  }
  
  async getStakedBalance() {
    if (!this.stakingPool || !this.account) return '0';
    
    try {
      const balance = await this.stakingPool.balances(this.account);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error("Error getting staked balance:", error);
      return '0';
    }
  }
  
  async getEarnedRewards() {
    if (!this.stakingPool || !this.account) return '0';
    
    try {
      const rewards = await this.stakingPool.earned(this.account);
      return ethers.formatEther(rewards);
    } catch (error) {
      console.error("Error getting earned rewards:", error);
      return '0';
    }
  }
  
  async getTokenBalance() {
    if (!this.rewardToken || !this.account) return '0';
    
    try {
      const balance = await this.rewardToken.balanceOf(this.account);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error("Error getting token balance:", error);
      return '0';
    }
  }
  
  async stakeTokens(amount) {
    if (!this.stakingPool || !this.rewardToken || !this.account) return false;
    
    try {
      const amountWei = ethers.parseEther(amount);
      
      // First approve tokens
      const approveTx = await this.rewardToken.approve(await this.stakingPool.getAddress(), amountWei);
      await approveTx.wait();
      
      // Then stake tokens
      const stakeTx = await this.stakingPool.stake(amountWei);
      await stakeTx.wait();
      
      return true;
    } catch (error) {
      console.error("Staking error:", error);
      return false;
    }
  }
  
  async withdrawTokens(amount) {
    if (!this.stakingPool || !this.account) return false;
    
    try {
      const amountWei = ethers.parseEther(amount);
      
      const tx = await this.stakingPool.withdraw(amountWei);
      await tx.wait();
      
      return true;
    } catch (error) {
      console.error("Withdrawal error:", error);
      return false;
    }
  }
  
  async claimRewards() {
    if (!this.stakingPool || !this.account) return false;
    
    try {
      const tx = await this.stakingPool.getReward();
      await tx.wait();
      
      return true;
    } catch (error) {
      console.error("Claim rewards error:", error);
      return false;
    }
  }
}

export default new Web3Service();