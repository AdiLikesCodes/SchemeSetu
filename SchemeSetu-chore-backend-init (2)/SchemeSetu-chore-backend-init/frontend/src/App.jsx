import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import useChatStore from './store/chatStore'

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
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-5 p-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center">
        <ShieldX size={32} className="text-rose-500" />
      </div>
      <div className="space-y-1">
        <h2 className="text-xl font-black text-slate-900">Access Restricted</h2>
        <p className="text-sm text-slate-500 max-w-xs">
          The Admin Portal requires an <span className="font-bold text-slate-700">admin</span> role.
          Your current role is{' '}
          <span className="font-bold text-rose-600">{userProfile?.role || 'beneficiary'}</span>.
        </p>
        <p className="text-xs text-slate-400 mt-1">
          If you believe this is an error, contact your system administrator to update your role in the database.
        </p>
      </div>
      <button
        onClick={() => setActiveTab('dashboard')}
        className="px-5 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-700 transition-colors"
      >
        Go to Dashboard
      </button>
    </div>
  )
}

export default function App() {
  const { activeTab, userProfile } = useChatStore()

  const isAuthenticated = Boolean(userProfile?.isAuthenticated)
  const isAdmin = userProfile?.role === 'admin'

  const renderActivePage = () => {
    if (!isAuthenticated) {
      return <Auth />
    }

    switch (activeTab) {
      case 'auth':
        // Already logged in — redirect to appropriate home
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
        // Role-based guard: only admin role can access AdminDashboard
        return isAdmin ? <AdminDashboard /> : <AccessDenied />
      default:
        return isAdmin ? <AdminDashboard /> : <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans antialiased selection:bg-slate-900 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 ${isAuthenticated ? 'lg:pl-64' : ''}`}>
        {/* Top Navbar */}
        <Navbar />

        {/* Dynamic Page Container */}
        <main className="flex-1 min-h-0 overflow-y-auto">
          {renderActivePage()}
        </main>
      </div>
    </div>
  )
}
