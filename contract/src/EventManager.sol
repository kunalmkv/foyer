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


import "./interfaces/IAdminManager.sol";

contract EventManager {
    struct Event {
        address creator;
        uint256 eventTime;
        string metadataUri;
        bool isCancelled;
    }

    uint256 public eventCount;
    mapping(uint256 => Event) public events;
    IAdminManager public immutable ADMIN_MANAGER;

    event EventCreated(uint256 indexed eventId, address creator, uint256 eventTime, string metadataUri);
    event EventCancelled(uint256 indexed eventId);

    constructor(address _adminManager) {
        ADMIN_MANAGER = IAdminManager(_adminManager);
    }

    modifier onlyAdmin() {
        require(ADMIN_MANAGER.admin(msg.sender), "Caller is not an admin");
        _;
    }

    function createEvent(uint256 _eventTime, string calldata _metadataUri) external onlyAdmin returns (uint256) {
        require(_eventTime > block.timestamp, "Event time must be in the future");

        eventCount++;
        events[eventCount] = Event({
            creator: msg.sender,
            eventTime: _eventTime,
            metadataUri: _metadataUri,
            isCancelled: false
        });

        emit EventCreated(eventCount, msg.sender, _eventTime, _metadataUri);
        return eventCount;
    }

    function cancelEvent(uint256 _eventId) external onlyAdmin {
        Event storage evt = events[_eventId];
        require(evt.creator != address(0), "Event does not exist");
        require(!evt.isCancelled, "Event already cancelled");

        evt.isCancelled = true;
        emit EventCancelled(_eventId);
    }
}