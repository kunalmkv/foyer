// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {PoolKey} from "v4-core/types/PoolKey.sol";
import {IHooks} from "v4-core/interfaces/IHooks.sol";
import {SwapParams} from "v4-core/types/PoolOperation.sol";
import {IPoolManager} from "v4-core/interfaces/IPoolManager.sol";
import {Currency, CurrencyLibrary} from "v4-core/types/Currency.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {IOfferSwapHook} from "./interfaces/IOfferSwapHook.sol";
import {IKYCRelayer} from "./interfaces/IKYCRelayer.sol";

contract OfferRouter {
    using CurrencyLibrary for Currency;

    struct PoolConfig {
        PoolKey poolKey;
        bool isSupported;
        uint24 fee;
        int24 tickSpacing;
    }

    Currency public immutable PYUSD;
    IOfferSwapHook public immutable SWAP_HOOK;
    IKYCRelayer public immutable KYC_RELAYER;
    IPoolManager public immutable POOL_MANAGER;

    mapping(Currency => PoolConfig) public poolConfigs;

    event TokenPoolConfigured(address indexed token, uint24 fee, int24 tickSpacing);
    event OfferCreatedWithSwap(
        address indexed user,
        address inputToken,
        uint256 inputTokenAmount,
        uint256 askOrBidAmount,
        bool isForSale
    );

    modifier onlyKYCVerified() {
        require(KYC_RELAYER.isVerified(msg.sender), "Caller is not KYC verified");
        _;
    }

    constructor(
        address _pyusd,
        address _swapHook,
        address _kycRelayer,
        address _poolManager
    ) {
        PYUSD = Currency.wrap(_pyusd);
        SWAP_HOOK = IOfferSwapHook(_swapHook);
        KYC_RELAYER = IKYCRelayer(_kycRelayer);
        POOL_MANAGER = IPoolManager(_poolManager);
    }

    function configureTokenPool(
        address tokenAddress,
        uint24 fee,
        int24 tickSpacing
    ) external {
        require(tokenAddress != address(0), "Invalid token");
        require(tokenAddress != Currency.unwrap(PYUSD), "The token cannot be PYUSD");

        Currency token = Currency.wrap(tokenAddress);

        PoolKey memory poolKey = PoolKey({
            currency0: token < PYUSD ? token : PYUSD,
            currency1: token < PYUSD ? PYUSD : token,
            fee: fee,
            tickSpacing: tickSpacing,
            hooks: IHooks(address(SWAP_HOOK))
        });

        poolConfigs[token] = PoolConfig({
            poolKey: poolKey,
            isSupported: true,
            fee: fee,
            tickSpacing: tickSpacing
        });

        emit TokenPoolConfigured(tokenAddress, fee, tickSpacing);
    }

    function createOfferWithSwap(
        address inputTokenAddress,
        uint256 inputTokenAmount,
        uint256 askOrBidAmount,
        uint256 eventId,
        string calldata metadataUri,
        bool isForSale
    ) external onlyKYCVerified {
        require(inputTokenAmount > 0, "Input amount must be > 0");
        require(askOrBidAmount > 0, "Ask/Bid amount must be > 0");

        Currency inputToken = Currency.wrap(inputTokenAddress);
        PoolConfig memory config = poolConfigs[inputToken];
        require(config.isSupported, "Token not supported");

        require(IERC20(Currency.unwrap(inputToken)).transferFrom(msg.sender, address(this), inputTokenAmount), "Transfer to OfferRouter failed");
        require(IERC20(Currency.unwrap(inputToken)).approve(address(POOL_MANAGER), inputTokenAmount), "Approval to PoolManager failed");

        bytes memory hookData = abi.encode(
            msg.sender,
            eventId,
            askOrBidAmount,
            metadataUri,
            isForSale
        );
        SwapParams memory params = SwapParams({
            zeroForOne: inputToken < PYUSD,
            amountSpecified: int256(inputTokenAmount),
            sqrtPriceLimitX96: 0
        });

        POOL_MANAGER.swap(config.poolKey, params, hookData);

        emit OfferCreatedWithSwap(msg.sender, inputTokenAddress, inputTokenAmount, askOrBidAmount, isForSale);
    }
}