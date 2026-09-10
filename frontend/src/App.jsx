import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import MobileNav from './components/MobileNav'
import useChatStore from './store/chatStore'

import Landing from './pages/Landing'
import ChatFlow from './pages/ChatFlow'
import Dashboard from './pages/Dashboard'
import SchemeResults from './pages/SchemeResults'
import SchemeDetails from './pages/SchemeDetails'
import FinancialCalculator from './pages/FinancialCalculator'
import PartnerFinder from './pages/PartnerFinder'
import Documents from './pages/Documents'
import Applications from './pages/Applications'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'
import Auth from './pages/Auth'
import { ShieldX } from 'lucide-react'

// ── Role-guard: shown when a non-admin tries to reach /admin ──────────────────
function AccessDenied() {
  const { setActiveTab, userProfile } = useChatStore()
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] gap-5 p-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center shadow-md">
        <ShieldX size={32} className="text-red-500" />
      </div>
      <div className="space-y-1.5 max-w-sm">
        <h2 className="text-xl font-black text-[#12304A]">Access Restricted</h2>
        <p className="text-sm text-[#667085]">
          The Admin Portal requires an <span className="font-bold text-[#12304A]">admin</span> role.
          Your current role is{' '}
          <span className="font-bold text-red-600">{userProfile?.role || 'beneficiary'}</span>.
        </p>
        <p className="text-xs text-[#667085] mt-1">
          If you require administrative access to the scheme ingestion pipeline, contact your MoSJE administrator.
        </p>
      </div>
      <button
        onClick={() => setActiveTab('dashboard')}
        className="px-6 py-2.5 rounded-xl bg-[#12304A] hover:bg-[#153A5B] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
      >
        Return to Dashboard
      </button>
    </div>
  )
}

export default function App() {
  const { activeTab, userProfile } = useChatStore()

  const isAuthenticated = Boolean(userProfile?.isAuthenticated)
  const isAdmin = userProfile?.role === 'admin'

  const renderActivePage = () => {
    // Unauthenticated public exploration routes
    if (!isAuthenticated) {
      switch (activeTab) {
        case 'landing':
          return <Landing />
        case 'ai-onboarding':
          return <ChatFlow />
        case 'scheme-results':
          return <SchemeResults />
        case 'scheme-details':
          return <SchemeDetails />
        case 'calculator':
          return <FinancialCalculator />
        case 'partner-finder':
          return <PartnerFinder />
        case 'auth':
          return <Auth />
        default:
          return <Landing />
      }
    }

    // Authenticated user routes
    switch (activeTab) {
      case 'landing':
        return <Landing />
      case 'auth':
        return isAdmin ? <AdminDashboard /> : <Dashboard />
      case 'ai-onboarding':
        return <ChatFlow />
      case 'dashboard':
        return <Dashboard />
      case 'scheme-results':
        return <SchemeResults />
      case 'scheme-details':
        return <SchemeDetails />
      case 'calculator':
        return <FinancialCalculator />
      case 'partner-finder':
        return <PartnerFinder />
      case 'documents':
        return <Documents />
      case 'applications':
        return <Applications />
      case 'profile':
        return <Profile />
      case 'admin':
        return isAdmin ? <AdminDashboard /> : <AccessDenied />
      default:
        return isAdmin ? <AdminDashboard /> : <Dashboard />
    }
  }

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased bg-[#F6F8FA] text-[#17212B]">
      {/* Tricolor top bar */}
      <div className="gov-tricolor-bar fixed top-0 left-0 right-0 z-[100]" />

      <div className="flex-1 flex min-h-screen">
        {/* Sidebar Navigation (for authenticated users) */}
        <Sidebar />

        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col min-w-0 pt-[3px] ${isAuthenticated ? 'lg:pl-64' : ''}`}>
          {/* Top Navbar */}
          <Navbar />

          {/* Dynamic Page Container */}
          <main className="flex-1 min-h-0 overflow-y-auto pb-20 lg:pb-8">
            {renderActivePage()}
          </main>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <MobileNav />
    </div>
  )
}
