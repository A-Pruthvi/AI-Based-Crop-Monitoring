import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart, Pie, Cell, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import useAuth from '../hooks/useAuth';
import predictionService, { mapPrediction } from '../services/predictionService';
import { formatDate, getDiseaseColor } from '../utils/helpers';
import { Loader, Alert } from '../components/ui';

/* ─── Colour palette used across charts ─── */
const DISEASE_COLORS = {
  Healthy: '#22c55e',
  'Bacterial Blight': '#ef4444',
  'Leaf Rust': '#f97316',
  'Brown Spot': '#eab308',
  Tungro: '#a855f7',
  Hispa: '#3b82f6',
  'Leaf Smut': '#ec4899',
  Unknown: '#94a3b8',
};
const colorOf = (name) => DISEASE_COLORS[name] ?? getDiseaseColor?.(name) ?? '#64748b';

/* ─── Build weekly trend from prediction list ─── */
const buildWeeklyData = (predictions = []) => {
  const today = new Date();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const buckets = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return { name: days[d.getDay()], date: d.toDateString(), predictions: 0 };
  });

  predictions.forEach((p) => {
    const pDate = p.createdAt ? new Date(p.createdAt).toDateString() : null;
    const bucket = buckets.find((b) => b.date === pDate);
    if (bucket) {
      bucket.predictions += 1;
    }
  });

  return buckets.map(({ name, predictions }) => ({ name, predictions }));
};

/* ─── Build disease frequency data for bar chart ─── */
const buildDiseaseFrequency = (distribution = []) => {
  return distribution
    .filter(d => d.name !== 'Healthy')
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)
    .map(d => ({
      name: d.name.length > 15 ? d.name.substring(0, 15) + '...' : d.name,
      cases: d.value,
      fill: d.color,
    }));
};

/* ─── Custom tooltip ─── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3">
      <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-sm">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-600 capitalize">{p.name}:</span>
          <span className="font-bold text-slate-800">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════ */
const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalScans: 0, healthyCount: 0, diseasedCount: 0, activeAlerts: 0 });
  const [recentPredictions, setRecentPredictions] = useState([]);
  const [diseaseDistribution, setDiseaseDistribution] = useState([]);
  const [diseaseFrequency, setDiseaseFrequency] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsRes, distributionRes, recentRes] = await Promise.allSettled([
        predictionService.getPredictionStats(),
        predictionService.getDiseaseDistribution(),
        predictionService.getRecentPredictions(20), // fetch more for chart
      ]);

      // ── Stats ──
      if (statsRes.status === 'fulfilled' && statsRes.value?.success) {
        const s = statsRes.value.data;
        setStats({
          totalScans:    s.totalScans       ?? 0,
          healthyCount:  s.healthyCount     ?? 0,
          diseasedCount: s.diseasedCount    ?? 0,
          activeAlerts:  s.alertsCount      ?? 0,
        });
      }

      // ── Disease distribution ──
      if (distributionRes.status === 'fulfilled' && distributionRes.value?.success) {
        const dist = distributionRes.value.data ?? [];
        const distributionData = dist.map((item) => ({
          name:  item.disease ?? 'Unknown',
          value: Number(item.count) || 0,
          color: colorOf(item.disease),
        }));
        setDiseaseDistribution(distributionData);
        setDiseaseFrequency(buildDiseaseFrequency(distributionData));
      }

      // ── Recent predictions + weekly chart ──
      if (recentRes.status === 'fulfilled' && recentRes.value?.success) {
        const raw    = recentRes.value.data ?? [];
        const mapped = raw.map(mapPrediction);
        setRecentPredictions(mapped.slice(0, 5));
        setWeeklyData(buildWeeklyData(mapped));
      }

    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.message || 'Failed to load dashboard data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Enhanced Stat Card ── */
  const StatCard = ({ icon, title, value, subtitle, bgColor, iconColor, trend }) => (
    <div className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-slate-200">
      {/* Background Gradient Effect */}
      <div className={`absolute top-0 right-0 w-32 h-32 ${bgColor} opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity duration-300`} />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-14 h-14 rounded-2xl ${bgColor} flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
            {icon}
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
              trend >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              <svg className={`w-3.5 h-3.5 ${trend < 0 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{title}</p>
          <h3 className="text-4xl font-bold text-slate-800 tabular-nums">{value.toLocaleString()}</h3>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
      </div>
    </div>
  );

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="p-6 lg:p-8 min-h-screen flex items-center justify-center">
        <Loader 
          variant="spinner" 
          size="lg" 
          text="Loading dashboard data..."
        />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 animate-fade-in space-y-6 lg:space-y-8 bg-slate-50 min-h-screen">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-1 sm:mb-2">
            Dashboard Overview
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Welcome back, <span className="font-semibold text-green-600">{user?.name?.split(' ')[0] || 'Farmer'}</span>! 
            Here's your crop health summary
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="font-medium">Refresh</span>
        </button>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <Alert 
          variant="error" 
          title="Failed to load data"
          message={error}
          dismissible
          onClose={() => setError(null)}
        >
          <button 
            onClick={fetchDashboardData} 
            className="ml-auto text-red-700 font-semibold hover:text-red-800 underline"
          >
            Retry
          </button>
        </Alert>
      )}

      {/* ── Statistics Cards ── */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <StatCard
          icon={
            <svg className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          title="Total Predictions"
          value={stats.totalScans}
          subtitle="Images analyzed"
          bgColor="bg-blue-500"
          iconColor="text-blue-600"
          trend={12}
        />
        <StatCard
          icon={
            <svg className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          title="Healthy Crops"
          value={stats.healthyCount}
          subtitle="No issues detected"
          bgColor="bg-green-500"
          iconColor="text-green-600"
          trend={8}
        />
        <StatCard
          icon={
            <svg className="w-6 h-6 sm:w-7 sm:h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
          title="Diseased Crops"
          value={stats.diseasedCount}
          subtitle="Require attention"
          bgColor="bg-orange-500"
          iconColor="text-orange-600"
          trend={-5}
        />
        <StatCard
          icon={
            <svg className="w-6 h-6 sm:w-7 sm:h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          title="Critical Cases"
          value={stats.activeAlerts}
          subtitle="Urgent action needed"
          bgColor="bg-red-500"
          iconColor="text-red-600"
        />
      </div>

      {/* ── Charts Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Line Chart - Prediction Trends */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-800">Prediction Trends</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">Weekly analysis overview</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg w-fit">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700">Last 7 days</span>
            </div>
          </div>

          <div className="h-64 sm:h-72 md:h-80">
            {weeklyData.length > 0 && weeklyData.some(d => d.predictions > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={{ stroke: '#e2e8f0' }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="predictions" 
                    stroke="url(#lineGradient)"
                    strokeWidth={3}
                    dot={{ fill: '#22c55e', strokeWidth: 2, r: 5, stroke: '#fff' }}
                    activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <svg className="w-16 h-16 text-slate-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                <p className="text-sm font-medium text-slate-600 mb-2">No data available yet</p>
                <Link to="/upload" className="text-sm text-green-600 font-medium hover:text-green-700 underline">
                  Upload your first image →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Pie Chart - Disease Distribution */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300">
          <div className="mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-slate-800">Disease Distribution</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">By detection count</p>
          </div>

          {diseaseDistribution.length > 0 ? (
            <div className="space-y-4 sm:space-y-6">
              <div className="h-48 sm:h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={diseaseDistribution}
                      cx="50%" 
                      cy="50%"
                      innerRadius={45} 
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {diseaseDistribution.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {diseaseDistribution.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span 
                        className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm" 
                        style={{ background: item.color }} 
                      />
                      <span className="text-sm text-slate-700 truncate font-medium">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-800 ml-3 tabular-nums">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <svg className="w-16 h-16 text-slate-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              <p className="text-sm font-medium text-slate-600">No data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Bar Chart - Disease Frequency */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800">Disease Frequency</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Top detected diseases</p>
          </div>
          {diseaseFrequency.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-lg w-fit">
              <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-xs font-medium text-orange-700">{diseaseFrequency.reduce((sum, d) => sum + d.cases, 0)} total cases</span>
            </div>
          )}
        </div>

        <div className="h-64 sm:h-72 md:h-80">
          {diseaseFrequency.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={diseaseFrequency} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={{ stroke: '#e2e8f0' }}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={{ stroke: '#e2e8f0' }}
                  allowDecimals={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar 
                  dataKey="cases" 
                  radius={[8, 8, 0, 0]}
                  maxBarSize={60}
                >
                  {diseaseFrequency.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <svg className="w-16 h-16 text-slate-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-sm font-medium text-slate-600">No disease data available</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Predictions Table ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-800">Recent Predictions</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">Latest crop analysis results</p>
            </div>
            <Link 
              to="/reports" 
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors font-medium text-sm w-full sm:w-auto"
            >
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {recentPredictions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Disease
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Crop Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Confidence
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentPredictions.map((prediction, index) => {
                  const confidence = (prediction.confidence * 100).toFixed(1);
                  const isHealthy = prediction.isHealthy || prediction.disease === 'Healthy';
                  
                  return (
                    <tr 
                      key={prediction.id || index} 
                      className="hover:bg-slate-50 transition-colors group"
                    >
                      {/* Disease */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isHealthy ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            <svg className={`w-5 h-5 ${isHealthy ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {isHealthy ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              )}
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{prediction.disease || 'Unknown'}</p>
                            <p className="text-xs text-slate-500 mt-0.5">ID: {String(prediction.id).padStart(4, '0')}</p>
                          </div>
                        </div>
                      </td>

                      {/* Crop Type */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-700 font-medium">
                          {prediction.cropType || 'Unknown'}
                        </span>
                      </td>

                      {/* Confidence */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 max-w-[100px]">
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${
                                  confidence >= 80 ? 'bg-green-500' :
                                  confidence >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${confidence}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-sm font-bold text-slate-800 tabular-nums min-w-[45px]">
                            {confidence}%
                          </span>
                        </div>
                      </td>

                      {/* Severity */}
                      <td className="px-6 py-4">
                        {prediction.severity ? (
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                            prediction.severity === 'Low' ? 'bg-yellow-100 text-yellow-700' :
                            prediction.severity === 'Medium' ? 'bg-orange-100 text-orange-700' :
                            prediction.severity === 'High' ? 'bg-red-100 text-red-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {prediction.severity}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">N/A</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">
                          {formatDate(prediction.createdAt) || 'N/A'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                            isHealthy 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              isHealthy ? 'bg-green-500' : 'bg-orange-500'
                            }`}></span>
                            {isHealthy ? 'Healthy' : 'Action Required'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-4">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-slate-700 mb-2">No Predictions Yet</h4>
            <p className="text-slate-500 mb-6">Upload your first crop image to get started with AI analysis</p>
            <Link 
              to="/upload" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg hover:shadow-green-200 transition-all duration-200 font-semibold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload Image
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
