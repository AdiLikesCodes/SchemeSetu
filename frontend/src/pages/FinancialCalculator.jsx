import { useState, useMemo, useEffect } from 'react'
import { Calculator, ArrowRight, AlertTriangle, Info, PieChart, Landmark, HelpCircle, Loader2, ServerCog } from 'lucide-react'
import useChatStore from '../store/chatStore'
import { TermExplainer } from '../components/PlainLanguageModal'
import NextStepCard from '../components/NextStepCard'

export default function FinancialCalculator() {
  const { calculatorInput, updateCalculatorInput, selectedScheme, setActiveTab, runFinancialSimulation, simulationResult, simulationLoading } = useChatStore()

  // State inputs
  const [loanAmount, setLoanAmount] = useState(calculatorInput.loanAmount || 300000)
  const [interestRate, setInterestRate] = useState(calculatorInput.interestRate || 6.0)
  const [tenureYears, setTenureYears] = useState(calculatorInput.tenureYears || 5)
  const [moratoriumMonths, setMoratoriumMonths] = useState(calculatorInput.moratoriumMonths || 6)
  const [ownContribution, setOwnContribution] = useState(calculatorInput.ownContribution || 30000)

  // Quick preset amount buttons for users with low digital literacy
  const presetAmounts = [50000, 100000, 300000, 500000]

  // Calculations
  const results = useMemo(() => {
    const totalProjectCost = Number(loanAmount) + Number(ownContribution)
    const principal = Number(loanAmount)
    const rate = Number(interestRate) / 100 / 12
    const totalMonths = Number(tenureYears) * 12

    let emi = 0
    let totalRepayment = 0
    let totalInterest = 0

    if (principal > 0 && rate > 0 && totalMonths > 0) {
      emi = Math.round(
        (principal * rate * Math.pow(1 + rate, totalMonths)) /
          (Math.pow(1 + rate, totalMonths) - 1)
      )
      totalRepayment = emi * totalMonths
      totalInterest = Math.max(0, totalRepayment - principal)
    }

    // Percentage breakdown
    const principalPct = totalRepayment > 0 ? Math.round((principal / totalRepayment) * 100) : 70
    const interestPct = 100 - principalPct

    return {
      totalProjectCost,
      principal,
      emi,
      totalInterest,
      totalRepayment,
      principalPct,
      interestPct,
    }
  }, [loanAmount, interestRate, tenureYears, ownContribution])

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#D9E1E8] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div className="space-y-1">
          <span className="text-xs font-bold text-[#1E5AA8] uppercase tracking-wider">Financial Estimator</span>
          <h1 className="text-xl md:text-2xl font-black text-[#12304A]">Estimate Your Loan Repayment</h1>
          <p className="text-xs md:text-sm text-[#667085]">
            See what your monthly payment (EMI) and total repayment will be before visiting the bank or agency.
          </p>
        </div>

        {selectedScheme && (
          <div className="shrink-0 p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs">
            <span className="text-[#667085] block font-medium">Selected Scheme:</span>
            <p className="font-extrabold text-[#12304A]">{selectedScheme.name}</p>
          </div>
        )}
      </div>

      {/* ── Main 2-Column Grid: Inputs vs Results ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Inputs */}
        <div className="lg:col-span-7 bg-white border border-[#D9E1E8] rounded-2xl p-6 space-y-5 shadow-2xs">
          <h2 className="text-base font-extrabold text-[#12304A] border-b border-gray-100 pb-3">
            Loan Requirements
          </h2>

          {/* Loan Amount Slider + Quick Presets */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-[#12304A]">Loan Amount (Principal Required)</label>
              <span className="font-mono font-black text-sm text-[#1E5AA8]">
                ₹{Number(loanAmount).toLocaleString('en-IN')}
              </span>
            </div>

            <input
              type="range"
              min={25000}
              max={1500000}
              step={25000}
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1E5AA8]"
            />

            {/* Quick preset chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-[11px] text-[#667085] self-center">Quick pick:</span>
              {presetAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setLoanAmount(amt)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    loanAmount === amt
                      ? 'bg-[#12304A] text-white'
                      : 'bg-[#F6F8FA] hover:bg-gray-100 text-[#12304A] border border-[#D9E1E8]'
                  }`}
                >
                  ₹{(amt / 100000).toFixed(1)} Lakh
                </button>
              ))}
            </div>
          </div>

          {/* Own Contribution (Margin Money) */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-1">
                <label className="font-bold text-[#12304A]">Own Contribution (Margin Money)</label>
                <TermExplainer term="margin money" label="?" />
              </div>
              <span className="font-mono font-bold text-xs text-[#16834B]">
                ₹{Number(ownContribution).toLocaleString('en-IN')}
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={200000}
              step={5000}
              value={ownContribution}
              onChange={(e) => setOwnContribution(Number(e.target.value))}
              className="w-full h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#16834B]"
            />
            <p className="text-[11px] text-[#667085]">
              Most government schemes require only 5% to 10% own contribution.
            </p>
          </div>

          {/* Interest Rate & Tenure Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 border-t border-gray-100">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#12304A]">Interest Rate (% p.a.)</label>
                <TermExplainer term="interest rate" label="?" />
              </div>
              <input
                type="number"
                step="0.5"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full bg-[#F6F8FA] border border-[#D9E1E8] rounded-xl px-3 py-2.5 text-xs font-bold text-[#12304A] focus:outline-none focus:border-[#1E5AA8]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#12304A]">Tenure (Years)</label>
              <input
                type="number"
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                className="w-full bg-[#F6F8FA] border border-[#D9E1E8] rounded-xl px-3 py-2.5 text-xs font-bold text-[#12304A] focus:outline-none focus:border-[#1E5AA8]"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#12304A]">Moratorium (Months)</label>
                <TermExplainer term="moratorium" label="?" />
              </div>
              <input
                type="number"
                value={moratoriumMonths}
                onChange={(e) => setMoratoriumMonths(Number(e.target.value))}
                className="w-full bg-[#F6F8FA] border border-[#D9E1E8] rounded-xl px-3 py-2.5 text-xs font-bold text-[#12304A] focus:outline-none focus:border-[#1E5AA8]"
              />
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Results Card */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white border-2 border-[#1E5AA8] rounded-2xl p-6 space-y-5 shadow-sm">
            <h2 className="text-base font-extrabold text-[#12304A] border-b border-gray-100 pb-3">
              Estimated Repayment Summary
            </h2>

            {/* Estimated EMI Highlight */}
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-center space-y-1">
              <span className="text-xs font-bold text-[#1E5AA8] uppercase">Estimated Monthly Installment (EMI)</span>
              <div className="text-3xl font-black text-[#12304A]">
                ₹{results.emi.toLocaleString('en-IN')} <span className="text-xs font-normal text-[#667085]">/ month</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-[#17212B]">
              <div className="flex justify-between p-3 rounded-xl bg-[#F6F8FA] border border-[#D9E1E8]">
                <span className="text-[#667085]">Total Interest Payable:</span>
                <span className="font-bold text-[#12304A]">₹{results.totalInterest.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between p-3 rounded-xl bg-[#F6F8FA] border border-[#D9E1E8]">
                <span className="text-[#667085]">Total Repayment Amount:</span>
                <span className="font-bold text-[#12304A]">₹{results.totalRepayment.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between p-3 rounded-xl bg-[#F6F8FA] border border-[#D9E1E8]">
                <span className="text-[#667085]">Grace Period (Moratorium):</span>
                <span className="font-bold text-[#16834B]">{moratoriumMonths} Months</span>
              </div>
            </div>

            {/* Visual Repayment Breakdown Bar */}
            <div className="space-y-1.5 pt-2 border-t border-gray-100">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-[#1E5AA8]">Principal Loan: {results.principalPct}%</span>
                <span className="text-[#E67E22]">Interest: {results.interestPct}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 flex overflow-hidden">
                <div className="bg-[#1E5AA8] h-full" style={{ width: `${results.principalPct}%` }} />
                <div className="bg-[#E67E22] h-full" style={{ width: `${results.interestPct}%` }} />
              </div>
            </div>

            <button
              onClick={() => setActiveTab('partner-finder')}
              className="w-full touch-target py-3 rounded-xl bg-[#12304A] hover:bg-[#153A5B] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-2xs cursor-pointer"
            >
              <span>Find Where to Apply</span>
              <ArrowRight size={15} />
            </button>

            {selectedScheme && (
              <button
                onClick={() => runFinancialSimulation(selectedScheme.id, loanAmount)}
                disabled={simulationLoading}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-slate-700"
              >
                {simulationLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Running Simulation…</span>
                  </>
                ) : (
                  <>
                    <ServerCog size={14} />
                    <span>Run Backend Simulation</span>
                  </>
                )}
              </button>
            )}

            {simulationResult && (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/40 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <ServerCog size={14} />
                  <span>Backend Deterministic Engine Result</span>
                </div>
                <div className="space-y-2 text-xs">
                  {simulationResult.emi_amount && (
                    <div className="flex justify-between p-2 rounded-lg bg-slate-800/50">
                      <span className="text-slate-400">EMI (Engine):</span>
                      <span className="font-bold text-emerald-300">₹{simulationResult.emi_amount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {simulationResult.subsidy_amount != null && (
                    <div className="flex justify-between p-2 rounded-lg bg-slate-800/50">
                      <span className="text-slate-400">Subsidy:</span>
                      <span className="font-bold text-emerald-300">₹{Number(simulationResult.subsidy_amount).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {simulationResult.margin_money != null && (
                    <div className="flex justify-between p-2 rounded-lg bg-slate-800/50">
                      <span className="text-slate-400">Margin Money:</span>
                      <span className="font-bold text-amber-300">₹{Number(simulationResult.margin_money).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {simulationResult.total_repayment != null && (
                    <div className="flex justify-between p-2 rounded-lg bg-slate-800/50">
                      <span className="text-slate-400">Total Repayment:</span>
                      <span className="font-bold text-white">₹{Number(simulationResult.total_repayment).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Institutional Disclaimer */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-800">
              <AlertTriangle size={15} />
              <span>Official Institutional Disclaimer</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-800">
              These figures are estimates and may differ from the final terms offered by the authorized lending institution based on margin money, processing schedules, and state government circulars.
            </p>
          </div>
        </div>
      </div>

      {/* ── Next Step ───────────────────────────────────────────────────────── */}
      <NextStepCard
        title="Ready to Apply"
        stepNumber="5"
        description="Take your estimated figures and visit the nearest authorized State Channelizing Agency or nationalized bank branch."
        actionText="Where to Apply"
        actionTab="partner-finder"
        variant="primary"
      />
    </div>
  )
}
