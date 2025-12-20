'use client';

import { useEffect, useState } from 'react';
import { userSession, authenticate, getNetwork } from '@/lib/stacks';
import Spinner from '@/components/Spinner';
import { openContractCall } from '@stacks/connect';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [txId, setTxId] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    if (userSession.isUserSignedIn()) {
      setUser(userSession.loadUserData());
    }
  }, []);

  const handleConnect = () => {
    authenticate();
  };

  const handleLogout = () => {
    userSession.signUserOut('/');
  };

  const handleSpin = async () => {
    setSpinning(true);
    setResult(null);
    setTxId('');

    const network = getNetwork();
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_NAME || 'bitlot';

    await openContractCall({
      network,
      contractAddress,
      contractName,
      functionName: 'play',
      functionArgs: [],
      onFinish: (data: any) => {
        console.log('Transaction finished:', data);
        setTxId(data.txId);
        // In a real app with Chainhooks, we would wait for the event via websocket/polling.
        // For this demo, we can simulate the result or poll the tx status.
        // Let's poll for the transaction receipt to get the result if possible, 
        // or just rely on the event from Chainhook (which we need to fetch).
        
        // Since we don't have a backend pushing events to us yet, 
        // we will simulate the "spinning" state for a few seconds 
        // and then show a random result or fetch the actual result if we can.
        
        // Polling logic would go here.
        // For now, let's keep spinning until we decide to stop (simulating async wait).
        setTimeout(() => {
            // Check if we can get the transaction result.
            // For the demo, we'll stop at a random spot or 0 if we can't confirm.
            // Ideally, the chainhook would update a DB and we poll that DB.
            setSpinning(false);
            // Simulate a result for visual feedback as we can't easily read the tx result 
            // from the client without an explorer API or complex polling.
            // BUT, the contract returns (ok result). 
            // We can read the tx result using Stacks API.
            checkResult(data.txId);
        }, 2000);
      },
      onCancel: () => {
        setSpinning(false);
      },
    });
  };

  const checkResult = async (txId: string) => {
    // Poll for status
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:3999/extended/v1/tx/${txId}`);
        const data = await res.json();
        if (data.tx_status === 'success') {
          clearInterval(interval);
          setSpinning(false);
          // The result is in tx_result.
          // Format: (ok uX)
          const resultHex = data.tx_result.repr; // e.g. "(ok u5)"
          const match = resultHex.match(/\(ok u(\d+)\)/);
          if (match) {
            setResult(parseInt(match[1]));
          }
        } else if (data.tx_status === 'abort_by_response' || data.tx_status === 'abort_by_post_condition') {
            clearInterval(interval);
            setSpinning(false);
            alert('Transaction failed');
        }
      } catch (e) {
        // ignore errors while pending
      }
    }, 1000);
  };

  if (!mounted) return null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8">🎰 BitLot 🎰</h1>
      
      {!user ? (
        <button
          onClick={handleConnect}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="flex flex-col items-center gap-8">
          <div className="text-xl">Welcome, {user.profile.stxAddress.testnet}</div>
          
          <Spinner spinning={spinning} result={result} />
          
          <button
            onClick={handleSpin}
            disabled={spinning}
            className={`bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full text-xl transition-transform ${spinning ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
          >
            {spinning ? 'Spinning...' : 'SPIN (1 STX)'}
          </button>
          
          {result !== null && (
            <div className="text-2xl font-bold text-yellow-400 animate-bounce">
              You won item {result}!
            </div>
          )}

          {txId && (
            <div className="text-xs text-gray-400">
              Tx: {txId}
            </div>
          )}
          
          <button onClick={handleLogout} className="text-sm underline text-gray-400 mt-8">
            Disconnect
          </button>
        </div>
      )}
    </main>
  );
}
