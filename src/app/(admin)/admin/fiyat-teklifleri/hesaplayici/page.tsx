"use client";

import React from "react";
import ExcelPricingCalculator from "@/components/admin/ExcelPricingCalculator";

export default function PricingCalculatorPage() {
  return (
    <div className="p-8 pt-24 min-h-screen bg-slate-50 dark:bg-slate-950">
      <ExcelPricingCalculator />
    </div>
  );
}
