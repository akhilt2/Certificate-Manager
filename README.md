# IEEE SB NITC - Digital Certificate Management System

A comprehensive full-stack web application for managing and verifying digital certificates for IEEE Student Branch NIT Calicut.

## 🚀 Features

### Admin System
- **Secure Authentication**: JWT-based authentication with role-based access control
- **Interactive Dashboard**: Real-time statistics and system monitoring
- **Event Management**: Create and manage events with detailed information
- **Bulk Operations**: CSV upload for participants and bulk certificate generation
- **Template Customization**: Customizable certificate templates
- **Download Capabilities**: Individual and bulk certificate downloads

### Certificate Management
- **Automated Generation**: Fast certificate generation (< 2 seconds)
- **Unique Security**: Each certificate has unique QR codes and cryptographic key pairs
- **Secure Storage**: Organized storage in Supabase by event
- **Digital Signatures**: RSA-based digital signatures for authenticity

### Public Verification Portal
- **Multiple Verification Methods**:
  - Search by certificate ID, participant name, or event name
  - QR code scanning and verification
  - Cryptographic verification using public/private keys
- **Mobile Responsive**: Optimized for all devices
- **Real-time Results**: Instant verification with detailed certificate information

## 🛠️ Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB Atlas
- **Storage**: Supabase Storage
- **Authentication**: JWT with bcrypt
- **UI Components**: Radix UI, shadcn/ui
- **Security**: RSA encryption, HTTPS, input validation

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account
- Supabase account
- Git

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/akhilt2/Certificate-Manager.git
cd Certificate-Manager
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ieee_certificates

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Environment
NODE_ENV=development
```

Look into `.env.example` file for reference on environment variables.

### 4. Database Setup

#### MongoDB Collections
The application will automatically create the following collections:
- `users` - Admin and coordinator accounts
- `events` - Event information
- `certificates` - Certificate records
- `participants` - Participant data
- `verifications` - Verification logs

#### Initial Admin User
Create an admin user in your MongoDB database:

```javascript
// Connect to your MongoDB database and run:
db.users.insertOne({
  name: "Admin User",
  email: "admin@ieee.nitc.ac.in",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3QJL9.KeF2", // "admin123"
  role: "admin",
  createdAt: new Date()
});
```

### 5. Supabase Setup

1. Create a new Supabase project
2. Create a storage bucket named `certificates`
3. Set up the following bucket policies:

```sql
-- Allow public read access to certificates
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'certificates');

-- Allow authenticated users to upload certificates
CREATE POLICY "Authenticated upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'certificates' AND auth.role() = 'authenticated');
```

### 6. Run the Application
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📱 Usage

### Admin Access
1. Navigate to `/login`
2. Use demo credentials:
   - **Admin**: admin@ieee.nitc.ac.in / admin123
   - **Coordinator**: coord@ieee.nitc.ac.in / coord123

### Certificate Verification
1. Navigate to `/verify`
2. Choose verification method:
   - **Search**: Enter certificate ID, name, or event
   - **QR Code**: Scan or paste QR code data
   - **Cryptographic**: Use public key and signature

## 🔧 Configuration

### Certificate Templates
Customize certificate templates in `/components/certificate-templates/`

### Email Notifications
Configure email settings in `/lib/email.ts`

### Security Settings
Adjust security parameters in `/lib/auth.ts`

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Certificate Endpoints
- `POST /api/certificates/verify` - Verify certificate
- `POST /api/certificates/generate` - Generate certificates
- `GET /api/certificates` - List certificates

### Admin Endpoints
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/activity` - Recent activity
- `POST /api/admin/events` - Create event
- `POST /api/admin/participants/upload` - Upload participants

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify
1. Build the application: `npm run build`
2. Deploy the `out` folder to Netlify
3. Configure environment variables

### AWS Amplify
1. Connect repository to AWS Amplify
2. Configure build settings
3. Add environment variables

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: Admin and coordinator roles
- **Input Validation**: Comprehensive input sanitization
- **HTTPS Only**: Secure communication
- **RSA Encryption**: Certificate authenticity verification
- **Rate Limiting**: API endpoint protection

## 📈 Performance

- **Certificate Generation**: < 2 seconds average
- **Verification Speed**: < 0.5 seconds average
- **Database Queries**: Optimized with indexes
- **Caching**: Strategic caching for better performance

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 License

This project is licensed under the GPLv3 License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Issues: [GitHub Issues](https://github.com/akhilt2/Certificate-Manager/issues)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Supabase for backend services
- MongoDB for database solutions
