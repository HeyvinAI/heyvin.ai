import { useMemo, useState, useEffect } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import Terminal from './components/Terminal';
import { motion } from 'motion/react';
import { Sun, Moon } from 'lucide-react';
import { cn } from './lib/utils';

// Default styles that can be overridden by your app
import '@solana/wallet-adapter-react-ui/styles.css';

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Mainnet;

  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => import.meta.env.VITE_HELIUS_RPC_URL || clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      /**
       * Wallets that implement either of these standards will be available automatically.
       *
       *   - Solana Mobile Stack Mobile Wallet Adapter Protocol
       *   - (Optional) Wallet Standard
       *
       * If you wish to support a wallet that supports neither of those standards,
       * instantiate its legacy adapter here. Common legacy adapters can be found
       * in the npm package `@solana/wallet-adapter-wallets`.
       */
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className={cn(
            "min-h-screen transition-colors duration-300 relative overflow-hidden flex flex-col font-mono",
            theme === 'dark' ? "bg-[#050505] text-[#00ff41]" : "bg-white text-green-800"
          )}>
            
            {/* Background Grid Accent */}
            <div className={cn(
              "absolute inset-0 z-0 opacity-10 pointer-events-none",
              theme === 'dark' ? "" : "opacity-[0.05]"
            )} 
                 style={{ backgroundImage: `radial-gradient(circle, ${theme === 'dark' ? '#00ff41' : '#166534'} 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
            
            {/* Navigation / Header */}
            <header className={cn(
              "fixed top-0 left-0 w-full z-20 flex justify-between items-center px-4 py-3 backdrop-blur-sm border-b transition-all",
              theme === 'dark' ? "bg-black/60 border-green-500/10" : "bg-white/80 border-green-800/10"
            )}>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2"
              >
                <div className={cn(
                  "w-8 h-8 rounded bg-opacity-20 border flex items-center justify-center",
                  theme === 'dark' ? "bg-green-500 border-green-500/40" : "bg-green-800 border-green-800/40"
                )}>
                  <div className={cn(
                    "w-4 h-4 rounded-full animate-pulse shadow-lg",
                    theme === 'dark' ? "bg-green-400 shadow-green-500/50" : "bg-green-700 shadow-green-800/30"
                  )} />
                </div>
                <div>
                  <h1 className="text-sm font-bold tracking-[0.1em] uppercase">Vault AI</h1>
                  <p className={cn("text-[8px] font-medium", theme === 'dark' ? "text-green-500/60" : "text-green-800/60")}>BETA_ACCESS_01</p>
                </div>
              </motion.div>

              <div className="flex items-center gap-2 sm:gap-4">
                <button 
                  onClick={toggleTheme}
                  className={cn(
                    "p-2 rounded border transition-all",
                    theme === 'dark' ? "border-green-500/20 hover:bg-green-500/10 text-green-500" : "border-green-800/20 hover:bg-green-800/10 text-green-800"
                  )}
                >
                  {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                </button>
                <WalletMultiButton className={cn(
                  "wallet-adapter-button-custom",
                  theme === 'light' && "wallet-light"
                )} />
              </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 flex-1 flex items-center justify-center p-4">
              <Terminal theme={theme} />
            </main>

            {/* Footer / Status Bar */}
            <footer className="fixed bottom-0 left-0 w-full p-4 flex justify-between items-center text-[10px] uppercase text-green-500/40 bg-black/40 border-t border-green-500/10 backdrop-blur-md">
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  NETWORK: MAINNET_BETA
                </div>
                <div>LATENCY: 42MS</div>
                <div>ECOSYSTEM: BAGSFM_PROTOCOL</div>
              </div>
              <div className="hidden sm:block">
                SEC_ARCH: ZERO_TRUST_VAULT
              </div>
            </footer>

            {/* Global Scanning Overlay */}
            <motion.div 
              animate={{
                top: ["-20%", "120%"],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
              className={cn(
                "absolute left-0 w-full h-[2px] z-0 pointer-events-none",
                theme === 'dark' ? "bg-green-500/10 shadow-[0_0_20px_rgba(0,255,65,0.2)]" : "bg-green-800/10 shadow-[0_0_20px_rgba(22,101,52,0.1)]"
              )}
            />
          </div>

          <style>{`
            .wallet-adapter-button-custom {
              background: rgba(0, 255, 65, 0.1) !important;
              border: 1px solid rgba(0, 255, 65, 0.4) !important;
              color: #00ff41 !important;
              font-family: inherit !important;
              font-size: 10px !important;
              text-transform: uppercase !important;
              letter-spacing: 0.1em !important;
              height: 32px !important;
              padding: 0 12px !important;
              border-radius: 4px !important;
              transition: all 0.2s ease !important;
            }
            .wallet-adapter-button-custom:hover {
              background: rgba(0, 255, 65, 0.2) !important;
              border-color: #00ff41 !important;
              box-shadow: 0 0 10px rgba(0, 255, 65, 0.2) !important;
            }
            .wallet-adapter-button-custom.wallet-light {
              background: rgba(22, 101, 52, 0.1) !important;
              border-color: rgba(22, 101, 52, 0.4) !important;
              color: #166534 !important;
            }
            .wallet-adapter-button-custom.wallet-light:hover {
              background: rgba(22, 101, 52, 0.2) !important;
              border-color: #166534 !important;
              box-shadow: 0 0 10px rgba(22, 101, 52, 0.1) !important;
            }
            .wallet-adapter-modal-wrapper {
              background: #0a0a0a !important;
              border: 1px solid rgba(0, 255, 65, 0.2) !important;
              border-radius: 8px !important;
              color: #00ff41 !important;
              font-family: inherit !important;
            }
            .wallet-adapter-modal-title {
              color: #00ff41 !important;
            }
            .wallet-adapter-modal-button-close {
              background: rgba(0, 255, 65, 0.1) !important;
            }
          `}</style>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
