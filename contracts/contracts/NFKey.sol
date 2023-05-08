// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract NFKey is ERC1155(""), Ownable, EIP712("NFKey", "1") {
    struct TokenMetadata {
        string uri;
        uint256 totalSupply;
        uint256 currentSupply;
        address issuer;
    }

    struct Key {
        uint256 tokenId;
        uint256 amount;
        uint256 startTime;
        uint256 endTime;
        bytes signature;
    }

    event CreateToken(
        uint256 tokenId,
        uint256 supply,
        address indexed issuer
    );

    mapping(uint256 => TokenMetadata) private _tokenMetadata;
    uint256 private tokenIdCounter = 0;

    constructor() {
        // Set the base URI for the metadata
        _setURI("ipfs://");
    }

    function createToken(
        uint256 amount,
        string memory tokenUri
    ) public {
        uint256 tokenId = tokenIdCounter;
        // Store token metadata
        _tokenMetadata[tokenId] = TokenMetadata(
            tokenUri,
            amount,
            0,
            msg.sender
        );
        tokenIdCounter++;
        emit CreateToken(tokenId, amount, msg.sender);
    }

    function mint(Key calldata key, bytes memory data) public {
        TokenMetadata memory metadata = _tokenMetadata[key.tokenId];
        require(metadata.totalSupply > 0, "Invalid token");
        address signer = recoverKey(key);
        require(metadata.issuer == signer, "Invalid issuer");
        require(
            metadata.currentSupply + key.amount <= metadata.totalSupply,
            "Invalid supply"
        );
        // Mint the tokens
        _mint(msg.sender, key.tokenId, key.amount, data);
        metadata.currentSupply += key.amount;
        _tokenMetadata[key.tokenId] = metadata;
    }

    function uri(uint256 id) public view override returns (string memory) {
        // Get the token metadata for the ID
        TokenMetadata memory metadata = _tokenMetadata[id];

        // If the token metadata exists, return the full URI for the token
        if (bytes(metadata.uri).length > 0) {
            return string(abi.encodePacked(super.uri(id), metadata.uri));
        }

        // If the token metadata doesn't exist, fall back to the base URI
        return super.uri(id);
    }

    function recoverKey(Key calldata key) public view returns (address) {
        bytes32 digest = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    keccak256(
                        "Key(uint256 tokenId,uint256 amount,uint256 startTime,uint256 endTime)"
                    ),
                    key.tokenId,
                    key.amount,
                    key.startTime,
                    key.endTime
                )
            )
        );
        address signer = ECDSA.recover(digest, key.signature);
        return signer;
    }
}
