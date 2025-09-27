// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {IHooks} from "v4-core/interfaces/IHooks.sol";
import {Currency} from "v4-core/types/Currency.sol";
import {IOfferManager} from "./IOfferManager.sol";

interface IOfferSwapHook is IHooks {
    event OfferCreatedAfterSwap(
        address indexed user,
        uint256 indexed offerId,
        uint256 pyusdAmount,
        bool isForSale
    );

    function offerManager() external view returns (IOfferManager);
    function PYUSD() external view returns (Currency);
}