const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("CertificateManager", function () {
  let CertificateManager;
  let certificateManager;
  let owner;
  let issuer1;
  let issuer2;
  let user1;
  let user2;

  const SAMPLE_EVENT = {
    name: "IEEE Tech Workshop 2024",
    description: "Advanced workshop on emerging technologies",
    organizerName: "IEEE SB NITC",
    eventDate: Math.floor(Date.now() / 1000) + 86400, // Tomorrow
    maxParticipants: 100
  };

  const SAMPLE_CERTIFICATE = {
    participantName: "John Doe",
    participantEmail: "john.doe@nitc.ac.in",
    ipfsHash: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
  };

  beforeEach(async function () {
    // Get signers
    [owner, issuer1, issuer2, user1, user2] = await ethers.getSigners();

    // Deploy contract
    CertificateManager = await ethers.getContractFactory("CertificateManager");
    certificateManager = await CertificateManager.deploy();
    await certificateManager.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the deployer as owner and authorized issuer", async function () {
      expect(await certificateManager.owner()).to.equal(owner.address);
      expect(await certificateManager.authorizedIssuers(owner.address)).to.be.true;
    });

    it("Should initialize with zero certificates and events", async function () {
      expect(await certificateManager.getTotalCertificates()).to.equal(0);
      expect(await certificateManager.getTotalEvents()).to.equal(0);
    });
  });

  describe("Authorization Management", function () {
    it("Should allow owner to authorize new issuers", async function () {
      await certificateManager.authorizeIssuer(issuer1.address);
      expect(await certificateManager.authorizedIssuers(issuer1.address)).to.be.true;
    });

    it("Should emit IssuerAuthorized event", async function () {
      await expect(certificateManager.authorizeIssuer(issuer1.address))
        .to.emit(certificateManager, "IssuerAuthorized")
        .withArgs(issuer1.address);
    });

    it("Should allow owner to revoke issuer authorization", async function () {
      await certificateManager.authorizeIssuer(issuer1.address);
      await certificateManager.revokeIssuer(issuer1.address);
      expect(await certificateManager.authorizedIssuers(issuer1.address)).to.be.false;
    });

    it("Should emit IssuerRevoked event", async function () {
      await certificateManager.authorizeIssuer(issuer1.address);
      await expect(certificateManager.revokeIssuer(issuer1.address))
        .to.emit(certificateManager, "IssuerRevoked")
        .withArgs(issuer1.address);
    });

    it("Should not allow non-owner to authorize issuers", async function () {
      await expect(
        certificateManager.connect(user1).authorizeIssuer(issuer1.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should not allow non-owner to revoke issuers", async function () {
      await certificateManager.authorizeIssuer(issuer1.address);
      await expect(
        certificateManager.connect(user1).revokeIssuer(issuer1.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Event Management", function () {
    beforeEach(async function () {
      await certificateManager.authorizeIssuer(issuer1.address);
    });

    it("Should allow authorized issuer to create events", async function () {
      const tx = await certificateManager.connect(issuer1).createEvent(
        SAMPLE_EVENT.name,
        SAMPLE_EVENT.description,
        SAMPLE_EVENT.organizerName,
        SAMPLE_EVENT.eventDate,
        SAMPLE_EVENT.maxParticipants
      );

      const receipt = await tx.wait();
      const eventCreatedLog = receipt.logs.find(
        log => log.fragment && log.fragment.name === "EventCreated"
      );

      expect(eventCreatedLog).to.not.be.undefined;
      expect(eventCreatedLog.args[0]).to.equal(1); // Event ID
      expect(eventCreatedLog.args[1]).to.equal(SAMPLE_EVENT.name);
      expect(eventCreatedLog.args[2]).to.equal(issuer1.address);
    });

    it("Should emit EventCreated event with correct parameters", async function () {
      await expect(
        certificateManager.connect(issuer1).createEvent(
          SAMPLE_EVENT.name,
          SAMPLE_EVENT.description,
          SAMPLE_EVENT.organizerName,
          SAMPLE_EVENT.eventDate,
          SAMPLE_EVENT.maxParticipants
        )
      )
        .to.emit(certificateManager, "EventCreated")
        .withArgs(1, SAMPLE_EVENT.name, issuer1.address);
    });

    it("Should store event details correctly", async function () {
      await certificateManager.connect(issuer1).createEvent(
        SAMPLE_EVENT.name,
        SAMPLE_EVENT.description,
        SAMPLE_EVENT.organizerName,
        SAMPLE_EVENT.eventDate,
        SAMPLE_EVENT.maxParticipants
      );

      const event = await certificateManager.events(1);
      expect(event.id).to.equal(1);
      expect(event.name).to.equal(SAMPLE_EVENT.name);
      expect(event.description).to.equal(SAMPLE_EVENT.description);
      expect(event.organizerName).to.equal(SAMPLE_EVENT.organizerName);
      expect(event.eventDate).to.equal(SAMPLE_EVENT.eventDate);
      expect(event.maxParticipants).to.equal(SAMPLE_EVENT.maxParticipants);
      expect(event.participantCount).to.equal(0);
      expect(event.isActive).to.be.true;
      expect(event.organizer).to.equal(issuer1.address);
    });

    it("Should increment total events counter", async function () {
      await certificateManager.connect(issuer1).createEvent(
        SAMPLE_EVENT.name,
        SAMPLE_EVENT.description,
        SAMPLE_EVENT.organizerName,
        SAMPLE_EVENT.eventDate,
        SAMPLE_EVENT.maxParticipants
      );

      expect(await certificateManager.getTotalEvents()).to.equal(1);
    });

    it("Should not allow unauthorized users to create events", async function () {
      await expect(
        certificateManager.connect(user1).createEvent(
          SAMPLE_EVENT.name,
          SAMPLE_EVENT.description,
          SAMPLE_EVENT.organizerName,
          SAMPLE_EVENT.eventDate,
          SAMPLE_EVENT.maxParticipants
        )
      ).to.be.revertedWith("Not authorized to issue certificates");
    });

    it("Should allow event organizer to deactivate their event", async function () {
      await certificateManager.connect(issuer1).createEvent(
        SAMPLE_EVENT.name,
        SAMPLE_EVENT.description,
        SAMPLE_EVENT.organizerName,
        SAMPLE_EVENT.eventDate,
        SAMPLE_EVENT.maxParticipants
      );

      await certificateManager.connect(issuer1).deactivateEvent(1);
      const event = await certificateManager.events(1);
      expect(event.isActive).to.be.false;
    });

    it("Should not allow non-organizer to deactivate event", async function () {
      await certificateManager.connect(issuer1).createEvent(
        SAMPLE_EVENT.name,
        SAMPLE_EVENT.description,
        SAMPLE_EVENT.organizerName,
        SAMPLE_EVENT.eventDate,
        SAMPLE_EVENT.maxParticipants
      );

      await certificateManager.authorizeIssuer(issuer2.address);
      await expect(
        certificateManager.connect(issuer2).deactivateEvent(1)
      ).to.be.revertedWith("Not authorized to deactivate this event");
    });
  });

  describe("Certificate Issuance", function () {
    let eventId;

    beforeEach(async function () {
      await certificateManager.authorizeIssuer(issuer1.address);

      const tx = await certificateManager.connect(issuer1).createEvent(
        SAMPLE_EVENT.name,
        SAMPLE_EVENT.description,
        SAMPLE_EVENT.organizerName,
        SAMPLE_EVENT.eventDate,
        SAMPLE_EVENT.maxParticipants
      );

      const receipt = await tx.wait();
      eventId = receipt.logs.find(
        log => log.fragment && log.fragment.name === "EventCreated"
      ).args[0];
    });

    it("Should issue certificate successfully", async function () {
      const tx = await certificateManager.connect(issuer1).issueCertificate(
        SAMPLE_CERTIFICATE.participantName,
        SAMPLE_CERTIFICATE.participantEmail,
        eventId,
        SAMPLE_CERTIFICATE.ipfsHash
      );

      const receipt = await tx.wait();
      const certificateIssuedLog = receipt.logs.find(
        log => log.fragment && log.fragment.name === "CertificateIssued"
      );

      expect(certificateIssuedLog).to.not.be.undefined;
      expect(certificateIssuedLog.args[0]).to.equal(1); // Certificate ID
      expect(certificateIssuedLog.args[1]).to.equal(SAMPLE_CERTIFICATE.participantEmail);
      expect(certificateIssuedLog.args[2]).to.equal(eventId);
      expect(certificateIssuedLog.args[3]).to.equal(issuer1.address);
    });

    it("Should store certificate details correctly", async function () {
      await certificateManager.connect(issuer1).issueCertificate(
        SAMPLE_CERTIFICATE.participantName,
        SAMPLE_CERTIFICATE.participantEmail,
        eventId,
        SAMPLE_CERTIFICATE.ipfsHash
      );

      const certificate = await certificateManager.certificates(1);
      expect(certificate.id).to.equal(1);
      expect(certificate.participantName).to.equal(SAMPLE_CERTIFICATE.participantName);
      expect(certificate.participantEmail).to.equal(SAMPLE_CERTIFICATE.participantEmail);
      expect(certificate.eventName).to.equal(SAMPLE_EVENT.name);
      expect(certificate.ipfsHash).to.equal(SAMPLE_CERTIFICATE.ipfsHash);
      expect(certificate.isRevoked).to.be.false;
      expect(certificate.issuer).to.equal(issuer1.address);
    });

    it("Should increment participant count in event", async function () {
      await certificateManager.connect(issuer1).issueCertificate(
        SAMPLE_CERTIFICATE.participantName,
        SAMPLE_CERTIFICATE.participantEmail,
        eventId,
        SAMPLE_CERTIFICATE.ipfsHash
      );

      const event = await certificateManager.events(eventId);
      expect(event.participantCount).to.equal(1);
    });

    it("Should add certificate to participant's certificates list", async function () {
      await certificateManager.connect(issuer1).issueCertificate(
        SAMPLE_CERTIFICATE.participantName,
        SAMPLE_CERTIFICATE.participantEmail,
        eventId,
        SAMPLE_CERTIFICATE.ipfsHash
      );

      const participantCertificates = await certificateManager.getParticipantCertificates(
        SAMPLE_CERTIFICATE.participantEmail
      );
      expect(participantCertificates.length).to.equal(1);
      expect(participantCertificates[0]).to.equal(1);
    });

    it("Should add certificate to event's certificates list", async function () {
      await certificateManager.connect(issuer1).issueCertificate(
        SAMPLE_CERTIFICATE.participantName,
        SAMPLE_CERTIFICATE.participantEmail,
        eventId,
        SAMPLE_CERTIFICATE.ipfsHash
      );

      const eventCertificates = await certificateManager.getEventCertificates(eventId);
      expect(eventCertificates.length).to.equal(1);
      expect(eventCertificates[0]).to.equal(1);
    });

    it("Should not allow issuing certificate for non-existent event", async function () {
      await expect(
        certificateManager.connect(issuer1).issueCertificate(
          SAMPLE_CERTIFICATE.participantName,
          SAMPLE_CERTIFICATE.participantEmail,
          999, // Non-existent event
          SAMPLE_CERTIFICATE.ipfsHash
        )
      ).to.be.revertedWith("Event does not exist");
    });

    it("Should not allow issuing certificate for inactive event", async function () {
      await certificateManager.connect(issuer1).deactivateEvent(eventId);

      await expect(
        certificateManager.connect(issuer1).issueCertificate(
          SAMPLE_CERTIFICATE.participantName,
          SAMPLE_CERTIFICATE.participantEmail,
          eventId,
          SAMPLE_CERTIFICATE.ipfsHash
        )
      ).to.be.revertedWith("Event is not active");
    });

    it("Should not allow unauthorized user to issue certificates", async function () {
      await expect(
        certificateManager.connect(user1).issueCertificate(
          SAMPLE_CERTIFICATE.participantName,
          SAMPLE_CERTIFICATE.participantEmail,
          eventId,
          SAMPLE_CERTIFICATE.ipfsHash
        )
      ).to.be.revertedWith("Not authorized to issue certificates");
    });

    it("Should not exceed maximum participants", async function () {
      // Create event with max 1 participant
      const tx = await certificateManager.connect(issuer1).createEvent(
        "Small Event",
        "Limited participants",
        "Test Organizer",
        SAMPLE_EVENT.eventDate,
        1 // Max 1 participant
      );

      const receipt = await tx.wait();
      const smallEventId = receipt.logs.find(
        log => log.fragment && log.fragment.name === "EventCreated"
      ).args[0];

      // Issue first certificate (should succeed)
      await certificateManager.connect(issuer1).issueCertificate(
        "First Participant",
        "first@example.com",
        smallEventId,
        SAMPLE_CERTIFICATE.ipfsHash
      );

      // Try to issue second certificate (should fail)
      await expect(
        certificateManager.connect(issuer1).issueCertificate(
          "Second Participant",
          "second@example.com",
          smallEventId,
          SAMPLE_CERTIFICATE.ipfsHash
        )
      ).to.be.revertedWith("Event has reached maximum participants");
    });
  });

  describe("Batch Certificate Issuance", function () {
    let eventId;

    beforeEach(async function () {
      await certificateManager.authorizeIssuer(issuer1.address);

      const tx = await certificateManager.connect(issuer1).createEvent(
        SAMPLE_EVENT.name,
        SAMPLE_EVENT.description,
        SAMPLE_EVENT.organizerName,
        SAMPLE_EVENT.eventDate,
        SAMPLE_EVENT.maxParticipants
      );

      const receipt = await tx.wait();
      eventId = receipt.logs.find(
        log => log.fragment && log.fragment.name === "EventCreated"
      ).args[0];
    });

    it("Should batch issue certificates successfully", async function () {
      const participants = [
        "John Doe", "john@example.com",
        "Jane Smith", "jane@example.com",
        "Bob Johnson", "bob@example.com"
      ];

      const ipfsHashes = [
        "QmHash1", "QmHash2", "QmHash3"
      ];

      await certificateManager.connect(issuer1).batchIssueCertificates(
        participants,
        eventId,
        ipfsHashes
      );

      expect(await certificateManager.getTotalCertificates()).to.equal(3);

      const event = await certificateManager.events(eventId);
      expect(event.participantCount).to.equal(3);
    });

    it("Should revert if participant data is invalid", async function () {
      const invalidParticipants = ["John Doe"]; // Odd number (missing email)
      const ipfsHashes = ["QmHash1"];

      await expect(
        certificateManager.connect(issuer1).batchIssueCertificates(
          invalidParticipants,
          eventId,
          ipfsHashes
        )
      ).to.be.revertedWith("Invalid participant data");
    });

    it("Should revert if array lengths don't match", async function () {
      const participants = [
        "John Doe", "john@example.com",
        "Jane Smith", "jane@example.com"
      ];
      const ipfsHashes = ["QmHash1"]; // Only one hash for two participants

      await expect(
        certificateManager.connect(issuer1).batchIssueCertificates(
          participants,
          eventId,
          ipfsHashes
        )
      ).to.be.revertedWith("Mismatched array lengths");
    });

    it("Should revert if batch would exceed maximum participants", async function () {
      // Create event with max 2 participants
      const tx = await certificateManager.connect(issuer1).createEvent(
        "Small Batch Event",
        "Limited participants",
        "Test Organizer",
        SAMPLE_EVENT.eventDate,
        2
      );

      const receipt = await tx.wait();
      const smallEventId = receipt.logs.find(
        log => log.fragment && log.fragment.name === "EventCreated"
      ).args[0];

      const participants = [
        "John Doe", "john@example.com",
        "Jane Smith", "jane@example.com",
        "Bob Johnson", "bob@example.com" // 3 participants for max 2 event
      ];
      const ipfsHashes = ["QmHash1", "QmHash2", "QmHash3"];

      await expect(
        certificateManager.connect(issuer1).batchIssueCertificates(
          participants,
          smallEventId,
          ipfsHashes
        )
      ).to.be.revertedWith("Would exceed maximum participants");
    });
  });

  describe("Certificate Verification", function () {
    let eventId;
    let certificateId;

    beforeEach(async function () {
      await certificateManager.authorizeIssuer(issuer1.address);

      // Create event
      const eventTx = await certificateManager.connect(issuer1).createEvent(
        SAMPLE_EVENT.name,
        SAMPLE_EVENT.description,
        SAMPLE_EVENT.organizerName,
        SAMPLE_EVENT.eventDate,
        SAMPLE_EVENT.maxParticipants
      );

      const eventReceipt = await eventTx.wait();
      eventId = eventReceipt.logs.find(
        log => log.fragment && log.fragment.name === "EventCreated"
      ).args[0];

      // Issue certificate
      const certTx = await certificateManager.connect(issuer1).issueCertificate(
        SAMPLE_CERTIFICATE.participantName,
        SAMPLE_CERTIFICATE.participantEmail,
        eventId,
        SAMPLE_CERTIFICATE.ipfsHash
      );

      const certReceipt = await certTx.wait();
      certificateId = certReceipt.logs.find(
        log => log.fragment && log.fragment.name === "CertificateIssued"
      ).args[0];
    });

    it("Should verify valid certificate", async function () {
      const [isValid, certificate] = await certificateManager.verifyCertificate(certificateId);

      expect(isValid).to.be.true;
      expect(certificate.id).to.equal(certificateId);
      expect(certificate.participantName).to.equal(SAMPLE_CERTIFICATE.participantName);
      expect(certificate.participantEmail).to.equal(SAMPLE_CERTIFICATE.participantEmail);
      expect(certificate.isRevoked).to.be.false;
    });

    it("Should fail to verify non-existent certificate", async function () {
      await expect(
        certificateManager.verifyCertificate(999)
      ).to.be.revertedWith("Certificate does not exist");
    });

    it("Should fail to verify revoked certificate", async function () {
      // Revoke the certificate
      await certificateManager.connect(issuer1).revokeCertificate(certificateId);

      const [isValid, certificate] = await certificateManager.verifyCertificate(certificateId);
      expect(isValid).to.be.false;
      expect(certificate.isRevoked).to.be.true;
    });

    it("Should verify certificate by data hash", async function () {
      const certificate = await certificateManager.certificates(certificateId);
      const dataHash = certificate.dataHash;

      const [isValid, verifiedCert] = await certificateManager.verifyCertificateByHash(dataHash);

      expect(isValid).to.be.true;
      expect(verifiedCert.id).to.equal(certificateId);
    });
  });

  describe("Certificate Revocation", function () {
    let eventId;
    let certificateId;

    beforeEach(async function () {
      await certificateManager.authorizeIssuer(issuer1.address);

      // Create event
      const eventTx = await certificateManager.connect(issuer1).createEvent(
        SAMPLE_EVENT.name,
        SAMPLE_EVENT.description,
        SAMPLE_EVENT.organizerName,
        SAMPLE_EVENT.eventDate,
        SAMPLE_EVENT.maxParticipants
      );

      const eventReceipt = await eventTx.wait();
      eventId = eventReceipt.logs.find(
        log => log.fragment && log.fragment.name === "EventCreated"
      ).args[0];

      // Issue certificate
      const certTx = await certificateManager.connect(issuer1).issueCertificate(
        SAMPLE_CERTIFICATE.participantName,
        SAMPLE_CERTIFICATE.participantEmail,
        eventId,
        SAMPLE_CERTIFICATE.ipfsHash
      );

      const certReceipt = await certTx.wait();
      certificateId = certReceipt.logs.find(
        log => log.fragment && log.fragment.name === "CertificateIssued"
      ).args[0];
    });

    it("Should allow issuer to revoke their certificate", async function () {
      await expect(
        certificateManager.connect(issuer1).revokeCertificate(certificateId)
      )
        .to.emit(certificateManager, "CertificateRevoked")
        .withArgs(certificateId, issuer1.address);

      const certificate = await certificateManager.certificates(certificateId);
      expect(certificate.isRevoked).to.be.true;
    });

    it("Should allow owner to revoke any certificate", async function () {
      await expect(
        certificateManager.connect(owner).revokeCertificate(certificateId)
      )
        .to.emit(certificateManager, "CertificateRevoked")
        .withArgs(certificateId, owner.address);

      const certificate = await certificateManager.certificates(certificateId);
      expect(certificate.isRevoked).to.be.true;
    });

    it("Should not allow unauthorized user to revoke certificate", async function () {
      await expect(
        certificateManager.connect(user1).revokeCertificate(certificateId)
      ).to.be.revertedWith("Not authorized to issue certificates");
    });

    it("Should not allow different issuer to revoke certificate", async function () {
      await certificateManager.authorizeIssuer(issuer2.address);

      await expect(
        certificateManager.connect(issuer2).revokeCertificate(certificateId)
      ).to.be.revertedWith("Not authorized to revoke this certificate");
    });

    it("Should not allow revoking already revoked certificate", async function () {
      await certificateManager.connect(issuer1).revokeCertificate(certificateId);

      await expect(
        certificateManager.connect(issuer1).revokeCertificate(certificateId)
      ).to.be.revertedWith("Certificate already revoked");
    });
  });

  describe("Data Retrieval", function () {
    let eventId;

    beforeEach(async function () {
      await certificateManager.authorizeIssuer(issuer1.address);

      const tx = await certificateManager.connect(issuer1).createEvent(
        SAMPLE_EVENT.name,
        SAMPLE_EVENT.description,
        SAMPLE_EVENT.organizerName,
        SAMPLE_EVENT.eventDate,
        SAMPLE_EVENT.maxParticipants
      );

      const receipt = await tx.wait();
      eventId = receipt.logs.find(
        log => log.fragment && log.fragment.name === "EventCreated"
      ).args[0];
    });

    it("Should return correct total statistics", async function () {
      // Issue some certificates
      await certificateManager.connect(issuer1).issueCertificate(
        "John Doe",
        "john@example.com",
        eventId,
        "QmHash1"
      );

      await certificateManager.connect(issuer1).issueCertificate(
        "Jane Smith",
        "jane@example.com",
        eventId,
        "QmHash2"
      );

      expect(await certificateManager.getTotalCertificates()).to.equal(2);
      expect(await certificateManager.getTotalEvents()).to.equal(1);
    });

    it("Should return participant certificates correctly", async function () {
      const email = "participant@example.com";

      // Issue multiple certificates for same participant
      await certificateManager.connect(issuer1).issueCertificate(
        "Test Participant",
        email,
        eventId,
        "QmHash1"
      );

      await certificateManager.connect(issuer1).issueCertificate(
        "Test Participant",
        email,
        eventId,
        "QmHash2"
      );

      const participantCerts = await certificateManager.getParticipantCertificates(email);
      expect(participantCerts.length).to.equal(2);
      expect(participantCerts[0]).to.equal(1);
      expect(participantCerts[1]).to.equal(2);
    });

    it("Should return event certificates correctly", async function () {
      // Issue certificates for the event
      await certificateManager.connect(issuer1).issueCertificate(
        "John Doe",
        "john@example.com",
        eventId,
        "QmHash1"
      );

      await certificateManager.connect(issuer1).issueCertificate(
        "Jane Smith",
        "jane@example.com",
        eventId,
        "QmHash2"
      );

      const eventCerts = await certificateManager.getEventCertificates(eventId);
      expect(eventCerts.length).to.equal(2);
      expect(eventCerts[0]).to.equal(1);
      expect(eventCerts[1]).to.equal(2);
    });
  });

  describe("Gas Optimization", function () {
    beforeEach(async function () {
      await certificateManager.authorizeIssuer(issuer1.address);
    });

    it("Should use reasonable gas for certificate issuance", async function () {
      const eventTx = await certificateManager.connect(issuer1).createEvent(
        SAMPLE_EVENT.name,
        SAMPLE_EVENT.description,
        SAMPLE_EVENT.organizerName,
        SAMPLE_EVENT.eventDate,
        SAMPLE_EVENT.maxParticipants
      );

      const eventReceipt = await eventTx.wait();
      const eventId = eventReceipt.logs.find(
        log => log.fragment && log.fragment.name === "EventCreated"
      ).args[0];

      const certTx = await certificateManager.connect(issuer1).issueCertificate(
        SAMPLE_CERTIFICATE.participantName,
        SAMPLE_CERTIFICATE.participantEmail,
        eventId,
        SAMPLE_CERTIFICATE.ipfsHash
      );

      const certReceipt = await certTx.wait();

      // Gas usage should be reasonable (less than 200k gas)
      expect(certReceipt.gasUsed).to.be.lessThan(200000);
    });

    it("Should be more efficient for batch operations", async function () {
      const eventTx = await certificateManager.connect(issuer1).createEvent(
        SAMPLE_EVENT.name,
        SAMPLE_EVENT.description,
        SAMPLE_EVENT.organizerName,
        SAMPLE_EVENT.eventDate,
        SAMPLE_EVENT.maxParticipants
      );

      const eventReceipt = await eventTx.wait();
      const eventId = eventReceipt.logs.find(
        log => log.fragment && log.fragment.name === "EventCreated"
      ).args[0];

      // Single certificate gas usage
      const singleTx = await certificateManager.connect(issuer1).issueCertificate(
        "Single User",
        "single@example.com",
        eventId,
        "QmSingleHash"
      );
      const singleReceipt = await singleTx.wait();

      // Batch certificate gas usage (3 certificates)
      const participants = [
        "User 1", "user1@example.com",
        "User 2", "user2@example.com",
        "User 3", "user3@example.com"
      ];
      const ipfsHashes = ["QmHash1", "QmHash2", "QmHash3"];

      const batchTx = await certificateManager.connect(issuer1).batchIssueCertificates(
        participants,
        eventId,
        ipfsHashes
      );
      const batchReceipt = await batchTx.wait();

      // Batch should be more efficient than 3 individual transactions
      const expectedIndividualGas = singleReceipt.gasUsed * BigInt(3);
      expect(batchReceipt.gasUsed).to.be.lessThan(expectedIndividualGas);
    });
  });

  describe("Edge Cases and Error Handling", function () {
    beforeEach(async function () {
      await certificateManager.authorizeIssuer(issuer1.address);
    });

    it("Should handle empty string inputs gracefully", async function () {
      // Should still work with empty strings (contract doesn't validate string content)
      const tx = await certificateManager.connect(issuer1).createEvent(
        "", // Empty name
        "",
        "",
        SAMPLE_EVENT.eventDate,
        1
      );

      const receipt = await tx.wait();
      const eventId = receipt.logs.find(
        log => log.fragment && log.fragment.name === "EventCreated"
      ).args[0];

      expect(eventId).to.equal(1);
    });

    it("Should handle maximum uint256 values", async function () {
      const maxUint256 = ethers.MaxUint256;

      await certificateManager.connect(issuer1).createEvent(
        "Max Event",
        "Testing max values",
        "Test Organizer",
        maxUint256, // Max event date
        maxUint256  // Max participants
      );

      const event = await certificateManager.events(1);
      expect(event.eventDate).to.equal(maxUint256);
      expect(event.maxParticipants).to.equal(maxUint256);
    });

    it("Should handle very long strings", async function () {
      const longString = "a".repeat(1000);

      await certificateManager.connect(issuer1).createEvent(
        longString,
        longString,
        longString,
        SAMPLE_EVENT.eventDate,
        SAMPLE_EVENT.maxParticipants
      );

      const event = await certificateManager.events(1);
      expect(event.name).to.equal(longString);
    });
  });
});
