"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/components/admin/seo/ui";
import type { AiVisConfig, DailyStat, EngineId, Run } from "@/lib/ai-vis/types";

type Data = {
  config: AiVisConfig;
  cells: Record<string, Run[]>;
  daily: DailyStat[];
  available: EngineId[];
  readiness: { score: number; checkedAt: string } | null;
};

type Job = { promptId: string; engine: EngineId };
type Progress = { done: number; total: number; active: Job[]; cost: number; errors: number };

type Ctx = {
  data: Data | null;
  error: string;
  reload: () => Promise<void>;
  saveConfig: (patch: Partial<AiVisConfig>) => Promise<AiVisConfig | null>;
  /** Belirtilmezse: bütün sorular × seçili ve hazır motorlar */
  run: (jobs?: Job[]) => Promise<void>;
  progress: Progress | null;
  lastRun: { cost: number; errors: number; total: number; at: string } | null;
  runnableEngines: EngineId[];
};

const AiVisContext = createContext<Ctx | null>(null);

const CONCURRENCY = 3;

export function AiVisProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState<Progress | null>(null);
  const [lastRun, setLastRun] = useState<Ctx["lastRun"]>(null);
  const saving = useRef<Promise<void>>(Promise.resolve());

  const reload = useCallback(async () => {
    try {
      setData(await api<Data>("/api/admin/ai-vis/data"));
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const saveConfig = useCallback(
    async (patch: Partial<AiVisConfig>) => {
      if (!data) return null;
      try {
        const { config } = await api<{ config: AiVisConfig }>("/api/admin/ai-vis/config", {
          method: "PUT",
          body: JSON.stringify({ ...data.config, ...patch }),
        });
        setData((d) => (d ? { ...d, config } : d));
        return config;
      } catch (e) {
        setError((e as Error).message);
        return null;
      }
    },
    [data],
  );

  const runnableEngines = useMemo(
    () => (data ? data.config.engines.filter((e) => data.available.includes(e)) : []),
    [data],
  );

  const run = useCallback(
    async (jobs?: Job[]) => {
      if (!data || progress) return;
      const queue =
        jobs ?? data.config.prompts.flatMap((p) => runnableEngines.map((engine) => ({ promptId: p.id, engine })));
      if (!queue.length) return;
      const state: Progress = { done: 0, total: queue.length, active: [], cost: 0, errors: 0 };
      setProgress({ ...state });
      setError("");

      // Kayıtlar tek tek ve sırayla yazılır; aynı satıra eşzamanlı yazım olmaz
      const persist = (r: Run) => {
        saving.current = saving.current.then(async () => {
          try {
            const { cells, daily } = await api<{ cells: Data["cells"]; daily: DailyStat[] }>("/api/admin/ai-vis/save", {
              method: "POST",
              body: JSON.stringify({ runs: [r] }),
            });
            setData((d) => (d ? { ...d, cells, daily } : d));
          } catch (e) {
            setError(`Yanıt kaydedilemedi: ${(e as Error).message}`);
          }
        });
      };

      let cursor = 0;
      const worker = async () => {
        while (cursor < queue.length) {
          const job = queue[cursor++];
          state.active = [...state.active, job];
          setProgress({ ...state });
          try {
            const { run } = await api<{ run: Run }>("/api/admin/ai-vis/run", { method: "POST", body: JSON.stringify(job) });
            state.cost += run.cost;
            if (run.status === "error") state.errors++;
            persist(run);
          } catch (e) {
            state.errors++;
            setError((e as Error).message);
          }
          state.done++;
          state.active = state.active.filter((j) => j !== job);
          setProgress({ ...state });
        }
      };
      await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, worker));
      await saving.current;
      setLastRun({ cost: state.cost, errors: state.errors, total: state.total, at: new Date().toISOString() });
      setProgress(null);
    },
    [data, progress, runnableEngines],
  );

  return (
    <AiVisContext.Provider value={{ data, error, reload, saveConfig, run, progress, lastRun, runnableEngines }}>
      {children}
    </AiVisContext.Provider>
  );
}

export function useAiVis() {
  const ctx = useContext(AiVisContext);
  if (!ctx) throw new Error("useAiVis, AiVisProvider içinde kullanılmalı");
  return ctx;
}
