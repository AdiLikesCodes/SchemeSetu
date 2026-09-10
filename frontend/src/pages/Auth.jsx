import { useState } from 'react'
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
  ShieldCheck,
  User,
  KeyRound,
  Building2,
  ArrowLeft
} from 'lucide-react'
import useChatStore from '../store/chatStore'

export default function Auth() {
  const { loginUser, signupUser, setActiveTab } = useChatStore()
  const [mode, setMode] = useState('login')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [category, setCategory] = useState('SC')
  const [stateName, setStateName] = useState('Kerala')
  const [district, setDistrict] = useState('Thiruvananthapuram')
  const [role, setRole] = useState('beneficiary')

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    if (mode === 'login') {
      const res = await loginUser(email, password)
      if (!res.success) setErrorMsg(res.error || 'Invalid email or password. Please try again.')
    } else {
      if (!fullName.trim()) {
        setErrorMsg('Full name is required.')
        setLoading(false)
        return
      }
      const res = await signupUser({
        full_name: fullName,
        email,
        password,
        phone_number: phone,
        category,
        state: stateName,
        district,
        role,
      })
      if (!res.success) setErrorMsg(res.error || 'Registration failed. Please try again.')
    }
    setLoading(false)
  }

  const handleQuickDemo = async (demoRole) => {
    setLoading(true)
    setErrorMsg('')
    const demoEmail = demoRole === 'admin' ? 'admin@schemesetu.gov.in' : 'rajesh.kumar@example.com'
    const demoPass = 'DemoPass@123'
    const res = await loginUser(demoEmail, demoPass)
    if (!res.success) {
      const signupRes = await signupUser({
        full_name: demoRole === 'admin' ? 'MoSJE Admin Officer' : 'Rajesh Kumar',
        email: demoEmail,
        password: demoPass,
        phone_number: '9876543210',
        category: 'SC',
        state: 'Kerala',
        district: 'Thiruvananthapuram',
        role: demoRole,
      })
      if (!signupRes.success) setErrorMsg(signupRes.error || 'Quick login failed')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 sm:p-6 bg-[#F6F8FA]">
      <div className="max-w-md w-full space-y-4">
        {/* Back to Home Link */}
        <button
          onClick={() => setActiveTab('landing')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E5AA8] hover:text-[#12304A] transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Home</span>
        </button>

        {/* ── Official Seal Header ── */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-white border border-[#D9E1E8] flex items-center justify-center shadow-xs">
            <Building2 size={28} className="text-[#12304A]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#12304A] tracking-tight">SchemeSetu Portal</h1>
            <p className="text-xs font-bold text-[#667085] uppercase tracking-wide mt-0.5">
              Ministry of Social Justice & Empowerment • Govt. of India
            </p>
          </div>
          {/* Subtle Tricolor line */}
          <div className="flex justify-center gap-0.5 mt-1">
            <div className="h-1 w-6 rounded-l-full bg-[#FF9933]" />
            <div className="h-1 w-6 bg-white border-y border-gray-200" />
            <div className="h-1 w-6 rounded-r-full bg-[#138808]" />
          </div>
        </div>

        {/* ── Auth Card ── */}
        <div className="bg-white border border-[#D9E1E8] rounded-2xl shadow-xs p-6 sm:p-8 space-y-5">
          {/* Tab Toggle */}
          <div className="flex rounded-xl overflow-hidden border border-[#D9E1E8] text-xs font-bold bg-[#F6F8FA] p-1">
            <button
              type="button"
              onClick={() => {
                setMode('login')
                setErrorMsg('')
              }}
              className={`flex-1 py-2 rounded-lg transition-colors cursor-pointer ${
                mode === 'login' ? 'bg-[#12304A] text-white shadow-xs' : 'text-[#667085] hover:text-[#12304A]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup')
                setErrorMsg('')
              }}
              className={`flex-1 py-2 rounded-lg transition-colors cursor-pointer ${
                mode === 'signup' ? 'bg-[#12304A] text-white shadow-xs' : 'text-[#667085] hover:text-[#12304A]'
              }`}
            >
              Register Account
            </button>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 font-bold">
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="font-bold text-[#12304A]">Full Name (As per Aadhaar)</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rajesh Kumar"
                  className="w-full bg-[#F6F8FA] border border-[#D9E1E8] rounded-xl px-4 py-2.5 font-bold text-[#12304A] placeholder-gray-400 focus:outline-none focus:border-[#1E5AA8]"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="font-bold text-[#12304A]">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="applicant@example.com"
                  className="w-full bg-[#F6F8FA] border border-[#D9E1E8] rounded-xl pl-9 pr-4 py-2.5 font-bold text-[#12304A] placeholder-gray-400 focus:outline-none focus:border-[#1E5AA8]"
                />
                <Mail size={15} className="absolute left-3 top-3 text-[#667085]" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#12304A]">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#F6F8FA] border border-[#D9E1E8] rounded-xl pl-9 pr-4 py-2.5 font-bold text-[#12304A] placeholder-gray-400 focus:outline-none focus:border-[#1E5AA8]"
                />
                <Lock size={15} className="absolute left-3 top-3 text-[#667085]" />
              </div>
            </div>

            {mode === 'signup' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-[#12304A]">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full bg-[#F6F8FA] border border-[#D9E1E8] rounded-xl px-3 py-2 font-bold text-[#12304A] focus:outline-none focus:border-[#1E5AA8]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[#12304A]">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-[#F6F8FA] border border-[#D9E1E8] rounded-xl px-3 py-2 font-bold text-[#12304A] focus:outline-none focus:border-[#1E5AA8]"
                    >
                      <option value="SC">Scheduled Caste (SC)</option>
                      <option value="ST">Scheduled Tribe (ST)</option>
                      <option value="OBC">OBC</option>
                      <option value="General">General / EWS</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#12304A]">Account Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-[#F6F8FA] border border-[#D9E1E8] rounded-xl px-3 py-2 font-bold text-[#12304A] focus:outline-none focus:border-[#1E5AA8]"
                  >
                    <option value="beneficiary">Beneficiary Applicant (Citizen Access)</option>
                    <option value="admin">MoSJE Admin Officer (Admin Portal Access)</option>
                  </select>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full touch-target py-3 rounded-xl bg-[#12304A] hover:bg-[#153A5B] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In to Account' : 'Register Account'}</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Instant Demo Logins */}
          <div className="pt-3 border-t border-gray-100 space-y-2.5">
            <span className="text-[10px] font-bold text-[#667085] text-center block uppercase tracking-wider">
              Instant Demo Access
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('beneficiary')}
                disabled={loading}
                className="touch-target py-2.5 px-3 rounded-xl bg-[#F6F8FA] hover:bg-blue-50 border border-[#D9E1E8] hover:border-blue-200 text-[#12304A] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <User size={13} className="text-[#1E5AA8]" />
                <span>Demo Beneficiary</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                disabled={loading}
                className="touch-target py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-[#C2410C] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <KeyRound size={13} className="text-[#E67E22]" />
                <span>Demo Admin Officer</span>
              </button>
            </div>
          </div>
        </div>

        {/* Security Footer */}
        <div className="text-center text-[10px] text-[#667085] flex items-center justify-center gap-1.5">
          <ShieldCheck size={13} className="text-[#16834B]" />
          <span>Protected by Government Encryption Standards • MoSJE RBAC</span>
        </div>
      </div>
    </div>
  )
}
