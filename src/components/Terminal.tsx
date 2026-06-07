import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal as TerminalIcon, Search, Shield, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { useVault } from '../hooks/useVault';
import { cn } from '../lib/utils';
import { useWallet } from '@solana/wallet-adapter-react';
import { ed25519 } from '@noble/curves/ed25519.js';

interface LogEntry {
  type: 'input' | 'output' | 'error' | 'system' | 'success';
  content: string | React.ReactNode;
  id: string;
}

export default function Terminal({ theme }: { theme: 'dark' | 'light' }) {
  const { publicKey, signMessage, connected } = useWallet();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [input, setInput] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { fetchTrendingCreators, getVaultAlpha } = useVault();

  useEffect(() => {
    const boot = async () => {
      try {
        // Small delay to make it feel like a real boot
        await new Promise(r => setTimeout(r, 400));
        addLog('system', 'INITIALIZING VAULT_TERMINAL_v1.0.4...');
        await new Promise(r => setTimeout(r, 600));
        addLog('system', 'ESTABLISHING SECURE_CONNECTION TO BAGS_PROTOCOL...');
        await new Promise(r => setTimeout(r, 500));
        addLog('system', 'CONNECTION_ESTABLISHED. HANDSHAKE_SUCCESS.');
        await new Promise(r => setTimeout(r, 300));
        addLog('output', (
          <div className="space-y-1">
            <p className="text-green-400 font-bold">WELCOME TO BAGVAULT_AI</p>
            <p className="opacity-70">The most advanced Alpha Extraction Layer for the Bags ecosystem.</p>
            <p className="mt-2">Type <span className="font-bold text-white">help</span> to view available protocols.</p>
          </div>
        ));
      } catch (err) {
        console.error('Boot error:', err);
        addLog('error', 'SYSTEM_BOOT_WARN: Non-critical failure in display buffer.');
      } finally {
        setIsInitializing(false);
      }
    };
    boot();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (type: LogEntry['type'], content: React.ReactNode) => {
    setLogs(prev => [...prev, { type, content, id: Math.random().toString(36).substr(2, 9) }]);
  };

  const clearLogs = () => setLogs([]);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();
    if (!cmd || isInitializing) return;

    addLog('input', `> ${input}`);
    setHistory(prev => [input, ...prev].slice(0, 50));
    setHistoryIndex(-1);
    setInput('');

    switch (cmd) {
      case 'help':
        addLog('output', (
          <div className="space-y-1 mt-2">
            <p className="text-green-300 font-bold text-xs uppercase tracking-widest">Available Protocols:</p>
            <div className="grid grid-cols-[80px_1fr] gap-2 text-[11px]">
              <span className="font-bold text-green-400">scan</span><span>: Pulse Bags ecosystem for creators</span>
              <span className="font-bold text-green-400">vault</span><span>: Extract high-momentum Alpha</span>
              <span className="font-bold text-green-400">whale</span><span>: Detect top fee-generating whales</span>
              <span className="font-bold text-green-400">status</span><span>: Verify current terminal connection state</span>
              <span className="font-bold text-green-400">verify</span><span>: Sign challenge to prove identity</span>
              <span className="font-bold text-green-400">clear</span><span>: Flush console buffer</span>
            </div>
          </div>
        ));
        break;

      case 'scan':
        addLog('system', 'SCANNING BAGS ECOSYSTEM TOKEN CREATORS...');
        try {
          const creators = await fetchTrendingCreators();
          const container = {
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.05 }
            }
          };
          const item = {
            hidden: { opacity: 0, x: -10 },
            show: { opacity: 1, x: 0 }
          };

          addLog('output', (
            <div className="mt-4 overflow-x-auto">
              <table className={cn(
                "w-full text-xs border transition-colors",
                "dark:border-green-500/20 dark:bg-black/20 border-green-800/10 bg-white/5"
              )}>
                <thead>
                  <tr className={cn(
                    "border-b transition-colors",
                    "dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20",
                    "bg-green-800/5 text-green-800 border-green-800/20"
                  )}>
                    <th className="p-2 text-left">SYMBOL</th>
                    <th className="p-2 text-left">CREATOR</th>
                    <th className="p-2 text-right">FEES (SOL)</th>
                    <th className="p-2 text-right">HOLDERS</th>
                    <th className="p-2 text-right dark:text-green-300 text-green-900">MOMENTUM</th>
                  </tr>
                </thead>
                <motion.tbody
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  {creators.slice(0, 10).map((c: any, i: number) => (
                    <motion.tr 
                      key={i} 
                      variants={item}
                      className={cn(
                        "border-b transition-colors hover:bg-opacity-10",
                        "dark:border-green-500/10 dark:hover:bg-green-500/5",
                        "border-green-800/5 hover:bg-green-800/5"
                      )}
                    >
                      <td className="p-2 font-bold">{c.symbol}</td>
                      <td className="p-2 truncate max-w-[100px] font-mono opacity-70">{c.username}</td>
                      <td className="p-2 text-right">{(c.totalFeesCollected / 1e9).toFixed(2)}</td>
                      <td className="p-2 text-right">{c.followerCount}</td>
                      <td className="p-2 text-right font-bold dark:text-green-300 text-green-900">{c.momentum.toFixed(4)}</td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          ));
        } catch (err) {
          addLog('error', 'ERR_SCAN_FAILURE: Could not interface with Bags SDK.');
        }
        break;

      case 'vault':
      case 'whale':
        const isWhale = cmd === 'whale';
        addLog('system', isWhale ? 'DETECTING WHALE CONCENTRATION...' : 'DECRYPTING ALPHA DATA FROM VAULT...');
        try {
          const alpha = await getVaultAlpha();
          const displayData = isWhale ? alpha.filter((a: any) => a.totalFeesCollected > 5e9) : alpha;
          
          const container = {
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.15 }
            }
          };
          const item = {
            hidden: { opacity: 0, scale: 0.98, y: 10 },
            show: { opacity: 1, scale: 1, y: 0 }
          };

          addLog('output', (
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-4 mt-4"
            >
              {displayData.map((a: any, i: number) => (
                <motion.div 
                  key={i} 
                  variants={item}
                  className="p-3 border-l-4 border-green-400 bg-green-500/5 relative overflow-hidden group shadow-lg"
                >
                  <div className="absolute inset-0 dark:bg-green-500/5 bg-green-800/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-center">
                    <span className={cn("font-bold", theme === 'dark' ? "text-green-300" : "text-green-700")}>
                      {isWhale ? '🚨 WHALE_DETECTED' : `SIGNAL_${a.symbol}`}
                    </span>
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 border rounded transition-colors",
                      theme === 'dark' ? "opacity-50 border-green-500/30" : "opacity-80 border-green-800/30"
                    )}>ALPHA_STRENGTH: HIGH</span>
                  </div>
                  <p className={cn("text-xs mt-2 font-mono transition-colors", theme === 'dark' ? "text-white/80" : "text-green-900/80")}>
                    Creator: {a.username} ({a.creatorAddress.slice(0, 4)}...{a.creatorAddress.slice(-4)})
                  </p>
                  <div className={cn(
                    "flex gap-4 mt-3 text-[10px] border-t pt-2 transition-colors",
                    theme === 'dark' ? "text-green-400/70 border-green-500/10" : "text-green-800/70 border-green-800/10"
                  )}>
                    <span className="flex items-center gap-1"><Zap size={10} /> SCORE: {a.momentum.toFixed(4)}</span>
                    <span className="flex items-center gap-1"><Shield size={10} /> REVENUE: {(a.totalFeesCollected / 1e9).toFixed(2)} SOL</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ));
        } catch (err) {
          addLog('error', 'ERR_VAULT_DECRYPT: Access denied or data corrupted.');
        }
        break;

      case 'verify':
        if (!connected || !publicKey || !signMessage) {
          addLog('error', 'ERR_AUTH: Wallet not connected. Please connect wallet first.');
          break;
        }

        addLog('system', 'INITIATING CRYPTOGRAPHIC CHALLENGE...');
        try {
          const timestamp = Date.now();
          const message = `Vault AI Authentication Challenge: ${timestamp}\n\nProve ownership of: ${publicKey.toBase58()}\n\nNote: This is a read-only signature to verify identity.`;
          const encodedMessage = new TextEncoder().encode(message);
          
          addLog('output', 'Awaiting wallet signature for challenge...');
          const signature = await signMessage(encodedMessage);

          // Verify the signature on the client side
          const isValid = ed25519.verify(signature, encodedMessage, publicKey.toBytes());

          if (isValid) {
            addLog('success', (
              <div className="flex items-center gap-2 py-1">
                <CheckCircle2 size={14} className="text-green-400" />
                <span className="text-green-400 font-bold">IDENTITY_VERIFIED: Access to Private Alpha protocols enabled.</span>
              </div>
            ));
          } else {
            addLog('error', 'ERR_AUTH: Signature verification failed.');
          }
        } catch (err: any) {
          addLog('error', `ERR_AUTH: ${err.message || 'Signature request cancelled.'}`);
        }
        break;

      case 'status':
        addLog('system', 'ANALYZING TERMINAL PERMISSIONS...');
        addLog('output', (
          <div className="space-y-2 text-[11px] p-2 bg-white/5 border border-white/10 rounded mt-2">
            <p><span className="text-green-300 font-bold">MODE:</span> {connected ? 'AUTHENTICATED_OBSERVER' : 'PUBLIC_OBSERVER'}</p>
            <p><span className="text-green-300 font-bold">TRUST_SCORE:</span> {connected ? 'ELEVATED' : 'LOW (Unverified)'}</p>
            {connected && <p><span className="text-green-300 font-bold">ADDRESS:</span> {publicKey?.toBase58().slice(0, 12)}...</p>}
            <p className="opacity-60 italic">Note: You can "connect" any public key to view data, but write operations and "Private Alpha" require identity verification via the "verify" protocol (Signature-based proof of stake).</p>
          </div>
        ));
        break;

      case 'clear':
        clearLogs();
        break;

      default:
        addLog('error', `UNKNOWN_COMMAND: "${cmd}". Attempt "help" for valid logic modules.`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const nextIndex = historyIndex + 1;
        if (nextIndex < history.length) {
          setHistoryIndex(nextIndex);
          setInput(history[nextIndex]);
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  return (
    <div className={cn(
      "w-full max-w-4xl h-[75vh] terminal-box rounded-lg p-1 flex flex-col mx-auto my-4 transition-colors",
      "dark:bg-black/20 bg-green-50/50 border",
      "dark:border-green-500/20 border-green-800/20 shadow-xl"
    )}>
      <div className="scanline" />
      
      {/* Header Bar */}
      <div className={cn(
        "flex items-center justify-between px-4 py-2 border-b transition-colors",
        "dark:border-green-500/20 dark:bg-black/40 border-green-800/10 bg-green-100/30"
      )}>
        <div className="flex items-center gap-2">
          <TerminalIcon size={16} className="dark:text-green-500 text-green-800 animate-pulse" />
          <span className="text-[10px] font-bold tracking-widest dark:text-green-500/80 text-green-800/80">VAULT_AI_v1.0.4</span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-900/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-900/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-900/50" />
        </div>
      </div>

      {/* Logs View */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-sm low-opacity-text scroll-smooth"
      >
        <AnimatePresence mode="popLayout">
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "break-words py-0.5",
                log.type === 'input' && "dark:text-white text-green-900 opacity-90",
                log.type === 'output' && "dark:text-green-400 text-green-700",
                log.type === 'system' && "dark:text-green-500/60 text-green-800/60 italic",
                log.type === 'success' && "text-green-500 font-bold",
                log.type === 'error' && "text-red-600 bg-red-500/10 px-1 rounded"
              )}
            >
              {typeof log.content === 'string' ? (
                <span className={cn(log.type === 'system' && "before:content-['['] after:content-[']']")}>
                  {log.content}
                </span>
              ) : (
                log.content
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input Field */}
      <form 
        onSubmit={handleCommand} 
        className={cn(
          "p-4 border-t transition-colors flex items-center gap-2",
          "dark:border-green-500/20 dark:bg-black/60 border-green-800/10 bg-green-50/80"
        )}
      >
        <span className="dark:text-green-400 text-green-800 font-bold glow-text leading-none mt-0.5">λ</span>
        <input
          type="text"
          className="terminal-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isInitializing ? "SYSTEM INITIALIZING..." : "AWAITING COMMAND..."}
          autoFocus
          disabled={isInitializing}
          spellCheck={false}
          autoComplete="off"
        />
      </form>
    </div>
  );
}
