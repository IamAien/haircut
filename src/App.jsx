
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, RefreshCcw, Sparkles } from "lucide-react";

const laneCount = 3;
const laneHeight = 88;
const carSize = 52;
const gameWidth = 760;
const gameHeight = laneCount * laneHeight;
const finishScore = 40;
const playerFaceSrc = "/crayen-face.png";
const obstacleFaceSrc = "/me-face.png";

const cutResult = {
  title: "Cut it ✂️",
  subtitle: "A fresh look could be fun.",
  reason: "You made it to the finish. Maybe this is your sign to try a haircut."
};

const keepResult = {
  title: "Keep it 💫",
  subtitle: "Your current hair is already lovely.",
  reason: "A little crash means maybe not yet."
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export default function HairCutDecisionPage() {
  const [lane, setLane] = useState(1);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState(null);
  const [obstacles, setObstacles] = useState([]);

  const obstacleIdRef = useRef(0);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(null);

  const resetGame = () => {
    setRunning(false);
    setScore(0);
    setLane(1);
    setResult(null);
    setObstacles([]);
  };

  const endGame = (didWin) => {
    setRunning(false);
    setResult(didWin ? cutResult : keepResult);
  };

  const startGame = () => {
    resetGame();
    setRunning(true);
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "ArrowUp") setLane((p) => clamp(p - 1, 0, laneCount - 1));
      if (event.key === "ArrowDown") setLane((p) => clamp(p + 1, 0, laneCount - 1));
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!running) return;

    const carX = 96;

    const tick = (time) => {
      const speed = 300;

      if (lastTimeRef.current == null) lastTimeRef.current = time;

      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      setObstacles((prev) => {
        let next = prev.map((item) => ({ ...item, x: item.x - speed * delta }));

        if (Math.random() < 0.02) {
          next = [...next, { id: obstacleIdRef.current++, lane: Math.floor(Math.random()*3), x: gameWidth }];
          setScore((s) => s + 1);
        }

        const filtered = next.filter((item) => item.x > -80);

        const hit = filtered.some(
          (item) =>
            item.lane === lane &&
            item.x < carX + carSize &&
            item.x + 40 > carX
        );

        if (hit) endGame(false);

        return filtered;
      });

      animationRef.current = window.requestAnimationFrame(tick);
    };

    animationRef.current = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(animationRef.current);
  }, [running, lane]);

  return (
    <div style={{padding:40,fontFamily:"Arial"}}>
      <h1>Crayen, should you cut your hair?</h1>

      <button onClick={startGame}>Start</button>
      <button onClick={resetGame}>Reset</button>

      <div style={{position:"relative",height:gameHeight,width:760,background:"#2f2f46",marginTop:20}}>

        <img
          src={playerFaceSrc}
          style={{
            position:"absolute",
            left:96,
            top: lane*laneHeight+10,
            width:60,
            height:60,
            borderRadius:20
          }}
        />

        {obstacles.map((item)=>(
          <img
            key={item.id}
            src={obstacleFaceSrc}
            style={{
              position:"absolute",
              left:item.x,
              top:item.lane*laneHeight+10,
              width:46,
              height:46,
              borderRadius:30
            }}
          />
        ))}

      </div>

      {result && (
        <div>
          <h2>{result.title}</h2>
          <p>{result.reason}</p>
        </div>
      )}
    </div>
  );
}
