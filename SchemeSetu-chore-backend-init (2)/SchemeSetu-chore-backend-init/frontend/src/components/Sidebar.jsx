import { 
  LayoutDashboard, 
  Bot, 
  User, 
  FileText, 
  Calculator, 
  MapPin, 
  FileCheck, 
  FolderCheck, 
  ShieldCheck, 
  X,
  HelpCircle,
  Globe,
  Lock,
  UserCheck
} from 'lucide-react'
import useChatStore from '../store/chatStore'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'ai-onboarding', label: 'AI Assistant', icon: Bot, badge: 'Guided' },
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'scheme-results', label: 'My Schemes', icon: FileText, badge: '4 Matched' },
  { id: 'calculator', label: 'Financial Calculator', icon: Calculator },
  { id: 'partner-finder', label: 'Channel Partners', icon: MapPin },
  { id: 'documents', label: 'Documents & OCR', icon: FileCheck, badge: 'PaddleOCR' },
  { id: 'applications', label: 'My Applications', icon: FolderCheck, badge: 'Active' },
  { id: 'admin', label: 'Admin Portal', icon: Lock, badge: 'Gov' },
]

export default function Sidebar() {
  const { 
    activeTab, 
    setActiveTab, 
    sidebarOpen, 
    setSidebarOpen, 
    userProfile,
    language,
    setLanguage,
    logoutUser
  } = useChatStore()

  if (!userProfile?.isAuthenticated) {
    return null
  }

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden" 
        />
      )}

      <aside 
        className={`fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-slate-200 z-50 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header inside Sidebar */}
        <div className="shrink-0 h-16 px-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-amber-400 font-black text-sm">
              🏛️
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 tracking-tight">SchemeSetu</h1>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">MoSJE Digital Portal</p>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Card */}
        <div className="p-3 mx-3 my-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs text-white ${
            userProfile.role === 'admin' ? 'bg-amber-600' : 'bg-slate-900'
          }`}>
            {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'B'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">{userProfile.name || 'Beneficiary User'}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase tracking-wide ${
                userProfile.role === 'admin'
                  ? 'bg-amber-100 text-amber-700 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {userProfile.role || 'beneficiary'}
              </span>
              {userProfile.state && (
                <span className="text-[10px] font-semibold text-slate-500 truncate">• {userProfile.state}</span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
          {NAV_ITEMS.filter((item) => item.id !== 'admin' || userProfile?.role === 'admin').map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-white' : 'text-slate-500'} />
                <span className="flex-1 text-left truncate">{item.label}</span>
                {item.badge && (
                  <span 
                    className={`px-1.5 py-0.5 text-[9px] font-bold rounded-md ${
                      isActive 
                        ? 'bg-slate-800 text-amber-300 border border-slate-700' 
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Footer Support Info */}
        <div className="shrink-0 p-3 border-t border-slate-200 space-y-2">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Official Verification</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Deterministic rule engine verified against official guidelines.
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-1">
            <span className="flex items-center gap-1">
              <HelpCircle size={12} /> Help & Support
            </span>
            <span className="font-mono">v2026.1</span>
          </div>
        </div>
      </aside>
    </>
  )
}
