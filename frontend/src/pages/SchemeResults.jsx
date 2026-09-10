import { useState } from 'react'
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  Calculator,
  HelpCircle,
  Filter,
  ShieldCheck,
  AlertTriangle,
  SlidersHorizontal,
  FileText
} from 'lucide-react'
import useChatStore from '../store/chatStore'
import { TermExplainer } from '../components/PlainLanguageModal'
import NextStepCard from '../components/NextStepCard'
import NotSureBanner from '../components/NotSureBanner'

export default function SchemeResults() {
  const { userProfile, schemes, setSelectedScheme, setActiveTab, simpleMode, toggleSimpleMode } = useChatStore()

  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [purposeFilter, setPurposeFilter] = useState('ALL')
  const [whyModalScheme, setWhyModalScheme] = useState(null)

  const handleViewScheme = (scheme) => {
    setSelectedScheme(scheme)
    setActiveTab('scheme-details')
  }

  const handleCalculate = (scheme) => {
    setSelectedScheme(scheme)
    setActiveTab('calculator')
  }

  // Filter schemes
  const filteredSchemes = schemes.filter((s) => {
    if (categoryFilter !== 'ALL' && !s.targetBeneficiaries?.toLowerCase().includes(categoryFilter.toLowerCase())) {
      return false
    }
    return true
  })

  const eligibleSchemes = filteredSchemes.filter((s) => s.eligible)
  const ineligibleSchemes = filteredSchemes.filter((s) => !s.eligible)

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* ── Match Summary Header ─────────────────────────────────────────── */}
      <div className="bg-white border border-[#D9E1E8] rounded-2xl p-6 md:p-8 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#1E5AA8] uppercase tracking-wider">Official Eligibility Assessment</span>
            <h1 className="text-xl md:text-2xl font-black text-[#12304A]">
              Schemes You May Be Eligible For
            </h1>
            <p className="text-xs md:text-sm text-[#667085]">
              Based on your profile, we found <strong className="text-[#16834B]">{eligibleSchemes.length} potentially suitable schemes</strong> backed by government corporations.
            </p>
          </div>

          <button
            onClick={toggleSimpleMode}
            className="self-start sm:self-center px-3.5 py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer"
            style={{
              backgroundColor: simpleMode ? '#F0FDF4' : '#F6F8FA',
              borderColor: simpleMode ? '#BBF7D0' : '#D9E1E8',
              color: simpleMode ? '#16834B' : '#12304A',
            }}
          >
            {simpleMode ? '✓ Simple View Active' : 'Detailed View Active'}
          </button>
        </div>

        {/* Profile Criteria Badge Strip */}
        <div className="pt-2 flex flex-wrap items-center gap-2 text-xs border-t border-gray-100">
          <span className="text-[#667085] font-medium">Evaluation Criteria:</span>
          <span className="px-3 py-1 rounded-lg bg-[#F6F8FA] text-[#12304A] font-bold border border-[#D9E1E8]">
            Category: {userProfile.category || 'SC'}
          </span>
          <span className="px-3 py-1 rounded-lg bg-[#F6F8FA] text-[#12304A] font-bold border border-[#D9E1E8]">
            Annual Income: ₹{(userProfile.income / 100000).toFixed(2)} Lakh
          </span>
          <span className="px-3 py-1 rounded-lg bg-[#F6F8FA] text-[#12304A] font-bold border border-[#D9E1E8]">
            Purpose: {userProfile.businessType || 'Enterprise Funding'}
          </span>
          <button
            onClick={() => setActiveTab('ai-onboarding')}
            className="text-xs text-[#1E5AA8] hover:underline font-bold ml-1 cursor-pointer"
          >
            Edit Criteria →
          </button>
        </div>
      </div>

      {/* ── Eligible Decision Cards Section ─────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={20} className="text-[#16834B]" />
            <h2 className="text-lg font-black text-[#12304A]">Directly Eligible Schemes ({eligibleSchemes.length})</h2>
          </div>
          <span className="text-xs text-[#667085] hidden sm:inline">100% Satisfies Ministry Rules</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {eligibleSchemes.map((scheme) => (
            <div
              key={scheme.id}
              className="bg-white border-2 border-[#D9E1E8] hover:border-[#1E5AA8] rounded-2xl p-6 transition-all shadow-2xs hover:shadow-md flex flex-col justify-between space-y-4"
            >
              {/* Decision-First Card Header */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider">{scheme.ministry}</span>
                    <h3 className="text-lg font-black text-[#12304A] leading-snug">{scheme.name}</h3>
                  </div>
                  <span className="shrink-0 px-3 py-1 rounded-lg bg-[#DCFCE7] text-[#16834B] text-xs font-bold border border-[#BBF7D0] flex items-center gap-1">
                    <span>Likely Eligible</span>
                    <span>✓</span>
                  </span>
                </div>

                <p className="text-xs text-[#17212B] font-medium leading-relaxed">
                  This scheme can help you get funding for your business or self-employment setup.
                </p>

                {/* Key Numbers Highlight: You may get & Estimated EMI */}
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#F6F8FA] border border-[#D9E1E8]">
                  <div>
                    <span className="text-[10px] text-[#667085] font-bold uppercase block">You may get</span>
                    <span className="text-base font-black text-[#16834B]">{scheme.maxLoanText}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#667085] font-bold uppercase block">Interest Rate</span>
                    <span className="text-base font-black text-[#12304A]">{scheme.interestRate}</span>
                  </div>
                </div>

                {/* Detailed terms shown only if detailed view is toggled */}
                {!simpleMode && (
                  <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-xs space-y-1.5 text-[#12304A]">
                    <div className="flex justify-between">
                      <span className="text-[#667085]">Moratorium Grace Period:</span>
                      <span className="font-bold">{scheme.moratorium}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#667085]">Repayment Period:</span>
                      <span className="font-bold">{scheme.repaymentPeriod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#667085]">Subsidy / Assistance:</span>
                      <span className="font-bold text-[#16834B]">{scheme.subsidy}</span>
                    </div>
                  </div>
                )}

                {/* Plain-Language "Why you may qualify" checklist */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-extrabold text-[#12304A] uppercase tracking-wide block">
                    Why you may qualify:
                  </span>
                  <div className="space-y-1 text-xs text-[#17212B]">
                    <div className="flex items-center gap-2 text-[#16834B] font-semibold">
                      <CheckCircle2 size={15} className="shrink-0" />
                      <span>Your annual family income is within stated limits</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#16834B] font-semibold">
                      <CheckCircle2 size={15} className="shrink-0" />
                      <span>Your social category ({userProfile.category || 'SC'}) is supported</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#16834B] font-semibold">
                      <CheckCircle2 size={15} className="shrink-0" />
                      <span>Your requested business activity meets scheme rules</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons: See How It Works & Calculate */}
              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleCalculate(scheme)}
                  className="touch-target px-3.5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#12304A] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Estimate monthly repayment"
                >
                  <Calculator size={15} className="text-[#1E5AA8]" />
                  <span>Calculate EMI</span>
                </button>

                <button
                  onClick={() => handleViewScheme(scheme)}
                  className="flex-1 touch-target py-2.5 px-4 rounded-xl bg-[#12304A] hover:bg-[#153A5B] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                >
                  <span>See How It Works</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── What Should I Do Now? Next Step ─────────────────────────────── */}
      <NextStepCard
        title="Next Step"
        stepNumber="3"
        description="Select a scheme above to view required documents, calculate exact repayment, and find your nearest approved office to apply."
        actionText="Loan Calculator"
        actionTab="calculator"
        variant="primary"
      />

      {/* ── Ineligible Schemes (Transparent Failed Rules) ───────────────── */}
      {ineligibleSchemes.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <XCircle size={20} className="text-red-500" />
            <h2 className="text-lg font-bold text-[#12304A]">Other Schemes (Needs Verification / Did Not Match)</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {ineligibleSchemes.map((scheme) => (
              <div
                key={scheme.id}
                className="bg-white border border-[#D9E1E8] rounded-2xl p-6 space-y-4 opacity-90"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-[#667085] uppercase">{scheme.ministry}</span>
                    <h3 className="text-base font-bold text-[#12304A]">{scheme.name}</h3>
                  </div>
                  <span className="shrink-0 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200 flex items-center gap-1">
                    <span>Needs Verification</span>
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-red-50/70 border border-red-200 space-y-2 text-xs">
                  <span className="font-bold text-red-800 block">Why this did not match your current profile:</span>
                  {scheme.failedRules?.map((failed, idx) => (
                    <div key={idx} className="space-y-0.5 text-red-700">
                      <p className="font-semibold">• {failed.rule}</p>
                      <p className="text-[11px] text-gray-600 pl-3">Requirement: {failed.required} | Your profile: {failed.actual}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleViewScheme(scheme)}
                  className="text-xs text-[#1E5AA8] hover:underline font-bold"
                >
                  View Scheme Guidelines →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ubiquitous Not Sure Banner */}
      <NotSureBanner />
    </div>
  )
}
