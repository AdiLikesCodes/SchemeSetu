import { useState } from 'react'
import { User, Edit3, Save, CheckCircle2, ShieldCheck, RefreshCw, ArrowLeft } from 'lucide-react'
import useChatStore from '../store/chatStore'

export default function Profile() {
  const { userProfile, updateProfile, setActiveTab } = useChatStore()

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({ ...userProfile })
  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = (e) => {
    e.preventDefault()
    updateProfile(formData)
    setIsEditing(false)
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#D9E1E8] rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 text-[#1E5AA8] text-xs font-bold border border-blue-200 mb-1">
            <ShieldCheck size={14} />
            <span>Beneficiary Profile</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-[#12304A]">My Profile & Information</h1>
          <p className="text-xs md:text-sm text-[#667085]">
            View and update your personal, income, and business details used for scheme eligibility.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <button
              onClick={handleSave}
              className="touch-target px-5 py-2.5 rounded-xl bg-[#16834B] hover:bg-[#15803D] text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Save size={16} />
              <span>Save Changes</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="touch-target px-5 py-2.5 rounded-xl bg-[#12304A] hover:bg-[#153A5B] text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Edit3 size={16} />
              <span>Edit Details</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {savedSuccess && (
        <div className="p-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#16834B] text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>Profile updated successfully! Scheme matches will automatically re-evaluate.</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details */}
        <div className="bg-white border border-[#D9E1E8] rounded-2xl p-6 space-y-4 shadow-2xs">
          <h2 className="text-base font-extrabold text-[#12304A] border-b border-gray-100 pb-3">Personal Details</h2>

          <div className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="text-[#667085] font-bold">Full Name (As in Aadhaar)</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full bg-[#F6F8FA] border border-[#D9E1E8] rounded-xl px-3.5 py-2.5 font-bold text-[#12304A] disabled:opacity-80 focus:outline-none focus:border-[#1E5AA8]"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[#667085] font-bold">Age</label>
                <input
                  type="number"
                  disabled={!isEditing}
                  value={formData.age || ''}
                  onChange={(e) => handleChange('age', Number(e.target.value))}
                  className="w-full bg-[#F6F8FA] border border-[#D9E1E8] rounded-xl px-3 py-2.5 font-bold text-[#12304A] disabled:opacity-80 focus:outline-none focus:border-[#1E5AA8]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#667085] font-bold">Gender</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.gender || ''}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="w-full bg-[#F6F8FA] border border-[#D9E1E8] rounded-xl px-3 py-2.5 font-bold text-[#12304A] disabled:opacity-80 focus:outline-none focus:border-[#1E5AA8]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#667085] font-bold">Category</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.category || 'SC'}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full bg-[#F6F8FA] border border-[#D9E1E8] rounded-xl px-3 py-2.5 font-bold text-[#1E5AA8] disabled:opacity-80 focus:outline-none focus:border-[#1E5AA8]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Financial Details */}
        <div className="bg-white border border-[#D9E1E8] rounded-2xl p-6 space-y-4 shadow-2xs">
          <h2 className="text-base font-extrabold text-[#12304A] border-b border-gray-100 pb-3">Financial Information</h2>

          <div className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="text-[#667085] font-bold">Annual Family Income (₹)</label>
              <input
                type="number"
                disabled={!isEditing}
                value={formData.income || ''}
                onChange={(e) => handleChange('income', Number(e.target.value))}
                className="w-full bg-[#F6F8FA] border border-[#D9E1E8] rounded-xl px-3.5 py-2.5 font-bold text-[#16834B] disabled:opacity-80 focus:outline-none focus:border-[#1E5AA8]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[#667085] font-bold">Primary Occupation</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.occupation || ''}
                onChange={(e) => handleChange('occupation', e.target.value)}
                className="w-full bg-[#F6F8FA] border border-[#D9E1E8] rounded-xl px-3.5 py-2.5 font-bold text-[#12304A] disabled:opacity-80 focus:outline-none focus:border-[#1E5AA8]"
              />
            </div>
          </div>
        </div>

        {/* Business Venture */}
        <div className="bg-white border border-[#D9E1E8] rounded-2xl p-6 space-y-4 shadow-2xs">
          <h2 className="text-base font-extrabold text-[#12304A] border-b border-gray-100 pb-3">Business Venture Details</h2>

          <div className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="text-[#667085] font-bold">Business Type / Purpose</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.businessType || ''}
                onChange={(e) => handleChange('businessType', e.target.value)}
                className="w-full bg-[#F6F8FA] border border-[#D9E1E8] rounded-xl px-3.5 py-2.5 font-bold text-[#12304A] disabled:opacity-80 focus:outline-none focus:border-[#1E5AA8]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[#667085] font-bold">Project Cost (₹)</label>
                <input
                  type="number"
                  disabled={!isEditing}
                  value={formData.projectCost || ''}
                  onChange={(e) => handleChange('projectCost', Number(e.target.value))}
                  className="w-full bg-[#F6F8FA] border border-[#D9E1E8] rounded-xl px-3 py-2.5 font-bold text-[#12304A] disabled:opacity-80 focus:outline-none focus:border-[#1E5AA8]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#667085] font-bold">Loan Required (₹)</label>
                <input
                  type="number"
                  disabled={!isEditing}
                  value={formData.loanRequirement || ''}
                  onChange={(e) => handleChange('loanRequirement', Number(e.target.value))}
                  className="w-full bg-[#F6F8FA] border border-[#D9E1E8] rounded-xl px-3 py-2.5 font-bold text-[#12304A] disabled:opacity-80 focus:outline-none focus:border-[#1E5AA8]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Location Details */}
        <div className="bg-white border border-[#D9E1E8] rounded-2xl p-6 space-y-4 shadow-2xs">
          <h2 className="text-base font-extrabold text-[#12304A] border-b border-gray-100 pb-3">Location & Address</h2>

          <div className="space-y-3.5 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[#667085] font-bold">State</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.state || ''}
                  onChange={(e) => handleChange('state', e.target.value)}
                  className="w-full bg-[#F6F8FA] border border-[#D9E1E8] rounded-xl px-3 py-2.5 font-bold text-[#12304A] disabled:opacity-80 focus:outline-none focus:border-[#1E5AA8]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#667085] font-bold">District</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.district || ''}
                  onChange={(e) => handleChange('district', e.target.value)}
                  className="w-full bg-[#F6F8FA] border border-[#D9E1E8] rounded-xl px-3 py-2.5 font-bold text-[#12304A] disabled:opacity-80 focus:outline-none focus:border-[#1E5AA8]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#667085] font-bold">PIN Code</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.pinCode || ''}
                  onChange={(e) => handleChange('pinCode', e.target.value)}
                  className="w-full bg-[#F6F8FA] border border-[#D9E1E8] rounded-xl px-3 py-2.5 font-bold text-[#12304A] disabled:opacity-80 focus:outline-none focus:border-[#1E5AA8]"
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
