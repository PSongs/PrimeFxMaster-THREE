import { ColorType, createChart } from 'lightweight-charts';
import React, { useEffect, useRef, useState } from 'react';
import { db, useAuthState } from '../config/firebase'; // Adjust the import path as necessary
import { collection, getDoc, updateDoc, doc, getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth';
import logo from "/src/assets/NAV.png";
import axios from 'axios';
import {  onAuthStateChanged } from 'firebase/auth';


const Chart = () => {
  const chartContainer = useRef(null);

const auth = getAuth();
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const smaSeriesRef = useRef(null);
  const dataRef = useRef([]);
  const [chartType, setChartType] = useState('candlestick');
  const [balance, setBalance] = useState(() => {
    const storedBalance = localStorage.getItem('balance');
    return storedBalance ? parseFloat(storedBalance) : 0; // Default to 0 if not set
  });
  const db = getFirestore();
  const [tradeHistory, setTradeHistory] = useState([]);
  const [openTrades, setOpenTrades] = useState(JSON.parse(localStorage.getItem('openTrades')) || []);
  const markersRef = useRef([]); // Track markers
  const currentUser = useAuthState();
  const [cryptos, setCryptos] = useState([]);
  const [prevPrices, setPrevPrices] = useState({});
  const [lotSize, setLotSize] = useState(0.1); // Initial lot size

  useEffect(() => {
    localStorage.setItem('balance', balance.toFixed(2));
  }, [balance]);

  useEffect(() => {
    localStorage.setItem('openTrades', JSON.stringify(openTrades));
  }, [openTrades]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Authenticated user:", user.uid);
        fetchDemoAccountData(user.uid);
      } else {
        console.error('User is not authenticated');
      }
    });
  
    return () => unsubscribe();
  }, []);
  

  const generateSlippage = () => {
    const maxSlippage = 0.02; // ±2% slippage
    return (Math.random() - 0.5) * 2 * maxSlippage;
  };
  
  const placeOrder = (crypto, action) => {
    if (!seriesRef.current) return; // Ensure series exists
  
    const lastDataPoint = dataRef.current[dataRef.current.length - 1];
    const currentPrice = lastDataPoint.close;
    const tradeAmount = 100 * lotSize; // Amount per trade adjusted by lot size
    const slippage = generateSlippage(); // Use realistic slippage
  
    const newTrade = {
      action,
      amount: tradeAmount,
      openPrice: parseFloat(currentPrice) + slippage,
      time: lastDataPoint.time,
      floatingPL: 0, // Initialize floatingPL
      crypto: crypto.name, // Store the name of the cryptocurrency
      cryptoImage: crypto.image, // Store the image of the cryptocurrency
    };
  
    setOpenTrades([...openTrades, newTrade]);
  
    // Add marker to indicate the trade on the chart
    markersRef.current.push({
      time: lastDataPoint.time,
      position: action === 'buy' ? 'belowBar' : 'aboveBar',
      color: action === 'buy' ? '#43a047' : '#ef5350',
      shape: 'arrowUp',
      text: `${action.toUpperCase()} ${crypto.name} @ ${(parseFloat(currentPrice) + slippage).toFixed(2)}`,
    });
  
    seriesRef.current.setMarkers(markersRef.current);
  };
  
  useEffect(() => {
    const cryptoList = [
      { name: 'Bitcoin', symbol: 'bitcoin' },
      { name: 'Ethereum', symbol: 'ethereum' },
      { name: 'Ripple', symbol: 'ripple' },
      { name: 'Litecoin', symbol: 'litecoin' },
      { name: 'Cardano', symbol: 'cardano' },
      { name: 'Polkadot', symbol: 'polkadot' },
      { name: 'Stellar', symbol: 'stellar' },
      { name: 'Chainlink', symbol: 'chainlink' },
      { name: 'Dogecoin', symbol: 'dogecoin' },
      { name: 'Solana', symbol: 'solana' },
      { name: 'Uniswap', symbol: 'uniswap' },
      { name: 'VeChain', symbol: 'vechain' },
      { name: 'TRON', symbol: 'tron' },
      { name: 'EOS', symbol: 'eos' },
      { name: 'Monero', symbol: 'monero' },
      { name: 'Aave', symbol: 'aave' },
      { name: 'Cosmos', symbol: 'cosmos' },
      { name: 'Tezos', symbol: 'tezos' },
      { name: 'Neo', symbol: 'neo' },
      { name: 'IOTA', symbol: 'iota' },
    ];

    const fetchCryptoData = async () => {
      try {
        const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
          params: {
            vs_currency: 'usd',
            ids: cryptoList.map(crypto => crypto.symbol).join(','),
          },
        });

        const cryptoData = response.data.map(crypto => ({
          name: crypto.name,
          symbol: crypto.symbol,
          price: crypto.current_price.toFixed(2),
          image: crypto.image,
        }));

        setCryptos(cryptoData);
        setPrevPrices(cryptoData.reduce((acc, crypto) => {
          acc[crypto.symbol] = crypto.price;
          return acc;
        }, {}));
      } catch (error) {
        console.error('Error fetching crypto data:', error);
      }
    };

    fetchCryptoData();

    const interval = setInterval(() => {
      setCryptos(prevCryptos => {
        const updatedCryptos = prevCryptos.map(crypto => {
          const newPrice = (Math.random() * (60000 - 1000) + 1000).toFixed(2);
          return {
            ...crypto,
            price: newPrice,
          };
        });

        setPrevPrices(prevCryptos.reduce((acc, crypto) => {
          acc[crypto.symbol] = crypto.price;
          return acc;
        }, {}));

        return updatedCryptos;
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);
  // Fetch account details from Firestore on mount

  const fetchDemoAccountData = async (userId) => {
    try {
      const demoAccountDocRef = doc(db, "users", userId, "accounts", "Demo");
      const demoAccountDoc = await getDoc(demoAccountDocRef);
      
      if (demoAccountDoc.exists()) {
        console.log("Document data:", demoAccountDoc.data());
        return demoAccountDoc.data();
      } else {
        console.error("No such document found for user ID:", userId);
        return null;
      }
    } catch (error) {
      console.error("Error fetching demo account data:", error);
      return null;
    }
  };
  

  

  




  const updateDemoAccountBalance = async (profitOrLoss) => {
    try {
      if (!currentUser) return;
      const demoAccountData = await fetchDemoAccountData(currentUser.uid);
      if (demoAccountData) {
        const currentBalance = demoAccountData.balance || 0;
        const newBalance = currentBalance + profitOrLoss;

        await updateDoc(doc(db, "users", currentUser.uid, "accounts", "Demo"), {
          balance: newBalance,
        });

        console.log("Demo account balance updated:", newBalance);
      } else {
        console.log("Demo account data not found.");
      }
    } catch (error) {
      console.error("Error updating demo account balance:", error);
    }
  };





  
  

  // Update account details in Firestore
// Update account details in Firestore
const updateAccountDetails = async (updatedBalance, updatedTradeHistory) => {
  if (currentUser) {
    try {
      const demoAccountDocRef = doc(db, "users", currentUser.uid, "accounts", "Demo");
      await updateDoc(demoAccountDocRef, {
        balance: updatedBalance,
        tradeHistory: updatedTradeHistory,
      });
      console.log("Demo account details updated in Firestore");
    } catch (error) {
      console.error("Error updating account details: ", error);
    }
  }
};


  // Store open trades in local storage
  useEffect(() => {
    localStorage.setItem('openTrades', JSON.stringify(openTrades));
  }, [openTrades]);

  // Handle trade action (buy/sell)
const handleTrade = (action) => {
    if (!seriesRef.current) return; // Ensure series exists

    const lastDataPoint = dataRef.current[dataRef.current.length - 1];
    const currentPrice = lastDataPoint.close;
    const tradeAmount = 100 * lotSize; // Amount per trade adjusted by lot size
    const slippage = (Math.random() - 0.5) * 0.01; // Simulate slippage

    const newTrade = {
      action,
      amount: tradeAmount,
      openPrice: currentPrice + slippage,
      time: lastDataPoint.time,
      floatingPL: 0, // Initialize floatingPL
    };


    setOpenTrades([...openTrades, newTrade]);

    // Add marker to indicate the trade on the chart
    markersRef.current.push({
      time: lastDataPoint.time,
      position: action === 'buy' ? 'belowBar' : 'aboveBar',
      color: action === 'buy' ? '#43a047' : '#ef5350',
      shape: 'arrowUp',
      text: `${action.toUpperCase()} @ ${(currentPrice + slippage).toFixed(2)}`,
    });

    seriesRef.current.setMarkers(markersRef.current);
  };

  // Close trade and update balance and trade history
  // Close trade and update balance and trade history
  const closeTrade = async (trade, currentPrice) => {
    const tradeResult = trade.action === 'buy'
      ? (currentPrice - trade.openPrice) * trade.amount
      : (trade.openPrice - currentPrice) * trade.amount;
  
    const newBalance = balance + tradeResult;
    const newTradeHistory = [
      ...tradeHistory,
      {
        ...trade,
        closePrice: currentPrice,
        result: tradeResult,
        success: tradeResult > 0,
      },
    ];
  
    setBalance(newBalance); // Update state, which triggers local storage update
    setTradeHistory(newTradeHistory);
  
    // Remove the closed trade from open trades
    setOpenTrades(openTrades.filter(t => t !== trade));
  
    // Add marker to indicate the trade close on the chart
    markersRef.current.push({
      time: dataRef.current[dataRef.current.length - 1].time,
      position: trade.action === 'buy' ? 'aboveBar' : 'belowBar',
      color: trade.action === 'buy' ? '#43a047' : '#ef5350',
      shape: 'arrowDown',
      text: `CLOSE @ ${currentPrice.toFixed(2)}`,
    });
  
    seriesRef.current.setMarkers(markersRef.current);
    setBalance(() => {
      const storedBalance = localStorage.getItem('balance');
      return storedBalance ? parseFloat(0) : 0; // Default to 0 if not set
    })
  };
  





  const calculateSMA = (data, period) => {
    let sum = 0;
    return data.map((d, i) => {
      sum += d.close;
      if (i >= period) {
        sum -= data[i - period].close;
      }
      return {
        time: d.time,
        value: i >= period - 1 ? sum / period : null,
      };
    }).filter(d => d.value !== null);
  };


  const generateInitialData = (numDays) => {
    const data = [];
    let currentTime = Math.floor(Date.now() / 1000) - numDays * 24 * 60 * 60; // Starting time (every day)
    let open = 1.1; // Starting open price for Forex
    let isGreen = true; // Start with a green bar

    for (let i = 0; i < numDays; i++) {
      let close = open + (Math.random() - 0.5) * 0.01;
      if (isGreen) {
        close = open + Math.abs(Math.random() * 0.01);
      } else {
        close = open - Math.abs(Math.random() * 0.01);
      }
      const high = Math.max(open, close) + Math.random() * 0.01;
      const low = Math.min(open, close) - Math.random() * 0.01;

      data.push({
        time: currentTime,
        open,
        high,
        low,
        close,
      });

      currentTime += 24 * 60 * 60; // Move to the next day
      open = close; // Next open price starts at the last close price
      isGreen = !isGreen; // Alternate between green and red
    }

    return data;
  };


  const updateFirebaseBalance = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert('Please log in to update your balance.');
      return;
    }
  
    try {
      const userDocRef = doc(db, "users", user.uid, "accounts", "Demo");

      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        alert('User data not found.');
        return;
      }
  
      const userData = userDoc.data();
      console.log('User document data:', userData);
  
      // Fetch demo account data for balance update
      const demoAccountData = await fetchDemoAccountData(user.uid);
      if (!demoAccountData) {
        console.error('Demo account data not found.');
        alert('Demo account data not found.');
        return;
      }


  
      console.log('Demo account data:', demoAccountData);
  
      const firebaseBalance = demoAccountData.balance || 0;
      const newBalance = firebaseBalance + balance;
  
      console.log('Updating balance from', firebaseBalance, 'to', newBalance);
  
      await updateDoc(userDocRef, { balance: newBalance });
      alert('Balance updated successfully!');
    } catch (error) {
      console.error('Error updating balance: ', error);
      alert('Failed to update balance.');
    }
  };
  
  
  useEffect(() => {
    localStorage.setItem('balance', balance.toFixed(2));
  }, [balance]);
  
  useEffect(() => {
    const initialData = generateInitialData(365); // Generate 365 days of data (1 year)
    dataRef.current = initialData;

    const chart = createChart(chartContainer.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'white' },
      },
      width: chartContainer.current.clientWidth,
      height: chartContainer.current.clientHeight,
      leftPriceScale: {
        visible: true,
        borderColor: '#43a047',
      },
      rightPriceScale: {
        visible: false,
      },
      timeScale: {
        borderColor: '#43a047',
      },
    });

    chartRef.current = chart;

    seriesRef.current = chart.addCandlestickSeries({
      upColor: '#43a047',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
      priceScaleId: 'left',
    });

    seriesRef.current.setData(initialData);

    const smaData = calculateSMA(initialData, 10); // Calculate SMA with a period of 10

    smaSeriesRef.current = chart.addLineSeries({
      color: 'blue',
      lineWidth: 2,
    });
    smaSeriesRef.current.setData(smaData);

    chart.timeScale().applyOptions({
      borderColor: "#43a047",
      rightOffset: 20,
      fixLeftEdge: true,
    });

    const interval = setInterval(() => {
      const lastDataPoint = dataRef.current[dataRef.current.length - 1];
      const newTime = lastDataPoint.time + 24 * 60 * 60; // Next day
      const open = lastDataPoint.close;
      let close = open + (Math.random() - 0.5) * 0.01;
      if (Math.random() > 0.5) {
        close = open + Math.abs(Math.random() * 0.01);
      } else {
        close = open - Math.abs(Math.random() * 0.01);
      }
      const high = Math.max(open, close) + Math.random() * 0.01;
      const low = Math.min(open, close) - Math.random() * 0.01;

      const newDataPoint = {
        time: newTime,
        open,
        high,
        low,
        close,
      };

      dataRef.current.push(newDataPoint);
      seriesRef.current.update(newDataPoint);

      // Update SMA
      const updatedSMAData = calculateSMA(dataRef.current, 10);
      smaSeriesRef.current.setData(updatedSMAData);

      // Update floating profit/loss
      setOpenTrades(openTrades => openTrades.map(trade => {
        const currentPrice = newDataPoint.close;
        const floatingPL = trade.action === 'buy'
          ? (currentPrice - trade.openPrice) * trade.amount
          : (trade.openPrice - currentPrice) * trade.amount;
        return {
          ...trade,
          floatingPL,
        };
      }));
    }, 2000); // Update every 2 seconds

    return () => {
      clearInterval(interval);
      chart.remove();
    };
  }, []);

  const switchSeries = (type) => {
    if (seriesRef.current) {
      chartRef.current.removeSeries(seriesRef.current);
    }

    if (type === 'candlestick') {
      seriesRef.current = chartRef.current.addCandlestickSeries({
        upColor: '#43a047',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
        priceScaleId: 'left',
      });
    } else {
      seriesRef.current = chartRef.current.addAreaSeries({
        lineColor: '#43a047',
        topColor: 'rgba(67, 160, 71, 0.4)',
        bottomColor: 'rgba(67, 160, 71, 0.2)',
      });
    }

    seriesRef.current.setData(dataRef.current);
    seriesRef.current.setMarkers(markersRef.current); // Reapply markers to the new series
  };

  const adjustLotSize = (delta) => {
    setLotSize((prevLotSize) => Math.max(0.1, prevLotSize + delta));
  };

  return (
    <div className='w-[80%] pl-7 pr-7'>
      <div className='flex bb bc-gray h-[50px] w-[93%] items-center justify-between'>
        <div>
          <img src={logo} alt="" className='w-44' />
        </div>
        <div>
        <div className='w-[80%] pl-7 pr-7'>
  
    
      


  </div>
          <div style={{ lineHeight: "0px" }}>
            <button className='bg-black text-white rounded-xl h-5 w-8 text-xs p-0'>Demo</button>
          </div>
          <h2>Profit: ${balance.toFixed(2)}</h2>
        </div>
      </div>
      <div className='flex pt-6'>
        <div className='w-[340px]'>
          <div className='flex gap-7'>
            <button onClick={() => switchSeries('candlestick') } className='bg-green-600'>Candlestick</button>
            <button onClick={() => switchSeries('area')}  className='bg-green-600'>Area</button>
          </div>
         
          <ul className='scroll-m-14 overflow-y-scroll h-[80vh] pt-3 overflow-x-hidden'>
            {cryptos.map((crypto, index) => (
              <li key={index} className='text-wrap leading-[10px] flex flex-col justify-center mb-4 pr-3'> 
                <li className='flex h-10 gap-2 text-sm'>
                  <img src={crypto.image} alt={crypto.name} style={{ width: '20px', height: '20px' }} />
                  {crypto.name} ({crypto.symbol.toUpperCase()}): 
                  <span style={{ color: crypto.price < prevPrices[crypto.symbol] ? 'red' : 'green' }} className='text-xs flex gap-2'>
                    <span>{crypto.price}</span>
                    <span>{crypto.price}</span>
                  </span>
                </li>
                <button onClick={() => placeOrder(crypto, 'buy')} className='bg-green-600'>Place Buy Order</button>
                <button onClick={() => placeOrder(crypto, 'sell')} className='bg-red-600'>Place Sell Order</button>
              </li>
            ))}
          </ul>
        </div>
        <div className='w-[80%]'>
          <div className="flex justify-center mb-4">
            <button
              onClick={() => handleTrade('buy')}
              className="bg-green-500 text-white py-2 px-4 rounded mr-2"
            >
              Buy
            </button>
            <div className="flex items-center mx-2">
              <button
                onClick={() => adjustLotSize(-0.1)}
                className="bg-gray-500 text-white py-2 px-4 rounded mr-2"
              >
                -
              </button>
              <span className="mx-2">Lot Size: {lotSize.toFixed(1)}</span>
              <button
                onClick={() => adjustLotSize(0.1)}
                className="bg-gray-500 text-white py-2 px-4 rounded mr-2"
              >
                +
              </button>
            </div>
            <button
              onClick={() => handleTrade('sell')}
              className="bg-red-500 text-white py-2 px-4 rounded ml-2"
            >
              Sell
            </button>
          </div>
          <div ref={chartContainer} style={{ width: '80%', height: '300px' }}></div>
          <div className="stuffs">
            <div className='overflow-y-scroll h-[200px] scroll-m-14 w-[80%]'>
              <div className='p-5 '>
                <ul className='p-2'>
                  {tradeHistory.map((trade, index) => (
                    <li key={index}>
                      {trade.action} ${trade.amount.toFixed(2)} at ${trade.openPrice.toFixed(2)} - {trade.success ? 'Win' : 'Loss'} (${trade.result.toFixed(2)})
                    </li>
                  ))}
                </ul>
              </div>
              <div className='p-2 '>
                <h3>Open Trades:</h3>
                <ul className='grid gap-3 w-[100%]'>
                  {openTrades.map((trade, index) => (
                    <li key={index} style={{ color: trade.floatingPL > 0 ? 'green' : 'red' }} className='flex justify-between items-center'>
                      <img src={trade.cryptoImage} alt={trade.crypto} style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                      {trade.crypto} {trade.action} ${trade.amount.toFixed(2)} at ${trade.openPrice.toFixed(2)} - Floating P&L: {(trade.floatingPL || 0).toFixed(2)}
                      <button onClick={() =>{ closeTrade(trade, dataRef.current[dataRef.current.length - 1].close), updateFirebaseBalance()}} className='bg-green-600 text-xs'>Close Trade</button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chart;
