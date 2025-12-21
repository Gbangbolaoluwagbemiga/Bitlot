'use client';

import { useEffect, useState } from 'react';
import { getUserSession, authenticate, getNetwork } from '@/lib/stacks';
import Spinner from '@/components/Spinner';
import { openContractCall } from '@stacks/connect';
import { Pc } from '@stacks/transactions';
import { Toaster, toast } from 'sonner';

export default function LotteryInterface() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [txId, setTxId] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    const userSession = getUserSession();
    if (userSession.isUserSignedIn()) {
      setUser(userSession.loadUserData());
    }
  }, []);

  const handleConnect = () => {
    authenticate();
  };

  const handleLogout = () => {
    getUserSession().signUserOut('/');
  };

  const handleSpin = async () => {
    setSpinning(true);
    setResult(null);
    setTxId('');

    const network = getNetwork();
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'SP2QNSNKR3NRDWNTX0Q7R4T8WGBJ8RE8RA516AKZP';
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_NAME || 'bitlot-v2';

    // Define post-condition: User transfers 0.01 STX (10,000 uSTX)
    // We use the address from the current network (testnet or mainnet)
    const stxAddress = user.profile.stxAddress.testnet || user.profile.stxAddress.mainnet;
    const postConditions = [
      Pc.principal(stxAddress).willSendEq(10000).ustx()
    ];

    try {
      await openContractCall({
        network,
        contractAddress,
        contractName,
        functionName: 'play',
        functionArgs: [],
        postConditions,
        onFinish: (data: any) => {
          console.log('Transaction finished:', data);
          setTxId(data.txId);
          toast.info('Spinning the wheel... waiting for confirmation');
          
          // Here we just wait a bit and then start polling.
          setTimeout(() => {
              checkResult(data.txId);
          }, 1000);
        },
        onCancel: () => {
          setSpinning(false);
          toast.error('Spin cancelled');
        },
      });
    } catch (e) {
      setSpinning(false);
      console.error(e);
      toast.error('Something went wrong');
    }
  };

  const handleFundContract = async () => {
    const network = getNetwork();
    // Token is in the same deployment account usually
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'SP2QNSNKR3NRDWNTX0Q7R4T8WGBJ8RE8RA516AKZP';
    const tokenContractName = 'bitlot-token';
    const lotteryContractName = process.env.NEXT_PUBLIC_CONTRACT_NAME || 'bitlot-v2';
    
    // Amount: 100,000 BLOT (with 6 decimals = 100,000 * 1,000,000 = 100,000,000,000)
    const amount = 100000000000;
    const recipient = `${contractAddress}.${lotteryContractName}`;
    
    // Post-condition: User will transfer 100,000 BLOT
    const stxAddress = user.profile.stxAddress.testnet || user.profile.stxAddress.mainnet;
    const postConditions = [
      Pc.principal(stxAddress).willSendEq(amount).ft(`${contractAddress}.${tokenContractName}`, 'bitlot-token')
    ];

    try {
      await openContractCall({
        network,
        contractAddress,
        contractName: tokenContractName,
        functionName: 'transfer',
        functionArgs: [
            { type: 'uint', value: amount.toString() },     // amount
            { type: 'principal', value: stxAddress },       // sender
            { type: 'principal', value: recipient },        // recipient
            { type: 'optional', value: null }               // memo
        ],
        postConditions,
        onFinish: (data: any) => {
          console.log('Fund transaction finished:', data);
          toast.success('Funding transaction sent! Wait for confirmation.');
        },
        onCancel: () => {
          toast.error('Funding cancelled');
        },
      });
    } catch (e) {
      console.error(e);
      toast.error('Funding failed');
    }
  };

  const checkResult = async (txId: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 2 minutes timeout
    const network = getNetwork();
    const apiUrl = network.client.baseUrl; // Using client.baseUrl for StacksNetwork objects in @stacks/network v6+ or coreApiUrl in older

    // Poll for status
    const interval = setInterval(async () => {
      attempts++;
      if (attempts > maxAttempts) {
        clearInterval(interval);
        setSpinning(false);
        toast.error('Transaction timeout. Please check explorer.');
        return;
      }

      try {
        const res = await fetch(`${apiUrl}/extended/v1/tx/${txId}`);
        if (!res.ok) {
           // If 404, it might not be propagated yet, just continue
           return;
        }
        const data = await res.json();
        console.log('Poll tx status:', data.tx_status);
        
        if (data.tx_status === 'success') {
          clearInterval(interval);
          setSpinning(false);
          
          // The result is in tx_result.
          // Format: (ok uX)
          const resultHex = data.tx_result.repr; // e.g. "(ok u5)"
          const match = resultHex.match(/\(ok u(\d+)\)/);
          
          if (match) {
            const resultVal = parseInt(match[1]);
            setResult(resultVal);
            
            // Rewards mapping matching Spinner items
            // 0: 0, 1: 10, 2: 20, 3: 50, 4: 0, 5: 100, 6: 200, 7: 500
            const rewards = [0, 10, 20, 50, 0, 100, 200, 500];
            const wonAmount = rewards[resultVal];
            
            if (wonAmount > 0) {
              toast.success(`You won ${wonAmount} BLOT tokens! 🎉`, {
                duration: 5000,
                style: { fontSize: '1.2em' }
              });
            } else {
              toast('Better luck next time! 😢', {
                duration: 5000,
                icon: '💔',
                style: { fontSize: '1.2em' }
              });
            }
          }
        } else if (data.tx_status === 'abort_by_response' || data.tx_status === 'abort_by_post_condition') {
            clearInterval(interval);
            setSpinning(false);
            console.error('Transaction failed:', data);
            toast.error(`Transaction failed: ${data.tx_status}`);
        } else if (data.tx_status === 'pending') {
            // keep polling
        } else {
            // unexpected status, but we can keep polling or fail if it's a final state
            // For now, let's log it
            console.log('Unknown status:', data.tx_status);
        }
      } catch (e) {
        // ignore errors while pending (e.g. network error)
        console.error('Polling error:', e);
      }
    }, 2000);
  };

  if (!mounted) return null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white relative">
      <Toaster richColors position="bottom-center" />
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
          <div className="text-xl">Welcome, {user.profile.stxAddress.testnet || user.profile.stxAddress.mainnet}</div>
          
          <Spinner spinning={spinning} result={result} />
          
          <button
            onClick={handleSpin}
            disabled={spinning}
            className={`bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full text-xl transition-transform ${spinning ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
          >
            {spinning ? 'Spinning...' : 'SPIN (0.01 STX)'}
          </button>
          
          {txId && (
            <div className="text-xs text-gray-400 mt-4">
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
