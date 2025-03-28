const { expect } = require("chai"); 
const { ethers } = require("hardhat"); 
 
describe("Simple StakingPool Test", function () { 
  it("Should deploy the contracts", async function() { 
    const [owner] = await ethers.getSigners(); 
    const RewardToken = await ethers.getContractFactory("RewardToken"); 
    const rewardToken = await RewardToken.deploy("Staking Token", "STK"); 
    console.log("RewardToken deployed at:", await rewardToken.getAddress()); 
    const rewardRate = ethers.parseEther("0.1"); 
    const StakingPool = await ethers.getContractFactory("StakingPool"); 
    const tokenAddress = await rewardToken.getAddress(); 
    const stakingPool = await StakingPool.deploy(tokenAddress, tokenAddress, rewardRate); 
    console.log("StakingPool deployed at:", await stakingPool.getAddress()); 
    expect(await stakingPool.stakingToken()).to.equal(tokenAddress); 
  }); 
}); 
