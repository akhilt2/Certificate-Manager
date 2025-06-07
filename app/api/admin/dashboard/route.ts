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

    // Get dashboard statistics
    const [
      totalCertificates,
      totalEvents,
      totalParticipants,
      recentVerifications
    ] = await Promise.all([
      db.collection('certificates').countDocuments(),
      db.collection('events').countDocuments(),
      db.collection('participants').countDocuments(),
      db.collection('verifications').countDocuments({
        timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      })
    ]);

    // Calculate monthly growth (mock data for demo)
    const monthlyGrowth = Math.floor(Math.random() * 20) + 5;

    return NextResponse.json({
      totalCertificates,
      totalEvents,
      totalParticipants,
      recentVerifications,
      monthlyGrowth,
      systemUptime: 99.9
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}