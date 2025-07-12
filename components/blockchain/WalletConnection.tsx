'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Wallet,
  ExternalLink,
  Copy,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  Zap,
  Shield,
  Globe
} from 'lucide-react';
import { useWeb3 } from '@/lib/blockchain/Web3Provider';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const SUPPORTED_CHAINS = {
  1: { name: 'Ethereum Mainnet', icon: '🔷', color: 'bg-blue-500' },
  11155111: { name: 'Sepolia Testnet', icon: '🔷', color: 'bg-purple-500' },
  137: { name: 'Polygon', icon: '🟣', color: 'bg-purple-600' },
  80001: { name: 'Mumbai', icon: '🟣', color: 'bg-purple-400' },
  1337: { name: 'Localhost', icon: '⚡', color: 'bg-yellow-500' }
};

interface WalletConnectionProps {
  showNetworkSelector?: boolean;
  showBalance?: boolean;
  compact?: boolean;
}

export default function WalletConnection({
  showNetworkSelector = true,
  showBalance = false,
  compact = false
}: WalletConnectionProps) {
  const {
    isConnected,
    isLoading,
    account,
    chainId,
    provider,
    contractAddress,
    isAuthorizedIssuer,
    connectWallet,
    disconnectWallet,
    switchChain,
    formatAddress
  } = useWeb3();

  const [balance, setBalance] = useState<string>('0');
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  useEffect(() => {
    if (isConnected && provider && account && showBalance) {
      fetchBalance();
    }
  }, [isConnected, provider, account, showBalance]);

  const fetchBalance = async () => {
    if (!provider || !account) return;

    setIsLoadingBalance(true);
    try {
      const balanceWei = await provider.getBalance(account);
      const balanceEth = parseFloat(balanceWei.toString()) / 1e18;
      setBalance(balanceEth.toFixed(4));
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const copyAddress = async () => {
    if (account) {
      await navigator.clipboard.writeText(account);
      toast.success('Address copied to clipboard!');
    }
  };

  const getCurrentChain = () => {
    if (!chainId) return null;
    return SUPPORTED_CHAINS[chainId as keyof typeof SUPPORTED_CHAINS];
  };

  const handleNetworkSwitch = async (targetChainId: number) => {
    try {
      await switchChain(targetChainId);
      setShowNetworkDropdown(false);
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };

  // Compact view for header
  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        {!isConnected ? (
          <Button
            onClick={connectWallet}
            disabled={isLoading}
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Wallet className="w-4 h-4 mr-2" />
            {isLoading ? 'Connecting...' : 'Connect Wallet'}
          </Button>
        ) : (
          <div className="flex items-center space-x-2">
            {showNetworkSelector && getCurrentChain() && (
              <Badge variant="outline" className="text-xs">
                <span className="mr-1">{getCurrentChain()?.icon}</span>
                {getCurrentChain()?.name}
              </Badge>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={copyAddress}
              className="text-xs"
            >
              <Wallet className="w-3 h-3 mr-1" />
              {formatAddress(account!)}
            </Button>

            {isAuthorizedIssuer && (
              <Badge className="bg-green-100 text-green-800 text-xs">
                <Shield className="w-3 h-3 mr-1" />
                Authorized
              </Badge>
            )}
          </div>
        )}
      </div>
    );
  }

  // Full wallet connection card
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-md mx-auto border-2 border-gradient-to-r from-blue-200 to-purple-200 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <Wallet className="w-6 h-6 text-blue-600" />
            <span>Wallet Connection</span>
          </CardTitle>
          <CardDescription>
            Connect your Web3 wallet to interact with the blockchain
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {!isConnected ? (
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                onClick={connectWallet}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                <Wallet className="w-5 h-5 mr-2" />
                {isLoading ? (
                  <div className="flex items-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                    />
                    Connecting...
                  </div>
                ) : (
                  'Connect MetaMask'
                )}
              </Button>

              <div className="mt-4 text-center text-sm text-gray-600">
                <p>Don't have MetaMask?</p>
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-semibold flex items-center justify-center mt-1"
                >
                  Download here <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="space-y-4"
            >
              {/* Account Info */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Connected Account</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <code className="text-sm bg-white px-2 py-1 rounded border font-mono">
                    {formatAddress(account!)}
                  </code>
                  <Button variant="ghost" size="sm" onClick={copyAddress}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Network Info */}
              {showNetworkSelector && (
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Network</span>
                    <Globe className="w-4 h-4 text-blue-500" />
                  </div>

                  <div className="relative">
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() => setShowNetworkDropdown(!showNetworkDropdown)}
                    >
                      <div className="flex items-center">
                        {getCurrentChain() ? (
                          <>
                            <span className="mr-2">{getCurrentChain()?.icon}</span>
                            <span>{getCurrentChain()?.name}</span>
                          </>
                        ) : (
                          <span>Unknown Network</span>
                        )}
                      </div>
                      <ChevronDown className="w-4 h-4" />
                    </Button>

                    <AnimatePresence>
                      {showNetworkDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50"
                        >
                          {Object.entries(SUPPORTED_CHAINS).map(([id, chain]) => (
                            <button
                              key={id}
                              onClick={() => handleNetworkSwitch(Number(id))}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center first:rounded-t-lg last:rounded-b-lg"
                            >
                              <span className="mr-2">{chain.icon}</span>
                              <span>{chain.name}</span>
                              {Number(id) === chainId && (
                                <CheckCircle className="w-4 h-4 ml-auto text-green-500" />
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Balance */}
              {showBalance && (
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Balance</span>
                    <Zap className="w-4 h-4 text-yellow-500" />
                  </div>
                  <div className="text-lg font-bold">
                    {isLoadingBalance ? (
                      <div className="animate-pulse bg-gray-200 h-6 w-20 rounded" />
                    ) : (
                      `${balance} ETH`
                    )}
                  </div>
                </div>
              )}

              {/* Authorization Status */}
              <Alert className={isAuthorizedIssuer ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
                <div className="flex items-center">
                  {isAuthorizedIssuer ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                  )}
                  <AlertDescription className="ml-2">
                    {isAuthorizedIssuer
                      ? "You are authorized to issue certificates"
                      : "You are not authorized to issue certificates"
                    }
                  </AlertDescription>
                </div>
              </Alert>

              {/* Contract Info */}
              {contractAddress && contractAddress !== '0x0000000000000000000000000000000000000000' && (
                <div className="text-xs text-gray-500 border-t pt-3">
                  <div className="flex items-center justify-between">
                    <span>Contract:</span>
                    <code className="bg-gray-100 px-1 rounded">
                      {formatAddress(contractAddress)}
                    </code>
                  </div>
                </div>
              )}

              {/* Disconnect Button */}
              <Button
                variant="outline"
                onClick={disconnectWallet}
                className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              >
                Disconnect Wallet
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
