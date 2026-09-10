/**
 * ChatBubble — renders a single chat message with optional data cards in
 * the official SchemeSetu Government Digital Service light-first aesthetic.
 */
import { ShieldCheck, CheckCircle2, AlertCircle, Building2, HelpCircle } from 'lucide-react'
import useChatStore from '../store/chatStore'

// ── Profile Card ──────────────────────────────────────────────────────────────
const PROFILE_LABELS = {
  age: 'Age',
  gender: 'Gender',
  category: 'Social Category',
  annual_income: 'Annual Income (₹)',
  loan_required: 'Loan Required (₹)',
  project_cost: 'Project Cost (₹)',
  education_level: 'Education',
  business_type: 'Business / Venture',
  disability_status: 'Disability',
  state: 'State',
  location: 'District / City',
}

function ProfileCard({ entities, completeness }) {
  if (!entities || Object.keys(entities).length === 0) return null

  const entries = Object.entries(entities)
    .filter(([key]) => PROFILE_LABELS[key])
    .map(([key, value]) => ({ key, label: PROFILE_LABELS[key], value }))

  if (entries.length === 0) return null

  return (
    <div className="mt-2.5 rounded-xl border border-[#D9E1E8] bg-white p-3.5 text-xs shadow-2xs">
      <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-gray-100">
        <span className="font-bold text-[#1E5AA8] uppercase text-[10px] tracking-wide">
          Information Detected from Message
        </span>
        <span className="px-2 py-0.5 rounded-full bg-green-50 text-[#16834B] text-[10px] font-bold border border-green-200">
          {completeness ?? 50}% Profile Complete
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {entries.map(({ key, label, value }) => (
          <div key={key} className="flex justify-between gap-2 p-1.5 rounded-lg bg-[#F6F8FA]">
            <span className="text-[#667085] truncate">{label}:</span>
            <span className="text-[#12304A] font-extrabold capitalize truncate">
              {key.includes('income') || key.includes('loan') || key.includes('cost')
                ? `₹${Number(value).toLocaleString('en-IN')}`
                : typeof value === 'boolean'
                ? (value ? 'Yes' : 'No')
                : String(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Eligibility Card ──────────────────────────────────────────────────────────
function EligibilityCard({ results }) {
  if (!results || results.length === 0) return null

  return (
    <div className="mt-2.5 space-y-2">
      {results.map((result) => {
        const isEligible = result.decision === 'eligible'
        const isMissing = result.decision === 'missing_information'

        return (
          <div
            key={result.scheme_id}
            className={`rounded-xl border-2 p-3 text-xs shadow-2xs ${
              isEligible
                ? 'border-[#BBF7D0] bg-[#F0FDF4]'
                : isMissing
                ? 'border-[#FED7AA] bg-[#FFF7ED]'
                : 'border-red-200 bg-red-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-extrabold text-[#12304A] text-xs">{result.scheme_id}</span>
              <span
                className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${
                  isEligible
                    ? 'bg-[#DCFCE7] text-[#16834B] border-[#BBF7D0]'
                    : isMissing
                    ? 'bg-[#FFEDD5] text-[#C2410C] border-[#FED7AA]'
                    : 'bg-red-100 text-red-700 border-red-200'
                }`}
              >
                {isEligible ? '✓ Likely Eligible' : isMissing ? '? Needs Verification' : '✕ Does Not Meet Rule'}
              </span>
            </div>

            {/* Explanation / matched rules */}
            {result.explanation && (
              <p className="text-[11px] text-[#17212B] mt-1">{result.explanation}</p>
            )}

            {/* Failed rules list */}
            {result.failed_rules?.length > 0 && (
              <ul className="mt-1.5 space-y-0.5 border-t border-red-200/60 pt-1 text-[11px] text-red-700">
                {result.failed_rules.map((r, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span>•</span>
                    <span>{r.explanation || r.rule_name || JSON.stringify(r)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Financial Summaries Card ──────────────────────────────────────────────────
function FinancialCard({ summaries }) {
  if (!summaries || summaries.length === 0) return null

  return (
    <div className="mt-2.5 space-y-2">
      {summaries.map((fin, i) => (
        <div key={i} className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-xs shadow-2xs">
          <p className="font-extrabold text-[#1E5AA8] mb-1.5 text-[11px] uppercase tracking-wide">
            Estimated Repayment — {fin.scheme_id}
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {fin.max_loan_amount && (
              <div className="flex justify-between p-1 rounded bg-white"><span className="text-[#667085]">Max Loan:</span><span className="font-bold text-[#12304A]">₹{Number(fin.max_loan_amount).toLocaleString('en-IN')}</span></div>
            )}
            {fin.interest_rate && (
              <div className="flex justify-between p-1 rounded bg-white"><span className="text-[#667085]">Rate:</span><span className="font-bold text-[#16834B]">{fin.interest_rate}% p.a.</span></div>
            )}
            {fin.emi_after_moratorium && (
              <div className="flex justify-between p-1 rounded bg-white col-span-2"><span className="text-[#667085]">Estimated Monthly Installment:</span><span className="font-black text-[#12304A]">₹{Number(fin.emi_after_moratorium).toLocaleString('en-IN')} / mo</span></div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── OCR Confirmation Card ─────────────────────────────────────────────────────
function OcrConfirmationCard({ ocrResult }) {
  if (!ocrResult || !ocrResult.extracted_fields) return null

  const { confirmOcrFields, dismissOcrConfirmation } = useChatStore.getState()
  const fields = ocrResult.extracted_fields

  const handleConfirm = () => {
    const confirmedFields = {}
    for (const [key, field] of Object.entries(fields)) {
      confirmedFields[key] = field.extracted_value
    }
    confirmOcrFields(confirmedFields)
  }

  return (
    <div className="mt-2.5 rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-[#12304A] shadow-2xs space-y-2">
      <p className="font-extrabold text-[#C2410C] text-[11px] uppercase tracking-wide flex items-center gap-1.5">
        <ShieldCheck size={14} />
        <span>Document Extraction — Please Confirm</span>
      </p>

      <div className="space-y-1">
        {Object.entries(fields).map(([key, field]) => (
          <div key={key} className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-amber-200">
            <span className="text-[#667085] capitalize">{key.replace(/_/g, ' ')}:</span>
            <span className="font-bold text-[#12304A]">
              {key.includes('income') ? `₹${Number(field.extracted_value).toLocaleString('en-IN')}` : field.extracted_value}
            </span>
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={handleConfirm}
          className="flex-1 py-2 px-3 rounded-lg bg-[#16834B] hover:bg-[#15803D] text-white text-xs font-bold transition-colors shadow-2xs"
        >
          ✓ Confirm & Save
        </button>
        <button
          onClick={dismissOcrConfirmation}
          className="py-2 px-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#12304A] text-xs font-bold transition-colors"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}

// ── Main ChatBubble Component ────────────────────────────────────────────────
export default function ChatBubble({ message }) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  if (isSystem) {
    return (
      <div className="flex justify-center my-1">
        <span className="text-xs text-[#12304A] bg-blue-50 border border-blue-200 rounded-xl px-3.5 py-1.5 font-medium shadow-2xs">
          {message.content}
        </span>
      </div>
    )
  }

  return (
    <div className={`flex gap-2.5 my-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Official Government Assistant Avatar */}
      {!isUser && (
        <div className="shrink-0 w-8 h-8 rounded-xl bg-[#12304A] text-white flex items-center justify-center font-black text-xs shadow-2xs mt-0.5">
          <Building2 size={16} className="text-[#E67E22]" />
        </div>
      )}

      <div className={`max-w-[85%] sm:max-w-[75%] space-y-1 ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-2xs ${
            isUser
              ? 'bg-[#12304A] text-white rounded-br-xs font-medium'
              : 'bg-white text-[#17212B] border border-[#D9E1E8] rounded-bl-xs'
          }`}
        >
          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>

        {/* Optional Data Cards under Agent response */}
        {!isUser && message.data && (
          <div className="w-full">
            <ProfileCard
              entities={message.data.extracted_entities}
              completeness={message.data.profile_completeness_pct}
            />
            <EligibilityCard results={message.data.eligibility_results} />
            <FinancialCard summaries={message.data.financial_summaries} />
            <OcrConfirmationCard ocrResult={message.data.ocr_result} />
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="shrink-0 w-8 h-8 rounded-xl bg-[#1E5AA8] text-white flex items-center justify-center font-bold text-xs shadow-2xs mt-0.5">
          You
        </div>
      )}
    </div>
  )
}
