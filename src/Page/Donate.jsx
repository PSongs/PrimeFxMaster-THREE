import React, { useState, useEffect } from "react";
import logo from "../assets/NAV.png";
import "./donate.css";
import { Link } from "react-router-dom";
import USD from "../assets/USD.jpeg";
import BTC from "../assets/BTC.jpeg";
import ETH from "../assets/ETH.jpeg";

const Donate = () => {
  const [selectedFrequency, setSelectedFrequency] = useState("One-Time-Gift");
  const [selectedAmount, setSelectedAmount] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [showDialog2, setShowDialog2] = useState(true); // Set initial state to true
  const [payment, setPayment] = useState("");
  const [showDialog3, setShowDialog3] = useState(false);
  const [showDialog4, setShowDialog4] = useState(false);

  const handleFrequencyClick = (frequency) => {
    setSelectedFrequency(frequency);
  };

  const handleCopyClick = () => {
    navigator.clipboard
      .writeText("0x6B018D8fC09802df5eA09B64DE66f0bF2860bDBb")
      .then(() => {
        // window.location.href = 'https://www.usdt.com';
      });
  };

  const handleCopyClick2 = () => {
    navigator.clipboard
      .writeText("bc1qulq5stzqurc0d8m7hmwgktygqxevk0dsr8rxg2")
      .then(() => {});
  };

  const handleCopyClick3 = () => {
    navigator.clipboard
      .writeText("0x6B018D8fC09802df5eA09B64DE66f0bF2860bDBb") 
      .then(() => {});
  };

  const handleAmountClick = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount(""); // Clear custom amount when a predefined amount is selected
  };

  const handleDonateClick = () => {
    if (selectedAmount && selectedFrequency && payment) {
      if (payment === "usdt") {
        setShowDialog(true);
      } else if (payment === "crypto") {
        setShowDialog3(true);
      } else if (payment === "crypto1"){
        setShowDialog4(true)
      }
    } else {
      alert("Please select an amount, a frequency, and a payment method.");
    }
  };

  const handleCustomAmountChange = (event) => {
    const value = event.target.value;
    if (!isNaN(value) && value.trim() !== "") {
      setCustomAmount(value);
      setSelectedAmount(`${value}$`);
    } else if (value === "") {
      setCustomAmount("");
      setSelectedAmount("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formDataToSend = new FormData(event.target);
    const url = "https://formspree.io/f/xjvndknd";
    try {
      const response = await fetch(url, {
        method: "POST",
        body: formDataToSend,
        headers: {
          Accept: "application/json",
        },
      });
      if (response.ok) {
        setShowDialog2(false); // Update showDialog2 instead of showDialog
      } else {
        alert("Thank You For Your Kindness One More Step");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Thank You For Your Kindness One More Step");
    }
  };

  return (
    <div className="donate">
      <div className="donateNav">
        <Link to={"/"}>
          <img src={logo} alt="" />
        </Link>
        {/* <div>
          <img src={fourStar} alt="" />
          <img src={toprated} alt="" />
        </div> */}
      </div>
      <div className="bill">
        {/* <div>
          <h1>GIFT FREQUENCY</h1>
        </div> */}
        <div className="btnss">
          <div className="btnd">
            <button
              className={`frequency-button ${
                selectedFrequency === "One-Time-Gift" ? "selected" : ""
              }`}
              onClick={() => handleFrequencyClick("One-Time-Gift")}
            >
              Deposit
            </button>
            {/* <button
              className={`frequency-button ${
                selectedFrequency === "Monthly Gifts" ? "selected" : ""
              }`}
              onClick={() => handleFrequencyClick("Monthly Gifts")}
            >
              Monthly Gift
            </button> */}
          </div>

          {selectedFrequency === "One-Time-Gift" && (
            <h1>
              Select any amount or input in the box.
            </h1>
          )}
        </div>
        <div className="billing">
          {["50$", "100$", "250$", "500$", "1000$", "2000$"].map((amount) => (
            <button
              key={amount}
              className={`billing-button ${
                selectedAmount === amount ? "selected" : ""
              }`}
              onClick={() => handleAmountClick(amount)}
            >
              {amount}
            </button>
          ))}
          <input
          className="Input"
            type="text"
            placeholder="Other Amounts"
            value={customAmount}
            onChange={handleCustomAmountChange}
          />
        </div>
        <div className="payment-method">
          <label className="Label">Payment Method</label>
          <select className="Select" value={payment} onChange={(e) => setPayment(e.target.value)}>
            <option className="SE" value="">Select Payment Method</option>
            <option className="SE" value="usdt">Usdt</option>
            <option className="SE" value="crypto">BTC</option>
            <option className="SE" value="crypto1">Etherium</option>
          </select>
        </div>
        <button type="button" onClick={handleDonateClick} className="donatebtn">
          Donate Now
        </button>

        <br />
        <br />
      </div>

      {showDialog && (
        <div className="dialog">
          <div className="dialog-content">
            <p>
              Thank you for your deposit of {selectedAmount} as a{" "}
              {selectedFrequency.replace("-", " ")};
              <br />
              <br />
              <img src={USD} alt="" className='crypto' />
              <p className="PP">
              0x6B018D8fC09802df5eA09B64DE66f0bF2860bDBb
              </p>{" "}
              <br />
              <p className="PP2">
                NOTICE!!
                <br />
                Send as USDT
              </p>
            </p>
            <button className="Button" onClick={handleCopyClick}>Copy Wallet Adress</button>
          </div>
        </div>
      )}

      {showDialog3 && (
        <div className="dialog">
          <div className="dialog-content">
            <p>
              Thank you for your deposit of {selectedAmount} as a{" "}
              {selectedFrequency.replace("-", " ")};
              <br />
              <br />
              <img src={BTC} alt="" className='crypto' />
              <p className="PP">
                bc1qulq5stzqurc0d8m7hmwgktygqxevk0dsr8rxg2
              </p>{" "}
              <br />
              <p className="PP2">
                NOTICE!!
                <br />
                Send as BTC
              </p>
            </p>
            <button className="Button" onClick={handleCopyClick2}>Copy Wallet Adress</button>
          </div>
        </div>
      )}

      {showDialog4 && (
        <div className="dialog">
          <div className="dialog-content">
            <p>
              Thank you for your deposit of {selectedAmount} as a{" "}
              {selectedFrequency.replace("-", " ")};
              <br />
              <br />
              <img src={ETH} alt="" className='crypto' />
              <p className="PP">
              0x6B018D8fC09802df5eA09B64DE66f0bF2860bDBb
              </p>{" "}
              <br />
              <p className="PP2">
                NOTICE!!
                <br />
                Send as ETHERIUM
              </p>
            </p>
            <button className="Button" onClick={handleCopyClick3}>Copy Wallet Adress</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Donate;
