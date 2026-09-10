import { useState } from 'react'
import {
  MapPin,
  Navigation,
  Phone,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Filter,
  Building2,
  ArrowRight
} from 'lucide-react'
import useChatStore from '../store/chatStore'
import { TermExplainer } from '../components/PlainLanguageModal'
import NextStepCard from '../components/NextStepCard'

export default function PartnerFinder() {
  const { partners, selectedScheme, userProfile, setSelectedPartner, setActiveTab } = useChatStore()
  const [sortBy, setSortBy] = useState('distance')
  const [routeModalPartner, setRouteModalPartner] = useState(null)
  const [selectedPartnerDetail, setSelectedPartnerDetail] = useState(null)
  const [searchLocation, setSearchLocation] = useState(`${userProfile.district || 'Thiruvananthapuram'}, ${userProfile.state || 'Kerala'}`)

  const sortedPartners = [...partners].sort((a, b) => {
    if (sortBy === 'distance') {
      return parseFloat(a.distance) - parseFloat(b.distance)
    }
    return b.rating - a.rating
  })

  const handleApplyHere = (partner) => {
    setSelectedPartner(partner)
    setActiveTab('applications')
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#D9E1E8] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#1E5AA8] uppercase tracking-wider">
            <span>Approved Application Centres</span>
            <TermExplainer term="channel partner" label="What is a channel partner?" />
          </div>
          <h1 className="text-xl md:text-2xl font-black text-[#12304A]">
            Where to Apply (Authorized Channel Partners)
          </h1>
          <p className="text-xs md:text-sm text-[#667085]">
            Visit an officially approved State Channelizing Agency (SCA) office or partner bank branch to submit your scheme application.
          </p>
        </div>

        {/* Location search & Sort controls */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
          <div className="flex items-center gap-2 bg-[#F6F8FA] border border-[#D9E1E8] rounded-xl px-3 py-2 text-xs">
            <MapPin size={15} className="text-[#1E5AA8]" />
            <span className="font-bold text-[#12304A]">{searchLocation}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#F6F8FA] border border-[#D9E1E8] rounded-xl px-3 py-2 text-xs">
            <Filter size={13} className="text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort partners"
              className="bg-transparent font-bold text-[#12304A] focus:outline-none cursor-pointer"
            >
              <option value="distance">Nearest First</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Partner Cards Grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sortedPartners.map((partner) => (
          <div
            key={partner.id}
            className="bg-white border-2 border-[#D9E1E8] hover:border-[#1E5AA8] rounded-2xl p-6 transition-all duration-200 flex flex-col justify-between space-y-4 shadow-2xs hover:shadow-md"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-[#1E5AA8] uppercase tracking-wider block">
                    {partner.type}
                  </span>
                  <h3 className="text-base font-black text-[#12304A] leading-snug">{partner.name}</h3>
                </div>
                <span className="shrink-0 px-2.5 py-1 rounded-lg bg-blue-50 text-[#1E5AA8] text-xs font-bold border border-blue-200 flex items-center gap-1">
                  <MapPin size={12} />
                  <span>{partner.distance}</span>
                </span>
              </div>

              <p className="text-xs text-[#667085] flex items-start gap-1.5 leading-relaxed">
                <span>📍</span>
                <span>{partner.address}</span>
              </p>

              {/* Supported scheme & Status */}
              <div className="space-y-2 pt-2 border-t border-gray-100 text-xs text-[#17212B]">
                <div className="flex items-center gap-2 text-[#16834B] font-semibold">
                  <CheckCircle2 size={15} className="shrink-0" />
                  <span>Supports {selectedScheme ? selectedScheme.name : 'NSFDC Term Loan'}</span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-green-50 text-[#16834B] font-bold border border-green-200">
                    Accepting Applications
                  </span>
                  <span className="text-[#667085]">Verified: {partner.lastUpdated}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => setRouteModalPartner(partner)}
                className="touch-target px-3.5 py-2.5 rounded-xl bg-[#F6F8FA] hover:bg-gray-100 text-[#12304A] font-bold text-xs flex items-center gap-1.5 border border-[#D9E1E8] transition-colors cursor-pointer"
              >
                <Navigation size={14} className="text-[#1E5AA8]" />
                <span>Directions</span>
              </button>

              <button
                onClick={() => handleApplyHere(partner)}
                className="flex-1 touch-target py-2.5 px-3.5 rounded-xl bg-[#12304A] hover:bg-[#153A5B] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <span>Select & Apply</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Next Step Callout ─────────────────────────────────────────────── */}
      <NextStepCard
        title="Next Step"
        stepNumber="6"
        description="Ready to proceed? Select your preferred channel partner above to start or track your application submission."
        actionText="My Applications"
        actionTab="applications"
        variant="primary"
      />

      {/* Official State Channelizing Agency Notice */}
      <div className="p-4 rounded-xl bg-[#F6F8FA] border border-[#D9E1E8] text-xs text-[#667085] flex items-center gap-3">
        <AlertCircle size={18} className="text-[#E67E22] shrink-0" />
        <span>
          <strong>Official Direct Routing:</strong> State Channelizing Agencies (SCAs) are authorized state government corporations. Beneficiaries do not need to pay any intermediary commission or application fee.
        </span>
      </div>

      {/* Route & Directions Modal */}
      {routeModalPartner && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#D9E1E8]">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-[#1E5AA8]" />
                <h3 className="text-base font-bold text-[#12304A]">Partner Location & Directions</h3>
              </div>
              <button
                onClick={() => setRouteModalPartner(null)}
                className="text-gray-400 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#17212B]">
              <h4 className="text-sm font-extrabold text-[#12304A]">{routeModalPartner.name}</h4>
              <p className="text-[#667085]">📍 {routeModalPartner.address}</p>

              <div className="p-4 rounded-xl bg-[#F6F8FA] border border-[#D9E1E8] text-center space-y-1">
                <span className="text-[#667085] block">Distance from your location:</span>
                <span className="text-2xl font-black text-[#1E5AA8]">{routeModalPartner.distance}</span>
                <p className="text-[11px] text-[#667085]">Approx 10–15 minutes travel time</p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-200 text-[#12304A]">
                <div className="flex items-center gap-2">
                  <Phone size={15} className="text-[#1E5AA8]" />
                  <span className="font-bold">Official Telephone</span>
                </div>
                <span className="font-mono font-bold text-xs">{routeModalPartner.phone}</span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setRouteModalPartner(null)}
                className="flex-1 touch-target py-2.5 rounded-xl bg-gray-100 text-[#12304A] text-xs font-bold"
              >
                Close
              </button>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(routeModalPartner.address)}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 touch-target py-2.5 rounded-xl bg-[#1E5AA8] hover:bg-[#153A5B] text-white text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <span>Google Maps</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
