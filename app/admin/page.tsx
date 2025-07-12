"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Award,
  Users,
  Calendar,
  Download,
  TrendingUp,
  Shield,
  Clock,
  BarChart3,
  Globe,
  Plus,
  Upload,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Zap,
  Database,
  Settings,
  Bell,
  Activity,
  CheckCircle,
  AlertTriangle,
  Wallet,
  FileText,
  Hash,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { StatsCard } from "@/components/admin/stats-card";
import { RecentActivity } from "@/components/admin/recent-activity";
import { QuickActions } from "@/components/admin/quick-actions";
import { motion, AnimatePresence } from "framer-motion";
import { useWeb3 } from "@/lib/blockchain/Web3Provider";
import WalletConnection from "@/components/blockchain/WalletConnection";
import { toast } from "sonner";

interface DashboardStats {
  totalCertificates: number;
  blockchainCertificates: number;
  totalEvents: number;
  blockchainEvents: number;
  totalParticipants: number;
  recentVerifications: number;
  monthlyGrowth: number;
  systemUptime: number;
  pendingTransactions: number;
  gasUsed: string;
}

interface BlockchainStats {
  networkStatus: "connected" | "disconnected" | "syncing";
  lastBlockNumber: number;
  contractBalance: string;
  totalGasUsed: string;
  averageGasPrice: string;
  transactionCount: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCertificates: 0,
    blockchainCertificates: 0,
    totalEvents: 0,
    blockchainEvents: 0,
    totalParticipants: 0,
    recentVerifications: 0,
    monthlyGrowth: 0,
    systemUptime: 99.9,
    pendingTransactions: 0,
    gasUsed: "0",
  });

  const [blockchainStats, setBlockchainStats] = useState<BlockchainStats>({
    networkStatus: "disconnected",
    lastBlockNumber: 0,
    contractBalance: "0",
    totalGasUsed: "0",
    averageGasPrice: "0",
    transactionCount: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const {
    isConnected,
    chainId,
    account,
    contractAddress,
    isAuthorizedIssuer,
    getContractStats,
    provider,
    formatAddress,
  } = useWeb3();

  useEffect(() => {
    fetchDashboardStats();
    if (isConnected) {
      fetchBlockchainStats();
    }
  }, [isConnected]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/admin/dashboard");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBlockchainStats = async () => {
    if (!isConnected || !provider) return;

    try {
      const contractStats = await getContractStats();
      const network = await provider.getNetwork();
      const blockNumber = await provider.getBlockNumber();

      setBlockchainStats({
        networkStatus: "connected",
        lastBlockNumber: blockNumber,
        contractBalance: "0", // Would need contract method to get balance
        totalGasUsed: "0",
        averageGasPrice: "20",
        transactionCount: contractStats.totalCertificates,
      });

      // Update dashboard stats with blockchain data
      setStats((prev) => ({
        ...prev,
        blockchainCertificates: contractStats.totalCertificates,
        blockchainEvents: contractStats.totalEvents,
      }));
    } catch (error) {
      console.error("Failed to fetch blockchain stats:", error);
      setBlockchainStats((prev) => ({
        ...prev,
        networkStatus: "disconnected",
      }));
    }
  };

  const refreshStats = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchDashboardStats(),
      isConnected ? fetchBlockchainStats() : Promise.resolve(),
    ]);
    setIsLoading(false);
    toast.success("Stats refreshed successfully!");
  };

  const statsCards = [
    {
      title: "Total Certificates",
      value: stats.totalCertificates.toLocaleString(),
      description: `${stats.blockchainCertificates} on blockchain`,
      icon: Award,
      trend: "+12% from last month",
      color: "text-blue-600",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Active Events",
      value: stats.totalEvents.toString(),
      description: `${stats.blockchainEvents} on blockchain`,
      icon: Calendar,
      trend: "+3 new this month",
      color: "text-green-600",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      title: "Total Participants",
      value: stats.totalParticipants.toLocaleString(),
      description: "Unique participants",
      icon: Users,
      trend: `+${stats.monthlyGrowth}% growth`,
      color: "text-purple-600",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "Recent Verifications",
      value: stats.recentVerifications.toString(),
      description: "Last 24 hours",
      icon: Shield,
      trend: "All successful",
      color: "text-emerald-600",
      gradient: "from-emerald-500 to-teal-500",
    },
  ];

  const blockchainCards = [
    {
      title: "Network Status",
      value: blockchainStats.networkStatus,
      icon: Globe,
      color:
        blockchainStats.networkStatus === "connected"
          ? "text-green-600"
          : "text-red-600",
    },
    {
      title: "Latest Block",
      value: blockchainStats.lastBlockNumber.toLocaleString(),
      icon: Database,
      color: "text-blue-600",
    },
    {
      title: "Gas Used",
      value: `${blockchainStats.totalGasUsed} Gwei`,
      icon: Zap,
      color: "text-yellow-600",
    },
    {
      title: "Transactions",
      value: blockchainStats.transactionCount.toString(),
      icon: Hash,
      color: "text-purple-600",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Welcome back! Here's your blockchain-powered certificate system
              overview.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={refreshStats}
              variant="outline"
              disabled={isLoading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Badge
              variant="outline"
              className={`${blockchainStats.networkStatus === "connected" ? "text-green-600 border-green-200" : "text-red-600 border-red-200"}`}
            >
              <div
                className={`w-2 h-2 rounded-full mr-2 ${blockchainStats.networkStatus === "connected" ? "bg-green-500" : "bg-red-500"}`}
              ></div>
              {blockchainStats.networkStatus === "connected"
                ? "Blockchain Connected"
                : "Blockchain Offline"}
            </Badge>
            <Badge variant="secondary">{stats.systemUptime}% Uptime</Badge>
          </div>
        </div>

        {/* Wallet Connection Alert */}
        {!isConnected && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <Wallet className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <div className="flex items-center justify-between">
                <span>
                  Connect your wallet to access blockchain features and issue
                  certificates.
                </span>
                <WalletConnection compact={true} />
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Authorization Alert */}
        {isConnected && !isAuthorizedIssuer && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              Your wallet is connected but not authorized to issue certificates.
              Contact the contract owner for authorization.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-8"
        >
          <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-xl">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-white data-[state=active]:shadow-md"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="blockchain"
              className="data-[state=active]:bg-white data-[state=active]:shadow-md"
            >
              <Globe className="w-4 h-4 mr-2" />
              Blockchain
            </TabsTrigger>
            <TabsTrigger
              value="certificates"
              className="data-[state=active]:bg-white data-[state=active]:shadow-md"
            >
              <Award className="w-4 h-4 mr-2" />
              Certificates
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-white data-[state=active]:shadow-md"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsCards.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg`}
                        >
                          <stat.icon className="w-6 h-6 text-white" />
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {stat.trend}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-600">
                          {stat.title}
                        </h3>
                        <p className="text-3xl font-bold text-gray-900">
                          {stat.value}
                        </p>
                        <p className="text-sm text-gray-500">
                          {stat.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <Card className="shadow-xl border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      <span>Quick Actions</span>
                    </CardTitle>
                    <CardDescription>
                      Common administrative tasks
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full justify-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Event
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Participants
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Award className="w-4 h-4 mr-2" />
                      Generate Certificates
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2">
                <Card className="shadow-xl border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="w-5 h-5 text-green-500" />
                      <span>Recent Activity</span>
                    </CardTitle>
                    <CardDescription>
                      Latest system activities and transactions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((item) => (
                        <div
                          key={item}
                          className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              Certificate issued
                            </p>
                            <p className="text-sm text-gray-500">
                              John Doe - Workshop on AI
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            2m ago
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Blockchain Tab */}
          <TabsContent value="blockchain" className="space-y-8">
            {/* Blockchain Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {blockchainCards.map((card, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="border-0 shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                          <card.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-600">
                            {card.title}
                          </h3>
                          <p className={`text-2xl font-bold ${card.color}`}>
                            {card.value}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Blockchain Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="shadow-xl border-0">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Wallet className="w-5 h-5 text-purple-600" />
                    <span>Wallet Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isConnected ? (
                    <>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                        <span className="text-sm font-medium text-green-800">
                          Connected Account
                        </span>
                        <code className="text-sm bg-white px-2 py-1 rounded border">
                          {formatAddress(account!)}
                        </code>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <span className="text-sm font-medium text-blue-800">
                          Network
                        </span>
                        <Badge variant="outline">Chain ID: {chainId}</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <span className="text-sm font-medium text-purple-800">
                          Authorization
                        </span>
                        <Badge
                          className={
                            isAuthorizedIssuer
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {isAuthorizedIssuer ? "Authorized" : "Not Authorized"}
                        </Badge>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">No wallet connected</p>
                      <WalletConnection />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-gray-600" />
                    <span>Contract Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      Contract Address
                    </span>
                    <code className="text-sm bg-white px-2 py-1 rounded border">
                      {contractAddress
                        ? formatAddress(contractAddress)
                        : "Not deployed"}
                    </code>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      Version
                    </span>
                    <Badge variant="outline">v1.0.0</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      Status
                    </span>
                    <Badge className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on Etherscan
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="certificates" className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Certificate Management
              </h2>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  New Certificate
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="shadow-xl border-0">
                <CardHeader>
                  <CardTitle>Pending Certificates</CardTitle>
                  <CardDescription>
                    Certificates awaiting blockchain confirmation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No pending certificates</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0">
                <CardHeader>
                  <CardTitle>Recent Certificates</CardTitle>
                  <CardDescription>
                    Recently issued certificates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <Award className="w-4 h-4 text-blue-600" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            Certificate #{item}23
                          </p>
                          <p className="text-xs text-gray-500">
                            Issued to John Doe
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Confirmed
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0">
                <CardHeader>
                  <CardTitle>Bulk Operations</CardTitle>
                  <CardDescription>
                    Batch certificate management
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload CSV
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Award className="w-4 h-4 mr-2" />
                    Batch Generate
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Export All
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="shadow-xl border-0">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <span>Performance Metrics</span>
                  </CardTitle>
                  <CardDescription>
                    System performance over the last 30 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Average Response Time
                      </span>
                      <Badge variant="secondary">1.2s</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Certificate Generation
                      </span>
                      <Badge variant="secondary">0.8s avg</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Blockchain Confirmation
                      </span>
                      <Badge variant="secondary">15s avg</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Error Rate</span>
                      <Badge
                        variant="outline"
                        className="text-green-600 border-green-200"
                      >
                        0.01%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span>Growth Analytics</span>
                  </CardTitle>
                  <CardDescription>Certificate issuance trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">This Month</span>
                      <div className="text-right">
                        <div className="font-semibold">
                          +{stats.monthlyGrowth}%
                        </div>
                        <div className="text-xs text-green-600">↗ Growing</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Peak Day</span>
                      <div className="text-right">
                        <div className="font-semibold">247 certificates</div>
                        <div className="text-xs text-gray-500">
                          Last Tuesday
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Blockchain Adoption
                      </span>
                      <div className="text-right">
                        <div className="font-semibold">85%</div>
                        <div className="text-xs text-blue-600">
                          ↗ Increasing
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Most Active Event
                      </span>
                      <div className="text-right">
                        <div className="font-semibold">Tech Workshop</div>
                        <div className="text-xs text-gray-500">
                          156 participants
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
