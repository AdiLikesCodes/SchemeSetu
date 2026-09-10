import { Home, HelpCircle, Layers, FolderCheck, User } from 'lucide-react'
import useChatStore from '../store/chatStore'

export default function MobileNav() {
  const { activeTab, setActiveTab, userProfile } = useChatStore()
  const isAuth = Boolean(userProfile?.isAuthenticated)

  const tabs = [
    { id: isAuth ? 'dashboard' : 'landing', label: isAuth ? 'Dashboard' : 'Home', icon: Home },
    { id: 'ai-onboarding', label: 'Find Help', icon: HelpCircle },
    { id: 'scheme-results', label: 'Schemes', icon: Layers },
    { id: isAuth ? 'applications' : 'partner-finder', label: isAuth ? 'Applications' : 'Where to Apply', icon: FolderCheck },
    { id: isAuth ? 'profile' : 'auth', label: isAuth ? 'Profile' : 'Sign In', icon: User },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#D9E1E8] lg:hidden flex items-center justify-around px-1 py-1.5 shadow-lg"
      aria-label="Mobile Navigation Bar"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-lg text-[10px] font-bold transition-colors touch-target ${
              isActive
                ? 'text-[#1E5AA8] bg-blue-50'
                : 'text-[#667085] hover:text-[#17212B]'
            }`}
          >
            <Icon size={18} className={isActive ? 'text-[#1E5AA8]' : 'text-[#667085]'} />
            <span className="mt-0.5 truncate max-w-[65px]">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
