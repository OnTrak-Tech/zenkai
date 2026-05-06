// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title ZenkaiTreasury
 * @dev Holds protocol fees collected from ZenkaiEscrow.
 */
contract ZenkaiTreasury is Ownable {
    using SafeERC20 for IERC20;

    event Withdrawn(address indexed token, address indexed to, uint256 amount);

    constructor(address initialOwner) Ownable(initialOwner) {}

    /**
     * @dev Withdraws tokens from the treasury. Only the owner can call this.
     * @param token Address of the ERC20 token (e.g., cUSD).
     * @param to Address to send the tokens to.
     * @param amount Amount to withdraw.
     */
    function withdraw(address token, address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Cannot withdraw to zero address");
        require(amount > 0, "Amount must be greater than zero");
        
        IERC20(token).safeTransfer(to, amount);
        
        emit Withdrawn(token, to, amount);
    }
}
