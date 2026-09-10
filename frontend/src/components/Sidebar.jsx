import {
  LayoutDashboard,
  HelpCircle,
  Layers,
  FolderCheck,
  FileCheck,
  Calculator,
  MapPin,
  User,
  X,
  Lock,
  LogOut,
  ShieldCheck,
  Building2,
  CheckCircle2
} from 'lucide-react'
import useChatStore from '../store/chatStore'

// Citizen-friendly visible labels
const NAV_ITEMS = [
  { id: 'dashboard',      label: 'Dashboard',         icon: LayoutDashboard, badge: null },
  { id: 'ai-onboarding',  label: 'Find Help',         icon: HelpCircle,      badge: 'Step-by-Step' },
  { id: 'scheme-results', label: 'Find Schemes',      icon: Layers,          badge: null },
  { id: 'applications',   label: 'My Applications',   icon: FolderCheck,     badge: 'Active' },
  { id: 'documents',      label: 'My Documents',      icon: FileCheck,       badge: null },
  { id: 'calculator',     label: 'Loan Calculator',   icon: Calculator,      badge: null },
  { id: 'partner-finder', label: 'Where to Apply',    icon: MapPin,          badge: 'Nearby' },
  { id: 'profile',        label: 'My Profile',         icon: User,            badge: null },
  { id: 'admin',          label: 'MoSJE Admin Portal',icon: Lock,            badge: 'Gov Admin' },
]

export default function Sidebar() {
  const { activeTab, setActiveTab, sidebarOpen, setSidebarOpen, userProfile, logoutUser } = useChatStore()

  if (!userProfile?.isAuthenticated) return null

  const isAdmin = userProfile?.role === 'admin'

  // Calculate rough profile completion percentage
  const completedFields = [
    userProfile.name,
    userProfile.age,
    userProfile.category,
    userProfile.income > 0,
    userProfile.state,
    userProfile.businessType,
  ].filter(Boolean).length
  const completionPct = Math.round((completedFields / 6) * 100)

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-[3px] left-0 bottom-0 w-64 z-50 flex flex-col transition-transform duration-200 lg:translate-x-0 bg-white border-r border-[#D9E1E8] shadow-sm ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="shrink-0 h-16 px-4 flex items-center justify-between border-b border-[#D9E1E8] bg-[#F6F8FA]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#12304A] flex items-center justify-center text-white shadow-2xs">
              <Building2 size={18} />
            </div>
            <div>
              <h1 className="text-base font-black text-[#12304A] tracking-tight">SchemeSetu</h1>
              <p className="text-[10px] font-bold text-[#E67E22] uppercase tracking-wide">
                MoSJE Citizen Portal
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Profile Mini Card with Completion Progress */}
        <div className="p-3 m-3 rounded-xl bg-[#F6F8FA] border border-[#D9E1E8] space-y-2">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-xs text-white shadow-2xs ${
              isAdmin ? 'bg-[#E67E22]' : 'bg-[#12304A]'
            }`}>
              {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#12304A] truncate">{userProfile?.name || 'Beneficiary'}</p>
              <div className="flex items-center gap-1.5 text-[10px] text-[#667085]">
                <span className="font-semibold text-[#16834B]">{userProfile?.category || 'SC'} Beneficiary</span>
                {userProfile?.district && <span>• {userProfile.district}</span>}
              </div>
            </div>
          </div>

          {/* Profile Progress Bar */}
          <div className="space-y-1 pt-1 border-t border-gray-200">
            <div className="flex items-center justify-between text-[10px] font-semibold text-[#667085]">
              <span>Profile Completion</span>
              <span className="text-[#12304A] font-bold">{completionPct}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-[#16834B] rounded-full transition-all duration-300"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Navigation Items with Citizen Labels */}
        <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
          {NAV_ITEMS.filter((item) => item.id !== 'admin' || isAdmin).map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer touch-target ${
                  isActive
                    ? 'bg-[#12304A] text-white shadow-xs'
                    : 'text-[#17212B] hover:bg-gray-100'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-white' : 'text-[#1E5AA8]'} />
                <span className="flex-1 text-left truncate">{item.label}</span>
                {item.badge && (
                  <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-md ${
                    isActive ? 'bg-white/20 text-white' : 'bg-blue-50 text-[#1E5AA8]'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="shrink-0 p-3 border-t border-[#D9E1E8] space-y-2 bg-[#F6F8FA]">
          {/* Operational Status indicator */}
          <div className="p-2 rounded-xl bg-white border border-[#D9E1E8] text-[11px] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#16834B] animate-pulse" />
            <div className="min-w-0">
              <span className="font-bold text-[#12304A] block leading-none">Services Operational</span>
              <span className="text-[9px] text-[#667085]">MoSJE Verified Database</span>
            </div>
          </div>

          <button
            onClick={logoutUser}
            className="w-full py-2 px-3 rounded-xl text-[#667085] hover:text-red-700 hover:bg-red-50 text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-transparent hover:border-red-200"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
