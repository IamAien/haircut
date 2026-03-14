import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, RefreshCcw, Sparkles } from "lucide-react";

type ResultType = {
  title: string;
  subtitle: string;
  reason: string;
  glow: string;
};

const laneCount = 3;
const laneHeight = 88;
const carSize = 52;
const gameWidth = 760;
const gameHeight = laneCount * laneHeight;
const finishScore = 40;
// Put the cropped images in the project's /public folder
// public/crayen-face.png
// public/me-face.png
const playerFaceSrc = "/crayen-face.png";
const obstacleFaceSrc = "/me-face.png";

const cutResult: ResultType = {
  title: "Cut it ✂️",
  subtitle: "A fresh look could be fun.",
  reason: "You made it to the finish. Maybe this is your sign to try a haircut.",
  glow: "from-pink-400 via-rose-300 to-orange-200",
};

const keepResult: ResultType = {
  title: "Keep it 💫",
  subtitle: "Your current hair is already lovely.",
  reason: "A little crash means maybe not yet. Your current hair still looks really nice.",
  glow: "from-violet-400 via-fuchsia-300 to-pink-200",
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default function HairCutDecisionPage() {
  const [lane, setLane] = useState(1);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<ResultType | null>(null);
  const [obstacles, setObstacles] = useState<Array<{ id: number; lane: number; x: number }>>([]);
  const [flashCrash, setFlashCrash] = useState(false);
  const obstacleIdRef = useRef(0);
  const spawnTickRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const roadLines = useMemo(() => Array.from({ length: 12 }, (_, i) => i), []);
  const progressPercent = Math.min((score / finishScore) * 100, 100);
  const difficultyLevel = Math.min(1 + Math.floor(score / 8), 5);
  const scoreTone =
    score >= 32
      ? "text-fuchsia-600"
      : score >= 24
        ? "text-pink-600"
        : score >= 16
          ? "text-rose-500"
          : score >= 8
            ? "text-orange-500"
            : "text-slate-800";

  const resetGame = () => {
    setRunning(false);
    setScore(0);
    setLane(1);
    setResult(null);
    setObstacles([]);
    spawnTickRef.current = 0;
    lastTimeRef.current = null;
    if (animationRef.current) {
      window.cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };

  const endGame = (didWin: boolean) => {
    if (!didWin) {
      setFlashCrash(true);
      window.setTimeout(() => setFlashCrash(false), 260);
    }
    setRunning(false);
    setResult(didWin ? cutResult : keepResult);
    if (animationRef.current) {
      window.cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };

  const startGame = () => {
    resetGame();
    setRunning(true);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowUp" || event.key.toLowerCase() === "w") {
        setLane((prev) => clamp(prev - 1, 0, laneCount - 1));
      }
      if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") {
        setLane((prev) => clamp(prev + 1, 0, laneCount - 1));
      }
      if (event.key === " " && !running) {
        event.preventDefault();
        startGame();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [running]);

  useEffect(() => {
    if (!running) return;

    const carX = 96;

    const tick = (time: number) => {
      const dynamicSpeed = 300 + score * 7;
      const spawnEveryMs = Math.max(340, 900 - score * 14);
      if (lastTimeRef.current == null) {
        lastTimeRef.current = time;
      }
      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;
      spawnTickRef.current += delta * 1000;

      setObstacles((prev) => {
        let next = prev.map((item) => ({ ...item, x: item.x - dynamicSpeed * delta }));

        if (spawnTickRef.current >= spawnEveryMs) {
          spawnTickRef.current = 0;
          const obstacleBatch = score >= 20 && Math.random() > 0.55 ? 2 : 1;
          const usedLanes = new Set<number>();
          for (let i = 0; i < obstacleBatch; i += 1) {
            let newLane = Math.floor(Math.random() * laneCount);
            let safety = 0;
            while (usedLanes.has(newLane) && safety < 8) {
              newLane = Math.floor(Math.random() * laneCount);
              safety += 1;
            }
            usedLanes.add(newLane);
            next = [
              ...next,
              { id: obstacleIdRef.current++, lane: newLane, x: gameWidth + 40 + i * 76 },
            ];
          }
          setScore((current) => {
            const newScore = current + 1;
            if (newScore >= finishScore) {
              window.setTimeout(() => endGame(true), 50);
            }
            return newScore;
          });
        }

        const filtered = next.filter((item) => item.x > -80);
        const hit = filtered.some(
          (item) =>
            item.lane === lane &&
            item.x < carX + carSize - 8 &&
            item.x + 42 > carX + 8
        );

        if (hit) {
          window.setTimeout(() => endGame(false), 50);
        }

        return filtered;
      });

      animationRef.current = window.requestAnimationFrame(tick);
    };

    animationRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (animationRef.current) {
        window.cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [running, lane]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff7fb_0%,_#f9e9ff_35%,_#f6d4e8_70%,_#f4c8d0_100%)] px-4 py-8 text-slate-800">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm font-medium shadow-sm backdrop-blur-md">
            <Heart className="h-4 w-4 text-pink-500" />
            For Crayen 💗
          </div>
          <h1 className="text-4xl font-black tracking-tight md:text-6xl">
            Crayen, should you cut
            <span className="block bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-500 bg-clip-text text-transparent">
              your hair?
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700 md:text-lg">
            Tiny racing game edition. Crayen is the player, and your face is the obstacle. Reach the finish and the answer is cut it. Crash and the answer is keep it.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="overflow-hidden rounded-[32px] border-white/60 bg-white/60 shadow-[0_20px_80px_rgba(255,255,255,0.35)] backdrop-blur-xl">
            <CardContent className="p-4 md:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white px-4 py-2 shadow-sm">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Score</div>
                    <div className={`text-2xl font-black transition-colors ${scoreTone}`}>{score}/{finishScore}</div>
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-2 shadow-sm text-sm text-slate-600">
                    ↑ ↓ or W S
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-2 shadow-sm">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Level</div>
                    <div className="text-lg font-black text-pink-600">{difficultyLevel}</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={startGame}
                    className="h-12 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-400 to-fuchsia-500 px-5 text-white shadow-[0_15px_40px_rgba(236,72,153,0.3)]"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    {running ? "Running..." : "Start"}
                  </Button>
                  <Button
                    onClick={resetGame}
                    variant="outline"
                    className="h-12 rounded-2xl border-white/70 bg-white/70 px-5"
                  >
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                </div>
              </div>

              <div className="mb-3 h-3 w-full overflow-hidden rounded-full bg-white/60 shadow-inner">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-500"
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 18 }}
                />
              </div>

              <div className={`relative mx-auto w-full overflow-hidden rounded-[28px] border border-white/70 bg-[#2f2f46] shadow-inner transition-all ${flashCrash ? "ring-4 ring-rose-300" : ""}`} style={{ maxWidth: gameWidth }}>
                <div className="relative" style={{ height: gameHeight + 44 }}>
                  <div className="absolute left-0 right-0 top-0 z-20 flex justify-center px-4 pt-3">
                    <div className="rounded-2xl bg-white/92 px-4 py-2 text-center shadow-lg">
                      <div className="text-sm font-black text-slate-800">Hair Race</div>
                      <p className="mt-1 text-xs leading-5 text-slate-600 md:text-sm">
                        Reach {finishScore} to get Cut it. Crash to get Keep it.
                      </p>
                    </div>
                  </div>

                  <div className="absolute inset-x-0 top-11 bottom-0">
                    {Array.from({ length: laneCount }).map((_, index) => (
                      <div
                        key={index}
                        className="absolute left-0 right-0 border-b border-white/10"
                        style={{ top: index * laneHeight, height: laneHeight }}
                      >
                        {index < laneCount - 1 && (
                          <div className="absolute bottom-0 left-0 right-0 h-px border-b-2 border-dashed border-white/25" />
                        )}
                      </div>
                    ))}

                    {roadLines.map((line) => (
                      <motion.div
                        key={line}
                        className="absolute top-1/2 h-2 w-14 -translate-y-1/2 rounded-full bg-white/60"
                        style={{ left: `${line * 9}%` }}
                        animate={running ? { x: [-40, -120] } : { x: 0 }}
                        transition={{ duration: 0.35, repeat: Infinity, ease: "linear", delay: line * 0.03 }}
                      />
                    ))}

                    <motion.div
                      className="absolute left-24 z-10 overflow-hidden rounded-[18px] border-2 border-white/80 bg-gradient-to-br from-pink-300 via-rose-200 to-fuchsia-300 shadow-lg"
                      style={{
                        width: carSize + 10,
                        height: carSize + 10,
                        top: lane * laneHeight + (laneHeight - carSize) / 2 - 4,
                      }}
                      animate={{ y: 0, scale: running ? [1, 1.03, 1] : 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      <img
                        src={playerFaceSrc}
                        alt="Crayen"
                        className="h-full w-full object-cover"
                        style={{ objectPosition: "center 35%", transform: "scale(1.08)" }}
                      />
                    </motion.div>

                    {obstacles.map((item) => (
                      <div
                        key={item.id}
                        className="absolute overflow-hidden rounded-full border-2 border-white/90 bg-white shadow-md"
                        style={{
                          left: item.x,
                          top: item.lane * laneHeight + (laneHeight - 46) / 2,
                          width: 46,
                          height: 46,
                        }}
                      >
                        <img
                          src={obstacleFaceSrc}
                          alt="Obstacle"
                          className="h-full w-full object-cover"
                          style={{ objectPosition: "center 38%", transform: "scale(1.05)" }}
                        />
                      </div>
                    ))}

                    {!running && !result && (
                      <div className="absolute inset-x-0 bottom-4 flex justify-center px-4">
                        <div className="rounded-2xl bg-slate-900/70 px-4 py-2 text-center text-xs leading-5 text-white shadow-lg backdrop-blur-sm md:text-sm">
                          Press Start, then dodge with ↑ ↓ or W S.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-3 md:hidden">
                <Button onClick={() => setLane((prev) => clamp(prev - 1, 0, laneCount - 1))} variant="outline" className="flex-1 rounded-2xl bg-white/70">Up</Button>
                <Button onClick={() => setLane((prev) => clamp(prev + 1, 0, laneCount - 1))} variant="outline" className="flex-1 rounded-2xl bg-white/70">Down</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-white/60 bg-white/55 shadow-[0_20px_80px_rgba(255,255,255,0.35)] backdrop-blur-xl">
            <CardContent className="flex min-h-[420px] flex-col justify-center p-6 md:p-8">
              <div className="mb-5 text-sm font-medium uppercase tracking-[0.24em] text-slate-500">Decision</div>
              <AnimatePresence mode="wait">
                {result ? (
                  <motion.div
                    key={result.title}
                    initial={{ opacity: 0, y: 14, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8 }}
                    className={`rounded-[28px] bg-gradient-to-r ${result.glow} p-[1px] shadow-[0_16px_50px_rgba(236,72,153,0.16)]`}
                  >
                    <div className="rounded-[27px] bg-white/92 px-6 py-6">
                      <h2 className="text-3xl font-black tracking-tight text-slate-800">{result.title}</h2>
                      <p className="mt-2 text-base font-medium text-slate-700">{result.subtitle}</p>
                      <p className="mt-4 text-sm leading-7 text-slate-600">{result.reason}</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="rounded-[28px] border border-dashed border-slate-300/80 bg-white/60 px-6 py-8 text-slate-600"
                  >
                    <div className="text-xl font-bold text-slate-800">How it works</div>
                    <p className="mt-3 text-sm leading-7">
                      This is like a tiny no-internet game. Start the run, dodge obstacles, and let the ending decide the haircut answer.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
