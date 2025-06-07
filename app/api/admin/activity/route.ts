import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    const user = verifyToken(token || '');

    if (!user || !['admin', 'coordinator'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDatabase();

    // Get recent activities (mock data for demo)
    const activities = [
      {
        id: '1',
        type: 'certificate_issued',
        description: 'Certificate issued for Tech Workshop 2024',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        user: 'John Doe'
      },
      {
        id: '2',
        type: 'event_created',
        description: 'New event "AI/ML Bootcamp" created',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        user: 'Admin'
      },
      {
        id: '3',
        type: 'verification',
        description: 'Certificate verified via QR code',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '4',
        type: 'participant_added',
        description: '25 participants added to Web Development Workshop',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        user: 'Coordinator'
      },
      {
        id: '5',
        type: 'certificate_issued',
        description: 'Bulk certificates generated for Hackathon 2024',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        user: 'Admin'
      }
    ];

    return NextResponse.json(activities);

  } catch (error) {
    console.error('Activity error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity data' },
      { status: 500 }
    );
  }
}