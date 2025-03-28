const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("StakingPool", function () {
  let RewardToken, rewardToken;
  let StakingPool, stakingPool;
  let owner, user1, user2;
  let rewardRate;
  let tokenAddress;

  beforeEach(async function () {
    // Get signers
    [owner, user1, user2] = await ethers.getSigners();
    
    // Deploy RewardToken
    RewardToken = await ethers.getContractFactory("RewardToken");
    rewardToken = await RewardToken.deploy("Staking Token", "STK");
    tokenAddress = await rewardToken.getAddress();
    
    // Set reward rate (0.1 tokens per second)
    rewardRate = ethers.parseEther("0.1");
    
    // Deploy StakingPool
    StakingPool = await ethers.getContractFactory("StakingPool");
    stakingPool = await StakingPool.deploy(
      tokenAddress,
      tokenAddress,
      rewardRate
    );
    
    // Transfer initial rewards to StakingPool
    const stakingPoolAddress = await stakingPool.getAddress();
    const initialRewardAmount = ethers.parseEther("100000");
    await rewardToken.transfer(stakingPoolAddress, initialRewardAmount);
    
    // Transfer some tokens to users for testing
    await rewardToken.transfer(user1.address, ethers.parseEther("1000"));
    await rewardToken.transfer(user2.address, ethers.parseEther("1000"));
  });

  it("should initialize with correct values", async function () {
    expect(await stakingPool.stakingToken()).to.equal(tokenAddress);
    expect(await stakingPool.rewardToken()).to.equal(tokenAddress);
    expect(await stakingPool.rewardRate()).to.equal(rewardRate);
  });

  it("should allow users to stake tokens", async function () {
    const stakeAmount = ethers.parseEther("100");
    const stakingPoolAddress = await stakingPool.getAddress();
    
    // Approve tokens for staking
    await rewardToken.connect(user1).approve(stakingPoolAddress, stakeAmount);
    
    // Stake tokens
    await stakingPool.connect(user1).stake(stakeAmount);
    
    // Check staked balance
    expect(await stakingPool.balances(user1.address)).to.equal(stakeAmount);
    expect(await stakingPool.totalStaked()).to.equal(stakeAmount);
  });

  it("should distribute rewards correctly", async function () {
    const stakeAmount = ethers.parseEther("100");
    const stakingPoolAddress = await stakingPool.getAddress();
    
    // Approve and stake tokens
    await rewardToken.connect(user1).approve(stakingPoolAddress, stakeAmount);
    await stakingPool.connect(user1).stake(stakeAmount);
    
    // Advance time by 10 seconds
    await ethers.provider.send("evm_increaseTime", [10]);
    await ethers.provider.send("evm_mine");
    
    // Check earned rewards - should be approximately 1 token (0.1 * 10 seconds)
    const earned = await stakingPool.earned(user1.address);
    
    // Allow some margin of error in the reward calculation
    const expectedReward = ethers.parseEther("1"); 
    const marginOfError = ethers.parseEther("0.1");
    
    expect(earned).to.be.at.least(expectedReward.sub(marginOfError));
    expect(earned).to.be.at.most(expectedReward.add(marginOfError));
  });

  it("should allow users to withdraw tokens", async function () {
    const stakeAmount = ethers.parseEther("100");
    const stakingPoolAddress = await stakingPool.getAddress();
    
    // Approve and stake tokens
    await rewardToken.connect(user1).approve(stakingPoolAddress, stakeAmount);
    await stakingPool.connect(user1).stake(stakeAmount);
    
    // Check initial balance
    const initialBalance = await rewardToken.balanceOf(user1.address);
    
    // Withdraw half of staked tokens
    const withdrawAmount = ethers.parseEther("50");
    await stakingPool.connect(user1).withdraw(withdrawAmount);
    
    // Check balances after withdrawal
    const expectedRemaining = stakeAmount - withdrawAmount;
    const expectedNewBalance = initialBalance + withdrawAmount;
    
    expect(await stakingPool.balances(user1.address)).to.equal(expectedRemaining);
    expect(await rewardToken.balanceOf(user1.address)).to.equal(expectedNewBalance);
  });