import { useState, useMemo } from 'react'
import { Calculator, ArrowRight, AlertTriangle, Building2, Landmark } from 'lucide-react'
import useChatStore from '../store/chatStore'

export default function FinancialCalculator() {
  const { calculatorInput, selectedScheme, setActiveTab } = useChatStore()

  // State inputs
  const [loanAmount, setLoanAmount] = useState(calculatorInput.loanAmount || 450000)
  const [interestRate, setInterestRate] = useState(calculatorInput.interestRate || 6.0)
  const [tenureYears, setTenureYears] = useState(calculatorInput.tenureYears || 5)
  const [moratoriumMonths, setMoratoriumMonths] = useState(calculatorInput.moratoriumMonths || 6)
  const [ownContribution, setOwnContribution] = useState(calculatorInput.ownContribution || 50000)

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

    return {
      totalProjectCost,
      principal,
      emi,
      totalInterest,
      totalRepayment,
    }
  }, [loanAmount, interestRate, tenureYears, ownContribution])

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* ── Official Government Header ───────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold mb-1">
            <Landmark size={14} className="text-indigo-800" />
            <span>Scheme Parameter Simulator</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Financial Assistance Calculator</h1>
          <p className="text-xs text-slate-600">
            Calculate loan EMI, interest rates, moratorium grace periods, and required own contribution for {selectedScheme ? selectedScheme.name : 'government schemes'}.
          </p>
        </div>

        {selectedScheme && (
          <div className="shrink-0 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-500 font-medium block">Pre-selected Scheme:</span>
            <span className="font-bold text-slate-900">{selectedScheme.name}</span>
          </div>
        )}
      </div>

      {/* ── Main Inputs & Results Grid ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Financial Inputs (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3">Input Financial Parameters</h3>

          {/* Loan Amount Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label className="font-bold text-slate-700">Loan Amount (Principal)</label>
              <span className="font-mono font-bold text-slate-900">₹{Number(loanAmount).toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min={50000}
              max={1500000}
              step={25000}
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>₹50,000</span>
              <span>₹15,000,000</span>
            </div>
          </div>

          {/* Own Contribution */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label className="font-bold text-slate-700">Own Contribution (Margin Money)</label>
              <span className="font-mono font-bold text-emerald-800">₹{Number(ownContribution).toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min={0}
              max={250000}
              step={10000}
              value={ownContribution}
              onChange={(e) => setOwnContribution(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          {/* Interest Rate & Tenure Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Interest Rate (% p.a.)</label>
              <input
                type="number"
                step="0.5"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Tenure (Years)</label>
              <input
                type="number"
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Moratorium (Months)</label>
              <input
                type="number"
                value={moratoriumMonths}
                onChange={(e) => setMoratoriumMonths(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-500"
              />
            </div>
          </div>

          {/* Simple Visual Breakdown: Project Cost → Own Contribution + Loan → Repayment */}
          <div className="pt-4 border-t border-slate-200 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Financial Funding Breakdown</span>
            
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-center font-semibold">
              <div className="flex-1">
                <span className="text-[10px] text-slate-500 block uppercase">Project Cost</span>
                <span className="font-extrabold text-slate-900">₹{(results.totalProjectCost / 100000).toFixed(2)} Lakh</span>
              </div>
              <span className="text-slate-400">→</span>
              <div className="flex-1">
                <span className="text-[10px] text-slate-500 block uppercase">Own + Loan</span>
                <span className="font-extrabold text-emerald-800">₹{(ownContribution / 100000).toFixed(2)}L + ₹{(loanAmount / 100000).toFixed(2)}L</span>
              </div>
              <span className="text-slate-400">→</span>
              <div className="flex-1">
                <span className="text-[10px] text-slate-500 block uppercase">Estimated EMI</span>
                <span className="font-extrabold text-indigo-900">₹{results.emi.toLocaleString('en-IN')} / mo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Financial Results (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3">Repayment Results</h3>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-900 text-white text-center space-y-1 shadow-xs">
                <span className="text-xs text-slate-300 font-semibold uppercase tracking-wide">Estimated Monthly Installment (EMI)</span>
                <div className="text-3xl font-black">₹{results.emi.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-400">/ month</span></div>
              </div>

              <div className="space-y-2 pt-1 text-xs">
                <div className="flex justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-600 font-medium">Total Interest Payable:</span>
                  <span className="font-bold text-slate-900">₹{results.totalInterest.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-600 font-medium">Total Repayment Amount:</span>
                  <span className="font-bold text-slate-900">₹{results.totalRepayment.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-600 font-medium">Moratorium Grace Period:</span>
                  <span className="font-bold text-emerald-800">{moratoriumMonths} Months</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('partner-finder')}
              className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <span>Apply via Channel Partner</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Official Disclaimer */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle size={15} className="text-amber-700" />
              <span>Financial Disclaimer</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              These figures are estimates based on the scheme parameters and may vary according to the lending institution, processing fees, and margin money regulations.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
