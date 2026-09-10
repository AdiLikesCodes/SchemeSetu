import { useState, useEffect, useCallback } from 'react'
import { 
  Building2, 
  ShieldCheck, 
  Database, 
  Globe, 
  RefreshCw, 
  FileText, 
  FolderCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Terminal,
  ExternalLink,
  Lock,
  Plus,
  Eye,
  XCircle,
  History,
  Cpu,
  Zap,
  AlertCircle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import useChatStore from '../store/chatStore'

const API_ADMIN = 'http://localhost:8000/api/admin'

// ── Status badge styling ──────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    published:         'bg-emerald-50 text-emerald-800 border-emerald-200',
    draft:             'bg-slate-100 text-slate-700 border-slate-200',
    review_required:   'bg-amber-50 text-amber-800 border-amber-200',
    validated:         'bg-blue-50 text-blue-800 border-blue-200',
    reviewed:          'bg-indigo-50 text-indigo-800 border-indigo-200',
    validation_failed: 'bg-red-50 text-red-700 border-red-200',
    rejected:          'bg-red-100 text-red-800 border-red-300',
    superseded:        'bg-purple-50 text-purple-700 border-purple-200',
    archived:          'bg-gray-100 text-gray-600 border-gray-200',
    conflict:          'bg-orange-50 text-orange-800 border-orange-200',
    queued:            'bg-slate-50 text-slate-600 border-slate-200',
    running:           'bg-blue-50 text-blue-700 border-blue-200',
    success:           'bg-emerald-50 text-emerald-700 border-emerald-200',
    failed:            'bg-red-50 text-red-700 border-red-200',
  }
  const cls = map[status] || 'bg-slate-100 text-slate-700 border-slate-200'
  return (
    <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold border ${cls}`}>
      {status?.replace(/_/g, ' ').toUpperCase()}
    </span>
  )
}

function ExtractionBadge({ method }) {
  if (!method) return null
  const isFirecrawl = method === 'firecrawl'
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
      isFirecrawl ? 'bg-violet-50 text-violet-700 border border-violet-200' 
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
    }`}>
      {isFirecrawl ? <Zap size={10} /> : <Cpu size={10} />}
      {isFirecrawl ? 'Firecrawl' : 'httpx fallback'}
    </span>
  )
}

export default function AdminDashboard() {
  const { adminTab, setAdminTab } = useChatStore()

  // ── Scraper state ───────────────────────────────────────────────────────────
  const [scrapeUrl, setScrapeUrl] = useState('https://nsfdc.nic.in/faqs')
  const [scraperRunning, setScraperRunning] = useState(false)
  const [scrapeError, setScrapeError] = useState('')
  const [activeJobId, setActiveJobId] = useState(null)

  // ── Data state ──────────────────────────────────────────────────────────────
  const [jobs, setJobs] = useState([])
  const [schemes, setSchemes] = useState([])
  const [sources, setSources] = useState([])
  const [changes, setChanges] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(false)

  // ── Source registration form ────────────────────────────────────────────────
  const [showSourceForm, setShowSourceForm] = useState(false)
  const [sourceForm, setSourceForm] = useState({
    domain: '', authority: '', display_name: '', base_url: '',
    allowed_topics: '', source_type: 'official_scheme_page', priority: 'medium',
  })

  // ── Scheme detail panel ─────────────────────────────────────────────────────
  const [expandedScheme, setExpandedScheme] = useState(null)
  const [schemeVersions, setSchemeVersions] = useState({})

  // ── Fetch helpers ───────────────────────────────────────────────────────────
  const fetchJobs = useCallback(async () => {
    try {
      const r = await fetch(`${API_ADMIN}/scraper/jobs`)
      if (r.ok) setJobs(await r.json())
    } catch {}
  }, [])

  const fetchSchemes = useCallback(async () => {
    try {
      const r = await fetch(`${API_ADMIN}/scraper/schemes`)
      if (r.ok) setSchemes(await r.json())
    } catch {}
  }, [])

  const fetchSources = useCallback(async () => {
    try {
      const r = await fetch(`${API_ADMIN}/sources`)
      if (r.ok) setSources(await r.json())
    } catch {}
  }, [])

  const fetchChanges = useCallback(async () => {
    try {
      const r = await fetch(`${API_ADMIN}/scraper/changes`)
      if (r.ok) setChanges(await r.json())
    } catch {}
  }, [])

  const fetchAuditLogs = useCallback(async () => {
    try {
      const r = await fetch(`${API_ADMIN}/scraper/audit-logs`)
      if (r.ok) setAuditLogs(await r.json())
    } catch {}
  }, [])

  // Load data on tab switch
  useEffect(() => {
    if (adminTab === 'scraper') fetchJobs()
    if (adminTab === 'schemes') fetchSchemes()
    if (adminTab === 'sources') fetchSources()
    if (adminTab === 'changes') fetchChanges()
    if (adminTab === 'audit-logs') fetchAuditLogs()
  }, [adminTab])

  // Poll active job
  useEffect(() => {
    if (!activeJobId) return
    const interval = setInterval(async () => {
      try {
        const r = await fetch(`${API_ADMIN}/scraper/jobs/${activeJobId}`)
        if (r.ok) {
          const job = await r.json()
          setJobs(prev => {
            const idx = prev.findIndex(j => j.job_id === activeJobId)
            if (idx >= 0) { const n = [...prev]; n[idx] = job; return n }
            return [job, ...prev]
          })
          if (job.status === 'success' || job.status === 'failed') {
            setActiveJobId(null)
            setScraperRunning(false)
            if (job.status === 'success') fetchSchemes()
          }
        }
      } catch {}
    }, 2000)
    return () => clearInterval(interval)
  }, [activeJobId])

  // ── Actions ─────────────────────────────────────────────────────────────────
  const handleTriggerScraper = async () => {
    setScrapeError('')
    setScraperRunning(true)
    try {
      const r = await fetch(`${API_ADMIN}/scraper/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: scrapeUrl, actor: 'admin' }),
      })
      const data = await r.json()
      if (!r.ok) {
        setScrapeError(data.detail || 'Scrape failed')
        setScraperRunning(false)
        return
      }
      setActiveJobId(data.job_id)
      setJobs(prev => [{ job_id: data.job_id, url: scrapeUrl, status: 'queued', created_at: new Date().toISOString() }, ...prev])
    } catch (e) {
      setScrapeError(`Network error: ${e.message}`)
      setScraperRunning(false)
    }
  }

  const handlePublish = async (schemeId) => {
    const r = await fetch(`${API_ADMIN}/scraper/schemes/${schemeId}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actor: 'admin' }),
    })
    const data = await r.json()
    if (r.ok) fetchSchemes()
    else alert(data.detail)
  }

  const handleReject = async (schemeId) => {
    const reason = prompt('Rejection reason:')
    if (!reason) return
    const r = await fetch(`${API_ADMIN}/scraper/schemes/${schemeId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, actor: 'admin' }),
    })
    if (r.ok) fetchSchemes()
  }

  const handleApproveSource = async (sourceId) => {
    const r = await fetch(`${API_ADMIN}/sources/${sourceId}/approve`, { method: 'PATCH' })
    if (r.ok) fetchSources()
  }

  const handleRegisterSource = async () => {
    const body = {
      ...sourceForm,
      allowed_topics: sourceForm.allowed_topics.split(',').map(t => t.trim()).filter(Boolean),
    }
    const r = await fetch(`${API_ADMIN}/sources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await r.json()
    if (r.ok) { fetchSources(); setShowSourceForm(false) }
    else alert(data.detail)
  }

  const loadVersions = async (schemeId) => {
    const r = await fetch(`${API_ADMIN}/scraper/schemes/${schemeId}/versions`)
    if (r.ok) {
      const versions = await r.json()
      setSchemeVersions(prev => ({ ...prev, [schemeId]: versions }))
    }
  }

  const tabs = [
    { id: 'scraper', label: 'Firecrawl Pipeline' },
    { id: 'schemes', label: `Scheme Registry${schemes.length ? ` (${schemes.length})` : ''}` },
    { id: 'sources', label: 'Source Registry' },
    { id: 'changes', label: `Pending Changes${changes.length ? ` (${changes.length})` : ''}` },
    { id: 'audit-logs', label: 'Audit Trail' },
  ]

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-xs font-bold mb-1 border border-amber-500/30">
            <Lock size={13} />
            <span>Ministry Administration Portal</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">SchemeSetu Governance & Ingestion</h1>
          <p className="text-xs text-slate-300">
            Firecrawl pipeline · Approved Source Registry · Versioned scheme rules · Audit trail
          </p>
        </div>
        <button
          onClick={() => { setAdminTab('scraper'); handleTriggerScraper() }}
          disabled={scraperRunning}
          className="shrink-0 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
        >
          <RefreshCw size={15} className={scraperRunning ? 'animate-spin' : ''} />
          <span>{scraperRunning ? 'Scraper Running...' : 'Run Firecrawl Pipeline'}</span>
        </button>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl p-2 shadow-xs flex flex-wrap items-center gap-1 text-xs font-bold text-slate-700">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setAdminTab(tab.id)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              adminTab === tab.id ? 'bg-slate-900 text-white font-black' : 'hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Firecrawl Pipeline ───────────────────────────────────────────── */}
      {adminTab === 'scraper' && (
        <div className="space-y-6">

          {/* Pipeline Architecture */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3">
              Automated Government Ingestion Pipeline
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center text-xs">
              {[
                { step: '1', title: 'Gov Source', sub: '.gov.in / .nic.in' },
                { step: '2', title: 'Domain Check', sub: 'Layer 1 whitelist' },
                { step: '3', title: 'Source Registry', sub: 'Authority check' },
                { step: '4', title: 'Firecrawl', sub: '→ httpx fallback' },
                { step: '5', title: 'PDF Routing', sub: 'text/scanned OCR' },
                { step: '6', title: 'Gemini Extract', sub: 'Evidence-backed' },
                { step: '7', title: 'Admin Review', sub: 'Manual signoff' },
                { step: '8', title: 'Versioned Rules', sub: 'Rule v2026.x' },
              ].map(node => (
                <div key={node.step} className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold mx-auto flex items-center justify-center">
                    {node.step}
                  </span>
                  <p className="font-bold text-slate-900 text-[11px]">{node.title}</p>
                  <p className="text-[10px] text-slate-500">{node.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Trigger Form */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Trigger Scrape Job</h3>
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-600 font-bold">Government Source URL</label>
                <input
                  type="text"
                  value={scrapeUrl}
                  onChange={e => setScrapeUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 font-mono font-bold text-slate-900"
                  placeholder="https://nsfdc.nic.in/..."
                />
              </div>
              {scrapeError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 flex items-start gap-2">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  <span>{scrapeError}</span>
                </div>
              )}
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900">
                <strong>Anti-hallucination rule:</strong> Only values explicitly stated in the source text are extracted. 
                Every extracted value carries source evidence. Candidate rules require admin approval before becoming active eligibility rules.
              </div>
              <button
                onClick={handleTriggerScraper}
                disabled={scraperRunning}
                className="px-5 py-2.5 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {scraperRunning ? `Running Job ${activeJobId?.slice(0, 8)}...` : 'Start Firecrawl Ingestion'}
              </button>
            </div>
          </div>

          {/* Job List */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Scrape Jobs</h3>
              <button onClick={fetchJobs} className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1">
                <RefreshCw size={12} /> Refresh
              </button>
            </div>
            {jobs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No jobs yet. Trigger a scrape above.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                      <th className="p-2 text-left">Job ID</th>
                      <th className="p-2 text-left">URL</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-left">Method</th>
                      <th className="p-2 text-left">Schemes</th>
                      <th className="p-2 text-left">PDFs</th>
                      <th className="p-2 text-left">Started</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {jobs.map(job => (
                      <tr key={job.job_id} className="hover:bg-slate-50">
                        <td className="p-2 font-mono text-[10px] text-slate-500">{job.job_id?.slice(0, 8)}…</td>
                        <td className="p-2 max-w-[200px] truncate text-slate-700 font-medium">
                          <a href={job.url} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                            {job.url?.replace('https://', '')} <ExternalLink size={10} />
                          </a>
                        </td>
                        <td className="p-2"><StatusBadge status={job.status} /></td>
                        <td className="p-2"><ExtractionBadge method={job.extraction_method} /></td>
                        <td className="p-2 font-bold text-slate-800">{job.schemes_found ?? 0}</td>
                        <td className="p-2 text-slate-600">{job.pdfs_processed ?? 0}</td>
                        <td className="p-2 font-mono text-[10px] text-slate-400">
                          {job.started_at ? new Date(job.started_at).toLocaleTimeString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab: Scheme Registry ──────────────────────────────────────────────── */}
      {adminTab === 'schemes' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-base font-bold text-slate-900">Scraped Scheme Candidates ({schemes.length})</h3>
            <button onClick={fetchSchemes} className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1">
              <RefreshCw size={12} /> Refresh
            </button>
          </div>
          {schemes.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No schemes scraped yet. Run a Firecrawl job first.</p>
          ) : (
            <div className="space-y-3">
              {schemes.map(scheme => (
                <div key={scheme.scheme_id} className="border border-slate-200 rounded-lg overflow-hidden">
                  <div
                    className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50"
                    onClick={() => setExpandedScheme(expandedScheme === scheme.scheme_id ? null : scheme.scheme_id)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {expandedScheme === scheme.scheme_id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate">{scheme.name || '(Unnamed scheme)'}</p>
                        <p className="text-xs text-slate-500 truncate">{scheme.ministry || scheme.source_authority}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <ExtractionBadge method={scheme.extraction_method} />
                      <span className="text-[10px] text-slate-400 font-mono">v{scheme.version}</span>
                      <StatusBadge status={scheme.status} />
                      {scheme.status !== 'published' && scheme.status !== 'rejected' && (
                        <>
                          <button
                            onClick={e => { e.stopPropagation(); handlePublish(scheme.scheme_id) }}
                            className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-200"
                          >
                            Approve
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); handleReject(scheme.scheme_id) }}
                            className="px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[11px] border border-red-200"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={e => { e.stopPropagation(); loadVersions(scheme.scheme_id) }}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] border border-slate-200 flex items-center gap-1"
                      >
                        <History size={11} /> Versions
                      </button>
                    </div>
                  </div>

                  {expandedScheme === scheme.scheme_id && (
                    <div className="border-t border-slate-200 p-4 bg-slate-50 space-y-3 text-xs">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div><span className="text-slate-500 font-bold">Source</span><br />
                          <a href={scheme.source_url} target="_blank" rel="noreferrer" className="text-indigo-700 hover:underline font-mono text-[10px]">
                            {scheme.source_url?.replace('https://', '')}
                          </a>
                        </div>
                        <div><span className="text-slate-500 font-bold">Rules Extracted</span><br />
                          <span className="font-bold text-slate-800">{scheme.candidate_rules_count}</span>
                          <span className="text-slate-400 ml-1">(candidate)</span>
                        </div>
                        <div><span className="text-slate-500 font-bold">Conflicts</span><br />
                          <span className={scheme.has_conflicts ? 'text-orange-700 font-bold' : 'text-slate-400'}>
                            {scheme.has_conflicts ? '⚠ Has conflicts' : 'None'}
                          </span>
                        </div>
                        <div><span className="text-slate-500 font-bold">Scraped</span><br />
                          <span className="font-mono text-[10px]">{scheme.scraped_at ? new Date(scheme.scraped_at).toLocaleDateString() : '—'}</span>
                        </div>
                      </div>
                      {scheme.validation_warnings?.length > 0 && (
                        <div className="p-3 rounded bg-amber-50 border border-amber-200 text-amber-800">
                          <strong>Warnings:</strong> {scheme.validation_warnings.join(' · ')}
                        </div>
                      )}
                      {scheme.validation_errors?.length > 0 && (
                        <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700">
                          <strong>Errors:</strong> {scheme.validation_errors.join(' · ')}
                        </div>
                      )}
                      {schemeVersions[scheme.scheme_id] && (
                        <div className="space-y-1">
                          <p className="font-bold text-slate-700">Version History</p>
                          {schemeVersions[scheme.scheme_id].map(v => (
                            <div key={v.version_id} className="flex items-center gap-3 text-[11px] font-mono text-slate-600">
                              <span className="font-bold">v{v.version}</span>
                              <span>Published {new Date(v.published_at).toLocaleDateString()}</span>
                              {v.published_by && <span>by {v.published_by}</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Source Registry ──────────────────────────────────────────────── */}
      {adminTab === 'sources' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Approved Source Registry</h3>
              <p className="text-xs text-slate-500 mt-0.5">Domains must be registered AND approved before scraping is permitted.</p>
            </div>
            <button
              onClick={() => setShowSourceForm(!showSourceForm)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center gap-1"
            >
              <Plus size={13} /> Register Source
            </button>
          </div>

          {showSourceForm && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3 text-xs">
              <h4 className="font-bold text-slate-800">Register New Government Source</h4>
              {[
                { key: 'domain', label: 'Hostname (e.g. nsfdc.nic.in)', ph: 'nsfdc.nic.in' },
                { key: 'authority', label: 'Authority (e.g. NSFDC)', ph: 'NSFDC' },
                { key: 'display_name', label: 'Display Name', ph: 'National SC Finance & Dev Corp' },
                { key: 'base_url', label: 'Base URL', ph: 'https://nsfdc.nic.in' },
                { key: 'allowed_topics', label: 'Allowed Topics (comma-separated)', ph: 'credit schemes, education loans' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-slate-600 font-bold">{f.label}</label>
                  <input
                    type="text"
                    value={sourceForm[f.key]}
                    onChange={e => setSourceForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 mt-0.5"
                    placeholder={f.ph}
                  />
                </div>
              ))}
              <div className="flex gap-2">
                <button onClick={handleRegisterSource} className="px-4 py-1.5 rounded bg-slate-900 text-white font-bold text-xs">Register</button>
                <button onClick={() => setShowSourceForm(false)} className="px-4 py-1.5 rounded bg-slate-100 text-slate-700 font-bold text-xs">Cancel</button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sources.length === 0 ? (
              <p className="text-xs text-slate-400 col-span-2 text-center py-6">No sources registered. Add one above.</p>
            ) : sources.map(src => (
              <div key={src.source_id} className="p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{src.source_type}</span>
                    <h4 className="font-bold text-slate-900">{src.display_name}</h4>
                    <p className="font-mono text-slate-500">{src.domain}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${src.approved ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                      {src.approved ? '✓ Approved' : 'Pending Approval'}
                    </span>
                    {!src.approved && (
                      <button
                        onClick={() => handleApproveSource(src.source_id)}
                        className="px-2 py-0.5 rounded bg-slate-900 text-white text-[10px] font-bold"
                      >
                        Approve
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 font-bold">Authority:</span> {src.authority}
                </div>
                {src.allowed_topics?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {src.allowed_topics.map(t => (
                      <span key={t} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">{t}</span>
                    ))}
                  </div>
                )}
                <div className="text-slate-400 font-mono">Priority: {src.priority}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab: Pending Changes ──────────────────────────────────────────────── */}
      {adminTab === 'changes' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-base font-bold text-slate-900">Pending Field Changes ({changes.length})</h3>
            <button onClick={fetchChanges} className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1">
              <RefreshCw size={12} /> Refresh
            </button>
          </div>
          {changes.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No pending changes requiring review.</p>
          ) : changes.map(change => (
            <div key={change.change_id} className="border border-slate-200 rounded-lg p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-700">Scheme: {change.scheme_id}</span>
                <span className="text-slate-400">{change.old_version} → {change.new_version}</span>
              </div>
              {change.changes?.map((fc, i) => (
                <div key={i} className="p-3 bg-amber-50 border border-amber-200 rounded space-y-1">
                  <p className="font-bold text-amber-900">{fc.field}</p>
                  <div className="flex gap-4">
                    <span className="text-red-700">OLD: {String(fc.old_value)}</span>
                    <span className="text-emerald-700">NEW: {String(fc.new_value)}</span>
                  </div>
                </div>
              ))}
              {change.conflicts?.length > 0 && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                  <p className="font-bold text-orange-800">⚠ {change.conflicts.length} conflict(s) — admin must resolve</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Tab: Audit Trail ─────────────────────────────────────────────────── */}
      {adminTab === 'audit-logs' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-base font-bold text-slate-900">System Audit Trail</h3>
            <button onClick={fetchAuditLogs} className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1">
              <RefreshCw size={12} /> Refresh
            </button>
          </div>
          {auditLogs.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No audit events yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Actor</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Target</th>
                    <th className="p-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {auditLogs.map(log => (
                    <tr key={log.log_id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-[10px] text-slate-500">
                        {log.created_at ? new Date(log.created_at).toLocaleString() : '—'}
                      </td>
                      <td className="p-3 font-bold text-indigo-900">{log.actor}</td>
                      <td className="p-3 font-mono font-semibold text-slate-700">{log.action}</td>
                      <td className="p-3 text-slate-600 font-mono text-[10px]">{log.target_id?.slice(0, 12)}…</td>
                      <td className="p-3 text-slate-500 max-w-xs truncate">
                        {log.details?.url || log.details?.scheme_name || log.details?.domain || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  )
}

