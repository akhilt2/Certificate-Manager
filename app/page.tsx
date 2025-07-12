"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Shield,
  Award,
  Users,
  QrCode,
  Download,
  Zap,
  ArrowRight,
  CheckCircle,
  Star,
  Globe,
  Lock,
  Sparkles,
  TrendingUp,
  Database,
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import WalletConnection from "@/components/blockchain/WalletConnection";
import { useWeb3 } from "@/lib/blockchain/Web3Provider";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const { isConnected, getContractStats } = useWeb3();
  const [stats, setStats] = useState({
    certificates: "2,500+",
    events: "150+",
    verifications: "99.9%",
    blockchainCerts: "0",
  });

  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const statsRef = useRef(null);
  const ctaRef = useRef(null);

  const isHeroInView = useInView(heroRef, { once: true });
  const isFeaturesInView = useInView(featuresRef, { once: true });
  const isStatsInView = useInView(statsRef, { once: true });
  const isCtaInView = useInView(ctaRef, { once: true });

  useEffect(() => {
    setMounted(true);
    if (isConnected) {
      fetchBlockchainStats();
    }
  }, [isConnected]);

  const fetchBlockchainStats = async () => {
    try {
      const contractStats = await getContractStats();
      setStats((prev) => ({
        ...prev,
        blockchainCerts: contractStats.totalCertificates.toString(),
      }));
    } catch (error) {
      console.error("Failed to fetch blockchain stats:", error);
    }
  };

  const features = [
    {
      icon: Shield,
      title: "Blockchain Security",
      description:
        "Certificates stored immutably on Ethereum blockchain with cryptographic verification",
      color: "from-blue-500 to-cyan-500",
      delay: 0.1,
    },
    {
      icon: Award,
      title: "Smart Contracts",
      description:
        "Automated certificate issuance through secure smart contracts with role-based access",
      color: "from-purple-500 to-pink-500",
      delay: 0.2,
    },
    {
      icon: Users,
      title: "Decentralized Verification",
      description:
        "Anyone can verify certificates directly on the blockchain without centralized authority",
      color: "from-green-500 to-emerald-500",
      delay: 0.3,
    },
    {
      icon: QrCode,
      title: "QR Integration",
      description:
        "Instant verification through QR codes linked to blockchain records",
      color: "from-orange-500 to-red-500",
      delay: 0.4,
    },
    {
      icon: Database,
      title: "IPFS Storage",
      description:
        "Certificate files stored on IPFS for decentralized and permanent accessibility",
      color: "from-indigo-500 to-purple-500",
      delay: 0.5,
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description:
        "Sub-second verification with optimized smart contract interactions",
      color: "from-yellow-500 to-orange-500",
      delay: 0.6,
    },
  ];

  const blockchainFeatures = [
    { icon: Lock, text: "Tamper-proof records" },
    { icon: Globe, text: "Global accessibility" },
    { icon: CheckCircle, text: "Instant verification" },
    { icon: TrendingUp, text: "Future-ready technology" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Enhanced Header */}
      <header className="border-b bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Award className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  IEEE SB NITC
                </h1>
                <p className="text-sm text-gray-600">Blockchain Certificates</p>
              </div>
            </motion.div>

            <div className="flex items-center space-x-4">
              <WalletConnection compact={true} />
              <Link href="/verify">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-200 hover:bg-blue-50"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Verify Certificate
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Admin Portal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        className="py-24 px-4 relative overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate={isHeroInView ? "visible" : "hidden"}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto text-center relative z-10">
          <motion.div variants={itemVariants}>
            <Badge
              variant="secondary"
              className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Powered by Ethereum Blockchain
            </Badge>
          </motion.div>

          <motion.h1
            className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight"
            variants={itemVariants}
          >
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              Next-Gen Digital
            </span>
            <br />
            <span className="text-gray-900">Certificate System</span>
          </motion.h1>

          <motion.p
            className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            Revolutionary blockchain-powered certificate management for IEEE
            Student Branch NIT Calicut. Secure, transparent, and verifiable
            digital credentials with smart contract automation.
          </motion.p>

          {/* Enhanced Quick Verification */}
          <motion.div
            className="max-w-lg mx-auto mb-12"
            variants={itemVariants}
          >
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Verification
              </h3>
              <div className="flex space-x-3">
                <Input
                  placeholder="Certificate ID, name, or blockchain hash..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <Link
                  href={`/verify${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ""}`}
                >
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6">
                    <Search className="w-4 h-4 mr-2" />
                    Verify
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Blockchain Features */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            {blockchainFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className="flex flex-col items-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <feature.icon className="w-6 h-6 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">
                  {feature.text}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Enhanced Stats Section */}
      <motion.section
        ref={statsRef}
        className="py-16 px-4 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600"
        variants={containerVariants}
        initial="hidden"
        animate={isStatsInView ? "visible" : "hidden"}
      >
        <div className="container mx-auto">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
            variants={itemVariants}
          >
            <div className="text-white">
              <motion.div
                className="text-4xl md:text-5xl font-bold mb-2"
                initial={{ scale: 0 }}
                animate={isStatsInView ? { scale: 1 } : { scale: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {stats.certificates}
              </motion.div>
              <div className="text-blue-100">Total Certificates</div>
            </div>
            <div className="text-white">
              <motion.div
                className="text-4xl md:text-5xl font-bold mb-2"
                initial={{ scale: 0 }}
                animate={isStatsInView ? { scale: 1 } : { scale: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                {stats.blockchainCerts}
              </motion.div>
              <div className="text-blue-100">On Blockchain</div>
            </div>
            <div className="text-white">
              <motion.div
                className="text-4xl md:text-5xl font-bold mb-2"
                initial={{ scale: 0 }}
                animate={isStatsInView ? { scale: 1 } : { scale: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {stats.events}
              </motion.div>
              <div className="text-blue-100">Events Managed</div>
            </div>
            <div className="text-white">
              <motion.div
                className="text-4xl md:text-5xl font-bold mb-2"
                initial={{ scale: 0 }}
                animate={isStatsInView ? { scale: 1 } : { scale: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                {stats.verifications}
              </motion.div>
              <div className="text-blue-100">Verification Rate</div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Enhanced Features Section */}
      <motion.section
        ref={featuresRef}
        className="py-24 px-4 bg-white"
        variants={containerVariants}
        initial="hidden"
        animate={isFeaturesInView ? "visible" : "hidden"}
      >
        <div className="container mx-auto">
          <motion.div className="text-center mb-16" variants={itemVariants}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Blockchain-Powered Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of digital certification with cutting-edge
              blockchain technology, smart contracts, and decentralized
              verification systems.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 h-full bg-gradient-to-br from-white to-gray-50 overflow-hidden">
                  <CardHeader className="pb-4">
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-gray-600 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Enhanced CTA Section */}
      <motion.section
        ref={ctaRef}
        className="py-24 px-4 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate={isCtaInView ? "visible" : "hidden"}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
          <div className="absolute top-20 right-20 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto text-center relative z-10">
          <motion.div variants={itemVariants}>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready for the Future?
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
              Join the blockchain revolution in certificate management. Secure,
              transparent, and globally verifiable digital credentials await.
            </p>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center"
            variants={itemVariants}
          >
            <Link href="/verify">
              <Button
                size="lg"
                className="bg-white text-gray-900 hover:bg-gray-100 shadow-xl px-8 py-4 text-lg font-semibold"
              >
                <Shield className="w-5 h-5 mr-2" />
                Verify Certificate
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 text-lg font-semibold"
              >
                <Users className="w-5 h-5 mr-2" />
                Admin Access
              </Button>
            </Link>
          </motion.div>

          {/* Wallet Connection CTA */}
          {!isConnected && (
            <motion.div
              className="mt-12 p-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
              variants={itemVariants}
            >
              <h3 className="text-2xl font-bold text-white mb-4">
                Connect to Blockchain
              </h3>
              <p className="text-gray-300 mb-6">
                Connect your Web3 wallet to interact with smart contracts and
                manage certificates on the blockchain.
              </p>
              <WalletConnection />
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-xl">IEEE SB NITC</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Revolutionary blockchain-powered certificate management system
                for the digital age.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-lg">Quick Access</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <Link
                    href="/verify"
                    className="hover:text-white transition-colors flex items-center"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Verify Certificate
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="hover:text-white transition-colors flex items-center"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Admin Portal
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="hover:text-white transition-colors"
                  >
                    About IEEE
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-lg">Blockchain</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-center">
                  <Globe className="w-4 h-4 mr-2" />
                  Ethereum Network
                </li>
                <li className="flex items-center">
                  <Lock className="w-4 h-4 mr-2" />
                  Smart Contracts
                </li>
                <li className="flex items-center">
                  <Database className="w-4 h-4 mr-2" />
                  IPFS Storage
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-lg">Security</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  256-bit Encryption
                </li>
                <li className="flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Blockchain Verified
                </li>
                <li className="flex items-center">
                  <Star className="w-4 h-4 mr-2" />
                  99.9% Uptime
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              &copy; 2024 IEEE Student Branch NIT Calicut. Powered by Ethereum
              Blockchain. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
