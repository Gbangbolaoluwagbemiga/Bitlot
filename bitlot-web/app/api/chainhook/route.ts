import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Handle initial Chainhook ping or empty body
    if (!body || Object.keys(body).length === 0) {
        return NextResponse.json({ status: 'active' });
    }

    // Process blocks
    const blocks = body.apply || [];
    
    for (const block of blocks) {
      console.log(`📦 Processing Block #${block.block_identifier.index}`);
      
      const transactions = block.transactions || [];
      for (const tx of transactions) {
        // Look for contract events
        if (tx.metadata && tx.metadata.receipt) {
             const events = tx.metadata.receipt.events || [];
             for (const event of events) {
                 // We are looking for the "spin-result" print event
                 if (event.type === 'SmartContractEvent' && 
                     event.data.topic === "print") {
                     
                     console.log(`🎰 Spin Result Detected!`);
                     console.log(`Tx ID: ${tx.transaction_identifier.hash}`);
                     console.log('Event Data:', JSON.stringify(event.data, null, 2));
                     
                     // Note: In a production app, you would:
                     // 1. Decode the hex value in event.data.value using @stacks/transactions
                     // 2. Update the database state for this player
                     // 3. Trigger a WebSocket update to the frontend
                 }
             }
        }
      }
    }

    return NextResponse.json({ status: 'processed' });
  } catch (error) {
    console.error('Error processing chainhook:', error);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}
