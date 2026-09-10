import {
  CheckCircle2,
  ArrowRight,
  Calculator,
  MapPin,
  Award,
  TrendingUp,
  ChevronRight,
  FileText,
  Clock,
  FolderCheck,
  FileCheck,
  HelpCircle
} from 'lucide-react'
import useChatStore from '../store/chatStore'
import NextStepCard from '../components/NextStepCard'

export default function Dashboard() {
  const { userProfile, schemes, setActiveTab, setSelectedScheme, activeApplication, documents, partners } = useChatStore()

  const eligibleSchemes = schemes.filter((s) => s.eligible)

  const handleViewScheme = (scheme) => {
    setSelectedScheme(scheme)
    setActiveTab('scheme-details')
  }

  // Calculate profile completion percentage
  const profileKeys = ['name', 'category', 'income', 'age', 'state', 'businessType']
  const filledCount = profileKeys.filter((k) => userProfile[k] && userProfile[k] !== 0).length
  const completionPct = Math.round((filledCount / profileKeys.length) * 100)

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* ── Welcome Banner ─────────────────────────────────────────────── */}
      <div className="bg-white border border-[#D9E1E8] rounded-2xl p-6 md:p-8 text-[#12304A] shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#1E5AA8] uppercase">
              <span>Beneficiary Dashboard</span>
              <span>•</span>
              <span>MoSJE Scheme Assistance</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-[#12304A] tracking-tight">
              Good day, {userProfile.name || 'Beneficiary'}!
            </h1>

            <p className="text-xs sm:text-sm text-[#667085] max-w-2xl leading-relaxed">
              Your SchemeSetu profile is <strong className="text-[#16834B]">{completionPct}% complete</strong>.
              Based on your <strong className="text-[#12304A]">{userProfile.category || 'SC'}</strong> category status and annual income of <strong className="text-[#12304A]">₹{(userProfile.income / 100000).toFixed(2)} Lakh</strong>, we have verified suitable schemes for you.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('scheme-results')}
            className="self-start md:self-center shrink-0 touch-target px-5 py-3 rounded-xl bg-[#12304A] hover:bg-[#153A5B] text-white font-bold text-xs flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
          >
            <span>View Matched Schemes ({eligibleSchemes.length})</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Profile Completion Bar */}
        <div className="pt-3 border-t border-gray-100 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[#667085]">Profile Completion</span>
            <span className="text-[#16834B]">{completionPct}% Completed</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-[#16834B] rounded-full transition-all duration-300"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── 4 Quick Metric Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setActiveTab('scheme-results')}
          className="touch-target p-5 rounded-2xl bg-white border border-[#D9E1E8] hover:border-[#1E5AA8] text-left transition-all shadow-2xs group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1E5AA8] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Award size={20} />
          </div>
          <span className="text-[11px] font-bold text-[#667085] uppercase block">Eligible Schemes</span>
          <div className="text-2xl font-black text-[#12304A] mt-0.5">{eligibleSchemes.length} Schemes</div>
          <span className="text-[10px] text-[#16834B] font-bold mt-1 inline-block">100% Rules Met ✓</span>
        </button>

        <button
          onClick={() => setActiveTab('applications')}
          className="touch-target p-5 rounded-2xl bg-white border border-[#D9E1E8] hover:border-[#1E5AA8] text-left transition-all shadow-2xs group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#E67E22] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <FolderCheck size={20} />
          </div>
          <span className="text-[11px] font-bold text-[#667085] uppercase block">Active Applications</span>
          <div className="text-2xl font-black text-[#12304A] mt-0.5">1 Active</div>
          <span className="text-[10px] text-[#E67E22] font-bold mt-1 inline-block">Under Review</span>
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className="touch-target p-5 rounded-2xl bg-white border border-[#D9E1E8] hover:border-[#1E5AA8] text-left transition-all shadow-2xs group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-green-50 text-[#16834B] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <FileCheck size={20} />
          </div>
          <span className="text-[11px] font-bold text-[#667085] uppercase block">My Documents</span>
          <div className="text-2xl font-black text-[#12304A] mt-0.5">{documents.length} Uploaded</div>
          <span className="text-[10px] text-[#16834B] font-bold mt-1 inline-block">Verified Ready ✓</span>
        </button>

        <button
          onClick={() => setActiveTab('partner-finder')}
          className="touch-target p-5 rounded-2xl bg-white border border-[#D9E1E8] hover:border-[#1E5AA8] text-left transition-all shadow-2xs group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <MapPin size={20} />
          </div>
          <span className="text-[11px] font-bold text-[#667085] uppercase block">Where to Apply</span>
          <div className="text-2xl font-black text-[#12304A] mt-0.5">{partners.length} Nearby</div>
          <span className="text-[10px] text-[#1E5AA8] font-bold mt-1 inline-block">SCAs & Banks</span>
        </button>
      </div>

      {/* ── What Should I Do Now? Next Step ─────────────────────────────── */}
      <NextStepCard
        title="Your Next Step"
        stepNumber="2"
        description="Review the 3 government schemes that matched your business needs, or estimate your monthly repayment."
        actionText="Review Schemes"
        actionTab="scheme-results"
        variant="primary"
      />

      {/* ── Recommended Schemes Section ──────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-[#12304A]">Recommended for You</h2>
            <p className="text-xs text-[#667085]">Top schemes matching your category, income, and business interest</p>
          </div>
          <button
            onClick={() => setActiveTab('scheme-results')}
            className="text-xs font-bold text-[#1E5AA8] hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {eligibleSchemes.slice(0, 2).map((scheme) => (
            <div
              key={scheme.id}
              className="bg-white border-2 border-[#D9E1E8] hover:border-[#1E5AA8] rounded-2xl p-5 transition-all flex flex-col justify-between gap-4 shadow-2xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085]">{scheme.ministry}</span>
                    <h3 className="text-base font-black text-[#12304A] mt-0.5">{scheme.name}</h3>
                  </div>
                  <span className="shrink-0 px-2.5 py-1 rounded-lg bg-[#DCFCE7] text-[#16834B] text-[10px] font-bold border border-[#BBF7D0]">
                    Eligible ✓
                  </span>
                </div>

                <div className="mt-3.5 p-3 rounded-xl bg-[#F6F8FA] border border-[#D9E1E8] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-[#667085] uppercase block font-bold">Funding Amount</span>
                    <span className="text-base font-black text-[#16834B]">{scheme.maxLoanText}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#667085] uppercase block font-bold">Interest Rate</span>
                    <span className="text-xs font-black text-[#12304A]">{scheme.interestRate}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => handleViewScheme(scheme)}
                  className="flex-1 touch-target py-2.5 rounded-xl bg-[#12304A] hover:bg-[#153A5B] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileText size={14} />
                  <span>See How It Works</span>
                  <ArrowRight size={13} />
                </button>
                <button
                  onClick={() => {
                    setSelectedScheme(scheme)
                    setActiveTab('calculator')
                  }}
                  className="touch-target px-3.5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#12304A] text-xs font-bold transition-colors cursor-pointer"
                  title="Estimate EMI"
                >
                  <Calculator size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Application Tracking Summary ─────────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-white border border-[#D9E1E8] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[#1E5AA8]" />
            <h3 className="text-sm font-black text-[#12304A]">Live Application Status</h3>
          </div>
          <button
            onClick={() => setActiveTab('applications')}
            className="text-xs font-bold text-[#1E5AA8] hover:underline"
          >
            Track Details →
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-extrabold text-[#12304A] block">NSFDC Term Loan — Ref #{activeApplication.applicationId}</span>
            <span className="text-[#667085]">Under Review by Kerala SC/ST Development Corporation</span>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-white text-[#1E5AA8] font-bold border border-blue-200 shrink-0">
            Stage 5: Under Review
          </span>
        </div>
      </div>
    </div>
  )
}
