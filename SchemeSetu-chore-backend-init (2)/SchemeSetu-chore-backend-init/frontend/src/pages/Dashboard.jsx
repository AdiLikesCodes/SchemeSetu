import { 
  CheckCircle2, 
  ArrowRight, 
  Calculator, 
  MapPin, 
  Award, 
  TrendingUp, 
  ShieldCheck, 
  FileText,
  Clock,
  ChevronRight,
  Building2
} from 'lucide-react'
import useChatStore from '../store/chatStore'

export default function Dashboard() {
  const { 
    userProfile, 
    schemes, 
    documents,
    activeApplication,
    setActiveTab, 
    setSelectedScheme 
  } = useChatStore()

  const eligibleSchemes = schemes.filter(s => s.eligible)

  const profileKeys = ['name', 'age', 'gender', 'category', 'income', 'occupation', 'businessType', 'projectCost', 'loanRequirement', 'state', 'district', 'pinCode']
  const filledCount = profileKeys.filter(k => Boolean(userProfile[k])).length
  const completenessPct = Math.round((filledCount / profileKeys.length) * 100)

  const handleViewScheme = (scheme) => {
    setSelectedScheme(scheme)
    setActiveTab('scheme-details')
  }

  const currentDateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* ── Official Government Banner Header ───────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold">
            <Building2 size={13} className="text-indigo-800" />
            <span>Beneficiary Dashboard</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Welcome{userProfile.name ? `, ${userProfile.name}` : ' Beneficiary'}
          </h1>
          <p className="text-xs text-slate-600">
            Here's an overview of your scheme eligibility and applications based on your verified <strong className="text-slate-900">{userProfile.category || 'SC'} category</strong> profile{userProfile.state ? <> in <strong className="text-slate-900">{userProfile.state}</strong></> : ''}.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('scheme-results')}
          className="self-start md:self-center shrink-0 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
        >
          <span>View Matched Schemes</span>
          <ArrowRight size={15} />
        </button>
      </div>

      {/* ── 4 Compact Status Cards Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Profile Status */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">PROFILE STATUS</span>
            <span className={`w-2 h-2 rounded-full ${completenessPct > 50 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{completenessPct}%</span>
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 size={13} /> {completenessPct === 100 ? 'Completed' : 'In Progress'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">{filledCount} of {profileKeys.length} attributes provided</p>
          </div>
          <button 
            onClick={() => setActiveTab('profile')}
            className="text-xs font-bold text-indigo-900 hover:underline flex items-center gap-1 pt-1"
          >
            <span>Edit profile</span>
            <ChevronRight size={13} />
          </button>
        </div>

        {/* Card 2: Matched Schemes */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">MATCHED SCHEMES</span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
              {eligibleSchemes.length} Eligible
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{schemes.length} Total</div>
            <p className="text-[11px] text-slate-500 mt-1">Evaluated by deterministic engine</p>
          </div>
          <button 
            onClick={() => setActiveTab('scheme-results')}
            className="text-xs font-bold text-indigo-900 hover:underline flex items-center gap-1 pt-1"
          >
            <span>View schemes →</span>
          </button>
        </div>

        {/* Card 3: Documents */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">DOCUMENTS</span>
            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
              PaddleOCR
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {documents.filter(d => d.status === 'verified').length} / {documents.length} verified
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {documents.length > 0 ? `${documents.length} documents uploaded` : 'No documents uploaded yet'}
            </p>
          </div>
          <button 
            onClick={() => setActiveTab('documents')}
            className="text-xs font-bold text-indigo-900 hover:underline flex items-center gap-1 pt-1"
          >
            <span>Manage →</span>
          </button>
        </div>

        {/* Card 4: Applications */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">APPLICATIONS</span>
            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-900 text-[10px] font-bold border border-indigo-200">
              {activeApplication ? activeApplication.currentStatus : 'Draft'}
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{activeApplication ? '1 active' : '0 active'}</div>
            <p className="text-[11px] text-slate-500 mt-1">
              {activeApplication ? `Ref #${activeApplication.applicationId}` : 'No active application'}
            </p>
          </div>
          <button 
            onClick={() => setActiveTab('applications')}
            className="text-xs font-bold text-indigo-900 hover:underline flex items-center gap-1 pt-1"
          >
            <span>Track →</span>
          </button>
        </div>

      </div>

      {/* ── Official Scheme Cards List ──────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recommended Government Schemes</h2>
            <p className="text-xs text-slate-500">Official National Scheduled Castes Finance & Development Corporation (NSFDC) Programs</p>
          </div>
          <button 
            onClick={() => setActiveTab('scheme-results')}
            className="text-xs font-bold text-indigo-900 hover:underline"
          >
            View All Schemes ({schemes.length}) →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {eligibleSchemes.map((scheme) => (
            <div 
              key={scheme.id}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{scheme.ministry}</span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">{scheme.name}</h3>
                  </div>
                  <span className="shrink-0 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 size={13} className="text-emerald-700" />
                    <span>Eligible</span>
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">{scheme.purpose}</p>

                {/* Key Metrics */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Financial Assistance</span>
                    <p className="font-extrabold text-slate-900 text-sm">{scheme.maxLoanText}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Interest Rate</span>
                    <p className="font-bold text-emerald-800 text-sm">{scheme.interestRate}</p>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500">
                  <span>Last updated: </span>
                  <strong className="text-slate-700">{currentDateStr}</strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleViewScheme(scheme)}
                  className="flex-1 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1"
                >
                  <span>View Scheme</span>
                  <ArrowRight size={14} />
                </button>
                <button
                  onClick={() => {
                    setSelectedScheme(scheme)
                    setActiveTab('calculator')
                  }}
                  className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                >
                  Check Eligibility
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
