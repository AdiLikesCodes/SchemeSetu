import { ArrowRight, CheckCircle, Clock, FileUp, MapPin, Calculator, HelpCircle } from 'lucide-react'
import useChatStore from '../store/chatStore'

export default function NextStepCard({
  title = 'Your Next Step',
  stepNumber,
  description,
  actionText = 'Continue',
  actionTab,
  onAction,
  variant = 'primary', // 'primary' | 'success' | 'warning'
  icon: Icon = ArrowRight,
}) {
  const { setActiveTab } = useChatStore()

  const handleClick = () => {
    if (onAction) {
      onAction()
    } else if (actionTab) {
      setActiveTab(actionTab)
    }
  }

  const bgBorderMap = {
    primary: 'bg-white border-[#1E5AA8] shadow-sm',
    success: 'bg-[#F0FDF4] border-[#16834B] shadow-sm',
    warning: 'bg-[#FFF7ED] border-[#E67E22] shadow-sm',
  }

  const badgeMap = {
    primary: 'bg-[#EFF6FF] text-[#1E5AA8] border-[#BFDBFE]',
    success: 'bg-[#DCFCE7] text-[#16834B] border-[#BBF7D0]',
    warning: 'bg-[#FFEDD5] text-[#C2410C] border-[#FED7AA]',
  }

  const btnMap = {
    primary: 'bg-[#12304A] hover:bg-[#153A5B] text-white',
    success: 'bg-[#16834B] hover:bg-[#15803D] text-white',
    warning: 'bg-[#E67E22] hover:bg-[#C2410C] text-white',
  }

  return (
    <div
      className={`rounded-2xl p-5 md:p-6 border-2 transition-all ${bgBorderMap[variant] || bgBorderMap.primary}`}
      role="region"
      aria-label="What should I do now"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider border ${badgeMap[variant] || badgeMap.primary}`}>
              {stepNumber ? `STEP ${stepNumber}: ` : ''}{title}
            </span>
            <span className="text-xs text-[#667085] hidden sm:inline">• What should you do now?</span>
          </div>

          <h3 className="text-base md:text-lg font-bold text-[#12304A] leading-snug">
            {description}
          </h3>
        </div>

        <button
          onClick={handleClick}
          className={`shrink-0 touch-target px-5 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.98] ${btnMap[variant] || btnMap.primary}`}
        >
          <span>{actionText}</span>
          <Icon size={16} />
        </button>
      </div>
    </div>
  )
}
