import { useState, useEffect } from 'react'
import { User, Edit3, Save, CheckCircle2, ShieldCheck, Building2 } from 'lucide-react'
import useChatStore from '../store/chatStore'

export default function Profile() {
  const { userProfile, updateProfile } = useChatStore()

  const [activeEditSection, setActiveEditSection] = useState(null) // null | 'personal' | 'financial' | 'business' | 'location'
  const [formData, setFormData] = useState({ ...userProfile })
  const [savedSuccess, setSavedSuccess] = useState(false)

  useEffect(() => {
    setFormData({ ...userProfile })
  }, [userProfile])

  const profileKeys = ['name', 'age', 'gender', 'category', 'income', 'occupation', 'businessType', 'projectCost', 'loanRequirement', 'state', 'district', 'pinCode']
  const filledCount = profileKeys.filter(k => Boolean(userProfile[k])).length
  const completenessPct = Math.round((filledCount / profileKeys.length) * 100)

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleSaveSection = (sectionName) => {
    updateProfile(formData)
    setActiveEditSection(null)
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* ── Official Government Header ───────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold mb-1">
            <Building2 size={14} className="text-indigo-800" />
            <span>Verified Beneficiary Record</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">MY BENEFICIARY PROFILE</h1>
          <p className="text-xs text-slate-600">
            View & update information collected by AI Assistant or PaddleOCR. You can edit any section at any time.
          </p>
        </div>

        <div className="shrink-0 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
          <span className="text-slate-500 font-medium block">Verification Status:</span>
          <span className={`font-bold flex items-center gap-1 ${completenessPct > 50 ? 'text-emerald-800' : 'text-amber-800'}`}>
            <CheckCircle2 size={13} /> {completenessPct}% Profile Complete ({filledCount}/{profileKeys.length})
          </span>
        </div>
      </div>

      {/* Save Success Banner */}
      {savedSuccess && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-700" />
          <span>Profile changes saved! Deterministic rule engine re-evaluations updated.</span>
        </div>
      )}

      {/* ── 4 Structured Profile Sections ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Section 1: Personal Information */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-base font-bold text-slate-900">Personal Information</h3>
            {activeEditSection === 'personal' ? (
              <button
                onClick={() => handleSaveSection('personal')}
                className="px-3 py-1.5 rounded-md bg-slate-900 text-white font-bold text-xs flex items-center gap-1"
              >
                <Save size={13} /> Save
              </button>
            ) : (
              <button
                onClick={() => setActiveEditSection('personal')}
                className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 border border-slate-200 transition-colors"
              >
                <Edit3 size={13} /> Edit
              </button>
            )}
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-slate-500 font-bold">Full Name</label>
              <input
                type="text"
                disabled={activeEditSection !== 'personal'}
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-900 disabled:bg-slate-50 disabled:text-slate-800"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-slate-500 font-bold">Age</label>
                <input
                  type="number"
                  disabled={activeEditSection !== 'personal'}
                  value={formData.age}
                  onChange={(e) => handleChange('age', Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-900 disabled:bg-slate-50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-bold">Gender</label>
                <input
                  type="text"
                  disabled={activeEditSection !== 'personal'}
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-900 disabled:bg-slate-50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-bold">Category</label>
                <input
                  type="text"
                  disabled={activeEditSection !== 'personal'}
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-bold text-indigo-950 disabled:bg-slate-50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Financial Information */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-base font-bold text-slate-900">Financial Information</h3>
            {activeEditSection === 'financial' ? (
              <button
                onClick={() => handleSaveSection('financial')}
                className="px-3 py-1.5 rounded-md bg-slate-900 text-white font-bold text-xs flex items-center gap-1"
              >
                <Save size={13} /> Save
              </button>
            ) : (
              <button
                onClick={() => setActiveEditSection('financial')}
                className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 border border-slate-200 transition-colors"
              >
                <Edit3 size={13} /> Edit
              </button>
            )}
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-slate-500 font-bold">Annual Family Income (₹)</label>
              <input
                type="number"
                disabled={activeEditSection !== 'financial'}
                value={formData.income}
                onChange={(e) => handleChange('income', Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-bold text-emerald-800 disabled:bg-slate-50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 font-bold">Primary Occupation</label>
              <input
                type="text"
                disabled={activeEditSection !== 'financial'}
                value={formData.occupation}
                onChange={(e) => handleChange('occupation', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-900 disabled:bg-slate-50"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Business Information */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-base font-bold text-slate-900">Business Information</h3>
            {activeEditSection === 'business' ? (
              <button
                onClick={() => handleSaveSection('business')}
                className="px-3 py-1.5 rounded-md bg-slate-900 text-white font-bold text-xs flex items-center gap-1"
              >
                <Save size={13} /> Save
              </button>
            ) : (
              <button
                onClick={() => setActiveEditSection('business')}
                className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 border border-slate-200 transition-colors"
              >
                <Edit3 size={13} /> Edit
              </button>
            )}
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-slate-500 font-bold">Business Type / Sector</label>
              <input
                type="text"
                disabled={activeEditSection !== 'business'}
                value={formData.businessType}
                onChange={(e) => handleChange('businessType', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-900 disabled:bg-slate-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-500 font-bold">Project Cost (₹)</label>
                <input
                  type="number"
                  disabled={activeEditSection !== 'business'}
                  value={formData.projectCost}
                  onChange={(e) => handleChange('projectCost', Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-900 disabled:bg-slate-50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-bold">Loan Required (₹)</label>
                <input
                  type="number"
                  disabled={activeEditSection !== 'business'}
                  value={formData.loanRequirement}
                  onChange={(e) => handleChange('loanRequirement', Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-900 disabled:bg-slate-50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Location Details */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-base font-bold text-slate-900">Location Details</h3>
            {activeEditSection === 'location' ? (
              <button
                onClick={() => handleSaveSection('location')}
                className="px-3 py-1.5 rounded-md bg-slate-900 text-white font-bold text-xs flex items-center gap-1"
              >
                <Save size={13} /> Save
              </button>
            ) : (
              <button
                onClick={() => setActiveEditSection('location')}
                className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 border border-slate-200 transition-colors"
              >
                <Edit3 size={13} /> Edit
              </button>
            )}
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-slate-500 font-bold">State</label>
                <input
                  type="text"
                  disabled={activeEditSection !== 'location'}
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-900 disabled:bg-slate-50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-bold">District</label>
                <input
                  type="text"
                  disabled={activeEditSection !== 'location'}
                  value={formData.district}
                  onChange={(e) => handleChange('district', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-900 disabled:bg-slate-50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-bold">PIN Code</label>
                <input
                  type="text"
                  disabled={activeEditSection !== 'location'}
                  value={formData.pinCode}
                  onChange={(e) => handleChange('pinCode', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-900 disabled:bg-slate-50"
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
