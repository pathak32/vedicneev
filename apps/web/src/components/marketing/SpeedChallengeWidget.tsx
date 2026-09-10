'use client';

import React, { useState, useEffect } from 'react';
import { Timer, Zap, AlertTriangle, CheckCircle, ArrowRight, RotateCcw, UserCheck, Phone, GraduationCap } from 'lucide-react';
import Link from 'next/link';

interface Question {
  id: string;
  question: string;
  options: string[];
  correct: number;
  topic: string;
}

export function SpeedChallengeWidget() {
  const [gameState, setGameState] = useState<'idle' | 'loading' | 'playing' | 'lead_capture' | 'gameover'>('idle');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Lead Capture State
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState<6 | 9>(6);
  const [mobileNumber, setMobileNumber] = useState('');
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);

  // Timer effect (10 seconds per question)
  useEffect(() => {
    if (gameState !== 'playing') return;

    if (timeLeft === 0) {
      handleAnswer(-1, true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, gameState]);

  const startGame = async () => {
    setGameState('loading');
    setLoadError(null);
    try {
      const res = await fetch('/api/speed-challenge/questions');
      const data = await res.json();
      if (!res.ok || !data.success || data.questions.length === 0) {
        setLoadError(data.error ?? 'No Speed Challenge questions are available right now.');
        setGameState('idle');
        return;
      }
      setQuestions(data.questions);
      setCurrentIndex(0);
      setScore(0);
      setStrikes(0);
      setTimeLeft(10);
      setGameState('playing');
    } catch (err) {
      console.error('Failed to load speed challenge questions', err);
      setLoadError('Network error — please try again.');
      setGameState('idle');
    }
  };

  const handleAnswer = (optionIdx: number, isTimeout: boolean = false) => {
    if (selectedOption !== null && !isTimeout) return;
    setSelectedOption(optionIdx);

    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    const isCorrect = !isTimeout && optionIdx === currentQ.correct;

    let newStrikes = strikes;
    let newScore = score;

    if (isCorrect) {
      newScore += 1;
      setScore(newScore);
    } else {
      newStrikes += 1;
      setStrikes(newStrikes);
    }

    setTimeout(() => {
      setSelectedOption(null);
      if (newStrikes >= 3 || currentIndex + 1 >= questions.length) {
        setGameState('lead_capture');
      } else {
        setCurrentIndex((prev) => prev + 1);
        setTimeLeft(10);
      }
    }, isTimeout ? 200 : 600);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(mobileNumber)) {
      setLeadError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setLeadError(null);
    setIsSubmittingLead(true);

    try {
      const res = await fetch('/api/speed-challenge/lead-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName,
          targetClass: studentClass,
          mobileNumber,
          score,
          strikes,
          questionCount: currentIndex + 1,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Could not save your details.');
      setGameState('gameover');
    } catch (err) {
      setLeadError(err instanceof Error ? err.message : 'Could not save your details.');
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const currentQ = questions[currentIndex];

  return (
    <div className="w-full max-w-2xl mx-auto bg-gradient-to-br from-gray-900 to-gray-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-amber-500/30">
      
      {/* IDLE / LOADING STATE */}
      {(gameState === 'idle' || gameState === 'loading') && (
        <div className="text-center space-y-6 py-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-wider border border-amber-500/20">
            <Zap className="w-4 h-4 text-amber-400 animate-pulse" /> Live 10-Second Speed Challenge
          </div>
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
            Test Your Entrance Exam Speed!
          </h3>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Answer under 10 seconds per question. Unattempted timeouts count as wrong answers.
            Game over on <span className="text-red-400 font-bold">3 total wrong/missed answers</span>.
          </p>
          {loadError ? <p className="text-xs font-semibold text-red-400">{loadError}</p> : null}
          <button
            onClick={startGame}
            disabled={gameState === 'loading'}
            className="bg-amber-600 hover:bg-amber-500 text-white font-black px-8 py-4 rounded-2xl shadow-lg transition-all transform hover:scale-105 cursor-pointer text-base disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          >
            {gameState === 'loading' ? 'Loading…' : 'Start Speed Challenge Now 🚀'}
          </button>
        </div>
      )}

      {/* PLAYING STATE */}
      {gameState === 'playing' && questions.length > 0 && currentQ && (
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-gray-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold bg-amber-500/20 text-amber-400 px-3 py-1 rounded-lg">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-xs text-gray-400 font-medium">
                Topic: {currentQ.topic}
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-sm font-bold">
              <div className="flex items-center gap-1 text-emerald-400">
                <CheckCircle className="w-4 h-4" /> {score}
              </div>
              <div className="flex items-center gap-1 text-red-400">
                <AlertTriangle className="w-4 h-4" /> {strikes}/3 Strikes
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono ${timeLeft <= 3 ? 'bg-red-500/20 text-red-400 animate-bounce' : 'bg-gray-800 text-amber-400'}`}>
                <Timer className="w-4 h-4" /> {timeLeft}s
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-lg sm:text-xl font-bold text-gray-100">
              {currentQ.question}
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrectOpt = idx === currentQ.correct;
              
              let btnStyle = "bg-gray-800/80 border-gray-700 hover:border-amber-500 text-gray-200";
              if (selectedOption !== null) {
                if (isCorrectOpt) btnStyle = "bg-emerald-600 border-emerald-500 text-white";
                else if (isSelected) btnStyle = "bg-red-600 border-red-500 text-white";
              }

              return (
                <button
                  key={idx}
                  disabled={selectedOption !== null}
                  onClick={() => handleAnswer(idx, false)}
                  className={`p-4 rounded-xl border text-left font-bold transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                >
                  <span>{option}</span>
                  <span className="text-xs opacity-60 font-mono">[{String.fromCharCode(65 + idx)}]</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* LEAD CAPTURE STATE */}
      {gameState === 'lead_capture' && (
        <form onSubmit={handleLeadSubmit} className="space-y-5 py-2 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-wider border border-amber-500/20">
            Challenge Finished! 🎉
          </div>
          
          <h3 className="text-2xl font-black">
            Unlock Your Speed Diagnostic Report
          </h3>
          <p className="text-gray-400 text-xs max-w-sm mx-auto">
            You scored <span className="text-emerald-400 font-bold">{score} correct</span> with <span className="text-red-400 font-bold">{strikes} strikes</span> (including timeouts). Enter details to view your complete breakdown.
          </p>

          <div className="space-y-3 max-w-sm mx-auto text-left">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Student Name</label>
              <div className="relative">
                <UserCheck className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                <input 
                  type="text"
                  required
                  placeholder="Enter student name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 pl-10 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Target Class</label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                <select
                  value={studentClass}
                  onChange={(e) => setStudentClass(Number(e.target.value) as 6 | 9)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 pl-10 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value={6}>Class 6 (JNVST / AISSEE / RMS)</option>
                  <option value={9}>Class 9 (JNVST / AISSEE / RMS)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Parent / Student Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                <input 
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 pl-10 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {leadError ? <p className="text-xs font-semibold text-red-400">{leadError}</p> : null}

          <button
            type="submit"
            disabled={isSubmittingLead}
            className="w-full max-w-sm bg-amber-600 hover:bg-amber-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all cursor-pointer text-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmittingLead ? 'Generating Report...' : 'View My Detailed Analysis 📊'}
          </button>
        </form>
      )}

      {/* GAME OVER & DETAILED ANALYSIS STATE */}
      {gameState === 'gameover' && (
        <div className="space-y-6 text-center py-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
            Report Generated for {studentName || 'Aspirant'} (Class {studentClass})
          </div>
          
          <h3 className="text-2xl sm:text-3xl font-black">
            Performance Analysis Report
          </h3>

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto py-2">
            <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl">
              <p className="text-xs text-gray-400">Correct Answers</p>
              <p className="text-2xl font-black text-emerald-400">{score}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl">
              <p className="text-xs text-gray-400">Mistake/Timeout Strikes</p>
              <p className="text-2xl font-black text-red-400">{strikes}/3</p>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl text-left space-y-2 max-w-md mx-auto">
            <h5 className="font-bold text-amber-400 text-xs uppercase tracking-wider">Diagnostic Feedback:</h5>
            <p className="text-xs text-gray-300 leading-relaxed">
              {score >= 3
                ? `Great calculation reflexes, ${studentName}! To secure a top rank in Class ${studentClass}, you need advanced Vedic calculation modules and strict timed mocks.`
                : `You hit your 3 strike limit (including timeouts), ${studentName}. Structured practice with Vedic Math shortcuts will help you improve response speed for Class ${studentClass}.`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button 
              onClick={startGame}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-bold px-6 py-3 rounded-xl transition-all text-sm cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
            <Link 
              href="/exam/jnvst-live-mock"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all text-sm"
            >
              Unlock Full Mock Series <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
