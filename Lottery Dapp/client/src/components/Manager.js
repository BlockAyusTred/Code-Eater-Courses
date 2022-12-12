import React, { useState, useEffect } from "react";
import "./Manager.css";

const Manager = ({ state }) => {
  const [account, setAccount] = useState("");
  const [cBalance, setCBalance] = useState(0);
  const [lWinner, setLWinner] = useState("No winner yet");

  const setAccountListener = (provider)=> {
    provider.on("accountsChanged",(accounts)=>{
        setAccount(accounts[0]);
    })
  }

  useEffect(() => {
    const getAccount = async () => {
      const { web3 } = state;
      const accounts = await web3.eth.getAccounts();
      console.log(accounts);
      setAccountListener(web3.givenProvider);
      setAccount(accounts[0]);
    };
    state.web3 && getAccount(); // if we have state.web3 then only we want to call getAccount function
  }, [state, state.web3]);

  const contractBalance = async () => {
    const { contract } = state;
    try {
      const balance = await contract.methods
        .getBalance()
        .call({ from: account });
      console.log(balance);
      setCBalance(balance);
    } catch (error) {
      setCBalance("You are not the manager");
    }
  };

  const winner = async () => {
    const { contract } = state;
    try {
      await contract.methods.pickWinner().send({ from: account });
      const lotteryWinner = await contract.methods.winner().call();
      console.log(lotteryWinner);
      setLWinner(lotteryWinner);
    } catch (error) {
      if (error.message.includes("You are not the manager")) {
        setLWinner("You are not the manager");
      } else if (error.message.includes("Players are less than 3")) {
        setLWinner("Players are less than 3");
      } else {
        setLWinner("No winner yet");
      }
    }
  };

  return (
    <ul className="list-group" id="list">
      <div className="center">
        <li className="list-group-item" aria-disabled="true">
          <b>Connected account :</b> {account}
        </li>
        <li className="list-group-item">
          <b> Winner : </b>
          {lWinner}
          <button className="button1" onClick={winner}>
            Click For Winner
          </button>
        </li>
        <li className="list-group-item">
          <b>Balnace : </b> {cBalance} ETH
          <button className="button1" onClick={contractBalance}>
            Click For Balance
          </button>
        </li>
      </div>
    </ul>
  );
};

export default Manager;
