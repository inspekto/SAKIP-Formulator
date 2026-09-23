import React, { useState } from 'react';
import { RecommendationRecord, RecommendationValidation } from '../types/sakip';
import { callValidateRecommendation } from '../services/aiService';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  RefreshCw,
  Search,
  ExternalLink,
} from 'lucide-react';

interface ValidationViewProps {
  recommendations: RecommendationRecord[];
  onOpenEditor: (rec: RecommendationRecord) => void;
}

export const ValidationView: React.FC<ValidationViewProps> = ({
  recommendations,
  onOpenEditor,
}) => {
  const [selectedRecId, setSelectedRecId] = useState<string>(
    recommendations[0]?.id || ''
  );
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<RecommendationValidation | null>(null);

  const activeRec = recommendations.find((r) => r.id === selectedRecId) || recommendations[0];

  const handleRunValidation = async () => {
    if (!activeRec) return;

    setIsValidating(true);
    setValidationResult(null);

    try {
      const res = await callValidateRecommendation({
        recommendationText: activeRec.rekomendasi,
        conditionText: activeRec.kondisiText,
        criteriaText: activeRec.kriteriaText,
        legalBasisList: activeRec.dasarHukum,
        agency: activeRec.perangkatDaerah,
      });

      setValidationResult({
        recommendationId: activeRec.id,
        overallStatus: res.overallStatus,
        summary: res.summary,
        items: res.items,
        checkedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      alert('Validasi gagal: ' + err.message);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-indigo-600" />
            Cek Kesesuaian & Validasi Rekomendasi (Standar Mutu APIP)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Uji kepatuhan 9 parameter objektif sebelum rekomendasi disetujui dalam Laporan Hasil Evaluasi (LHE)
          </p>
        </div>
      </div>

      {/* Target Recommendation Selector */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
          Pilih Rekomendasi dari Bank untuk Diuji:
        </label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <select
              value={selectedRecId}
              onChange={(e) => {
                setSelectedRecId(e.target.value);
                setValidationResult(null);
              }}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900"
            >
              {recommendations.map((r) => (
                <option key={r.id} value={r.id}>
                  [{r.perangkatDaerah}] ({r.komponen}) - “{r.rekomendasi.substring(0, 80)}...”
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleRunValidation}
            disabled={isValidating || !activeRec}
            className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all ${
              isValidating
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20'
            }`}
          >
            {isValidating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Sedang Menguji 9 Parameter...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Jalankan Pengujian 9 Parameter
              </>
            )}
          </button>
        </div>

        {/* Selected Recommendation Summary */}
        {activeRec && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-bold text-slate-800">
                {activeRec.perangkatDaerah} • Status: <span className="text-emerald-700 font-extrabold">{activeRec.status}</span>
              </span>
              <span className="text-slate-500 font-semibold">
                Penanggung Jawab: {activeRec.pihakBertanggungJawab}
              </span>
            </div>
            <p className="text-slate-900 font-medium italic bg-white p-3 rounded-lg border border-slate-200">
              “{activeRec.rekomendasi}”
            </p>
          </div>
        )}
      </div>

      {/* Validation Result Details */}
      {validationResult && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-6 animate-in fade-in duration-300">
          {/* Status Header */}
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Hasil Uji Kelayakan Formal Dalnis
              </span>
              <h3 className="text-base font-black text-slate-900 mt-0.5">
                {validationResult.summary}
              </h3>
            </div>

            <div>
              {validationResult.overallStatus === 'Sesuai' ? (
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  STATUS: SESUAI (LOLOS STANDAR MUTU)
                </span>
              ) : validationResult.overallStatus === 'Perlu Penyempurnaan' ? (
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-amber-100 text-amber-800 border border-amber-300">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  STATUS: PERLU PENYEMPURNAAN
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-rose-100 text-rose-800 border border-rose-300">
                  <XCircle className="w-5 h-5 text-rose-600" />
                  STATUS: TIDAK DIDUKUNG DATABASE
                </span>
              )}
            </div>
          </div>

          {/* 9 Checklist Cards */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Rincian Evaluasi 9 Parameter Uji Mutu APIP:
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {validationResult.items.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border text-xs space-y-1.5 transition-all ${
                    item.status === 'SESUAI'
                      ? 'bg-emerald-50/70 border-emerald-200'
                      : item.status === 'PERLU_PERBAIKAN'
                      ? 'bg-amber-50/80 border-amber-200'
                      : 'bg-rose-50/80 border-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900">
                      {item.id}. {item.question}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                        item.status === 'SESUAI'
                          ? 'bg-emerald-200/80 text-emerald-900'
                          : item.status === 'PERLU_PERBAIKAN'
                          ? 'bg-amber-200/80 text-amber-900'
                          : 'bg-rose-200/80 text-rose-900'
                      }`}
                    >
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{item.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action button */}
          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              type="button"
              onClick={() => onOpenEditor(activeRec)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Buka Rekomendasi di Editor untuk Perbaikan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
