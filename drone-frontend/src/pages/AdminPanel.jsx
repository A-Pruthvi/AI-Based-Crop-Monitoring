import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Cell,
} from 'recharts';
import useAuth from '../hooks/useAuth';
import adminService from '../services/adminService';
import { formatDate, getInitials, getDiseaseColor } from '../utils/helpers';

/* ─── Shared chart tooltip ─── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-slate-500 mb-1 text-xs uppercase tracking-wide">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color ?? p.fill }} />
          <span className="text-slate-600">{p.name ?? 'Count'}:</span>
          <span className="font-bold text-slate-800">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

/* ─── Role badge ─── */
const RoleBadge = ({ role }) => {
  const styles = {
    ADMIN:  'bg-purple-100 text-purple-800',
    EXPERT: 'bg-blue-100 text-blue-800',
    FARMER: 'bg-green-100 text-green-800',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${styles[role] ?? 'bg-slate-100 text-slate-600'}`}>
      {role}
    </span>
  );
};

/* ─── Normalise confidence ─── */
const fmtConf = (raw) => {
  if (!raw) return 'N/A';
  const n = Number(raw);
  return `${(n > 1 ? n : n * 100).toFixed(1)}%`;
};

/* ══════════════════════════════════════════════════════════ */
const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading,   setLoading]   = useState(true);

  /* ── State ── */
  const [stats, setStats] = useState({
    totalUsers: 0, totalScans: 0,
    newUsersThisMonth: 0, predictionsThisMonth: 0,
    farmerCount: 0, expertCount: 0, adminCount: 0,
  });
  const [users,           setUsers]           = useState([]);
  const [userSearch,      setUserSearch]       = useState('');
  const [userPage,        setUserPage]         = useState(0);
  const [userTotalPages,  setUserTotalPages]   = useState(1);
  const [diseaseStats,    setDiseaseStats]     = useState([]);
  const [dailyData,       setDailyData]        = useState([]);
  const [recentPreds,     setRecentPreds]      = useState([]);
  const [systemHealth,    setSystemHealth]     = useState({
    api: 'checking', ai: 'checking', database: 'checking', storage: 'checking',
  });

  /* ── Create-user modal ── */
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser]   = useState({ name: '', email: '', password: '', role: 'FARMER' });
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState('');

  /* ─────────── Data fetchers ─────────── */
  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, diseaseRes, dailyRes, predsRes] = await Promise.allSettled([
        adminService.getStats(),
        adminService.getDiseaseDistribution(),
        adminService.getDailyPredictions(30),
        adminService.getRecentPredictions(),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value?.success) {
        const s = statsRes.value.data;
        setStats({
          totalUsers:           s.totalUsers           ?? 0,
          totalScans:           s.totalPredictions     ?? 0,
          newUsersThisMonth:    s.newUsersThisMonth    ?? 0,
          predictionsThisMonth: s.predictionsThisMonth ?? 0,
          farmerCount:          s.totalFarmers         ?? 0,
          expertCount:          s.totalExperts         ?? 0,
          adminCount:           s.totalAdmins          ?? 0,
        });
      }

      if (diseaseRes.status === 'fulfilled' && diseaseRes.value?.success) {
        setDiseaseStats(
          (diseaseRes.value.data ?? []).map((d) => ({
            name:  d.disease ?? 'Unknown',
            count: Number(d.count) || 0,
            color: getDiseaseColor?.(d.disease) ?? '#64748b',
          }))
        );
      }

      if (dailyRes.status === 'fulfilled' && dailyRes.value?.success) {
        setDailyData(
          (dailyRes.value.data ?? []).map((d) => ({
            date:  d.date,
            count: Number(d.count) || 0,
          }))
        );
      }

      if (predsRes.status === 'fulfilled' && predsRes.value?.success) {
        setRecentPreds(
          (predsRes.value.data ?? []).slice(0, 10).map((p) => ({
            id:             p.id,
            userName:       p.userName ?? `User #${p.userId}`,
            diseaseName:    p.diseaseName,
            confidenceScore:p.confidenceScore,
            cropType:       p.cropType,
            createdAt:      p.createdAt,
            severity:       p.severity,
          }))
        );
      }

      setSystemHealth({ api: 'operational', database: 'operational', storage: 'operational', ai: 'checking' });
      // check AI separately (may be on different port)
      try {
        const aiRes = await fetch('http://localhost:5000/health', { signal: AbortSignal.timeout(3000) });
        setSystemHealth((h) => ({ ...h, ai: aiRes.ok ? 'operational' : 'down' }));
      } catch {
        setSystemHealth((h) => ({ ...h, ai: 'down' }));
      }

    } catch (err) {
      console.error('Admin data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await adminService.getUsers(userPage, 20);
      if (res.success && res.data) {
        const page = res.data;
        setUsers((page.content ?? page ?? []).map((u) => ({
          id:        u.id,
          name:      u.name,
          email:     u.email,
          role:      u.role,
          farmName:  u.farmName,
          enabled:   u.enabled ?? true,
          createdAt: u.createdAt,
          lastLogin: u.lastLogin,
        })));
        setUserTotalPages(page.totalPages ?? 1);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  }, [userPage]);

  useEffect(() => { fetchAdminData(); }, [fetchAdminData]);
  useEffect(() => { if (activeTab === 'users') fetchUsers(); }, [activeTab, fetchUsers]);

  /* ─────────── User actions ─────────── */
  const handleToggleStatus = async (userId) => {
    try {
      const res = await adminService.toggleUserStatus(userId);
      if (res.success) setUsers((u) => u.map((x) => x.id === userId ? { ...x, enabled: !x.enabled } : x));
    } catch { alert('Failed to change user status'); }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      const res = await adminService.changeUserRole(userId, newRole);
      if (res.success) setUsers((u) => u.map((x) => x.id === userId ? { ...x, role: newRole } : x));
    } catch { alert('Failed to change role'); }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return;
    try {
      const res = await adminService.deleteUser(userId);
      if (res.success) setUsers((u) => u.filter((x) => x.id !== userId));
    } catch { alert('Failed to delete user'); }
  };

  const handleCreateUser = async () => {
    setCreateErr('');
    if (!newUser.name || !newUser.email || !newUser.password) {
      setCreateErr('Name, email and password are required.');
      return;
    }
    try {
      setCreating(true);
      const res = await adminService.createUser(newUser);
      if (res.success) {
        setShowCreateModal(false);
        setNewUser({ name: '', email: '', password: '', role: 'FARMER' });
        fetchUsers();
      } else {
        setCreateErr(res.message ?? 'Failed to create user');
      }
    } catch (err) {
      setCreateErr(err.message ?? 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const checkSystemHealth = async () => {
    setSystemHealth({ api: 'checking', ai: 'checking', database: 'checking', storage: 'checking' });
    try {
      await adminService.getStats();
      setSystemHealth((h) => ({ ...h, api: 'operational', database: 'operational', storage: 'operational' }));
    } catch {
      setSystemHealth((h) => ({ ...h, api: 'down', database: 'down', storage: 'down' }));
    }
    try {
      const aiRes = await fetch('http://localhost:5000/health', { signal: AbortSignal.timeout(3000) });
      setSystemHealth((h) => ({ ...h, ai: aiRes.ok ? 'operational' : 'down' }));
    } catch {
      setSystemHealth((h) => ({ ...h, ai: 'down' }));
    }
  };

  /* ─── filtered users ─── */
  const filteredUsers = users.filter((u) => {
    if (!userSearch) return true;
    const q = userSearch.toLowerCase();
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.farmName?.toLowerCase().includes(q);
  });

  /* ─── tabs ─── */
  const tabs = [
    { id: 'overview',  label: 'Overview'  },
    { id: 'users',     label: 'Users'     },
    { id: 'analytics', label: 'Analytics' },
    { id: 'system',    label: 'System'    },
  ];

  /* ─── stat card ─── */
  const StatCard = ({ icon, color, value, label, sub }) => (
    <div className="card-hover group">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 ${color}`}>
        {icon}
      </div>
      <p className="text-3xl font-bold text-slate-800 tabular-nums">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
      {sub && <p className="text-xs text-green-600 mt-1">{sub}</p>}
    </div>
  );

  /* ─── health pill ─── */
  const HealthPill = ({ status }) => {
    const map = {
      operational: { dot: 'bg-green-500 animate-pulse', text: 'text-green-600', label: 'Operational' },
      checking:    { dot: 'bg-yellow-400 animate-pulse', text: 'text-yellow-600', label: 'Checking…' },
      down:        { dot: 'bg-red-500', text: 'text-red-600', label: 'Down' },
    };
    const s = map[status] ?? map.checking;
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${s.text}`}>
        <span className={`w-2 h-2 rounded-full ${s.dot}`} />
        {s.label}
      </span>
    );
  };

  /* ════════════ JSX ════════════ */
  return (
    <div className="p-6 lg:p-8 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Admin Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage users, view analytics and monitor system health</p>
        </div>
        <button
          onClick={fetchAdminData}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-green-600 px-3 py-2 rounded-lg hover:bg-green-50 transition-colors self-start"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-slate-100 p-1 rounded-xl w-fit overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === t.id
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ══ OVERVIEW TAB ══ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
              {[...Array(4)].map((_, i) => <div key={i} className="card h-32 bg-slate-100" />)}
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <StatCard
                  icon={<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                  color="bg-blue-100" value={stats.totalUsers.toLocaleString()} label="Total Users"
                  sub={`+${stats.newUsersThisMonth} this month`}
                />
                <StatCard
                  icon={<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                  color="bg-green-100" value={stats.totalScans.toLocaleString()} label="Total Predictions"
                  sub={`+${stats.predictionsThisMonth} this month`}
                />
                <StatCard
                  icon={<svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                  color="bg-purple-100" value={stats.farmerCount} label="Farmers"
                  sub={`${stats.expertCount} Experts · ${stats.adminCount} Admins`}
                />
                <StatCard
                  icon={<svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                  color="bg-orange-100" value={stats.predictionsThisMonth} label="Scans This Month"
                />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Daily Predictions (30 Days)</h3>
                  <div className="h-60">
                    {dailyData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dailyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false}
                            tickFormatter={(d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                            interval={Math.floor(dailyData.length / 6)} />
                          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                          <Tooltip content={<ChartTooltip />} labelFormatter={(d) => d ? new Date(d).toLocaleDateString() : ''} />
                          <Line type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={2.5}
                            dot={false} activeDot={{ r: 4, strokeWidth: 0 }} name="Predictions" />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : <EmptyChart msg="No prediction data yet" />}
                  </div>
                </div>

                <div className="card">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Disease Detection</h3>
                  <div className="h-60">
                    {diseaseStats.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={diseaseStats} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barSize={28}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false}
                            tickFormatter={(v) => v.length > 8 ? v.slice(0, 8) + '…' : v} />
                          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                          <Tooltip content={<ChartTooltip />} />
                          <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Cases">
                            {diseaseStats.map((e, i) => <Cell key={i} fill={e.color ?? '#22c55e'} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : <EmptyChart msg="No disease data yet" />}
                  </div>
                </div>
              </div>

              {/* Recent predictions list */}
              <div className="card">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Predictions (All Users)</h3>
                {recentPreds.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {recentPreds.map((p) => (
                      <div key={p.id} className="flex items-center gap-4 py-3 hover:bg-slate-50 rounded-xl px-2 transition-colors">
                        <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-800">
                            <span className="font-semibold">{p.userName}</span>
                            {' — '}{p.diseaseName || 'Unknown'}
                            {p.cropType && <span className="text-slate-400"> ({p.cropType})</span>}
                          </p>
                          <p className="text-xs text-slate-400">
                            Confidence: {fmtConf(p.confidenceScore)}
                            {p.createdAt && ` · ${formatDate(p.createdAt)}`}
                          </p>
                        </div>
                        {p.severity && (
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${
                            p.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                            p.severity === 'HIGH'     ? 'bg-orange-100 text-orange-700' :
                            p.severity === 'MEDIUM'   ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-green-100 text-green-700'
                          }`}>
                            {p.severity}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm py-6 text-center">No predictions yet</p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ══ USERS TAB ══ */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search users by name, email or farm..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2 text-sm py-2.5 px-4 flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add User
            </button>
          </div>

          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {['User', 'Role', 'Farm', 'Joined', 'Last Login', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length > 0 ? filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      {/* User info */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {getInitials?.(u.name) ?? u.name?.[0]?.toUpperCase() ?? '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 text-sm truncate">{u.name}</p>
                            <p className="text-xs text-slate-400 truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      {/* Role selector */}
                      <td className="px-5 py-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleChangeRole(u.id, e.target.value)}
                          className={`text-xs font-semibold px-2.5 py-1.5 rounded-full border-0 cursor-pointer appearance-none ${
                            u.role === 'ADMIN'  ? 'bg-purple-100 text-purple-800' :
                            u.role === 'EXPERT' ? 'bg-blue-100 text-blue-800'   :
                                                  'bg-green-100 text-green-800'
                          }`}
                        >
                          <option value="FARMER">FARMER</option>
                          <option value="EXPERT">EXPERT</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600 max-w-[120px] truncate">{u.farmName || '—'}</td>
                      <td className="px-5 py-4 text-sm text-slate-500 whitespace-nowrap">{u.createdAt ? formatDate(u.createdAt) : '—'}</td>
                      <td className="px-5 py-4 text-sm text-slate-500 whitespace-nowrap">{u.lastLogin ? formatDate(u.lastLogin) : 'Never'}</td>
                      {/* Status toggle */}
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleToggleStatus(u.id)}
                          title={u.enabled ? 'Click to disable' : 'Click to enable'}
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full transition-colors ${
                            u.enabled
                              ? 'bg-green-50 text-green-700 hover:bg-green-100'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${u.enabled ? 'bg-green-500' : 'bg-slate-400'}`} />
                          {u.enabled ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      {/* Delete */}
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete user"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                        {userSearch ? 'No users match your search.' : 'No users found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {userTotalPages > 1 && (
              <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
                <p className="text-sm text-slate-500">Page {userPage + 1} of {userTotalPages}</p>
                <div className="flex gap-2">
                  <button onClick={() => setUserPage((p) => Math.max(0, p - 1))} disabled={userPage === 0}
                    className="px-4 py-2 text-sm border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50">← Prev</button>
                  <button onClick={() => setUserPage((p) => Math.min(userTotalPages - 1, p + 1))} disabled={userPage >= userTotalPages - 1}
                    className="px-4 py-2 text-sm border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50">Next →</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ ANALYTICS TAB ══ */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Summary tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Users',       value: stats.totalUsers,           color: 'bg-blue-50 text-blue-800' },
              { label: 'Total Predictions', value: stats.totalScans,           color: 'bg-green-50 text-green-800' },
              { label: 'New Users (Month)', value: stats.newUsersThisMonth,    color: 'bg-purple-50 text-purple-800' },
              { label: 'Scans (Month)',     value: stats.predictionsThisMonth, color: 'bg-orange-50 text-orange-800' },
            ].map((t) => (
              <div key={t.label} className={`rounded-2xl p-4 ${t.color}`}>
                <p className="text-2xl font-bold tabular-nums">{t.value}</p>
                <p className="text-xs font-medium mt-1 opacity-70">{t.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Horizontal disease bar */}
            <div className="card">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Disease Distribution</h3>
              <div className="h-64">
                {diseaseStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={diseaseStats} layout="vertical" margin={{ top: 0, right: 15, left: 0, bottom: 0 }} barSize={18}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                      <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                      <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={110} tickLine={false} axisLine={false}
                        tickFormatter={(v) => v.length > 14 ? v.slice(0, 13) + '…' : v} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="count" radius={[0, 6, 6, 0]} name="Cases">
                        {diseaseStats.map((e, i) => <Cell key={i} fill={e.color ?? '#22c55e'} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <EmptyChart msg="No data available" />}
              </div>
            </div>

            {/* Prediction trend */}
            <div className="card">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Prediction Trend (30 days)</h3>
              <div className="h-64">
                {dailyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false}
                        tickFormatter={(d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                        interval={Math.floor(dailyData.length / 5)} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip content={<ChartTooltip />} labelFormatter={(d) => d ? new Date(d).toLocaleDateString() : ''} />
                      <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2.5}
                        dot={false} activeDot={{ r: 4, strokeWidth: 0 }} name="Predictions" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : <EmptyChart msg="No data available" />}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ SYSTEM TAB ══ */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-slate-800">System Health</h3>
              <button
                onClick={checkSystemHealth}
                className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Recheck
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { key: 'api',      label: 'Backend API',   port: '8081', icon: '🖥️' },
                { key: 'database', label: 'MySQL DB',       port: '3306', icon: '🗄️' },
                { key: 'ai',       label: 'AI Service',    port: '5000', icon: '🤖' },
                { key: 'storage',  label: 'File Storage',  port: 'disk', icon: '💾' },
              ].map(({ key, label, port, icon }) => (
                <div key={key} className="p-4 rounded-2xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl">{icon}</span>
                    <HealthPill status={systemHealth[key]} />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">{label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Port: {port}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">System Info</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Platform Version', value: 'v1.0.0' },
                { label: 'Last Checked',     value: formatDate(new Date()) },
                { label: 'AI Model',         value: 'MobileNetV2 CNN' },
                { label: 'Services',         value: 'Backend · AI · Frontend' },
              ].map((item) => (
                <div key={item.label} className="p-4 rounded-xl bg-slate-50">
                  <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                  <p className="text-sm font-semibold text-slate-800">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ CREATE USER MODAL ══ */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800">Create New User</h3>
              <button onClick={() => { setShowCreateModal(false); setCreateErr(''); }}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            {createErr && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                {createErr}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Full Name *</label>
                <input type="text" value={newUser.name}
                  onChange={(e) => setNewUser((p) => ({ ...p, name: e.target.value }))}
                  placeholder="John Farmer" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Email *</label>
                <input type="email" value={newUser.email}
                  onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))}
                  placeholder="john@farm.com" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Password *</label>
                <input type="password" value={newUser.password}
                  onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))}
                  placeholder="Min 8 chars" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Role</label>
                <select value={newUser.role}
                  onChange={(e) => setNewUser((p) => ({ ...p, role: e.target.value }))}
                  className="input-field">
                  <option value="FARMER">FARMER</option>
                  <option value="EXPERT">EXPERT</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowCreateModal(false); setCreateErr(''); }}
                className="flex-1 btn-outline py-2.5">Cancel</button>
              <button onClick={handleCreateUser} disabled={creating}
                className="flex-1 btn-primary py-2.5 disabled:opacity-60">
                {creating ? 'Creating…' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Empty chart helper ─── */
const EmptyChart = ({ msg }) => (
  <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-300">
    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
    <p className="text-sm text-slate-400">{msg}</p>
  </div>
);

export default AdminPanel;
