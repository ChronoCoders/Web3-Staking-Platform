const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("StakingPool", function() {
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

  it("should deploy correctly", async function() {
    expect(await stakingPool.stakingToken()).to.equal(tokenAddress);
    expect(await stakingPool.rewardToken()).to.equal(tokenAddress);
    expect(await stakingPool.rewardRate()).to.equal(rewardRate);
  });

  it("should allow users to stake tokens", async function() {
    const stakeAmount = ethers.parseEther("100");
    
    // Approve and stake
    await rewardToken.connect(user1).approve(stakingPoolAddress, stakeAmount);
    await stakingPool.connect(user1).stake(stakeAmount);
    
    // Check balances
    expect(await stakingPool.balances(user1.address)).to.equal(stakeAmount);
    expect(await stakingPool.totalStaked()).to.equal(stakeAmount);
  });

  it("should distribute rewards correctly", async function() {
    const stakeAmount = ethers.parseEther("100");
    
    // Approve and stake
    await rewardToken.connect(user1).approve(stakingPoolAddress, stakeAmount);
    await stakingPool.connect(user1).stake(stakeAmount);
    
    // Advance time
    await ethers.provider.send("evm_increaseTime", [10]);
    await ethers.provider.send("evm_mine");
    
    // Check rewards
    const earned = await stakingPool.earned(user1.address);
    const expectedReward = ethers.parseEther("1"); // 0.1 tokens/sec * 10 seconds
    
    expect(earned).to.be.closeTo(expectedReward, ethers.parseEther("0.1"));
  });

  it("should allow users to withdraw tokens", async function() {
    const stakeAmount = ethers.parseEther("100");
    
    // Approve and stake
    await rewardToken.connect(user1).approve(stakingPoolAddress, stakeAmount);
    await stakingPool.connect(user1).stake(stakeAmount);
    
    // Get initial balance
    const initialBalance = await rewardToken.balanceOf(user1.address);
    
    // Withdraw half
    const withdrawAmount = ethers.parseEther("50");
    await stakingPool.connect(user1).withdraw(withdrawAmount);
    
    // Check balances
    expect(await stakingPool.balances(user1.address)).to.equal(stakeAmount - withdrawAmount);
    expect(await rewardToken.balanceOf(user1.address)).to.equal(initialBalance + withdrawAmount);
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