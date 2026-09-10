import { useState } from 'react'
import { MessageCircle, X, ExternalLink, QrCode, Phone, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react'
import useChatStore from '../store/chatStore'

export default function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false)
  const { selectedScheme, userProfile, language } = useChatStore()

  const rawNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210'
  const displayPhone = import.meta.env.VITE_WHATSAPP_DISPLAY_NUMBER || '+91 98765 43210'

  // Construct message based on current user context
  let defaultMessage = 'Namaste SchemeSetu! I would like to discover government schemes and check my loan eligibility.'
  if (selectedScheme) {
    defaultMessage = `Namaste! I am interested in applying for '${selectedScheme.name}' (Category: ${userProfile?.category || 'General'}, Location: ${userProfile?.district || 'India'}). Can you help me check my eligibility?`
  }

  const encodedMessage = encodeURIComponent(defaultMessage)
  const waLink = `https://wa.me/${rawNumber.replace(/\D/g, '')}?text=${encodedMessage}`

  return (
    <>
      {/* Floating Action Button */}
      <aside aria-label="Official WhatsApp Assistant" className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border border-emerald-400"
          aria-label="Connect via WhatsApp"
        >
          {/* Animated Notification Pulse */}
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-700" />
          </span>

          {/* Official WhatsApp SVG Logo */}
          <svg
            className="w-5 h-5 fill-current shrink-0"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>

          <span className="font-extrabold text-xs hidden sm:inline tracking-wide">
            Chat on WhatsApp
          </span>
        </button>
      </aside>

      {/* WhatsApp Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-gray-200 relative animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-black text-[#12304A]">SchemeSetu on WhatsApp</h3>
                  <p className="text-[11px] font-semibold text-[#16834B]">Official MoSJE 24x7 Assistant</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Benefits Banner */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                <Sparkles size={14} className="text-emerald-600" />
                <span>Zero Installation • Complete Access</span>
              </div>
              <ul className="space-y-1 text-[11px] text-emerald-800">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                  <span>Ask questions via text or voice notes in your language</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                  <span>Get deterministic scheme eligibility & loan summaries</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                  <span>Receive direct links to nearest State Channelizing Agencies</span>
                </li>
              </ul>
            </div>

            {/* Number & Action */}
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-[#F6F8FA] border border-[#D9E1E8] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-[#12304A]">
                  <Phone size={14} className="text-[#1E5AA8]" />
                  <span className="font-bold">Official Bot Number:</span>
                </div>
                <span className="font-mono font-bold text-[#12304A]">{displayPhone}</span>
              </div>

              {/* Direct Open Button */}
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all duration-150 cursor-pointer"
              >
                <span>Open in WhatsApp</span>
                <ExternalLink size={15} />
              </a>
            </div>

            {/* Privacy note */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#667085]">
              <ShieldCheck size={13} className="text-emerald-600" />
              <span>DPDP Act 2023 Compliant • Zero PII Shared</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
