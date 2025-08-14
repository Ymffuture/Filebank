import React, { useState, useEffect } from "react";
import SlotReel from "./SlotReel";
import { Button, InputNumber, Select, Modal, Typography, Alert } from "antd";
import { motion } from "framer-motion";
import { AiOutlineTrophy, AiOutlineReload } from "react-icons/ai";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const { Title, Text } = Typography;
const ROWS = 3;
const COLS = 3;
const SYMBOLS_COUNT = { A: 2, B: 4, C: 6, D: 8 };
const SYMBOL_VALUES = { A: 5, B: 4, C: 3, D: 2 };
const SYMBOL_EMOJIS = { A: "🍒", B: "🍋", C: "🍉", D: "⭐" };

export default function SlotMachine() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem("balance")) || 0);
  const [deposit, setDeposit] = useState(0);
  const [lines, setLines] = useState(1);
  const [bet, setBet] = useState(1);
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [spinningReels, setSpinningReels] = useState([false, false, false]);
  const [gameOver, setGameOver] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);

  useEffect(() => {
    localStorage.setItem("balance", balance);
  }, [balance]);

  const handleDeposit = () => {
    if (deposit > 0) {
      setBalance((prev) => prev + deposit);
      setMessage(`Deposited R${deposit}`);
      setMessageType("success");
      toast.success(`💰 Successfully deposited R${deposit}`, { position: "top-center" });
      setShowDepositModal(false);
    } else {
      setMessage("Enter a valid amount");
      setMessageType("error");
      toast.error("Please enter a valid deposit amount", { position: "top-center" });
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
    if (bet * lines > balance) {
      setMessage("Not enough balance for this bet");
      setMessageType("error");
      toast.error("Not enough balance!", { position: "top-center" });
      return;
    }

    setMessage("");
    const { rows: newRows } = generateSpin();
    setSpinningReels([true, true, true]);

    setTimeout(() => setSpinningReels((r) => [false, r[1], r[2]]), 1000);
    setTimeout(() => setSpinningReels((r) => [false, false, r[2]]), 1500);
    setTimeout(() => {
      setSpinningReels([false, false, false]);
      const winnings = calculateWinnings(newRows, bet, lines);
      const newBalance = balance - bet * lines + winnings;
      setRows(newRows);
      setBalance(newBalance);

      if (winnings > 0) {
        setMessage(`🎉 You won R${winnings}!`);
        setMessageType("success");
        toast.success(`🏆 Congrats! You won R${winnings}!`, { position: "top-center" });
      } else {
        setMessage("No win this time.");
        setMessageType("warning");
        toast.info("No win this time. Try again!", { position: "top-center" });
      }

      if (newBalance <= 0) setGameOver(true);
    }, 2000);
  };

  return (
    <div className="w-full max-w-lg mx-auto p-6 h-100vh">
      <Title level={2} className="text-center text-yellow-400">🎰 Famacloud Slot Machine</Title>
      <Text className="block text-center mb-4">Balance: R{balance}</Text>

      {!gameOver && balance <= 10 && (
        <Button type="link" className="w-full" onClick={() => setShowDepositModal(true)}>
          Deposit to Start
        </Button>
      )}

      {!gameOver && balance > 0 && (
        <div className="flex flex-col gap-3 mb-4">
          <Select value={lines} onChange={setLines}>
            <Select.Option value={1}>1 Line</Select.Option>
            <Select.Option value={2}>2 Lines</Select.Option>
            <Select.Option value={3}>3 Lines</Select.Option>
          </Select>
          <InputNumber
            min={1}
            value={bet}
            onChange={setBet}
            className="w-full"
            placeholder="Bet per line"
          />
          <Button
            type="dashed"
            className="bg-yellow-500 hover:bg-yellow-600 m-4"
            onClick={spin}
            disabled={spinningReels.some((r) => r)}
          >
            {spinningReels.some((r) => r) ? "Spinning..." : "Spin"}
          </Button>
        </div>
      )}

      <div className="flex justify-center gap-5 mb-8">
        {Array.from({ length: COLS }).map((_, i) => (
          <SlotReel
            key={i}
            spinning={spinningReels[i]}
            symbols={rows.map((r) => SYMBOL_EMOJIS[r[i]] || "❓")}
          />
        ))}
      </div>

      {message && (
        <Alert
          message={message}
          type={messageType}
          showIcon
          className="mb-4 text-center"
        />
      )}

      {gameOver && (
        <Button
          danger
          icon={<AiOutlineReload />}
          className="mt-4 w-full"
          onClick={() => {
            setBalance(0);
            localStorage.removeItem("balance");
            window.location.reload();
          }}
        >
          Restart Game
        </Button>
      )}

      <Modal
        title="Deposit Funds"
        open={showDepositModal}
        onOk={handleDeposit}
        onCancel={() => setShowDepositModal(false)}
        okText="Deposit"
      >
        <InputNumber
          min={1}
          value={deposit}
          onChange={setDeposit}
          className="w-full"
          placeholder="Enter deposit amount"
        />
      </Modal>

      <ToastContainer />
    </div>
  );
}

