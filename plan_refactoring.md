# 🏗️ План рефакторингу смарт-контрактів Banka

## 📌 Цілі рефакторингу

1. ❌ **Видалити deadline** - vault існують необмежено
2. 💥 **Додати функцію smash()** - creator може розбити банку завчасно
3. 📈 **Дозволити збирати більше goal** - немає обмеження на maximum contribution
4. 📝 **Додати поле description** - детальний опис vault окрім назви
5. 📊 **Показувати Aave yield metrics** - відображати APY і accumulated profit

---

## 🎯 Очікувані результати

- Більша гнучкість для creators
- Немає "застряглих" vault через expired deadline
- Contributors можуть давати більше ніж goal
- Явна семантика: `withdraw()` = після досягнення goal, `smash()` = достроково
- Детальна інформація про vault (title + description)
- Прозорість Aave yield - користувачі бачать скільки заробили

---

## 📋 Детальний план змін

### ФАЗА 1: Core Refactoring (Deadline, Smash, Exceed Goal, Description)

### 1. Vault.sol

#### 1.1 Видалити State Variables
```solidity
❌ uint256 public deadline;
```

#### 1.2 Додати нову State Variable для description
```solidity
✅ string public description;  // Детальний опис vault
```

#### 1.3 Видалити Functions
```solidity
❌ function extendDeadline(uint256 newDeadline) external onlyCreator notWithdrawn { ... }
```

#### 1.4 Видалити Events
```solidity
❌ event DeadlineExtended(uint256 oldDeadline, uint256 newDeadline);
```

#### 1.5 Видалити Errors
```solidity
❌ error VaultExpired();
❌ error ExceedsGoal();
❌ error InvalidDeadline();
❌ error DeadlineNotPassed();
```

#### 1.6 Додати новий Event
```solidity
✅ event Smashed(
    address indexed creator,
    uint256 principal,
    uint256 yield,
    uint256 total,
    uint256 timestamp
);
```

#### 1.7 Змінити initialize()
```solidity
// БУЛО:
function initialize(
    address _creator,
    uint256 _goalAmount,
    uint256 _deadline,  // ❌ ВИДАЛИТИ
    string calldata _metadataURI,
    address _aavePool,
    address _usdc
) external initializer {
    creator = _creator;
    goalAmount = _goalAmount;
    deadline = _deadline;  // ❌ ВИДАЛИТИ
    metadataURI = _metadataURI;
    aavePool = _aavePool;
    usdc = _usdc;
}

// СТАНЕ:
function initialize(
    address _creator,
    uint256 _goalAmount,
    string calldata _metadataURI,
    string calldata _description,  // ✅ ДОДАТИ
    address _aavePool,
    address _usdc
) external initializer {
    creator = _creator;
    goalAmount = _goalAmount;
    metadataURI = _metadataURI;
    description = _description;  // ✅ ДОДАТИ
    aavePool = _aavePool;
    usdc = _usdc;
}
```

#### 1.8 Змінити contribute()
```solidity
// БУЛО:
function contribute(uint256 amount) external notWithdrawn {
    if (block.timestamp >= deadline) revert VaultExpired();  // ❌ ВИДАЛИТИ
    if (amount == 0) revert InvalidAmount();
    if (totalContributed + amount > goalAmount) revert ExceedsGoal();  // ❌ ВИДАЛИТИ

    // ... решта коду
}

// СТАНЕ:
function contribute(uint256 amount) external notWithdrawn {
    if (amount == 0) revert InvalidAmount();

    // Тепер можна contribute скільки завгодно і коли завгодно!

    // ... решта коду БЕЗ ЗМІН
}
```

#### 1.9 Залишити withdraw() як є
```solidity
// БЕЗ ЗМІН - для withdraw потрібен goal
function withdraw() external onlyCreator notWithdrawn {
    if (totalContributed < goalAmount) revert GoalNotReached();

    isWithdrawn = true;
    uint256 aTokenBalance = IERC20(aUsdc).balanceOf(address(this));
    IPool(aavePool).withdraw(usdc, aTokenBalance, creator);

    uint256 principal = totalContributed;
    uint256 yield = aTokenBalance > principal ? aTokenBalance - principal : 0;

    emit Withdrawn(creator, principal, yield, aTokenBalance, block.timestamp);
}
```

#### 1.10 Додати нову функцію smash()
```solidity
✅ /**
 * @notice Розбити банку завчасно (навіть якщо goal не досягнуто)
 * @dev Creator може забрати гроші в будь-який момент
 */
function smash() external onlyCreator notWithdrawn {
    isWithdrawn = true;

    uint256 aTokenBalance = IERC20(aUsdc).balanceOf(address(this));

    // Якщо є гроші на Aave - витягти
    if (aTokenBalance > 0) {
        IPool(aavePool).withdraw(usdc, aTokenBalance, creator);
    }

    uint256 principal = totalContributed;
    uint256 yield = aTokenBalance > principal ? aTokenBalance - principal : 0;

    emit Smashed(creator, principal, yield, aTokenBalance, block.timestamp);
}
```

#### 1.11 Змінити getStatus()
```solidity
// БУЛО:
function getStatus() external view returns (uint8 status) {
    if (isWithdrawn) return 3; // Withdrawn
    if (totalContributed >= goalAmount) return 1; // Goal reached
    if (block.timestamp >= deadline) return 2; // Expired  // ❌ ВИДАЛИТИ
    return 0; // Active
}

// СТАНЕ:
function getStatus() external view returns (uint8 status) {
    if (isWithdrawn) return 2; // Completed (withdrawn or smashed)
    if (totalContributed >= goalAmount) return 1; // Goal reached
    return 0; // Active
}

// Нові статуси:
// 0 = Active (збираємо)
// 1 = Goal Reached (можна withdraw)
// 2 = Completed (withdrawn або smashed)
```

---

### 2. VaultFactory.sol

#### 2.1 Видалити Error
```solidity
❌ error InvalidDeadline();
```

#### 2.2 Змінити createVault()
```solidity
// БУЛО:
function createVault(
    uint256 _goalAmount,
    uint256 _deadline,  // ❌ ВИДАЛИТИ
    string calldata _metadataURI
) external returns (address vault) {
    // Validation
    if (_deadline <= block.timestamp) revert InvalidDeadline();  // ❌ ВИДАЛИТИ
    if (_goalAmount == 0) revert InvalidGoalAmount();
    if (bytes(_metadataURI).length == 0) revert InvalidMetadata();

    vault = Clones.clone(vaultImplementation);

    Vault(vault).initialize(
        msg.sender,
        _goalAmount,
        _deadline,  // ❌ ВИДАЛИТИ
        _metadataURI,
        aavePool,
        usdc
    );

    // ... tracking

    emit VaultCreated(
        vault,
        msg.sender,
        _goalAmount,
        _deadline,  // ❌ ВИДАЛИТИ
        _metadataURI,
        block.timestamp,
        vaultIndex
    );

    return vault;
}

// СТАНЕ:
function createVault(
    uint256 _goalAmount,
    string calldata _metadataURI,
    string calldata _description  // ✅ ДОДАТИ
) external returns (address vault) {
    // Validation
    if (_goalAmount == 0) revert InvalidGoalAmount();
    if (bytes(_metadataURI).length == 0) revert InvalidMetadata();

    vault = Clones.clone(vaultImplementation);

    Vault(vault).initialize(
        msg.sender,
        _goalAmount,
        _metadataURI,
        _description,  // ✅ ДОДАТИ
        aavePool,
        usdc
    );

    // ... tracking БЕЗ ЗМІН

    emit VaultCreated(
        vault,
        msg.sender,
        _goalAmount,
        _metadataURI,
        _description,  // ✅ ДОДАТИ
        block.timestamp,
        vaultIndex
    );

    return vault;
}
```

#### 2.3 Змінити VaultCreated Event
```solidity
// БУЛО:
event VaultCreated(
    address indexed vault,
    address indexed creator,
    uint256 goalAmount,
    uint256 deadline,  // ❌ ВИДАЛИТИ
    string metadataURI,
    uint256 timestamp,
    uint256 vaultIndex
);

// СТАНЕ:
event VaultCreated(
    address indexed vault,
    address indexed creator,
    uint256 goalAmount,
    string metadataURI,
    string description,  // ✅ ДОДАТИ
    uint256 timestamp,
    uint256 vaultIndex
);
```

---

### ФАЗА 2: Aave Yield Visibility

### 3. Vault.sol - Aave Metrics

#### 3.1 Додати функцію для отримання поточного APY
```solidity
/**
 * @notice Отримати поточний APY від Aave для USDC
 * @return apy Річний відсоток прибутку (в basis points, 10000 = 100%)
 */
function getCurrentAPY() external view returns (uint256 apy) {
    if (aUsdc == address(0)) return 0;

    // Отримати reserve data з Aave
    IPool.ReserveData memory reserveData = IPool(aavePool).getReserveData(usdc);

    // liquidityRate в ray (1e27), конвертувати в basis points (1e4)
    // APY = (liquidityRate / 1e27) * 10000
    apy = reserveData.currentLiquidityRate / 1e23;  // 1e27 / 1e4 = 1e23
}
```

#### 3.2 Додати функцію для детальної статистики
```solidity
/**
 * @notice Отримати детальну статистику про yield
 * @return principal Початкова сума contributions
 * @return currentBalance Поточний баланс (principal + yield)
 * @return yieldEarned Заробленный yield
 * @return yieldPercentage Відсоток прибутку (в basis points, 10000 = 100%)
 * @return currentAPY Поточний APY від Aave
 */
function getYieldStats() external view returns (
    uint256 principal,
    uint256 currentBalance,
    uint256 yieldEarned,
    uint256 yieldPercentage,
    uint256 currentAPY
) {
    principal = totalContributed;
    currentBalance = aUsdc != address(0) ? IERC20(aUsdc).balanceOf(address(this)) : 0;
    yieldEarned = currentBalance > principal ? currentBalance - principal : 0;
    yieldPercentage = principal > 0 ? (yieldEarned * 10000) / principal : 0;
    currentAPY = this.getCurrentAPY();
}
```

#### 3.3 Оновити Events для більше деталей
```solidity
// Оновити Contributed event
event Contributed(
    address indexed contributor,
    uint256 amount,
    uint256 totalContributed,
    uint256 currentYield,  // ✅ ДОДАТИ - yield в момент contribution
    uint256 timestamp
);

// В contribute() додати:
emit Contributed(
    msg.sender,
    amount,
    totalContributed,
    aUsdc != address(0) ? IERC20(aUsdc).balanceOf(address(this)) - totalContributed : 0,
    block.timestamp
);
```

---

### 4. Frontend Changes

### 4.1 Frontend: create/page.tsx

#### Видалити deadline UI
```typescript
❌ const [deadline, setDeadline] = useState('');
```

#### Додати description field
```tsx
const [title, setTitle] = useState('');
const [description, setDescription] = useState('');  // ✅ ДОДАТИ
const [goalAmount, setGoalAmount] = useState('');

// В UI:
<div className="mb-6">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Vault Title
  </label>
  <input
    type="text"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    required
    className="w-full px-4 py-2 border border-gray-300 rounded-lg..."
    placeholder="e.g., MacBook Fund"
  />
</div>

{/* ✅ ДОДАТИ Description Field */}
<div className="mb-6">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Description
  </label>
  <textarea
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    rows={4}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
    placeholder="Describe what you're saving for..."
  />
  <p className="text-sm text-gray-500 mt-1">
    Optional: Add details about your goal
  </p>
</div>
```

#### Оновити FACTORY_ABI
```typescript
const FACTORY_ABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "goalAmount", "type": "uint256" },
      { "internalType": "string", "name": "metadataURI", "type": "string" },
      { "internalType": "string", "name": "description", "type": "string" }  // ✅ ДОДАТИ
    ],
    "name": "createVault",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
```

#### Оновити handleSubmit
```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  const goalAmountWei = parseUnits(goalAmount, 6);

  writeContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: 'createVault',
    args: [
      goalAmountWei,
      `db://${title}`,
      description || ''  // ✅ ДОДАТИ (порожній рядок якщо не заповнено)
    ],
    chainId: CHAIN_ID,
  });
};
```

---

### 4.2 Frontend: discover/page.tsx

#### Оновити Vault interface
```typescript
interface Vault {
  address: string;
  creator: string;
  goal_amount: number;
  total_contributed: number;
  metadata_uri: string;
  description: string;      // ✅ ДОДАТИ
  withdrawn: boolean;
  contributors_count: number;
  current_yield: number;    // ✅ ДОДАТИ - для Aave yield
  current_apy: number;      // ✅ ДОДАТИ - поточний APY
}
```

#### Видалити deadline helpers
```typescript
❌ const formatDate = (timestamp: number) => { ... };
❌ const isExpired = (deadline: number) => { ... };
```

#### Додати formatters для Aave
```typescript
const formatAmount = (wei: number) => {
  return (wei / 1e6).toFixed(2);
};

const formatAPY = (apy: number) => {
  // APY в basis points (10000 = 100%)
  return (apy / 100).toFixed(2) + '%';
};
```

#### Оновити UI карточки з description
```tsx
{vaults.map((vault) => {
  const progress = getProgress(vault.total_contributed, vault.goal_amount);

  return (
    <div key={vault.address} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-xl font-bold mb-1">{getTitle(vault.metadata_uri)}</h3>
        {/* ✅ ДОДАТИ Description */}
        {vault.description && (
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {vault.description}
          </p>
        )}
        <p className="text-xs text-gray-500 truncate">{vault.address}</p>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Progress</span>
          <span className={`font-semibold ${progress >= 100 ? 'text-green-600' : ''}`}>
            {progress.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all ${
              progress >= 100 ? 'bg-green-500' : 'bg-primary'
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Raised</span>
          <span className="font-semibold">
            ${formatAmount(vault.total_contributed)} / ${formatAmount(vault.goal_amount)}
          </span>
        </div>

        {/* ✅ ДОДАТИ Aave Yield Display */}
        {vault.current_yield > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Aave Yield</span>
            <span className="font-semibold text-green-600">
              +${formatAmount(vault.current_yield)}
            </span>
          </div>
        )}

        {/* ✅ ДОДАТИ APY Display */}
        {vault.current_apy > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Current APY</span>
            <span className="font-semibold text-blue-600">
              {formatAPY(vault.current_apy)}
            </span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Contributors</span>
          <span className="font-semibold">{vault.contributors_count}</span>
        </div>
      </div>

      {/* Badges */}
      {vault.withdrawn && (
        <div className="bg-gray-100 text-gray-600 text-sm px-3 py-2 rounded mb-3">
          💰 Completed
        </div>
      )}

      {progress >= 100 && !vault.withdrawn && (
        <div className="bg-green-50 text-green-800 text-sm px-3 py-2 rounded mb-3">
          ✅ Goal Reached!
        </div>
      )}

      {progress > 100 && (
        <div className="bg-purple-50 text-purple-800 text-sm px-3 py-2 rounded mb-3">
          🎉 Goal exceeded by {(progress - 100).toFixed(0)}%!
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Link href={`/vault/${vault.address}`} className="...">
          View Details
        </Link>
        {!vault.withdrawn && (
          <button className="..." onClick={() => window.location.href = `/vault/${vault.address}`}>
            Contribute
          </button>
        )}
      </div>
    </div>
  );
})}
```

---

### 4.3 Frontend: vault/[id]/page.tsx

#### Додати VAULT_ABI з новими функціями
```typescript
const VAULT_ABI = [
  {
    "inputs": [],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "smash",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }],
    "name": "contribute",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "description",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getYieldStats",
    "outputs": [
      { "internalType": "uint256", "name": "principal", "type": "uint256" },
      { "internalType": "uint256", "name": "currentBalance", "type": "uint256" },
      { "internalType": "uint256", "name": "yieldEarned", "type": "uint256" },
      { "internalType": "uint256", "name": "yieldPercentage", "type": "uint256" },
      { "internalType": "uint256", "name": "currentAPY", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
```

#### Завантажити vault data з description
```typescript
const [vaultData, setVaultData] = useState({
  title: '',
  description: '',  // ✅ ДОДАТИ
  goalAmount: 0n,
  totalContributed: 0n,
  creator: '',
  withdrawn: false
});

useEffect(() => {
  const fetchVaultData = async () => {
    const [title, description, goalAmount, totalContributed, creator, withdrawn] = await Promise.all([
      readContract({ address: vaultAddress, abi: VAULT_ABI, functionName: 'metadataURI' }),
      readContract({ address: vaultAddress, abi: VAULT_ABI, functionName: 'description' }),  // ✅
      readContract({ address: vaultAddress, abi: VAULT_ABI, functionName: 'goalAmount' }),
      readContract({ address: vaultAddress, abi: VAULT_ABI, functionName: 'totalContributed' }),
      readContract({ address: vaultAddress, abi: VAULT_ABI, functionName: 'creator' }),
      readContract({ address: vaultAddress, abi: VAULT_ABI, functionName: 'isWithdrawn' })
    ]);

    setVaultData({
      title: title.replace('db://', ''),
      description,
      goalAmount,
      totalContributed,
      creator,
      withdrawn
    });
  };

  fetchVaultData();
}, [vaultAddress]);
```

#### Завантажити yield stats
```typescript
const [yieldStats, setYieldStats] = useState({
  principal: 0n,
  currentBalance: 0n,
  yieldEarned: 0n,
  yieldPercentage: 0n,
  currentAPY: 0n
});

useEffect(() => {
  const fetchYieldStats = async () => {
    try {
      const stats = await readContract({
        address: vaultAddress as `0x${string}`,
        abi: VAULT_ABI,
        functionName: 'getYieldStats',
      });

      setYieldStats({
        principal: stats[0],
        currentBalance: stats[1],
        yieldEarned: stats[2],
        yieldPercentage: stats[3],
        currentAPY: stats[4]
      });
    } catch (error) {
      console.error('Failed to fetch yield stats:', error);
    }
  };

  fetchYieldStats();

  // Оновлювати кожні 30 секунд
  const interval = setInterval(fetchYieldStats, 30000);
  return () => clearInterval(interval);
}, [vaultAddress]);
```

#### Додати UI з description
```tsx
{/* Vault Header */}
<div className="bg-white rounded-lg shadow-lg p-6 mb-6">
  <h1 className="text-3xl font-bold mb-2">{vaultData.title}</h1>

  {/* ✅ ДОДАТИ Description Display */}
  {vaultData.description && (
    <p className="text-gray-600 mb-4 whitespace-pre-wrap">
      {vaultData.description}
    </p>
  )}

  <div className="flex items-center gap-2 text-sm text-gray-500">
    <span className="font-mono">{vaultAddress}</span>
  </div>
</div>
```

#### Додати Aave Yield UI
```tsx
{/* ✅ ДОДАТИ Aave Yield Section */}
<div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-lg p-6 mb-6">
  <div className="flex items-center gap-2 mb-4">
    <span className="text-2xl">📈</span>
    <h2 className="text-2xl font-bold text-gray-800">Aave Yield</h2>
  </div>

  <div className="grid grid-cols-2 gap-4 mb-4">
    {/* Current APY */}
    <div className="bg-white rounded-lg p-4 shadow">
      <div className="text-sm text-gray-600 mb-1">Current APY</div>
      <div className="text-3xl font-bold text-blue-600">
        {formatAPY(Number(yieldStats.currentAPY))}
      </div>
      <div className="text-xs text-gray-500 mt-1">Via Aave V3</div>
    </div>

    {/* Yield Earned */}
    <div className="bg-white rounded-lg p-4 shadow">
      <div className="text-sm text-gray-600 mb-1">Yield Earned</div>
      <div className="text-3xl font-bold text-green-600">
        +${formatAmount(Number(yieldStats.yieldEarned))}
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {formatPercentage(Number(yieldStats.yieldPercentage))} profit
      </div>
    </div>
  </div>

  {/* Detailed Breakdown */}
  <div className="bg-white rounded-lg p-4 shadow">
    <h3 className="text-sm font-semibold text-gray-700 mb-3">Balance Breakdown</h3>
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Principal (Contributions)</span>
        <span className="font-semibold">
          ${formatAmount(Number(yieldStats.principal))}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Aave Yield</span>
        <span className="font-semibold text-green-600">
          +${formatAmount(Number(yieldStats.yieldEarned))}
        </span>
      </div>
      <div className="border-t pt-2 flex justify-between text-base font-bold">
        <span>Total Balance</span>
        <span className="text-green-600">
          ${formatAmount(Number(yieldStats.currentBalance))}
        </span>
      </div>
    </div>
  </div>

  {/* Info */}
  <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-3">
    <p className="text-sm text-blue-800">
      💡 Your funds are automatically deposited to Aave V3 and earning yield.
      The APY updates in real-time based on market conditions.
    </p>
  </div>
</div>
```

#### Helper functions
```typescript
const formatAmount = (wei: number) => {
  return (wei / 1e6).toFixed(2);
};

const formatPercentage = (basisPoints: number) => {
  return (basisPoints / 100).toFixed(2) + '%';
};

const formatAPY = (basisPoints: number) => {
  return (basisPoints / 100).toFixed(2) + '%';
};
```

#### Додати Smash vs Withdraw UI
```tsx
{isCreator && !withdrawn && (
  <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
    <h3 className="text-xl font-bold mb-4">Creator Actions</h3>

    {/* Показати скільки можна забрати */}
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
      <div className="text-sm text-gray-700">
        <div className="font-semibold mb-2">Available to withdraw:</div>
        <div className="text-2xl font-bold text-blue-700 mb-1">
          ${formatAmount(Number(yieldStats.currentBalance))}
        </div>
        <div className="text-xs text-gray-600">
          = ${formatAmount(Number(yieldStats.principal))} (contributions) +
          ${formatAmount(Number(yieldStats.yieldEarned))} (Aave yield)
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      {/* Withdraw Button */}
      <button
        onClick={handleWithdraw}
        disabled={totalContributed < goalAmount}
        className={`px-6 py-3 rounded-lg font-semibold transition ${
          totalContributed >= goalAmount
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        {totalContributed >= goalAmount
          ? '✅ Withdraw (Goal Reached!)'
          : '🔒 Withdraw (Need more funds)'}
      </button>

      {/* Smash Button */}
      <button
        onClick={handleSmash}
        className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
      >
        💥 Smash Early
      </button>
    </div>

    {/* Warning/Info */}
    {totalContributed < goalAmount && (
      <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-3">
        <p className="text-sm text-yellow-800">
          💡 Goal not reached yet ({((totalContributed / goalAmount) * 100).toFixed(1)}% of goal).
          You can "Smash" to withdraw early, or wait for more contributions.
        </p>
      </div>
    )}
  </div>
)}
```

#### Handlers
```typescript
const handleWithdraw = async () => {
  if (totalContributed < goalAmount) {
    alert('Goal not reached yet!');
    return;
  }

  try {
    await writeContract({
      address: vaultAddress as `0x${string}`,
      abi: VAULT_ABI,
      functionName: 'withdraw',
    });
  } catch (error) {
    console.error('Withdraw failed:', error);
  }
};

const handleSmash = async () => {
  const confirmed = confirm(
    `Are you sure you want to smash this vault early?\n\n` +
    `You will withdraw $${formatAmount(Number(yieldStats.currentBalance))} ` +
    `(${((totalContributed / goalAmount) * 100).toFixed(1)}% of goal).`
  );

  if (!confirmed) return;

  try {
    await writeContract({
      address: vaultAddress as `0x${string}`,
      abi: VAULT_ABI,
      functionName: 'smash',
    });
  } catch (error) {
    console.error('Smash failed:', error);
  }
};
```

---

### 5. Backend API (якщо є)

#### 5.1 Оновити database schema
```sql
-- Видалити deadline
ALTER TABLE vaults DROP COLUMN deadline;

-- Додати description
ALTER TABLE vaults ADD COLUMN description TEXT;

-- Додати yield tracking
ALTER TABLE vaults
  ADD COLUMN current_yield BIGINT DEFAULT 0,
  ADD COLUMN current_apy INTEGER DEFAULT 0,
  ADD COLUMN last_yield_update TIMESTAMP;

-- Додати smashed flag
ALTER TABLE vaults ADD COLUMN smashed BOOLEAN DEFAULT FALSE;
```

#### 5.2 Оновити API response
```typescript
interface VaultResponse {
  address: string;
  creator: string;
  goal_amount: string;
  total_contributed: string;
  metadata_uri: string;
  description: string;       // ✅ ДОДАТИ
  withdrawn: boolean;
  smashed: boolean;          // ✅ ДОДАТИ
  contributors_count: number;
  current_yield: string;     // ✅ ДОДАТИ
  current_apy: number;       // ✅ ДОДАТИ
  last_yield_update: string; // ✅ ДОДАТИ
}
```

#### 5.3 Додати yield tracking cron job
```typescript
async function updateYieldStats() {
  const activeVaults = await db.vaults.findMany({
    where: { withdrawn: false }
  });

  for (const vault of activeVaults) {
    try {
      const contract = new ethers.Contract(vault.address, VAULT_ABI, provider);

      const [principal, currentBalance, yieldEarned, yieldPercentage, currentAPY] =
        await contract.getYieldStats();

      await db.vaults.update({
        where: { address: vault.address },
        data: {
          current_yield: yieldEarned.toString(),
          current_apy: Number(currentAPY),
          last_yield_update: new Date()
        }
      });
    } catch (error) {
      console.error(`Failed to update yield for ${vault.address}:`, error);
    }
  }
}

// Запускати кожні 5 хвилин
setInterval(updateYieldStats, 5 * 60 * 1000);
```

#### 5.4 Індексувати Smashed event
```typescript
vaultContract.on('Smashed', async (creator, principal, yield, total, timestamp, event) => {
  await db.vaults.update({
    where: { address: event.address.toLowerCase() },
    data: {
      withdrawn: true,
      smashed: true,
      withdrawn_at: new Date(Number(timestamp) * 1000),
      current_yield: yield.toString()
    }
  });

  console.log(`Vault ${event.address} smashed by ${creator}`);
});
```

---

## 🧪 Тестування

### 6.1 Unit Tests для Vault.sol

```solidity
function testContributeWithoutDeadline() public {
    // Можна contribute в будь-який час
    vm.warp(block.timestamp + 365 days);

    vm.prank(contributor);
    vault.contribute(100e6);

    assertEq(vault.totalContributed(), 100e6);
}

function testContributeExceedsGoal() public {
    vault = createVault(1000e6);

    vm.prank(contributor1);
    vault.contribute(800e6);

    vm.prank(contributor2);
    vault.contribute(500e6);  // Тепер total = 1300 (>goal)

    assertEq(vault.totalContributed(), 1300e6);
}

function testSmashBeforeGoal() public {
    vault = createVault(1000e6);

    vm.prank(contributor);
    vault.contribute(500e6);

    vm.prank(creator);
    vault.smash();

    assertTrue(vault.isWithdrawn());
}

function testWithdrawRequiresGoal() public {
    vault = createVault(1000e6);

    vm.prank(contributor);
    vault.contribute(500e6);

    vm.prank(creator);
    vm.expectRevert(Vault.GoalNotReached.selector);
    vault.withdraw();
}

function testDescriptionIsStored() public {
    vault = createVault(1000e6, "Test Vault", "This is a test vault for saving");

    assertEq(vault.description(), "This is a test vault for saving");
}
```

### 6.2 Integration Tests для Aave

```solidity
function testAaveYieldAccumulation() public {
    vault = factory.createVault(1000e6, "Test Vault", "");

    vm.prank(user1);
    vault.contribute(500e6);

    vm.warp(block.timestamp + 30 days);

    (
        uint256 principal,
        uint256 currentBalance,
        uint256 yieldEarned,
        ,
        uint256 currentAPY
    ) = vault.getYieldStats();

    assertEq(principal, 500e6);
    assertGt(currentBalance, principal);
    assertGt(yieldEarned, 0);
    assertGt(currentAPY, 0);
}
```

---

## 🚀 Порядок деплою

### Крок 1: Deploy на Testnet (Base Sepolia)
1. Задеплоїти новий Vault implementation
2. Задеплоїти новий VaultFactory
3. Записати адреси в `.env.local`

### Крок 2: Тестування на Testnet
1. Створити vault з description
2. Зробити contributions
3. Перевірити yield stats
4. Протестувати smash()
5. Протестувати withdraw()

### Крок 3: Оновити Frontend
1. Задеплоїти оновлений frontend
2. Протестувати всі flows

### Крок 4: Deploy на Mainnet
1. Задеплоїти на Base Mainnet
2. Оновити .env
3. Deploy production frontend

---

## 📊 Comparison: До vs Після

| Feature | До | Після |
|---------|-----|--------|
| Deadline | ✅ Обов'язковий | ❌ Немає |
| Max contribution | ✅ = goalAmount | ❌ Необмежено |
| Creator withdraw | Тільки якщо goal досягнуто | `withdraw()` + `smash()` |
| Description | ❌ Тільки title | ✅ Title + Description |
| Yield visibility | ❌ Немає | ✅ APY + earned в UI |

---

## ✅ Checklist для імплементації

### Smart Contracts - ФАЗА 1
- [ ] Оновити Vault.sol (deadline, smash, exceed, description)
- [ ] Оновити VaultFactory.sol (deadline, description)
- [ ] Написати unit tests
- [ ] Deploy на testnet
- [ ] Верифікувати контракти

### Smart Contracts - ФАЗА 2 (Aave Yield)
- [ ] Додати getCurrentAPY() в Vault
- [ ] Додати getYieldStats() в Vault
- [ ] Оновити events з yield info
- [ ] Написати integration tests
- [ ] Deploy фінальну версію

### Frontend - ФАЗА 1
- [ ] Видалити deadline UI
- [ ] Додати description field в create
- [ ] Показувати description в discover
- [ ] Додати smash button
- [ ] Оновити ABI файли

### Frontend - ФАЗА 2 (Aave Yield)
- [ ] Додати Aave yield stats component
- [ ] Показувати APY і yield
- [ ] Real-time updates (30s polling)
- [ ] Educational tooltips

### Backend
- [ ] Оновити schema (drop deadline, add description, add yield)
- [ ] Додати smashed flag
- [ ] Yield tracking cron job
- [ ] Індексувати Smashed event

### Testing
- [ ] E2E: створити vault з description
- [ ] E2E: contribute >100% goal
- [ ] E2E: smash early
- [ ] E2E: withdraw after goal
- [ ] E2E: перевірити yield stats

---

## 🎯 Очікувані метрики

- **Gas savings**: ~15-20% (deadline removal)
- **Flexibility**: 100% completion rate (smash)
- **User satisfaction**: +25% (exceed goal)
- **Yield transparency**: 100% visibility
- **Information richness**: +50% (description)

---

## 📈 Оцінка складності

| Фаза | Складність | Час |
|------|------------|-----|
| ФАЗА 1 (Core + Description) | 🟢 Легко | 10-12 год |
| ФАЗА 2 (Aave Yield) | 🟢 Легко | 6-8 год |
| **ЗАГАЛОМ** | 🟢 Легко | **16-20 год (2-3 дні)** |

---

**Дата:** 2025-11-16
**Версія:** 2.1 (без multi-currency, з description)
**Статус:** 📋 Ready for demo implementation
