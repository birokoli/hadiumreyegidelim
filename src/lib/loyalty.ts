import { prisma } from './prisma';

// ─── Tier Hesaplama ───────────────────────────────────────────────────────────

export function getMonthlyMultiplier(monthlySalesCountBefore: number): number {
  if (monthlySalesCountBefore < 20) return 1.00;
  if (monthlySalesCountBefore < 40) return 1.20;
  if (monthlySalesCountBefore < 70) return 1.35;
  return 1.50;
}

export function getMonthlyTierName(monthlySalesCountBefore: number): string {
  if (monthlySalesCountBefore < 20) return 'baslangic';
  if (monthlySalesCountBefore < 40) return 'hizli';
  if (monthlySalesCountBefore < 70) return 'uretken';
  return 'sampiyon';
}

export function getHonorTierName(yearlySales: number): string {
  if (yearlySales < 100) return 'yolcu';
  if (yearlySales < 250) return 'haci_adayi';
  if (yearlySales < 500) return 'haci';
  return 'veli';
}

export const TIER_LABELS: Record<string, string> = {
  baslangic: 'Başlangıç',
  hizli: 'Hızlı',
  uretken: 'Üretken',
  sampiyon: 'Şampiyon',
  yolcu: 'Yolcu',
  haci_adayi: 'Hacı Adayı',
  haci: 'Hacı',
  veli: 'Veli',
};

export const HONOR_BONUSES: Record<string, number> = {
  yolcu: 0,
  haci_adayi: 5000,
  haci: 15000,
  veli: 40000,
};

// ─── Puan Kazanımı ────────────────────────────────────────────────────────────

export async function awardPointsForSale(saleId: string) {
  const sale = await prisma.sale.findUnique({ where: { id: saleId } });
  if (!sale || !sale.influencerId) return;

  // İdempotency: çift puan vermeyi önle
  const existing = await prisma.loyaltyTransaction.findFirst({
    where: { sourceSaleId: saleId, transactionType: 'earn' },
  });
  if (existing) return;

  // Loyalty account getir veya oluştur
  const now = new Date();
  let account = await prisma.loyaltyAccount.findUnique({
    where: { influencerId: sale.influencerId },
  });

  if (!account) {
    account = await prisma.loyaltyAccount.create({
      data: {
        influencerId: sale.influencerId,
        currentMonthYear: now.getFullYear(),
        currentMonthNumber: now.getMonth() + 1,
        currentYear: now.getFullYear(),
      },
    });
  }

  // Ay değişti mi? Sıfırla
  let monthSalesCount = account.currentMonthSalesCount;
  if (
    account.currentMonthYear !== now.getFullYear() ||
    account.currentMonthNumber !== now.getMonth() + 1
  ) {
    // Arşivle
    await prisma.loyaltyMonthlyHistory.upsert({
      where: { accountId_year_month: { accountId: account.id, year: account.currentMonthYear, month: account.currentMonthNumber } },
      create: {
        accountId: account.id,
        year: account.currentMonthYear,
        month: account.currentMonthNumber,
        totalSales: account.currentMonthSalesCount,
        maxTierReached: account.currentMonthlyTier,
      },
      update: {
        totalSales: account.currentMonthSalesCount,
        maxTierReached: account.currentMonthlyTier,
      },
    });
    monthSalesCount = 0;

    await prisma.loyaltyAccount.update({
      where: { id: account.id },
      data: {
        currentMonthYear: now.getFullYear(),
        currentMonthNumber: now.getMonth() + 1,
        currentMonthSalesCount: 0,
        currentMonthlyTier: 'baslangic',
      },
    });
  }

  // Komisyon hesapla
  const commissionRate = sale.lockedCommissionRate ?? sale.commissionRate;
  const cashValue = sale.saleAmount * commissionRate;
  const basePoints = Math.floor(cashValue * 10);
  const multiplier = getMonthlyMultiplier(monthSalesCount);
  const tierName = getMonthlyTierName(monthSalesCount);
  const finalPoints = Math.floor(basePoints * multiplier);
  const newMonthCount = monthSalesCount + 1;
  const newYearCount = account.yearlySalesCount + 1;
  const newMonthTier = getMonthlyTierName(newMonthCount);
  const newHonorTier = getHonorTierName(newYearCount);

  // Transaction + hesap güncelle
  await prisma.$transaction([
    prisma.loyaltyTransaction.create({
      data: {
        accountId: account.id,
        transactionType: 'earn',
        pointsAmount: finalPoints,
        cashEquivalent: cashValue * multiplier,
        sourceSaleId: saleId,
        basePoints,
        multiplierApplied: multiplier,
        tierAtEarn: tierName,
        monthlySaleNumber: newMonthCount,
        description: `Satış #${saleId.slice(-6)} - Aylık #${newMonthCount}`,
        metadata: JSON.stringify({ saleAmount: sale.saleAmount, commissionRate, monthlyCountBefore: monthSalesCount }),
      },
    }),
    prisma.loyaltyAccount.update({
      where: { id: account.id },
      data: {
        currentBalance: { increment: finalPoints },
        lifetimeEarned: { increment: finalPoints },
        currentMonthSalesCount: newMonthCount,
        currentMonthlyTier: newMonthTier,
        yearlySalesCount: newYearCount,
        currentHonorTier: newHonorTier,
        lastActivityAt: now,
      },
    }),
    prisma.sale.update({
      where: { id: saleId },
      data: {
        pointsEarned: finalPoints,
        monthlyTierAtSale: tierName,
        monthlyMultiplierAtSale: multiplier,
        monthlySaleNumberAtSale: newMonthCount,
      },
    }),
  ]);
}

// ─── Puan İadesi (satış iptal) ────────────────────────────────────────────────

export async function reversePointsForRefund(saleId: string) {
  const earnTx = await prisma.loyaltyTransaction.findFirst({
    where: { sourceSaleId: saleId, transactionType: 'earn', isReversed: false },
  });
  if (!earnTx) return;

  await prisma.$transaction([
    prisma.loyaltyTransaction.create({
      data: {
        accountId: earnTx.accountId,
        transactionType: 'refund',
        pointsAmount: -earnTx.pointsAmount,
        cashEquivalent: -earnTx.cashEquivalent,
        sourceSaleId: saleId,
        reversedByTxId: earnTx.id,
        description: `İADE: Satış #${saleId.slice(-6)} iptal edildi`,
      },
    }),
    prisma.loyaltyTransaction.update({
      where: { id: earnTx.id },
      data: { isReversed: true },
    }),
    prisma.loyaltyAccount.update({
      where: { id: earnTx.accountId },
      data: {
        currentBalance: { decrement: earnTx.pointsAmount },
        yearlySalesCount: { decrement: 1 },
      },
    }),
  ]);
}

// ─── Harcama Talebi ───────────────────────────────────────────────────────────

export async function requestRedemption(params: {
  influencerId: string;
  redemptionType: string;
  pointsUsed: number;
  targetUser?: string;
  targetFullName?: string;
  targetTcNo?: string;
  targetPhone?: string;
  umrePackageName?: string;
  catalogItemId?: string;
  bankIban?: string;
  hybridCustomerPayment?: number;
  notes?: string;
}) {
  const account = await prisma.loyaltyAccount.findUnique({
    where: { influencerId: params.influencerId },
  });

  if (!account) throw new Error('Loyalty hesabı bulunamadı');
  if (account.currentBalance < params.pointsUsed) throw new Error('Yetersiz puan');

  const { redemptionType, pointsUsed } = params;

  if (redemptionType === 'cash' && pointsUsed < 2500)
    throw new Error('En az 2.500 puan çekilebilir');

  if (redemptionType === 'free_umrah') {
    const recentUmrahs = await prisma.loyaltyRedemption.count({
      where: {
        accountId: account.id,
        redemptionType: 'free_umrah',
        status: { in: ['approved', 'completed'] },
        requestedAt: { gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
      },
    });
    if (recentUmrahs >= 2) throw new Error('Yılda en fazla 2 ücretsiz umre kullanılabilir');
  }

  if (redemptionType === 'hybrid_umrah' && pointsUsed < 10000)
    throw new Error('Karma kullanımda en az 10.000 puan gerekli');

  if (redemptionType === 'customer_discount') {
    if (pointsUsed < 5000) throw new Error('En az 5.000 puan gerekli');
    if (pointsUsed > 100000) throw new Error('En fazla 100.000 puan kullanılabilir');
  }

  let discountCouponCode: string | undefined;
  let expiresAt: Date | undefined;
  if (redemptionType === 'customer_discount') {
    discountCouponCode = `DISC-${params.influencerId.slice(-6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  const redemption = await prisma.loyaltyRedemption.create({
    data: {
      accountId: account.id,
      redemptionType,
      pointsUsed,
      cashValue: pointsUsed / 10,
      targetUser: params.targetUser,
      targetFullName: params.targetFullName,
      targetTcNo: params.targetTcNo,
      targetPhone: params.targetPhone,
      umrePackageName: params.umrePackageName,
      catalogItemId: params.catalogItemId,
      bankIban: params.bankIban,
      hybridCustomerPayment: params.hybridCustomerPayment,
      discountCouponCode,
      discountAmount: redemptionType === 'customer_discount' ? pointsUsed / 10 : undefined,
      expiresAt,
      notes: params.notes,
    },
  });

  await prisma.loyaltyAccount.update({
    where: { id: account.id },
    data: { lastActivityAt: new Date() },
  });

  return redemption;
}

// ─── Admin: Onay / Red ────────────────────────────────────────────────────────

export async function approveRedemption(redemptionId: string, adminId: string) {
  const redemption = await prisma.loyaltyRedemption.findUnique({ where: { id: redemptionId } });
  if (!redemption || redemption.status !== 'pending') throw new Error('Talep bulunamadı veya beklemede değil');

  await prisma.$transaction([
    prisma.loyaltyRedemption.update({
      where: { id: redemptionId },
      data: { status: 'approved', reviewedAt: new Date(), reviewedBy: adminId },
    }),
    prisma.loyaltyTransaction.create({
      data: {
        accountId: redemption.accountId,
        transactionType: 'redeem',
        pointsAmount: -redemption.pointsUsed,
        cashEquivalent: -redemption.cashValue,
        redemptionId: redemption.id,
        description: `Harcama onaylandı - ${redemption.redemptionType}`,
      },
    }),
    prisma.loyaltyAccount.update({
      where: { id: redemption.accountId },
      data: {
        currentBalance: { decrement: redemption.pointsUsed },
        lifetimeRedeemed: { increment: redemption.pointsUsed },
        lastActivityAt: new Date(),
      },
    }),
  ]);
}

export async function rejectRedemption(redemptionId: string, adminId: string, reason: string) {
  await prisma.loyaltyRedemption.update({
    where: { id: redemptionId },
    data: { status: 'rejected', rejectionReason: reason, reviewedAt: new Date(), reviewedBy: adminId },
  });
}

// ─── Admin: Manuel Puan Ayarı ─────────────────────────────────────────────────

export async function adjustPoints(influencerId: string, pointsAmount: number, reason: string) {
  const account = await prisma.loyaltyAccount.findUnique({ where: { influencerId } });
  if (!account) throw new Error('Hesap bulunamadı');

  await prisma.$transaction([
    prisma.loyaltyTransaction.create({
      data: {
        accountId: account.id,
        transactionType: 'adjust',
        pointsAmount,
        cashEquivalent: pointsAmount / 10,
        description: `Manuel ayarlama: ${reason}`,
      },
    }),
    prisma.loyaltyAccount.update({
      where: { id: account.id },
      data: {
        currentBalance: { increment: pointsAmount },
        lifetimeEarned: pointsAmount > 0 ? { increment: pointsAmount } : undefined,
        lastActivityAt: new Date(),
      },
    }),
  ]);
}

// ─── Hesap özet bilgisi ───────────────────────────────────────────────────────

export function buildAccountSummary(account: {
  currentBalance: number;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
  currentMonthSalesCount: number;
  currentMonthlyTier: string;
  currentHonorTier: string;
  yearlySalesCount: number;
  lastActivityAt: Date;
}) {
  const multiplier = getMonthlyMultiplier(account.currentMonthSalesCount);

  const nextMonthlyTierThresholds: Record<string, number | null> = {
    baslangic: 20,
    hizli: 40,
    uretken: 70,
    sampiyon: null,
  };
  const nextHonorTierThresholds: Record<string, number | null> = {
    yolcu: 100,
    haci_adayi: 250,
    haci: 500,
    veli: null,
  };

  const nextMonthlyThreshold = nextMonthlyTierThresholds[account.currentMonthlyTier];
  const nextHonorThreshold = nextHonorTierThresholds[account.currentHonorTier];

  const expireDate = new Date(account.lastActivityAt);
  expireDate.setMonth(expireDate.getMonth() + 24);
  const daysUntilExpiry = Math.floor((expireDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return {
    currentBalance: account.currentBalance,
    lifetimeEarned: account.lifetimeEarned,
    lifetimeRedeemed: account.lifetimeRedeemed,
    currentMonthlyTier: account.currentMonthlyTier,
    currentMonthlyTierLabel: TIER_LABELS[account.currentMonthlyTier],
    currentMonthSalesCount: account.currentMonthSalesCount,
    monthlyMultiplier: multiplier,
    nextMonthlyTier: nextMonthlyThreshold ? getMonthlyTierName(nextMonthlyThreshold) : null,
    nextMonthlyTierLabel: nextMonthlyThreshold ? TIER_LABELS[getMonthlyTierName(nextMonthlyThreshold)] : null,
    salesToNextMonthlyTier: nextMonthlyThreshold ? nextMonthlyThreshold - account.currentMonthSalesCount : null,
    currentHonorTier: account.currentHonorTier,
    currentHonorTierLabel: TIER_LABELS[account.currentHonorTier],
    yearlySalesCount: account.yearlySalesCount,
    nextHonorTier: nextHonorThreshold ? getHonorTierName(nextHonorThreshold) : null,
    nextHonorTierLabel: nextHonorThreshold ? TIER_LABELS[getHonorTierName(nextHonorThreshold)] : null,
    salesToNextHonorTier: nextHonorThreshold ? nextHonorThreshold - account.yearlySalesCount : null,
    daysUntilExpiry,
    cashEquivalent: account.currentBalance / 10,
  };
}
