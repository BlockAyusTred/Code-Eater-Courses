const HelloTesting = artifacts.require("HelloTesting");

module.exports = function (deployer) {
    deployer.deploy(HelloTesting);
}