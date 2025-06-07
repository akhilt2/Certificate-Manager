'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Award, 
  Users, 
  Calendar, 
  Download,
  TrendingUp,
  Shield,
  Clock,
  BarChart3
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { StatsCard } from '@/components/admin/stats-card';
import { RecentActivity } from '@/components/admin/recent-activity';
import { QuickActions } from '@/components/admin/quick-actions';

interface DashboardStats {
  totalCertificates: number;
  totalEvents: number;
  totalParticipants: number;
  recentVerifications: number;
  monthlyGrowth: number;
  systemUptime: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCertificates: 0,
    totalEvents: 0,
    totalParticipants: 0,
    recentVerifications: 0,
    monthlyGrowth: 0,
    systemUptime: 99.9
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total Certificates',
      value: stats.totalCertificates.toLocaleString(),
      description: 'Certificates issued',
      icon: Award,
      trend: '+12% from last month',
      color: 'text-blue-600'
    },
    {
      title: 'Active Events',
      value: stats.totalEvents.toString(),
      description: 'Events managed',
      icon: Calendar,
      trend: '+3 new this month',
      color: 'text-green-600'
    },
    {
      title: 'Total Participants',
      value: stats.totalParticipants.toLocaleString(),
      description: 'Unique participants',
      icon: Users,
      trend: `+${stats.monthlyGrowth}% growth`,
      color: 'text-purple-600'
    },
    {
      title: 'Recent Verifications',
      value: stats.recentVerifications.toString(),
      description: 'Last 24 hours',
      icon: Shield,
      trend: 'All successful',
      color: 'text-emerald-600'
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Welcome back! Here's what's happening with your certificate system.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-green-600 border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              System Online
            </Badge>
            <Badge variant="secondary">
              {stats.systemUptime}% Uptime
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              description={stat.description}
              icon={stat.icon}
              trend={stat.trend}
              isLoading={isLoading}
            />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <QuickActions />
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <RecentActivity />
          </div>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Performance Metrics</span>
              </CardTitle>
              <CardDescription>
                System performance over the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Average Response Time</span>
                  <Badge variant="secondary">1.2s</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Certificate Generation</span>
                  <Badge variant="secondary">0.8s avg</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Verification Speed</span>
                  <Badge variant="secondary">0.3s avg</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Error Rate</span>
                  <Badge variant="outline" className="text-green-600 border-green-200">0.01%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Growth Analytics</span>
              </CardTitle>
              <CardDescription>
                Certificate issuance trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">This Month</span>
                  <div className="text-right">
                    <div className="font-semibold">+{stats.monthlyGrowth}%</div>
                    <div className="text-xs text-green-600">↗ Growing</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Peak Day</span>
                  <div className="text-right">
                    <div className="font-semibold">247 certificates</div>
                    <div className="text-xs text-gray-500">Last Tuesday</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Most Active Event</span>
                  <div className="text-right">
                    <div className="font-semibold">Tech Workshop</div>
                    <div className="text-xs text-gray-500">156 participants</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}