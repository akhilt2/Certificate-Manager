'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Shield, Award, Users, QrCode, Download, Zap } from 'lucide-react';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');

  const features = [
    {
      icon: Shield,
      title: 'Secure Verification',
      description: 'Advanced cryptographic verification with public/private key pairs and QR codes'
    },
    {
      icon: Award,
      title: 'Digital Certificates',
      description: 'Professional certificate generation with customizable templates'
    },
    {
      icon: Users,
      title: 'Bulk Management',
      description: 'Efficient bulk participant upload and certificate generation via CSV'
    },
    {
      icon: QrCode,
      title: 'QR Code Integration',
      description: 'Instant verification through QR code scanning'
    },
    {
      icon: Download,
      title: 'Easy Downloads',
      description: 'Individual and bulk certificate downloads for administrators'
    },
    {
      icon: Zap,
      title: 'Fast Processing',
      description: 'Certificate generation and verification in under 2 seconds'
    }
  ];

  const stats = [
    { label: 'Certificates Issued', value: '2,500+' },
    { label: 'Events Managed', value: '150+' },
    { label: 'Verification Rate', value: '99.9%' },
    { label: 'Processing Speed', value: '<2s' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">IEEE SB NITC</h1>
                <p className="text-sm text-gray-600">Certificate Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/verify">
                <Button variant="outline" size="sm">
                  <Shield className="w-4 h-4 mr-2" />
                  Verify Certificate
                </Button>
              </Link>
              <Link href="/login">
                <Button size="sm">
                  Admin Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            Trusted by IEEE Student Branch NITC
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Digital Certificate
            <span className="text-blue-600"> Management</span>
            <br />& Verification System
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Secure, fast, and reliable certificate generation and verification platform 
            for IEEE Student Branch NIT Calicut events and activities.
          </p>
          
          {/* Quick Verification */}
          <div className="max-w-md mx-auto mb-12">
            <div className="flex space-x-2">
              <Input
                placeholder="Enter certificate ID or participant name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Link href={`/verify${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`}>
                <Button>
                  <Search className="w-4 h-4 mr-2" />
                  Verify
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Certificate Management
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built with cutting-edge technology to ensure security, reliability, and ease of use
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join the digital revolution in certificate management. 
            Secure, verify, and manage certificates with ease.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/verify">
              <Button size="lg" variant="secondary">
                <Shield className="w-5 h-5 mr-2" />
                Verify a Certificate
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
                <Users className="w-5 h-5 mr-2" />
                Admin Access
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold">IEEE SB NITC</span>
              </div>
              <p className="text-gray-400 text-sm">
                Digital certificate management system for IEEE Student Branch NIT Calicut.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/verify" className="hover:text-white transition-colors">Verify Certificate</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Admin Login</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">About IEEE</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Security</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>256-bit SSL Encryption</li>
                <li>RSA Key Verification</li>
                <li>99.9% Uptime SLA</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 IEEE Student Branch NIT Calicut. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}