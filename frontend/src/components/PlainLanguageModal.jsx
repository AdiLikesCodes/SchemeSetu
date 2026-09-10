import { useState } from 'react'
import { HelpCircle, X, Check, Volume2 } from 'lucide-react'

// Common plain-language definitions for government & banking terminology
export const PLAIN_TERMS = {
  'moratorium': {
    title: 'Moratorium Period',
    plain: 'Repayment grace period. You do not have to make monthly loan payments during this initial time so you can set up your business.',
    example: 'If your loan has a 6-month moratorium, your 1st monthly payment starts after month 6.',
  },
  'interest rate': {
    title: 'Interest Rate (% per year)',
    plain: 'The extra cost you pay on the borrowed loan amount each year.',
    example: 'For a ₹1,00,000 loan at 6% interest, the extra annual charge is approximately ₹6,000.',
  },
  'channel partner': {
    title: 'Authorized Channel Partner',
    plain: 'An officially approved government corporation or bank branch where you can submit your application and receive guidance.',
    example: 'State Channelizing Agencies (SCAs) like Kerala SC/ST Development Corp or nationalized banks (Canara Bank, SBI).',
  },
  'margin money': {
    title: 'Margin Money / Own Contribution',
    plain: 'The small share of the total project cost that you arrange yourself, while the government scheme covers the rest (up to 90-95%).',
    example: 'For a ₹1,00,000 tailoring setup, you might contribute ₹5,000 (5%), and the government loan funds ₹95,000.',
  },
  'subsidy': {
    title: 'Government Subsidy',
    plain: 'Financial support given by the government that you DO NOT have to repay.',
    example: 'A 10% subsidy means ₹10,000 out of ₹1,00,000 is paid directly by the government and forgiven.',
  },
  'sca': {
    title: 'State Channelizing Agency (SCA)',
    plain: 'The dedicated state government office responsible for helping SC/ST and OBC entrepreneurs get concessional loans.',
    example: 'Offices are present at district or state headquarters to guide and process applications without middlemen.',
  },
  'greenfield': {
    title: 'Greenfield Enterprise',
    plain: 'Starting a brand-new business project for the very first time in manufacturing, services, or trading.',
    example: 'Opening a new grocery shop or flour mill rather than expanding an existing family shop.',
  },
  'udyam': {
    title: 'UDYAM Registration',
    plain: 'A free government certificate recognizing your business as a registered Micro, Small, or Medium Enterprise (MSME).',
    example: 'Available free online with your Aadhaar number at udyamregistration.gov.in.',
  },
}

export default function PlainLanguageModal({ termKey, isOpen, onClose }) {
  if (!isOpen) return null

  const info = PLAIN_TERMS[termKey?.toLowerCase()] || {
    title: termKey || 'Government Term',
    plain: 'Official rule term defined by scheme guidelines.',
    example: 'Ask your local Common Service Centre (CSC) or channel partner officer for assistance.',
  }

  const speakExplanation = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(`${info.title}. ${info.plain}`)
      utterance.lang = 'en-IN'
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full border border-gray-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-[#F6F8FA]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1E5AA8] flex items-center justify-center">
              <HelpCircle size={18} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#1E5AA8] uppercase tracking-wider">Simple Explanation</span>
              <h3 className="text-base font-extrabold text-[#12304A]">{info.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Close explanation"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4 text-sm text-[#17212B]">
          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100/80">
            <p className="font-medium text-[#12304A] leading-relaxed">{info.plain}</p>
          </div>

          {info.example && (
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#667085] uppercase tracking-wide">Real-World Example:</span>
              <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                {info.example}
              </p>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between gap-3 border-t border-gray-100">
            <button
              onClick={speakExplanation}
              className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#12304A] text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Listen to explanation"
            >
              <Volume2 size={15} className="text-[#1E5AA8]" />
              <span>Listen Aloud</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-[#12304A] hover:bg-[#153A5B] text-white text-xs font-bold transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Inline helper button that can be placed next to any term
export function TermExplainer({ term, label }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1E5AA8] hover:text-[#12304A] underline underline-offset-2 ml-1 cursor-pointer"
        title="Click for simple explanation"
      >
        <span>{label || 'What does this mean?'}</span>
        <HelpCircle size={12} />
      </button>
      <PlainLanguageModal termKey={term} isOpen={open} onClose={() => setOpen(false)} />
    </>
  )
}
