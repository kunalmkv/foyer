// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

//
//  $$$$$$$$\
//  $$  _____|
//  $$ |    $$$$$$\  $$\   $$\  $$$$$$\   $$$$$$\
//  $$$$$\ $$  __$$\ $$ |  $$ |$$  __$$\ $$  __$$\
//  $$  __|$$ /  $$ |$$ |  $$ |$$$$$$$$ |$$ |  \__|
//  $$ |   $$ |  $$ |$$ |  $$ |$$   ____|$$ |
//  $$ |   \$$$$$$  |\$$$$$$$ |\$$$$$$$\ $$ |
//  \__|    \______/  \____$$ | \_______|\__|
//                   $$\   $$ |
//                   \$$$$$$  |
//                    \______/
//

import {IEventManager} from "./interfaces/IEventManager.sol";
import {IAdminManager} from "./interfaces/IAdminManager.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract OfferManager {

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

    IERC20 public immutable PYUSD;
    IEventManager public immutable EVENT_MANAGER;
    IAdminManager public immutable ADMIN_MANAGER;

    uint256 public offerCount;
    mapping(uint256 => Offer) public offers;

    uint256 public immutable OFFER_DISPUTE_PERIOD = 2 days;

    event OfferCancelled(uint256 indexed offerId);
    event OfferDisputed(uint256 indexed offerId, address  by);
    event OfferAccepted(uint256 indexed offerId, address  buyer);
    event OfferSettled(uint256 indexed offerId, address  seller, address  buyer);
    event OfferToBuyCreated(uint256 indexed offerId, uint256 indexed eventId, address indexed buyer, uint256 bid, uint256 collateral, string metadataUri);
    event OfferToSellCreated(uint256 indexed offerId, uint256 indexed eventId, address indexed seller, uint256 ask, uint256 collateral, string metadataUri);

    constructor(address _pyusd, address _eventManager, address _adminManager) {
        PYUSD = IERC20(_pyusd);
        EVENT_MANAGER = IEventManager(_eventManager);
        ADMIN_MANAGER = IAdminManager(_adminManager);
    }

    modifier onlyAdmin() {
        require(ADMIN_MANAGER.admin(msg.sender), "Caller is not admin");
        _;
    }

    function createOfferToSell(uint256 _eventId, uint256 _ask, string calldata _metadataUri) external returns (uint256) {
        require(_ask > 0, "Ask must be > 0");

        (address creator, uint256 eventTime,, bool isCancelled) = EVENT_MANAGER.events(_eventId);
        require(creator != address(0), "Event does not exist");
        require(!isCancelled, "Event is cancelled");
        require(eventTime > block.timestamp, "Event time must be in the future");

        uint256 collateral = _ask / 2;
        require(PYUSD.transferFrom(msg.sender, address(this), collateral), "Collateral transfer failed");

        offerCount++;
        offers[offerCount] = Offer({
            eventId: _eventId,
            seller: msg.sender,
            buyer: address(0),
            amount: _ask,
            collateral: collateral,
            metadataUri: _metadataUri,
            offerType: OfferType.OfferToSell,
            status: OfferStatus.Active
        });

        emit OfferToSellCreated(offerCount, _eventId, msg.sender, _ask, collateral, _metadataUri);
        return offerCount;
    }

    function createOfferToBuy(uint256 _eventId, uint256 _bid, string calldata _metadataUri) external returns (uint256) {
        require(_bid > 0, "Bid must be > 0");

        (address creator, uint256 eventTime,, bool isCancelled) = EVENT_MANAGER.events(_eventId);
        require(creator != address(0), "Event does not exist");
        require(!isCancelled, "Event is cancelled");
        require(eventTime > block.timestamp, "Event time must be in the future");

        require(PYUSD.transferFrom(msg.sender, address(this), _bid), "Bid transfer failed");

        offerCount++;
        offers[offerCount] = Offer({
            eventId: _eventId,
            seller: address(0),
            buyer: msg.sender,
            amount: _bid,
            collateral: _bid / 2,
            metadataUri: _metadataUri,
            offerType: OfferType.OfferToBuy,
            status: OfferStatus.Active
        });

        emit OfferToBuyCreated(offerCount, _eventId, msg.sender, _bid, _bid / 2, _metadataUri);
        return offerCount;
    }

    function acceptOffer(uint256 _offerId) external {
        Offer storage offer = offers[_offerId];
        require(offer.status == OfferStatus.Active, "Offer is not active!");

        (,uint256 eventTime,,bool isCancelled) = EVENT_MANAGER.events(offer.eventId);
        require(!isCancelled, "Event is cancelled");
        require(eventTime > block.timestamp, "Event time must be in the future");

        if (offer.offerType == OfferType.OfferToSell) {
            require(offer.buyer == address(0), "Offer already has a buyer");
            require(PYUSD.transferFrom(msg.sender, address(this), offer.amount), "Payment transfer failed");
            offer.buyer = msg.sender;
        } else {
            require(offer.seller == address(0), "Offer already has a seller");
            require(PYUSD.transferFrom(msg.sender, address(this), offer.collateral), "Collateral transfer failed");
            offer.seller = msg.sender;
        }

        offer.status = OfferStatus.Accepted;
        emit OfferAccepted(_offerId, msg.sender);
    }

    function cancelOffer(uint256 _offerId) external {
        Offer storage offer = offers[_offerId];
        require(offer.status == OfferStatus.Active, "Offer is not active");

        if (offer.offerType == OfferType.OfferToSell) {
            require(offer.seller == msg.sender, "Caller is not seller");
            require(PYUSD.transfer(offer.seller, offer.collateral), "Collateral transfer failed");
        } else {
            require(offer.buyer == msg.sender, "Caller is not buyer");
            require(PYUSD.transfer(offer.buyer, offer.amount + offer.collateral), "Payment and collateral transfer failed");
        }

        offer.status = OfferStatus.Cancelled;
        emit OfferCancelled(_offerId);
    }

    function settleOffer(uint256 _offerId) external {
        Offer storage offer = offers[_offerId];
        require(offer.status == OfferStatus.Accepted, "Offer is not accepted");
        require(offer.buyer == msg.sender, "Caller is not buyer");

        (,uint256 eventTime,,) = EVENT_MANAGER.events(offer.eventId);
        require(block.timestamp >= (eventTime + OFFER_DISPUTE_PERIOD), "Event dispute period not over");

        require(PYUSD.transfer(offer.seller, (offer.amount + offer.collateral)), "Payment transfer to seller failed");

        offer.status = OfferStatus.Settled;
        emit OfferSettled(_offerId, offer.seller, offer.buyer);
    }

    function raiseDispute(uint256 _offerId) external {
        Offer storage offer = offers[_offerId];
        require(offer.buyer == msg.sender, "Caller is not buyer");
        require(offer.status == OfferStatus.Accepted, "Offer is not accepted");

        (,uint256 eventTime,,) = EVENT_MANAGER.events(offer.eventId);
        require(block.timestamp >= eventTime, "Event has not occurred yet");
        require(block.timestamp < (eventTime + OFFER_DISPUTE_PERIOD), "Dispute period over");

        offer.status = OfferStatus.Disputed;
        emit OfferDisputed(_offerId, msg.sender);
    }


    function resolveDispute(uint256 _offerId, bool _inFavorOfSeller) external onlyAdmin {
        Offer storage offer = offers[_offerId];
        require(offer.status == OfferStatus.Disputed, "Offer is not disputed");

        if (_inFavorOfSeller) {
            require(PYUSD.transfer(offer.seller, (offer.amount + offer.collateral)), "Payment transfer to seller failed");
        } else {
            require(PYUSD.transfer(offer.buyer, (offer.amount + offer.collateral)), "Payment transfer to buyer failed");
        }

        emit OfferSettled(_offerId, offer.seller, offer.buyer);
        offer.status = OfferStatus.Settled;
    }
}
