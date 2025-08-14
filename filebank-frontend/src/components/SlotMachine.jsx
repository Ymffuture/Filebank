import React, { useState, useEffect } from "react";
import SlotReel from "./SlotReel";
import { Button, InputNumber, Select, Modal, Typography, Alert } from "antd";
import { motion } from "framer-motion";
import { AiOutlineTrophy, AiOutlineReload, AiOutlineDownload } from "react-icons/ai";
import toast, { Toaster } from "react-hot-toast";

const { Title, Text } = Typography;
const ROWS = 3;
const COLS = 3;

const SYMBOLS_COUNT = { A: 2, B: 4, C: 6, D: 8 };
const SYMBOL_VALUES = { A: 5, B: 4, C: 3, D: 2 };
const SYMBOL_EMOJIS = { A: "🍒", B: "🍋", C: "🍉", D: "⭐" };
const MAX_DEPOSIT = 100;
const MAX_SPINS_PER_DAY = 3;
const WITHDRAW_LIMIT = 50;

export default function SlotMachine() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem("balance")) || 0);
  const [deposit, setDeposit] = useState(0);
  const [lines, setLines] = useState(1);
  const [bet, setBet] = useState(1);
  const [rows, setRows] = useState([]);
  const [spinningReels, setSpinningReels] = useState([false, false, false]);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [spinsToday, setSpinsToday] = useState(() => {
    const saved = localStorage.getItem("spinsToday");
    const date = localStorage.getItem("spinDate");
    if (date !== new Date().toDateString()) {
      localStorage.setItem("spinsToday", 0);
      localStorage.setItem("spinDate", new Date().toDateString());
      return 0;
    }
    return Number(saved) || 0;
  });

  useEffect(() => {
    localStorage.setItem("balance", balance);
  }, [balance]);

  useEffect(() => {
    localStorage.setItem("spinsToday", spinsToday);
    localStorage.setItem("spinDate", new Date().toDateString());
  }, [spinsToday]);

  const handleDeposit = () => {
    if (deposit <= 0) {
      toast.error("Please enter a valid deposit amount");
      return;
    }
    if (deposit > MAX_DEPOSIT) {
      toast.error(`Maximum deposit is R${MAX_DEPOSIT}`);
      return;
    }
    setBalance(prev => prev + deposit);
    toast.success(`💰 Deposited R${deposit}`);
    setShowDepositModal(false);
  };

  const handleWithdraw = () => {
    if (balance < WITHDRAW_LIMIT) {
      toast.error(`You need at least R${WITHDRAW_LIMIT} to withdraw`);
      return;
    }
    toast.success(`💸 Withdrawn R${balance}`);
    setBalance(0);
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
      const unique = [...new Set(symbols)];
      if (unique.length === 1) {
        // 3 matching symbols
        winnings += bet * SYMBOL_VALUES[symbols[0]];
      } else if (unique.length === 2) {
        // 2 matching symbols
        winnings += bet * 0.5;
      }
    }
    return winnings;
  };

  const spin = () => {
    if (spinsToday >= MAX_SPINS_PER_DAY) {
      toast.error(`You have reached the ${MAX_SPINS_PER_DAY} spins limit for today`);
      return;
    }
    if (bet * lines > balance) {
      toast.error("Not enough balance!");
      return;
    }

    setSpinningReels([true, true, true]);
    const { rows: newRows } = generateSpin();

    setTimeout(() => {
      setSpinningReels([false, false, false]);
      const winnings = calculateWinnings(newRows, bet, lines);
      const newBalance = balance - bet * lines + winnings;
      setRows(newRows);
      setBalance(newBalance);
      setSpinsToday(prev => prev + 1);

      if (winnings > 0) {
        toast.success(`🏆 You won R${winnings}`);
      } else {
        toast("No win this time. Try again!", { icon: "🎯" });
      }
    }, 1500);
  };

  return (
    <div className="w-full max-w-lg mx-auto p-6">
      <Title level={2} className="text-center text-yellow-400">🎰 Famacloud Slot Machine</Title>
      <Text className="block text-center mb-4">Balance: R{balance}</Text>
      <Text className="block text-center mb-4">Spins Today: {spinsToday}/{MAX_SPINS_PER_DAY}</Text>

      <div className="flex flex-col gap-3 mb-4">
        <Select value={lines} onChange={setLines}>
          <Select.Option value={1}>1 Line</Select.Option>
          <Select.Option value={2}>2 Lines</Select.Option>
          <Select.Option value={3}>3 Lines</Select.Option>
        </Select>
        <InputNumber min={1} value={bet} onChange={setBet} className="w-full" placeholder="Bet per line" />
        <Button className="bg-yellow-500 hover:bg-yellow-600" onClick={spin} disabled={spinningReels.some(r => r)}>
          {spinningReels.some(r => r) ? "Spinning..." : "Spin"}
        </Button>
      </div>

      <div className="flex justify-center gap-5 mb-8">
        {Array.from({ length: COLS }).map((_, i) => (
          <SlotReel key={i} spinning={spinningReels[i]} symbols={rows.map(r => SYMBOL_EMOJIS[r[i]] || "❓")} />
        ))}
      </div>

      <div className="flex justify-between gap-3">
        <Button onClick={() => setShowDepositModal(true)}>Deposit</Button>
        <Button onClick={handleWithdraw} disabled={balance < WITHDRAW_LIMIT}>Withdraw</Button>
      </div>

      <Modal
        title="Deposit Funds"
        open={showDepositModal}
        onOk={handleDeposit}
        onCancel={() => setShowDepositModal(false)}
        okText="Deposit"
      >
        <InputNumber min={1} max={MAX_DEPOSIT} value={deposit} onChange={setDeposit} className="w-full" />
      </Modal>

      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}

