import { useState, useRef } from 'react'
import {
  FileCheck,
  Upload,
  CheckCircle2,
  Loader2,
  Edit3,
  ShieldCheck,
  Eye,
  Sparkles,
  AlertCircle,
  FileText,
  Clock,
  ArrowRight
} from 'lucide-react'
import useChatStore from '../store/chatStore'
import NextStepCard from '../components/NextStepCard'

export default function Documents() {
  const { documents, ocrState, simulatePaddleOCRUpload, confirmOcrData, resetOcrState, setActiveTab } = useChatStore()
  const fileInputRef = useRef(null)

  // Editable fields during OCR review & confirmation
  const [editFields, setEditFields] = useState({})

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    simulatePaddleOCRUpload(file)
  }

  const handleFieldChange = (key, value) => {
    setEditFields((prev) => ({ ...prev, [key]: value }))
  }

  const handleFinalSubmit = () => {
    confirmOcrData(Object.keys(editFields).length ? editFields : ocrState.extractedData)
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#D9E1E8] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div className="space-y-1">
          <span className="text-xs font-bold text-[#1E5AA8] uppercase tracking-wider">Citizen Documents Hub</span>
          <h1 className="text-xl md:text-2xl font-black text-[#12304A]">My Documents & Verification</h1>
          <p className="text-xs md:text-sm text-[#667085]">
            Keep your certificates organized for government scheme verification. You can review and edit all detected fields.
          </p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="shrink-0 touch-target px-5 py-3 rounded-xl bg-[#12304A] hover:bg-[#153A5B] text-white font-bold text-xs flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
        >
          <Upload size={16} />
          <span>Upload Document</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* OCR Transparency Notice */}
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-[#12304A] flex items-start gap-2.5">
        <ShieldCheck size={18} className="text-[#1E5AA8] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">Document Detection Notice:</span>
          <span className="text-[#667085]">
            Information detected from uploaded documents is extracted for your convenience. You must review and confirm all details. Original physical verification is carried out at your designated channel partner office.
          </span>
        </div>
      </div>

      {/* ── Active Documents Grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {documents.map((doc) => {
          const isVerified = doc.status === 'verified'

          return (
            <div
              key={doc.id}
              className={`rounded-2xl p-5 border-2 transition-all space-y-3 flex flex-col justify-between ${
                isVerified
                  ? 'bg-white border-[#D9E1E8]'
                  : 'bg-[#F6F8FA] border-dashed border-[#D9E1E8] hover:border-[#1E5AA8]'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1E5AA8]">
                    <FileText size={18} />
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      isVerified
                        ? 'bg-[#DCFCE7] text-[#16834B] border-[#BBF7D0]'
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}
                  >
                    {isVerified ? '✓ Uploaded & Checked' : '○ Please Upload'}
                  </span>
                </div>

                <h3 className="text-sm font-extrabold text-[#12304A]">{doc.name}</h3>

                {doc.extractedData ? (
                  <div className="space-y-1 p-3 rounded-xl bg-[#F6F8FA] border border-[#D9E1E8] text-xs font-medium text-[#12304A]">
                    {Object.entries(doc.extractedData).slice(0, 2).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-[#667085] capitalize">{k}:</span>
                        <span className="font-bold truncate max-w-[120px]">{v}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#667085]">Not uploaded yet</p>
                )}
              </div>

              {isVerified ? (
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                  <span className="text-[#16834B] font-bold flex items-center gap-1">
                    <CheckCircle2 size={13} />
                    <span>Ready</span>
                  </span>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[#1E5AA8] font-bold hover:underline"
                  >
                    Replace
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full touch-target py-2 rounded-xl bg-[#12304A] text-white text-xs font-bold hover:bg-[#153A5B] transition-colors cursor-pointer"
                >
                  + Upload Document
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Next Step Card ─────────────────────────────────────────────────── */}
      <NextStepCard
        title="Next Step"
        stepNumber="7"
        description="Documents uploaded? Track your application journey to see approval status and fund disbursal stages."
        actionText="My Applications"
        actionTab="applications"
        variant="primary"
      />

      {/* ── OCR Review & Confirmation Modal ───────────────────────────────── */}
      {ocrState.step !== 'idle' && ocrState.step !== 'confirmed' && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl border border-[#D9E1E8]">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-[#1E5AA8]" />
                <h3 className="text-base font-extrabold text-[#12304A]">Review Information Detected from Document</h3>
              </div>
              <button
                onClick={resetOcrState}
                className="text-gray-400 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {ocrState.isProcessing ? (
              <div className="py-12 text-center space-y-4">
                <Loader2 size={36} className="text-[#1E5AA8] animate-spin mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-[#12304A]">Reading document text...</h4>
                  <p className="text-xs text-[#667085]">Masking private Aadhaar digits and detecting income fields</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-[#12304A]">
                  <p className="font-bold">Please check the values below:</p>
                  <p className="text-[#667085] mt-0.5">
                    If any field was misread, you can edit it directly before confirming.
                  </p>
                </div>

                <div className="space-y-3 p-4 rounded-xl bg-[#F6F8FA] border border-[#D9E1E8] max-h-60 overflow-y-auto">
                  {Object.entries(editFields.length ? editFields : ocrState.extractedData || {}).map(([key, val]) => (
                    <div key={key} className="space-y-1">
                      <label className="text-[11px] font-bold text-[#667085] uppercase">{key}</label>
                      <input
                        type="text"
                        value={editFields[key] !== undefined ? editFields[key] : val}
                        onChange={(e) => handleFieldChange(key, e.target.value)}
                        className="w-full bg-white border border-[#D9E1E8] rounded-xl px-3 py-2 text-xs font-bold text-[#12304A] focus:outline-none focus:border-[#1E5AA8]"
                      />
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                  <button
                    onClick={resetOcrState}
                    className="touch-target px-4 py-2.5 rounded-xl bg-gray-100 text-[#12304A] text-xs font-bold"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleFinalSubmit}
                    className="touch-target px-5 py-2.5 rounded-xl bg-[#12304A] hover:bg-[#153A5B] text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs"
                  >
                    <CheckCircle2 size={16} />
                    <span>Confirm & Save to Profile</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
