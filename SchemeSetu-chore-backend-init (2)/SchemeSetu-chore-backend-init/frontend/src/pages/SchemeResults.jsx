import { useState } from 'react'
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  HelpCircle, 
  ShieldCheck, 
  AlertTriangle,
  Building2,
  FileCheck,
  ExternalLink,
  ChevronDown
} from 'lucide-react'
import useChatStore from '../store/chatStore'
import NearbyPartnersCard from '../components/NearbyPartnersCard'

export default function SchemeResults() {
  const { userProfile, schemes, setSelectedScheme, setActiveTab } = useChatStore()
  const [explainScheme, setExplainScheme] = useState(schemes[0])

  const handleViewScheme = (scheme) => {
    setSelectedScheme(scheme)
    setActiveTab('scheme-details')
  }

  const eligibleSchemes = schemes.filter((s) => s.eligible)
  const ineligibleSchemes = schemes.filter((s) => !s.eligible)

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* ── Official Decision Reference Banner ─────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold mb-1">
              <ShieldCheck size={14} className="text-indigo-800" />
              <span>Deterministic Rule Engine Evaluation</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">ELIGIBILITY RESULT & MATCHED SCHEMES</h1>
          </div>

          <div className="shrink-0 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-0.5">
            <p className="text-slate-500 font-medium">Decision Reference:</p>
            <p className="font-bold text-slate-900">Rule Version: 2026.1</p>
            <p className="text-[11px] text-slate-500">Checked: 10 September 2026</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 max-w-3xl">
          Your eligibility was evaluated against published Government of India guidelines. The AI assistant collects your information, but final eligibility criteria are strictly verified by published rules.
        </p>

        {/* Profile Attributes Summary Bar */}
        <div className="pt-2 flex flex-wrap items-center gap-2 text-xs border-t border-slate-100">
          <span className="text-slate-500 font-medium">Evaluated Profile Attributes:</span>
          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-semibold border border-slate-200">
            Category: {userProfile.category || 'SC'}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-semibold border border-slate-200">
            Annual Income: {userProfile.income ? `₹${(userProfile.income / 100000).toFixed(2)} Lakh` : 'Not Set'}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-semibold border border-slate-200">
            Sector: {userProfile.businessType || 'Micro Manufacturing'}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-semibold border border-slate-200">
            Age: {userProfile.age ? `${userProfile.age} Years` : 'Not Set'}
          </span>
        </div>
      </div>

      {/* ── Eligible Schemes Section ────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={20} className="text-emerald-700" />
          <h2 className="text-lg font-bold text-slate-900">Eligible Schemes ({eligibleSchemes.length})</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {eligibleSchemes.map((scheme) => (
            <div
              key={scheme.id}
              className="bg-white border border-emerald-300 hover:border-emerald-400 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{scheme.ministry}</span>
                    <h3 className="text-base font-bold text-slate-900">{scheme.name}</h3>
                  </div>
                  <span className="shrink-0 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 size={13} className="text-emerald-700" />
                    <span>✓ Eligible</span>
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Financial Assistance:</span>
                  <span className="font-extrabold text-slate-900 text-sm">{scheme.maxLoanText}</span>
                </div>

                {/* Criteria Checklist */}
                <div className="space-y-1.5 text-xs pt-1">
                  <p className="text-[11px] font-bold text-slate-500 uppercase">Verified Criteria Checklist:</p>
                  {scheme.matchedRules.map((rule, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-700">
                      <CheckCircle2 size={14} className="text-emerald-700 shrink-0" />
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>

                {/* Nearby Channel Partners Section */}
                <NearbyPartnersCard scheme={scheme} limit={2} compact={true} />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setExplainScheme(scheme)}
                  className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <HelpCircle size={14} className="text-indigo-800" />
                  <span>Why am I eligible?</span>
                </button>
                <button
                  onClick={() => handleViewScheme(scheme)}
                  className="flex-1 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>View Scheme Details</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Explainability Section (Why Am I Eligible?) ───────────────────── */}
      {explainScheme && (
        <div className="bg-white border border-slate-300 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Building2 size={18} className="text-indigo-900" />
              <h3 className="text-base font-bold text-slate-900">
                Explainability Breakdown: <span className="text-indigo-900">{explainScheme.name}</span>
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">Source: Official Government Notification</span>
          </div>

          {/* Structured Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                  <th className="p-3">Rule Criterion</th>
                  <th className="p-3">Government Requirement</th>
                  <th className="p-3">Your Information</th>
                  <th className="p-3">Result</th>
                  <th className="p-3">Official Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
                <tr>
                  <td className="p-3 font-semibold text-slate-900">Social Category</td>
                  <td className="p-3">Scheduled Caste (SC)</td>
                  <td className="p-3 font-mono">{userProfile.category}</td>
                  <td className="p-3 text-emerald-800 font-bold flex items-center gap-1">
                    <CheckCircle2 size={14} className="text-emerald-700" /> Satisfied
                  </td>
                  <td className="p-3 text-slate-500 text-[11px]">NSFDC Guidelines Sec 4.1</td>
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-slate-900">Annual Family Income</td>
                  <td className="p-3">≤ ₹3,00,000 p.a.</td>
                  <td className="p-3 font-mono">₹{(userProfile.income).toLocaleString('en-IN')}</td>
                  <td className="p-3 text-emerald-800 font-bold flex items-center gap-1">
                    <CheckCircle2 size={14} className="text-emerald-700" /> Satisfied
                  </td>
                  <td className="p-3 text-slate-500 text-[11px]">MoSJE Income Ceiling Order</td>
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-slate-900">Age Bracket</td>
                  <td className="p-3">18 to 50 Years</td>
                  <td className="p-3 font-mono">{userProfile.age} Years</td>
                  <td className="p-3 text-emerald-800 font-bold flex items-center gap-1">
                    <CheckCircle2 size={14} className="text-emerald-700" /> Satisfied
                  </td>
                  <td className="p-3 text-slate-500 text-[11px]">Applicant Eligibility Rules</td>
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-slate-900">Business Sector</td>
                  <td className="p-3">Manufacturing / Services / Micro-business</td>
                  <td className="p-3 font-mono">{userProfile.businessType}</td>
                  <td className="p-3 text-emerald-800 font-bold flex items-center gap-1">
                    <CheckCircle2 size={14} className="text-emerald-700" /> Satisfied
                  </td>
                  <td className="p-3 text-slate-500 text-[11px]">SCA Sectoral Approvals</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span>
              <strong>Note:</strong> Rule calculations are deterministic. AI assists in collecting profile inputs, while published rules evaluate eligibility.
            </span>
            <button
              onClick={() => handleViewScheme(explainScheme)}
              className="font-bold text-indigo-900 hover:underline shrink-0"
            >
              Proceed with Application →
            </button>
          </div>
        </div>
      )}

      {/* ── Ineligible Schemes Section ──────────────────────────────────── */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2">
          <XCircle size={20} className="text-rose-700" />
          <h2 className="text-lg font-bold text-slate-900">Ineligible Schemes ({ineligibleSchemes.length})</h2>
          <span className="text-xs text-slate-500">(Showing exact failed rule conditions)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {ineligibleSchemes.map((scheme) => (
            <div
              key={scheme.id}
              className="bg-white border border-rose-200 rounded-xl p-5 shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{scheme.ministry}</span>
                  <h3 className="text-base font-bold text-slate-900">{scheme.name}</h3>
                </div>
                <span className="shrink-0 px-2.5 py-1 rounded-md bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200 flex items-center gap-1">
                  <XCircle size={13} className="text-rose-700" />
                  <span>✗ Not Eligible</span>
                </span>
              </div>

              {/* Exact Failed Rules Table */}
              <div className="p-3.5 rounded-lg bg-rose-50/60 border border-rose-200 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900">
                  <AlertTriangle size={14} className="text-rose-700 shrink-0" />
                  <span>Failed Rule Condition:</span>
                </div>

                {scheme.failedRules.map((failed, idx) => (
                  <div key={idx} className="space-y-1 text-xs pl-2 border-l-2 border-rose-400">
                    <p className="font-bold text-rose-900">✗ {failed.rule}</p>
                    <div className="text-[11px] text-slate-600 grid grid-cols-1 gap-0.5">
                      <span>Requirement: <strong className="text-slate-800">{failed.required}</strong></span>
                      <span>Your Profile: <strong className="text-rose-800">{failed.actual}</strong></span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-1 flex items-center justify-between text-xs text-slate-500">
                <span>Rule Reference: REJ_PROJECT_SIZE</span>
                <button
                  onClick={() => handleViewScheme(scheme)}
                  className="text-xs font-bold text-indigo-900 hover:underline"
                >
                  View Scheme Guidelines →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
