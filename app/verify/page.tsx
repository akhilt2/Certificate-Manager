'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Download
} from 'lucide-react';
import { toast } from 'sonner';

interface CertificateResult {
  isValid: boolean;
  certificate?: {
    id: string;
    participantName: string;
    eventName: string;
    eventDate: string;
    organizerName: string;
    description: string;
    issueDate: string;
    certificateUrl?: string;
  };
  error?: string;
}

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('q') || '');
  const [qrData, setQrData] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [signature, setSignature] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CertificateResult | null>(null);
  const [activeTab, setActiveTab] = useState('search');

  useEffect(() => {
    const query = searchParams?.get('q');
    if (query) {
      setSearchQuery(query);
      handleSearch(query);
    }
  }, [searchParams]);

  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery;
    if (!searchTerm.trim()) {
      toast.error('Please enter a search term');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/certificates/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          type: 'search',
          query: searchTerm.trim()
        }),
      });

      const data = await response.json();
      setResult(data);

      if (data.isValid) {
        toast.success('Certificate verified successfully!');
      } else {
        toast.error(data.error || 'Certificate not found or invalid');
      }
    } catch (error) {
      toast.error('Verification failed. Please try again.');
      setResult({ isValid: false, error: 'Network error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQRVerification = async () => {
    if (!qrData.trim()) {
      toast.error('Please enter QR code data');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/certificates/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          type: 'qr',
          data: qrData.trim()
        }),
      });

      const data = await response.json();
      setResult(data);

      if (data.isValid) {
        toast.success('Certificate verified via QR code!');
      } else {
        toast.error(data.error || 'Invalid QR code data');
      }
    } catch (error) {
      toast.error('QR verification failed. Please try again.');
      setResult({ isValid: false, error: 'Network error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyVerification = async () => {
    if (!publicKey.trim() || !signature.trim()) {
      toast.error('Please provide both public key and signature');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/certificates/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          type: 'key',
          publicKey: publicKey.trim(),
          signature: signature.trim()
        }),
      });

      const data = await response.json();
      setResult(data);

      if (data.isValid) {
        toast.success('Certificate verified via cryptographic keys!');
      } else {
        toast.error(data.error || 'Invalid key or signature');
      }
    } catch (error) {
      toast.error('Key verification failed. Please try again.');
      setResult({ isValid: false, error: 'Network error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">IEEE SB NITC</h1>
                  <p className="text-xs text-gray-600">Certificate Verification</p>
                </div>
              </div>
            </Link>
            <Badge variant="outline" className="text-green-600 border-green-200">
              Secure Verification
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Certificate Verification Portal
            </h1>
            <p className="text-lg text-gray-600">
              Verify the authenticity of IEEE SB NITC certificates using multiple methods
            </p>
          </div>

          {/* Verification Methods */}
          <Card className="shadow-lg border-0 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="w-5 h-5" />
                <span>Verification Methods</span>
              </CardTitle>
              <CardDescription>
                Choose your preferred method to verify certificate authenticity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="search" className="flex items-center space-x-2">
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </TabsTrigger>
                  <TabsTrigger value="qr" className="flex items-center space-x-2">
                    <QrCode className="w-4 h-4" />
                    <span>QR Code</span>
                  </TabsTrigger>
                  <TabsTrigger value="key" className="flex items-center space-x-2">
                    <Key className="w-4 h-4" />
                    <span>Cryptographic</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="search" className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="search">Search by Certificate ID, Name, or Event</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="search"
                        placeholder="Enter certificate ID, participant name, or event name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="flex-1"
                      />
                      <Button onClick={() => handleSearch()} disabled={isLoading}>
                        {isLoading ? 'Searching...' : 'Verify'}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="qr" className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="qr">QR Code Data</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="qr"
                        placeholder="Paste QR code data or scan QR code..."
                        value={qrData}
                        onChange={(e) => setQrData(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleQRVerification()}
                        className="flex-1"
                      />
                      <Button onClick={handleQRVerification} disabled={isLoading}>
                        {isLoading ? 'Verifying...' : 'Verify'}
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      Scan the QR code on the certificate or paste the QR code data
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="key" className="space-y-4 mt-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="publicKey">Public Key</Label>
                      <textarea
                        id="publicKey"
                        placeholder="-----BEGIN PUBLIC KEY-----&#10;...&#10;-----END PUBLIC KEY-----"
                        value={publicKey}
                        onChange={(e) => setPublicKey(e.target.value)}
                        className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md resize-none font-mono text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signature">Digital Signature</Label>
                      <textarea
                        id="signature"
                        placeholder="Enter the digital signature..."
                        value={signature}
                        onChange={(e) => setSignature(e.target.value)}
                        className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md resize-none font-mono text-sm"
                      />
                    </div>
                    <Button onClick={handleKeyVerification} disabled={isLoading} className="w-full">
                      {isLoading ? 'Verifying...' : 'Verify with Cryptographic Keys'}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <Card className={`shadow-lg border-0 ${result.isValid ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'}`}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {result.isValid ? (
                    <>
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <span className="text-green-600">Certificate Verified</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-6 h-6 text-red-600" />
                      <span className="text-red-600">Verification Failed</span>
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.isValid && result.certificate ? (
                  <div className="space-y-6">
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        This certificate is authentic and has been verified against our secure database.
                      </AlertDescription>
                    </Alert>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <User className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500">Participant Name</p>
                            <p className="font-semibold">{result.certificate.participantName}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Award className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500">Event Name</p>
                            <p className="font-semibold">{result.certificate.eventName}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Calendar className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500">Event Date</p>
                            <p className="font-semibold">{new Date(result.certificate.eventDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Hash className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500">Certificate ID</p>
                            <p className="font-mono text-sm">{result.certificate.id}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <User className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500">Issued By</p>
                            <p className="font-semibold">{result.certificate.organizerName}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Calendar className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500">Issue Date</p>
                            <p className="font-semibold">{new Date(result.certificate.issueDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {result.certificate.description && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Description</p>
                        <p className="text-gray-700">{result.certificate.description}</p>
                      </div>
                    )}

                    {result.certificate.certificateUrl && (
                      <div className="pt-4 border-t">
                        <Button asChild>
                          <a href={result.certificate.certificateUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4 mr-2" />
                            Download Certificate
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      {result.error || 'Certificate could not be verified. Please check the information and try again.'}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Help Section */}
          <Card className="mt-8 bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="text-blue-800">
              <div className="space-y-2 text-sm">
                <p><strong>Search Method:</strong> Enter certificate ID, participant name, or event name</p>
                <p><strong>QR Code Method:</strong> Scan or paste the QR code data from the certificate</p>
                <p><strong>Cryptographic Method:</strong> Use the public key and signature for advanced verification</p>
              </div>
              <div className="mt-4">
                <Link href="/contact" className="text-blue-600 hover:underline text-sm">
                  Contact support if you need assistance →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}