import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageUpload from '../components/ImageUpload';
import predictionService from '../services/predictionService';
import { Loader, Alert } from '../components/ui';
import { useToast } from '../context/ToastContext';

/* ─── Severity badge helper ─── */
const SEVERITY_STYLES = {
  CRITICAL: 'bg-red-100 text-red-800 border border-red-200',
  HIGH:     'bg-orange-100 text-orange-800 border border-orange-200',
  MEDIUM:   'bg-yellow-100 text-yellow-800 border border-yellow-200',
  LOW:      'bg-green-100 text-green-800 border border-green-200',
};
const severityStyle = (s) =>
  SEVERITY_STYLES[(s ?? '').toUpperCase()] ?? 'bg-slate-100 text-slate-600';

/* ─── Normalise confidence to 0-1 no matter what the backend sends ─── */
const normaliseConfidence = (raw) => {
  if (raw == null || isNaN(Number(raw))) return 0;
  const n = Number(raw);
  // If the backend already sends a fraction (0 – 1) keep it; otherwise divide
  return n > 1 ? n / 100 : n;
};

/* ─── Confidence colour ─── */
const confidenceColor = (pct) => {
  if (pct >= 80) return 'from-green-400 to-green-600';
  if (pct >= 50) return 'from-yellow-400 to-yellow-600';
  return 'from-red-400 to-red-600';
};

const CROP_TYPES = ['Rice', 'Wheat', 'Corn', 'Cotton', 'Soybean', 'Sugarcane', 'Potato', 'Tomato', 'Other'];

const DETECTABLE = [
  { name: 'Bacterial Blight', color: 'bg-red-100 text-red-700' },
  { name: 'Leaf Rust',        color: 'bg-orange-100 text-orange-700' },
  { name: 'Brown Spot',       color: 'bg-yellow-100 text-yellow-700' },
  { name: 'Leaf Smut',        color: 'bg-purple-100 text-purple-700' },
  { name: 'Tungro',           color: 'bg-pink-100 text-pink-700' },
  { name: 'Hispa',            color: 'bg-blue-100 text-blue-700' },
  { name: 'Healthy',          color: 'bg-green-100 text-green-700' },
];

/* ══════════════════════════════════════════════════════════════════ */
/* ─── Health score colour helper ─── */
const healthScoreColor = (score) => {
  if (score >= 80) return { ring: 'text-green-500', bg: 'bg-green-50', label: 'Excellent' };
  if (score >= 60) return { ring: 'text-yellow-500', bg: 'bg-yellow-50', label: 'Good' };
  if (score >= 40) return { ring: 'text-orange-500', bg: 'bg-orange-50', label: 'Fair' };
  return { ring: 'text-red-500', bg: 'bg-red-50', label: 'Poor' };
};

const UploadPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult]           = useState(null);
  const [error, setError]             = useState(null);
  const [metadata, setMetadata]       = useState({ cropType: '', fieldLocation: '', notes: '' });
  const [showHeatmap, setShowHeatmap] = useState(false);

  const handleUpload = async (file) => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    setUploadProgress(0);
    const localImageUrl = URL.createObjectURL(file);

    try {
      // Simulate upload progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const apiResponse = await predictionService.analyzeCropImage(file, metadata);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (apiResponse.success && apiResponse.data) {
        const pred = apiResponse.data;

        // ── KEY FIX: normalise confidence regardless of what format backend returns ──
        const confidence = normaliseConfidence(pred.confidenceScore ?? pred.confidence);

        setResult({
          id:            pred.id,
          imageUrl:      localImageUrl,
          disease:       pred.diseaseName   || 'Unknown',
          confidence,
          severity:      pred.severity      || null,
          isHealthy:     pred.isHealthy     ?? (pred.diseaseName === 'Healthy'),
          treatments:    pred.treatmentRecommendations ?? pred.treatments ?? [],
          createdAt:     pred.createdAt     || new Date().toISOString(),
          cropType:      pred.cropType      || metadata.cropType || 'Unknown',
          fieldLocation: pred.fieldLocation || metadata.fieldLocation || '',
          notes:         pred.notes         || metadata.notes || '',
          status:        pred.status,
          // New AI service fields
          detectedCrop:     pred.detectedCrop,
          plantHealthScore: pred.plantHealthScore,
          heatmapUrl:       pred.heatmapUrl,
          cause:            pred.cause,
          prevention:       pred.prevention,
        });
        setShowHeatmap(false);
        
        // Show success toast
        toast.success(
          `Analysis complete! ${pred.isHealthy ? 'Crop appears healthy.' : `Detected: ${pred.diseaseName}`}`,
          'Image Analyzed'
        );
      } else {
        const errorMsg = apiResponse.message || 'Analysis failed. Please try again.';
        setError(errorMsg);
        toast.error(errorMsg, 'Analysis Failed');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      const errorMsg = err.message || 'Image analysis failed. Please check your connection and try again.';
      setError(errorMsg);
      toast.error(errorMsg, 'Error Analyzing Image');
    } finally {
      setIsAnalyzing(false);
      setUploadProgress(0);
    }
  };

  const handleNewScan = () => {
    setResult(null);
    setError(null);
    setMetadata({ cropType: '', fieldLocation: '', notes: '' });
  };

  const confidencePct = result ? (result.confidence * 100) : 0;

  /* ────────── JSX ────────── */
  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 animate-fade-in">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800">Analyze Crop Health</h1>
        <p className="text-sm sm:text-base text-slate-500 mt-2">Upload drone-captured images to detect diseases and get treatment recommendations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

        {/* ── Main content ── */}
        <div className="lg:col-span-2 space-y-6">

          {!result ? (
            /* ── Upload form ── */
            <div className="card">
              <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-4 sm:mb-6">Upload Crop Image</h2>
              <ImageUpload onUpload={handleUpload} isLoading={isAnalyzing} />

              <div className="mt-6 sm:mt-8 pt-6 border-t border-slate-100">
                <h3 className="text-xs sm:text-sm font-semibold text-slate-700 mb-3 sm:mb-4 uppercase tracking-wide">
                  Additional Information <span className="font-normal text-slate-400 normal-case">(Optional)</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-2">Crop Type</label>
                    <select
                      value={metadata.cropType}
                      onChange={(e) => setMetadata((p) => ({ ...p, cropType: e.target.value }))}
                      className="input-field text-sm"
                    >
                      <option value="">Select crop type</option>
                      {CROP_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-2">Field Location</label>
                    <input
                      type="text"
                      value={metadata.fieldLocation}
                      onChange={(e) => setMetadata((p) => ({ ...p, fieldLocation: e.target.value }))}
                      placeholder="e.g., Field A, North Section"
                      className="input-field text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-2">Additional Notes</label>
                    <textarea
                      value={metadata.notes}
                      onChange={(e) => setMetadata((p) => ({ ...p, notes: e.target.value }))}
                      placeholder="Any additional observations..."
                      rows={3}
                      className="input-field resize-none text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ── Result display ── */
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-base sm:text-lg font-semibold text-slate-800">Analysis Result</h2>
                <button onClick={handleNewScan} className="btn-outline text-sm py-2 px-4 w-full sm:w-auto">
                  + New Scan
                </button>
              </div>

              {/* Enhanced Modern Results Card */}
              <div className="card bg-gradient-to-br from-white to-slate-50 border-2 border-slate-100 shadow-xl">
                
                {/* Hero Section with Image and Disease Name */}
                <div className="relative">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    
                    {/* Image with Heatmap Toggle */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-2xl z-10 pointer-events-none" />
                      
                      {/* Toggle buttons for Original / Heatmap */}
                      {result.heatmapUrl && (
                        <div className="absolute top-4 left-4 z-20 flex rounded-xl overflow-hidden shadow-lg border border-white/30 backdrop-blur-sm">
                          <button
                            onClick={() => setShowHeatmap(false)}
                            className={`px-3 py-1.5 text-xs font-semibold transition-all ${
                              !showHeatmap ? 'bg-white text-slate-800' : 'bg-black/40 text-white hover:bg-black/60'
                            }`}
                          >
                            Original
                          </button>
                          <button
                            onClick={() => setShowHeatmap(true)}
                            className={`px-3 py-1.5 text-xs font-semibold transition-all ${
                              showHeatmap ? 'bg-red-500 text-white' : 'bg-black/40 text-white hover:bg-black/60'
                            }`}
                          >
                            🔥 Heatmap
                          </button>
                        </div>
                      )}

                      {/* Display original or heatmap image */}
                      {(showHeatmap && result.heatmapUrl) ? (
                        <img
                          src={result.heatmapUrl}
                          alt="Grad-CAM Heatmap - infected region visualization"
                          className="w-full h-64 sm:h-80 md:h-96 object-cover rounded-2xl shadow-lg"
                        />
                      ) : result.imageUrl ? (
                        <img
                          src={result.imageUrl}
                          alt={`Analyzed ${result.disease || 'crop'}`}
                          className="w-full h-64 sm:h-80 md:h-96 object-cover rounded-2xl shadow-lg transform group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-64 sm:h-80 md:h-96 bg-slate-100 rounded-2xl flex items-center justify-center">
                          <svg className="w-20 h-20 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      
                      {/* Severity Badge */}
                      {result.severity && (
                        <div className="absolute top-4 right-4 z-20">
                          <span className={`inline-flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full uppercase tracking-wide shadow-lg backdrop-blur-sm ${severityStyle(result.severity)}`}>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {result.severity}
                          </span>
                        </div>
                      )}

                      {/* Heatmap hint */}
                      {showHeatmap && (
                        <div className="absolute bottom-4 left-4 right-4 z-20">
                          <p className="text-xs text-white/90 bg-black/50 rounded-lg px-3 py-2 backdrop-blur-sm">
                            🔬 Grad-CAM heatmap highlights regions the AI focused on for disease detection
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Disease Information */}
                    <div className="flex flex-col justify-center space-y-4 sm:space-y-6 py-4">
                      
                      {/* Disease Name with Icon */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center ${result.isHealthy ? 'bg-green-100' : 'bg-red-100'}`}>
                            <svg className={`w-6 h-6 sm:w-7 sm:h-7 ${result.isHealthy ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {result.isHealthy ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              )}
                            </svg>
                          </div>
                          <div>
                            <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Detected Condition</p>
                            <h3 className={`text-2xl sm:text-3xl font-bold leading-tight ${result.isHealthy ? 'text-green-600' : 'text-red-600'}`}>
                              {result.disease}
                            </h3>
                          </div>
                        </div>
                      </div>

                      {/* Confidence Score with Enhanced Progress Bar */}
                      <div className="bg-white rounded-2xl p-5 shadow-md border border-slate-100">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Confidence Level</p>
                          </div>
                          <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent tabular-nums">
                            {confidencePct.toFixed(1)}%
                          </span>
                        </div>
                        
                        {/* Animated Progress Bar */}
                        <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                          <div
                            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${confidenceColor(confidencePct)} rounded-full transition-all duration-1000 ease-out`}
                            style={{ width: `${Math.max(confidencePct, 2)}%` }}
                          >
                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                          </div>
                          {/* Progress indicator dot */}
                          <div
                            className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg border-4 border-green-500 transition-all duration-1000 ease-out"
                            style={{ left: `calc(${Math.max(confidencePct, 2)}% - 12px)` }}
                          />
                        </div>
                        
                        {confidencePct < 50 && (
                          <div className="mt-3 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm text-amber-800 leading-relaxed">
                              Low confidence detected. Consider retaking the image with better lighting and focus.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Plant Health Score Gauge */}
                      {result.plantHealthScore != null && (
                        <div className={`rounded-2xl p-5 shadow-md border border-slate-100 ${healthScoreColor(result.plantHealthScore).bg}`}>
                          <div className="flex items-center gap-4">
                            {/* SVG Circular Gauge */}
                            <div className="relative w-20 h-20 flex-shrink-0">
                              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="15.91" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                                <circle
                                  cx="18" cy="18" r="15.91" fill="none"
                                  strokeWidth="3"
                                  strokeDasharray={`${result.plantHealthScore} ${100 - result.plantHealthScore}`}
                                  strokeLinecap="round"
                                  className={healthScoreColor(result.plantHealthScore).ring}
                                  stroke="currentColor"
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-lg font-bold text-slate-800">{result.plantHealthScore}</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Plant Health Score</p>
                              <p className="text-xl font-bold text-slate-800">{healthScoreColor(result.plantHealthScore).label}</p>
                              <p className="text-xs text-slate-500 mt-1">Based on AI analysis (0-100)</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Metadata Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-slate-100">
                          <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Crop Type</p>
                          <p className="text-sm sm:text-base text-slate-800 font-semibold">{result.cropType}</p>
                          {result.detectedCrop && result.detectedCrop !== result.cropType && (
                            <p className="text-xs text-blue-600 mt-1">AI detected: {result.detectedCrop}</p>
                          )}
                        </div>
                        {result.fieldLocation && (
                          <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-slate-100">
                            <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Location</p>
                            <p className="text-sm sm:text-base text-slate-800 font-semibold">{result.fieldLocation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Treatment Recommendations Section */}
                {result.treatments?.length > 0 && !result.isHealthy && (
                  <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t-2 border-slate-100">
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className="text-lg sm:text-xl font-bold text-slate-800">Treatment Recommendations</h4>
                    </div>
                    
                    <div className="grid gap-4">
                      {result.treatments.map((treatment, index) => (
                        <div
                          key={index}
                          className="group flex items-start gap-4 p-5 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-2 border-green-200 rounded-2xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                        >
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl flex items-center justify-center text-lg font-bold shadow-md group-hover:scale-110 transition-transform duration-300">
                              {index + 1}
                            </div>
                          </div>
                          <div className="flex-1 pt-1">
                            <p className="text-base text-slate-800 leading-relaxed font-medium">{treatment}</p>
                          </div>
                          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cause & Prevention Section */}
                {(result.cause || result.prevention) && !result.isHealthy && (
                  <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t-2 border-slate-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      {/* Cause */}
                      {result.cause && (
                        <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center">
                              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <h4 className="text-base font-bold text-red-800">Cause</h4>
                          </div>
                          <p className="text-sm text-red-700 leading-relaxed">{result.cause}</p>
                        </div>
                      )}
                      {/* Prevention */}
                      {result.prevention && (
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                            </div>
                            <h4 className="text-base font-bold text-blue-800">Prevention</h4>
                          </div>
                          <p className="text-sm text-blue-700 leading-relaxed">{result.prevention}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Healthy Crop Message */}
                {result.isHealthy && (
                  <div className="mt-8 pt-8 border-t-2 border-slate-100">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8 text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-xl">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h4 className="text-2xl font-bold text-green-800 mb-3">Excellent News! Your Crop is Healthy</h4>
                      <p className="text-green-700 leading-relaxed max-w-2xl mx-auto">
                        No signs of disease or pest infestation were detected in this analysis. Continue monitoring regularly to maintain crop health.
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 sm:mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row flex-wrap gap-3">
                  <button className="btn-primary flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-shadow text-sm sm:text-base py-2.5 sm:py-3 w-full sm:w-auto sm:flex-1">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Report
                  </button>
                  <button
                    onClick={() => navigate('/reports')}
                    className="btn-outline flex items-center justify-center gap-2 hover:shadow-md transition-shadow text-sm sm:text-base py-2.5 sm:py-3 w-full sm:w-auto sm:flex-1"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    View All Reports
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <Alert 
              variant="error" 
              title="Analysis Failed"
              message={error}
              dismissible
              onClose={() => setError(null)}
            />
          )}

          {/* Loading Overlay */}
          {isAnalyzing && (
            <div className="card">
              <div className="text-center space-y-4">
                <Loader 
                  variant="spinner" 
                  size="lg" 
                  text="Analyzing crop image... This may take a few moments."
                />
                
                {/* Upload Progress Bar */}
                {uploadProgress > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-600">Upload Progress</span>
                      <span className="text-sm font-bold text-green-600">{uploadProgress}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-6">

          {/* Tips */}
          <div className="card">
            <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Tips for Best Results
            </h3>
            <ul className="space-y-3">
              {[
                'Capture images during daylight hours for best clarity',
                'Focus on affected areas of the plant',
                'Ensure images are not blurry or overexposed',
                'Include leaves with visible symptoms',
                'Use high-resolution drone camera settings',
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Detectable conditions */}
          <div className="card">
            <h3 className="text-base font-semibold text-slate-800 mb-4">Detectable Conditions</h3>
            <div className="flex flex-wrap gap-2">
              {DETECTABLE.map((d) => (
                <span key={d.name} className={`inline-block px-3 py-1.5 rounded-full text-xs font-medium ${d.color}`}>
                  {d.name}
                </span>
              ))}
            </div>
          </div>

          {/* Help */}
          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <h3 className="text-base font-semibold mb-2">Need Help?</h3>
            <p className="text-sm text-white/80 mb-4">Contact our expert team for personalized crop health advice</p>
            <button className="w-full py-2.5 px-4 bg-white text-green-600 font-semibold rounded-xl hover:bg-white/90 transition-colors text-sm">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
