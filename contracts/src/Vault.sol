// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@aave/core-v3/interfaces/IPool.sol";

/**
 * @title Vault
 * @notice Individual savings vault with automatic Aave yield generation
 * @dev Minimal proxy clone deployed by VaultFactory
 */
contract Vault is Initializable {
    // ============ State Variables ============

    address public creator;
    uint256 public goalAmount;
    uint256 public deadline;
    string public metadataURI; // IPFS hash or DB ID for title/description/image

    address public aavePool;
    address public usdc;
    address public aUsdc; // Aave interest-bearing token (set after first deposit)

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
        uint256 timestamp
    );

    event Withdrawn(
        address indexed creator,
        uint256 principal,
        uint256 yield,
        uint256 total,
        uint256 timestamp
    );

    event DeadlineExtended(uint256 oldDeadline, uint256 newDeadline);

    // ============ Errors ============

    error NotCreator();
    error AlreadyWithdrawn();
    error VaultExpired();
    error InvalidAmount();
    error ExceedsGoal();
    error TransferFailed();
    error GoalNotReached();
    error InvalidDeadline();
    error DeadlineNotPassed();

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
     * @param _goalAmount Target amount in USDC (6 decimals)
     * @param _deadline Unix timestamp deadline
     * @param _metadataURI IPFS hash or metadata reference
     * @param _aavePool Aave V3 Pool address
     * @param _usdc USDC token address
     */
    function initialize(
        address _creator,
        uint256 _goalAmount,
        uint256 _deadline,
        string calldata _metadataURI,
        address _aavePool,
        address _usdc
    ) external initializer {
        creator = _creator;
        goalAmount = _goalAmount;
        deadline = _deadline;
        metadataURI = _metadataURI;
        aavePool = _aavePool;
        usdc = _usdc;
    }

    // ============ Core Functions ============

    /**
     * @notice Contribute USDC to the vault
     * @param amount Amount of USDC to contribute (6 decimals)
     */
    function contribute(uint256 amount) external notWithdrawn {
        if (block.timestamp >= deadline) revert VaultExpired();
        if (amount == 0) revert InvalidAmount();
        if (totalContributed + amount > goalAmount) revert ExceedsGoal();

        // Transfer USDC from contributor to this contract
        if (!IERC20(usdc).transferFrom(msg.sender, address(this), amount)) {
            revert TransferFailed();
        }

        // Track contribution
        if (!_isContributor[msg.sender]) {
            contributors.push(msg.sender);
            _isContributor[msg.sender] = true;
        }
        contributions[msg.sender] += amount;
        totalContributed += amount;

        // Deposit to Aave
        IERC20(usdc).approve(aavePool, amount);
        IPool(aavePool).supply(usdc, amount, address(this), 0);

        // Get aToken address if first deposit
        if (aUsdc == address(0)) {
            aUsdc = IPool(aavePool).getReserveData(usdc).aTokenAddress;
        }

        emit Contributed(msg.sender, amount, totalContributed, block.timestamp);
    }

    /**
     * @notice Withdraw funds when goal is reached (creator only)
     */
    function withdraw() external onlyCreator notWithdrawn {
        if (totalContributed < goalAmount) revert GoalNotReached();

        isWithdrawn = true;

        // Withdraw from Aave (principal + yield)
        uint256 aTokenBalance = IERC20(aUsdc).balanceOf(address(this));
        IPool(aavePool).withdraw(usdc, aTokenBalance, creator);

        uint256 principal = totalContributed;
        uint256 yield = aTokenBalance > principal ? aTokenBalance - principal : 0;

        emit Withdrawn(creator, principal, yield, aTokenBalance, block.timestamp);
    }

    /**
     * @notice Extend deadline if goal not reached (creator only)
     * @param newDeadline New deadline timestamp
     */
    function extendDeadline(uint256 newDeadline) external onlyCreator notWithdrawn {
        if (newDeadline <= deadline) revert InvalidDeadline();
        if (block.timestamp < deadline) revert DeadlineNotPassed();
        if (totalContributed >= goalAmount) revert GoalNotReached(); // Can't extend if goal reached

        uint256 oldDeadline = deadline;
        deadline = newDeadline;

        emit DeadlineExtended(oldDeadline, newDeadline);
    }

    // ============ View Functions ============

    /**
     * @notice Get vault progress
     * @return current Current contributed amount
     * @return goal Goal amount
     * @return percentage Progress percentage (0-100)
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
        total = aUsdc != address(0) ? IERC20(aUsdc).balanceOf(address(this)) : 0;
        yield = total > principal ? total - principal : 0;
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
     * @return status Vault status: 0=Active, 1=GoalReached, 2=Expired, 3=Withdrawn
     */
    function getStatus() external view returns (uint8 status) {
        if (isWithdrawn) return 3; // Withdrawn
        if (totalContributed >= goalAmount) return 1; // Goal reached
        if (block.timestamp >= deadline) return 2; // Expired
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
}
