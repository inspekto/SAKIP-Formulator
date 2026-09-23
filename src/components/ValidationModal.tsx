import React from 'react';
import { RecommendationValidation } from '../types/sakip';
import { X, CheckCircle2, AlertTriangle, XCircle, ShieldAlert, Sparkles } from 'lucide-react';

interface ValidationModalProps {
  validation: RecommendationValidation | null;
  recommendationText: string;
  onClose: () => void;
  onApplyFix?: () => void;
}

export const ValidationModal: React.FC<ValidationModalProps> = ({
  validation,
  recommendationText,
  onClose,
  onApplyFix,
}) => {
  if (!validation) return null;

  const getStatusBadge = (status: RecommendationValidation['overallStatus']) => {
    switch (status) {
      case 'Sesuai':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            STATUS: SESUAI (Lolos Validasi)
          </span>
        );
      case 'Perlu Penyempurnaan':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            STATUS: PERLU PENYEMPURNAAN
          </span>
        );
      case 'Tidak Didukung Database':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-4 h-4 text-rose-600" />
            STATUS: TIDAK DIDUKUNG DATABASE
          </span>
        );
    }
  };

  const getItemIcon = (status: 'SESUAI' | 'PERLU_PERBAIKAN' | 'TIDAK_TERPENUHI') => {
    switch (status) {
      case 'SESUAI':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />;
      case 'PERLU_PERBAIKAN':
        return <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />;
      case 'TIDAK_TERPENUHI':
        return <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg border border-indigo-500/30">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Hasil Uji Kesesuaian Rekomendasi
                <Sparkles className="w-4 h-4 text-indigo-300" />
              </h3>
              <p className="text-xs text-slate-300">
                Pengecekan Kepatuhan 9 Parameter Standar Mutu APIP / Dalnis SAKIP
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto bg-slate-50/50">
          {/* Status Header Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kesimpulan Uji Validasi:</span>
              {getStatusBadge(validation.overallStatus)}
            </div>
            <p className="text-sm text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200/80">
              {validation.summary}
            </p>
          </div>

          {/* Tested Recommendation Preview */}
          <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-200">
            <span className="text-xs font-bold text-indigo-900 uppercase tracking-wide block mb-1">
              Rekomendasi yang Diuji:
            </span>
            <p className="text-sm font-medium text-slate-900 italic">
              “{recommendationText}”
            </p>
          </div>

          {/* 9 Checklist Items */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Rincian 9 Parameter Pengujian APIP:
            </h4>
            <div className="grid grid-cols-1 gap-2.5">
              {validation.items.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-lg border text-xs transition-all ${
                    item.status === 'SESUAI'
                      ? 'bg-emerald-50/60 border-emerald-200 text-slate-800'
                      : item.status === 'PERLU_PERBAIKAN'
                      ? 'bg-amber-50/80 border-amber-200 text-slate-800'
                      : 'bg-rose-50/80 border-rose-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {getItemIcon(item.status)}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-900">
                          {item.id}. {item.question}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            item.status === 'SESUAI'
                              ? 'bg-emerald-200/70 text-emerald-900'
                              : item.status === 'PERLU_PERBAIKAN'
                              ? 'bg-amber-200/70 text-amber-900'
                              : 'bg-rose-200/70 text-rose-900'
                          }`}
                        >
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{item.explanation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {validation.checkedAt ? `Waktu Uji: ${new Date(validation.checkedAt).toLocaleString('id-ID')}` : ''}
          </div>
          <div className="flex items-center gap-2">
            {onApplyFix && validation.overallStatus !== 'Sesuai' && (
              <button
                onClick={onApplyFix}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Buka Editor untuk Penyempurnaan
              </button>
            )}
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
