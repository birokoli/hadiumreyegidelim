"use client";

import React from "react";
import ExcelPricingCalculator from "@/components/admin/ExcelPricingCalculator";

export default function PricingCalculatorPage() {
  return (
    <div className="p-6 md:p-8 pt-24 md:pt-28 pb-16 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <ExcelPricingCalculator />
    </div>
  );
}
