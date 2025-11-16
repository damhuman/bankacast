// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/Vault.sol";
import "../src/VaultFactory.sol";

/**
 * @title Deploy Script
 * @notice Deployment script for Banka contracts on Base Sepolia / Base Mainnet
 */
contract DeployScript is Script {
    // Base Sepolia addresses
    address constant BASE_SEPOLIA_AAVE_POOL = 0x07eA79F68B2B3df564D0A34F8e19D9B1e339814b;
    address constant BASE_SEPOLIA_USDC = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;

    // Base Mainnet addresses
    address constant BASE_MAINNET_AAVE_POOL = 0xA238Dd80C259a72e81d7e4664a9801593F98d1c5;
    address constant BASE_MAINNET_USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Determine network based on chain ID
        uint256 chainId = block.chainid;
        address aavePool;
        address usdc;
        string memory network;

        if (chainId == 84532) {
            // Base Sepolia
            aavePool = BASE_SEPOLIA_AAVE_POOL;
            usdc = BASE_SEPOLIA_USDC;
            network = "Base Sepolia";
        } else if (chainId == 8453) {
            // Base Mainnet
            aavePool = BASE_MAINNET_AAVE_POOL;
            usdc = BASE_MAINNET_USDC;
            network = "Base Mainnet";
        } else {
            revert("Unsupported network");
        }

        console.log("===========================================");
        console.log("Deploying Banka to", network);
        console.log("Chain ID:", chainId);
        console.log("Deployer:", vm.addr(deployerPrivateKey));
        console.log("===========================================");

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Vault implementation
        Vault vaultImplementation = new Vault();
        console.log("Vault Implementation:", address(vaultImplementation));

        // 2. Deploy VaultFactory
        VaultFactory factory = new VaultFactory(
            address(vaultImplementation),
            aavePool,
            usdc
        );
        console.log("VaultFactory:", address(factory));

        vm.stopBroadcast();

        console.log("===========================================");
        console.log("Deployment Complete!");
        console.log("===========================================");
        console.log("");
        console.log("Contract Addresses:");
        console.log("  VaultFactory:", address(factory));
        console.log("  Vault Implementation:", address(vaultImplementation));
        console.log("");
        console.log("Configuration:");
        console.log("  Aave Pool:", aavePool);
        console.log("  USDC:", usdc);
        console.log("");
        console.log("Next steps:");
        console.log("1. Verify contracts on Basescan:");
        console.log("   forge verify-contract", vm.toString(address(factory)), "VaultFactory --watch");
        console.log("2. Update frontend/.env with VaultFactory address");
        console.log("3. Update backend/.env with VaultFactory address");
    }
}
