const { expect } = require("chai"); 
const { ethers } = require("hardhat"); 
describe("Basic test", function () { 
  it("Should deploy the contracts", async function() { 
    const RewardToken = await ethers.getContractFactory("RewardToken"); 
    const rewardToken = await RewardToken.deploy("Staking Token", "STK"); 
    expect(await rewardToken.name()).to.equal("Staking Token"); 
  }); 
}); 
