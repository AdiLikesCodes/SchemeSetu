import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Mic, Loader2, Building2, CheckCircle2, Circle, ArrowRight, ShieldCheck } from 'lucide-react'
import ChatBubble from '../components/ChatBubble'
import DocumentUpload from '../components/DocumentUpload'
import useChatStore from '../store/chatStore'

const STARTER_HINTS = [
  'I want to start a tailoring business in Thiruvananthapuram',
  'I am 28 years old, SC category, annual income ₹3 lakh',
  'I need a term loan of ₹5 lakh for manufacturing',
]

const PROGRESS_STEPS = [
  { label: 'Category', status: 'completed' },
  { label: 'Income', status: 'completed' },
  { label: 'Business Type', status: 'completed' },
  { label: 'Location', status: 'current' },
  { label: 'Age', status: 'upcoming' },
  { label: 'Documents', status: 'upcoming' },
]

export default function ChatFlow() {
  const [input, setInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const { messages, isLoading, sendMessage, userProfile, setActiveTab } = useChatStore()
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  // Auto-scroll to the latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSubmit = useCallback(
    (e) => {
      e?.preventDefault()
      const text = input.trim()
      if (!text || isLoading) return
      setInput('')
      sendMessage(text)
    },
    [input, isLoading, sendMessage]
  )

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleHint = (hint) => {
    if (isLoading) return
    sendMessage(hint)
  }

  const handleMicClick = () => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      setTimeout(() => {
        setInput('I need a ₹5 lakh loan for setting up a micro-enterprise')
        setIsRecording(false)
      }, 2500)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50">

      {/* ── Conversational Header ────────────────────────────────────────────── */}
      <header className="shrink-0 border-b border-slate-200 bg-white px-4 py-3 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-amber-300 font-bold text-sm">
            🏛️
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900">SchemeSetu Assistant</h1>
            <p className="text-[11px] text-slate-500">Government Scheme Eligibility Assistance</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>Service Available</span>
          </div>

          <button
            onClick={() => setActiveTab('scheme-results')}
            className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors hidden sm:block"
          >
            Check Matched Schemes →
          </button>
        </div>
      </header>

      {/* ── Conversational Profile Progress Indicator ─────────────────────── */}
      <div className="shrink-0 bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto text-xs">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">Profile Progress:</span>
        
        <div className="flex items-center gap-3 min-w-0">
          {PROGRESS_STEPS.map((step) => (
            <div key={step.label} className="flex items-center gap-1 shrink-0">
              {step.status === 'completed' ? (
                <CheckCircle2 size={13} className="text-emerald-700" />
              ) : step.status === 'current' ? (
                <span className="w-2 h-2 rounded-full bg-indigo-700 animate-ping" />
              ) : (
                <Circle size={12} className="text-slate-400" />
              )}
              <span className={`text-[11px] font-semibold ${
                step.status === 'completed' ? 'text-slate-800' : step.status === 'current' ? 'text-indigo-900 font-extrabold' : 'text-slate-500'
              }`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Message Area ────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-3 max-w-4xl mx-auto w-full">

        {/* Empty state */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-5 text-center py-8">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-amber-300 text-2xl shadow-xs">
              🏛️
            </div>
            <div className="max-w-md">
              <h2 className="text-lg font-extrabold text-slate-900 mb-1">
                Welcome to SchemeSetu
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                I can help you identify government schemes based on your profile. Let's start with your business idea or financial requirements.
              </p>
            </div>

            {/* Hint Chips */}
            <div className="flex flex-col gap-2 w-full max-w-md">
              {STARTER_HINTS.map((hint) => (
                <button
                  key={hint}
                  onClick={() => handleHint(hint)}
                  className="text-left text-xs text-slate-700 bg-white border border-slate-200 hover:border-slate-400 hover:bg-slate-50 rounded-xl px-4 py-2.5 transition-all shadow-xs"
                >
                  "{hint}"
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Bubbles */}
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex justify-start my-2">
            <div className="shrink-0 w-7 h-7 rounded-md bg-slate-900 flex items-center justify-center text-amber-300 text-[11px] font-bold mr-2 mt-1">
              🏛️
            </div>
            <div className="bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-bounce" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      {/* ── Input Bar ───────────────────────────────────────────────────────── */}
      <footer className="shrink-0 border-t border-slate-200 bg-white px-4 py-3">
        <div className="max-w-4xl mx-auto space-y-2">
          
          {/* Privacy Disclaimer Banner */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span className="flex items-center gap-1">
              <ShieldCheck size={13} className="text-emerald-700" />
              <span>Your information is used strictly to evaluate scheme eligibility.</span>
            </span>
            <span className="font-semibold text-slate-700 hidden sm:inline">Press Enter to send</span>
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            {/* Voice Input Button */}
            <button
              type="button"
              onClick={handleMicClick}
              className={`p-2.5 rounded-xl border transition-colors ${
                isRecording 
                  ? 'bg-rose-600 text-white border-rose-600 animate-pulse' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
              title="Voice Input (Malayalam/English)"
            >
              <Mic size={18} />
            </button>

            <DocumentUpload />

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Type your response or background..."
              className="flex-1 rounded-xl bg-slate-50 border border-slate-200 text-xs md:text-sm text-slate-900 placeholder-slate-400 px-4 py-2.5 focus:outline-none focus:border-slate-400 transition-colors disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="shrink-0 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center transition-colors shadow-xs"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </form>

        </div>
      </footer>

    </div>
  )
}
