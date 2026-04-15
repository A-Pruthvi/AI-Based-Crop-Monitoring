import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import predictionService from '../services/predictionService';
import adminService from '../services/adminService';
import { getDiseaseColor } from '../utils/helpers';

/* ─── colours ─── */
const DISEASE_COLORS = {
  Healthy:           '#22c55e',
  'Bacterial Blight':'#ef4444',
  'Leaf Rust':       '#f97316',
  'Brown Spot':      '#eab308',
  Tungro:            '#a855f7',
  Hispa:             '#3b82f6',
  'Leaf Smut':       '#ec4899',
  Unknown:           '#94a3b8',
};
const colorOf = (name) => DISEASE_COLORS[name] ?? getDiseaseColor?.(name) ?? '#64748b';

/* ─── Tooltip ─── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-sm">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-600">{p.name}:</span>
          <span className="font-bold text-slate-800">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

/* ─── generate 30-day timeline from predictions ─── */
const buildTimeline = (predictions = [], days = 30) => {
  const result = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const label    = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dateStr  = d.toDateString();
    const dayPreds = predictions.filter((p) => p.createdAt && new Date(p.createdAt).toDateString() === dateStr);
    result.push({
      date:     label,
      total:    dayPreds.length,
      healthy:  dayPreds.filter((p) => p.isHealthy || p.diseaseName === 'Healthy').length,
      diseased: dayPreds.filter((p) => !p.isHealthy && p.diseaseName !== 'Healthy').length,
    });
  }
  return result;
};

/* ── metric card ── */
const MetricCard = ({ label, value, sub, icon, color, delta }) => (
  <div className="card-hover group">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${color}`}>
        {icon}
      </div>
      {delta != null && (
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${delta >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {delta >= 0 ? '+' : ''}{delta}%
        </span>
      )}
    </div>
    <p className="text-2xl font-bold text-slate-800 tabular-nums">{value}</p>
    <p className="text-sm font-medium text-slate-700 mt-0.5">{label}</p>
    {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
  </div>
);

/* ═══════════════════════════════════════════════════════════════ */
const Analytics = () => {
  const [loading,         setLoading]         = useState(true);
  const [timeRange,       setTimeRange]       = useState('30');
  const [stats,           setStats]           = useState({ total: 0, healthy: 0, diseased: 0, avgConfidence: 0 });
  const [timeline,        setTimeline]        = useState([]);
  const [distribution,    setDistribution]    = useState([]);
  const [severityData,    setSeverityData]    = useState([]);
  const [topDiseases,     setTopDiseases]     = useState([]);
  const [confidenceDist,  setConfidenceDist]  = useState([]);

  useEffect(() => { fetchData(); }, [timeRange]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch more predictions to build analytics — 100 records
      const [predsRes, distRes] = await Promise.allSettled([
        predictionService.getUserPredictions(0, 100),
        predictionService.getDiseaseDistribution(),
      ]);

      let allPredictions = [];

      if (predsRes.status === 'fulfilled' && predsRes.value?.success) {
        const pageData = predsRes.value.data;
        allPredictions = (pageData.content ?? pageData ?? []);
      }

      // Filter by time range
      const cutoff    = new Date();
      cutoff.setDate(cutoff.getDate() - Number(timeRange));
      const filtered  = allPredictions.filter(
        (p) => !p.createdAt || new Date(p.createdAt) >= cutoff
      );

      // Stats
      const healthy   = filtered.filter((p) => p.isHealthy || p.diseaseName === 'Healthy');
      const diseased  = filtered.filter((p) => !p.isHealthy && p.diseaseName !== 'Healthy');
      const totalConf = filtered.reduce((s, p) => s + (Number(p.confidenceScore) || 0), 0);
      const avgConf   = filtered.length
        ? ((totalConf / filtered.length) > 1
            ? (totalConf / filtered.length)
            : (totalConf / filtered.length) * 100)
        : 0;

      setStats({
        total:         filtered.length,
        healthy:       healthy.length,
        diseased:      diseased.length,
        avgConfidence: avgConf.toFixed(1),
      });

      // Timeline
      setTimeline(buildTimeline(filtered, Number(timeRange)));

      // Disease distribution
      if (distRes.status === 'fulfilled' && distRes.value?.success) {
        const dist = distRes.value.data ?? [];
        setDistribution(
          dist.map((d) => ({ name: d.disease ?? 'Unknown', value: Number(d.count) || 0, color: colorOf(d.disease) }))
        );

        // Top diseases (bar chart)
        setTopDiseases(
          [...dist]
            .sort((a, b) => b.count - a.count)
            .slice(0, 6)
            .map((d) => ({ name: d.disease ?? 'Unknown', count: Number(d.count) || 0, color: colorOf(d.disease) }))
        );
      }

      // Severity breakdown from filtered predictions
      const sevCounts = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
      filtered.forEach((p) => {
        const s = (p.severity ?? '').toUpperCase();
        if (s in sevCounts) sevCounts[s] += 1;
      });
      setSeverityData([
        { name: 'Low',      value: sevCounts.LOW,      color: '#22c55e' },
        { name: 'Medium',   value: sevCounts.MEDIUM,   color: '#eab308' },
        { name: 'High',     value: sevCounts.HIGH,     color: '#f97316' },
        { name: 'Critical', value: sevCounts.CRITICAL, color: '#ef4444' },
      ].filter((s) => s.value > 0));

      // Confidence distribution buckets
      const buckets = { '0-50': 0, '50-70': 0, '70-85': 0, '85-95': 0, '95-100': 0 };
      filtered.forEach((p) => {
        const raw = Number(p.confidenceScore) || 0;
        const pct = raw > 1 ? raw : raw * 100;
        if      (pct < 50)  buckets['0-50']++;
        else if (pct < 70)  buckets['50-70']++;
        else if (pct < 85)  buckets['70-85']++;
        else if (pct < 95)  buckets['85-95']++;
        else                buckets['95-100']++;
      });
      setConfidenceDist(
        Object.entries(buckets).map(([range, count]) => ({ range, count }))
      );

    } catch (err) {
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  /* ── Health rate ── */
  const healthRate = stats.total > 0 ? ((stats.healthy / stats.total) * 100).toFixed(0) : 0;

  /* ── Skeleton ── */
  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="card h-28 bg-slate-100" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="card h-64 bg-slate-100" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 animate-fade-in space-y-8">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Analytics</h1>
          <p className="text-slate-500 mt-1">Crop health trends and disease insights</p>
        </div>
        <div className="flex gap-2">
          {[
            { label: '7d',  value: '7'  },
            { label: '30d', value: '30' },
            { label: '90d', value: '90' },
          ].map((r) => (
            <button
              key={r.value}
              onClick={() => setTimeRange(r.value)}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                timeRange === r.value
                  ? 'bg-green-500 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Metric cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <MetricCard
          label="Total Scans" value={stats.total} sub={`Last ${timeRange} days`}
          color="bg-blue-100"
          icon={<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
        />
        <MetricCard
          label="Health Rate" value={`${healthRate}%`} sub="Healthy crops"
          color="bg-green-100"
          icon={<svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <MetricCard
          label="Diseased" value={stats.diseased} sub="Requiring treatment"
          color="bg-orange-100"
          icon={<svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
        />
        <MetricCard
          label="Avg Confidence" value={`${stats.avgConfidence}%`} sub="AI accuracy"
          color="bg-purple-100"
          icon={<svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
        />
      </div>

      {/* ── Charts row 1 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Scan trend over time */}
        <div className="lg:col-span-2 card">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Scan Activity ({timeRange} days)</h3>
          <div className="h-64">
            {timeline.some((d) => d.total > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gH" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gD" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false}
                    interval={timeRange === '7' ? 0 : Math.floor(Number(timeRange) / 7)}
                  />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend formatter={(v) => <span className="text-xs text-slate-500 capitalize">{v}</span>} iconType="circle" iconSize={8} />
                  <Area type="monotone" dataKey="healthy" stroke="#22c55e" strokeWidth={2} fill="url(#gH)" dot={false} />
                  <Area type="monotone" dataKey="diseased" stroke="#ef4444" strokeWidth={2} fill="url(#gD)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="Upload crop images to see activity trends" />
            )}
          </div>
        </div>

        {/* Severity breakdown */}
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Severity Breakdown</h3>
          {severityData.length > 0 ? (
            <>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={severityData} cx="50%" cy="50%" innerRadius={42} outerRadius={65} paddingAngle={3} dataKey="value" strokeWidth={0}>
                      {severityData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 space-y-2">
                {severityData.map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                      <span className="text-slate-600">{s.name}</span>
                    </div>
                    <span className="font-semibold text-slate-800 tabular-nums">{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyChart message="No severity data yet" />
          )}
        </div>
      </div>

      {/* ── Charts row 2 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top diseases bar chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Top Diseases Detected</h3>
          <div className="h-56">
            {topDiseases.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topDiseases} margin={{ top: 0, right: 5, left: -20, bottom: 0 }} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false}
                    tickFormatter={(v) => v.length > 10 ? v.slice(0, 10) + '…' : v} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {topDiseases.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="No disease data yet" />
            )}
          </div>
        </div>

        {/* Confidence distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Confidence Distribution</h3>
          <div className="h-56">
            {confidenceDist.some((d) => d.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={confidenceDist} margin={{ top: 0, right: 5, left: -20, bottom: 0 }} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="range" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {confidenceDist.map((_, i) => (
                      <Cell key={i} fill={['#ef4444','#f97316','#eab308','#22c55e','#16a34a'][i] ?? '#64748b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="No confidence data yet" />
            )}
          </div>
          <p className="text-xs text-slate-400 mt-2">Higher confidence = more accurate AI detection</p>
        </div>
      </div>

      {/* ── Disease distribution full row ── */}
      {distribution.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">All-Time Disease Distribution</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={distribution} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                    paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {distribution.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {distribution.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{item.name}</p>
                    <p className="text-xs text-slate-400 tabular-nums">{item.value} scans</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Empty chart placeholder ─── */
const EmptyChart = ({ message }) => (
  <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-3">
    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
    <p className="text-sm text-slate-400">{message}</p>
  </div>
);

export default Analytics;
