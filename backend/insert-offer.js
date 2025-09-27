const { MongoClient } = require('mongodb');

async function insertOffer() {
    const client = new MongoClient('mongodb://localhost:27017');
    
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db('block_tix');
        const collection = db.collection('offer');
        
        const offer = {
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
            status: 'ACTIVE',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        const result = await collection.insertOne(offer);
        console.log('Inserted offer:', result.insertedId);
        
        // Verify the offer was inserted
        const count = await collection.countDocuments();
        console.log(`Total offers in database: ${count}`);
        
        // Show the offers
        const offers = await collection.find({}).toArray();
        console.log('Offers in database:');
        offers.forEach(offer => {
            console.log(`- ID: ${offer.id}, Type: ${offer.type}, Event: ${offer.eventId}, Ask: ${offer.ask / 1000000} PYUSD, Status: ${offer.status}`);
        });
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
    }
}

insertOffer();
