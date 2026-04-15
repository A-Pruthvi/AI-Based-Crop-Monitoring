import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import predictionService from '../services/predictionService';
import { Loader, Alert } from '../components/ui';
import { useToast } from '../context/ToastContext';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

/* ─── Constants ─── */
const SEVERITY_STYLES = {
  CRITICAL: 'bg-red-100 text-red-800 border-red-200',
  HIGH:     'bg-orange-100 text-orange-800 border-orange-200',
  MEDIUM:   'bg-yellow-100 text-yellow-800 border-yellow-200',
  LOW:      'bg-green-100 text-green-800 border-green-200',
};
const sev = (s) => SEVERITY_STYLES[(s ?? '').toUpperCase()] ?? 'bg-slate-100 text-slate-600 border-slate-200';

const TIME_RANGES = [
  { key: '7d',  label: 'Last 7 Days' },
  { key: '30d', label: 'Last 30 Days' },
  { key: '90d', label: 'Last 90 Days' },
  { key: 'all', label: 'All Time' },
];

/* ─── Helpers ─── */
const daysBetween = (a, b) => Math.round((b - a) / (1000 * 60 * 60 * 24));

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatShortDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const csvEscape = (v) => {
  if (v == null) return '';
  const s = String(v);
  return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
};

/* ═══════════════════════════════════════════════════════════════ */
const HistoryDashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [timeRange, setTimeRange]     = useState('all');
  const [cropFilter, setCropFilter]   = useState('');
  const [sevFilter, setSevFilter]     = useState('');
  const [locFilter, setLocFilter]     = useState('');
  const [expandedId, setExpandedId]   = useState(null);

  /* ── Fetch data ── */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await predictionService.getAllUserPredictions();
        const list = res.success ? (res.data ?? []) : [];
        setPredictions(list);
      } catch (e) {
        setError(e.message || 'Failed to load history');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ── Derived filter options ── */
  const crops = useMemo(() => [...new Set(predictions.map(p => p.cropType).filter(Boolean))], [predictions]);
  const locations = useMemo(() => [...new Set(predictions.map(p => p.fieldLocation).filter(Boolean))], [predictions]);
  const severities = useMemo(() => [...new Set(predictions.map(p => p.severity).filter(Boolean))], [predictions]);

  /* ── Filtered list ── */
  const filtered = useMemo(() => {
    const now = new Date();
    return predictions.filter(p => {
      // Time range
      if (timeRange !== 'all' && p.createdAt) {
        const d = new Date(p.createdAt);
        const days = { '7d': 7, '30d': 30, '90d': 90 }[timeRange] ?? 9999;
        if (daysBetween(d, now) > days) return false;
      }
      if (cropFilter && p.cropType !== cropFilter) return false;
      if (sevFilter && p.severity !== sevFilter) return false;
      if (locFilter && p.fieldLocation !== locFilter) return false;
      return true;
    });
  }, [predictions, timeRange, cropFilter, sevFilter, locFilter]);

  /* ── Health-score trend chart data ── */
  const trendData = useMemo(() => {
    const withScore = filtered
      .filter(p => p.plantHealthScore != null && p.createdAt)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return withScore.map(p => ({
      date: formatShortDate(p.createdAt),
      score: p.plantHealthScore,
    }));
  }, [filtered]);

  /* ── Stats ── */
  const stats = useMemo(() => {
    const total = filtered.length;
    const healthy = filtered.filter(p => p.isHealthy).length;
    const diseased = total - healthy;
    const scores = filtered.map(p => p.plantHealthScore).filter(s => s != null);
    const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
    return { total, healthy, diseased, avgScore };
  }, [filtered]);

  /* ── CSV Export ── */
  const handleExport = () => {
    if (filtered.length === 0) { toast.info('No data to export'); return; }
    const cols = ['Date', 'Crop', 'Disease', 'Confidence', 'Severity', 'Health Score', 'Location', 'Treatment', 'Cause', 'Prevention'];
    const rows = filtered.map(p => [
      formatDate(p.createdAt),
      p.cropType || p.detectedCrop || '',
      p.disease || p.diseaseName || '',
      p.confidence != null ? `${(p.confidence * 100).toFixed(1)}%` : '',
      p.severity || '',
      p.plantHealthScore ?? '',
      p.fieldLocation || '',
      Array.isArray(p.treatments) ? p.treatments.join('; ') : '',
      p.cause || '',
      p.prevention || '',
    ]);
    const csv = [cols.join(','), ...rows.map(r => r.map(csvEscape).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crop-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('History exported as CSV');
  };

  /* ── Loading / Error states ── */
  if (loading) return (
    <div className="p-8 flex justify-center">
      <Loader variant="spinner" size="lg" text="Loading decision history..." />
    </div>
  );
  if (error) return (
    <div className="p-8">
      <Alert variant="error" title="Error" message={error} />
    </div>
  );

  /* ── JSX ── */
  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800">Decision Tracking</h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">Track and review all crop analysis decisions over time</p>
        </div>
        <button onClick={handleExport} className="btn-primary flex items-center gap-2 text-sm py-2.5 px-5 w-full sm:w-auto">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { label: 'Total Scans', value: stats.total, icon: '📊', color: 'from-blue-500 to-blue-600' },
          { label: 'Healthy',     value: stats.healthy, icon: '✅', color: 'from-green-500 to-green-600' },
          { label: 'Diseased',    value: stats.diseased, icon: '⚠️', color: 'from-red-500 to-red-600' },
          { label: 'Avg Health',  value: stats.avgScore != null ? `${stats.avgScore}/100` : '—', icon: '💚', color: 'from-emerald-500 to-emerald-600' },
        ].map(s => (
          <div key={s.label} className="card relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${s.color} opacity-10 rounded-bl-3xl`} />
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{s.label}</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{s.value}</p>
            <span className="text-lg absolute top-3 right-3">{s.icon}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap items-center gap-3">
          {/* Time Range */}
          <div className="flex rounded-xl overflow-hidden border border-slate-200">
            {TIME_RANGES.map(t => (
              <button
                key={t.key}
                onClick={() => setTimeRange(t.key)}
                className={`px-3 py-2 text-xs font-semibold transition-all ${timeRange === t.key ? 'bg-green-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Dropdowns */}
          <select value={cropFilter} onChange={e => setCropFilter(e.target.value)} className="input-field text-sm py-2 w-auto min-w-[130px]">
            <option value="">All Crops</option>
            {crops.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={sevFilter} onChange={e => setSevFilter(e.target.value)} className="input-field text-sm py-2 w-auto min-w-[130px]">
            <option value="">All Severities</option>
            {severities.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {locations.length > 0 && (
            <select value={locFilter} onChange={e => setLocFilter(e.target.value)} className="input-field text-sm py-2 w-auto min-w-[130px]">
              <option value="">All Locations</option>
              {locations.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Health Score Trend Chart */}
      {trendData.length >= 2 && (
        <div className="card mb-6">
          <h3 className="text-base font-semibold text-slate-800 mb-4">Plant Health Score Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
              <Area type="monotone" dataKey="score" stroke="#22c55e" strokeWidth={2} fill="url(#healthGrad)" name="Health Score" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Timeline */}
      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-slate-600 mb-2">No History Found</h3>
          <p className="text-sm text-slate-400">No scan records match your current filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-slate-800">
            Timeline <span className="text-sm font-normal text-slate-400">({filtered.length} records)</span>
          </h3>

          {/* Timeline connector */}
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200" />

            {filtered.map((p, idx) => {
              const isExpanded = expandedId === p.id;
              const confidence = p.confidence != null ? (p.confidence > 1 ? p.confidence : p.confidence * 100) : null;
              return (
                <div key={p.id || idx} className="relative pl-12 pb-6">
                  {/* Timeline dot */}
                  <div className={`absolute left-3.5 w-3 h-3 rounded-full border-2 ${p.isHealthy ? 'bg-green-400 border-green-500' : 'bg-red-400 border-red-500'}`} style={{ top: '18px' }} />

                  {/* Card */}
                  <div
                    className="card cursor-pointer hover:shadow-lg transition-shadow border-l-4"
                    style={{ borderLeftColor: p.isHealthy ? '#22c55e' : '#ef4444' }}
                    onClick={() => setExpandedId(isExpanded ? null : p.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="text-base font-bold text-slate-800 truncate">
                            {p.disease || p.diseaseName || 'Unknown'}
                          </h4>
                          {p.severity && (
                            <span className={`inline-flex text-xs font-bold px-2.5 py-0.5 rounded-full border ${sev(p.severity)}`}>
                              {p.severity}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span>{formatDate(p.createdAt)}</span>
                          {(p.cropType || p.detectedCrop) && (
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                              {p.cropType || p.detectedCrop}
                            </span>
                          )}
                          {p.fieldLocation && (
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              {p.fieldLocation}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        {confidence != null && (
                          <span className="text-sm font-bold text-slate-700">{confidence.toFixed(0)}%</span>
                        )}
                        {p.plantHealthScore != null && (
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.plantHealthScore >= 60 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            Health: {p.plantHealthScore}
                          </span>
                        )}
                        <svg className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 animate-fade-in">
                        {/* Treatments */}
                        {Array.isArray(p.treatments) && p.treatments.length > 0 && !p.isHealthy && (
                          <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Treatment Recommendations</p>
                            <ul className="space-y-1">
                              {p.treatments.map((t, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                  <span className="w-5 h-5 bg-green-100 text-green-700 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                                  {t}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {/* Cause & Prevention */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {p.cause && (
                            <div className="bg-red-50 rounded-xl p-3 border border-red-100">
                              <p className="text-xs font-bold text-red-700 mb-1">Cause</p>
                              <p className="text-sm text-red-600">{p.cause}</p>
                            </div>
                          )}
                          {p.prevention && (
                            <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                              <p className="text-xs font-bold text-blue-700 mb-1">Prevention</p>
                              <p className="text-sm text-blue-600">{p.prevention}</p>
                            </div>
                          )}
                        </div>
                        {/* Notes */}
                        {p.notes && (
                          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                            <p className="text-xs font-bold text-slate-500 mb-1">Notes</p>
                            <p className="text-sm text-slate-600">{p.notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryDashboard;
