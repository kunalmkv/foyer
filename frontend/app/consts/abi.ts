export const offerabi=[{"inputs":[{"internalType":"address","name":"_pyusd","type":"address"},{"internalType":"address","name":"_kycRelayer","type":"address"},{"internalType":"address","name":"_eventManager","type":"address"},{"internalType":"address","name":"_adminManager","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"offerId","type":"uint256"},{"indexed":false,"internalType":"address","name":"buyer","type":"address"}],"name":"OfferAccepted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"offerId","type":"uint256"}],"name":"OfferCancelled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"offerId","type":"uint256"},{"indexed":false,"internalType":"address","name":"by","type":"address"}],"name":"OfferDisputed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"offerId","type":"uint256"},{"indexed":false,"internalType":"address","name":"seller","type":"address"},{"indexed":false,"internalType":"address","name":"buyer","type":"address"}],"name":"OfferSettled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"offerId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"eventId","type":"uint256"},{"indexed":true,"internalType":"address","name":"buyer","type":"address"},{"indexed":false,"internalType":"uint256","name":"bid","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"collateral","type":"uint256"},{"indexed":false,"internalType":"string","name":"metadataUri","type":"string"}],"name":"OfferToBuyCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"offerId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"eventId","type":"uint256"},{"indexed":true,"internalType":"address","name":"seller","type":"address"},{"indexed":false,"internalType":"uint256","name":"ask","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"collateral","type":"uint256"},{"indexed":false,"internalType":"string","name":"metadataUri","type":"string"}],"name":"OfferToSellCreated","type":"event"},{"inputs":[],"name":"ADMIN_MANAGER","outputs":[{"internalType":"contract IAdminManager","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"EVENT_MANAGER","outputs":[{"internalType":"contract IEventManager","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"KYC_RELAYER","outputs":[{"internalType":"contract IKYCRelayer","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"OFFER_DISPUTE_PERIOD","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PYUSD","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_offerId","type":"uint256"}],"name":"acceptOffer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_offerId","type":"uint256"}],"name":"cancelOffer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_eventId","type":"uint256"},{"internalType":"uint256","name":"_bid","type":"uint256"},{"internalType":"string","name":"_metadataUri","type":"string"}],"name":"createOfferToBuy","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_eventId","type":"uint256"},{"internalType":"uint256","name":"_ask","type":"uint256"},{"internalType":"string","name":"_metadataUri","type":"string"}],"name":"createOfferToSell","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"offerCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"offers","outputs":[{"internalType":"uint256","name":"eventId","type":"uint256"},{"internalType":"address","name":"seller","type":"address"},{"internalType":"address","name":"buyer","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"collateral","type":"uint256"},{"internalType":"string","name":"metadataUri","type":"string"},{"internalType":"enum OfferManager.OfferType","name":"offerType","type":"uint8"},{"internalType":"enum OfferManager.OfferStatus","name":"status","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_offerId","type":"uint256"}],"name":"raiseDispute","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_offerId","type":"uint256"},{"internalType":"bool","name":"_inFavorOfSeller","type":"bool"}],"name":"resolveDispute","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_offerId","type":"uint256"}],"name":"settleOffer","outputs":[],"stateMutability":"nonpayable","type":"function"}]

export const eventManagerABI=[
    {
        "type": "constructor",
        "inputs": [
            {
                "name": "_adminManager",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "ADMIN_MANAGER",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "contract IAdminManager"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "cancelEvent",
        "inputs": [
            {
                "name": "_eventId",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "createEvent",
        "inputs": [
            {
                "name": "_eventTime",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "_metadataUri",
                "type": "string",
                "internalType": "string"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "eventCount",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "events",
        "inputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "creator",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "eventTime",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "metadataUri",
                "type": "string",
                "internalType": "string"
            },
            {
                "name": "isCancelled",
                "type": "bool",
                "internalType": "bool"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "event",
        "name": "EventCancelled",
        "inputs": [
            {
                "name": "eventId",
                "type": "uint256",
                "indexed": true,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "EventCreated",
        "inputs": [
            {
                "name": "eventId",
                "type": "uint256",
                "indexed": true,
                "internalType": "uint256"
            },
            {
                "name": "creator",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            },
            {
                "name": "eventTime",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "metadataUri",
                "type": "string",
                "indexed": false,
                "internalType": "string"
            }
        ],
        "anonymous": false
    }
]
export const adminManagerABI=[
    {
        "type": "constructor",
        "inputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "addAdmin",
        "inputs": [
            {
                "name": "_account",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "admin",
        "inputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bool",
                "internalType": "bool"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "owner",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "removeAdmin",
        "inputs": [
            {
                "name": "_account",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "transferOwnership",
        "inputs": [
            {
                "name": "_newOwner",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "event",
        "name": "AdminAdded",
        "inputs": [
            {
                "name": "account",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "AdminRemoved",
        "inputs": [
            {
                "name": "account",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "OwnershipTransferred",
        "inputs": [
            {
                "name": "previousOwner",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "newOwner",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            }
        ],
        "anonymous": false
    }
]
