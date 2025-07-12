// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title CertificateManager
 * @dev Smart contract for managing digital certificates on Ethereum blockchain
 * @author IEEE SB NITC Certificate System
 */
contract CertificateManager is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;

    // Certificate structure
    struct Certificate {
        uint256 id;
        string participantName;
        string participantEmail;
        string eventName;
        string eventDescription;
        string organizerName;
        uint256 eventDate;
        uint256 issueDate;
        string ipfsHash; // IPFS hash for certificate image/PDF
        bytes32 dataHash; // Hash of certificate data for integrity
        bool isRevoked;
        address issuer;
    }

    // Event structure
    struct Event {
        uint256 id;
        string name;
        string description;
        string organizerName;
        uint256 eventDate;
        uint256 maxParticipants;
        uint256 participantCount;
        bool isActive;
        address organizer;
    }

    // Counters for unique IDs
    Counters.Counter private _certificateIds;
    Counters.Counter private _eventIds;

    // Mappings
    mapping(uint256 => Certificate) public certificates;
    mapping(uint256 => Event) public events;
    mapping(address => bool) public authorizedIssuers;
    mapping(bytes32 => uint256) public hashToCertificateId;
    mapping(string => uint256[]) public participantCertificates; // email => certificate IDs
    mapping(uint256 => uint256[]) public eventCertificates; // event ID => certificate IDs

    // Events
    event CertificateIssued(
        uint256 indexed certificateId,
        string indexed participantEmail,
        uint256 indexed eventId,
        address issuer
    );

    event CertificateRevoked(
        uint256 indexed certificateId,
        address indexed revoker
    );

    event EventCreated(
        uint256 indexed eventId,
        string name,
        address indexed organizer
    );

    event IssuerAuthorized(address indexed issuer);
    event IssuerRevoked(address indexed issuer);

    // Modifiers
    modifier onlyAuthorizedIssuer() {
        require(
            authorizedIssuers[msg.sender] || msg.sender == owner(),
            "Not authorized to issue certificates"
        );
        _;
    }

    modifier certificateExists(uint256 _certificateId) {
        require(
            _certificateId > 0 && _certificateId <= _certificateIds.current(),
            "Certificate does not exist"
        );
        _;
    }

    modifier eventExists(uint256 _eventId) {
        require(
            _eventId > 0 && _eventId <= _eventIds.current(),
            "Event does not exist"
        );
        _;
    }

    constructor() {
        // Owner is automatically authorized
        authorizedIssuers[msg.sender] = true;
    }

    /**
     * @dev Create a new event
     * @param _name Event name
     * @param _description Event description
     * @param _organizerName Organizer name
     * @param _eventDate Event date (timestamp)
     * @param _maxParticipants Maximum number of participants
     */
    function createEvent(
        string memory _name,
        string memory _description,
        string memory _organizerName,
        uint256 _eventDate,
        uint256 _maxParticipants
    ) external onlyAuthorizedIssuer returns (uint256) {
        _eventIds.increment();
        uint256 eventId = _eventIds.current();

        events[eventId] = Event({
            id: eventId,
            name: _name,
            description: _description,
            organizerName: _organizerName,
            eventDate: _eventDate,
            maxParticipants: _maxParticipants,
            participantCount: 0,
            isActive: true,
            organizer: msg.sender
        });

        emit EventCreated(eventId, _name, msg.sender);
        return eventId;
    }

    /**
     * @dev Issue a new certificate
     * @param _participantName Participant's name
     * @param _participantEmail Participant's email
     * @param _eventId Event ID
     * @param _ipfsHash IPFS hash of certificate file
     */
    function issueCertificate(
        string memory _participantName,
        string memory _participantEmail,
        uint256 _eventId,
        string memory _ipfsHash
    ) external onlyAuthorizedIssuer eventExists(_eventId) returns (uint256) {
        Event storage eventData = events[_eventId];
        require(eventData.isActive, "Event is not active");
        require(
            eventData.participantCount < eventData.maxParticipants,
            "Event has reached maximum participants"
        );

        _certificateIds.increment();
        uint256 certificateId = _certificateIds.current();

        // Create hash of certificate data for integrity verification
        bytes32 dataHash = keccak256(
            abi.encodePacked(
                _participantName,
                _participantEmail,
                _eventId,
                block.timestamp
            )
        );

        certificates[certificateId] = Certificate({
            id: certificateId,
            participantName: _participantName,
            participantEmail: _participantEmail,
            eventName: eventData.name,
            eventDescription: eventData.description,
            organizerName: eventData.organizerName,
            eventDate: eventData.eventDate,
            issueDate: block.timestamp,
            ipfsHash: _ipfsHash,
            dataHash: dataHash,
            isRevoked: false,
            issuer: msg.sender
        });

        // Update mappings
        hashToCertificateId[dataHash] = certificateId;
        participantCertificates[_participantEmail].push(certificateId);
        eventCertificates[_eventId].push(certificateId);

        // Update event participant count
        eventData.participantCount++;

        emit CertificateIssued(certificateId, _participantEmail, _eventId, msg.sender);
        return certificateId;
    }

    /**
     * @dev Batch issue certificates
     * @param _participants Array of participant data
     * @param _eventId Event ID
     * @param _ipfsHashes Array of IPFS hashes
     */
    function batchIssueCertificates(
        string[] memory _participants, // [name1, email1, name2, email2, ...]
        uint256 _eventId,
        string[] memory _ipfsHashes
    ) external onlyAuthorizedIssuer eventExists(_eventId) {
        require(_participants.length % 2 == 0, "Invalid participant data");
        require(_ipfsHashes.length == _participants.length / 2, "Mismatched array lengths");

        uint256 participantCount = _participants.length / 2;
        Event storage eventData = events[_eventId];

        require(
            eventData.participantCount + participantCount <= eventData.maxParticipants,
            "Would exceed maximum participants"
        );

        for (uint256 i = 0; i < participantCount; i++) {
            string memory name = _participants[i * 2];
            string memory email = _participants[i * 2 + 1];
            string memory ipfsHash = _ipfsHashes[i];

            issueCertificate(name, email, _eventId, ipfsHash);
        }
    }

    /**
     * @dev Verify a certificate by ID
     * @param _certificateId Certificate ID to verify
     */
    function verifyCertificate(uint256 _certificateId)
        external
        view
        certificateExists(_certificateId)
        returns (
            bool isValid,
            Certificate memory certificate
        )
    {
        Certificate memory cert = certificates[_certificateId];
        isValid = !cert.isRevoked;
        return (isValid, cert);
    }

    /**
     * @dev Verify certificate by data hash
     * @param _dataHash Hash of certificate data
     */
    function verifyCertificateByHash(bytes32 _dataHash)
        external
        view
        returns (
            bool isValid,
            Certificate memory certificate
        )
    {
        uint256 certificateId = hashToCertificateId[_dataHash];
        require(certificateId > 0, "Certificate not found");

        Certificate memory cert = certificates[certificateId];
        isValid = !cert.isRevoked;
        return (isValid, cert);
    }

    /**
     * @dev Revoke a certificate
     * @param _certificateId Certificate ID to revoke
     */
    function revokeCertificate(uint256 _certificateId)
        external
        certificateExists(_certificateId)
        onlyAuthorizedIssuer
    {
        Certificate storage cert = certificates[_certificateId];
        require(!cert.isRevoked, "Certificate already revoked");
        require(
            cert.issuer == msg.sender || msg.sender == owner(),
            "Not authorized to revoke this certificate"
        );

        cert.isRevoked = true;
        emit CertificateRevoked(_certificateId, msg.sender);
    }

    /**
     * @dev Get certificates for a participant
     * @param _participantEmail Participant's email
     */
    function getParticipantCertificates(string memory _participantEmail)
        external
        view
        returns (uint256[] memory)
    {
        return participantCertificates[_participantEmail];
    }

    /**
     * @dev Get certificates for an event
     * @param _eventId Event ID
     */
    function getEventCertificates(uint256 _eventId)
        external
        view
        returns (uint256[] memory)
    {
        return eventCertificates[_eventId];
    }

    /**
     * @dev Authorize an address to issue certificates
     * @param _issuer Address to authorize
     */
    function authorizeIssuer(address _issuer) external onlyOwner {
        authorizedIssuers[_issuer] = true;
        emit IssuerAuthorized(_issuer);
    }

    /**
     * @dev Revoke issuer authorization
     * @param _issuer Address to revoke
     */
    function revokeIssuer(address _issuer) external onlyOwner {
        authorizedIssuers[_issuer] = false;
        emit IssuerRevoked(_issuer);
    }

    /**
     * @dev Get total number of certificates issued
     */
    function getTotalCertificates() external view returns (uint256) {
        return _certificateIds.current();
    }

    /**
     * @dev Get total number of events created
     */
    function getTotalEvents() external view returns (uint256) {
        return _eventIds.current();
    }

    /**
     * @dev Deactivate an event
     * @param _eventId Event ID to deactivate
     */
    function deactivateEvent(uint256 _eventId)
        external
        eventExists(_eventId)
        onlyAuthorizedIssuer
    {
        Event storage eventData = events[_eventId];
        require(
            eventData.organizer == msg.sender || msg.sender == owner(),
            "Not authorized to deactivate this event"
        );
        eventData.isActive = false;
    }

    /**
     * @dev Emergency pause - only owner can call
     */
    function pause() external onlyOwner {
        // Implementation for emergency pause if needed
        // This would require adding Pausable from OpenZeppelin
    }
}
