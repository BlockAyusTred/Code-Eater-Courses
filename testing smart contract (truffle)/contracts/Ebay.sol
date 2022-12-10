// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Ebay {
    struct Auction {
        uint id;
        address payable seller;
        string name;
        string description;
        uint min;
        uint bestOfferId;
        uint[] offerIds;
    }

    struct Offer {
        uint id;
        uint auctionId;
        address payable buyer;
        uint price;
    }

    mapping(uint => Auction) private auctions;
    mapping(uint => Offer) private offers;
    mapping(address => uint[]) private auctionList;
    mapping(address => uint[]) private offerList;

    uint private newAuctionId = 1;
    uint private newOfferId = 1;

    function createAuction(
        string calldata _name,
        string calldata _description,
        uint _min
    ) external {
        require(_min > 0, "min should be greater than 0");
        uint[] memory offerIds = new uint[](0);
        auctions[newAuctionId] = Auction(
            newAuctionId,
            payable(msg.sender),
            _name,
            _description,
            _min,
            0,
            offerIds
        );
        auctionList[msg.sender].push(newAuctionId);
        newAuctionId++;
    }

    function createOffer(uint _auctionId) external payable auctionExists(_auctionId) {
        Auction storage auction = auctions[_auctionId];
        Offer storage bestOffer = offers[auction.bestOfferId];

        require(msg.value >= auction.min && msg.value > bestOffer.price, "msg.value must be greater than the minumum auction price and best offer price");
        auction.bestOfferId = newOfferId;
        auction.offerIds.push(newOfferId);

        offers[newOfferId] = Offer(_auctionId,newOfferId,payable(msg.sender),msg.value);
        offerList[msg.sender].push(newOfferId);
        newOfferId++;
    }

    function transaction(uint _auctionId) external auctionExists(_auctionId){
        Auction storage auction = auctions[_auctionId];
        Offer storage bestOffer = offers[auction.bestOfferId];

        for (uint i = 0; i < auction.offerIds.length; i++) {
            uint offerId = auction.offerIds[i];    

            if(offerId != auction.bestOfferId) {
                Offer storage offer = offers[offerId];
                offer.buyer.transfer(offer.price);
            }
        }

        auction.seller.transfer(bestOffer.price);
    }

    function getAuctions() external view returns (Auction[] memory) {
        Auction[] memory _auction = new Auction[](newAuctionId-1);

        for (uint i = 1; i < newAuctionId; i++) {
            _auction[i-1] = auctions[i];
        }

        return _auction;
    }

    function getUserOffers(address _user) external view returns (Offer[] memory) {
        uint[] storage userOfferIds = offerList[_user];
        Offer[] memory _offer = new Offer[](userOfferIds.length);

        for (uint i = 0; i < userOfferIds.length; i++) {
            _offer[i] = offers[userOfferIds[i]]; 
        }

        return _offer;
    }

    function getUserAuctions(address _user) external view returns (Auction[] memory) {
        uint[] storage userAuctionIds = auctionList[_user];
        Auction[] memory _auction = new Auction[](userAuctionIds.length);

        for (uint i = 0; i < userAuctionIds.length; i++) {
            _auction[i] = auctions[userAuctionIds[i]];
        }
        return _auction;
    }

    modifier auctionExists(uint _auctionId) {
        require(_auctionId >0 && _auctionId < newAuctionId, "invalid auction id");
        _;
    }
}
