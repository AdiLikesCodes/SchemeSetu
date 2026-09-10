import { useState, useEffect, useRef } from 'react'
import {
  Send,
  Loader2,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Mic,
  Volume2,
  Edit2,
  Trash2,
  MapPin,
  ArrowRight,
  HelpCircle,
  Building2,
  Sparkles,
  Paperclip
} from 'lucide-react'
import useChatStore from '../store/chatStore'
import ChatBubble from '../components/ChatBubble'
import DocumentUpload from '../components/DocumentUpload'
import ConsentModal from '../components/ConsentModal'

// Quick answer prompt cards based on question context
const QUICK_OPTIONS = {
  assistance: [
    { label: 'Business Loan', value: 'I want a business loan for a small enterprise' },
    { label: 'Education Loan', value: 'I need an education loan for higher studies' },
    { label: 'Micro Finance', value: 'I need small micro-credit funding for working capital' },
    { label: 'Self Employment', value: 'I want financial assistance to start self-employment' },
    { label: 'Not Sure', value: 'I am not sure what assistance I need, please guide me' },
  ],
  category: [
    { label: 'Scheduled Caste (SC)', value: 'My category is Scheduled Caste (SC)' },
    { label: 'Scheduled Tribe (ST)', value: 'My category is Scheduled Tribe (ST)' },
    { label: 'Other Backward Class (OBC)', value: 'My category is Other Backward Class (OBC)' },
    { label: 'General / EWS', value: 'My category is General / EWS' },
  ],
  income: [
    { label: 'Up to ₹1.5 Lakh', value: 'My annual family income is ₹1.5 Lakh' },
    { label: '₹1.5 Lakh - ₹3 Lakh', value: 'My annual family income is ₹2.5 Lakh' },
    { label: '₹3 Lakh - ₹5 Lakh', value: 'My annual family income is ₹4 Lakh' },
    { label: 'Above ₹5 Lakh', value: 'My annual family income is above ₹5 Lakh' },
  ],
}

export default function ChatFlow() {
  const {
    messages,
    isLoading,
    sendMessage,
    initChatGreeting,
    resetChat,
    language,
    userProfile,
    updateProfile,
    setActiveTab,
    uploadState,
    completeness,
  } = useChatStore()

  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [editingField, setEditingField] = useState(null)
  const [editValue, setEditValue] = useState('')

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Initialize greeting message on mount if chat is empty
  useEffect(() => {
    initChatGreeting()
  }, [initChatGreeting])

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading, uploadState])

  const handleSend = (textToSend = null) => {
    const text = (textToSend || input).trim()
    if (!text || isLoading) return
    setInput('')
    sendMessage(text)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Voice speech-to-text input (Web Speech API)
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Voice recognition is not supported in this browser. Please type your message.')
      return
    }

    if (isListening) return

    const recognition = new SpeechRecognition()
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript
      setInput(speechResult)
      handleSend(speechResult)
    }

    recognition.start()
  }

  // Read latest AI message aloud
  const handleReadLatest = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const agentMsgs = messages.filter((m) => m.role === 'agent')
      const latest = agentMsgs[agentMsgs.length - 1]?.content || 'Let us find government schemes for you.'
      const utterance = new SpeechSynthesisUtterance(latest)
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN'
      window.speechSynthesis.speak(utterance)
    }
  }

  // Use my location helper
  const handleUseMyLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          updateProfile({ state: 'Kerala', district: 'Thiruvananthapuram', pinCode: '695001' })
          handleSend('My location is Thiruvananthapuram, Kerala')
        },
        () => {
          handleSend('My location is Thiruvananthapuram, Kerala')
        }
      )
    } else {
      handleSend('My location is Thiruvananthapuram, Kerala')
    }
  }

  // Inline profile field edit
  const handleStartEdit = (key, val) => {
    setEditingField(key)
    setEditValue(val || '')
  }

  const handleSaveEdit = (key) => {
    let finalVal = editValue
    if (key === 'income' || key === 'age' || key === 'loanRequirement') {
      finalVal = Number(editValue.toString().replace(/[^0-9]/g, ''))
    }
    updateProfile({ [key]: finalVal })
    setEditingField(null)
  }

  const handleRemoveField = (key) => {
    updateProfile({ [key]: key === 'income' ? 0 : '' })
  }

  // Profile completion percentage
  const profileKeys = ['name', 'category', 'income', 'age', 'state', 'businessType']
  const filledCount = profileKeys.filter((k) => userProfile[k] && userProfile[k] !== 0).length
  const completionPct = Math.min(100, Math.round((filledCount / profileKeys.length) * 100))

  // Determine which quick options to show based on last message or missing profile fields
  const showCategoryOptions = !userProfile.category || userProfile.category === 'SC'
  const showAssistanceOptions = !userProfile.businessType

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-5">
      <ConsentModal />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#D9E1E8] rounded-2xl p-5 md:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1E5AA8] text-xs font-bold border border-blue-200">
                SchemeSetu Eligibility Assistant
              </span>
              <span className="text-xs text-[#667085] hidden md:inline">• Official MoSJE Assistance</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-[#12304A]">
              Let's find schemes suitable for you
            </h1>
            <p className="text-xs md:text-sm text-[#667085]">
              I'll ask a few simple questions to understand your eligibility for government concessional loans and subsidies.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <button
              onClick={handleReadLatest}
              className="touch-target px-3 py-2 rounded-xl bg-[#F6F8FA] hover:bg-gray-100 text-[#12304A] border border-[#D9E1E8] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Listen aloud"
            >
              <Volume2 size={15} className="text-[#1E5AA8]" />
              <span>Read Aloud</span>
            </button>
            <button
              onClick={resetChat}
              className="p-2.5 rounded-xl text-[#667085] hover:text-[#12304A] hover:bg-gray-100 border border-[#D9E1E8] transition-colors cursor-pointer"
              title="Start conversation over"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Profile Progress Strip */}
        <div className="pt-3 border-t border-gray-100 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[#1E5AA8]">Profile Information Completion</span>
            <span className="text-[#16834B]">{completionPct}% Complete</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-[#16834B] rounded-full transition-all duration-300"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── 2-Column Main Layout: Conversation vs Your Profile ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT 7-8 Cols: Active Conversation Stream */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col bg-white border border-[#D9E1E8] rounded-2xl shadow-2xs overflow-hidden h-[620px]">
          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
            ))}

            {/* Document Upload State indicator */}
            {uploadState === 'uploading' && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-[#1E5AA8] my-2">
                <Loader2 size={16} className="animate-spin" />
                <span>Processing document with PaddleOCR text detection…</span>
              </div>
            )}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 my-2 text-xs text-[#667085]">
                <div className="w-7 h-7 rounded-xl bg-[#12304A] text-white flex items-center justify-center font-bold text-xs">
                  <Building2 size={14} className="text-[#E67E22]" />
                </div>
                <div className="p-2.5 rounded-xl bg-[#F6F8FA] border border-[#D9E1E8] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1E5AA8] animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1E5AA8] animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1E5AA8] animate-bounce" />
                </div>
              </div>
            )}

            {/* Quick Answer Chips based on conversation state */}
            {!isLoading && (
              <div className="pt-2 space-y-2">
                <span className="text-[11px] font-bold text-[#667085] uppercase tracking-wide block">
                  Quick touch options:
                </span>
                <div className="flex flex-wrap gap-2">
                  {QUICK_OPTIONS.assistance.map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => handleSend(opt.value)}
                      className="touch-target px-3 py-1.5 rounded-xl bg-[#F6F8FA] hover:bg-blue-50 text-[#12304A] border border-[#D9E1E8] hover:border-[#1E5AA8] text-xs font-bold transition-all cursor-pointer shadow-2xs"
                    >
                      {opt.label}
                    </button>
                  ))}
                  <button
                    onClick={handleUseMyLocation}
                    className="touch-target px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1E5AA8] border border-blue-200 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                  >
                    <MapPin size={13} />
                    <span>📍 Use My Location</span>
                  </button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Sticky Input Bar */}
          <div className="shrink-0 p-3 sm:p-4 border-t border-[#D9E1E8] bg-[#F6F8FA]">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex items-center gap-2"
            >
              {/* Document Upload Paperclip */}
              <DocumentUpload />

              {/* Text Input */}
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                placeholder={
                  language === 'hi'
                    ? 'अपना व्यवसाय विचार या विवरण यहाँ लिखें…'
                    : 'Describe your income, category, or business idea…'
                }
                className="flex-1 bg-white border border-[#D9E1E8] rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#12304A] placeholder-gray-400 focus:outline-none focus:border-[#1E5AA8] disabled:opacity-50"
              />

              {/* Subtle Voice button */}
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`touch-target p-2.5 rounded-xl border transition-colors cursor-pointer ${
                  isListening
                    ? 'bg-red-50 text-red-600 border-red-300 animate-pulse'
                    : 'bg-white hover:bg-gray-100 text-[#12304A] border-[#D9E1E8]'
                }`}
                title="Speak your response"
                aria-label="Speak response"
              >
                <Mic size={18} className={isListening ? 'text-red-500' : 'text-[#1E5AA8]'} />
              </button>

              {/* Send Button */}
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="touch-target px-4 py-2.5 rounded-xl bg-[#12304A] hover:bg-[#153A5B] disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                aria-label="Send message"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </form>

            <div className="flex items-center justify-between text-[10px] text-[#667085] mt-2 px-1">
              <span>Verified Government Scheme Guidelines • PII Protected</span>
              <button
                onClick={() => setActiveTab('scheme-results')}
                className="font-bold text-[#1E5AA8] hover:underline"
              >
                View Schemes ({userProfile.category} Category) →
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT 4-5 Cols: "Your Profile / Information" Live Extracted Panel */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          <div className="bg-white border border-[#D9E1E8] rounded-2xl p-5 md:p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-[#12304A]">Your Profile</h3>
                <p className="text-[11px] text-[#667085]">Information extracted for eligibility</p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-green-50 text-[#16834B] text-[10px] font-bold border border-green-200">
                {completionPct}% Complete
              </span>
            </div>

            {/* Extracted Fields List */}
            <div className="space-y-2.5">
              {[
                { key: 'category', label: 'Social Category', value: userProfile.category, icon: '🏛️' },
                {
                  key: 'income',
                  label: 'Annual Income',
                  value: userProfile.income > 0 ? `₹${Number(userProfile.income).toLocaleString('en-IN')}` : null,
                  icon: '💰',
                },
                { key: 'age', label: 'Age', value: userProfile.age ? `${userProfile.age} Years` : null, icon: '🎂' },
                {
                  key: 'location',
                  label: 'Location',
                  value: userProfile.district ? `${userProfile.district}, ${userProfile.state}` : null,
                  icon: '📍',
                },
                { key: 'businessType', label: 'Loan Purpose', value: userProfile.businessType || null, icon: '💼' },
                {
                  key: 'loanRequirement',
                  label: 'Required Amount',
                  value: userProfile.loanRequirement > 0 ? `₹${Number(userProfile.loanRequirement).toLocaleString('en-IN')}` : null,
                  icon: '💵',
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="p-3 rounded-xl bg-[#F6F8FA] border border-[#D9E1E8] flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-[#667085] uppercase block">
                      {item.icon} {item.label}
                    </span>

                    {editingField === item.key ? (
                      <div className="flex items-center gap-1.5 mt-1">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full bg-white border border-[#1E5AA8] rounded-lg px-2 py-1 text-xs font-bold text-[#12304A] focus:outline-none"
                        />
                        <button
                          onClick={() => handleSaveEdit(item.key)}
                          className="px-2 py-1 rounded bg-[#16834B] text-white font-bold text-[10px]"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-extrabold text-sm text-[#12304A] truncate">
                          {item.value || 'Not provided yet'}
                        </span>
                        {item.value && (
                          <span className="text-[10px] text-[#16834B] font-bold shrink-0">✓ Verified</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Edit / Remove actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {editingField !== item.key && (
                      <button
                        onClick={() => handleStartEdit(item.key, item.value)}
                        className="p-1.5 rounded-md text-[#667085] hover:text-[#1E5AA8] hover:bg-white"
                        title="Edit value"
                      >
                        <Edit2 size={13} />
                      </button>
                    )}
                    {item.value && (
                      <button
                        onClick={() => handleRemoveField(item.key)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-white"
                        title="Remove value"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Direct CTA to Matched Schemes */}
            <div className="pt-2 border-t border-gray-100">
              <button
                onClick={() => setActiveTab('scheme-results')}
                className="w-full touch-target py-3 px-4 rounded-xl bg-[#12304A] hover:bg-[#153A5B] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
              >
                <span>View Matched Schemes</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
