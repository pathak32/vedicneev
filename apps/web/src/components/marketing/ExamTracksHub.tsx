'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Award, CheckCircle2, ArrowRight, Shield, Play, Printer, ScanLine } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from '@vedicneev/ui';

import { useT } from '@/lib/i18n/useT';
import { BOARD_DATA, type BoardType, type ClassType } from '@/lib/marketing/examBoards';

export function ExamTracksHub() {
  const t = useT();
  const [selectedBoard, setSelectedBoard] = useState<BoardType>('jnvst');
  const [selectedClass, setSelectedClass] = useState<ClassType>('6');

  const currentBoardInfo = BOARD_DATA[selectedBoard];
  const currentClassInfo = currentBoardInfo.classes[selectedClass];

  return (
    <section className="py-16 bg-gradient-to-b from-white via-amber-50/30 to-white w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider border border-amber-200">
            <Shield className="w-3.5 h-3.5 text-amber-600" /> {t('examTracksHubBadge')}
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            {t('examTracksHubHeading')}
          </h2>
          <p className="text-sm sm:text-base text-gray-600">{t('examTracksHubSubheading')}</p>
        </div>

        {/* Board Selection Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {(Object.keys(BOARD_DATA) as BoardType[]).map((boardKey) => (
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
              {/* The acronym is always the first token — official exam board
                  names (JNVST/AISSEE/RMS) stay untranslated in every language. */}
              {t(BOARD_DATA[boardKey].nameKey).split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Class Level Selector (6 vs 9) */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-2">
            {t('targetClassLabel')}
          </span>
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
              {t('classLabel')} {cls}
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
                    {t(currentBoardInfo.badgeKey)}
                  </Badge>
                  <CardTitle className="text-xl sm:text-2xl font-black text-gray-900">
                    {t(currentBoardInfo.nameKey)} — {t('classLabel')} {selectedClass} {t('portalLabel')}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 mt-1">
                    {t(currentBoardInfo.descKey)}
                  </CardDescription>
                </div>
                <div className="text-right sm:block flex items-center justify-between bg-white p-3 rounded-2xl border border-amber-200">
                  <span className="block text-[10px] font-bold uppercase text-gray-400">{t('durationWeightLabel')}</span>
                  <span className="block text-sm font-black text-amber-600">{currentClassInfo.duration}</span>
                  <span className="block text-xs font-bold text-gray-700">{currentClassInfo.totalMarks}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-3">
                    {t('examSectionBreakdownLabel')}
                  </h4>
                  <ul className="space-y-2.5">
                    {currentClassInfo.sections.map((sec, idx) => (
                      <li key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs sm:text-sm font-semibold text-gray-800">
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          {t(sec.nameKey)}
                        </span>
                        <span className="font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                          {sec.q} · {sec.marks}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/exam-boards/${selectedBoard}`}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:underline"
                  >
                    {t('viewFullBoardDetails')}
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="flex flex-col justify-between space-y-6 bg-amber-50/40 p-6 rounded-2xl border border-amber-200/60">
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-900">
                      {t('eligibilityStandardsLabel')}
                    </h4>
                    <p className="text-xs sm:text-sm font-medium text-gray-700">
                      <strong>{t('requirementLabel')}</strong> {t(currentClassInfo.eligibilityKey)}
                    </p>
                    <p className="text-xs text-gray-600 leading-relaxed">{t('eligibilityBlueprintNote')}</p>
                  </div>

                  {/* Practice engine actions — moved here from the homepage's
                      standalone quick-start card so they carry the selected
                      board/class context instead of sitting context-free. */}
                  <div className="grid grid-cols-1 gap-2">
                    <Button asChild size="lg" className="w-full bg-amber-600 hover:bg-amber-700 text-white font-extrabold shadow-md gap-2 rounded-xl py-3">
                      <Link href={currentClassInfo.link}>
                        <Play className="w-4 h-4" />
                        {t('startMockTestLabel')}
                      </Link>
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button asChild variant="outline" size="sm" className="gap-1.5 rounded-xl">
                        <Link href="/exam/demo-jnvst/omr/print">
                          <Printer className="w-3.5 h-3.5" />
                          {t('printOmrLabel')}
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="gap-1.5 rounded-xl">
                        <Link href="/exam/demo-jnvst/omr/scan">
                          <ScanLine className="w-3.5 h-3.5" />
                          {t('scanOmrLabel')}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </section>
  );
}
