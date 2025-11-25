// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IWETH
 * @notice Interface for Wrapped ETH (WETH) contract
 * @dev Used for wrapping/unwrapping ETH for Aave V3 compatibility
 */
interface IWETH {
    /**
     * @notice Deposit ETH and receive WETH
     * @dev Wraps native ETH into WETH token
     */
    function deposit() external payable;

    /**
     * @notice Withdraw WETH and receive ETH
     * @dev Unwraps WETH back to native ETH
     * @param amount Amount of WETH to unwrap
     */
    function withdraw(uint256 amount) external;

    /**
     * @notice Get WETH balance of an address
     * @param account Address to check
     * @return WETH balance
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @notice Approve WETH spending
     * @param spender Address to approve
     * @param amount Amount to approve
     * @return success True if approval succeeded
     */
    function approve(address spender, uint256 amount) external returns (bool);
}
