/**
 * affiliate.ts — Affiliate Program Servis Katmanı (TypeScript)
 *
 * Python AffiliateService + CommissionEngine'in Prisma karşılığı.
 * Tüm iş mantığı burada; route'lar sadece ince bir HTTP katmanıdır.
 */

import { prisma } from './prisma';

// ─────────────────────────────────────────────────────────
// YARDIMCI FONKSİYONLAR
// ─────────────────────────────────────────────────────────

/** Dönem string'i: "YYYY-MM-01" (ayın ilk günü) */
export function currentPeriod(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
}

/** Bir önceki ay dönem string'i */
export function previousPeriod(date = new Date()): string {
  const d = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  return currentPeriod(d);
}

/**
 * Performans skorunu (0–100) komisyon oranına (%) çevirir.
 * Kademe tablosu:
 *   0–40   -> %3
 *   41–60  -> %4
 *   61–75  -> %5
 *   76–90  -> %6
 *   91–100 -> %7
 */
export function scoreToRate(score: number, startRate = 3.0, maxRate = 7.0): number {
  let rate: number;
  if (score <= 40) rate = 3.0;
  else if (score <= 60) rate = 4.0;
  else if (score <= 75) rate = 5.0;
  else if (score <= 90) rate = 6.0;
  else rate = 7.0;
  return Math.min(Math.max(rate, startRate), maxRate);
}

/** Min-maks normalizasyon (0–100). Tüm değerler eşitse 50 döner. */
function minMaxNormalize(value: number, lo: number, hi: number): number {
  if (hi <= lo) return 50.0;
  return ((value - lo) / (hi - lo)) * 100.0;
}

// ─────────────────────────────────────────────────────────
// PROGRAM CONFIG
// ─────────────────────────────────────────────────────────

export async function getConfig() {
  let cfg = await prisma.programConfig.findUnique({ where: { id: 1 } });
  if (!cfg) {
    // İlk çalıştırmada default config oluştur
    cfg = await prisma.programConfig.create({ data: { id: 1 } });
  }
  return cfg;
}

// ─────────────────────────────────────────────────────────
// EŞİK YÖNETİMİ
// ─────────────────────────────────────────────────────────

/**
 * Belirli dönem için etkin eşik:
 *   (admin override varsa o, yoksa taban) - (o dönem qualify olan referral indirimleri toplamı)
 *   minThreshold ile sınırlı.
 */
export async function effectiveThreshold(
  influencerId: string,
  period?: string
): Promise<number> {
  const p = period ?? currentPeriod();
  const cfg = await getConfig();

  const influencer = await prisma.influencer.findUnique({
    where: { id: influencerId },
    select: { baseThrOverride: true },
  });

  const base =
    influencer?.baseThrOverride != null
      ? influencer.baseThrOverride
      : cfg.baseThreshold;

  // O dönemde qualify olan referral indirimleri
  const reductions = await prisma.referralQualification.aggregate({
    where: { referrerId: influencerId, period: p },
    _sum: { reduction: true },
  });
  const totalReduction = reductions._sum.reduction ?? 0;

  return Math.max(cfg.minThreshold, base - totalReduction);
}

// ─────────────────────────────────────────────────────────
// GEÇERLİ SATIŞ SAYISI
// ─────────────────────────────────────────────────────────

/** Influencer'ın toplam geçerli (commissionStatus='earned') satış sayısı */
export async function validSalesCount(influencerId: string): Promise<number> {
  return prisma.sale.count({
    where: { influencerId, commissionStatus: 'earned' },
  });
}

// ─────────────────────────────────────────────────────────
// PROGRAM AÇILIŞ (UNLOCK)
// ─────────────────────────────────────────────────────────

export async function checkAndUnlock(influencerId: string): Promise<{
  unlocked: boolean;
  newlyUnlocked: boolean;
  threshold?: number;
  validSales?: number;
  remaining?: number;
}> {
  const influencer = await prisma.influencer.findUnique({
    where: { id: influencerId },
    select: { programUnlocked: true },
  });

  if (influencer?.programUnlocked) {
    return { unlocked: true, newlyUnlocked: false };
  }

  const threshold = await effectiveThreshold(influencerId);
  const valid = await validSalesCount(influencerId);

  if (valid >= threshold) {
    await prisma.influencer.update({
      where: { id: influencerId },
      data: { programUnlocked: true, unlockedAt: new Date() },
    });
    return { unlocked: true, newlyUnlocked: true, threshold, validSales: valid };
  }

  return {
    unlocked: false,
    newlyUnlocked: false,
    threshold,
    validSales: valid,
    remaining: threshold - valid,
  };
}

// ─────────────────────────────────────────────────────────
// REFERRAL (DAVET) SİSTEMİ
// ─────────────────────────────────────────────────────────

/**
 * Bir influencer'ı başka birinin davetiyle kaydeder.
 * Henüz indirim UYGULANMAZ — davet edilen ilk satış yapılınca uygulanır.
 */
export async function registerInvite(
  referrerId: string,
  invitedId: string
): Promise<string> {
  const existing = await prisma.referral.findUnique({
    where: { invitedId },
  });
  if (existing) {
    throw new Error('Bu kişi zaten birinin daveti ile kayıtlı.');
  }

  const referral = await prisma.referral.create({
    data: { referrerId, invitedId },
  });
  return referral.id;
}

/**
 * Davet edilen kişinin ilk satışı geldiğinde çağrılır.
 * Davet edenin O DÖNEMKİ eşiğini referralReduction kadar düşürür.
 * Bir davet bir dönemde yalnızca bir kez indirim sağlar.
 */
export async function qualifyReferralOnFirstSale(
  invitedId: string,
  period?: string
): Promise<object> {
  const p = period ?? currentPeriod();
  const cfg = await getConfig();

  const referral = await prisma.referral.findUnique({
    where: { invitedId },
    select: { id: true, referrerId: true },
  });

  if (!referral) {
    return { qualified: false, reason: 'davet kaydı yok' };
  }

  // Bu davet bu dönemde zaten indirim sağladı mı?
  const existing = await prisma.referralQualification.findUnique({
    where: { referralId_period: { referralId: referral.id, period: p } },
  });

  if (existing) {
    return {
      qualified: false,
      reason: 'bu davet bu dönemde zaten indirim sağladı',
      referrerId: referral.referrerId,
    };
  }

  // Dönem bazlı indirim kaydı
  await prisma.referralQualification.create({
    data: {
      referralId: referral.id,
      referrerId: referral.referrerId,
      period: p,
      reduction: cfg.referralReduction,
    },
  });

  // Referrals tablosunda genel "qualified" işareti güncelle
  await prisma.referral.update({
    where: { id: referral.id },
    data: {
      qualified: true,
      qualifiedAt: new Date(),
      qualifiedPeriod: p,
      reductionApplied: cfg.referralReduction,
    },
  });

  const newThreshold = await effectiveThreshold(referral.referrerId, p);
  const unlock = await checkAndUnlock(referral.referrerId);

  return {
    qualified: true,
    referrerId: referral.referrerId,
    period: p,
    reduction: cfg.referralReduction,
    newEffectiveThreshold: newThreshold,
    referrerUnlock: unlock,
  };
}

// ─────────────────────────────────────────────────────────
// YILDIZ İŞLEMLERİ
// ─────────────────────────────────────────────────────────

export async function starBalance(influencerId: string): Promise<number> {
  const result = await prisma.starLedger.aggregate({
    where: { influencerId },
    _sum: { delta: true },
  });
  return result._sum.delta ?? 0;
}

const VALID_REASONS = [
  'commission',
  'admin_adjust',
  'withdraw',
  'gift_redeem',
  'referral_bonus',
  'reversal',
] as const;

export async function addStars(
  influencerId: string,
  delta: number,
  reason: string,
  opts?: { note?: string; createdBy?: string; refSaleId?: string }
): Promise<void> {
  if (!VALID_REASONS.includes(reason as (typeof VALID_REASONS)[number])) {
    throw new Error(`Geçersiz reason: ${reason}`);
  }
  await prisma.starLedger.create({
    data: {
      influencerId,
      delta,
      reason,
      note: opts?.note,
      createdBy: opts?.createdBy ?? 'system',
      refSaleId: opts?.refSaleId,
    },
  });
}

export async function adminAdjustStars(
  influencerId: string,
  delta: number,
  admin: string,
  note: string
): Promise<void> {
  if (!note) throw new Error('Admin düzeltmesi için açıklama (note) zorunludur.');
  await addStars(influencerId, delta, 'admin_adjust', { note, createdBy: admin });
}

// ─────────────────────────────────────────────────────────
// KOMİSYON ORANI
// ─────────────────────────────────────────────────────────

/**
 * Bir önceki dönemde hesaplanan oran bu döneme uygulanır (ileriye dönük).
 * Hiç skor yoksa startRate döner.
 */
export async function currentRate(
  influencerId: string,
  period?: string
): Promise<number> {
  const p = period ?? currentPeriod();
  const cfg = await getConfig();

  const score = await prisma.performanceScore.findFirst({
    where: { influencerId, period: { lt: p } },
    orderBy: { period: 'desc' },
    select: { commissionRate: true },
  });

  return score ? score.commissionRate : cfg.startRate;
}

// ─────────────────────────────────────────────────────────
// DÖNEM SKOR HESABI
// ─────────────────────────────────────────────────────────

/**
 * Bir dönemin tüm aktif influencer'ları için performans skoru hesaplar ve kaydeder.
 * Atanan oran BİR SONRAKİ döneme uygulanır.
 */
export async function computeAndStorePeriod(period: string): Promise<object[]> {
  const cfg = await getConfig();

  // Aktif influencer'ları al
  const influencers = await prisma.influencer.findMany({
    where: { status: 'active' },
    select: { id: true },
  });

  if (influencers.length === 0) return [];

  // Performance events (impressions, clicks)
  const events = await prisma.performanceEvent.findMany({
    where: { period },
    select: { influencerId: true, impressions: true, clicks: true },
  });
  const eventMap = new Map(events.map(e => [e.influencerId, e]));

  // Valid sales per influencer for this period
  const salesRows = await prisma.sale.groupBy({
    by: ['influencerId'],
    where: { affiliatePeriod: period, commissionStatus: 'earned' },
    _count: { id: true },
  });
  const salesMap = new Map(
    salesRows.map(r => [r.influencerId, r._count.id])
  );

  // Build raw metrics
  interface RawMetric {
    influencerId: string;
    impressions: number;
    clicks: number;
    validSales: number;
    ctr: number;
    cvr: number;
    volume: number;
  }

  const metrics: RawMetric[] = influencers.map(inf => {
    const ev = eventMap.get(inf.id);
    const impressions = ev?.impressions ?? 0;
    const clicks = ev?.clicks ?? 0;
    const validSales = salesMap.get(inf.id) ?? 0;
    const ctr = impressions > 0 ? clicks / impressions : 0;
    const cvr = clicks > 0 ? validSales / clicks : 0;
    return { influencerId: inf.id, impressions, clicks, validSales, ctr, cvr, volume: validSales };
  });

  if (metrics.length === 0) return [];

  // Normalize
  const ctrs = metrics.map(m => m.ctr);
  const cvrs = metrics.map(m => m.cvr);
  const vols = metrics.map(m => m.volume);

  const ctrLo = Math.min(...ctrs), ctrHi = Math.max(...ctrs);
  const cvrLo = Math.min(...cvrs), cvrHi = Math.max(...cvrs);
  const volLo = Math.min(...vols), volHi = Math.max(...vols);

  const results: object[] = [];

  for (const m of metrics) {
    const ctrNorm = minMaxNormalize(m.ctr, ctrLo, ctrHi);
    const cvrNorm = minMaxNormalize(m.cvr, cvrLo, cvrHi);
    const volNorm = minMaxNormalize(m.volume, volLo, volHi);

    const score = Math.round(
      (cfg.weightCvr * cvrNorm + cfg.weightVolume * volNorm + cfg.weightCtr * ctrNorm) * 100
    ) / 100;

    const commissionRate = scoreToRate(score, cfg.startRate, cfg.maxRate);

    await prisma.performanceScore.upsert({
      where: { influencerId_period: { influencerId: m.influencerId, period } },
      create: {
        influencerId: m.influencerId,
        period,
        ctr: Math.round(m.ctr * 100000) / 100000,
        cvr: Math.round(m.cvr * 100000) / 100000,
        volume: m.volume,
        ctrNorm: Math.round(ctrNorm * 100) / 100,
        cvrNorm: Math.round(cvrNorm * 100) / 100,
        volumeNorm: Math.round(volNorm * 100) / 100,
        score,
        commissionRate,
        computedAt: new Date(),
      },
      update: {
        ctr: Math.round(m.ctr * 100000) / 100000,
        cvr: Math.round(m.cvr * 100000) / 100000,
        volume: m.volume,
        ctrNorm: Math.round(ctrNorm * 100) / 100,
        cvrNorm: Math.round(cvrNorm * 100) / 100,
        volumeNorm: Math.round(volNorm * 100) / 100,
        score,
        commissionRate,
        computedAt: new Date(),
      },
    });

    results.push({ influencerId: m.influencerId, score, commissionRate });
  }

  return results;
}

// ─────────────────────────────────────────────────────────
// KOMİSYON HESABI
// ─────────────────────────────────────────────────────────

/** TL komisyonu yıldıza çevirir (1 yıldız = starToTry TL) */
async function tryToStars(amountTry: number): Promise<number> {
  const cfg = await getConfig();
  return Math.round(amountTry / cfg.starToTry);
}

/**
 * Program açıldığında: o ana kadarki tüm geçerli ama henüz komisyonlanmamış
 * satışların komisyonunu topluca hesapla ve yıldız olarak yatır.
 */
export async function settleOnUnlock(
  influencerId: string,
  period: string,
  admin = 'system'
): Promise<object> {
  // Daha önce komisyon yatırılmış satışları hariç tut
  const commissionnedSaleIds = await prisma.starLedger.findMany({
    where: { influencerId, reason: 'commission', refSaleId: { not: null } },
    select: { refSaleId: true },
  });
  const commissionnedIds = commissionnedSaleIds
    .map(s => s.refSaleId!)
    .filter(Boolean);

  const sales = await prisma.sale.findMany({
    where: {
      influencerId,
      commissionStatus: 'earned',
      id: { notIn: commissionnedIds },
    },
    select: { id: true, saleAmount: true },
  });

  const rate = await currentRate(influencerId, period);
  let totalTry = 0;
  let totalStars = 0;

  for (const sale of sales) {
    const commission = sale.saleAmount * (rate / 100);
    const stars = await tryToStars(commission);
    await addStars(influencerId, stars, 'commission', {
      note: `Satış #${sale.id} komisyonu (%${rate.toFixed(0)})`,
      createdBy: admin,
      refSaleId: sale.id,
    });
    totalTry += commission;
    totalStars += stars;
  }

  return {
    settledSales: sales.length,
    rate,
    totalCommissionTry: Math.round(totalTry * 100) / 100,
    totalStars,
  };
}

/**
 * Program zaten açıksa: tek satışın komisyonunu anında yıldıza çevirir.
 */
export async function accrueOneSale(
  saleId: string,
  period: string,
  admin = 'system'
): Promise<object> {
  const sale = await prisma.sale.findUnique({
    where: { id: saleId },
    select: { influencerId: true, saleAmount: true },
  });
  if (!sale || !sale.influencerId) throw new Error('Satış bulunamadı.');

  const rate = await currentRate(sale.influencerId, period);
  const commission = sale.saleAmount * (rate / 100);
  const stars = await tryToStars(commission);

  await addStars(sale.influencerId, stars, 'commission', {
    note: `Satış #${saleId} komisyonu (%${rate.toFixed(0)})`,
    createdBy: admin,
    refSaleId: saleId,
  });

  return {
    saleId,
    rate,
    commissionTry: Math.round(commission * 100) / 100,
    stars,
  };
}

/**
 * Bir satış geçerli olduğunda çağrılacak ANA fonksiyon.
 * 1) Referral qualify tetikler (davet edenin eşiğini düşürür)
 * 2) Eşik dolmuşsa unlock + toplu ödeme
 * 3) Program zaten açıksa -> tek satış komisyonu
 * 4) Eşik dolmadıysa -> beklet
 */
export async function onValidSale(
  saleId: string,
  period?: string,
  admin = 'system'
): Promise<object> {
  const p = period ?? currentPeriod();

  const sale = await prisma.sale.findUnique({
    where: { id: saleId },
    select: { influencerId: true },
  });
  if (!sale || !sale.influencerId) throw new Error('Satış bulunamadı.');

  const influencerId = sale.influencerId;

  // 1) Referral qualify — bu satışı yapan kişi biri tarafından davet edildiyse
  const referralResult = await qualifyReferralOnFirstSale(influencerId, p);

  // 2) Bu satışı yapan kişinin programını kontrol et
  const influencer = await prisma.influencer.findUnique({
    where: { id: influencerId },
    select: { programUnlocked: true },
  });

  if (influencer?.programUnlocked) {
    const accrueResult = await accrueOneSale(saleId, p, admin);
    return { mode: 'single', referral: referralResult, ...accrueResult };
  }

  const unlock = await checkAndUnlock(influencerId);
  if (unlock.newlyUnlocked) {
    const settle = await settleOnUnlock(influencerId, p, admin);
    return { mode: 'unlock_bulk', referral: referralResult, unlock, settle };
  }

  return { mode: 'pending', referral: referralResult, unlock };
}

// ─────────────────────────────────────────────────────────
// DİĞER
// ─────────────────────────────────────────────────────────

/** İlk paylaşım aktivasyonunu işaretle */
export async function markFirstShare(influencerId: string): Promise<void> {
  await prisma.influencer.updateMany({
    where: { id: influencerId, firstShareAt: null },
    data: { firstShareAt: new Date() },
  });
}
