import { CheckCircle2, Clock, FileText, Building2, AlertCircle, ArrowRight, Download } from 'lucide-react'
import useChatStore from '../store/chatStore'
import NextStepCard from '../components/NextStepCard'

export default function Applications() {
  const { activeApplication, selectedPartner, selectedScheme, documents, setActiveTab } = useChatStore()
  const app = activeApplication

  // Clean 7-stage timeline
  const TIMELINE_STAGES = [
    { title: 'Draft Started', status: 'completed', date: '07 Sep 2026', desc: 'Profile details matched' },
    { title: 'Documents Ready', status: 'completed', date: '08 Sep 2026', desc: 'Aadhaar & Income verified' },
    { title: 'Ready to Apply', status: 'completed', date: '09 Sep 2026', desc: 'Channel partner selected' },
    { title: 'Submitted to SCA', status: 'completed', date: '09 Sep 2026', desc: 'Application ref #SS10234' },
    { title: 'Under Review', status: 'current', date: 'In Progress', desc: 'Verification officer assigned' },
    { title: 'Sanction & Approval', status: 'upcoming', date: 'Pending', desc: 'Credit committee sanction' },
    { title: 'Fund Disbursal', status: 'upcoming', date: 'Pending', desc: 'Direct benefit transfer to bank' },
  ]

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* ── Banner ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#D9E1E8] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1E5AA8] text-xs font-bold border border-blue-200 mb-1">
            <Clock size={14} />
            <span>Current Status: {app.currentStatus}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-[#12304A]">
            Application Tracking — Ref #{app.applicationId}
          </h1>
          <p className="text-xs md:text-sm text-[#667085]">
            Track your scheme submission through official state channelizing agencies & bank partners.
          </p>
        </div>

        <div className="shrink-0 p-3 rounded-xl bg-[#F6F8FA] border border-[#D9E1E8] text-xs space-y-1">
          <span className="text-[#667085] block font-medium">Submitted On:</span>
          <span className="font-extrabold text-[#12304A] font-mono text-sm">{app.submissionDate}</span>
        </div>
      </div>

      {/* ── Stepper Card: 7-Stage Journey ─────────────────────────────────── */}
      <div className="bg-white border border-[#D9E1E8] rounded-2xl p-6 space-y-6 shadow-2xs">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-[#12304A]">Application Lifecycle Journey</h2>
          <span className="text-xs font-bold text-[#16834B] bg-green-50 px-2.5 py-1 rounded-lg border border-green-200">
            Stage 5 of 7 Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-3">
          {TIMELINE_STAGES.map((step, idx) => {
            const isCompleted = step.status === 'completed'
            const isCurrent = step.status === 'current'

            return (
              <div
                key={step.title}
                className={`p-4 rounded-xl border-2 flex flex-col justify-between space-y-2 transition-all ${
                  isCompleted
                    ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#16834B]'
                    : isCurrent
                    ? 'bg-blue-50 border-[#1E5AA8] text-[#12304A] shadow-xs ring-2 ring-blue-100'
                    : 'bg-[#F6F8FA] border-[#D9E1E8] text-[#667085] opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                      isCompleted
                        ? 'bg-[#16834B] text-white'
                        : isCurrent
                        ? 'bg-[#1E5AA8] text-white animate-pulse'
                        : 'bg-gray-200 text-[#667085]'
                    }`}
                  >
                    {isCompleted ? '✓' : idx + 1}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#667085]">{step.date}</span>
                </div>

                <div>
                  <h3 className="text-xs font-bold leading-tight">{step.title}</h3>
                  <p className="text-[10px] text-[#667085] mt-1 leading-tight">{step.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── What Should I Do Now? Action Card ─────────────────────────────── */}
      <NextStepCard
        title="Your Next Step"
        stepNumber="5"
        description="No action is currently required. Your verification officer at Kerala SC/ST Development Corp is reviewing your income and caste certificates."
        actionText="Contact Channel Partner"
        actionTab="partner-finder"
        variant="success"
      />

      {/* ── Application Metadata & Documents Grid ─────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Metadata Panel */}
        <div className="bg-white border border-[#D9E1E8] rounded-2xl p-6 space-y-4 shadow-2xs">
          <h3 className="text-base font-extrabold text-[#12304A] border-b border-gray-100 pb-3">
            Application Details
          </h3>

          <div className="space-y-3 text-xs text-[#17212B]">
            <div className="flex justify-between p-3 rounded-xl bg-[#F6F8FA] border border-[#D9E1E8]">
              <span className="text-[#667085]">Application Reference:</span>
              <span className="font-mono font-bold text-[#1E5AA8]">{app.applicationId}</span>
            </div>

            <div className="flex justify-between p-3 rounded-xl bg-[#F6F8FA] border border-[#D9E1E8]">
              <span className="text-[#667085]">Target Scheme:</span>
              <span className="font-bold text-[#12304A]">{selectedScheme ? selectedScheme.name : app.schemeName}</span>
            </div>

            <div className="flex justify-between p-3 rounded-xl bg-[#F6F8FA] border border-[#D9E1E8]">
              <span className="text-[#667085]">Channel Partner:</span>
              <span className="font-bold text-[#12304A] text-right max-w-[200px]">
                {selectedPartner ? selectedPartner.name : app.partnerName}
              </span>
            </div>

            <div className="flex justify-between p-3 rounded-xl bg-blue-50 border border-blue-200">
              <span className="text-[#1E5AA8] font-bold">Applicant Action Required:</span>
              <span className="font-semibold text-[#12304A]">None currently</span>
            </div>
          </div>
        </div>

        {/* Attached Documents Panel */}
        <div className="bg-white border border-[#D9E1E8] rounded-2xl p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-base font-extrabold text-[#12304A]">Attached Certificates</h3>
            <span className="text-xs text-[#16834B] font-bold">3 of 3 Verified</span>
          </div>

          <div className="space-y-2.5">
            {documents.slice(0, 3).map((doc) => (
              <div
                key={doc.id}
                className="p-3 rounded-xl bg-[#F6F8FA] border border-[#D9E1E8] flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <FileText size={16} className="text-[#1E5AA8]" />
                  <span className="font-bold text-[#12304A]">{doc.name}</span>
                </div>
                <span className="text-[10px] font-bold text-[#16834B] px-2 py-0.5 rounded-md bg-green-50 border border-green-200">
                  Verified ✓
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setActiveTab('documents')}
            className="w-full touch-target py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#12304A] font-bold text-xs transition-colors"
          >
            Manage Uploaded Documents →
          </button>
        </div>
      </div>
    </div>
  )
}
