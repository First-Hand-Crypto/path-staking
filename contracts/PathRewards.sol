//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

pragma solidity ^0.8.0;

contract PathRewards {
    IERC20 public token;

    uint public totalRewardTokens = 150000000 * 1e18;
    uint public rewardRate = totalRewardTokens / (365 * 86400);
    uint public lastUpdateTime;
    uint public rewardPerTokenStored;
    uint public stakedSupply = 0;

    // last time
    uint private lastRewardTimestamp;

    mapping(address => uint) public userRewardperTokenPaid;
    mapping(address => uint) public rewards;
    mapping(address => uint) private _balances;

    event Staked(address indexed user, uint amountStaked);
    event Withdrawn(address indexed user, uint amountWithdrawn);
    event RewardsClaimed(address indexed user, uint rewardsClaimed);

    constructor(IERC20  _token) {
        token = _token;
        //rewards will end one year after contract creation
        lastRewardTimestamp = block.timestamp + (365 * 86400);
    }

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = rewardTimestamp();
        if (account != address(0)){
            rewards[account] = earned(account);
            userRewardperTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    //function to check if staking rewards have ended
    function rewardTimestamp() internal view returns (uint) {
        if (block.timestamp < lastRewardTimestamp) {
            return block.timestamp;
        }
        else {
            return lastRewardTimestamp;
        }
    }

    function balanceOf(address account) external view returns (uint) {
        return _balances[account];
    }

    function rewardPerToken() public view returns (uint) {
        if (stakedSupply == 0) {
            return 0;
        }
        return rewardPerTokenStored + (
            rewardRate * (rewardTimestamp()- lastUpdateTime) * 1e18 / stakedSupply
        );
    }

    function earned(address account) public view returns (uint) {
        return (
            _balances[account] * (rewardPerToken() - userRewardperTokenPaid[account]) / 1e18
        ) + rewards[account];
    }

    function stake(uint _amount) external updateReward(msg.sender) {
        require(_amount > 0, "Must stake > 0 tokens");
        stakedSupply += _amount;
        _balances[msg.sender] += _amount;
        token.transferFrom(msg.sender, address(this), _amount);
        emit Staked(msg.sender, _amount);
    }

    function withdraw(uint _amount) public updateReward(msg.sender) {
        require(_amount > 0, "Must withdraw > 0 tokens");
        stakedSupply -= _amount;
        _balances[msg.sender] -= _amount;
        token.transfer(msg.sender, _amount);
        emit Withdrawn(msg.sender, _amount);
    }

    function getReward() public updateReward(msg.sender) {
        uint reward = rewards[msg.sender];
        rewards[msg.sender] = 0;
        token.transfer(msg.sender, reward);
        emit RewardsClaimed(msg.sender, reward);
    }

    function exit() external {
        withdraw(_balances[msg.sender]);
        getReward();
    }
}
