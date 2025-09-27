// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {IPoolManager} from "v4-core/interfaces/IPoolManager.sol";
import {PoolManager} from "v4-core/PoolManager.sol";
import {Currency} from "v4-core/types/Currency.sol";
import {PoolKey} from "v4-core/types/PoolKey.sol";
import {IHooks} from "v4-core/interfaces/IHooks.sol";
import {Hooks} from "v4-core/libraries/Hooks.sol";
import {OfferManager} from "../src/OfferManager.sol";
import {OfferSwapHook} from "../src/OfferSwapHook.sol";
import {OfferRouter} from "../src/OfferRouter.sol";
import {HookMiner} from "v4-periphery/utils/HookMiner.sol";

contract DeployOfferSwapSystem is Script {
    address constant PYUSD = 0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9; // Ethereum PYUSD
    address constant USDC = 0xA0b86A33E6b1D74A7c42a4A8A4Ed3C9ab4c30234; // Mock USDC
//    address constant USDT = 0xdAC17F958D2ee523a2206206994597C13D831ec7; // Ethereum USDT

    address constant EVENT_MANAGER = 0x7bc48Ccf09989c696AeB7BaFEBB3aBb6FB410559;
    address constant ADMIN_MANAGER = 0xD7312BFBC95a459305393d7795d966AeBEEf78aa;
    address constant KYC_RELAYER = 0x61F3Db7fCC108a5cCa70B71795EB333ca8eD7A52;

    address constant POOL_MANAGER = 0xE03A1074c86CFeDd5C142C4F04F1a1536e203543;
    address constant CREATE2_DEPLOYER = 0x4e59b44847b379578588920cA78FbF26c0B4956C;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        uint160 flags = uint160(Hooks.AFTER_SWAP_FLAG);

        bytes memory constructorArgs = abi.encode(POOL_MANAGER, address(0), PYUSD);
        (address hookAddress, bytes32 salt) =
                            HookMiner.find(CREATE2_DEPLOYER, flags, type(OfferSwapHook).creationCode, constructorArgs);
        
        console.log("Expected hook address:", hookAddress);
        console.log("Using salt:", vm.toString(salt));
        
        vm.startBroadcast(deployerPrivateKey);
        
        OfferSwapHook swapHook = new OfferSwapHook{salt: salt}(
            POOL_MANAGER,
            address(0),
            PYUSD
        );
        console.log("OfferSwapHook deployed at:", address(swapHook));

        OfferManager offerManager = new OfferManager(
            PYUSD,
            KYC_RELAYER,
            EVENT_MANAGER,
            ADMIN_MANAGER,
            address(swapHook)
        );
        console.log("OfferManager deployed at:", address(offerManager));

        // 4. Update hook with OfferManager address (if needed)
        // This would require an admin function in the hook contract

        OfferRouter offerRouter = new OfferRouter(
            PYUSD,
            address(swapHook),
            KYC_RELAYER,
            POOL_MANAGER
        );
        console.log("OfferRouter deployed at:", address(offerRouter));


        console.log("\n=== Creating and Initializing Pools ===");

        console.log("Creating USDC/PYUSD pool...");
        PoolKey memory usdcPool = _createPool(
            Currency.wrap(USDC),
            Currency.wrap(PYUSD),
            500,
            10,
            address(swapHook)
        );
        _initializePool(IPoolManager(POOL_MANAGER), usdcPool, 1e6);
        offerRouter.configureTokenPool(USDC, 500, 10);

//        console.log("Creating USDT/PYUSD pool...");
//        PoolKey memory usdtPool = _createPool(
//            Currency.wrap(USDT),
//            Currency.wrap(PYUSD),
//            500,  // 0.05% fee for stablecoins
//            10,   // tick spacing for 0.05% fee
//            address(swapHook)
//        );
//        _initializePool(poolManager, usdtPool, 1e6);
//        offerRouter.configureTokenPool(Currency.wrap(USDT), 500, 10);

        console.log("All pools created and initialized!");

        vm.stopBroadcast();

        console.log("\n=== Deployment Summary ===");
        console.log("OfferSwapHook:", address(swapHook));
        console.log("OfferManager:", address(offerManager));
        console.log("OfferRouter:", address(offerRouter));
        console.log("\n=== Next Steps ===");
        console.log("1. Add initial liquidity to pools");
        console.log("2. Configure additional supported tokens");
        console.log("3. Set proper access controls");
        console.log("4. Update frontend with new contract addresses");
    }

    /**
     * @notice Helper function to create a pool key
     */
    function _createPool(
        Currency token0,
        Currency token1,
        uint24 fee,
        int24 tickSpacing,
        address hook
    ) internal pure returns (PoolKey memory) {
        // Ensure proper token ordering (token0 < token1)
        if (token0 > token1) {
            (token0, token1) = (token1, token0);
        }

        return PoolKey({
            currency0: token0,
            currency1: token1,
            fee: fee,
            tickSpacing: tickSpacing,
            hooks: IHooks(hook)
        });
    }

    function _initializePool(
        IPoolManager poolManager,
        PoolKey memory poolKey,
        uint256 price
    ) internal {
        // Convert price to sqrtPriceX96
        // For simplicity, using a basic conversion
        // In production, use proper price calculation libraries
        uint160 sqrtPriceX96 = _priceToSqrtPriceX96(price);

        try poolManager.initialize(poolKey, sqrtPriceX96) {
            console.log("Pool initialized successfully");
        } catch {
            console.log("Pool initialization failed (may already exist)");
        }
    }

    function _priceToSqrtPriceX96(uint256 price) internal pure returns (uint160) {
        // Simplified conversion - in production use proper math libraries
        // This assumes price is already in the correct decimal format
        // sqrtPriceX96 = sqrt(price) * 2^96

        // For 1:1 stablecoin pairs (price = 1e6)
        if (price == 1e6) {
            return 79228162514264337593543950336; // sqrt(1) * 2^96
        }

        // For ETH/PYUSD (price = 2500e6)
        if (price == 2500e6) {
            return 3953689986282101631558248960000; // approximately sqrt(2500) * 2^96
        }

        // Default to 1:1 ratio
        return 79228162514264337593543950336;
    }

    /**
     * @notice Find a salt that will result in a hook address with the correct permissions
     */
    function _findSalt(uint160 targetFlags, address deployer) internal pure returns (bytes32) {
        bytes memory creationCode = abi.encodePacked(
            type(OfferSwapHook).creationCode,
            abi.encode(IPoolManager(POOL_MANAGER), address(0), PYUSD)
        );
        bytes32 codeHash = keccak256(creationCode);

        for (uint256 i = 0; i < 100000; i++) {
            bytes32 salt = bytes32(i);
            address hookAddress = _computeCreate2Address(salt, codeHash, deployer);

            if (uint160(hookAddress) & Hooks.ALL_HOOK_MASK == targetFlags) {
                return salt;
            }
        }

        revert("Could not find valid hook address");
    }

    function _computeCreate2Address(bytes32 salt, bytes32 bytecodeHash, address deployer)
    internal
    pure
    returns (address)
    {
        return address(uint160(uint256(keccak256(abi.encodePacked(
            bytes1(0xff),
            deployer,
            salt,
            bytecodeHash
        )))));
    }
}