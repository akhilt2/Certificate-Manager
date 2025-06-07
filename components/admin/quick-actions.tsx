import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Upload, 
  Download, 
  Settings,
  Calendar,
  Award,
  Users,
  FileText
} from 'lucide-react';

export function QuickActions() {
  const actions = [
    {
      title: 'Create Event',
      description: 'Set up a new event',
      icon: Plus,
      href: '/admin/events/new',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Upload Participants',
      description: 'Bulk upload via CSV',
      icon: Upload,
      href: '/admin/participants/upload',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Generate Certificates',
      description: 'Create certificates',
      icon: Award,
      href: '/admin/certificates/generate',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Download Reports',
      description: 'Export system data',
      icon: Download,
      href: '/admin/reports',
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Common tasks and shortcuts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          {actions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4 hover:bg-gray-50"
              >
                <div className={`p-2 rounded-lg ${action.color} mr-3`}>
                  <action.icon className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-xs text-gray-500">{action.description}</div>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}