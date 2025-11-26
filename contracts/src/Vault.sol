// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@aave/core-v3/interfaces/IPool.sol";
import "./interfaces/IWETH.sol";

/**
 * @title Vault
 * @notice Individual savings vault with automatic Aave yield generation
 * @dev Minimal proxy clone deployed by VaultFactory
 */
contract Vault is Initializable {
    // ============ State Variables ============

    address public creator;
    address public beneficiary; // Address that receives funds when vault is withdrawn/smashed
    uint256 public goalAmount;
    string public metadataURI; // DB ID for title
    string public description; // Detailed description

    address public aavePool;
    address public token; // address(0) for ETH, ERC20 address for tokens
    uint8 public tokenDecimals; // 6 for USDC, 18 for ETH
    address public aToken; // Aave interest-bearing token (set after first deposit)

    address public constant WETH = 0x4200000000000000000000000000000000000006;

    uint256 public totalContributed;
    mapping(address => uint256) public contributions;
    address[] public contributors;
    mapping(address => bool) private _isContributor; // Prevent duplicate entries

    bool public isWithdrawn;

    // ============ Events ============

    event Contributed(
        address indexed contributor,
        uint256 amount,
        uint256 totalContributed,
        uint256 currentYield,
        uint256 timestamp
    );

    event Withdrawn(
        address indexed creator,
        uint256 principal,
        uint256 yield,
        uint256 total,
        uint256 timestamp
    );

    event Smashed(
        address indexed creator,
        uint256 principal,
        uint256 yield,
        uint256 total,
        uint256 timestamp
    );

    // ============ Errors ============

    error NotCreator();
    error AlreadyWithdrawn();
    error InvalidAmount();
    error TransferFailed();
    error GoalNotReached();

    // ============ Modifiers ============

    modifier onlyCreator() {
        if (msg.sender != creator) revert NotCreator();
        _;
    }

    modifier notWithdrawn() {
        if (isWithdrawn) revert AlreadyWithdrawn();
        _;
    }

    // ============ Initialize (called by factory) ============

    /**
     * @notice Initialize the vault (replaces constructor for clones)
     * @param _creator Address of vault creator
     * @param _goalAmount Target amount in token decimals
     * @param _metadataURI DB ID for title
     * @param _description Detailed description
     * @param _aavePool Aave V3 Pool address
     * @param _token Token address (address(0) for ETH)
     * @param _tokenDecimals Token decimals (6 for USDC, 18 for ETH)
     * @param _beneficiary Address that receives funds (defaults to creator if address(0))
     */
    function initialize(
        address _creator,
        uint256 _goalAmount,
        string calldata _metadataURI,
        string calldata _description,
        address _aavePool,
        address _token,
        uint8 _tokenDecimals,
        address _beneficiary
    ) external initializer {
        creator = _creator;
        goalAmount = _goalAmount;
        metadataURI = _metadataURI;
        description = _description;
        aavePool = _aavePool;
        token = _token;
        tokenDecimals = _tokenDecimals;

        // If beneficiary not specified, creator receives funds
        beneficiary = _beneficiary == address(0) ? _creator : _beneficiary;
    }

    // ============ Core Functions ============

    /**
     * @notice Contribute to the vault (ETH or ERC20)
     * @param amount Amount to contribute in token decimals
     */
    function contribute(uint256 amount) external payable notWithdrawn {
        if (amount == 0) revert InvalidAmount();

        address depositToken;

        // Handle ETH vs ERC20
        if (token == address(0)) {
            // ETH vault
            if (msg.value != amount) revert InvalidAmount();

            // Wrap ETH to WETH
            IWETH(WETH).deposit{value: amount}();
            depositToken = WETH;
        } else {
            // ERC20 vault
            if (msg.value != 0) revert InvalidAmount();

            // Transfer ERC20 from contributor
            if (!IERC20(token).transferFrom(msg.sender, address(this), amount)) {
                revert TransferFailed();
            }
            depositToken = token;
        }

        // Track contribution
        if (!_isContributor[msg.sender]) {
            contributors.push(msg.sender);
            _isContributor[msg.sender] = true;
        }
        contributions[msg.sender] += amount;
        totalContributed += amount;

        // Deposit to Aave
        IERC20(depositToken).approve(aavePool, amount);
        IPool(aavePool).supply(depositToken, amount, address(this), 0);

        // Get aToken address if first deposit
        if (aToken == address(0)) {
            aToken = IPool(aavePool).getReserveData(depositToken).aTokenAddress;
        }

        uint256 currentYield = aToken != address(0)
            ? (IERC20(aToken).balanceOf(address(this)) > totalContributed
                ? IERC20(aToken).balanceOf(address(this)) - totalContributed
                : 0)
            : 0;

        emit Contributed(msg.sender, amount, totalContributed, currentYield, block.timestamp);
    }

    /**
     * @notice Withdraw funds when goal is reached (creator only)
     */
    function withdraw() external onlyCreator notWithdrawn {
        if (totalContributed < goalAmount) revert GoalNotReached();

        isWithdrawn = true;

        // Withdraw from Aave (principal + yield)
        uint256 aTokenBalance = IERC20(aToken).balanceOf(address(this));

        if (token == address(0)) {
            // ETH vault: withdraw WETH from Aave, unwrap, send ETH to beneficiary
            IPool(aavePool).withdraw(WETH, aTokenBalance, address(this));
            IWETH(WETH).withdraw(aTokenBalance);

            (bool success, ) = beneficiary.call{value: aTokenBalance}("");
            if (!success) revert TransferFailed();
        } else {
            // ERC20 vault: withdraw directly to beneficiary
            IPool(aavePool).withdraw(token, aTokenBalance, beneficiary);
        }

        uint256 principal = totalContributed;
        uint256 yield = aTokenBalance > principal ? aTokenBalance - principal : 0;

        emit Withdrawn(beneficiary, principal, yield, aTokenBalance, block.timestamp);
    }

    /**
     * @notice Smash the vault early (withdraw even if goal not reached)
     * @dev Creator can withdraw funds at any time
     */
    function smash() external onlyCreator notWithdrawn {
        isWithdrawn = true;

        uint256 aTokenBalance = aToken != address(0) ? IERC20(aToken).balanceOf(address(this)) : 0;

        // Withdraw from Aave if there are funds
        if (aTokenBalance > 0) {
            if (token == address(0)) {
                // ETH vault: withdraw WETH, unwrap, send ETH to beneficiary
                IPool(aavePool).withdraw(WETH, aTokenBalance, address(this));
                IWETH(WETH).withdraw(aTokenBalance);

                (bool success, ) = beneficiary.call{value: aTokenBalance}("");
                if (!success) revert TransferFailed();
            } else {
                // ERC20 vault: withdraw directly to beneficiary
                IPool(aavePool).withdraw(token, aTokenBalance, beneficiary);
            }
        }

        uint256 principal = totalContributed;
        uint256 yield = aTokenBalance > principal ? aTokenBalance - principal : 0;

        emit Smashed(beneficiary, principal, yield, aTokenBalance, block.timestamp);
    }

    // ============ View Functions ============

    /**
     * @notice Get vault progress
     * @return current Current contributed amount
     * @return goal Goal amount
     * @return percentage Progress percentage (can exceed 100)
     */
    function getProgress()
        external
        view
        returns (uint256 current, uint256 goal, uint256 percentage)
    {
        current = totalContributed;
        goal = goalAmount;
        percentage = goalAmount > 0 ? (totalContributed * 100) / goalAmount : 0;
    }

    /**
     * @notice Get current balance including yield
     * @return principal Total contributed (principal)
     * @return yield Accumulated yield from Aave
     * @return total Total balance (principal + yield)
     */
    function getCurrentBalance()
        external
        view
        returns (uint256 principal, uint256 yield, uint256 total)
    {
        principal = totalContributed;
        total = aToken != address(0) ? IERC20(aToken).balanceOf(address(this)) : 0;
        yield = total > principal ? total - principal : 0;
    }

    /**
     * @notice Get current APY from Aave for the vault's token
     * @return apy Annual Percentage Yield in basis points (10000 = 100%)
     */
    function getCurrentAPY() external view returns (uint256 apy) {
        if (aToken == address(0)) return 0;

        // Get reserve data from Aave and extract currentLiquidityRate
        // liquidityRate is in ray (1e27), convert to basis points (1e4)
        // APY = (liquidityRate / 1e27) * 10000
        address reserveAsset = token == address(0) ? WETH : token;
        apy = IPool(aavePool).getReserveData(reserveAsset).currentLiquidityRate / 1e23; // 1e27 / 1e4 = 1e23
    }

    /**
     * @notice Get detailed yield statistics
     * @return principal Total contributed amount
     * @return currentBalance Current balance (principal + yield)
     * @return yieldEarned Accumulated yield from Aave
     * @return yieldPercentage Yield percentage in basis points (10000 = 100%)
     * @return currentAPY Current APY from Aave in basis points
     */
    function getYieldStats() external view returns (
        uint256 principal,
        uint256 currentBalance,
        uint256 yieldEarned,
        uint256 yieldPercentage,
        uint256 currentAPY
    ) {
        principal = totalContributed;
        currentBalance = aToken != address(0) ? IERC20(aToken).balanceOf(address(this)) : 0;
        yieldEarned = currentBalance > principal ? currentBalance - principal : 0;
        yieldPercentage = principal > 0 ? (yieldEarned * 10000) / principal : 0;
        currentAPY = this.getCurrentAPY();
    }

    /**
     * @notice Get list of all contributors
     * @return Array of contributor addresses
     */
    function getContributors() external view returns (address[] memory) {
        return contributors;
    }

    /**
     * @notice Get number of contributors
     * @return Number of unique contributors
     */
    function getContributorCount() external view returns (uint256) {
        return contributors.length;
    }

    /**
     * @notice Get vault status
     * @return status Vault status: 0=Active, 1=GoalReached, 2=Completed
     */
    function getStatus() external view returns (uint8 status) {
        if (isWithdrawn) return 2; // Completed (withdrawn or smashed)
        if (totalContributed >= goalAmount) return 1; // Goal reached
        return 0; // Active
    }

    /**
     * @notice Get contribution amount for a specific address
     * @param contributor Address to check
     * @return Amount contributed by the address
     */
    function getContribution(address contributor) external view returns (uint256) {
        return contributions[contributor];
    }

    /**
     * @notice Get token information
     * @return tokenAddress Token address (address(0) for ETH)
     * @return decimals Token decimals
     * @return symbol Token symbol
     */
    function getTokenInfo() external view returns (
        address tokenAddress,
        uint8 decimals,
        string memory symbol
    ) {
        tokenAddress = token;
        decimals = tokenDecimals;
        symbol = token == address(0) ? "ETH" : "USDC";
    }

    /**
     * @notice Get beneficiary address
     * @return Address that will receive funds when vault is withdrawn/smashed
     */
    function getBeneficiary() external view returns (address) {
        return beneficiary;
    }

    /**
     * @notice Accept ETH when unwrapping WETH
     * @dev Only accepts ETH from WETH contract for security
     */
    receive() external payable {
        require(msg.sender == WETH, "Only WETH");
    }
}
