"use client";

import { useEffect, useState } from "react";
import { getDiagLog, installDiagHandlers, recordDiag } from "@/lib/diag/log";
import { buildReport, type ServerDiag } from "@/lib/diag/report";

/**
 * "Hata raporu" düğmelerinin ortak mantığı: sunucu tanısı + tarayıcı kayıtları + ekrandaki
 * hata mesajlarından Markdown rapor üretir, panoya kopyalar ya da indirir.
 * `alertSelector`: rapora eklenecek ekrandaki hata öğeleri.
 */
export function useDiagReport(alertSelector = '.seo-desk [role="alert"]') {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [report, setReport] = useState("");

  useEffect(() => {
    installDiagHandlers();
  }, []);

  const build = async () => {
    setBusy(true);
    setStatus("");
    let server: ServerDiag | null = null;
    let serverError: string | null = null;
    try {
      const res = await fetch("/api/admin/diagnostics", { cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (res.ok) server = json as ServerDiag;
      else serverError = json.error || `HTTP ${res.status}`;
    } catch (e) {
      serverError = (e as Error).message;
      recordDiag({ kind: "api", method: "GET", url: "/api/admin/diagnostics", error: serverError });
    }
    const alerts = [...document.querySelectorAll(alertSelector)].map((el) => el.textContent?.trim() ?? "").filter(Boolean);
    const md = buildReport({ note, server, serverError, log: getDiagLog(), alerts, page: window.location.pathname + window.location.search });
    setReport(md);
    setBusy(false);
    return md;
  };

  const copy = async () => {
    const md = await build();
    try {
      await navigator.clipboard.writeText(md);
      setStatus("Panoya kopyalandı. Claude'a ya da Antigravity'ye yapıştırın.");
    } catch {
      // Clipboard API izni yoksa (ör. gömülü tarayıcı) eski yöntemle dene
      const ta = document.createElement("textarea");
      ta.value = md;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      setStatus(ok ? "Panoya kopyalandı. Claude'a ya da Antigravity'ye yapıştırın." : "Panoya kopyalanamadı; dosya olarak indirin.");
    }
  };

  const download = async () => {
    const md = report || (await build());
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([md], { type: "text/markdown;charset=utf-8" }));
    a.download = `hata-raporu-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(a.href);
    setStatus("İndirildi. Dosyayı sohbete sürükleyin.");
  };

  return { note, setNote, busy, status, report, copy, download };
}
