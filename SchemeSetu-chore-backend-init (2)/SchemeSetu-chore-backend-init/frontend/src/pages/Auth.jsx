import { useState } from 'react'
import { 
  Lock, 
  Mail, 
  UserCheck, 
  ArrowRight, 
  AlertCircle, 
  Loader2,
  ShieldCheck
} from 'lucide-react'
import useChatStore from '../store/chatStore'

export default function Auth() {
  const { loginUser, signupUser } = useChatStore()
  const [mode, setMode] = useState('login') // 'login' | 'signup'

  // Form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [category, setCategory] = useState('SC')
  const [stateName, setStateName] = useState('Kerala')
  const [district, setDistrict] = useState('Thiruvananthapuram')
  const [role, setRole] = useState('beneficiary') // 'beneficiary' | 'admin'

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    if (mode === 'login') {
      const res = await loginUser(email, password)
      if (!res.success) {
        setErrorMsg(res.error || 'Invalid email or password. Please try again.')
      }
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
      if (!res.success) {
        setErrorMsg(res.error || 'Registration failed. Please try again.')
      }
    }

    setLoading(false)
  }


  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl shadow-xs p-6 md:p-8 space-y-6">
        
        {/* Header Emblem */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-amber-400 text-2xl font-black mx-auto flex items-center justify-center shadow-xs">
            🏛️
          </div>
          <div className="space-y-0.5">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">SchemeSetu Portal</h1>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Ministry of Social Justice & Empowerment
            </p>
          </div>
        </div>

        {/* Tab Toggle: Login vs Signup */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg('') }}
            className={`flex-1 py-2 rounded-md transition-colors ${
              mode === 'login' ? 'bg-slate-900 text-white font-extrabold shadow-xs' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Beneficiary Login
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setErrorMsg('') }}
            className={`flex-1 py-2 rounded-md transition-colors ${
              mode === 'signup' ? 'bg-slate-900 text-white font-extrabold shadow-xs' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            New Registration
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-medium">
            <AlertCircle size={16} className="text-rose-700 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Full Name (As in Aadhaar)</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Beneficiary Name"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-500"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.gov.in"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-500"
            />
          </div>

          {mode === 'signup' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Social Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none"
                  >
                    <option value="SC">Scheduled Caste (SC)</option>
                    <option value="ST">Scheduled Tribe (ST)</option>
                    <option value="OBC">OBC</option>
                    <option value="General">General / EWS</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">State</label>
                  <input
                    type="text"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">District</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Account Access Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none"
                >
                  <option value="beneficiary">Beneficiary User (Applicant Access)</option>
                  <option value="admin">MoSJE Admin Officer (Admin Portal Access)</option>
                </select>
                <p className="text-[10px] text-slate-500">
                  {role === 'admin'
                    ? '🔑 Role saved in MongoDB: Full access to Admin Scraper & Scheme Management Portal'
                    : '👤 Role saved in MongoDB: Access to Beneficiary Dashboard & AI Scheme Finder'}
                </p>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In to Portal' : 'Register New Beneficiary Account'}</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        {/* Security Notice Footer */}
        <div className="pt-3 border-t border-slate-200 text-center">
          <p className="text-[10px] text-slate-500">
            Protected by Government Encryption Standard • MoSJE Role-Based Access Control
          </p>
        </div>

      </div>
    </div>
  )
}
