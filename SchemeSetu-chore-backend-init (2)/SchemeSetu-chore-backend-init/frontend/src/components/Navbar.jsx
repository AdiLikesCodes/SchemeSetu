import { useState } from 'react'
import { 
  Globe, 
  Menu, 
  ShieldCheck, 
  UserCheck, 
  Bell, 
  Building2, 
  ChevronDown,
  Lock,
  Search,
  LogOut
} from 'lucide-react'
import useChatStore from '../store/chatStore'

const LANGUAGES = ['English', 'हिंदी', 'മലയാളം', 'தமிழ்', 'తెలుగు']

export default function Navbar() {
  const { 
    activeTab, 
    setActiveTab, 
    setSidebarOpen, 
    userProfile, 
    language, 
    setLanguage,
    logoutUser
  } = useChatStore()

  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const isAuthenticated = Boolean(userProfile?.isAuthenticated)

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      
      {/* ── Top Official Government Service Strip ───────────────────────────── */}
      <div className="bg-[#0f172a] text-slate-300 text-[11px] px-4 py-1.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
            <Building2 size={13} className="text-amber-400" />
            <span>Government of India • Ministry of Social Justice & Empowerment</span>
          </div>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline text-slate-400">National Scheme Eligibility Assistance Portal</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors py-0.5 px-2 rounded-md hover:bg-slate-800"
            >
              <Globe size={12} className="text-indigo-400" />
              <span className="font-semibold">{language}</span>
              <ChevronDown size={12} />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 text-slate-700 text-xs">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setLanguage(lang)
                      setLangMenuOpen(false)
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 transition-colors ${
                      language === lang ? 'font-bold text-indigo-900 bg-indigo-50/50' : ''
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>

          <span className="text-slate-600">|</span>

          {/* Prototype Notice */}
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-sm bg-slate-800 text-amber-300 border border-slate-700">
            {isAuthenticated ? 'Authenticated Session' : 'Login Required'}
          </span>
        </div>
      </div>

      {/* ── Primary Government Portal Header ───────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        
        {/* Brand & Emblem */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={20} />
            </button>
          )}

          <button 
            onClick={() => setActiveTab(isAuthenticated ? 'dashboard' : 'auth')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            {/* Official Style Badge */}
            <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-amber-400 font-extrabold text-lg shadow-xs">
              🏛️
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-black tracking-tight text-slate-900 group-hover:text-indigo-900 transition-colors">
                  SchemeSetu
                </h1>
                <span className="px-1.5 py-0.2 rounded-xs bg-indigo-100 text-indigo-950 font-extrabold text-[10px] uppercase border border-indigo-200">
                  MoSJE
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-500 tracking-wide">
                SCHEME ELIGIBILITY & APPLICATION PORTAL
              </p>
            </div>
          </button>
        </div>

        {/* Horizontal Navigation Links (Only for authenticated users) */}
        {isAuthenticated && (
          <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-700">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'ai-onboarding', label: 'AI Assistant' },
              { id: 'scheme-results', label: 'Schemes' },
              { id: 'calculator', label: 'Calculator' },
              { id: 'partner-finder', label: 'Channel Partners' },
              { id: 'documents', label: 'Documents' },
              { id: 'applications', label: 'My Applications' },
              ...(userProfile?.role === 'admin' ? [{ id: 'admin', label: 'Admin Portal' }] : []),
            ].map((nav) => {
              const isActive = activeTab === nav.id
              return (
                <button
                  key={nav.id}
                  onClick={() => setActiveTab(nav.id)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white font-bold'
                      : 'hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {nav.label}
                </button>
              )
            })}
          </nav>
        )}

        {/* User Account / Profile & Auth Controls */}
        <div className="flex items-center gap-2.5">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-2 p-1.5 px-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left"
              >
                <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                  {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'B'}
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                    {userProfile.name || 'Beneficiary'}
                  </p>
                  <p className="text-[10px] font-semibold text-emerald-700 leading-tight">
                    {userProfile.role === 'admin' ? 'MoSJE Admin Officer' : `Verified ${userProfile.category || 'SC'} Beneficiary`}
                  </p>
                </div>
              </button>

              <button
                onClick={logoutUser}
                title="Sign Out of Portal"
                className="p-2 rounded-lg border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-600 hover:text-rose-700 transition-colors flex items-center gap-1.5 text-xs font-bold"
              >
                <LogOut size={16} />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setActiveTab('auth')}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <UserCheck size={14} />
              <span>Beneficiary Sign In</span>
            </button>
          )}
        </div>

      </div>
    </header>
  )
}
