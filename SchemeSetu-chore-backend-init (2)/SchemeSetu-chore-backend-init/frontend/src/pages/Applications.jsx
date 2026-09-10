import { CheckCircle2, Clock, FileText, Building2, AlertCircle, ShieldCheck } from 'lucide-react'
import useChatStore from '../store/chatStore'

export default function Applications() {
  const { activeApplication, selectedPartner, selectedScheme, documents } = useChatStore()

  const app = activeApplication

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* ── Official Government Header ───────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold mb-1">
            <Clock size={14} className="text-indigo-800" />
            <span>Public Service Tracking System</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">APPLICATION STATUS: #{app?.applicationId || 'SS10234'}</h1>
          <p className="text-xs text-slate-600">
            Track official application status, assigned channel partner, and required verification steps.
          </p>
        </div>

        <div className="shrink-0 p-3 rounded-lg bg-slate-50 border border-slate-200 text-right text-xs">
          <span className="text-slate-500 font-medium block">Submission Date:</span>
          <span className="font-bold text-slate-900 font-mono">{app?.submissionDate || new Date().toLocaleDateString('en-IN')}</span>
        </div>
      </div>

      {/* ── Vertical Government Application Timeline ───────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="text-base font-bold text-slate-900">Application Lifecycle Timeline</h3>
          <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-900 text-xs font-bold border border-indigo-200">
            Status: {app?.currentStatus || 'Under Review'}
          </span>
        </div>

        {/* Vertical Timeline */}
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {[
            { title: 'Scheme Matched', status: 'completed', desc: 'Verified 4/4 guidelines', date: '07 Sep 2026' },
            { title: 'Documents Prepared', status: 'completed', desc: 'PaddleOCR Verified', date: '08 Sep 2026' },
            { title: 'Channel Partner Selected', status: 'completed', desc: 'Kerala State SC/ST Dev Corp (SCA)', date: '09 Sep 2026' },
            { title: 'Application Submitted', status: 'completed', desc: 'Routed to SCA Regional Desk', date: '09 Sep 2026' },
            { title: 'Under Review', status: 'current', desc: 'Assigned Verification Officer assigned', date: 'In Progress' },
            { title: 'Sanction & Approval', status: 'upcoming', desc: 'Pending Officer Signoff', date: 'Pending' },
            { title: 'Fund Disbursal', status: 'upcoming', desc: 'Direct Benefit Transfer (DBT)', date: 'Pending' },
          ].map((step, idx) => {
            const isCompleted = step.status === 'completed'
            const isCurrent = step.status === 'current'

            return (
              <div key={step.title} className="relative flex items-start gap-4 text-xs">
                {/* Timeline Icon Badge */}
                <div 
                  className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold z-10 ${
                    isCompleted 
                      ? 'bg-emerald-600 text-white shadow-xs' 
                      : isCurrent 
                      ? 'bg-slate-900 text-amber-300 ring-4 ring-slate-100 font-black' 
                      : 'bg-white border border-slate-300 text-slate-400'
                  }`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>

                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-bold ${isCurrent ? 'text-slate-900 font-extrabold' : 'text-slate-800'}`}>
                      {step.title}
                    </h4>
                    <span className="font-mono text-[10px] text-slate-500">{step.date}</span>
                  </div>
                  <p className="text-[11px] text-slate-600">{step.desc}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Current Action Box */}
        <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <ShieldCheck size={16} className="text-indigo-800" />
            <span>Current Action:</span>
          </div>
          <p className="text-[11px] text-indigo-950 font-medium">
            Your application is currently under review by the assigned verification officer at the District SCA Office.
          </p>
        </div>
      </div>

      {/* ── Metadata & Attached Documents Grid ────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Metadata Panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3">Application Metadata</h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-medium">Application ID:</span>
              <span className="font-mono font-bold text-slate-900">#{app?.applicationId || 'SS10234'}</span>
            </div>

            <div className="flex justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-medium">Target Scheme:</span>
              <span className="font-bold text-slate-900">{selectedScheme ? selectedScheme.name : app.schemeName}</span>
            </div>

            <div className="flex justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-medium">Channel Partner:</span>
              <span className="font-bold text-slate-900 text-right max-w-[200px]">{selectedPartner ? selectedPartner.name : app.partnerName}</span>
            </div>
          </div>
        </div>

        {/* Attached Documents Panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3">Submitted Verification Documents ({documents.length})</h3>

          <div className="space-y-2 text-xs">
            {documents.map((doc) => (
              <div key={doc.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-slate-700" />
                  <span className="font-semibold text-slate-900">{doc.name}</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200">
                  Verified ✓
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
