'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ethers, BrowserProvider, Contract } from 'ethers';
import { toast } from 'sonner';

// Contract ABI (simplified for main functions)
const CERTIFICATE_MANAGER_ABI = [
  "function createEvent(string memory _name, string memory _description, string memory _organizerName, uint256 _eventDate, uint256 _maxParticipants) external returns (uint256)",
  "function issueCertificate(string memory _participantName, string memory _participantEmail, uint256 _eventId, string memory _ipfsHash) external returns (uint256)",
  "function batchIssueCertificates(string[] memory _participants, uint256 _eventId, string[] memory _ipfsHashes) external",
  "function verifyCertificate(uint256 _certificateId) external view returns (bool isValid, tuple(uint256 id, string participantName, string participantEmail, string eventName, string eventDescription, string organizerName, uint256 eventDate, uint256 issueDate, string ipfsHash, bytes32 dataHash, bool isRevoked, address issuer) certificate)",
  "function verifyCertificateByHash(bytes32 _dataHash) external view returns (bool isValid, tuple(uint256 id, string participantName, string participantEmail, string eventName, string eventDescription, string organizerName, uint256 eventDate, uint256 issueDate, string ipfsHash, bytes32 dataHash, bool isRevoked, address issuer) certificate)",
  "function revokeCertificate(uint256 _certificateId) external",
  "function getParticipantCertificates(string memory _participantEmail) external view returns (uint256[] memory)",
  "function getEventCertificates(uint256 _eventId) external view returns (uint256[] memory)",
  "function getTotalCertificates() external view returns (uint256)",
  "function getTotalEvents() external view returns (uint256)",
  "function authorizeIssuer(address _issuer) external",
  "function revokeIssuer(address _issuer) external",
  "function authorizedIssuers(address) external view returns (bool)",
  "function certificates(uint256) external view returns (uint256 id, string participantName, string participantEmail, string eventName, string eventDescription, string organizerName, uint256 eventDate, uint256 issueDate, string ipfsHash, bytes32 dataHash, bool isRevoked, address issuer)",
  "function events(uint256) external view returns (uint256 id, string name, string description, string organizerName, uint256 eventDate, uint256 maxParticipants, uint256 participantCount, bool isActive, address organizer)"
];

// Chain configurations
const SUPPORTED_CHAINS = {
  1: {
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/',
    blockExplorer: 'https://etherscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }
  },
  11155111: {
    name: 'Sepolia Testnet',
    rpcUrl: 'https://rpc.sepolia.org',
    blockExplorer: 'https://sepolia.etherscan.io',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'SEP', decimals: 18 }
  },
  137: {
    name: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
    nativeCurrency: { name: 'Polygon', symbol: 'MATIC', decimals: 18 }
  },
  80001: {
    name: 'Mumbai Testnet',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    blockExplorer: 'https://mumbai.polygonscan.com',
    nativeCurrency: { name: 'Mumbai Matic', symbol: 'MATIC', decimals: 18 }
  },
  1337: {
    name: 'Localhost',
    rpcUrl: 'http://127.0.0.1:8545',
    blockExplorer: 'http://localhost',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }
  }
};

interface Web3ContextType {
  // Connection state
  isConnected: boolean;
  isLoading: boolean;
  account: string | null;
  chainId: number | null;
  provider: BrowserProvider | null;
  signer: ethers.Signer | null;
  contract: Contract | null;

  // Contract state
  contractAddress: string | null;
  isAuthorizedIssuer: boolean;

  // Connection methods
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchChain: (chainId: number) => Promise<void>;

  // Contract methods
  createEvent: (eventData: EventData) => Promise<string>;
  issueCertificate: (certificateData: CertificateData) => Promise<string>;
  batchIssueCertificates: (participants: ParticipantData[], eventId: string, ipfsHashes: string[]) => Promise<void>;
  verifyCertificate: (certificateId: string) => Promise<VerificationResult>;
  verifyCertificateByHash: (dataHash: string) => Promise<VerificationResult>;
  revokeCertificate: (certificateId: string) => Promise<void>;
  getParticipantCertificates: (email: string) => Promise<string[]>;
  getContractStats: () => Promise<ContractStats>;

  // Utility methods
  getExplorerUrl: (txHash: string) => string;
  formatAddress: (address: string) => string;
}

interface EventData {
  name: string;
  description: string;
  organizerName: string;
  eventDate: number;
  maxParticipants: number;
}

interface CertificateData {
  participantName: string;
  participantEmail: string;
  eventId: string;
  ipfsHash: string;
}

interface ParticipantData {
  name: string;
  email: string;
}

interface VerificationResult {
  isValid: boolean;
  certificate?: any;
  error?: string;
}

interface ContractStats {
  totalCertificates: number;
  totalEvents: number;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [isAuthorizedIssuer, setIsAuthorizedIssuer] = useState(false);

  // Initialize contract address from environment or deployment
  useEffect(() => {
    const loadContractAddress = () => {
      // Try to load from environment variable first
      const envAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      if (envAddress) {
        setContractAddress(envAddress);
        return;
      }

      // Try to load from deployment files
      try {
        const deploymentData = require('../../deployments/sepolia.json');
        if (deploymentData.contractAddress) {
          setContractAddress(deploymentData.contractAddress);
        }
      } catch (error) {
        console.warn('No deployment file found, using default address');
        // Default to a placeholder address for development
        setContractAddress('0x0000000000000000000000000000000000000000');
      }
    };

    loadContractAddress();
  }, []);

  // Check if wallet is already connected
  useEffect(() => {
    checkConnection();
  }, []);

  // Update contract when provider or address changes
  useEffect(() => {
    if (provider && contractAddress && contractAddress !== '0x0000000000000000000000000000000000000000') {
      initializeContract();
    }
  }, [provider, contractAddress]);

  // Check authorization status when account changes
  useEffect(() => {
    if (contract && account) {
      checkAuthorizationStatus();
    }
  }, [contract, account]);

  const checkConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();

        if (accounts.length > 0) {
          const network = await provider.getNetwork();
          setProvider(provider);
          setAccount(accounts[0].address);
          setChainId(Number(network.chainId));
          setIsConnected(true);

          const signer = await provider.getSigner();
          setSigner(signer);
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    }
  };

  const initializeContract = async () => {
    if (!provider || !contractAddress) return;

    try {
      const signer = await provider.getSigner();
      const contractInstance = new Contract(contractAddress, CERTIFICATE_MANAGER_ABI, signer);
      setContract(contractInstance);
    } catch (error) {
      console.error('Error initializing contract:', error);
      toast.error('Failed to initialize smart contract');
    }
  };

  const checkAuthorizationStatus = async () => {
    if (!contract || !account) return;

    try {
      const isAuthorized = await contract.authorizedIssuers(account);
      setIsAuthorizedIssuer(isAuthorized);
    } catch (error) {
      console.error('Error checking authorization:', error);
      setIsAuthorizedIssuer(false);
    }
  };

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      toast.error('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    setIsLoading(true);
    try {
      const provider = new BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);

      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();

      setProvider(provider);
      setSigner(signer);
      setAccount(address);
      setChainId(Number(network.chainId));
      setIsConnected(true);

      toast.success('Wallet connected successfully!');
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast.error(`Failed to connect wallet: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
    setIsConnected(false);
    setContract(null);
    setIsAuthorizedIssuer(false);
    toast.success('Wallet disconnected');
  };

  const switchChain = async (targetChainId: number) => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (error: any) {
      // Chain not added to MetaMask
      if (error.code === 4902) {
        const chain = SUPPORTED_CHAINS[targetChainId as keyof typeof SUPPORTED_CHAINS];
        if (chain) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: `0x${targetChainId.toString(16)}`,
                chainName: chain.name,
                rpcUrls: [chain.rpcUrl],
                blockExplorerUrls: [chain.blockExplorer],
                nativeCurrency: chain.nativeCurrency,
              }],
            });
          } catch (addError) {
            toast.error('Failed to add network to MetaMask');
          }
        }
      } else {
        toast.error('Failed to switch network');
      }
    }
  };

  const createEvent = async (eventData: EventData): Promise<string> => {
    if (!contract || !isAuthorizedIssuer) {
      throw new Error('Not authorized to create events');
    }

    try {
      const tx = await contract.createEvent(
        eventData.name,
        eventData.description,
        eventData.organizerName,
        eventData.eventDate,
        eventData.maxParticipants
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find((log: any) => log.fragment?.name === 'EventCreated');
      const eventId = event?.args[0]?.toString();

      toast.success('Event created successfully on blockchain!');
      return eventId;
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast.error(`Failed to create event: ${error.message}`);
      throw error;
    }
  };

  const issueCertificate = async (certificateData: CertificateData): Promise<string> => {
    if (!contract || !isAuthorizedIssuer) {
      throw new Error('Not authorized to issue certificates');
    }

    try {
      const tx = await contract.issueCertificate(
        certificateData.participantName,
        certificateData.participantEmail,
        certificateData.eventId,
        certificateData.ipfsHash
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find((log: any) => log.fragment?.name === 'CertificateIssued');
      const certificateId = event?.args[0]?.toString();

      toast.success('Certificate issued successfully on blockchain!');
      return certificateId;
    } catch (error: any) {
      console.error('Error issuing certificate:', error);
      toast.error(`Failed to issue certificate: ${error.message}`);
      throw error;
    }
  };

  const batchIssueCertificates = async (
    participants: ParticipantData[],
    eventId: string,
    ipfsHashes: string[]
  ): Promise<void> => {
    if (!contract || !isAuthorizedIssuer) {
      throw new Error('Not authorized to issue certificates');
    }

    try {
      const participantData: string[] = [];
      participants.forEach(p => {
        participantData.push(p.name, p.email);
      });

      const tx = await contract.batchIssueCertificates(participantData, eventId, ipfsHashes);
      await tx.wait();

      toast.success(`${participants.length} certificates issued successfully!`);
    } catch (error: any) {
      console.error('Error batch issuing certificates:', error);
      toast.error(`Failed to batch issue certificates: ${error.message}`);
      throw error;
    }
  };

  const verifyCertificate = async (certificateId: string): Promise<VerificationResult> => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const [isValid, certificate] = await contract.verifyCertificate(certificateId);
      return { isValid, certificate };
    } catch (error: any) {
      console.error('Error verifying certificate:', error);
      return { isValid: false, error: error.message };
    }
  };

  const verifyCertificateByHash = async (dataHash: string): Promise<VerificationResult> => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const [isValid, certificate] = await contract.verifyCertificateByHash(dataHash);
      return { isValid, certificate };
    } catch (error: any) {
      console.error('Error verifying certificate by hash:', error);
      return { isValid: false, error: error.message };
    }
  };

  const revokeCertificate = async (certificateId: string): Promise<void> => {
    if (!contract || !isAuthorizedIssuer) {
      throw new Error('Not authorized to revoke certificates');
    }

    try {
      const tx = await contract.revokeCertificate(certificateId);
      await tx.wait();
      toast.success('Certificate revoked successfully!');
    } catch (error: any) {
      console.error('Error revoking certificate:', error);
      toast.error(`Failed to revoke certificate: ${error.message}`);
      throw error;
    }
  };

  const getParticipantCertificates = async (email: string): Promise<string[]> => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const certificateIds = await contract.getParticipantCertificates(email);
      return certificateIds.map((id: any) => id.toString());
    } catch (error: any) {
      console.error('Error getting participant certificates:', error);
      throw error;
    }
  };

  const getContractStats = async (): Promise<ContractStats> => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const [totalCertificates, totalEvents] = await Promise.all([
        contract.getTotalCertificates(),
        contract.getTotalEvents()
      ]);

      return {
        totalCertificates: Number(totalCertificates),
        totalEvents: Number(totalEvents)
      };
    } catch (error: any) {
      console.error('Error getting contract stats:', error);
      throw error;
    }
  };

  const getExplorerUrl = (txHash: string): string => {
    if (!chainId) return '';
    const chain = SUPPORTED_CHAINS[chainId as keyof typeof SUPPORTED_CHAINS];
    return chain ? `${chain.blockExplorer}/tx/${txHash}` : '';
  };

  const formatAddress = (address: string): string => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const value: Web3ContextType = {
    // Connection state
    isConnected,
    isLoading,
    account,
    chainId,
    provider,
    signer,
    contract,
    contractAddress,
    isAuthorizedIssuer,

    // Connection methods
    connectWallet,
    disconnectWallet,
    switchChain,

    // Contract methods
    createEvent,
    issueCertificate,
    batchIssueCertificates,
    verifyCertificate,
    verifyCertificateByHash,
    revokeCertificate,
    getParticipantCertificates,
    getContractStats,

    // Utility methods
    getExplorerUrl,
    formatAddress,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}

// Listen to account and chain changes
if (typeof window !== 'undefined' && window.ethereum) {
  window.ethereum.on('accountsChanged', (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected wallet
      window.location.reload();
    } else {
      // User switched account
      window.location.reload();
    }
  });

  window.ethereum.on('chainChanged', (chainId: string) => {
    // Reload the page when chain changes
    window.location.reload();
  });
}

declare global {
  interface Window {
    ethereum?: any;
  }
}
