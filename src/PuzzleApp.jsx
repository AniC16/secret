import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Key } from "lucide-react";
import Background from "@/assets/riyabday.jpg";
import SecretImg from "@/assets/secrets.jpg"; // place screenshot as src/assets/secret.png

// ─── Constants ─────────────────────────────────────────────────────────────

const TARGET_LETTERS = ["C", "U", "I", "N", "N", "Y", "C"];

const PUZZLES = [
  { letter: "C", question: "Quel est la premiere lettre du langage de programmation cree par Dennis Ritchie ?" },
  { letter: "U", question: "¿Que letra representa la palabra 'tu' en la jerga de mensajes de texto?" },
  { letter: "I", question: "Welcher einzelne Buchstabe beginnt das englische Wort 'in'?" },
  { letter: "N", question: "アルファベットの14番目の文字は何ですか?" },
  { letter: "N", question: "अंग्रेजी वर्णमाला का चौदहवां अक्षर कौन सा है?" },
  { letter: "Y", question: "Quale lettera segue la X nell'alfabeto inglese?" },
  { letter: "C", question: "Qual e la terza lettera della parola 'code'?" },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ─── Letter Box ────────────────────────────────────────────────────────────

function LetterBox({ letter, solved, wrong, onClick }) {
  const border = solved ? "border-emerald-500" : wrong ? "border-red-500" : "border-gray-400";
  return (
    <motion.button
      layout
      whileHover={{ scale: solved ? 1 : 1.05 }}
      whileTap={{ scale: 0.97 }}
      className={`flex items-center justify-center w-14 h-14 md:w-16 md:h-16 text-2xl font-semibold rounded-xl border-2 ${border} bg-white/80 backdrop-blur-sm shadow-md transition`}
      onClick={onClick}
    >
      {solved ? letter : ""}
    </motion.button>
  );
}

// ─── Main App ───────────────────────────────────────────────────────────────

export default function PuzzleApp() {
  const initialOrder = useMemo(() => shuffle([0, 1, 2, 3, 4, 5, 6]), []);
  const [order, setOrder] = useState(initialOrder);
  const [solved, setSolved] = useState(Array(7).fill(false));
  const [wrong, setWrong] = useState(Array(7).fill(false));
  const [active, setActive] = useState(null);
  const [input, setInput] = useState("");
  const [showSecret, setShowSecret] = useState(false);

  // open dialog
  const open = (idx) => {
    setActive(idx);
    setInput("");
    setWrong((w) => w.map((v, i) => (i === idx ? false : v)));
  };

  const close = () => setActive(null);

  // handle answer
  const submit = () => {
    if (active === null) return;
    const correct = TARGET_LETTERS[order[active]].toLowerCase();
    const guess = input.trim().toLowerCase();
    if (guess === correct) {
      setSolved((s) => s.map((v, i) => (i === active ? true : v)));
      close();
    } else {
      setWrong((w) => w.map((v, i) => (i === active ? true : v)));
    }
  };

  const allSolved = solved.every(Boolean);

  // rearrange boxes & schedule redirect when solved
  useEffect(() => {
    if (allSolved) {
      // rearrange after 0.4s for effect
      const reOrderTimeout = setTimeout(() => setOrder([0, 1, 2, 3, 4, 5, 6]), 400);
      // redirect / show secret after 5s
      const secretTimeout = setTimeout(() => setShowSecret(true), 5000);
      return () => {
        clearTimeout(reOrderTimeout);
        clearTimeout(secretTimeout);
      };
    }
  }, [allSolved]);

  // ─── Render Secret Screen ──────────────────────────────────────────────
  if (showSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <img
          src={SecretImg}
          alt="secret"
          className="max-w-full max-h-screen object-contain"
        />
      </div>
    );
  }

  // ─── Main Puzzle Screen ───────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${Background})` }}
    >
      {/* overlay */}
      <div className="absolute inset-0 bg-sky-100/60 backdrop-blur-[2px]" />

      <motion.div className="relative z-10 flex flex-col items-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-extrabold text-indigo-700 mb-8 flex items-center gap-3 drop-shadow"
        >
          <Key className="w-8 h-8" /> Unlock the Secret Message
        </motion.h1>

        <motion.div
          layout
          className="grid grid-cols-7 gap-4 mb-8"
          transition={{ layout: { duration: 0.6, type: "spring" } }}
        >
          {order.map((origIdx, dispIdx) => (
            <LetterBox
              key={dispIdx}
              letter={TARGET_LETTERS[origIdx]}
              solved={solved[dispIdx]}
              wrong={wrong[dispIdx] && !solved[dispIdx]}
              onClick={() => open(dispIdx)}
            />
          ))}
        </motion.div>

        <AnimatePresence>
          {allSolved && (
            <motion.p
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="text-2xl font-extrabold text-emerald-600 animate-pulse drop-shadow"
            >
               HMMMMMMMMM 
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Dialog */}
      <Dialog open={active !== null} onOpenChange={close}>
        <DialogTrigger asChild></DialogTrigger>
        <DialogContent className="sm:max-w-md">
          {active !== null && (
            <>
              <DialogHeader>
                <DialogTitle>Puzzle {active + 1}</DialogTitle>
                <DialogDescription className="mb-4">
                  {PUZZLES[order[active]].question}
                </DialogDescription>
              </DialogHeader>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter one letter"
                maxLength={1}
                className="mb-4"
              />
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={close}>
                  Cancel
                </Button>
                <Button onClick={submit}>Submit</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
