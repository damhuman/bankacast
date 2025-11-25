// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/Vault.sol";
import "../src/VaultFactory.sol";

contract VaultTest is Test {
    VaultFactory public factory;
    Vault public vaultImpl;

    address public creator = address(0x1);
    address public contributor1 = address(0x2);
    address public contributor2 = address(0x3);

    // Mock addresses for testing
    address public mockAavePool = address(0x999);
    address public mockUsdc = address(0x888);

    function setUp() public {
        // Deploy implementation and factory
        vaultImpl = new Vault();
        factory = new VaultFactory(
            address(vaultImpl),
            mockAavePool,
            mockUsdc
        );
    }

    function testCreateVault() public {
        vm.prank(creator);

        address vault = factory.createVault(
            1000 * 1e6, // 1000 USDC
            "ipfs://test",
            "Test vault description",
            mockUsdc,
            6
        );

        assertTrue(vault != address(0));
        assertEq(Vault(payable(vault)).creator(), creator);
        assertEq(Vault(payable(vault)).goalAmount(), 1000 * 1e6);
        assertEq(Vault(payable(vault)).description(), "Test vault description");
    }

    function testVaultCount() public {
        vm.startPrank(creator);

        factory.createVault(1000 * 1e6, "ipfs://test1", "Description 1", mockUsdc, 6);
        factory.createVault(2000 * 1e6, "ipfs://test2", "Description 2", mockUsdc, 6);

        vm.stopPrank();

        assertEq(factory.getVaultCount(), 2);
    }

    function testGetUserVaults() public {
        vm.startPrank(creator);

        address vault1 = factory.createVault(1000 * 1e6, "ipfs://test1", "Description 1", mockUsdc, 6);
        address vault2 = factory.createVault(2000 * 1e6, "ipfs://test2", "Description 2", mockUsdc, 6);

        vm.stopPrank();

        address[] memory userVaults = factory.getUserVaults(creator);
        assertEq(userVaults.length, 2);
        assertEq(userVaults[0], vault1);
        assertEq(userVaults[1], vault2);
    }

    function test_RevertWhen_GoalIsZero() public {
        vm.prank(creator);
        vm.expectRevert();

        // Should revert: goal is zero
        factory.createVault(
            0,
            "ipfs://test",
            "Description",
            mockUsdc,
            6
        );
    }

    function test_RevertWhen_MetadataEmpty() public {
        vm.prank(creator);
        vm.expectRevert();

        // Should revert: empty metadata
        factory.createVault(
            1000 * 1e6,
            "",
            "Description",
            mockUsdc,
            6
        );
    }
}
