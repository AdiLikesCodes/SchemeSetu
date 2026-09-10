import { useState } from 'react'
import { MapPin, Navigation, Phone, CheckCircle2, ExternalLink, Building2, ChevronRight } from 'lucide-react'
import useChatStore from '../store/chatStore'
import { getNearbyPartnersForScheme } from '../utils/partnerUtils'

export default function NearbyPartnersCard({ scheme, limit = null, showHeader = true, compact = false }) {
  const { partners, userProfile, setSelectedPartner, setSelectedScheme, setActiveTab } = useChatStore()
  const [routeModalPartner, setRouteModalPartner] = useState(null)

  const nearbyPartners = getNearbyPartnersForScheme(partners, scheme, userProfile)
  const displayPartners = limit ? nearbyPartners.slice(0, limit) : nearbyPartners

  const userLocationLabel = userProfile.district
    ? `${userProfile.district}${userProfile.pinCode ? ` (${userProfile.pinCode})` : ''}`
    : 'Your Location'

  const handleApplyWithPartner = (partner) => {
    if (scheme) {
      setSelectedScheme(scheme)
    }
    setSelectedPartner(partner)
    setActiveTab('applications')
  }

  const handleViewAllPartners = () => {
    if (scheme) {
      setSelectedScheme(scheme)
    }
    setActiveTab('partner-finder')
  }

  if (displayPartners.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
        No specific channel partner found for this scheme near {userLocationLabel}.
      </div>
    )
  }

  if (compact) {
    return (
      <div className="space-y-2.5 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800 flex items-center gap-1">
            <MapPin size={13} className="text-indigo-600 shrink-0" />
            <span>Nearby Authorized Partners ({nearbyPartners.length})</span>
          </span>
          <button
            onClick={handleViewAllPartners}
            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
          >
            <span>View All</span>
            <ChevronRight size={12} />
          </button>
        </div>

        <div className="space-y-2">
          {displayPartners.map((partner) => (
            <div
              key={partner.id}
              className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-200 flex items-center justify-between gap-3 text-xs transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="font-bold text-slate-900 truncate">{partner.name}</h4>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                    {partner.calculatedDistanceText || partner.distance}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">📍 {partner.address}</p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setRouteModalPartner(partner)}
                  className="p-1.5 rounded-md bg-white border border-slate-200 hover:bg-slate-200 text-slate-700 transition-colors"
                  title="View Directions"
                >
                  <Navigation size={13} />
                </button>
                <button
                  onClick={() => handleApplyWithPartner(partner)}
                  className="px-2.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] transition-colors"
                >
                  Select
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Directions Modal */}
        {routeModalPartner && (
          <DirectionsModal partner={routeModalPartner} onClose={() => setRouteModalPartner(null)} />
        )}
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-900 text-[11px] font-bold mb-1">
              <Building2 size={12} />
              <span>Public Channelizing Network</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Nearby Authorized Partners & Channelizers
            </h3>
            <p className="text-xs text-slate-500">
              Showing partner centers near <strong className="text-slate-800">{userLocationLabel}</strong> supporting{' '}
              <span className="text-indigo-900 font-semibold">{scheme?.name || 'this scheme'}</span>.
            </p>
          </div>

          <button
            onClick={handleViewAllPartners}
            className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Full Partner Map</span>
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {displayPartners.map((partner) => (
          <div
            key={partner.id}
            className="p-4 rounded-xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3 transition-colors"
          >
            <div className="space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {partner.type}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900 text-xs font-extrabold flex items-center gap-1 border border-indigo-200 shrink-0">
                  <MapPin size={12} className="text-indigo-700" />
                  <span>{partner.calculatedDistanceText || partner.distance}</span>
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900">{partner.name}</h4>
              <p className="text-xs text-slate-600 flex items-start gap-1">
                <span>📍</span>
                <span>{partner.address}</span>
              </p>

              <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500">
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <CheckCircle2 size={13} />
                  <span>Authorized for {scheme?.name ? scheme.name.split(' ')[0] : 'Scheme'}</span>
                </span>
                <span className="font-medium text-slate-600">{partner.phone}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setRouteModalPartner(partner)}
                className="flex-1 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-300 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Navigation size={13} className="text-indigo-700" />
                <span>Directions</span>
              </button>

              <button
                onClick={() => handleApplyWithPartner(partner)}
                className="flex-1 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1 transition-colors"
              >
                <span>Apply Here</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {routeModalPartner && (
        <DirectionsModal partner={routeModalPartner} onClose={() => setRouteModalPartner(null)} />
      )}
    </div>
  )
}

function DirectionsModal({ partner, onClose }) {
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-300 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-indigo-900" />
            <h3 className="text-base font-bold text-slate-900">Partner Directions & Contact</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-sm font-bold">
            ✕
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <h4 className="text-sm font-bold text-slate-900">{partner.name}</h4>
          <p className="text-slate-600">📍 {partner.address}</p>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500 block">Distance & Travel Estimate:</span>
            <span className="text-lg font-black text-slate-900">
              {partner.calculatedDistanceText || partner.distance}
            </span>
            <p className="text-[11px] text-slate-500">Estimated ~10-15 mins drive from your current location</p>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-100 text-slate-900 font-mono font-bold">
            <Phone size={15} />
            <span>{partner.phone}</span>
          </div>
        </div>

        <div className="pt-2 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold"
          >
            Close
          </button>
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(partner.name + ' ' + partner.address)}`}
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
  )
}
