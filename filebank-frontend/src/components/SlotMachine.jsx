// SlotMachine.jsx
import React, { useState } from "react";
import SlotReel from "./SlotReel";

const ROWS = 3;
const COLS = 3;
const SYMBOLS_COUNT = { A: 2, B: 4, C: 6, D: 8 };
const SYMBOL_VALUES = { A: 5, B: 4, C: 3, D: 2 };
const SYMBOL_EMOJIS = { A: "🍒", B: "🍋", C: "🍉", D: "⭐" };

export default function SlotMachine() {
  const [balance, setBalance] = useState(0);
  const [deposit, setDeposit] = useState("");
  const [lines, setLines] = useState(1);
  const [bet, setBet] = useState("");
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState("");
  const [spinningReels, setSpinningReels] = useState([false, false, false]);
  const [gameOver, setGameOver] = useState(false);

  const handleDeposit = () => {
    const amount = parseFloat(deposit);
    if (isNaN(amount) || amount <= 0) {
      setMessage("Invalid deposit amount");
    } else {
      setBalance(amount);
      setMessage(`Deposited R${amount}`);
    }
  };

  const generateSpin = () => {
    const symbols = [];
    for (const [symbol, count] of Object.entries(SYMBOLS_COUNT)) {
      for (let i = 0; i < count; i++) symbols.push(symbol);
    }

    const reels = [];
    for (let i = 0; i < COLS; i++) {
      reels.push([]);
      const reelSymbols = [...symbols];
      for (let j = 0; j < ROWS; j++) {
        const randomIndex = Math.floor(Math.random() * reelSymbols.length);
        reels[i].push(reelSymbols[randomIndex]);
        reelSymbols.splice(randomIndex, 1);
      }
    }

    // Transpose to rows
    const transposed = [];
    for (let i = 0; i < ROWS; i++) {
      transposed.push([]);
      for (let j = 0; j < COLS; j++) {
        transposed[i].push(reels[j][i]);
      }
    }
    return { reels, rows: transposed };
  };

  const calculateWinnings = (rows, bet, lines) => {
    let winnings = 0;
    for (let row = 0; row < lines; row++) {
      const symbols = rows[row];
      if (symbols.every((s) => s === symbols[0])) {
        winnings += bet * SYMBOL_VALUES[symbols[0]];
      }
    }
    return winnings;
  };

  const spin = () => {
    const betAmount = parseFloat(bet);
    if (isNaN(betAmount) || betAmount <= 0) {
      setMessage("Invalid bet amount");
      return;
    }
    if (betAmount * lines > balance) {
      setMessage("Not enough balance for this bet");
      return;
    }

    setMessage("");
    const { reels, rows: newRows } = generateSpin();

    // Start all reels spinning
    setSpinningReels([true, true, true]);

    // Stop reel 1
    setTimeout(() => setSpinningReels((r) => [false, r[1], r[2]]), 1000);
    // Stop reel 2
    setTimeout(() => setSpinningReels((r) => [false, false, r[2]]), 1500);
    // Stop reel 3 & calculate winnings
    setTimeout(() => {
      setSpinningReels([false, false, false]);
      const winnings = calculateWinnings(newRows, betAmount, lines);
      const newBalance = balance - betAmount * lines + winnings;
      setRows(newRows);
      setBalance(newBalance);
      setMessage(winnings > 0 ? `🎉 You won R${winnings}` : "No win this time.");
      if (newBalance <= 0) {
        setMessage("💀 You ran out of money! Game Over.");
        setGameOver(true);
      }
    }, 2000);
  };

  return (
    <div className="w-full max-w-md p-6 rounded-lg bg-gray-800 shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-4">🎰 Slot Machine</h1>
      <p className="text-center mb-2">Balance: R{balance}</p>

      {!gameOver && balance === 0 && (
        <div className="flex gap-2 mb-4">
          <input
            type="number"
            className="flex-1 p-2 rounded bg-gray-700"
            placeholder="Deposit"
            value={deposit}
            onChange={(e) => setDeposit(e.target.value)}
          />
          <button
            className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
            onClick={handleDeposit}
          >
            Deposit
          </button>
        </div>
      )}

      {!gameOver && balance > 0 && (
        <div className="flex flex-col gap-2 mb-4">
          <select
            className="p-2 rounded bg-gray-700"
            value={lines}
            onChange={(e) => setLines(parseInt(e.target.value))}
          >
            <option value={1}>1 Line</option>
            <option value={2}>2 Lines</option>
            <option value={3}>3 Lines</option>
          </select>
          <input
            type="number"
            className="p-2 rounded bg-gray-700"
            placeholder="Bet per line"
            value={bet}
            onChange={(e) => setBet(e.target.value)}
          />
          <button
            className={`px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-600 ${
              spinningReels.some((r) => r) ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={spin}
            disabled={spinningReels.some((r) => r)}
          >
            {spinningReels.some((r) => r) ? "Spinning..." : "Spin"}
          </button>
        </div>
      )}

      {/* Slot reels */}
      <div className="flex justify-center gap-3 mb-6">
        {Array.from({ length: COLS }).map((_, i) => (
          <SlotReel
            key={i}
            spinning={spinningReels[i]}
            symbols={rows.map((r) => SYMBOL_EMOJIS[r[i]] || "❓")}
          />
        ))}
      </div>

      {message && <p className="text-center mt-2">{message}</p>}

      {gameOver && (
        <button
          className="mt-4 w-full bg-red-600 py-2 rounded hover:bg-red-700"
          onClick={() => window.location.reload()}
        >
          Restart Game
        </button>
      )}
    </div>
  );
}
