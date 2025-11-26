// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "./Vault.sol";

/**
 * @title VaultFactory
 * @notice Factory contract for deploying savings vaults using minimal proxies
 * @dev Uses EIP-1167 minimal proxy pattern for gas-efficient vault deployment
 */
contract VaultFactory {
    // ============ Immutable State ============

    address public immutable vaultImplementation;
    address public immutable aavePool;
    address public immutable usdc;

    address public constant WETH = 0x4200000000000000000000000000000000000006;

    // ============ Structs ============

    struct TokenInfo {
        bool supported;
        uint8 decimals;
        string symbol;
    }

    // ============ State Variables ============

    address[] public allVaults;
    mapping(address => address[]) public userVaults; // creator => vaults
    mapping(address => bool) public isVault; // Quick lookup
    mapping(address => TokenInfo) public supportedTokens; // Token whitelist

    // ============ Events ============

    event VaultCreated(
        address indexed vault,
        address indexed creator,
        uint256 goalAmount,
        string metadataURI,
        string description,
        address indexed token,
        uint8 tokenDecimals,
        address beneficiary,
        uint256 timestamp,
        uint256 vaultIndex
    );

    // ============ Errors ============

    error InvalidGoalAmount();
    error InvalidMetadata();
    error UnsupportedToken();
    error InvalidDecimals();

    // ============ Constructor ============

    /**
     * @notice Deploy the factory with implementation and Aave config
     * @param _vaultImplementation Address of Vault implementation contract
     * @param _aavePool Aave V3 Pool address on Base
     * @param _usdc USDC token address on Base
     */
    constructor(address _vaultImplementation, address _aavePool, address _usdc) {
        vaultImplementation = _vaultImplementation;
        aavePool = _aavePool;
        usdc = _usdc;

        // Initialize supported tokens whitelist
        supportedTokens[address(0)] = TokenInfo(true, 18, "ETH");
        supportedTokens[_usdc] = TokenInfo(true, 6, "USDC");
    }

    // ============ Core Functions ============

    /**
     * @notice Create a new savings vault
     * @param _goalAmount Target amount in token decimals
     * @param _metadataURI DB ID for title
     * @param _description Detailed description
     * @param _token Token address (address(0) for ETH)
     * @param _tokenDecimals Token decimals (6 or 18)
     * @param _beneficiary Address that receives funds (address(0) defaults to creator)
     * @return vault Address of newly deployed vault
     */
    function createVault(
        uint256 _goalAmount,
        string calldata _metadataURI,
        string calldata _description,
        address _token,
        uint8 _tokenDecimals,
        address _beneficiary
    ) external returns (address vault) {
        // Validation
        if (_goalAmount == 0) revert InvalidGoalAmount();
        if (bytes(_metadataURI).length == 0) revert InvalidMetadata();
        if (!supportedTokens[_token].supported) revert UnsupportedToken();
        if (_tokenDecimals != supportedTokens[_token].decimals) revert InvalidDecimals();

        // Deploy minimal proxy clone
        vault = Clones.clone(vaultImplementation);

        // Initialize the vault
        Vault(payable(vault)).initialize(
            msg.sender, // creator
            _goalAmount,
            _metadataURI,
            _description,
            aavePool,
            _token,
            _tokenDecimals,
            _beneficiary
        );

        // Track vault
        uint256 vaultIndex = allVaults.length;
        allVaults.push(vault);
        userVaults[msg.sender].push(vault);
        isVault[vault] = true;

        emit VaultCreated(
            vault,
            msg.sender,
            _goalAmount,
            _metadataURI,
            _description,
            _token,
            _tokenDecimals,
            _beneficiary == address(0) ? msg.sender : _beneficiary,
            block.timestamp,
            vaultIndex
        );

        return vault;
    }

    // ============ View Functions ============

    /**
     * @notice Get total number of vaults created
     * @return Total vault count
     */
    function getVaultCount() external view returns (uint256) {
        return allVaults.length;
    }

    /**
     * @notice Get all vaults created by a user
     * @param user Creator address
     * @return Array of vault addresses
     */
    function getUserVaults(address user) external view returns (address[] memory) {
        return userVaults[user];
    }

    /**
     * @notice Get a specific vault by index
     * @param index Vault index in allVaults array
     * @return Vault address
     */
    function getVault(uint256 index) external view returns (address) {
        return allVaults[index];
    }

    /**
     * @notice Get vaults in a specific range
     * @param start Start index (inclusive)
     * @param end End index (exclusive)
     * @return vaults Array of vault addresses
     */
    function getVaults(uint256 start, uint256 end)
        external
        view
        returns (address[] memory vaults)
    {
        require(start < end && end <= allVaults.length, "Invalid range");

        vaults = new address[](end - start);
        for (uint256 i = start; i < end; i++) {
            vaults[i - start] = allVaults[i];
        }
    }

    /**
     * @notice Get all vaults (use with caution on mainnet)
     * @return Array of all vault addresses
     */
    function getAllVaults() external view returns (address[] memory) {
        return allVaults;
    }

    /**
     * @notice Check if an address is a vault created by this factory
     * @param vault Address to check
     * @return true if vault was created by this factory
     */
    function isVaultValid(address vault) external view returns (bool) {
        return isVault[vault];
    }
}
