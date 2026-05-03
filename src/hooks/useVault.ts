import { useMemo } from 'react';
import { Connection } from '@solana/web3.js';
import { BagsSDK } from '@bagsfm/bags-sdk';

const RPC_URL = import.meta.env.VITE_HELIUS_RPC_URL || 'https://mainnet.helius-rpc.com/?api-key=7e88f262-21de-488c-b82b-75789b1da22c';


const BAGS_API_KEY = import.meta.env.VITE_BAGS_API_KEY;

export function useVault() {
  const connection = useMemo(() => new Connection(RPC_URL, 'confirmed'), []);

  const sdk = useMemo(() => {
    // API Key is the first argument
    return new BagsSDK(BAGS_API_KEY || '', connection);
  }, [connection]);

  const fetchTrendingCreators = async () => {
    try {
      // Use the method for global leaderboards
      const items = await sdk.state.getTopTokensByLifetimeFees();
      
      return items.map((item: any) => {
        const creators = item.creators || [];
        const firstCreator = creators[0] || {};
        const fees = parseFloat(item.lifetimeFees || '0') / 1e9;
        
        // Advanced Momentum Score:
        // (Fees * velocity) / (distribution factor)
        // High fees with fewer holders = early conviction (high momentum)
        // High fees with many holders = established whale (high strength)
        const holderCount = item.tokenInfo?.holderCount || 100;
        const distributionRatio = holderCount / 1000;
        const momentum = fees * (1 / (distributionRatio || 1));

        return {
          creatorAddress: firstCreator.wallet || item.token,
          username: firstCreator.username || 'Anonymous_Alpha',
          totalFeesCollected: parseFloat(item.lifetimeFees || '0'),
          followerCount: holderCount,
          momentum: momentum,
          symbol: item.tokenInfo?.symbol || '???'
        };
      }).sort((a: any, b: any) => b.momentum - a.momentum);
    } catch (err) {
      console.error('Failed to fetch Bags data:', err);
      throw err;
    }
  };

  const getVaultAlpha = async () => {
    const creators = await fetchTrendingCreators();
    // Filter for momentum > some threshold or just top 5
    return creators.filter(c => c.momentum > 0.01).slice(0, 5);
  };

  return {
    connection,
    sdk,
    fetchTrendingCreators,
    getVaultAlpha,
  };
}
