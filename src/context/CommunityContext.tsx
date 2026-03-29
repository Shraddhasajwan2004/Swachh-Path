import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Report {
  id: string;
  userId: string;
  userName: string;
  avatarSeed: string;
  imageUrl: string;
  binId: string;
  binName: string;
  location: { lat: number; lng: number; address: string };
  description: string;
  timestamp: Date;
  status: 'pending' | 'verified' | 'resolved';
  upvotes: number;
  pointsAwarded: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
}

export const BADGES: Badge[] = [
  { id: 'scout',    name: 'Scout',    description: 'First report submitted', icon: '🔍', requirement: 1  },
  { id: 'reporter', name: 'Reporter', description: '5 verified reports',     icon: '📰', requirement: 5  },
  { id: 'guardian', name: 'Guardian', description: '10 verified reports',    icon: '🛡️', requirement: 10 },
  { id: 'champion', name: 'Champion', description: '25 verified reports',    icon: '🏆', requirement: 25 },
  { id: 'legend',   name: 'Legend',   description: '50 verified reports',    icon: '⭐', requirement: 50 },
];

export const POINTS_PER_REPORT   = 10;
export const POINTS_PER_VERIFIED = 25;
export const POINTS_PER_RESOLVED = 50;

const MOCK_REPORTS: Report[] = [
  {
    id: 'r1', userId: 'u2', userName: 'Priya Sharma', avatarSeed: 'priya',
    imageUrl: 'https://picsum.photos/seed/bin1/400/300',
    binId: 'BIN-003', binName: 'Connaught Place #3',
    location: { lat: 28.6315, lng: 77.2167, address: 'Connaught Place, Block C' },
    description: 'Wet compartment completely overflowing, spilling onto the pavement.',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    status: 'verified', upvotes: 8, pointsAwarded: 25,
  },
  {
    id: 'r2', userId: 'u3', userName: 'Arjun Mehta', avatarSeed: 'arjun',
    imageUrl: 'https://picsum.photos/seed/bin2/400/300',
    binId: 'BIN-007', binName: 'Lajpat Nagar #2',
    location: { lat: 28.5677, lng: 77.2432, address: 'Lajpat Nagar Market' },
    description: 'Bin lid is broken and trash is everywhere around it.',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    status: 'pending', upvotes: 3, pointsAwarded: 10,
  },
  {
    id: 'r3', userId: 'u4', userName: 'Sneha Gupta', avatarSeed: 'sneha',
    imageUrl: 'https://picsum.photos/seed/bin3/400/300',
    binId: 'BIN-011', binName: 'Saket Metro Exit',
    location: { lat: 28.5244, lng: 77.2066, address: 'Saket Metro Station, Gate 2' },
    description: 'Bin was collected quickly after my report. Great response!',
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    status: 'resolved', upvotes: 12, pointsAwarded: 50,
  },
  {
    id: 'r4', userId: 'u5', userName: 'Rahul Verma', avatarSeed: 'rahul',
    imageUrl: 'https://picsum.photos/seed/bin4/400/300',
    binId: 'BIN-002', binName: 'Connaught Place #2',
    location: { lat: 28.6325, lng: 77.2195, address: 'CP Inner Circle, Gate 5' },
    description: 'Dry waste bin is full and nobody has collected it since morning.',
    timestamp: new Date(Date.now() - 1000 * 60 * 200),
    status: 'pending', upvotes: 5, pointsAwarded: 10,
  },
  {
    id: 'r5', userId: 'u2', userName: 'Priya Sharma', avatarSeed: 'priya',
    imageUrl: 'https://picsum.photos/seed/bin5/400/300',
    binId: 'BIN-009', binName: 'Karol Bagh Market',
    location: { lat: 28.6516, lng: 77.1908, address: 'Karol Bagh Main Market' },
    description: 'Strong smell coming from the wet bin, looks like it has been full for 2 days.',
    timestamp: new Date(Date.now() - 1000 * 60 * 300),
    status: 'verified', upvotes: 9, pointsAwarded: 25,
  },
];

export function getUserStats(userId: string, reports: Report[]) {
  const mine     = reports.filter(r => r.userId === userId);
  const verified = mine.filter(r => r.status === 'verified' || r.status === 'resolved');
  const points   = mine.reduce((acc, r) => acc + r.pointsAwarded, 0);
  const badges   = BADGES.filter(b => verified.length >= b.requirement);
  return { total: mine.length, verified: verified.length, points, badges };
}

interface CommunityContextValue {
  reports: Report[];
  addReport: (report: Report) => void;
  upvoteReport: (id: string) => void;
  triggerReportForBin: (binId: string, binName: string, address: string) => void;
  pendingBinReport: { binId: string; binName: string; address: string } | null;
  clearPendingBinReport: () => void;
}

const CommunityContext = createContext<CommunityContextValue | null>(null);

export function CommunityProvider({ children }: { children: React.ReactNode }) {
  const [reports,          setReports]          = useState<Report[]>(MOCK_REPORTS);
  const [upvotedIds,       setUpvotedIds]       = useState<Set<string>>(new Set());
  const [pendingBinReport, setPendingBinReport] =
    useState<{ binId: string; binName: string; address: string } | null>(null);

  const addReport = useCallback((report: Report) => {
    setReports(prev => [report, ...prev]);
  }, []);

  const upvoteReport = useCallback((id: string) => {
    if (upvotedIds.has(id)) return;
    setUpvotedIds(prev => new Set(prev).add(id));
    setReports(prev => prev.map(r => r.id === id ? { ...r, upvotes: r.upvotes + 1 } : r));
  }, [upvotedIds]);

  const triggerReportForBin = useCallback(
    (binId: string, binName: string, address: string) => {
      setPendingBinReport({ binId, binName, address });
    }, []
  );

  const clearPendingBinReport = useCallback(() => setPendingBinReport(null), []);

  return (
    <CommunityContext.Provider value={{
      reports, addReport, upvoteReport,
      triggerReportForBin, pendingBinReport, clearPendingBinReport,
    }}>
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunity() {
  const ctx = useContext(CommunityContext);
  if (!ctx) throw new Error('useCommunity must be used inside <CommunityProvider>');
  return ctx;
}