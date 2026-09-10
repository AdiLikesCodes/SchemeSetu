import { useState, useEffect, useRef } from 'react'
import {
  MessageSquare,
  X,
  Send,
  Loader2,
  Mic,
  Volume2,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  ExternalLink,
  Phone,
  CheckCircle2,
  HelpCircle,
  Building2,
  Calculator,
  User,
  Bot
} from 'lucide-react'
import useChatStore from '../store/chatStore'

const QUICK_SUGGESTIONS = [
  'What schemes are available for SC entrepreneurs?',
  'What is the income limit for NSFDC term loans?',
  'Can I get subsidy for a tailoring or retail shop?',
  'Where is the nearest State Channelizing Agency?',
]

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [inputText, setInputText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [speakingMsgId, setSpeakingMsgId] = useState(null)
  const [channelMode, setChannelMode] = useState('chat') // 'chat' | 'whatsapp'

  const {
    messages,
    sendMessage,
    isLoading,
    resetChat,
    language,
    setLanguage,
    setActiveTab,
    selectedScheme,
    userProfile
  } = useChatStore()

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Scroll to bottom whenever messages update or modal opens
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isLoading, isOpen])

  // Focus input on open
  useEffect(() => {
    if (isOpen && channelMode === 'chat') {
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [isOpen, channelMode])

  // Send message
  const handleSend = async (e) => {
    e?.preventDefault()
    const trimmed = inputText.trim()
    if (!trimmed || isLoading) return

    setInputText('')
    await sendMessage(trimmed)
  }

  // Voice recognition (Speech-to-Text)
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported by your browser. Please type your message.')
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN'
      recognition.interimResults = false

      recognition.onstart = () => setIsListening(true)
      recognition.onend = () => setIsListening(false)
      recognition.onerror = () => setIsListening(false)

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        if (transcript) {
          setInputText(transcript)
          sendMessage(transcript)
        }
      }

      recognition.start()
    } catch {
      setIsListening(false)
    }
  }

  // Text-to-Speech (Read Aloud)
  const handleSpeak = (msgId, text) => {
    if (!('speechSynthesis' in window)) return

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel()
      setSpeakingMsgId(null)
      return
    }

    window.speechSynthesis.cancel()
    const cleanText = text.replace(/[*_#`[\]()]/g, '')
    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN'
    utterance.onend = () => setSpeakingMsgId(null)
    utterance.onerror = () => setSpeakingMsgId(null)

    setSpeakingMsgId(msgId)
    window.speechSynthesis.speak(utterance)
  }

  const rawNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210'
  const displayPhone = import.meta.env.VITE_WHATSAPP_DISPLAY_NUMBER || '+91 98765 43210'
  const waLink = `https://wa.me/${rawNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
    selectedScheme
      ? `Namaste! I want to inquire about ${selectedScheme.name}`
      : 'Namaste! I would like to check my government scheme eligibility.'
  )}`

  return (
    <>
      {/* Floating Trigger Button */}
      <aside aria-label="SchemeSetu AI Assistant" className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-40">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="group relative flex items-center gap-2.5 bg-[#12304A] hover:bg-[#1E5AA8] text-white px-4 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border border-[#1E5AA8]/50"
          aria-label="Open SchemeSetu AI Assistant"
        >
          {/* Notification pulse dot */}
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500" />
          </span>

          <div className="w-6 h-6 rounded-full bg-blue-500/30 flex items-center justify-center text-blue-300">
            <Sparkles size={14} className="text-amber-300" />
          </div>

          <span className="font-extrabold text-xs tracking-wide">
            {isOpen ? 'Close Assistant' : 'Ask Scheme AI'}
          </span>
        </button>
      </aside>

      {/* Floating Chat Drawer / Popup Window */}
      {isOpen && (
        <div className="fixed bottom-24 lg:bottom-20 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[calc(100vh-120px)] bg-white rounded-3xl shadow-2xl border border-[#D9E1E8] flex flex-col z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* ── Chat Header ── */}
          <div className="bg-[#12304A] text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-700 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#1E5AA8] to-blue-500 flex items-center justify-center text-white shadow-xs">
                <Bot size={20} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-xs text-white">SchemeSetu Assistant</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[10px] text-blue-200">MoSJE Deterministic AI Core</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Reset session */}
              <button
                onClick={resetChat}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors"
                title="Reset conversation"
                aria-label="Reset conversation"
              >
                <RotateCcw size={15} />
              </button>

              {/* Close window */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors"
                aria-label="Close assistant"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* ── Channel Navigation Tabs ── */}
          <div className="flex border-b border-gray-100 bg-[#F6F8FA] px-3 pt-2 text-xs font-bold shrink-0">
            <button
              onClick={() => setChannelMode('chat')}
              className={`flex-1 py-2 px-3 text-center border-b-2 transition-all cursor-pointer ${
                channelMode === 'chat'
                  ? 'border-[#1E5AA8] text-[#1E5AA8] bg-white rounded-t-lg shadow-2xs font-black'
                  : 'border-transparent text-[#667085] hover:text-[#12304A]'
              }`}
            >
              Web AI Chat
            </button>
            <button
              onClick={() => setChannelMode('whatsapp')}
              className={`flex-1 py-2 px-3 text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                channelMode === 'whatsapp'
                  ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg shadow-2xs font-black'
                  : 'border-transparent text-[#667085] hover:text-emerald-700'
              }`}
            >
              <span>WhatsApp Mode</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </button>
          </div>

          {/* ── Main Tab Content ── */}
          {channelMode === 'chat' ? (
            <>
              {/* Message List */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs bg-[#F8FAFC]">
                {/* Intro Greeting if no messages */}
                {messages.length === 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="p-3.5 rounded-2xl bg-white border border-[#D9E1E8] shadow-2xs space-y-2">
                      <div className="flex items-center gap-2 text-[#1E5AA8] font-bold">
                        <Sparkles size={15} />
                        <span>Namaste! How can I assist you today?</span>
                      </div>
                      <p className="text-[#667085] text-[11px] leading-relaxed">
                        I can help you check eligibility for MoSJE concessional loans, calculate EMIs, or find your nearest authorized State Channelizing Agency.
                      </p>
                    </div>

                    {/* Quick suggestion pills */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wide">
                        Suggested Queries:
                      </span>
                      <div className="flex flex-col gap-1.5">
                        {QUICK_SUGGESTIONS.map((query, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setInputText(query)
                              sendMessage(query)
                            }}
                            className="text-left text-[11px] font-medium p-2.5 rounded-xl bg-white hover:bg-blue-50/70 border border-[#D9E1E8] hover:border-[#1E5AA8] text-[#12304A] transition-colors shadow-2xs cursor-pointer"
                          >
                            💬 {query}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Streamed Messages */}
                {messages.map((msg) => {
                  const isUser = msg.role === 'user'
                  const isAgent = msg.role === 'agent'
                  const isSystem = msg.role === 'system'

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[88%] p-3.5 rounded-2xl shadow-2xs space-y-1.5 ${
                          isUser
                            ? 'bg-[#12304A] text-white rounded-br-xs'
                            : isSystem
                            ? 'bg-red-50 text-red-800 border border-red-200'
                            : 'bg-white text-[#17212B] border border-[#D9E1E8] rounded-bl-xs'
                        }`}
                      >
                        {/* Header icon / role */}
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider ${
                              isUser ? 'text-blue-200' : 'text-[#1E5AA8]'
                            }`}
                          >
                            {isUser ? 'You' : 'SchemeSetu AI'}
                          </span>

                          {isAgent && (
                            <button
                              onClick={() => handleSpeak(msg.id, msg.content)}
                              className={`p-1 rounded-md text-gray-400 hover:text-[#1E5AA8] transition-colors ${
                                speakingMsgId === msg.id ? 'text-[#1E5AA8] animate-pulse' : ''
                              }`}
                              title="Listen to message"
                              aria-label="Listen"
                            >
                              <Volume2 size={13} />
                            </button>
                          )}
                        </div>

                        {/* Text Content */}
                        <div className="text-[12px] leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </div>

                        {/* Extracted Profile tags if available */}
                        {msg.data?.extracted_entities && Object.keys(msg.data.extracted_entities).length > 0 && (
                          <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-1">
                            {Object.entries(msg.data.extracted_entities).map(([k, v]) => (
                              <span
                                key={k}
                                className="px-1.5 py-0.5 rounded-md bg-blue-50 text-[#1E5AA8] border border-blue-200 text-[10px] font-bold"
                              >
                                {k}: {String(v)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-white border border-[#D9E1E8] text-[#667085] w-fit shadow-2xs">
                    <Loader2 size={14} className="animate-spin text-[#1E5AA8]" />
                    <span className="text-[11px] font-bold">Reasoning through scheme rules…</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* ── Input Box ── */}
              <form onSubmit={handleSend} className="p-3 bg-white border-t border-[#D9E1E8] space-y-2">
                <div className="flex items-center gap-1.5">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ask about schemes, loans, subsidies…"
                    disabled={isLoading}
                    className="flex-1 bg-[#F6F8FA] border border-[#D9E1E8] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#12304A] focus:outline-none focus:border-[#1E5AA8] placeholder-gray-400"
                  />

                  {/* Mic Button for Voice Input */}
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    disabled={isLoading}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center transition-colors cursor-pointer ${
                      isListening
                        ? 'bg-red-50 text-red-600 border-red-300 animate-pulse'
                        : 'bg-[#F6F8FA] hover:bg-gray-100 text-[#12304A] border-[#D9E1E8]'
                    }`}
                    title="Speak your question"
                  >
                    <Mic size={15} className={isListening ? 'text-red-500' : 'text-[#1E5AA8]'} />
                  </button>

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isLoading}
                    className="p-2.5 rounded-xl bg-[#12304A] hover:bg-[#1E5AA8] disabled:opacity-40 text-white text-xs font-bold flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                  >
                    <Send size={15} />
                  </button>
                </div>

                {/* Privacy Badge */}
                <div className="flex items-center justify-between text-[10px] text-[#667085] px-1">
                  <div className="flex items-center gap-1">
                    <ShieldCheck size={12} className="text-emerald-600" />
                    <span>DPDP Act 2023 Compliant (Zero PII stored)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false)
                      setActiveTab('ai-onboarding')
                    }}
                    className="text-[#1E5AA8] hover:underline font-bold"
                  >
                    Full Screen Mode →
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* ── WhatsApp Integration Tab ── */
            <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs bg-[#F8FAFC]">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-bold">
                  <span className="text-base">📱</span>
                  <span className="text-xs">Access via Official WhatsApp Assistant</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Citizens can seamlessly talk or text with SchemeSetu on WhatsApp in Hindi, English, and regional languages.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#12304A] uppercase tracking-wide">
                  Official MoSJE Channel Details:
                </span>
                <div className="p-3.5 rounded-xl bg-white border border-[#D9E1E8] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[#667085]">Dedicated Bot Number:</span>
                    <span className="font-mono font-bold text-[#12304A]">{displayPhone}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#667085]">Response Time:</span>
                    <span className="font-bold text-emerald-600">Instant (24x7)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#667085]">Voice Notes:</span>
                    <span className="font-bold text-[#12304A]">Supported</span>
                  </div>
                </div>
              </div>

              {/* Direct Link */}
              <div className="pt-2 space-y-2">
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <span>Open WhatsApp Web / App</span>
                  <ExternalLink size={14} />
                </a>
                <p className="text-[10px] text-center text-[#667085]">
                  Note: On dev environments without an active Meta Business SIM, use the built-in <strong>Web AI Chat</strong> tab above.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
