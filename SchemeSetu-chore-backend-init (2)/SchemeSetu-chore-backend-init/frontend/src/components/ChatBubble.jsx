/**
 * ChatBubble — renders a single chat message with optional data cards.
 *
 * Props:
 *   message: { id, role: 'user' | 'agent' | 'system', content, data }
 */

import { Calculator, Building2, MapPin } from 'lucide-react'

function formatLocation(location) {
  if (!location) return null
  if (typeof location === 'string') return location
  if (typeof location === 'object') {
    const parts = [location.district, location.state, location.pincode].filter(Boolean)
    if (parts.length > 0) return parts.join(', ')
    const values = Object.values(location).filter(Boolean)
    if (values.length > 0) return values.join(', ')
  }
  return null
}

function ProfileCard({ profile, completeness }) {
  if (!profile) return null

  const locationStr = formatLocation(profile.location)

  const entries = [
    { key: 'category', label: 'Category', value: profile.category },
    { key: 'gender', label: 'Gender', value: profile.gender },
    { key: 'age', label: 'Age', value: profile.age },
    { key: 'location', label: 'Location', value: locationStr },
    {
      key: 'annual_income',
      label: 'Annual Income (₹)',
      value: profile.annual_income != null ? `₹${Number(profile.annual_income).toLocaleString('en-IN')}` : null,
    },
    { key: 'business_type', label: 'Business Type', value: profile.business_type },
    {
      key: 'project_cost',
      label: 'Project Cost (₹)',
      value: profile.project_cost != null ? `₹${Number(profile.project_cost).toLocaleString('en-IN')}` : null,
    },
    {
      key: 'loan_required',
      label: 'Loan Required (₹)',
      value: profile.loan_required != null ? `₹${Number(profile.loan_required).toLocaleString('en-IN')}` : null,
    },
    { key: 'education_level', label: 'Education', value: profile.education_level },
    {
      key: 'disability_status',
      label: 'Disability',
      value: profile.disability_status ? 'Yes' : null,
    },
  ].filter(({ value }) => value !== null && value !== undefined && value !== '')

  if (entries.length === 0) return null

  return (
    <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-xs">
      <p className="mb-2 font-bold text-slate-700 uppercase tracking-wide text-[10px]">
        Extracted Profile Attributes — {completeness ?? 0}% complete
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {entries.map(({ key, label, value }) => (
          <div key={key} className="flex justify-between gap-2 border-b border-slate-100 pb-0.5">
            <span className="text-slate-500 truncate">{label}</span>
            <span className="text-slate-900 font-bold capitalize truncate">
              {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function EligibilityCard({ results }) {
  if (!results || results.length === 0) return null

  return (
    <div className="mt-2 space-y-2">
      {results.map((result) => (
        <div
          key={result.scheme_id}
          className={`rounded-lg border p-3 text-xs bg-white shadow-xs ${
            result.eligible
              ? 'border-emerald-300'
              : 'border-rose-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-slate-900">{result.scheme_id}</span>
            <span
              className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                result.eligible
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {result.eligible ? '✓ Eligible' : '✗ Not Eligible'}
            </span>
          </div>

          {/* Match score bar */}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-slate-500 shrink-0 text-[11px]">Criteria Match</span>
            <div className="flex-1 bg-slate-100 rounded-full h-2 border border-slate-200">
              <div
                className="h-full rounded-full bg-emerald-600"
                style={{ width: `${Math.round(result.match_score * 100)}%` }}
              />
            </div>
            <span className="text-slate-700 font-bold shrink-0 text-[11px]">
              {Math.round(result.match_score * 100)}%
            </span>
          </div>

          {/* Failed rules */}
          {result.reasons?.length > 0 && (
            <ul className="mt-2 space-y-1">
              {result.reasons.map((r, i) => (
                <li key={i} className="text-rose-800 text-[11px] font-medium flex items-start gap-1">
                  <span>·</span>
                  <span>{r.detail}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  )
}

function FinancialPlanCard({ plan }) {
  if (!plan) return null

  const formatCurrency = (val) =>
    val != null ? `₹${Number(val).toLocaleString('en-IN')}` : '₹0'

  return (
    <div className="mt-2 rounded-lg border border-emerald-300 bg-emerald-50/50 p-3 text-xs shadow-xs">
      <div className="flex items-center gap-1.5 mb-2 text-emerald-900 font-bold">
        <Calculator size={14} className="text-emerald-700" />
        <span className="uppercase tracking-wide text-[10px]">Financial Projection</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-slate-800 bg-white p-2.5 rounded-md border border-emerald-200">
        <div>
          <span className="text-slate-500 block text-[10px]">Project Cost</span>
          <span className="font-bold text-slate-900">{formatCurrency(plan.project_cost)}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px]">Subsidy Amount</span>
          <span className="font-bold text-emerald-700">{formatCurrency(plan.subsidy_amount)}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px]">Loan Amount</span>
          <span className="font-bold text-slate-900">{formatCurrency(plan.loan_amount)}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px]">Estimated EMI</span>
          <span className="font-bold text-indigo-700">{formatCurrency(plan.monthly_emi)}/mo</span>
        </div>
      </div>
    </div>
  )
}

function RecommendedPartnersCard({ partners }) {
  if (!partners || !Array.isArray(partners) || partners.length === 0) return null

  return (
    <div className="mt-2 rounded-lg border border-indigo-200 bg-indigo-50/50 p-3 text-xs shadow-xs">
      <div className="flex items-center gap-1.5 mb-2 text-indigo-900 font-bold">
        <Building2 size={14} className="text-indigo-700" />
        <span className="uppercase tracking-wide text-[10px]">Recommended Channel Partners</span>
      </div>

      <div className="space-y-2">
        {partners?.map((partner, idx) => (
          <div key={partner?.partner_id || idx} className="bg-white p-2.5 rounded-md border border-indigo-100 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">{partner?.name || 'Channel Partner'}</span>
              {partner?.type && (
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold">
                  {partner.type}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-slate-500 text-[11px]">
              {partner?.distance_km != null && (
                <span className="flex items-center gap-1 shrink-0">
                  <MapPin size={12} className="text-rose-500" />
                  <span className="font-semibold text-slate-700">{partner.distance_km} km</span>
                </span>
              )}
              {partner?.distance_km != null && partner?.address && <span>·</span>}
              {partner?.address && <span className="truncate">{partner.address}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ChatBubble({ message }) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-md px-3 py-1 font-medium">
          {message.content}
        </span>
      </div>
    )
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} my-2`}>
      {/* Assistant Avatar */}
      {!isUser && (
        <div className="shrink-0 w-7 h-7 rounded-md bg-slate-900 flex items-center justify-center text-amber-300 text-[11px] font-bold mr-2 mt-1 shadow-xs">
          🏛️
        </div>
      )}

      <div className={`max-w-[80%] ${isUser ? 'max-w-[65%]' : ''}`}>
        {/* Bubble */}
        <div
          className={`rounded-xl px-4 py-3 text-xs md:text-sm leading-relaxed ${
            isUser
              ? 'bg-slate-900 text-white rounded-br-xs shadow-xs'
              : 'bg-slate-100 text-slate-900 border border-slate-200 rounded-bl-xs'
          }`}
        >
          {message.content}
        </div>

        {/* Data cards (agent only) */}
        {!isUser && message.data && (
          <div className="mt-1">
            <ProfileCard
              profile={message.data.profile}
              completeness={message.data.profile_completeness_pct}
            />
            <EligibilityCard results={message.data.eligibility_results} />
            {message.data.financial_plan && (
              <FinancialPlanCard plan={message.data.financial_plan} />
            )}
            {message.data.recommended_partners && (
              <RecommendedPartnersCard partners={message.data.recommended_partners} />
            )}
          </div>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="shrink-0 w-7 h-7 rounded-md bg-indigo-900 flex items-center justify-center text-white text-[10px] font-bold ml-2 mt-1">
          You
        </div>
      )}
    </div>
  )
}
