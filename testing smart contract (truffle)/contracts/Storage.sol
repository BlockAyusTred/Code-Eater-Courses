// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Storage {
    string public item;

    function set(string memory _item) public {
        item = _item;
    }

    function get() public view returns (string memory) {
        return item;
    }
}