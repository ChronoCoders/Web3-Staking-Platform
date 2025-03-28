// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract StakingPool is Ownable {
    // Token being staked
    IERC20 public stakingToken;
    
    // Token for rewards
    IERC20 public rewardToken;
    
    // Reward rate (tokens per second)
    uint256 public rewardRate;
    
    // Last update time
    uint256 public lastUpdateTime;
    
    // Reward per token stored
    uint256 public rewardPerTokenStored;
    
    // User reward per token paid
    mapping(address => uint256) public userRewardPerTokenPaid;
    
    // User rewards
    mapping(address => uint256) public rewards;
    
    // Total staked amount
    uint256 public totalStaked;
    
    // User staked amount
    mapping(address => uint256) public balances;
    
    // Events
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    
    constructor(address _stakingToken, address _rewardToken, uint256 _rewardRate) 
    Ownable(msg.sender) // Pass msg.sender as the initial owner
{
    stakingToken = IERC20(_stakingToken);
    rewardToken = IERC20(_rewardToken);
    rewardRate = _rewardRate;
    lastUpdateTime = block.timestamp;
}
    
    // Calculate the current reward per token
    function rewardPerToken() public view returns (uint256) {
        if (totalStaked == 0) {
            return rewardPerTokenStored;
        }
        
        return rewardPerTokenStored + (
            ((block.timestamp - lastUpdateTime) * rewardRate * 1e18) / totalStaked
        );
    }
    
    // Calculate earned rewards for a user
    function earned(address account) public view returns (uint256) {
        return (
            (balances[account] * (rewardPerToken() - userRewardPerTokenPaid[account])) / 1e18
        ) + rewards[account];
    }
    
    // Update reward variables
    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;
        
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }
    
    // Stake tokens
    function stake(uint256 amount) external updateReward(msg.sender) {
        require(amount > 0, "Cannot stake 0");
        
        totalStaked += amount;
        balances[msg.sender] += amount;
        
        // Transfer tokens from user to contract
        bool success = stakingToken.transferFrom(msg.sender, address(this), amount);
        require(success, "Token transfer failed");
        
        emit Staked(msg.sender, amount);
    }
    
    // Withdraw staked tokens
    function withdraw(uint256 amount) external updateReward(msg.sender) {
        require(amount > 0, "Cannot withdraw 0");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        totalStaked -= amount;
        balances[msg.sender] -= amount;
        
        // Transfer tokens from contract to user
        bool success = stakingToken.transfer(msg.sender, amount);
        require(success, "Token transfer failed");
        
        emit Withdrawn(msg.sender, amount);
    }
    
    // Claim rewards
    function getReward() external updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        
        if (reward > 0) {
            rewards[msg.sender] = 0;
            
            // Transfer reward tokens to user
            bool success = rewardToken.transfer(msg.sender, reward);
            require(success, "Reward transfer failed");
            
            emit RewardPaid(msg.sender, reward);
        }
    }
    
    // Exit: withdraw all tokens and claim rewards
function exit() external {
    uint256 amount = balances[msg.sender];
    if (amount > 0) {
        this.withdraw(amount);
    }
    this.getReward();
}
    
    // Update reward rate (only owner)
    function setRewardRate(uint256 _rewardRate) external onlyOwner updateReward(address(0)) {
        rewardRate = _rewardRate;
    }
    
    // Recover any ERC20 tokens sent to the contract by mistake (only owner)
    function recoverERC20(address tokenAddress, uint256 tokenAmount) external onlyOwner {
        // Ensure we're not taking staked tokens
        require(tokenAddress != address(stakingToken), "Cannot recover staking token");
        
        IERC20(tokenAddress).transfer(owner(), tokenAmount);
    }
}