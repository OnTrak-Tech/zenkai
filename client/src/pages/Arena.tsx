import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getRandomQuestions, TriviaQuestion } from '../data/triviaQuestions';

type GamePhase = 'countdown' | 'playing' | 'encrypting' | 'results';

const QUESTIONS_PER_GAME = 10;
const SECONDS_PER_QUESTION = 15;

const Arena: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const wager = (location.state as any)?.wager || '1';

  // Game state
  const [phase, setPhase] = useState<GamePhase>('countdown');
  const [countdownValue, setCountdownValue] = useState(3);
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [opponentScore, setOpponentScore] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load questions on mount
  useEffect(() => {
    setQuestions(getRandomQuestions(QUESTIONS_PER_GAME));
  }, []);

  // --- Countdown Phase ---
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdownValue <= 0) {
      setPhase('playing');
      return;
    }
    const t = setTimeout(() => setCountdownValue((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdownValue]);

  // --- Per-question Timer ---
  useEffect(() => {
    if (phase !== 'playing' || answerState !== 'idle') return;

    setTimeLeft(SECONDS_PER_QUESTION);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up — auto-skip
          clearInterval(timerRef.current!);
          advanceQuestion();
          return SECONDS_PER_QUESTION;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, currentIndex, answerState]);

  // --- Advance to next question or end game ---
  const advanceQuestion = useCallback(() => {
    if (currentIndex >= QUESTIONS_PER_GAME - 1) {
      // End of game
      if (timerRef.current) clearInterval(timerRef.current);
      setPhase('encrypting');
      // Simulate ZK-proof + opponent score generation
      setTimeout(() => {
        // Simulated opponent: gets 40-80% correct
        const simulated = Math.floor(Math.random() * 5) + 4; // 4-8 out of 10
        setOpponentScore(simulated);
        setPhase('results');
      }, 4000);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setAnswerState('idle');
    }
  }, [currentIndex]);

  // --- Handle answer selection ---
  const handleAnswer = (index: number) => {
    if (answerState !== 'idle' || phase !== 'playing') return;

    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedAnswer(index);

    const isCorrect = index === questions[currentIndex].correctIndex;
    if (isCorrect) {
      setScore((s) => s + 1);
      setAnswerState('correct');
    } else {
      setAnswerState('wrong');
    }

    // Brief pause to show feedback, then advance
    setTimeout(() => {
      advanceQuestion();
    }, 1200);
  };

  const currentQuestion = questions[currentIndex];
  const outcome = score > opponentScore ? 'WIN' : score < opponentScore ? 'LOSS' : 'DRAW';

  // --- RENDER ---
  return (
    <div className="flex flex-col h-[calc(100vh-56px)] overflow-hidden relative bg-background">

      {/* ========== COUNTDOWN PHASE ========== */}
      {phase === 'countdown' && (
        <div className="absolute inset-0 z-50 bg-background flex flex-col items-center justify-center">
          <div key={countdownValue} className="animate-countdown">
            {countdownValue > 0 ? (
              <span className="font-display font-black text-[120px] text-primary drop-shadow-[0_0_40px_rgba(255,45,120,0.8)]">
                {countdownValue}
              </span>
            ) : (
              <span className="font-display font-black text-7xl text-secondary drop-shadow-[0_0_40px_rgba(45,255,180,0.8)] uppercase tracking-widest">
                GO!
              </span>
            )}
          </div>
          <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mt-8">
            {QUESTIONS_PER_GAME} Questions • {SECONDS_PER_QUESTION}s Each • {wager} cUSD
          </p>
        </div>
      )}

      {/* ========== ENCRYPTING PHASE ========== */}
      {phase === 'encrypting' && (
        <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-xs space-y-6">
            <h2 className="text-center font-display font-black text-2xl text-primary uppercase tracking-widest animate-pulse">
              ENCRYPTING RESULTS
            </h2>
            <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-[loading_4s_ease-in-out_forwards]"></div>
            </div>
            <p className="text-center font-label text-xs text-on-surface-variant uppercase tracking-widest">
              Generating ZK-Proof...
            </p>
            <div className="flex justify-between font-headline text-sm text-on-surface-variant">
              <span>Your Score: <span className="text-secondary font-bold">{score}/{QUESTIONS_PER_GAME}</span></span>
              <span>Verifying...</span>
            </div>
          </div>
        </div>
      )}

      {/* ========== RESULTS PHASE ========== */}
      {phase === 'results' && (
        <div className="absolute inset-0 z-50 bg-background flex flex-col items-center justify-center p-6">
          <h2 className={`text-6xl font-display font-black uppercase tracking-tighter mb-2 ${
            outcome === 'WIN' ? 'text-secondary drop-shadow-[0_0_30px_rgba(45,255,180,0.8)]' :
            outcome === 'LOSS' ? 'text-error drop-shadow-[0_0_30px_rgba(255,45,45,0.8)]' :
            'text-tertiary drop-shadow-[0_0_30px_rgba(255,224,74,0.8)]'
          }`}>
            {outcome === 'WIN' ? 'VICTORY' : outcome === 'LOSS' ? 'DEFEAT' : 'DRAW'}
          </h2>

          {/* Score comparison */}
          <div className="flex items-center gap-8 my-8">
            <div className="flex flex-col items-center">
              <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">You</span>
              <span className="font-display font-black text-5xl text-secondary">{score}</span>
            </div>
            <span className="font-display font-black text-2xl text-on-surface-variant/30">VS</span>
            <div className="flex flex-col items-center">
              <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Opponent</span>
              <span className="font-display font-black text-5xl text-error">{opponentScore}</span>
            </div>
          </div>

          {/* cUSD delta */}
          <div className={`text-3xl font-headline font-bold mb-12 ${
            outcome === 'WIN' ? 'text-secondary animate-bounce' :
            outcome === 'LOSS' ? 'text-error' :
            'text-tertiary'
          }`}>
            {outcome === 'WIN' ? `+${wager}` : outcome === 'LOSS' ? `-${wager}` : '±0'} cUSD
          </div>

          <button
            onClick={() => navigate('/lobby')}
            className="w-full max-w-xs py-4 bg-primary text-on-primary font-display font-bold text-xl uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-transform shadow-[0_0_20px_rgba(255,45,120,0.4)]"
          >
            PLAY AGAIN
          </button>
        </div>
      )}

      {/* ========== PLAYING PHASE (Main UI) ========== */}
      {phase === 'playing' && currentQuestion && (
        <>
          {/* Top Bar: Progress + Timer */}
          <div className="px-4 pt-4 pb-2 space-y-3">
            {/* Progress */}
            <div className="flex justify-between items-center">
              <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">
                Question {currentIndex + 1}/{QUESTIONS_PER_GAME}
              </span>
              <span className="font-headline font-bold text-sm text-secondary">
                Score: {score}
              </span>
            </div>

            {/* Timer Bar */}
            <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-linear"
                style={{
                  width: `${(timeLeft / SECONDS_PER_QUESTION) * 100}%`,
                  backgroundColor: timeLeft <= 5 ? '#ff4444' : timeLeft <= 10 ? '#ffe04a' : '#2dffb4',
                }}
              />
            </div>

            {/* Timer number */}
            <div className="text-center">
              <span className={`font-display font-black text-lg ${
                timeLeft <= 5 ? 'text-error animate-pulse' : 'text-on-surface-variant'
              }`}>
                {timeLeft}s
              </span>
            </div>
          </div>

          {/* Question Card */}
          <div className="flex-1 flex flex-col px-4 pb-4">
            <div className="bg-surface-container rounded-2xl border border-outline-variant/30 p-6 mb-4 flex-shrink-0 shadow-lg">
              <p className="font-headline font-bold text-lg text-on-surface leading-relaxed">
                {currentQuestion.question}
              </p>
            </div>

            {/* Answer Buttons */}
            <div className="flex-1 flex flex-col gap-3 justify-center">
              {currentQuestion.options.map((option, i) => {
                const labels = ['A', 'B', 'C', 'D'];
                let btnClass = 'bg-surface-container border-outline-variant/50 text-on-surface hover:border-secondary/50 active:scale-[0.98]';

                if (answerState !== 'idle') {
                  if (i === currentQuestion.correctIndex) {
                    btnClass = 'bg-secondary/20 border-secondary text-secondary shadow-[0_0_15px_rgba(45,255,180,0.3)]';
                  } else if (i === selectedAnswer && answerState === 'wrong') {
                    btnClass = 'bg-error/20 border-error text-error shadow-[0_0_15px_rgba(255,45,45,0.3)] animate-[shake_0.3s_ease-in-out]';
                  } else {
                    btnClass = 'bg-surface-container border-outline-variant/20 text-on-surface-variant/40';
                  }
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={answerState !== 'idle'}
                    className={`w-full py-4 px-5 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 text-left ${btnClass}`}
                  >
                    <span className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center font-display font-bold text-sm flex-shrink-0">
                      {labels[i]}
                    </span>
                    <span className="font-headline font-bold text-sm leading-snug">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom: Wager reminder */}
          <div className="px-4 py-3 border-t border-outline-variant/20 bg-surface-container-low flex justify-between items-center">
            <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">Wager</span>
            <span className="font-headline font-bold text-sm text-primary neon-text-glow">{wager} cUSD</span>
          </div>
        </>
      )}
    </div>
  );
};

export default Arena;
