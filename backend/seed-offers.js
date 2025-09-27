const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/block_tix', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Define the offer schema
const offerSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    type: { type: String, required: true, enum: ['OFFER_TO_BUY', 'OFFER_TO_SELL'] },
    eventId: { type: Number, required: true },
    sellerAddress: { type: String, required: true },
    collateral: { type: Number, required: true },
    ask: { type: Number, required: true },
    buyerAddress: { type: String, default: null },
    quantity: { type: Number },
    seatNumbers: { type: [String] },
    seatType: { type: String },
    isPhysicalTicketNeededToAttend: { type: Boolean },
    metadataUrl: { type: String, required: true },
    status: { type: String, required: true, enum: ['ACTIVE', 'SETTLED', 'ACCEPTED', 'DISPUTED', 'CANCELLED'] }
}, {
    timestamps: true
});

const Offer = mongoose.connection.useDb("block_tix").model("offer", offerSchema);

// Sample offers data
const sampleOffers = [
    {
        id: 1,
        type: 'OFFER_TO_SELL',
        eventId: 1,
        sellerAddress: '0x1234567890123456789012345678901234567890',
        collateral: 2500000, // 2.5 PYUSD in wei (6 decimals)
        ask: 5000000, // 5 PYUSD in wei (6 decimals)
        quantity: 2,
        seatNumbers: ['A1', 'A2'],
        seatType: 'VIP',
        isPhysicalTicketNeededToAttend: true,
        metadataUrl: 'https://example.com/metadata/1',
        status: 'ACTIVE'
    },
    {
        id: 2,
        type: 'OFFER_TO_SELL',
        eventId: 1,
        sellerAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        collateral: 1500000, // 1.5 PYUSD in wei (6 decimals)
        ask: 3000000, // 3 PYUSD in wei (6 decimals)
        quantity: 1,
        seatNumbers: ['B5'],
        seatType: 'Premium',
        isPhysicalTicketNeededToAttend: false,
        metadataUrl: 'https://example.com/metadata/2',
        status: 'ACTIVE'
    },
    {
        id: 3,
        type: 'OFFER_TO_BUY',
        eventId: 1,
        sellerAddress: '0x9876543210987654321098765432109876543210',
        collateral: 1000000, // 1 PYUSD in wei (6 decimals)
        ask: 4000000, // 4 PYUSD in wei (6 decimals)
        quantity: 1,
        seatNumbers: ['C10'],
        seatType: 'Standard',
        isPhysicalTicketNeededToAttend: true,
        metadataUrl: 'https://example.com/metadata/3',
        status: 'ACTIVE'
    },
    {
        id: 4,
        type: 'OFFER_TO_SELL',
        eventId: 2,
        sellerAddress: '0x1111111111111111111111111111111111111111',
        collateral: 2000000, // 2 PYUSD in wei (6 decimals)
        ask: 4000000, // 4 PYUSD in wei (6 decimals)
        quantity: 3,
        seatNumbers: ['D1', 'D2', 'D3'],
        seatType: 'General',
        isPhysicalTicketNeededToAttend: false,
        metadataUrl: 'https://example.com/metadata/4',
        status: 'ACTIVE'
    }
];

async function seedOffers() {
    try {
        console.log('Seeding offers...');
        
        // Clear existing offers
        await Offer.deleteMany({});
        console.log('Cleared existing offers');
        
        // Insert sample offers
        await Offer.insertMany(sampleOffers);
        console.log('Inserted sample offers');
        
        // Verify the offers were inserted
        const count = await Offer.countDocuments();
        console.log(`Total offers in database: ${count}`);
        
        // Show the offers
        const offers = await Offer.find({});
        console.log('Offers in database:');
        offers.forEach(offer => {
            console.log(`- ID: ${offer.id}, Type: ${offer.type}, Event: ${offer.eventId}, Ask: ${offer.ask / 1000000} PYUSD, Status: ${offer.status}`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('Error seeding offers:', error);
        process.exit(1);
    }
}

seedOffers();
