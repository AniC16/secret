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
import SecretImg from "@/assets/secrets.jpg";

// ─── Utility helpers ───────────────────────────────────────────────────────

const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, "");

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ─── Target phrase & puzzle definitions─────────────────────────────────────

const TARGET_LETTERS = ["S", "E", "E", "U", "I", "N", "N", "Y", "C"];

const PUZZLES = [
  {
    prompt: "Ani originally bought the digi camera to take ____ pictures.",
    accepts: ["sunset", "sun set"],
    letter: "S",
  },
  {
    prompt: "The speed I got pulled over for.",
    accepts: ["eightyseven", "87", "eighty seven"],
    letter: "E",
  },
  {
    prompt: "Fri, July 19 1:59 AM – what referral?",
    accepts: ["swe", "software", "softwareengineering"],
    letter: "E", // take the E from SWE
  },
  {
    prompt: "We couldn't find one after Coco Bongo.",
    accepts: ["anuber", "uber"],
    letter: "U",
  },
  {
    prompt: "First date location?",
    accepts: ["inorbit", "in orbit"],
    letter: "I",
  },
  {
    prompt: "Shirt I wore to bed when I first met you in Raleigh.",
    accepts: ["ncstate", "nc state", "ncsu"],
    letter: "N",
  },
  {
    prompt: "Our first Hilton city.",
    accepts: ["newyork", "nyc", "new york"],
    letter: "N",
  },
  {
    prompt: "I hated when you typed this word because it sounded like a white‑girl 'yes'.",
    accepts: ["yaur", "yaurrr"],
    letter: "Y",
  },
  {
    prompt: "Wake Forest, NC 27587 – ?",
    accepts: ["corvette"],
    letter: "C",
  },
];

// ─── Letter box component ──────────────────────────────────────────────────

function LetterBox({ letter, solved, wrong, onClick }) {
  const border = solved ? "border-emerald-500" : wrong ? "border-red-500" : "border-gray-300";
  return (
    <motion.button
      layout
      whileHover={{ scale: solved ? 1 : 1.05 }}
      whileTap={{ scale: 0.97 }}
      className={`flex items-center justify-center w-14 h-14 text-2xl font-semibold rounded-xl border-2 ${border} bg-white/80 backdrop-blur-sm shadow-md transition`}
      onClick={onClick}
    >
      {solved ? letter : ""}
    </motion.button>
  );
}

// ─── Main component ────────────────────────────────────────────────────────

export default function PuzzleApp() {
  // shuffle display order once per mount
  const initialOrder = useMemo(() => shuffle([...Array(9).keys()]), []);
  const [order, setOrder] = useState(initialOrder);

  const [solved, setSolved] = useState(Array(9).fill(false));
  const [wrong, setWrong] = useState(Array(9).fill(false));
  const [active, setActive] = useState(null);
  const [input, setInput] = useState("");
  const [showSecret, setShowSecret] = useState(false);

  // open puzzle
  const open = (idx) => {
    setActive(idx);
    setInput("");
    setWrong((w) => w.map((v, i) => (i === idx ? false : v)));
  };

  const close = () => setActive(null);

  const submit = () => {
    if (active === null) return;
    const puzzle = PUZZLES[order[active]];
    const norm = normalize(input);
    const correct = puzzle.accepts.some((ans) => norm === normalize(ans));

    if (correct) {
      setSolved((s) => s.map((v, i) => (i === active ? true : v)));
      close();
    } else {
      setWrong((w) => w.map((v, i) => (i === active ? true : v)));
    }
  };

  const allSolved = solved.every(Boolean);

  // rearrange + redirect when solved
  useEffect(() => {
    if (allSolved) {
      const reorder = setTimeout(() => setOrder([...Array(9).keys()]), 400);
      const redirect = setTimeout(() => setShowSecret(true), 10000); // 10 s
      return () => {
        clearTimeout(reorder);
        clearTimeout(redirect);
      };
    }
  }, [allSolved]);

  // ── render secret screen ───────────────────────────────────────────────
  if (showSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <img src={SecretImg} alt="secret" className="max-w-full max-h-screen object-contain" />
      </div>
    );
  }

  // ── render puzzle screen ───────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url(${Background})` }}>
      <div className="absolute inset-0 bg-sky-100/60 backdrop-blur-[2px]" />

      <motion.div className="relative z-10 flex flex-col items-center">
        <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-extrabold text-indigo-700 mb-8 flex items-center gap-3 drop-shadow">
          <Key className="w-8 h-8" /> Unlock the Secret Message
        </motion.h1>

        <motion.div layout className="grid grid-cols-9 gap-4 mb-8" transition={{ layout: { duration: 0.6, type: "spring" } }}>
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
            <motion.p initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="text-2xl font-extrabold text-emerald-600 animate-pulse drop-shadow">
              
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* dialog */}
      <Dialog open={active !== null} onOpenChange={close}>
        <DialogTrigger asChild></DialogTrigger>
        <DialogContent className="sm:max-w-md">
          {active !== null && (
            <>
              <DialogHeader>
                <DialogTitle>Puzzle {active + 1}</DialogTitle>
                <DialogDescription className="mb-4">
                  {PUZZLES[order[active]].prompt}
                </DialogDescription>
              </DialogHeader>
              <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type answer" className="mb-4" />
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={close}>Cancel</Button>
                <Button onClick={submit}>Submit</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
