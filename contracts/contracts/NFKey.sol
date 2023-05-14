// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NFKey is Ownable, EIP712, ERC721URIStorage {
     bytes32 private constant KEY_TYPEHASH = keccak256("Key(string tokenUri,uint256 startTime,uint256 endTime)");
    using Counters for Counters.Counter;
   

    struct Key {
        string tokenUri;
        uint256 startTime;
        uint256 endTime;
    }

    Counters.Counter private _tokenIds;
     string public sharedMetadata;

    string private constant SIGNING_DOMAIN = "NFKey";
    string private constant SIGNATURE_VERSION = "1";
    
    mapping(bytes => bool) public usedSignatures;
    mapping(uint256 => bytes) public tokenSignatures;

    mapping(bytes => bool) public blacklistedSignatures;


    constructor(string memory name, string memory symbol, string memory _sharedMetadata) ERC721(name, symbol) EIP712(SIGNING_DOMAIN, SIGNATURE_VERSION) {
        sharedMetadata = _sharedMetadata;
    }


    

    function mint(Key calldata key, address receiver, bytes calldata signature) public {
        require(!blacklistedSignatures[signature]);
        require(!usedSignatures[signature], "Signature already used");
        address signer = recoverSigner(key, signature);
        require(owner() == signer, "Invalid issuer");
         _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        // Mint the tokens
        _mint(receiver, newItemId);
        _setTokenURI(newItemId, key.tokenUri);
        tokenSignatures[newItemId] = signature;
    }

    function revokeAccess(bytes calldata signature) public onlyOwner() {
        blacklistedSignatures[signature] = true;
    }



    function getKeyHash(Key memory _key) public pure returns (bytes32) {
        bytes32 tokenUriHash = keccak256(bytes(_key.tokenUri));
        return keccak256(abi.encode(KEY_TYPEHASH, tokenUriHash, _key.startTime, _key.endTime));
    }

    function recoverSigner(Key calldata _key, bytes calldata _signature) public view returns (address) {
        bytes32 digest = _hashTypedDataV4(getKeyHash(_key));
        address signer = ECDSA.recover(digest, _signature);
        return signer;
    }
}
