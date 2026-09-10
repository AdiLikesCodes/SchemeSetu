import { useState } from 'react'
import {
  Menu,
  ShieldCheck,
  Globe,
  ChevronDown,
  LogOut,
  Lock,
  Volume2,
  Sliders,
  HelpCircle,
  Home,
  FileText,
  Calculator,
  MapPin,
  Layers,
  FolderCheck,
  User,
  Sparkles
} from 'lucide-react'
import useChatStore from '../store/chatStore'

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी (Hindi)' },
  { code: 'ml', label: 'മലയാളം (Malayalam)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
]

export default function Navbar() {
  const {
    activeTab,
    setActiveTab,
    setSidebarOpen,
    userProfile,
    language,
    setLanguage,
    logoutUser,
  } = useChatStore()

  const [langMenuOpen, setLangMenuOpen] = useState(false)

  const isAuthenticated = Boolean(userProfile?.isAuthenticated)
  const isAdmin = userProfile?.role === 'admin'

  // Read page header aloud for citizen with low literacy
  const handleReadAloud = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const mainHead = document.querySelector('h1')?.innerText || 'SchemeSetu Government Scheme Assistance Platform'
      const utterance = new SpeechSynthesisUtterance(mainHead)
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN'
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <header className="sticky top-[3px] z-30 bg-white border-b border-[#D9E1E8] shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-3">
        {/* Left: Mobile Toggle + SchemeSetu Bridge Logo */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-[#12304A] hover:bg-gray-100 lg:hidden transition-colors touch-target"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          )}

          {/* Logo Concept: Simple Bridge connecting Beneficiary -> Scheme -> Finance -> Partner */}
          <button
            onClick={() => setActiveTab(isAuthenticated ? 'dashboard' : 'landing')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#12304A] text-white flex items-center justify-center shadow-xs p-1.5 shrink-0 group-hover:bg-[#1E5AA8] transition-colors">
              {/* Bridge Path Icon SVG */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <path d="M4 19V9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10" />
                <path d="M2 19h20" />
                <path d="M7 19v-4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4" />
                <circle cx="12" cy="5" r="1.5" fill="#E67E22" stroke="#E67E22" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black text-[#12304A] tracking-tight group-hover:text-[#1E5AA8] transition-colors">
                  SchemeSetu
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-[#E67E22] border border-amber-200">
                  MoSJE
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-medium text-[#667085] leading-none hidden xs:block">
                Government Scheme Assistance Platform
              </p>
            </div>
          </button>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold text-[#17212B]">
          <button
            onClick={() => setActiveTab(isAuthenticated ? 'dashboard' : 'landing')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'landing' || activeTab === 'dashboard'
                ? 'text-[#1E5AA8] bg-blue-50 font-bold'
                : 'hover:bg-gray-100 text-[#475467]'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab('ai-onboarding')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'ai-onboarding'
                ? 'text-[#1E5AA8] bg-blue-50 font-bold'
                : 'hover:bg-gray-100 text-[#475467]'
            }`}
          >
            Find Help
          </button>
          <button
            onClick={() => setActiveTab('scheme-results')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'scheme-results' || activeTab === 'scheme-details'
                ? 'text-[#1E5AA8] bg-blue-50 font-bold'
                : 'hover:bg-gray-100 text-[#475467]'
            }`}
          >
            Find Schemes
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'calculator'
                ? 'text-[#1E5AA8] bg-blue-50 font-bold'
                : 'hover:bg-gray-100 text-[#475467]'
            }`}
          >
            Loan Calculator
          </button>
          <button
            onClick={() => setActiveTab('partner-finder')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'partner-finder'
                ? 'text-[#1E5AA8] bg-blue-50 font-bold'
                : 'hover:bg-gray-100 text-[#475467]'
            }`}
          >
            Where to Apply
          </button>
          {isAuthenticated && (
            <button
              onClick={() => setActiveTab('applications')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'applications'
                  ? 'text-[#1E5AA8] bg-blue-50 font-bold'
                  : 'hover:bg-gray-100 text-[#475467]'
              }`}
            >
              My Applications
            </button>
          )}
        </nav>

        {/* Right Controls: Read Aloud, Language, Auth */}
        <div className="flex items-center gap-2">
          {/* Read Aloud Button */}
          <button
            onClick={handleReadAloud}
            className="p-2 rounded-lg text-gray-600 hover:text-[#1E5AA8] hover:bg-gray-100 transition-colors cursor-pointer"
            title="Listen to page aloud"
            aria-label="Read aloud"
          >
            <Volume2 size={18} />
          </button>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 text-xs text-[#12304A] font-semibold py-1.5 px-2.5 rounded-lg border border-[#D9E1E8] bg-white hover:bg-gray-50 transition-colors"
              aria-label="Select language"
            >
              <Globe size={14} className="text-[#1E5AA8]" />
              <span className="hidden sm:inline">
                {LANGUAGES.find((l) => l.code === language)?.label.split(' ')[0] || 'English'}
              </span>
              <ChevronDown size={13} className="text-gray-500" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white border border-[#D9E1E8] rounded-xl shadow-xl py-1 z-50 text-xs">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code)
                      setLangMenuOpen(false)
                    }}
                    className={`w-full text-left px-3.5 py-2 hover:bg-blue-50 transition-colors ${
                      language === lang.code ? 'font-bold text-[#1E5AA8] bg-blue-50/60' : 'text-[#17212B]'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile or Sign In */}
          {isAuthenticated ? (
            <div className="flex items-center gap-1.5 pl-2 border-l border-[#D9E1E8]">
              <button
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
                title="View Profile"
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-xs ${
                  isAdmin ? 'bg-[#E67E22]' : 'bg-[#12304A]'
                }`}>
                  {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-xs font-bold text-[#12304A] hidden md:inline max-w-[100px] truncate">
                  {userProfile?.name || 'Beneficiary'}
                </span>
              </button>

              <button
                onClick={logoutUser}
                title="Sign Out"
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                aria-label="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveTab('auth')}
              className="px-3.5 py-2 rounded-lg text-white text-xs font-bold flex items-center gap-1.5 bg-[#12304A] hover:bg-[#153A5B] transition-colors shadow-xs cursor-pointer"
            >
              <ShieldCheck size={14} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
