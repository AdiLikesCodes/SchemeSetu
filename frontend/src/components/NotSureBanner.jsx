import { HelpCircle, ArrowRight } from 'lucide-react'
import useChatStore from '../store/chatStore'

export default function NotSureBanner({
  message = "Not sure which scheme or assistance fits your situation?",
  subtext = "Our simple Eligibility Assistant asks a few everyday questions to guide you.",
  ctaText = "I'm Not Sure — Help Me",
}) {
  const { setActiveTab } = useChatStore()

  return (
    <div className="rounded-2xl p-4 md:p-5 bg-[#EFF6FF] border border-[#BFDBFE] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[#12304A]">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-white border border-[#93C5FD] text-[#1E5AA8] flex items-center justify-center shrink-0 mt-0.5">
          <HelpCircle size={18} />
        </div>
        <div>
          <h4 className="text-xs md:text-sm font-bold text-[#12304A]">{message}</h4>
          <p className="text-xs text-[#667085] mt-0.5">{subtext}</p>
        </div>
      </div>

      <button
        onClick={() => setActiveTab('ai-onboarding')}
        className="shrink-0 touch-target px-4 py-2.5 rounded-xl bg-white hover:bg-blue-50 text-[#1E5AA8] hover:text-[#12304A] border border-[#93C5FD] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
      >
        <span>{ctaText}</span>
        <ArrowRight size={14} />
      </button>
    </div>
  )
}
