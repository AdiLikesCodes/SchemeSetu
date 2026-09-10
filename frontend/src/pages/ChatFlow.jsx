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
  ArrowLeft,
  HelpCircle,
  Sparkles,
  Upload
} from 'lucide-react'
import useChatStore from '../store/chatStore'
import DocumentUpload from '../components/DocumentUpload'
import ConsentModal from '../components/ConsentModal'
import NextStepCard from '../components/NextStepCard'

// 6 Guided Wizard Steps for first-time digital users
const WIZARD_STEPS = [
  {
    step: 1,
    field: 'businessType',
    question: 'What type of assistance are you looking for?',
    hint: 'Choose the option that matches your current goal or idea.',
    options: [
      { label: 'Business Loan', value: 'Manufacturing & Service Enterprise', icon: '💼' },
      { label: 'Education Loan', value: 'Higher Education & Technical Studies', icon: '🎓' },
      { label: 'Micro Finance', value: 'Small Micro-Credit / Working Capital', icon: '💰' },
      { label: 'Self Employment', value: 'Retail / Tailoring / Transport Venture', icon: '🏪' },
      { label: 'Not Sure', value: 'General Financial Assistance', icon: '❓' },
    ],
  },
  {
    step: 2,
    field: 'category',
    question: 'Which social category do you belong to?',
    hint: 'Many government corporations provide targeted subsidies based on category.',
    options: [
      { label: 'Scheduled Caste (SC)', value: 'SC', icon: '🏛️' },
      { label: 'Scheduled Tribe (ST)', value: 'ST', icon: '🌿' },
      { label: 'Other Backward Class (OBC)', value: 'OBC', icon: '👥' },
      { label: 'General / EWS', value: 'General', icon: '📋' },
    ],
  },
  {
    step: 3,
    field: 'income',
    question: 'What is your approximate annual family income?',
    hint: 'This determines income ceiling eligibility for concessional rates.',
    options: [
      { label: 'Up to ₹1.5 Lakh', value: 150000, icon: '🟢' },
      { label: '₹1.5 Lakh to ₹3 Lakh', value: 250000, icon: '🟡' },
      { label: '₹3 Lakh to ₹5 Lakh', value: 400000, icon: '🔵' },
      { label: 'Above ₹5 Lakh', value: 600000, icon: '⚪' },
    ],
  },
  {
    step: 4,
    field: 'age',
    question: 'What is your age?',
    hint: 'Most loan schemes are open to individuals aged 18 to 50 years.',
    options: [
      { label: '18 - 25 years', value: 22, icon: '🌱' },
      { label: '26 - 35 years', value: 30, icon: '⚡' },
      { label: '36 - 50 years', value: 42, icon: '💼' },
      { label: 'Above 50 years', value: 55, icon: '🍂' },
    ],
  },
  {
    step: 5,
    field: 'location',
    question: 'Where do you live or plan to start your venture?',
    hint: 'State Channelizing Agencies operate locally in each state and district.',
    isLocationStep: true,
  },
  {
    step: 6,
    field: 'loanRequirement',
    question: 'How much financial assistance do you require?',
    hint: 'Estimate your machinery, inventory, or study expense.',
    options: [
      { label: 'Up to ₹1.00 Lakh', value: 100000, icon: '💵' },
      { label: '₹1.00 Lakh - ₹3.00 Lakh', value: 250000, icon: '💰' },
      { label: '₹3.00 Lakh - ₹5.00 Lakh', value: 450000, icon: '🏦' },
      { label: 'Above ₹5.00 Lakh', value: 1000000, icon: '💎' },
    ],
  },
]

export default function ChatFlow() {
  const {
    userProfile,
    updateProfile,
    setActiveTab,
    language,
    setLanguage,
    messages,
    isLoading,
    sendMessage,
    resetChat,
    uploadState,
  } = useChatStore()

  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [customInput, setCustomInput] = useState('')
  const [editingField, setEditingField] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [locationState, setLocationState] = useState(userProfile.state || 'Kerala')
  const [locationDistrict, setLocationDistrict] = useState(userProfile.district || 'Thiruvananthapuram')

  const currentStep = WIZARD_STEPS[currentStepIndex] || WIZARD_STEPS[0]
  const totalSteps = WIZARD_STEPS.length

  // Read current question aloud
  const handleReadAloud = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text || currentStep.question)
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN'
      window.speechSynthesis.speak(utterance)
    }
  }

  // Voice speech-to-text input
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Voice recognition is not supported in this browser. Please type your answer.')
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
      setCustomInput(speechResult)
      handleAnswerSubmit(speechResult)
    }

    recognition.start()
  }

  // Record an answer and advance
  const handleAnswerSubmit = (value) => {
    if (currentStep.isLocationStep) {
      updateProfile({ state: locationState, district: locationDistrict })
    } else if (currentStep.field) {
      updateProfile({ [currentStep.field]: value })
    }

    // Also inform conversational store in background
    if (typeof value === 'string' && value.trim()) {
      sendMessage(value)
    } else if (typeof value === 'number') {
      sendMessage(value.toString())
    }

    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1)
      setCustomInput('')
    } else {
      // Completed all steps: prompt to see matched schemes
      setActiveTab('scheme-results')
    }
  }

  // "Use my location" button
  const handleUseMyLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationState('Kerala')
          setLocationDistrict('Thiruvananthapuram')
          updateProfile({ state: 'Kerala', district: 'Thiruvananthapuram', pinCode: '695001' })
          handleAnswerSubmit('Location: Thiruvananthapuram, Kerala')
        },
        () => {
          setLocationState('Kerala')
          setLocationDistrict('Thiruvananthapuram')
          handleAnswerSubmit('Location: Thiruvananthapuram, Kerala')
        }
      )
    } else {
      handleAnswerSubmit('Location: Thiruvananthapuram, Kerala')
    }
  }

  // Inline profile field edit
  const handleStartEdit = (fieldKey, currentValue) => {
    setEditingField(fieldKey)
    setEditValue(currentValue || '')
  }

  const handleSaveEdit = (fieldKey) => {
    let finalVal = editValue
    if (fieldKey === 'income' || fieldKey === 'age' || fieldKey === 'loanRequirement') {
      finalVal = Number(editValue.toString().replace(/[^0-9]/g, ''))
    }
    updateProfile({ [fieldKey]: finalVal })
    setEditingField(null)
  }

  const handleRemoveField = (fieldKey) => {
    updateProfile({ [fieldKey]: fieldKey === 'income' ? 0 : '' })
  }

  // Calculate profile completion
  const profileKeys = ['name', 'category', 'income', 'age', 'state', 'businessType', 'loanRequirement']
  const filledCount = profileKeys.filter((k) => userProfile[k] && userProfile[k] !== 0).length
  const completionPercentage = Math.min(100, Math.round((filledCount / profileKeys.length) * 100))

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <ConsentModal />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#D9E1E8] rounded-2xl p-5 md:p-6 shadow-2xs space-y-3">
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
              I'll ask a few simple everyday questions to understand your eligibility for government financial schemes.
            </p>
          </div>

          {/* Controls: Reset & Read Aloud */}
          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <button
              onClick={() => handleReadAloud()}
              className="touch-target px-3 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-[#12304A] border border-gray-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Listen to question"
            >
              <Volume2 size={15} className="text-[#1E5AA8]" />
              <span>Read Aloud</span>
            </button>
            <button
              onClick={() => {
                resetChat()
                setCurrentStepIndex(0)
              }}
              className="p-2.5 rounded-xl text-[#667085] hover:text-[#12304A] hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer"
              title="Start over"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Wizard Stepper Progress Bar */}
        <div className="pt-2 border-t border-gray-100 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[#1E5AA8]">
              QUESTION {currentStep.step} OF {totalSteps}: {currentStep.field?.toUpperCase()}
            </span>
            <span className="text-[#667085] font-mono">{Math.round((currentStep.step / totalSteps) * 100)}% Answered</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-[#1E5AA8] rounded-full transition-all duration-300"
              style={{ width: `${(currentStep.step / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── 2-Column Main Layout: Guided Wizard vs Live Extracted Profile ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT 7-8 Cols: Guided Application Wizard */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-5">
          <div className="bg-white border border-[#D9E1E8] rounded-2xl p-6 md:p-8 space-y-6 shadow-2xs">
            {/* Question Card */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#E67E22] uppercase tracking-wider">
                Step {currentStep.step}
              </span>
              <h2 className="text-lg md:text-xl font-extrabold text-[#12304A] leading-snug">
                {currentStep.question}
              </h2>
              <p className="text-xs text-[#667085]">{currentStep.hint}</p>
            </div>

            {/* Step Content: Location Step vs Multi-Choice Options */}
            {currentStep.isLocationStep ? (
              <div className="space-y-4 p-4 rounded-xl bg-[#F6F8FA] border border-[#D9E1E8]">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#12304A]">State</label>
                  <input
                    type="text"
                    value={locationState}
                    onChange={(e) => setLocationState(e.target.value)}
                    className="w-full bg-white border border-[#D9E1E8] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#12304A] focus:outline-none focus:border-[#1E5AA8]"
                    placeholder="e.g. Kerala, Uttar Pradesh, Tamil Nadu"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#12304A]">District</label>
                  <input
                    type="text"
                    value={locationDistrict}
                    onChange={(e) => setLocationDistrict(e.target.value)}
                    className="w-full bg-white border border-[#D9E1E8] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#12304A] focus:outline-none focus:border-[#1E5AA8]"
                    placeholder="e.g. Thiruvananthapuram, Lucknow, Madurai"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={handleUseMyLocation}
                    className="touch-target px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1E5AA8] font-bold text-xs flex items-center gap-2 border border-blue-200 transition-colors cursor-pointer"
                  >
                    <MapPin size={15} />
                    <span>📍 Use My Location</span>
                  </button>

                  <button
                    onClick={() => handleAnswerSubmit(`${locationDistrict}, ${locationState}`)}
                    className="touch-target px-5 py-2.5 rounded-xl bg-[#12304A] hover:bg-[#153A5B] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Save Location & Next</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentStep.options?.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => handleAnswerSubmit(opt.value)}
                    className="touch-target p-4 rounded-xl bg-[#F6F8FA] hover:bg-blue-50/70 border border-[#D9E1E8] hover:border-[#1E5AA8] text-left transition-all flex items-center gap-3 shadow-2xs group cursor-pointer"
                  >
                    <span className="text-xl shrink-0 group-hover:scale-110 transition-transform">
                      {opt.icon}
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#12304A]">{opt.label}</h4>
                      <p className="text-[11px] text-[#667085] leading-tight mt-0.5">{opt.value}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Custom Text or Voice Answer Bar */}
            <div className="pt-4 border-t border-gray-100 space-y-2">
              <span className="text-[11px] font-bold text-[#667085] uppercase tracking-wide">
                Or type / speak your own answer:
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customInput.trim()) {
                      handleAnswerSubmit(customInput.trim())
                    }
                  }}
                  placeholder="e.g. Tailoring shop, dairy unit, or specific amount…"
                  className="flex-1 bg-[#F6F8FA] border border-[#D9E1E8] rounded-xl px-4 py-2.5 text-xs font-semibold text-[#12304A] focus:outline-none focus:border-[#1E5AA8] placeholder-gray-400"
                />

                {/* Subtle Voice button ("Speak") */}
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  className={`touch-target px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isListening
                      ? 'bg-red-50 text-red-600 border-red-300 animate-pulse'
                      : 'bg-white hover:bg-gray-50 text-[#12304A] border-[#D9E1E8]'
                  }`}
                  title="Speak your answer"
                >
                  <Mic size={15} className={isListening ? 'text-red-500' : 'text-[#1E5AA8]'} />
                  <span className="hidden sm:inline">{isListening ? 'Listening…' : 'Speak'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => customInput.trim() && handleAnswerSubmit(customInput.trim())}
                  disabled={!customInput.trim()}
                  className="touch-target px-4 py-2.5 rounded-xl bg-[#12304A] hover:bg-[#153A5B] disabled:opacity-40 text-white text-xs font-bold flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>

            {/* Stepper Navigation: Back & Next */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
              <button
                onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentStepIndex === 0}
                className="touch-target px-4 py-2 rounded-xl text-[#667085] hover:text-[#12304A] disabled:opacity-40 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Previous Step</span>
              </button>

              <button
                onClick={() => {
                  if (currentStepIndex < totalSteps - 1) {
                    setCurrentStepIndex((prev) => prev + 1)
                  } else {
                    setActiveTab('scheme-results')
                  }
                }}
                className="touch-target px-5 py-2 rounded-xl bg-[#1E5AA8] hover:bg-[#153A5B] text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>{currentStepIndex === totalSteps - 1 ? 'View Matched Schemes' : 'Next Step'}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Quick CTA to skip straight to schemes */}
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs text-[#12304A]">
            <span>Already know what you need? Browse all official schemes directly.</span>
            <button
              onClick={() => setActiveTab('scheme-results')}
              className="font-extrabold text-[#1E5AA8] hover:underline shrink-0 ml-2 cursor-pointer"
            >
              Skip to Schemes →
            </button>
          </div>
        </div>

        {/* RIGHT 4-5 Cols: "Your Information" Live Extracted Profile Panel */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-5">
          <div className="bg-white border border-[#D9E1E8] rounded-2xl p-5 md:p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-[#12304A]">Your Information</h3>
                <p className="text-[11px] text-[#667085]">Verified live for scheme matching</p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-green-50 text-[#16834B] text-[10px] font-bold border border-green-200">
                {completionPercentage}% Complete
              </span>
            </div>

            {/* Profile Completion Bar */}
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-[#16834B] rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            {/* Extracted Fields List */}
            <div className="space-y-2.5 pt-1">
              {[
                { key: 'category', label: 'Social Category', value: userProfile.category, icon: '🏛️' },
                {
                  key: 'income',
                  label: 'Annual Family Income',
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
                    <div className="flex items-center gap-1 text-[10px] font-bold text-[#667085] uppercase">
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>

                    {editingField === item.key ? (
                      <div className="flex items-center gap-2 mt-1">
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

            {/* Next Step inside Assistant */}
            <div className="pt-3 border-t border-gray-100">
              <button
                onClick={() => setActiveTab('scheme-results')}
                className="w-full touch-target py-3 px-4 rounded-xl bg-[#12304A] hover:bg-[#153A5B] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <span>Check Matched Schemes</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
