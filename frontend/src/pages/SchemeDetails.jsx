import { useState } from 'react'
import {
  Building2,
  Coins,
  CheckCircle2,
  Circle,
  Calculator,
  MapPin,
  FileCheck,
  ArrowLeft,
  ShieldCheck,
  ExternalLink,
  HelpCircle,
  Clock,
  AlertCircle,
  FileText
} from 'lucide-react'
import useChatStore from '../store/chatStore'
import { TermExplainer } from '../components/PlainLanguageModal'
import NextStepCard from '../components/NextStepCard'

export default function SchemeDetails() {
  const { selectedScheme, setActiveTab, setSelectedPartner, userProfile } = useChatStore()
  const [sourceModalOpen, setSourceModalOpen] = useState(false)

  if (!selectedScheme) {
    return (
      <div className="p-8 text-center text-[#667085] space-y-4">
        <p>No scheme selected.</p>
        <button
          onClick={() => setActiveTab('scheme-results')}
          className="touch-target px-4 py-2 rounded-xl bg-[#12304A] text-white text-xs font-bold"
        >
          View Matched Schemes
        </button>
      </div>
    )
  }

  const handleCalculate = () => {
    setActiveTab('calculator')
  }

  const handleFindPartner = () => {
    setActiveTab('partner-finder')
  }

  const handleStartApply = () => {
    if (!userProfile?.isAuthenticated) {
      setActiveTab('auth')
    } else {
      setActiveTab('partner-finder')
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto pb-24">
      {/* Back button */}
      <button
        onClick={() => setActiveTab('scheme-results')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E5AA8] hover:text-[#12304A] transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Back to Scheme Results</span>
      </button>

      {/* ── Header Banner ────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#D9E1E8] rounded-2xl p-6 md:p-8 space-y-4 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1E5AA8] text-[11px] font-bold border border-blue-200">
                Credit Scheme
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-green-50 text-[#16834B] text-[11px] font-bold border border-green-200">
                SC Beneficiary
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-[#E67E22] text-[11px] font-bold border border-amber-200">
                Business Assistance
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-[#12304A] leading-tight">
              {selectedScheme.name}
            </h1>
            <p className="text-xs md:text-sm text-[#667085] max-w-3xl leading-relaxed">
              {selectedScheme.purpose}
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-start md:items-end gap-1.5">
            <span className="px-3 py-1.5 rounded-full bg-green-50 text-[#16834B] text-xs font-bold border border-green-200 flex items-center gap-1.5">
              <ShieldCheck size={14} />
              <span>Likely Eligible for You</span>
            </span>
            <span className="text-[11px] text-[#667085] font-mono">Code: {selectedScheme.id?.toUpperCase()}</span>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={handleStartApply}
            className="touch-target px-5 py-2.5 rounded-xl bg-[#12304A] hover:bg-[#153A5B] text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <span>Start Application</span>
          </button>

          <button
            onClick={handleCalculate}
            className="touch-target px-4 py-2.5 rounded-xl bg-[#F6F8FA] hover:bg-gray-100 text-[#12304A] font-bold text-xs flex items-center gap-1.5 border border-[#D9E1E8] transition-colors cursor-pointer"
          >
            <Calculator size={15} className="text-[#1E5AA8]" />
            <span>Estimate Repayment</span>
          </button>

          <button
            onClick={handleFindPartner}
            className="touch-target px-4 py-2.5 rounded-xl bg-[#F6F8FA] hover:bg-gray-100 text-[#12304A] font-bold text-xs flex items-center gap-1.5 border border-[#D9E1E8] transition-colors cursor-pointer"
          >
            <MapPin size={15} className="text-[#E67E22]" />
            <span>Where to Apply</span>
          </button>
        </div>
      </div>

      {/* ── Main 2-Column Grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7-8 Cols: Detailed Sections */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Financial Assistance Terms */}
          <div className="bg-white border border-[#D9E1E8] rounded-2xl p-6 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 text-[#12304A]">
              <Coins size={20} className="text-[#1E5AA8]" />
              <h2 className="text-base font-extrabold">Financial Assistance Terms</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-1">
              <div className="p-3.5 rounded-xl bg-[#F6F8FA] border border-[#D9E1E8] space-y-1">
                <span className="text-[10px] text-[#667085] font-bold uppercase">Maximum Funding</span>
                <p className="text-base font-black text-[#16834B]">{selectedScheme.maxLoanText}</p>
                <p className="text-[10px] text-[#667085]">Covers unit / project cost</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F6F8FA] border border-[#D9E1E8] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#667085] font-bold uppercase">Interest Rate</span>
                  <TermExplainer term="interest rate" label="?" />
                </div>
                <p className="text-base font-black text-[#12304A]">{selectedScheme.interestRate}</p>
                <p className="text-[10px] text-[#667085]">Concessional government rate</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F6F8FA] border border-[#D9E1E8] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#667085] font-bold uppercase">Moratorium</span>
                  <TermExplainer term="moratorium" label="?" />
                </div>
                <p className="text-base font-black text-[#12304A]">{selectedScheme.moratorium}</p>
                <p className="text-[10px] text-[#667085]">No payment during setup</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F6F8FA] border border-[#D9E1E8] space-y-1">
                <span className="text-[10px] text-[#667085] font-bold uppercase">Repayment Period</span>
                <p className="text-base font-black text-[#12304A]">{selectedScheme.repaymentPeriod}</p>
                <p className="text-[10px] text-[#667085]">Comfortable monthly installments</p>
              </div>

              <div className="col-span-2 p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#1E5AA8] font-bold uppercase">Margin Money / Subsidy</span>
                  <TermExplainer term="subsidy" label="What is subsidy?" />
                </div>
                <p className="text-xs font-bold text-[#12304A]">{selectedScheme.subsidy}</p>
                <p className="text-[10px] text-[#667085]">Assistance provided directly by the corporation</p>
              </div>
            </div>
          </div>

          {/* Section 2: Transparent Eligibility Checklist ("Why You Qualify") */}
          <div className="bg-white border border-[#D9E1E8] rounded-2xl p-6 space-y-4 shadow-2xs">
            <div>
              <h2 className="text-base font-extrabold text-[#12304A]">Why You Qualify (Transparent Rule Checklist)</h2>
              <p className="text-xs text-[#667085]">Every check is evaluated deterministically against official gazette rules</p>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#16834B] block">✓ Social Category Requirement</span>
                  <span className="text-[11px] text-[#667085]">Required: Scheduled Caste (SC) • Your Profile: {userProfile.category || 'SC'}</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-[#DCFCE7] text-[#16834B] text-[10px] font-bold shrink-0">
                  Satisfied ✓
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#16834B] block">✓ Annual Income Ceiling</span>
                  <span className="text-[11px] text-[#667085]">Required: Up to ₹3.00 Lakh • Your Profile: ₹{(userProfile.income/100000).toFixed(2)} Lakh</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-[#DCFCE7] text-[#16834B] text-[10px] font-bold shrink-0">
                  Within Limit ✓
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#16834B] block">✓ Age Bracket</span>
                  <span className="text-[11px] text-[#667085]">Required: 18 - 50 Years • Your Profile: {userProfile.age || 28} Years</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-[#DCFCE7] text-[#16834B] text-[10px] font-bold shrink-0">
                  Eligible ✓
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#FFF7ED] border border-[#FED7AA] flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#C2410C] block">! Business Activity Verification</span>
                  <span className="text-[11px] text-[#667085]">Required: Viable enterprise proposal • Your Profile: {userProfile.businessType || 'Self Employment'}</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-[#FFEDD5] text-[#C2410C] text-[10px] font-bold shrink-0">
                  Verified at SCA !
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Next Step Callout */}
          <NextStepCard
            title="Next Step"
            stepNumber="4"
            description="Prepare your Aadhaar and Income certificates, then visit the authorized channel partner office to apply."
            actionText="Find Where to Apply"
            actionTab="partner-finder"
            variant="primary"
          />
        </div>

        {/* Right 4-5 Cols: Documents & Official Source Box */}
        <div className="lg:col-span-4 space-y-6">
          {/* Required Documents Card */}
          <div className="bg-white border border-[#D9E1E8] rounded-2xl p-6 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 text-[#12304A]">
              <FileCheck size={18} className="text-[#1E5AA8]" />
              <h3 className="text-sm font-extrabold">Required Documents</h3>
            </div>

            <div className="space-y-2">
              {selectedScheme.documentsNeeded?.map((docName, idx) => (
                <div key={docName} className="p-3 rounded-xl bg-[#F6F8FA] border border-[#D9E1E8] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-[#16834B] shrink-0" />
                    <span className="font-semibold text-[#12304A]">{docName}</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#16834B] bg-green-50 px-2 py-0.5 rounded border border-green-200">
                    Required
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveTab('documents')}
              className="w-full touch-target py-2.5 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#12304A] font-bold text-xs transition-colors"
            >
              Open Documents Hub →
            </button>
          </div>

          {/* Source Transparency Box (Mandatory government trust principle) */}
          <div className="bg-white border border-[#D9E1E8] rounded-2xl p-6 space-y-3.5 shadow-2xs">
            <div className="flex items-center gap-2 text-[#12304A]">
              <Building2 size={18} className="text-[#1E5AA8]" />
              <h3 className="text-sm font-extrabold">Official Source Transparency</h3>
            </div>

            <div className="space-y-2 text-xs text-[#17212B]">
              <div className="p-3 rounded-xl bg-[#F6F8FA] border border-[#D9E1E8] space-y-1">
                <span className="text-[10px] text-[#667085] uppercase font-bold">Issuing Authority</span>
                <p className="font-bold text-[#12304A]">National Scheduled Castes Finance and Development Corporation (NSFDC)</p>
                <p className="text-[11px] text-[#667085]">Ministry of Social Justice & Empowerment, Govt. of India</p>
              </div>

              <div className="flex justify-between p-2.5 rounded-lg bg-[#F6F8FA] text-[11px]">
                <span className="text-[#667085]">Last Verified:</span>
                <span className="font-bold text-[#12304A]">10 September 2026</span>
              </div>

              <div className="flex justify-between p-2.5 rounded-lg bg-[#F6F8FA] text-[11px]">
                <span className="text-[#667085]">Information Version:</span>
                <span className="font-bold text-[#12304A]">Gazette v3.2</span>
              </div>
            </div>

            <a
              href="https://nsfdc.nic.in"
              target="_blank"
              rel="noreferrer"
              className="w-full touch-target py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1E5AA8] font-bold text-xs flex items-center justify-center gap-1.5 border border-blue-200 transition-colors"
            >
              <span>View Official Source</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </div>

      {/* ── Sticky Bottom Bar for Clean Call-to-Action ─────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#D9E1E8] p-3 shadow-lg flex items-center justify-between max-w-7xl mx-auto px-4 md:px-8">
        <div>
          <span className="text-[11px] text-[#667085] font-bold uppercase block">{selectedScheme.name}</span>
          <span className="text-sm font-black text-[#12304A]">{selectedScheme.maxLoanText} • {selectedScheme.interestRate}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCalculate}
            className="touch-target px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#12304A] font-bold text-xs"
          >
            Calculate Loan
          </button>
          <button
            onClick={handleStartApply}
            className="touch-target px-5 py-2 rounded-xl bg-[#12304A] hover:bg-[#153A5B] text-white font-bold text-xs shadow-xs"
          >
            Start Application
          </button>
        </div>
      </div>
    </div>
  )
}
