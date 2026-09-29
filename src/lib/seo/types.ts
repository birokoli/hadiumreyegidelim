import type { BacklinkSummary, DomainOverview, RankedKeyword } from "./dataforseo";

export type TrackedKeyword = {
  keyword: string;
  addedAt: string;
  history: { date: string; position: number | null; url: string | null }[];
  topThree?: { position: number; domain: string; title: string }[];
};

export type CompetitorRow = DomainOverview & { backlinks: BacklinkSummary | null };

export type CompetitorSnapshot = {
  checkedAt: string;
  rows: CompetitorRow[];
  ours: RankedKeyword[];
  backlinkError: string | null;
  cost: number;
};
