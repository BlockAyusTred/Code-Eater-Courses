const Storage = artifacts.require("Storage");

contract("Storage", () => {
    let storage;

    beforeEach(async () => {
        storage = await Storage.deployed();
    })
    it("should set the item to Hello World", async () => {
        await storage.set("Hello World");
        const result = await storage.get();
        assert(result === "Hello World");
    })
})