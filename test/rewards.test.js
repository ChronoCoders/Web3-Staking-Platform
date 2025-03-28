const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("StakingPool Rewards", function() {
  let rewardToken, stakingPool;
  let owner, user1;
  let tokenAddress, stakingPoolAddress;
  let rewardRate;

  beforeEach(async function() {
    [owner, user1] = await ethers.getSigners();
    
    // Deploy token
    const RewardToken = await ethers.getContractFactory("RewardToken");
    rewardToken = await RewardToken.deploy("Staking Token", "STK");
    tokenAddress = await rewardToken.getAddress();
    
    // Deploy staking pool
    rewardRate = ethers.parseEther("0.1");
    const StakingPool = await ethers.getContractFactory("StakingPool");
    stakingPool = await StakingPool.deploy(tokenAddress, tokenAddress, rewardRate);
    stakingPoolAddress = await stakingPool.getAddress();
    
    // Setup initial tokens
    await rewardToken.transfer(stakingPoolAddress, ethers.parseEther("100000"));
    await rewardToken.transfer(user1.address, ethers.parseEther("1000"));
  });

  it("should allow users to claim rewards", async function() {
    const stakeAmount = ethers.parseEther("100");
    
    // Approve and stake
    await rewardToken.connect(user1).approve(stakingPoolAddress, stakeAmount);
    await stakingPool.connect(user1).stake(stakeAmount);
    
    // Advance time
    await ethers.provider.send("evm_increaseTime", [10]);
    await ethers.provider.send("evm_mine");
    
    // Get initial balance
    const initialBalance = await rewardToken.balanceOf(user1.address);
    
    // Claim rewards
    await stakingPool.connect(user1).getReward();
    
    // Check new balance
    const newBalance = await rewardToken.balanceOf(user1.address);
    expect(newBalance).to.be.greaterThan(initialBalance);
  });
});