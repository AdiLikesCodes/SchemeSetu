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
  Building2
} from 'lucide-react'
import useChatStore from '../store/chatStore'

export default function Documents() {
  const { documents, ocrState, simulatePaddleOCRUpload, confirmOcrData, resetOcrState } = useChatStore()
  const fileInputRef = useRef(null)

  // Editable fields during OCR confirm step
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
    confirmOcrData(editFields)
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* ── Official Government Header ───────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold mb-1">
            <Building2 size={14} className="text-amber-800" />
            <span>PaddleOCR Verification Service</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">REQUIRED DOCUMENTS & OCR VERIFICATION</h1>
          <p className="text-xs text-slate-600">
            Upload official certificates for automated attribute extraction with user verification before profile updates.
          </p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="shrink-0 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
        >
          <Upload size={16} />
          <span>Upload New Document</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Notice Banner */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
        <AlertCircle size={18} className="text-amber-700 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-slate-900">Mandatory Verification Step:</p>
          <p className="text-slate-600 mt-0.5">
            Information extracted from your document should be reviewed before confirmation. The AI assists in reading text, but you maintain full control over your verified profile attributes.
          </p>
        </div>
      </div>

      {/* ── Required Document Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {documents.map((doc) => {
          const isVerified = doc.status === 'verified'

          return (
            <div
              key={doc.id}
              className={`rounded-xl p-5 border transition-all space-y-3 flex flex-col justify-between ${
                isVerified
                  ? 'bg-white border-slate-200 shadow-xs'
                  : 'bg-slate-50 border-dashed border-slate-300 hover:border-slate-400'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
                    <FileText size={18} />
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      isVerified
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isVerified ? '✓ Verified' : 'Pending Upload'}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">{doc.name}</h3>
                  <p className="text-[10px] text-slate-500 uppercase">PDF / JPG / PNG supported</p>
                </div>

                {doc.extractedData ? (
                  <div className="space-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
                    {Object.entries(doc.extractedData).slice(0, 2).map(([k, v]) => (
                      <div key={k} className="flex justify-between border-b border-slate-100 pb-0.5">
                        <span className="text-slate-500 capitalize text-[11px]">{k}:</span>
                        <span className="font-bold text-slate-900 truncate max-w-[120px]">{v}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Document not uploaded yet</p>
                )}
              </div>

              {isVerified ? (
                <div className="flex items-center gap-1 text-[11px] text-emerald-800 font-bold pt-2 border-t border-slate-100">
                  <CheckCircle2 size={14} className="text-emerald-700" />
                  <span>Information extracted & confirmed</span>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white transition-colors"
                >
                  Upload Document
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* ── PaddleOCR Verification Workflow Modal ──────────────────────────── */}
      {ocrState.step !== 'idle' && ocrState.step !== 'confirmed' && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-xl max-w-xl w-full p-6 space-y-5 shadow-xl">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">PaddleOCR Field Extraction Review</h3>
              </div>
              <button onClick={resetOcrState} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            {/* Stepper Status */}
            {ocrState.isProcessing ? (
              <div className="py-10 text-center space-y-3">
                <Loader2 size={32} className="text-slate-900 animate-spin mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900">Running PaddleOCR Text Detection...</h4>
                  <p className="text-xs text-slate-500">Extracting fields and redacting PII attributes</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200 text-xs text-indigo-900">
                  <strong>PaddleOCR Engine v2.7:</strong> Information extracted from your document should be reviewed before confirmation.
                </div>

                {/* Extracted Information Edit/Confirm Form */}
                <div className="space-y-3 p-4 rounded-lg bg-slate-50 border border-slate-200 max-h-60 overflow-y-auto text-xs">
                  <h4 className="font-bold text-slate-900 uppercase text-[10px]">Review Extracted Fields:</h4>

                  {Object.entries(editFields.length ? editFields : ocrState.extractedData || {}).map(([key, val]) => (
                    <div key={key} className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 uppercase">{key}</label>
                      <input
                        type="text"
                        value={editFields[key] !== undefined ? editFields[key] : val}
                        onChange={(e) => handleFieldChange(key, e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-500"
                      />
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                  <button
                    onClick={resetOcrState}
                    className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleFinalSubmit}
                    className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 size={15} />
                    <span>Confirm Information & Update Profile</span>
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
