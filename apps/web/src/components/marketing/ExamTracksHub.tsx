'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Award, CheckCircle2, ArrowRight, Shield } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from '@vedicneev/ui';

import { useT } from '@/lib/i18n/useT';
import type { DictionaryKey } from '@/lib/i18n/dictionary';

type BoardType = 'jnvst' | 'aissee' | 'rms';
type ClassType = '6' | '9';

interface SectionInfo {
  nameKey: DictionaryKey;
  q: string;
  marks: string;
}

interface ClassInfo {
  eligibilityKey: DictionaryKey;
  duration: string;
  totalMarks: string;
  sections: SectionInfo[];
  link: string;
}

interface BoardInfo {
  nameKey: DictionaryKey;
  badgeKey: DictionaryKey;
  descKey: DictionaryKey;
  classes: Record<ClassType, ClassInfo>;
}

// Board configuration matrices — see dictionary.ts's "ExamTracksHub" section
// for the translated strings each *Key here resolves to.
const BOARD_DATA: Record<BoardType, BoardInfo> = {
  jnvst: {
    nameKey: 'boardJnvstName',
    badgeKey: 'boardJnvstBadge',
    descKey: 'boardJnvstDesc',
    classes: {
      '6': {
        eligibilityKey: 'eligJnvst6',
        duration: '120 Minutes',
        totalMarks: '100 Marks (80 Questions)',
        sections: [
          { nameKey: 'secMentalAbility', q: '40 Qs', marks: '50 M' },
          { nameKey: 'secArithmeticTest', q: '20 Qs', marks: '25 M' },
          { nameKey: 'secLanguageTest', q: '20 Qs', marks: '25 M' },
        ],
        link: '/exam/jnvst-live-mock',
      },
      '9': {
        eligibilityKey: 'eligJnvst9',
        duration: '150 Minutes',
        totalMarks: '100 Marks (100 Questions)',
        sections: [
          { nameKey: 'secMathematics', q: '35 Qs', marks: '35 M' },
          { nameKey: 'secEnglish', q: '15 Qs', marks: '15 M' },
          { nameKey: 'secScience', q: '35 Qs', marks: '35 M' },
          { nameKey: 'secSocialScience', q: '15 Qs', marks: '15 M' },
        ],
        link: '/exam/live/jnvst-class-9',
      },
    },
  },
  aissee: {
    nameKey: 'boardAisseeName',
    badgeKey: 'boardAisseeBadge',
    descKey: 'boardAisseeDesc',
    classes: {
      '6': {
        eligibilityKey: 'eligAissee6',
        duration: '150 Minutes',
        totalMarks: '300 Marks (125 Questions)',
        sections: [
          { nameKey: 'secMathematics', q: '50 Qs', marks: '150 M' },
          { nameKey: 'secIntelligenceReasoning', q: '25 Qs', marks: '50 M' },
          { nameKey: 'secLanguageEnglishRegional', q: '25 Qs', marks: '50 M' },
          { nameKey: 'secGeneralKnowledge', q: '25 Qs', marks: '50 M' },
        ],
        link: '/exam/live/aissee-class-6',
      },
      '9': {
        eligibilityKey: 'eligAissee9',
        duration: '180 Minutes',
        totalMarks: '400 Marks (150 Questions)',
        sections: [
          { nameKey: 'secMathematics', q: '50 Qs', marks: '200 M' },
          { nameKey: 'secIntelligence', q: '25 Qs', marks: '50 M' },
          { nameKey: 'secEnglish', q: '25 Qs', marks: '50 M' },
          { nameKey: 'secGeneralScience', q: '25 Qs', marks: '50 M' },
          { nameKey: 'secSocialStudies', q: '25 Qs', marks: '50 M' },
        ],
        link: '/exam/live/aissee-class-9',
      },
    },
  },
  rms: {
    nameKey: 'boardRmsName',
    badgeKey: 'boardRmsBadge',
    descKey: 'boardRmsDesc',
    classes: {
      '6': {
        eligibilityKey: 'eligRms6',
        duration: '150 Minutes',
        totalMarks: '150 Marks',
        sections: [
          { nameKey: 'secIntelligenceTest', q: '50 Qs', marks: '50 M' },
          { nameKey: 'secArithmetic', q: '50 Qs', marks: '50 M' },
          { nameKey: 'secGeneralKnowledge', q: '50 Qs', marks: '50 M' },
        ],
        link: '/exam/live/rms-class-6',
      },
      '9': {
        eligibilityKey: 'eligRms9',
        duration: '180 Minutes',
        totalMarks: '200 Marks',
        sections: [
          { nameKey: 'secEnglish', q: '50 Qs', marks: '50 M' },
          { nameKey: 'secHindi', q: '50 Qs', marks: '50 M' },
          { nameKey: 'secSocialScienceScience', q: '100 Qs', marks: '100 M' },
        ],
        link: '/exam/live/rms-class-9',
      },
    },
  },
};

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

                  <Button asChild size="lg" className="w-full bg-amber-600 hover:bg-amber-700 text-white font-extrabold shadow-md gap-2 rounded-xl py-3">
                    <Link href={currentClassInfo.link}>
                      {t('launchClassMockSimulation').replace('{class}', selectedClass)}
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
