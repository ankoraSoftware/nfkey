// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NFKey is Ownable, EIP712("NFKey", "1"), ERC721URIStorage() {

    using Counters for Counters.Counter;
   

    struct Key {
        string tokenUri;
        uint256 startTime;
        uint256 endTime;
        bytes signature;
    }

    event CreateToken(
        uint256 tokenId,
        uint256 supply,
        address indexed issuer
    );

    Counters.Counter private _tokenIds;
     string public sharedMetadata;

    
    mapping(uint256 => bytes) public tokenSignatures;

    constructor(string memory name, string memory symbol, string memory _sharedMetadata) ERC721(name, symbol) {
        sharedMetadata = _sharedMetadata;
    }

    

    function mint(Key calldata key) public {
        address signer = recoverKey(key);
        require(owner() == signer, "Invalid issuer");
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        // Mint the tokens
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, key.tokenUri);
        tokenSignatures[newItemId] = key.signature;
    }



    function recoverKey(Key calldata key) public view returns (address) {
        bytes32 digest = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    keccak256(
                        "Key(string tokenUri,uint256 startTime,uint256 endTime)"
                    ),
                    key.tokenUri,
                    key.startTime,
                    key.endTime
                )
            )
        );
        address signer = ECDSA.recover(digest, key.signature);
        return signer;
    }
}
