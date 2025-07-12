"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search,
  QrCode,
  Key,
  CheckCircle,
  XCircle,
  Award,
  ArrowLeft,
  Calendar,
  User,
  Hash,
  Download,
  Shield,
  Globe,
  ExternalLink,
  Copy,
  Loader2,
  AlertTriangle,
  Info,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useWeb3 } from "@/lib/blockchain/Web3Provider";
import WalletConnection from "@/components/blockchain/WalletConnection";

interface CertificateResult {
  isValid: boolean;
  source: "blockchain" | "database" | "both";
  certificate?: {
    id: string;
    participantName: string;
    participantEmail: string;
    eventName: string;
    eventDate: string;
    organizerName: string;
    description: string;
    issueDate: string;
    certificateUrl?: string;
    blockchainTxHash?: string;
    ipfsHash?: string;
    contractAddress?: string;
    isRevoked?: boolean;
  };
  blockchainData?: any;
  error?: string;
}

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams?.get("q") || "");
  const [qrData, setQrData] = useState("");
  const [blockchainHash, setBlockchainHash] = useState("");
  const [certificateId, setCertificateId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CertificateResult | null>(null);
  const [activeTab, setActiveTab] = useState("search");

  const {
    isConnected,
    verifyCertificate,
    verifyCertificateByHash,
    getExplorerUrl,
    formatAddress,
  } = useWeb3();

  useEffect(() => {
    const query = searchParams?.get("q");
    if (query) {
      setSearchQuery(query);
      handleSearch(query);
    }
  }, [searchParams]);

  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery;
    if (!searchTerm.trim()) {
      toast.error("Please enter a search term");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      // First try blockchain verification if connected
      let blockchainResult = null;
      if (isConnected) {
        try {
          // Check if it's a certificate ID (numeric) or hash
          if (/^\d+$/.test(searchTerm.trim())) {
            blockchainResult = await verifyCertificate(searchTerm.trim());
          } else if (searchTerm.trim().startsWith("0x")) {
            blockchainResult = await verifyCertificateByHash(searchTerm.trim());
          }
        } catch (error) {
          console.log("Blockchain verification failed, trying database...");
        }
      }

      // Try traditional database verification
      const response = await fetch("/api/certificates/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "search",
          query: searchTerm.trim(),
        }),
      });

      const databaseResult = await response.json();

      // Combine results
      const combinedResult: CertificateResult = {
        isValid: blockchainResult?.isValid || databaseResult.isValid,
        source:
          blockchainResult?.isValid && databaseResult.isValid
            ? "both"
            : blockchainResult?.isValid
              ? "blockchain"
              : "database",
        certificate:
          databaseResult.certificate || blockchainResult?.certificate,
        blockchainData: blockchainResult?.certificate,
        error:
          !blockchainResult?.isValid && !databaseResult.isValid
            ? databaseResult.error || "Certificate not found"
            : undefined,
      };

      setResult(combinedResult);

      if (combinedResult.isValid) {
        toast.success(
          `Certificate verified successfully! (${combinedResult.source})`,
        );
      } else {
        toast.error(combinedResult.error || "Certificate not found or invalid");
      }
    } catch (error) {
      toast.error("Verification failed. Please try again.");
      setResult({
        isValid: false,
        source: "database",
        error: "Network error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQRVerification = async () => {
    if (!qrData.trim()) {
      toast.error("Please enter QR code data");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/certificates/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "qr",
          qrData: qrData.trim(),
        }),
      });

      const data = await response.json();
      setResult({ ...data, source: "database" });

      if (data.isValid) {
        toast.success("Certificate verified via QR code!");
      } else {
        toast.error(data.error || "Invalid QR code");
      }
    } catch (error) {
      toast.error("QR verification failed. Please try again.");
      setResult({
        isValid: false,
        source: "database",
        error: "Network error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlockchainVerification = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet to verify on blockchain");
      return;
    }

    if (!blockchainHash.trim() && !certificateId.trim()) {
      toast.error("Please enter either certificate ID or blockchain hash");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      let blockchainResult;

      if (certificateId.trim()) {
        blockchainResult = await verifyCertificate(certificateId.trim());
      } else {
        blockchainResult = await verifyCertificateByHash(blockchainHash.trim());
      }

      setResult({
        isValid: blockchainResult.isValid,
        source: "blockchain",
        certificate: blockchainResult.certificate,
        blockchainData: blockchainResult.certificate,
        error: !blockchainResult.isValid ? blockchainResult.error : undefined,
      });

      if (blockchainResult.isValid) {
        toast.success("Certificate verified on blockchain!");
      } else {
        toast.error(
          blockchainResult.error || "Certificate not found on blockchain",
        );
      }
    } catch (error: any) {
      toast.error(`Blockchain verification failed: ${error.message}`);
      setResult({
        isValid: false,
        source: "blockchain",
        error: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const formatDate = (timestamp: string | number) => {
    const date = new Date(
      typeof timestamp === "string" ? parseInt(timestamp) * 1000 : timestamp,
    );
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Certificate Verification
                  </h1>
                  <p className="text-sm text-gray-600">
                    Verify certificates on blockchain & database
                  </p>
                </div>
              </div>
            </div>
            <WalletConnection compact={true} />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Verification Methods */}
          <Card className="mb-8 shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                Verify Your Certificate
              </CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Choose your preferred verification method below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3 mb-8 bg-gray-100 p-1 rounded-xl">
                  <TabsTrigger
                    value="search"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Smart Search
                  </TabsTrigger>
                  <TabsTrigger
                    value="qr"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    QR Code
                  </TabsTrigger>
                  <TabsTrigger
                    value="blockchain"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Blockchain
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="search" className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Universal Certificate Search
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Search by certificate ID, participant name, event name, or
                      blockchain hash
                    </p>
                    <div className="flex space-x-3">
                      <Input
                        placeholder="Enter certificate ID, name, event, or hash..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                        className="flex-1 bg-white border-gray-300 focus:border-blue-500"
                      />
                      <Button
                        onClick={() => handleSearch()}
                        disabled={isLoading}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Search className="w-4 h-4 mr-2" />
                        )}
                        Search
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="qr" className="space-y-6">
                  <div className="bg-gradient-to-r from-green-50 to-cyan-50 p-6 rounded-xl border">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      QR Code Verification
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Scan or paste the QR code data from your certificate
                    </p>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="qr-data">QR Code Data</Label>
                        <Input
                          id="qr-data"
                          placeholder="Paste QR code data here..."
                          value={qrData}
                          onChange={(e) => setQrData(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleQRVerification()
                          }
                          className="bg-white border-gray-300 focus:border-green-500"
                        />
                      </div>
                      <Button
                        onClick={handleQRVerification}
                        disabled={isLoading}
                        className="bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <QrCode className="w-4 h-4 mr-2" />
                        )}
                        Verify QR Code
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="blockchain" className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                      Blockchain Verification
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Verify certificates directly on the Ethereum blockchain
                    </p>

                    {!isConnected ? (
                      <div className="text-center py-8">
                        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">
                          Connect your wallet to verify on blockchain
                        </p>
                        <WalletConnection />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="cert-id">Certificate ID</Label>
                            <Input
                              id="cert-id"
                              placeholder="Enter certificate ID..."
                              value={certificateId}
                              onChange={(e) => setCertificateId(e.target.value)}
                              className="bg-white border-gray-300 focus:border-purple-500"
                            />
                          </div>
                          <div>
                            <Label htmlFor="blockchain-hash">
                              Or Blockchain Hash
                            </Label>
                            <Input
                              id="blockchain-hash"
                              placeholder="Enter data hash (0x...)..."
                              value={blockchainHash}
                              onChange={(e) =>
                                setBlockchainHash(e.target.value)
                              }
                              className="bg-white border-gray-300 focus:border-purple-500"
                            />
                          </div>
                        </div>
                        <Button
                          onClick={handleBlockchainVerification}
                          disabled={isLoading}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Key className="w-4 h-4 mr-2" />
                          )}
                          Verify on Blockchain
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Results */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Card
                  className={`shadow-2xl border-2 ${
                    result.isValid
                      ? "border-green-200 bg-gradient-to-br from-green-50 to-emerald-50"
                      : "border-red-200 bg-gradient-to-br from-red-50 to-pink-50"
                  }`}
                >
                  <CardHeader className="text-center pb-6">
                    <div className="flex justify-center mb-4">
                      {result.isValid ? (
                        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-xl">
                          <CheckCircle className="w-12 h-12 text-white" />
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-xl">
                          <XCircle className="w-12 h-12 text-white" />
                        </div>
                      )}
                    </div>
                    <CardTitle
                      className={`text-3xl font-bold ${
                        result.isValid ? "text-green-800" : "text-red-800"
                      }`}
                    >
                      {result.isValid
                        ? "Certificate Valid"
                        : "Certificate Invalid"}
                    </CardTitle>
                    <CardDescription className="text-lg">
                      {result.isValid ? (
                        <div className="flex items-center justify-center space-x-2">
                          <span>Verified via {result.source}</span>
                          <Badge
                            variant="outline"
                            className={`${
                              result.source === "blockchain"
                                ? "border-purple-300 text-purple-700"
                                : result.source === "both"
                                  ? "border-blue-300 text-blue-700"
                                  : "border-green-300 text-green-700"
                            }`}
                          >
                            {result.source === "blockchain" && (
                              <Globe className="w-3 h-3 mr-1" />
                            )}
                            {result.source}
                          </Badge>
                        </div>
                      ) : (
                        result.error || "This certificate could not be verified"
                      )}
                    </CardDescription>
                  </CardHeader>

                  {result.isValid && result.certificate && (
                    <CardContent className="space-y-6">
                      {/* Certificate Details */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="bg-white p-4 rounded-lg border shadow-sm">
                            <Label className="text-sm font-medium text-gray-600">
                              Participant
                            </Label>
                            <div className="flex items-center space-x-2 mt-1">
                              <User className="w-4 h-4 text-blue-600" />
                              <span className="font-semibold text-gray-900">
                                {result.certificate.participantName}
                              </span>
                            </div>
                            {result.certificate.participantEmail && (
                              <p className="text-sm text-gray-600 mt-1">
                                {result.certificate.participantEmail}
                              </p>
                            )}
                          </div>

                          <div className="bg-white p-4 rounded-lg border shadow-sm">
                            <Label className="text-sm font-medium text-gray-600">
                              Event
                            </Label>
                            <div className="flex items-center space-x-2 mt-1">
                              <Award className="w-4 h-4 text-purple-600" />
                              <span className="font-semibold text-gray-900">
                                {result.certificate.eventName}
                              </span>
                            </div>
                            {result.certificate.description && (
                              <p className="text-sm text-gray-600 mt-1">
                                {result.certificate.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="bg-white p-4 rounded-lg border shadow-sm">
                            <Label className="text-sm font-medium text-gray-600">
                              Event Date
                            </Label>
                            <div className="flex items-center space-x-2 mt-1">
                              <Calendar className="w-4 h-4 text-green-600" />
                              <span className="font-semibold text-gray-900">
                                {formatDate(result.certificate.eventDate)}
                              </span>
                            </div>
                          </div>

                          <div className="bg-white p-4 rounded-lg border shadow-sm">
                            <Label className="text-sm font-medium text-gray-600">
                              Certificate ID
                            </Label>
                            <div className="flex items-center space-x-2 mt-1">
                              <Hash className="w-4 h-4 text-orange-600" />
                              <code className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                {result.certificate.id}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  copyToClipboard(result.certificate!.id)
                                }
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Blockchain Information */}
                      {result.source === "blockchain" ||
                      result.source === "both" ? (
                        <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-6 rounded-xl border border-purple-200">
                          <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
                            <Globe className="w-5 h-5 mr-2" />
                            Blockchain Information
                          </h3>
                          <div className="grid md:grid-cols-2 gap-4">
                            {result.certificate.blockchainTxHash && (
                              <div>
                                <Label className="text-sm font-medium text-purple-700">
                                  Transaction Hash
                                </Label>
                                <div className="flex items-center space-x-2 mt-1">
                                  <code className="text-xs bg-white px-2 py-1 rounded border font-mono">
                                    {formatAddress(
                                      result.certificate.blockchainTxHash,
                                    )}
                                  </code>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      window.open(
                                        getExplorerUrl(
                                          result.certificate!.blockchainTxHash!,
                                        ),
                                        "_blank",
                                      )
                                    }
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                            {result.certificate.ipfsHash && (
                              <div>
                                <Label className="text-sm font-medium text-purple-700">
                                  IPFS Hash
                                </Label>
                                <div className="flex items-center space-x-2 mt-1">
                                  <code className="text-xs bg-white px-2 py-1 rounded border font-mono">
                                    {result.certificate.ipfsHash.substring(
                                      0,
                                      20,
                                    )}
                                    ...
                                  </code>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      copyToClipboard(
                                        result.certificate!.ipfsHash!,
                                      )
                                    }
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : null}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-4 pt-4 border-t">
                        {result.certificate.certificateUrl && (
                          <Button variant="outline" asChild>
                            <a
                              href={result.certificate.certificateUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download Certificate
                            </a>
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          onClick={() => copyToClipboard(window.location.href)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Share Verification Link
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Information Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-800 flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Secure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-700 text-sm">
                  All certificates are cryptographically signed and stored on
                  blockchain for maximum security.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Instant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-700 text-sm">
                  Verification happens in real-time with results available
                  instantly across multiple methods.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <CardHeader>
                <CardTitle className="text-purple-800 flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Global
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-purple-700 text-sm">
                  Blockchain verification works globally without any central
                  authority or dependencies.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
