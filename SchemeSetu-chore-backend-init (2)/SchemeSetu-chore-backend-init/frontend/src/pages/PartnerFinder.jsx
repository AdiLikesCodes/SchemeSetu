import { useState } from 'react'
import { MapPin, Navigation, Phone, CheckCircle2, AlertCircle, ExternalLink, Filter, Building2, Search } from 'lucide-react'
import useChatStore from '../store/chatStore'

export default function PartnerFinder() {
  const { partners, selectedScheme, userProfile, setSelectedPartner, setActiveTab } = useChatStore()
  const [sortBy, setSortBy] = useState('match') // 'match' | 'distance' | 'availability'
  const [routeModalPartner, setRouteModalPartner] = useState(null)

  const sortedPartners = [...partners].sort((a, b) => {
    if (sortBy === 'distance') {
      return parseFloat(a.distance) - parseFloat(b.distance)
    }
    if (sortBy === 'availability') {
      return (b.available ? 1 : 0) - (a.available ? 1 : 0)
    }
    return b.rating - a.rating
  })

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* ── Official Government Header ───────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold mb-1">
            <Building2 size={14} className="text-indigo-800" />
            <span>Authorized Public Channelizing Network</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">FIND AN AUTHORIZED CHANNEL PARTNER</h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
            <span>Selected Scheme: <strong className="text-slate-900">{selectedScheme ? selectedScheme.name : 'NSFDC Term Loan'}</strong></span>
            <span>•</span>
            <span>Location: <strong className="text-slate-900">{userProfile.district ? `${userProfile.district}, ${userProfile.state} (${userProfile.pinCode})` : 'All India / Select Location'}</strong></span>
          </div>
        </div>

        {/* Sort Filter */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs">
          <Filter size={14} className="text-slate-700" />
          <span className="text-slate-600 font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
          >
            <option value="match">Best Match</option>
            <option value="distance">Distance</option>
            <option value="availability">Availability</option>
          </select>
        </div>
      </div>

      {/* ── Map / List Split Layout ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Recommended Channel Partners List (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2">
            Recommended Channel Partners ({sortedPartners.length})
          </h3>

          <div className="space-y-4">
            {sortedPartners.map((partner) => (
              <div
                key={partner.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{partner.type}</span>
                      <h4 className="text-base font-bold text-slate-900">{partner.name}</h4>
                    </div>
                    <span className="shrink-0 px-2.5 py-1 rounded-md bg-slate-100 text-slate-900 text-xs font-bold border border-slate-200 flex items-center gap-1">
                      <MapPin size={13} className="text-indigo-900" />
                      <span>{partner.distance}</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 flex items-start gap-1">
                    <span className="shrink-0">📍</span>
                    <span>{partner.address}</span>
                  </p>

                  <div className="space-y-1 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                      <CheckCircle2 size={14} className="text-emerald-700 shrink-0" />
                      <span>Scheme supported ({selectedScheme ? selectedScheme.name : 'NSFDC'})</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${partner.available ? 'text-emerald-800' : 'text-slate-600'}`}>
                        Status: {partner.available ? 'Applications Available' : 'Quota Allocated'}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                        partner.available ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {partner.lastUpdated}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setRouteModalPartner(partner)}
                    className="flex-1 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Navigation size={14} />
                    <span>Get Directions</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedPartner(partner)
                      setActiveTab('applications')
                    }}
                    className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold border border-slate-200 transition-colors"
                  >
                    Apply Here
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Interactive Map Preview Panel (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2">
            Geographic Coverage & Route Preview
          </h3>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
            <div className="h-64 rounded-lg bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-center p-6 space-y-2">
              <MapPin size={32} className="text-slate-700" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-900">District Channelizer Map Preview</p>
                <p className="text-[11px] text-slate-500 max-w-xs">
                  Showing 3 authorized channel partners near {userProfile.pinCode} ({userProfile.district}, {userProfile.state})
                </p>
              </div>
            </div>

            {/* Demo Data Clarification Callout */}
            <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertCircle size={14} className="text-amber-700" />
                <span>Verification Data Status</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Live availability feed connected to state channelizing agencies. Demo/sample data is explicitly labeled for test branches.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Directions Modal */}
      {routeModalPartner && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-indigo-900" />
                <h3 className="text-base font-bold text-slate-900">Partner Directions & Details</h3>
              </div>
              <button onClick={() => setRouteModalPartner(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <h4 className="text-sm font-bold text-slate-900">{routeModalPartner.name}</h4>
              <p className="text-slate-600">📍 {routeModalPartner.address}</p>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-500 block">Distance & Estimated Travel:</span>
                <span className="text-lg font-black text-slate-900">{routeModalPartner.distance}</span>
                <p className="text-[11px] text-slate-500">12 minutes via Highway 66</p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-100 text-slate-900 font-mono font-bold">
                <Phone size={15} />
                <span>{routeModalPartner.phone}</span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setRouteModalPartner(null)}
                className="flex-1 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold"
              >
                Close
              </button>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(routeModalPartner.address)}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <span>Open Google Maps</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
