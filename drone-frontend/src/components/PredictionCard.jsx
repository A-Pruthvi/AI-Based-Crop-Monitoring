import React from 'react';
import { formatConfidence, getConfidenceLevel, formatDate, getSeverityBadgeClass } from '../utils/helpers';

const PredictionCard = ({ prediction, onViewDetails, onDownloadReport }) => {
  const {
    id,
    imageUrl,
    disease,
    confidence,
    severity,
    treatments,
    createdAt,
    cropType,
  } = prediction;

  const confidenceLevel = getConfidenceLevel(confidence);
  const isHealthy = disease?.toLowerCase() === 'healthy';

  return (
    <div className="card-hover overflow-hidden animate-fade-in">
      {/* Image Section */}
      <div className="relative h-48 -mx-6 -mt-6 mb-4 bg-slate-100 flex items-center justify-center">
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={`${disease || 'Crop'} analysis`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                const parent = e.target.parentElement;
                parent.innerHTML = `
                  <svg class="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                `;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </>
        ) : (
          <>
            <svg className="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={getSeverityBadgeClass(isHealthy ? 'healthy' : severity)}>
            {isHealthy ? '✓ Healthy' : severity || 'Unknown'}
          </span>
        </div>

        {/* Disease Name */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-semibold text-lg truncate">
            {disease || 'Unknown Condition'}
          </h3>
          {cropType && (
            <p className="text-white/80 text-sm">{cropType}</p>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="space-y-4">
        {/* Confidence Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Confidence</span>
            <span className={`text-sm font-bold ${
              confidenceLevel.color === 'green' ? 'text-green-600' :
              confidenceLevel.color === 'yellow' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {formatConfidence(confidence)}
            </span>
          </div>
          <div className="progress-bar">
            <div
              className={`progress-fill ${
                confidenceLevel.color === 'green' ? 'from-green-400 to-green-600' :
                confidenceLevel.color === 'yellow' ? 'from-yellow-400 to-yellow-600' : 'from-red-400 to-red-600'
              }`}
              style={{ width: `${confidence * 100}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {confidenceLevel.label} confidence level
          </p>
        </div>

        {/* Treatment Preview */}
        {treatments && treatments.length > 0 && !isHealthy && (
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-2">
              Recommended Treatment
            </h4>
            <div className="bg-green-50 rounded-xl p-3">
              <p className="text-sm text-green-800 line-clamp-2">
                {treatments[0]}
              </p>
              {treatments.length > 1 && (
                <p className="text-xs text-green-600 mt-1">
                  +{treatments.length - 1} more recommendations
                </p>
              )}
            </div>
          </div>
        )}

        {/* Healthy Message */}
        {isHealthy && (
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-medium text-green-800">
              Your crop is healthy!
            </p>
            <p className="text-xs text-green-600 mt-1">
              No disease or pest detected
            </p>
          </div>
        )}

        {/* Date */}
        <div className="flex items-center text-sm text-slate-500">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {formatDate(createdAt)}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => onViewDetails?.(id)}
            className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors text-sm"
          >
            View Details
          </button>
          <button
            onClick={() => onDownloadReport?.(id)}
            className="p-2.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl transition-colors"
            title="Download Report"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PredictionCard;
