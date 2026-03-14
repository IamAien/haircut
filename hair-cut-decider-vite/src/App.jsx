import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, RefreshCcw, Scissors, Sparkles, Stars } from 'lucide-react';

const results = [
  {
    title: 'Cut your hair ✂️',
    subtitle: 'Fresh, cute, and dangerously charming.',
    reason:
      'The universe says a new look might make your smile hit even harder. Clean, soft, and boyfriend-level handsome.',
    badge: 'Girlfriend-approved risk',
    emoji: '✂️',
    themeClass: 'result-theme-cut',
  },
  {
    title: "Don’t cut it 💫",
    subtitle: 'Keep the fluffy magic a little longer.',
    reason:
      'Today’s verdict: the current hair has romantic main-character energy. Keep it for now and let the charm continue working.',
    badge: 'Soft hairstyle supremacy',
    emoji: '💇',
    themeClass: 'result-theme-keep',
  },
];

const floatingIcons = [
  { Icon: Heart, className: 'float-1', delay: 0.1, duration: 4.8 },
  { Icon: Sparkles, className: 'float-2', delay: 0.6, duration: 5.3 },
  { Icon: Stars, className: 'float-3', delay: 1.1, duration: 5.7 },
  { Icon: Heart, className: 'float-4', delay: 0.3, duration: 4.9 },
  { Icon: Sparkles, className: 'float-5', delay: 1.3, duration: 6.1 },
];

function FloatingDecor() {
  return (
    <div className="floating-layer" aria-hidden="true">
      <motion.div
        className="blur-orb orb-a"
        animate={{ x: [0, 20, -10, 0], y: [0, 12, -8, 0], scale: [1, 1.08, 0.96, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="blur-orb orb-b"
        animate={{ x: [0, -24, 8, 0], y: [0, -12, 10, 0], scale: [1, 0.95, 1.06, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="blur-orb orb-c"
        animate={{ x: [0, 18, -8, 0], y: [0, -16, 8, 0], scale: [1, 1.04, 0.97, 1] }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
      />

      {floatingIcons.map(({ Icon, className, delay, duration }, index) => (
        <motion.div
          key={index}
          className={`floating-icon ${className}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: [0.35, 0.85, 0.35], y: [0, -12, 0], rotate: [0, 8, -8, 0] }}
          transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon size={28} />
        </motion.div>
      ))}
    </div>
  );
}

function ConfettiBurst({ show }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: 8 + ((i * 5.1) % 84),
        drift: -90 + (i % 6) * 32,
        rotate: -180 + i * 23,
        delay: i * 0.03,
      })),
    []
  );

  return (
    <AnimatePresence>
      {show ? (
        <div className="confetti-layer" aria-hidden="true">
          {pieces.map((piece) => (
            <motion.div
              key={piece.id}
              className="confetti-piece"
              style={{ left: `${piece.left}%` }}
              initial={{ opacity: 0, scale: 0, y: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0.3, 1, 1, 0.8],
                y: [0, -70, 120],
                x: [0, piece.drift],
                rotate: [0, piece.rotate],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.6, delay: piece.delay, ease: 'easeOut' }}
            />
          ))}
        </div>
      ) : null}
    </AnimatePresence>
  );
}

export default function App() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [burstKey, setBurstKey] = useState(0);

  const decide = () => {
    if (isSpinning) return;
    setResult(null);
    setIsSpinning(true);

    window.setTimeout(() => {
      const picked = results[Math.floor(Math.random() * results.length)];
      setResult(picked);
      setIsSpinning(false);
      setBurstKey((k) => k + 1);
    }, 2200);
  };

  const reset = () => {
    if (isSpinning) return;
    setResult(null);
  };

  return (
    <div className="page-shell">
      <FloatingDecor />
      <ConfettiBurst key={burstKey} show={Boolean(result)} />

      <main className="layout">
        <section className="hero-copy">
          <div className="eyebrow">
            <Heart size={16} />
            Cute decision machine for your girlfriend
          </div>

          <h1>
            Should I cut
            <span> my hair?</span>
          </h1>

          <p className="lead">
            A playful little love-themed page that turns your haircut dilemma into a dramatic romantic reveal.
            Press the magic button and let fate decide.
          </p>

          <div className="button-row">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={decide}
              disabled={isSpinning}
              className="primary-button"
            >
              <Sparkles size={20} />
              {isSpinning ? 'Consulting the love universe...' : 'Tap to decide ✨'}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={reset}
              disabled={isSpinning && !result}
              className="secondary-button"
            >
              <RefreshCcw size={16} />
              Reset
            </motion.button>
          </div>

          <div className="tag-row">
            <span>Cute animations</span>
            <span>Random reveal</span>
            <span>Girlfriend-facing design</span>
          </div>
        </section>

        <section className="hero-card-wrap">
          <div className="hero-card">
            <div className="glass-overlay" />

            <div className="card-inner">
              <motion.div
                animate={
                  isSpinning
                    ? { rotate: [0, 360, 720, 1080], scale: [1, 1.12, 0.98, 1.08, 1] }
                    : { rotate: 0, scale: 1 }
                }
                transition={{ duration: 2.2, ease: [0.2, 0.8, 0.2, 1] }}
                className="orbital-wrap"
              >
                <div className="decision-orb">
                  <motion.div
                    animate={isSpinning ? { opacity: [0.3, 1, 0.3], scale: [0.9, 1.18, 0.9] } : { opacity: 0.9, scale: 1 }}
                    transition={{ duration: 1.2, repeat: isSpinning ? Infinity : 0, ease: 'easeInOut' }}
                    className="orb-ring ring-dashed"
                  />
                  <motion.div
                    animate={isSpinning ? { rotate: [0, -180, -360] } : { rotate: 0 }}
                    transition={{ duration: 2.2, ease: 'easeInOut' }}
                    className="orb-ring ring-solid"
                  />

                  <AnimatePresence mode="wait">
                    {result ? (
                      <motion.div
                        key={result.title}
                        initial={{ opacity: 0, scale: 0.7, rotateY: 90 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        exit={{ opacity: 0, scale: 0.7, rotateY: -90 }}
                        transition={{ duration: 0.55, ease: 'easeOut' }}
                        className="orb-content"
                      >
                        <div className="result-emoji">{result.emoji}</div>
                        <div className="result-arrived">Your answer has arrived</div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="idle"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="orb-content"
                      >
                        <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                          className="scissor-box"
                        >
                          <Scissors size={44} />
                        </motion.div>
                        <div className="orb-title">Hair Fate Machine</div>
                        <p className="orb-text">
                          Press the button and let this adorable oracle decide your hairstyle destiny.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              <AnimatePresence mode="wait">
                {result ? (
                  <motion.div
                    key={`${result.title}-details`}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.45, delay: 0.08 }}
                    className={`result-panel ${result.themeClass}`}
                  >
                    <div className="result-panel-inner">
                      <div className="result-badge">{result.badge}</div>
                      <h2>{result.title}</h2>
                      <p className="result-subtitle">{result.subtitle}</p>
                      <p className="result-reason">{result.reason}</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder-text"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="placeholder-copy"
                  >
                    <div className="placeholder-label">Awaiting your dramatic choice</div>
                    <p>
                      This page is built to feel sweet, playful, and a little magical — perfect for sending to your girlfriend and letting her enjoy the reveal with you.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
