'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Award, BookOpen, CheckCircle2, ArrowRight, Shield } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from '@vedicneev/ui';

type BoardType = 'jnvst' | 'aissee' | 'rms';
type ClassType = '6' | '9';

export function ExamTracksHub() {
  const [selectedBoard, setSelectedBoard] = useState<BoardType>('jnvst');
  const [selectedClass, setSelectedClass] = useState<ClassType>('6');

  // Board configuration matrices
  const boardData = {
    jnvst: {
      name: 'JNVST (Jawahar Navodaya Vidyalaya)',
      badge: 'Navodaya Selection Test',
      description: 'Central government residential schools providing quality education to talented rural children.',
      classes: {
        '6': {
          eligibility: 'Studying in Class 5',
          duration: '120 Minutes',
          totalMarks: '100 Marks (80 Questions)',
          sections: [
            { name: 'Mental Ability (Reasoning)', q: '40 Qs', marks: '50 M' },
            { name: 'Arithmetic Test (Maths & Vedic Shortcuts)', q: '20 Qs', marks: '25 M' },
            { name: 'Language Test (Regional / English)', q: '20 Qs', marks: '25 M' }
          ],
          link: '/exam/jnvst-live-mock'
        },
        '9': {
          eligibility: 'Studying in Class 8',
          duration: '150 Minutes',
          totalMarks: '100 Marks (100 Questions)',
          sections: [
            { name: 'Mathematics', q: '35 Qs', marks: '35 M' },
            { name: 'English', q: '15 Qs', marks: '15 M' },
            { name: 'Science', q: '35 Qs', marks: '35 M' },
            { name: 'Social Science', q: '15 Qs', marks: '15 M' }
          ],
          link: '/exam/live/jnvst-class-9'
        }
      }
    },
    aissee: {
      name: 'AISSEE (All India Sainik School)',
      badge: 'Ministry of Defence Entrance',
      description: 'Preparing young cadets for leadership roles in the National Defence Academy (NDA) and armed forces.',
      classes: {
        '6': {
          eligibility: 'Ages 10-12 years (Class 5 student)',
          duration: '150 Minutes',
          totalMarks: '300 Marks (125 Questions)',
          sections: [
            { name: 'Mathematics', q: '50 Qs', marks: '150 M' },
            { name: 'Intelligence (Reasoning)', q: '25 Qs', marks: '50 M' },
            { name: 'Language (English/Regional)', q: '25 Qs', marks: '50 M' },
            { name: 'General Knowledge', q: '25 Qs', marks: '50 M' }
          ],
          link: '/exam/live/aissee-class-6'
        },
        '9': {
          eligibility: 'Ages 13-15 years (Class 8 student)',
          duration: '180 Minutes',
          totalMarks: '400 Marks (150 Questions)',
          sections: [
            { name: 'Mathematics', q: '50 Qs', marks: '200 M' },
            { name: 'Intelligence', q: '25 Qs', marks: '50 M' },
            { name: 'English', q: '25 Qs', marks: '50 M' },
            { name: 'General Science', q: '25 Qs', marks: '50 M' },
            { name: 'Social Studies', q: '25 Qs', marks: '50 M' }
          ],
          link: '/exam/live/aissee-class-9'
        }
      }
    },
    rms: {
      name: 'RMS (Rashtriya Military Schools)',
      badge: 'Premier Military Boarding',
      description: 'Historic military residential schools with elite academic rigor and disciplined lifestyle standards.',
      classes: {
        '6': {
          eligibility: 'Ages 10-11 years (Class 5)',
          duration: '150 Minutes',
          totalMarks: '150 Marks',
          sections: [
            { name: 'Intelligence Test', q: '50 Qs', marks: '50 M' },
            { name: 'Arithmetic', q: '50 Qs', marks: '50 M' },
            { name: 'General Knowledge', q: '50 Qs', marks: '50 M' }
          ],
          link: '/exam/live/rms-class-6'
        },
        '9': {
          eligibility: 'Ages 13-14 years (Class 8)',
          duration: '180 Minutes',
          totalMarks: '200 Marks',
          sections: [
            { name: 'English', q: '50 Qs', marks: '50 M' },
            { name: 'Hindi', q: '50 Qs', marks: '50 M' },
            { name: 'Social Science & Science', q: '100 Qs', marks: '100 M' }
          ],
          link: '/exam/live/rms-class-9'
        }
      }
    }
  };

  const currentBoardInfo = boardData[selectedBoard];
  const currentClassInfo = currentBoardInfo.classes[selectedClass];

  return (
    <section className="py-16 bg-gradient-to-b from-white via-amber-50/30 to-white w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider border border-amber-200">
            <Shield className="w-3.5 h-3.5 text-amber-600" /> Operational Exam Tracks Hub
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Targeted Pathways for Classes 6 & 9
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Select your target boarding school board and grade level to review exact exam patterns, mark weights, and launch live simulations.
          </p>
        </div>

        {/* Board Selection Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {(Object.keys(boardData) as BoardType[]).map((boardKey) => (
            <button
              key={boardKey}
              onClick={() => setSelectedBoard(boardKey)}
              className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all border shadow-xs flex items-center gap-2 ${
                selectedBoard === boardKey
                  ? 'bg-amber-600 text-white border-amber-600 shadow-md scale-105'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-amber-50'
              }`}
            >
              <Award className="w-4 h-4" />
              {boardData[boardKey].name.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Class Level Selector (6 vs 9) */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-2">Target Class:</span>
          {(['6', '9'] as ClassType[]).map((cls) => (
            <button
              key={cls}
              onClick={() => setSelectedClass(cls)}
              className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
                selectedClass === cls
                  ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              Class {cls}
            </button>
          ))}
        </div>

        {/* Board Details Card */}
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-amber-200 shadow-lg rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-amber-50/60 border-b border-amber-100 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <Badge variant="outline" className="mb-2 border-amber-300 text-amber-900 bg-amber-100 font-bold text-xs">
                    {currentBoardInfo.badge}
                  </Badge>
                  <CardTitle className="text-xl sm:text-2xl font-black text-gray-900">
                    {currentBoardInfo.name} — Class {selectedClass} Portal
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 mt-1">
                    {currentBoardInfo.description}
                  </CardDescription>
                </div>
                <div className="text-right sm:block flex items-center justify-between bg-white p-3 rounded-2xl border border-amber-200">
                  <span className="block text-[10px] font-bold uppercase text-gray-400">Duration & Weight</span>
                  <span className="block text-sm font-black text-amber-600">{currentClassInfo.duration}</span>
                  <span className="block text-xs font-bold text-gray-700">{currentClassInfo.totalMarks}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-3">Exam Section Breakdown</h4>
                  <ul className="space-y-2.5">
                    {currentClassInfo.sections.map((sec, idx) => (
                      <li key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs sm:text-sm font-semibold text-gray-800">
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          {sec.name}
                        </span>
                        <span className="font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                          {sec.q} · {sec.marks}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col justify-between space-y-6 bg-amber-50/40 p-6 rounded-2xl border border-amber-200/60">
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-900">Eligibility & Standards</h4>
                    <p className="text-xs sm:text-sm font-medium text-gray-700">
                      <strong>Requirement:</strong> {currentClassInfo.eligibility}
                    </p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Simulated strictly according to official National Testing Agency (NTA) & Sainik School Society board blueprints with real-percentile ranking.
                    </p>
                  </div>

                  <Button asChild size="lg" className="w-full bg-amber-600 hover:bg-amber-700 text-white font-extrabold shadow-md gap-2 rounded-xl py-3">
                    <Link href={currentClassInfo.link}>
                      Launch Class {selectedClass} Mock Simulation
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </section>
  );
}
