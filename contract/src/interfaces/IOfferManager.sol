// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface IOfferManager {
    enum OfferType {OfferToSell, OfferToBuy}
    enum OfferStatus {Active, Accepted, Disputed, Settled, Cancelled}

    struct Offer {
        uint256 eventId;
        address seller;
        address buyer;
        uint256 amount;
        uint256 collateral;
        string metadataUri;
        OfferType offerType;
        OfferStatus status;
    }

    event OfferCreated(
        uint256 indexed offerId,
        uint256 indexed eventId,
        address indexed creator,
        uint256 amount,
        OfferType offerType
    );

    event OfferAccepted(
        uint256 indexed offerId,
        address indexed acceptor
    );

    event OfferCancelled(uint256 indexed offerId);

    function createOfferToSellOnBehalf(
        address user,
        uint256 _eventId,
        uint256 _ask,
        string calldata _metadataUri
    ) external returns (uint256);

    function createOfferToBuyOnBehalf(
        address user,
        uint256 _eventId,
        uint256 _bid,
        string calldata _metadataUri
    ) external returns (uint256);

    function offers(uint256 offerId) external view returns (Offer memory);
    function offerCount() external view returns (uint256);
}