// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {PoolKey} from "v4-core/types/PoolKey.sol";
import {Hooks} from "v4-core/libraries/Hooks.sol";
import {BaseHook} from "v4-periphery/utils/BaseHook.sol";
import {SwapParams} from "v4-core/types/PoolOperation.sol";
import {BalanceDelta} from "v4-core/types/BalanceDelta.sol";
import {PoolId, PoolIdLibrary} from "v4-core/types/PoolId.sol";
import {IPoolManager} from "v4-core/interfaces/IPoolManager.sol";
import {Currency, CurrencyLibrary} from "v4-core/types/Currency.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {IOfferManager} from "./interfaces/IOfferManager.sol";

contract OfferSwapHook is BaseHook {
    using PoolIdLibrary for PoolKey;
    using CurrencyLibrary for Currency;

    IOfferManager public immutable OFFER_MANAGER;
    Currency public immutable PYUSD;

    event OfferCreatedAfterSwap(
        address indexed user,
        uint256  offerId,
        uint256 askOrBidAmount,
        bool isForSale
    );

    constructor(
        address _poolManager,
        address _offerManager,
        address _pyusd
    ) BaseHook(IPoolManager(_poolManager)) {
        OFFER_MANAGER = IOfferManager(_offerManager);
        PYUSD = Currency.wrap(_pyusd);
    }

    function getHookPermissions() public pure override returns (Hooks.Permissions memory) {
        return Hooks.Permissions({
            beforeInitialize: false,
            afterInitialize: false,
            beforeAddLiquidity: false,
            afterAddLiquidity: false,
            beforeRemoveLiquidity: false,
            afterRemoveLiquidity: false,
            beforeSwap: false,
            afterSwap: true,
            beforeDonate: false,
            afterDonate: false,
            beforeSwapReturnDelta: false,
            afterSwapReturnDelta: false,
            afterAddLiquidityReturnDelta: false,
            afterRemoveLiquidityReturnDelta: false
        });
    }

    function _afterSwap(
        address,
        PoolKey calldata key,
        SwapParams calldata,
        BalanceDelta delta,
        bytes calldata hookData
    ) internal override returns (bytes4, int128) {
        if (hookData.length == 0) {
            return (BaseHook.afterSwap.selector, 0);
        }

        (
            address user,
            uint256 eventId,
            uint256 askOrBidAmount,
            string memory metadataUri,
            bool isForSale
        ) = abi.decode(hookData, (address, uint256, uint256, string, bool));

        uint256 pyusdReceived = _calculatePYUSDReceived(key, delta);
        require(pyusdReceived >= askOrBidAmount, "Insufficient PYUSD from swap");

        uint256 offerId = _createOfferWithPYUSD(
            user,
            eventId,
            pyusdReceived,
            metadataUri,
            isForSale
        );

        emit OfferCreatedAfterSwap(user, offerId, askOrBidAmount, isForSale);
        return (BaseHook.afterSwap.selector, 0);
    }

    function _calculatePYUSDReceived(
        PoolKey calldata key,
        BalanceDelta delta
    ) internal view returns (uint256) {
        if (key.currency0 == PYUSD) {
            return uint256(int256(- delta.amount0()));
        } else if (key.currency1 == PYUSD) {
            return uint256(int256(- delta.amount1()));
        } else {
            revert("Pool does not contain PYUSD");
        }
    }

    function _createOfferWithPYUSD(
        address user,
        uint256 eventId,
        uint256 askOrBidAmount,
        string memory metadataUri,
        bool isForSale
    ) internal returns (uint256) {
        IERC20(Currency.unwrap(PYUSD)).transfer(address(OFFER_MANAGER), askOrBidAmount);

        if (isForSale) {
            return OFFER_MANAGER.createOfferToSellOnBehalf(user, eventId, askOrBidAmount, metadataUri);
        } else {
            return OFFER_MANAGER.createOfferToBuyOnBehalf(user, eventId, askOrBidAmount, metadataUri);
        }
    }

}