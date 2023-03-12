// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract ImageNFT is ERC721URIStorage {
    // Counter for generating token IDs
    uint256 private _tokenIdCounter = 0;

    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) {}

    function mint(
        address to,
        string memory tokenURI,
        string memory image
    ) public returns (uint256) {
        // Generate a new token ID
        uint256 newTokenId = _tokenIdCounter;

        // Mint the new NFT and set the token URI
        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        // Set the image metadata
        bytes memory imageBytes = bytes(image);
        require(imageBytes.length > 0, "ImageNFT: image is empty");
        metadata[newTokenId] = image;

        // Increment the token ID counter
        _tokenIdCounter++;

        // Return the new token ID
        return newTokenId;
    }

    // Mapping to store the image metadata for each token ID
    mapping(uint256 => string) public metadata;
}
