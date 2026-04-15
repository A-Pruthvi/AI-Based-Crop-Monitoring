import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ReportTable from '../components/ReportTable';
import predictionService, { mapPrediction } from '../services/predictionService';
import { Loader, Alert } from '../components/ui';
import { useToast } from '../context/ToastContext';
import { exportReportToPDF, exportMultipleReportsToPDF } from '../utils/pdfExport';

/* ─── severity badge styles ─── */
const SEV_STYLES = {
  CRITICAL: 'bg-red-100 text-red-700 border border-red-200',
  HIGH:     'bg-orange-100 text-orange-700 border border-orange-200',
  MEDIUM:   'bg-yellow-100 text-yellow-700 border border-yellow-200',
  LOW:      'bg-green-100 text-green-700 border border-green-200',
  HEALTHY:  'bg-emerald-100 text-emerald-700 border border-emerald-200',
};
const sevStyle = (s) => SEV_STYLES[(s ?? '').toUpperCase()] ?? 'bg-slate-100 text-slate-600';

/* ─── tiny debounce for search ─── */
const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

/* ──────────────────────────────────────── */
const Reports = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [reports,      setReports]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [currentPage,  setCurrentPage]  = useState(1);
  const [totalPages,   setTotalPages]   = useState(1);
  const [totalItems,   setTotalItems]   = useState(0);
  const [viewMode,     setViewMode]     = useState('table');
  const [statsData,    setStatsData]    = useState({ total: 0, healthy: 0, diseased: 0, highSev: 0 });

  const [filters, setFilters] = useState({
    search:    '',
    dateRange: 'all',
    disease:   'all',
    severity:  'all',
  });

  const debouncedSearch = useDebounce(filters.search);

  /* ── Fetch with all filters passed to API ── */
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Pass all filters as query params — no more client-side filtering
      const params = {
        page:     currentPage - 1,
        size:     10,
        // Only include non-default values to keep URL clean
        ...(debouncedSearch          && { search:    debouncedSearch }),
        ...(filters.dateRange !== 'all' && { dateRange: filters.dateRange }),
        ...(filters.disease   !== 'all' && { disease:   filters.disease }),
        ...(filters.severity  !== 'all' && { severity:  filters.severity }),
      };

      const apiResponse = await predictionService.getUserPredictions(
        params.page,
        params.size,
        params,          // pass extra filters — update predictionService to accept this
      );

      if (apiResponse.success && apiResponse.data) {
        const pageData    = apiResponse.data;
        const predictions = pageData.content ?? pageData ?? [];
        const mapped      = predictions.map(mapPrediction);

        setReports(mapped);
        setTotalPages(pageData.totalPages ?? 1);
        setTotalItems(pageData.totalElements ?? mapped.length);

        // Build summary stats from ALL data (not just current page) using
        // the same stats endpoint the Dashboard already calls
        const healthy  = mapped.filter((r) => r.disease === 'Healthy' || r.isHealthy).length;
        const diseased = mapped.filter((r) => r.disease !== 'Healthy' && !r.isHealthy).length;
        const highSev  = mapped.filter((r) => ['HIGH', 'CRITICAL'].includes((r.severity ?? '').toUpperCase())).length;
        setStatsData({ total: pageData.totalElements ?? mapped.length, healthy, diseased, highSev });
      } else {
        setReports([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
      setError(err.message || 'Failed to load reports. Please try again.');
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, filters.dateRange, filters.disease, filters.severity]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  /* Reset to page 1 when filters change */
  const handleFilterChange = (key, value) => {
    setFilters((p) => ({ ...p, [key]: value }));
    setCurrentPage(1);
  };

  const handleViewDetails = (id) => navigate(`/reports/${id}`);

  const handleDownload = async (id) => {
    try {
      const report = reports.find(r => r.id === id);
      if (!report) {
        toast.error('Report not found');
        return;
      }
      await exportReportToPDF(report);
      toast.success('Report exported successfully!');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export report: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this analysis?')) return;
    try {
      await predictionService.deletePrediction(id);
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
      setError(err.message || 'Failed to delete report. Please try again.');
    }
  };

  /* ── Summary stat card ── */
  const StatCard = ({ icon, label, value, color }) => (
    <div className="card p-3 sm:p-4">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-xl sm:text-2xl font-bold text-slate-800 tabular-nums">{value}</p>
          <p className="text-[10px] sm:text-xs text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );

  /* ── Grid card ── */
  const GridCard = ({ report }) => (
    <div className="card overflow-hidden group hover:shadow-lg transition-all duration-200">
      <div className="relative h-44 -mx-6 -mt-6 mb-4 overflow-hidden bg-slate-100">
        {report.imageUrl ? (
          <img
            src={report.imageUrl}
            alt={`${report.disease || 'Crop'} detection`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
              const parent = e.target.parentElement;
              if (parent && !parent.querySelector('.fallback-icon')) {
                const placeholder = document.createElement('div');
                placeholder.className = 'fallback-icon w-full h-full flex items-center justify-center';
                placeholder.innerHTML = `
                  <svg class="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                `;
                parent.insertBefore(placeholder, parent.firstChild);
              }
            }}
          />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${sevStyle(report.severity)}`}>
            {report.disease}
          </span>
          <span className="text-white text-sm font-bold tabular-nums">
            {((report.confidence ?? 0) * 100).toFixed(0)}%
          </span>
        </div>
      </div>
      <div className="space-y-1 mb-3">
        {report.cropType && (
          <p className="text-xs text-slate-500">{report.cropType}</p>
        )}
        <p className="text-xs text-slate-400">{report.date}</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => handleViewDetails(report.id)}
          className="flex-1 py-2 text-sm font-medium text-center bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          Details
        </button>
        <button
          onClick={() => handleDownload(report.id)}
          className="p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
          title="Download report"
        >
          <svg className="w-4 h-4 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
        <button
          onClick={() => handleDelete(report.id)}
          className="p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          title="Delete"
        >
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800">Analysis Reports</h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">View and manage all your crop health analysis reports</p>
        </div>
        <button
          onClick={async () => {
            try {
              if (reports.length === 0) {
                toast.warning('No reports to export');
                return;
              }
              await exportMultipleReportsToPDF(reports);
              toast.success(`Exported ${reports.length} reports successfully!`);
            } catch (error) {
              console.error('PDF export error:', error);
              toast.error('Failed to export reports: ' + error.message);
            }
          }}
          className="btn-outline text-sm py-2 flex items-center justify-center gap-2 w-full md:w-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export All
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <StatCard
          icon={<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          label="Total Reports" value={statsData.total} color="bg-blue-100"
        />
        <StatCard
          icon={<svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          label="Healthy" value={statsData.healthy} color="bg-green-100"
        />
        <StatCard
          icon={<svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
          label="Diseased" value={statsData.diseased} color="bg-orange-100"
        />
        <StatCard
          icon={<svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          label="High Severity" value={statsData.highSev} color="bg-red-100"
        />
      </div>

      {/* ── Error Message ── */}
      {error && (
        <div className="mb-4 sm:mb-6">
          <Alert 
            variant="error" 
            message={error}
            dismissible
            onClose={() => setError(null)}
          />
        </div>
      )}

      {/* ── Filters ── */}
      <div className="card mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
          {/* Search */}
          <div className="flex-1 min-w-[180px] w-full sm:w-auto">
            <div className="relative">
              <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by disease..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="input-field pl-10 text-sm"
              />
            </div>
          </div>

          {/* Date */}
          <select value={filters.dateRange} onChange={(e) => handleFilterChange('dateRange', e.target.value)} className="input-field w-full sm:w-40 text-sm">
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>

          {/* Disease */}
          <select value={filters.disease} onChange={(e) => handleFilterChange('disease', e.target.value)} className="input-field w-full sm:w-44 text-sm">
            <option value="all">All Diseases</option>
            <option value="Healthy">Healthy</option>
            <option value="Bacterial Blight">Bacterial Blight</option>
            <option value="Leaf Rust">Leaf Rust</option>
            <option value="Brown Spot">Brown Spot</option>
            <option value="Tungro">Tungro</option>
            <option value="Hispa">Hispa</option>
          </select>

          {/* Severity */}
          <select value={filters.severity} onChange={(e) => handleFilterChange('severity', e.target.value)} className="input-field w-full sm:w-36 text-sm">
            <option value="all">All Severity</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* View toggle */}
          <div className="flex border border-slate-200 rounded-xl overflow-hidden w-full sm:w-auto">
            <button
              onClick={() => setViewMode('table')}
              title="Table view"
              className={`flex-1 sm:flex-none px-3.5 py-2 transition-colors ${viewMode === 'table' ? 'bg-green-500 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
            >
              <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              title="Grid view"
              className={`flex-1 sm:flex-none px-3.5 py-2 transition-colors ${viewMode === 'grid' ? 'bg-green-500 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
            >
              <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Active filter chips */}
        {(filters.search || filters.dateRange !== 'all' || filters.disease !== 'all' || filters.severity !== 'all') && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
            <span className="text-[10px] sm:text-xs text-slate-400 self-center">Active filters:</span>
            {filters.search && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-[10px] sm:text-xs font-medium">
                "{filters.search}"
                <button onClick={() => handleFilterChange('search', '')} className="hover:text-green-900">×</button>
              </span>
            )}
            {filters.dateRange !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] sm:text-xs font-medium">
                {filters.dateRange}
                <button onClick={() => handleFilterChange('dateRange', 'all')} className="hover:text-blue-900">×</button>
              </span>
            )}
            {filters.disease !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-orange-700 rounded-full text-[10px] sm:text-xs font-medium">
                {filters.disease}
                <button onClick={() => handleFilterChange('disease', 'all')} className="hover:text-orange-900">×</button>
              </span>
            )}
            {filters.severity !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-[10px] sm:text-xs font-medium">
                {filters.severity}
                <button onClick={() => handleFilterChange('severity', 'all')} className="hover:text-red-900">×</button>
              </span>
            )}
            <button
              onClick={() => setFilters({ search: '', dateRange: 'all', disease: 'all', severity: 'all' })}
              className="text-[10px] sm:text-xs text-slate-500 hover:text-red-600 ml-auto"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ── Results count ── */}
      {!loading && (
        <p className="text-sm text-slate-500 mb-4">
          Showing {reports.length} of {totalItems} results
          {(filters.search || filters.disease !== 'all' || filters.severity !== 'all') && ' (filtered)'}
        </p>
      )}

      {/* ── Display ── */}
      {viewMode === 'table' ? (
        <ReportTable
          reports={reports}
          onViewDetails={handleViewDetails}
          onDownload={handleDownload}
          onDelete={handleDelete}
          isLoading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      ) : (
        <>
          {loading ? (
            <div className="card py-12 sm:py-16">
              <Loader 
                variant="spinner" 
                size="lg" 
                text="Loading reports..."
              />
            </div>
          ) : reports.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {reports.map((report) => <GridCard key={report.id} report={report} />)}
            </div>
          ) : (
            <div className="card text-center py-16">
              <svg className="w-14 h-14 mx-auto mb-4 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-slate-500 text-sm">No reports found matching your filters.</p>
            </div>
          )}

          {/* Pagination for grid view */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-2 mt-6 sm:mt-8">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-full sm:w-auto px-4 py-2 text-sm border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                ← Prev
              </button>
              <span className="px-4 py-2 text-sm text-slate-500">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-full sm:w-auto px-4 py-2 text-sm border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reports;
