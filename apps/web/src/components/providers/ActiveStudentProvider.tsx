'use client';

import React, { createContext, useContext, useState } from 'react';

interface ActiveStudentContextType {
  studentName: string;
  setStudentName: (name: string) => void;
}

const ActiveStudentContext = createContext<ActiveStudentContextType | undefined>(undefined);

export function ActiveStudentProvider({ children }: { children: React.ReactNode }) {
  const [studentName, setStudentName] = useState('VedicNeev Student');
  return (
    <ActiveStudentContext.Provider value={{ studentName, setStudentName }}>
      {children}
    </ActiveStudentContext.Provider>
  );
}

export function useActiveStudent() {
  const context = useContext(ActiveStudentContext);
  if (!context) {
    return { studentName: 'VedicNeev Student', setStudentName: () => {} };
  }
  return context;
}
