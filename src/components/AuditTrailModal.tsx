import React from 'react';
import { RecommendationRecord } from '../types/sakip';
import { X, ArrowDown, ShieldCheck, FileText, CheckCircle2, Scale, BookOpen, AlertTriangle } from 'lucide-react';

interface AuditTrailModalProps {
  recommendation: RecommendationRecord | null;
  onClose: () => void;
}

export const AuditTrailModal: React.FC<AuditTrailModalProps> = ({ recommendation, onClose }) => {
  if (!recommendation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Penelusuran Dasar Rekomendasi (Audit Trail)
              </h3>
              <p className="text-xs text-slate-300">
                Traceability SAKIP: Rekomendasi ➔ Kondisi ➔ Kriteria ➔ Peraturan ➔ Pasal ➔ Bukti
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

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto bg-slate-50/50">
          {/* Node 1: Rekomendasi Final */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-sm relative">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-600 text-white">
                <CheckCircle2 className="w-3.5 h-3.5" /> 1. Rekomendasi Hasil Formulasi
              </span>
              <span className="text-xs text-emerald-800 font-medium">
                Pihak Penanggung Jawab: <strong className="font-semibold">{recommendation.pihakBertanggungJawab}</strong>
              </span>
            </div>
            <p className="text-slate-900 text-sm font-medium leading-relaxed bg-white p-3.5 rounded-lg border border-emerald-200/80">
              “{recommendation.rekomendasi}”
            </p>
            <div className="mt-2.5 flex items-center gap-4 text-xs text-slate-600">
              <span>Status: <strong className="text-emerald-700">{recommendation.status}</strong></span>
              <span>•</span>
              <span>Keyakinan: <strong className="text-emerald-700">{recommendation.confidenceLevel} ({recommendation.confidenceScore}%)</strong></span>
              <span>•</span>
              <span>Mode: {recommendation.modeFormulasi}</span>
            </div>
          </div>

          <div className="flex justify-center -my-2">
            <ArrowDown className="w-5 h-5 text-slate-400 animate-bounce" />
          </div>

          {/* Node 2: Kondisi Temuan */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-600 text-white">
                <AlertTriangle className="w-3.5 h-3.5" /> 2. Kondisi Temuan Aktual
              </span>
              <span className="text-xs text-amber-900 font-medium">
                {recommendation.perangkatDaerah} ({recommendation.tahunEvaluasi})
              </span>
            </div>
            <p className="text-slate-800 text-sm bg-white p-3 rounded-lg border border-amber-200/80 mb-2">
              {recommendation.kondisiText}
            </p>
            {recommendation.kesenjangan && (
              <div className="text-xs bg-amber-100/60 p-2.5 rounded text-amber-900">
                <strong>Analisis Kesenjangan (Gap):</strong> {recommendation.kesenjangan}
              </div>
            )}
          </div>

          <div className="flex justify-center -my-2">
            <ArrowDown className="w-5 h-5 text-slate-400" />
          </div>

          {/* Node 3: Kriteria SAKIP */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white">
                <Scale className="w-3.5 h-3.5" /> 3. Kriteria Evaluasi SAKIP
              </span>
              <span className="text-xs text-blue-800 font-semibold">
                Komponen: {recommendation.komponen}
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-blue-200/80 text-sm text-slate-800">
              <p className="font-semibold text-blue-950 mb-1">{recommendation.subkomponen}</p>
              <p className="text-slate-700">{recommendation.kriteriaText}</p>
            </div>
          </div>

          <div className="flex justify-center -my-2">
            <ArrowDown className="w-5 h-5 text-slate-400" />
          </div>

          {/* Node 4: Dasar Hukum Peraturan & Pasal */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-600 text-white">
                <BookOpen className="w-3.5 h-3.5" /> 4. Dasar Hukum & Ketentuan Tervalidasi
              </span>
              <span className="text-xs font-semibold text-indigo-700">
                {recommendation.dasarHukum.length} Peraturan Ditemukan di Database
              </span>
            </div>

            {recommendation.dasarHukum.length === 0 ? (
              <div className="p-4 bg-amber-100/70 border border-amber-300 rounded-lg text-xs text-amber-900">
                <strong>Pemberitahuan Auditor:</strong> Dasar hukum belum ditemukan dalam database. Auditor perlu melakukan verifikasi.
              </div>
            ) : (
              <div className="space-y-3 mt-3">
                {recommendation.dasarHukum.map((item, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-lg border border-indigo-200 shadow-xs">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h5 className="text-xs font-bold text-indigo-950 uppercase tracking-wide">
                        {item.regulationName}
                      </h5>
                      <span className="shrink-0 px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
                        {item.article} {item.page ? `(${item.page})` : ''}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs text-slate-800 font-mono italic my-2">
                      “{item.citation}”
                    </div>
                    <p className="text-xs text-indigo-900">
                      <strong>Alasan Relevansi:</strong> {item.relevanceReason}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-center -my-2">
            <ArrowDown className="w-5 h-5 text-slate-400" />
          </div>

          {/* Node 5: Bukti Pendukung */}
          <div className="bg-slate-100 border border-slate-300 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700 text-white">
                <FileText className="w-3.5 h-3.5" /> 5. Bukti Fisik & Fakta Pendukung
              </span>
              <span className="text-xs text-slate-600 font-medium">
                Auditor: {recommendation.auditorName}
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1.5">
              <p><strong>Akar Masalah (Root Cause):</strong> {recommendation.penyebab || 'Belum diisi'}</p>
              <p><strong>Dampak Nyata:</strong> {recommendation.dampak || 'Belum diisi'}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Diverifikasi oleh sistem SAKIP Formulator APIP • Integritas rantai pembuktian terjamin
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Tutup Penelusuran
          </button>
        </div>
      </div>
    </div>
  );
};
