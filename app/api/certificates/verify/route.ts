import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyCertificate } from '@/lib/certificate-generator';

export async function POST(request: NextRequest) {
  try {
    const { type, query, data, publicKey, signature } = await request.json();

    const db = await getDatabase();
    let certificate = null;

    switch (type) {
      case 'search':
        // Search by certificate ID, participant name, or event name
        certificate = await db.collection('certificates').findOne({
          $or: [
            { certificateId: { $regex: query, $options: 'i' } },
            { participantName: { $regex: query, $options: 'i' } },
            { eventName: { $regex: query, $options: 'i' } }
          ]
        });
        break;

      case 'qr':
        // Verify QR code data (should contain certificate ID)
        try {
          const qrData = JSON.parse(data);
          certificate = await db.collection('certificates').findOne({
            certificateId: qrData.certificateId
          });
        } catch {
          // If not JSON, treat as certificate ID
          certificate = await db.collection('certificates').findOne({
            certificateId: data
          });
        }
        break;

      case 'key':
        // Verify using public key and signature
        certificate = await db.collection('certificates').findOne({
          publicKey: publicKey
        });
        
        if (certificate) {
          const isValid = verifyCertificate(
            {
              participantName: certificate.participantName,
              eventName: certificate.eventName,
              eventDate: certificate.eventDate,
              certificateId: certificate.certificateId,
              organizerName: certificate.organizerName,
              description: certificate.description
            },
            signature,
            publicKey
          );
          
          if (!isValid) {
            return NextResponse.json({
              isValid: false,
              error: 'Invalid signature or public key'
            });
          }
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid verification type' },
          { status: 400 }
        );
    }

    if (!certificate) {
      return NextResponse.json({
        isValid: false,
        error: 'Certificate not found'
      });
    }

    return NextResponse.json({
      isValid: true,
      certificate: {
        id: certificate.certificateId,
        participantName: certificate.participantName,
        eventName: certificate.eventName,
        eventDate: certificate.eventDate,
        organizerName: certificate.organizerName,
        description: certificate.description,
        issueDate: certificate.createdAt,
        certificateUrl: certificate.certificateUrl
      }
    });

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}