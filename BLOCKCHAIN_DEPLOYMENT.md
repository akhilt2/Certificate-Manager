# Blockchain Deployment Guide

This guide will walk you through deploying and configuring the blockchain-powered certificate management system.

## Prerequisites

- Node.js 18+ and npm
- MetaMask or compatible Web3 wallet
- Ethereum testnet ETH (Sepolia recommended)
- MongoDB Atlas account
- Supabase account
- IPFS account (Infura IPFS recommended)

## 1. Environment Setup

### Clone and Install Dependencies

```bash
git clone https://github.com/akhilt2/Certificate-Manager.git
cd Certificate-Manager
npm install
```

### Environment Configuration

Copy the environment template and configure:

```bash
cp env.template .env.local
```

Edit `.env.local` with your configuration:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/ieee_certificates

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Blockchain Configuration
SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
PRIVATE_KEY=your-wallet-private-key
ETHERSCAN_API_KEY=your-etherscan-api-key
INFURA_PROJECT_ID=your-infura-project-id

# IPFS Configuration
IPFS_PROJECT_ID=your-ipfs-project-id
IPFS_PROJECT_SECRET=your-ipfs-project-secret
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.infura.io/ipfs/

# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 2. Smart Contract Deployment

### Compile Contracts

```bash
npx hardhat compile
```

### Deploy to Sepolia Testnet

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

The deployment script will:
1. Deploy the CertificateManager contract
2. Verify the contract on Etherscan
3. Save deployment info to `deployments/sepolia.json`
4. Display the contract address

### Update Environment

After deployment, update your `.env.local`:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourContractAddressHere
```

### Authorize Certificate Issuers

Connect to the deployed contract and authorize admin wallets:

```bash
npx hardhat console --network sepolia
```

```javascript
const CertificateManager = await ethers.getContractFactory("CertificateManager");
const contract = await CertificateManager.attach("YOUR_CONTRACT_ADDRESS");

// Authorize an issuer
await contract.authorizeIssuer("0xAdminWalletAddress");
```

## 3. IPFS Configuration

### Setup Infura IPFS

1. Create account at [infura.io](https://infura.io)
2. Create new IPFS project
3. Get Project ID and Secret
4. Update environment variables

### Test IPFS Upload

```javascript
// Test IPFS upload
const { create } = require('ipfs-http-client');

const client = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: 'Basic ' + Buffer.from(PROJECT_ID + ':' + PROJECT_SECRET).toString('base64')
  }
});

const testUpload = async () => {
  const result = await client.add('Hello IPFS!');
  console.log('IPFS Hash:', result.path);
};

testUpload();
```

## 4. Database Setup

### MongoDB Collections

The application will create these collections automatically:
- `users` - Admin and coordinator accounts
- `events` - Event information
- `certificates` - Certificate records
- `participants` - Participant data
- `verifications` - Verification logs

### Create Initial Admin User

```javascript
// Connect to MongoDB and create admin user
db.users.insertOne({
  name: "Admin User",
  email: "admin@ieee.nitc.ac.in",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3QJL9.KeF2", // "admin123"
  role: "admin",
  walletAddress: "0xYourAdminWalletAddress", // Add this field
  createdAt: new Date()
});
```

### Index Creation

Create indexes for better performance:

```javascript
// Certificate indexes
db.certificates.createIndex({ "participantEmail": 1 });
db.certificates.createIndex({ "eventId": 1 });
db.certificates.createIndex({ "blockchainTxHash": 1 });

// Event indexes
db.events.createIndex({ "name": 1 });
db.events.createIndex({ "organizerName": 1 });

// User indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "walletAddress": 1 });
```

## 5. Supabase Storage Setup

### Create Storage Bucket

1. Go to Supabase dashboard
2. Navigate to Storage
3. Create bucket named `certificates`
4. Set bucket to public

### Configure RLS Policies

```sql
-- Allow public read access to certificates
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'certificates');

-- Allow authenticated users to upload certificates
CREATE POLICY "Authenticated upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'certificates' AND auth.role() = 'authenticated');

-- Allow authenticated users to update certificates
CREATE POLICY "Authenticated update" ON storage.objects
FOR UPDATE USING (bucket_id = 'certificates' AND auth.role() = 'authenticated');
```

## 6. Local Development

### Start Local Blockchain (Optional)

```bash
# Terminal 1 - Start Hardhat network
npx hardhat node

# Terminal 2 - Deploy to local network
npx hardhat run scripts/deploy.js --network localhost
```

### Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to access the application.

## 7. Production Deployment

### Vercel Deployment

1. Connect GitHub repo to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

```env
# Production MongoDB
MONGODB_URI=mongodb+srv://prod-user:password@prod-cluster.mongodb.net/ieee_certificates_prod

# Production Supabase
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=prod-service-role-key

# Mainnet Configuration (if deploying to mainnet)
MAINNET_URL=https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID
NEXT_PUBLIC_CONTRACT_ADDRESS=0xMainnetContractAddress

# Production App URL
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Mainnet Deployment Considerations

**⚠️ IMPORTANT: Mainnet deployment costs real ETH!**

1. **Gas Optimization**: Review contract for gas efficiency
2. **Security Audit**: Consider professional security audit
3. **Gradual Rollout**: Deploy to testnet first, then mainnet
4. **Backup Plans**: Have emergency pause mechanisms
5. **Monitoring**: Set up transaction monitoring

### Deploy to Mainnet

```bash
# Make sure you have enough ETH for gas
npx hardhat run scripts/deploy.js --network mainnet
```

## 8. Testing

### Contract Testing

```bash
# Run contract tests
npx hardhat test

# Run with coverage
npx hardhat coverage
```

### Integration Testing

```bash
# Run frontend tests
npm test

# Run E2E tests
npm run test:e2e
```

## 9. Monitoring and Maintenance

### Health Checks

The application includes health check endpoints:
- `/api/health` - Application health
- `/api/health/blockchain` - Blockchain connection
- `/api/health/database` - Database connection

### Monitoring Tools

1. **Etherscan**: Monitor contract transactions
2. **Infura Dashboard**: Track API usage
3. **Vercel Analytics**: Monitor application performance
4. **MongoDB Atlas**: Database monitoring

### Regular Maintenance

1. **Update Dependencies**: Regular security updates
2. **Gas Price Monitoring**: Adjust gas prices for efficiency
3. **Database Backups**: Regular MongoDB backups
4. **Certificate Archival**: Archive old certificates to IPFS

## 10. Security Best Practices

### Smart Contract Security

1. **Access Control**: Only authorized addresses can issue certificates
2. **Input Validation**: All inputs are validated
3. **Reentrancy Protection**: Using OpenZeppelin's ReentrancyGuard
4. **Pausable**: Emergency pause functionality

### Application Security

1. **Environment Variables**: Never commit secrets
2. **HTTPS Only**: Always use HTTPS in production
3. **Rate Limiting**: Implement API rate limiting
4. **Input Sanitization**: Sanitize all user inputs

### Wallet Security

1. **Hardware Wallets**: Use hardware wallets for mainnet
2. **Multi-sig**: Consider multi-signature wallets for admin functions
3. **Key Rotation**: Regular key rotation policies
4. **Access Logging**: Log all admin actions

## 11. Troubleshooting

### Common Issues

#### Contract Deployment Fails
```bash
# Check gas price and limit
npx hardhat run scripts/deploy.js --network sepolia --verbose

# Verify network configuration
npx hardhat console --network sepolia
```

#### MetaMask Connection Issues
1. Check network is added to MetaMask
2. Verify contract address is correct
3. Clear browser cache and reload

#### IPFS Upload Failures
1. Verify IPFS credentials
2. Check file size limits
3. Test IPFS connection separately

#### Database Connection Issues
1. Check MongoDB URI format
2. Verify IP whitelist in MongoDB Atlas
3. Test connection with MongoDB Compass

### Debug Mode

Enable debug logging:

```env
LOG_LEVEL=debug
NODE_ENV=development
```

### Getting Help

1. **GitHub Issues**: Report bugs and feature requests
2. **Documentation**: Check API documentation
3. **Community**: Join IEEE SB NITC community channels

## 12. API Reference

### Contract Methods

```solidity
// Create new event
function createEvent(
    string memory _name,
    string memory _description,
    string memory _organizerName,
    uint256 _eventDate,
    uint256 _maxParticipants
) external returns (uint256)

// Issue certificate
function issueCertificate(
    string memory _participantName,
    string memory _participantEmail,
    uint256 _eventId,
    string memory _ipfsHash
) external returns (uint256)

// Verify certificate
function verifyCertificate(uint256 _certificateId)
    external view returns (bool isValid, Certificate memory certificate)
```

### REST API Endpoints

```
POST /api/certificates/verify
GET  /api/admin/dashboard
POST /api/admin/events
POST /api/admin/participants/upload
GET  /api/health
```

## 13. License

This project is licensed under the GPLv3 License - see the [LICENSE](LICENSE) file for details.

## 14. Support

For support and questions:
- **Issues**: [GitHub Issues](https://github.com/akhilt2/Certificate-Manager/issues)
- **Email**: ieee@nitc.ac.in
- **Documentation**: [Wiki](https://github.com/akhilt2/Certificate-Manager/wiki)

---

**🎉 Congratulations!** You now have a fully functional blockchain-powered certificate management system. The certificates are stored immutably on the Ethereum blockchain, making them globally verifiable and tamper-proof.