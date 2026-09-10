import { useState } from 'react'
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Building2,
  PhoneCall,
  Sparkles,
  HelpCircle,
  Briefcase,
  GraduationCap,
  Coins,
  Store,
  MapPin,
  FileText,
  ChevronRight,
  ExternalLink,
  Users
} from 'lucide-react'
import useChatStore from '../store/chatStore'
import { TermExplainer } from '../components/PlainLanguageModal'
import NextStepCard from '../components/NextStepCard'

export default function Landing() {
  const { setActiveTab, schemes, setSelectedScheme, updateProfile } = useChatStore()

  // Intent handler: clicking one of the 5 big buttons sets the intent and jumps right into the wizard
  const handleIntentSelection = (intentLabel, businessType = '') => {
    if (businessType) {
      updateProfile({ businessType })
    }
    setActiveTab('ai-onboarding')
  }

  const handleSelectScheme = (scheme) => {
    setSelectedScheme(scheme)
    setActiveTab('scheme-details')
  }

  // Use published schemes or fallback
  const featuredSchemes = schemes.slice(0, 3)

  return (
    <div className="space-y-10 pb-16">
      {/* ── 1. Hero Section: Problem-First ─────────────────────────────────── */}
      <section className="bg-white border-b border-[#D9E1E8] pt-8 pb-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Government Badge & Department Tag */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#1E5AA8] text-xs font-bold border border-blue-200">
              <Building2 size={14} />
              <span>Ministry of Social Justice & Empowerment</span>
            </span>
            <span className="text-xs text-[#667085] hidden sm:inline">• Official Citizen Assistance Portal</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left 7 cols: Plain Heading and Problem Prompt */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#12304A] tracking-tight leading-[1.15]">
                  Find Government Help You Can Apply For
                </h1>
                <p className="text-base sm:text-lg text-[#667085] leading-relaxed max-w-2xl">
                  SchemeSetu helps you find government funding, concessional business loans, understand eligibility rules, and find approved places to apply.
                </p>
              </div>

              {/* Problem-First Prompt: What do you need help with? */}
              <div className="bg-[#F6F8FA] border border-[#D9E1E8] rounded-2xl p-5 md:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm md:text-base font-extrabold text-[#12304A]">
                    What do you need help with?
                  </h2>
                  <span className="text-xs text-[#1E5AA8] font-semibold">Touch an option to begin</span>
                </div>

                {/* Large 5 Buttons for low digital literacy users */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => handleIntentSelection('Business Loan', 'Manufacturing / Small Enterprise')}
                    className="touch-target p-4 rounded-xl bg-white border border-[#D9E1E8] hover:border-[#1E5AA8] hover:bg-blue-50/50 text-left transition-all flex items-center gap-3 shadow-2xs group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#1E5AA8] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Briefcase size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#12304A]">Start or grow my business</h3>
                      <p className="text-xs text-[#667085]">Term loans & machinery credit</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleIntentSelection('Education Loan', 'Higher Education / Skill Training')}
                    className="touch-target p-4 rounded-xl bg-white border border-[#D9E1E8] hover:border-[#1E5AA8] hover:bg-blue-50/50 text-left transition-all flex items-center gap-3 shadow-2xs group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-green-50 text-[#16834B] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <GraduationCap size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#12304A]">Pay for education</h3>
                      <p className="text-xs text-[#667085]">Concessional education loans</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleIntentSelection('Micro Loan', 'Micro Enterprise')}
                    className="touch-target p-4 rounded-xl bg-white border border-[#D9E1E8] hover:border-[#1E5AA8] hover:bg-blue-50/50 text-left transition-all flex items-center gap-3 shadow-2xs group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-amber-50 text-[#E67E22] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Coins size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#12304A]">I need a loan</h3>
                      <p className="text-xs text-[#667085]">Working capital & small funding</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleIntentSelection('Self Employment', 'Retail / Service Shop')}
                    className="touch-target p-4 rounded-xl bg-white border border-[#D9E1E8] hover:border-[#1E5AA8] hover:bg-blue-50/50 text-left transition-all flex items-center gap-3 shadow-2xs group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Store size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#12304A]">Start self-employment</h3>
                      <p className="text-xs text-[#667085]">Auto, shop, tailoring, trade</p>
                    </div>
                  </button>
                </div>

                {/* 5th Option: Not sure */}
                <button
                  onClick={() => handleIntentSelection('Not Sure')}
                  className="w-full touch-target p-3.5 rounded-xl bg-white border-2 border-dashed border-[#1E5AA8]/40 hover:border-[#1E5AA8] hover:bg-blue-50/50 text-left transition-all flex items-center justify-between shadow-2xs cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#1E5AA8] flex items-center justify-center shrink-0">
                      <HelpCircle size={18} />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-[#12304A]">❓ I'm not sure — Help me choose</span>
                      <span className="text-xs text-[#667085] block sm:inline sm:ml-2">Answer 5 simple questions</span>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-[#1E5AA8]" />
                </button>
              </div>

              {/* Secondary actions */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={() => setActiveTab('scheme-results')}
                  className="touch-target px-5 py-2.5 rounded-xl bg-[#12304A] hover:bg-[#153A5B] text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Explore All Schemes</span>
                  <ArrowRight size={14} />
                </button>
                <button
                  onClick={() => setActiveTab('calculator')}
                  className="touch-target px-4 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-[#17212B] border border-[#D9E1E8] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Loan Calculator</span>
                </button>
                <button
                  onClick={() => setActiveTab('partner-finder')}
                  className="touch-target px-4 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-[#17212B] border border-[#D9E1E8] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MapPin size={14} className="text-[#E67E22]" />
                  <span>Where to Apply</span>
                </button>
              </div>
            </div>

            {/* Right 5 cols: Human-Centered Citizen Journey Diagram (NO ROBOTS) */}
            <div className="lg:col-span-5 bg-[#F6F8FA] border border-[#D9E1E8] rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#D9E1E8] pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#12304A]">
                  How SchemeSetu Works
                </h3>
                <span className="text-[11px] font-semibold text-[#16834B] flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  <span>Simple 5-Step Path</span>
                </span>
              </div>

              {/* Vector diagram of citizen path */}
              <div className="space-y-2.5 pt-1">
                {[
                  { num: '1', title: 'You share your need', desc: 'Tell us your income, category & business idea', color: 'bg-[#12304A]' },
                  { num: '2', title: 'We check official rules', desc: 'Government gazette criteria evaluated transparently', color: 'bg-[#1E5AA8]' },
                  { num: '3', title: 'See schemes you qualify for', desc: 'Plain eligibility explanation with no hidden terms', color: 'bg-[#16834B]' },
                  { num: '4', title: 'Calculate repayment', desc: 'See your estimated monthly installment before applying', color: 'bg-[#E67E22]' },
                  { num: '5', title: 'Visit approved channel partner', desc: 'Apply safely at your nearest state agency or bank', color: 'bg-[#12304A]' },
                ].map((step, idx) => (
                  <div key={step.num} className="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-[#D9E1E8]">
                    <div className={`w-7 h-7 rounded-lg ${step.color} text-white flex items-center justify-center text-xs font-extrabold shrink-0 mt-0.5`}>
                      {step.num}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-[#12304A]">{step.title}</h4>
                      <p className="text-[11px] text-[#667085] leading-tight">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <p className="text-[11px] text-[#667085] text-center">
                  Protected by Government Security • Zero Agent Fees
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Trust Strip ─────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="bg-white border border-[#D9E1E8] rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="text-center space-y-1">
            <span className="text-[11px] font-bold text-[#1E5AA8] uppercase tracking-wider">National Digital Infrastructure</span>
            <h2 className="text-lg font-extrabold text-[#12304A]">
              Powered by Verified Government Scheme Information
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-[#F6F8FA] border border-[#D9E1E8] text-center space-y-1">
              <div className="w-8 h-8 mx-auto rounded-lg bg-blue-50 text-[#1E5AA8] flex items-center justify-center">
                <Building2 size={18} />
              </div>
              <h3 className="text-xs font-bold text-[#12304A]">Government Sources</h3>
              <p className="text-[11px] text-[#667085]">MoSJE, NSFDC & NBCFDC official gazette records</p>
            </div>

            <div className="p-4 rounded-xl bg-[#F6F8FA] border border-[#D9E1E8] text-center space-y-1">
              <div className="w-8 h-8 mx-auto rounded-lg bg-green-50 text-[#16834B] flex items-center justify-center">
                <ShieldCheck size={18} />
              </div>
              <h3 className="text-xs font-bold text-[#12304A]">Verified Rules</h3>
              <p className="text-[11px] text-[#667085]">Every requirement is transparent and explainable</p>
            </div>

            <div className="p-4 rounded-xl bg-[#F6F8FA] border border-[#D9E1E8] text-center space-y-1">
              <div className="w-8 h-8 mx-auto rounded-lg bg-amber-50 text-[#E67E22] flex items-center justify-center">
                <MapPin size={18} />
              </div>
              <h3 className="text-xs font-bold text-[#12304A]">Authorized Partners</h3>
              <p className="text-[11px] text-[#667085]">State Channelizing Agencies & nationalized banks</p>
            </div>

            <div className="p-4 rounded-xl bg-[#F6F8FA] border border-[#D9E1E8] text-center space-y-1">
              <div className="w-8 h-8 mx-auto rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                <FileText size={18} />
              </div>
              <h3 className="text-xs font-bold text-[#12304A]">Clear Calculations</h3>
              <p className="text-[11px] text-[#667085]">No hidden interest rates or false approval promises</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Decision-First Featured Schemes ──────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-extrabold text-[#12304A]">Featured Government Assistance</h2>
            <p className="text-xs text-[#667085]">Popular financial schemes for Scheduled Caste and backward class entrepreneurs</p>
          </div>
          <button
            onClick={() => setActiveTab('scheme-results')}
            className="text-xs font-bold text-[#1E5AA8] hover:underline flex items-center gap-1 self-start sm:self-center"
          >
            <span>View All Schemes ({schemes.length})</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {featuredSchemes.map((scheme) => (
            <div
              key={scheme.id}
              className="bg-white border border-[#D9E1E8] hover:border-[#1E5AA8] rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-2xs hover:shadow-md transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider">{scheme.ministry}</span>
                  <span className="px-2 py-0.5 rounded-md bg-green-50 text-[#16834B] text-[10px] font-bold border border-green-200">
                    Verified Scheme
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-[#12304A] leading-snug">{scheme.name}</h3>
                  <p className="text-xs text-[#667085] mt-1 line-clamp-2">{scheme.purpose}</p>
                </div>

                <div className="p-3 rounded-xl bg-[#F6F8FA] border border-[#D9E1E8] space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#667085]">Maximum Funding:</span>
                    <span className="font-extrabold text-[#12304A]">{scheme.maxLoanText}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#667085]">Interest Rate:</span>
                    <span className="font-bold text-[#16834B]">{scheme.interestRate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#667085]">Moratorium:</span>
                    <span className="font-medium text-[#12304A]">{scheme.moratorium}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
                <button
                  onClick={() => handleSelectScheme(scheme)}
                  className="flex-1 touch-target py-2.5 px-3 rounded-xl bg-[#12304A] hover:bg-[#153A5B] text-white text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <span>See How It Works</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Next Step Callout for First-Time Citizen ──────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 md:px-8">
        <NextStepCard
          title="Start Here"
          stepNumber="1"
          description="Answer a few simple everyday questions to see exactly which schemes you qualify for."
          actionText="Find Help Now"
          actionTab="ai-onboarding"
          variant="primary"
        />
      </section>

      {/* ── 5. Official Citizen Helpdesk & CSC Support ───────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="rounded-2xl p-6 bg-[#F6F8FA] border border-[#D9E1E8] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#12304A]">
              <PhoneCall size={20} className="text-[#16834B]" />
              <h3 className="text-base font-extrabold">Need In-Person Support?</h3>
            </div>
            <p className="text-xs text-[#667085] max-w-xl">
              You can also visit your nearest <strong>Common Service Centre (CSC)</strong> or State Channelizing Agency office. Officials there can verify your documents and help submit your application.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-white border border-[#D9E1E8] text-xs">
              <span className="text-[10px] text-[#667085] block">Toll-Free Citizen Helpline</span>
              <strong className="text-sm font-mono text-[#12304A]">1800-11-8008</strong>
            </div>
            <button
              onClick={() => setActiveTab('partner-finder')}
              className="touch-target px-4 py-2.5 rounded-xl bg-[#1E5AA8] hover:bg-[#153A5B] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <MapPin size={14} />
              <span>Locate Nearest Office</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
