const Ebay = artifacts.require("Ebay");

const { expectRevert } = require("@openzeppelin/test-helpers");

contract("Ebay", (accounts) => {
  let ebay;

  beforeEach(async () => {
    ebay = await Ebay.new();
  });

  const auction = {
    name: "auciton1",
    description: "Selling item1",
    min: 10,
  };

  const [seller, buyer1, buyer2] = [accounts[0], accounts[1], accounts[2]];

  it("should create auction", async () => {
    let auctions;
    await ebay.createAuction(auction.name, auction.description, auction.min);
    auctions = await ebay.getAuctions();
    assert(auctions.length === 1);
    assert(auctions[0].name === auction.name);
    assert(auctions[0].description === auction.description);
    assert(parseInt(auctions[0].min) === auction.min);
  });

  it("should not create an offer if auction does not exist", async () => {
    await expectRevert(
      ebay.createOffer(1, { from: buyer1, value: auction.min + 10 }),
      "invalid auction id"
    );
  });

  it("should not create an offer if price is too low", async () => {
    await ebay.createAuction(auction.name, auction.description, auction.min);
    await expectRevert(
        ebay.createOffer(1, { from: buyer1, value: auction.min - 2 }),
        "msg.value must be greater than the minumum auction price and best offer price"
      );
  });

  it("should create an offer", async () => {
    await ebay.createAuction(auction.name, auction.description, auction.min);
    await ebay.createOffer(1, {from:buyer1, value: auction.min + 1});

    const userOffer = await ebay.getUserOffers(buyer1);
    assert(userOffer.length === 1);
    assert(parseInt(userOffer[0].id) === 1);
    assert(parseInt(userOffer[0].auctionId) === 1);
    assert(userOffer[0].buyer === buyer1);
    assert(parseInt(userOffer[0].price) === auction.min+1);
  });

  it("should not transact if auction does not exists", async () => {
    await expectRevert(
        ebay.transaction(1),
        "invalid auction id"
      );
  });

  it("should do transaction", async () => {
    const bestPrice = web3.utils.toBN(auction.min +10); // converting to Big number
    await ebay.createAuction(auction.name, auction.description, auction.min);
    await ebay.createOffer(1, {from:buyer1, value: auction.min});
    await ebay.createOffer(1, {from:buyer2, value: bestPrice});
    const balanceBefore = web3.utils.toBN(await web3.eth.getBalance(seller));

    await ebay.transaction(1, {from: accounts[3]});

    const balanceAfter = web3.utils.toBN(await web3.eth.getBalance(seller));

    assert(balanceAfter.sub(balanceBefore).eq(bestPrice));

  });
});
