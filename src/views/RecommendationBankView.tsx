import React, { useState } from 'react';
import { RecommendationRecord, SakipComponent } from '../types/sakip';
import {
  Database,
  Search,
  Filter,
  Copy,
  Edit,
  Trash2,
  FileSpreadsheet,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  History,
  Layers,
  Sparkles,
} from 'lucide-react';

interface RecommendationBankViewProps {
  recommendations: RecommendationRecord[];
  onOpenEditor: (rec: RecommendationRecord) => void;
  onOpenAuditTrail: (rec: RecommendationRecord) => void;
  onDeleteRecommendation: (id: string) => void;
  onDuplicateAsTemplate: (rec: RecommendationRecord) => void;
  onOpenReportModal: () => void;
}

export const RecommendationBankView: React.FC<RecommendationBankViewProps> = ({
  recommendations,
  onOpenEditor,
  onOpenAuditTrail,
  onDeleteRecommendation,
  onDuplicateAsTemplate,
  onOpenReportModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterComponent, setFilterComponent] = useState<string>('SEMUA');
  const [filterStatus, setFilterStatus] = useState<string>('SEMUA');
  const [filterAgency, setFilterAgency] = useState<string>('SEMUA');

  const agencies = ['SEMUA', ...Array.from(new Set(recommendations.map((r) => r.perangkatDaerah)))];

  const filteredRecommendations = recommendations.filter((r) => {
    const matchesSearch =
      searchQuery === '' ||
      r.rekomendasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.kondisiText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.pihakBertanggungJawab.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.perangkatDaerah.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesComp = filterComponent === 'SEMUA' || r.komponen === filterComponent;
    const matchesStatus = filterStatus === 'SEMUA' || r.status === filterStatus;
    const matchesAgency = filterAgency === 'SEMUA' || r.perangkatDaerah === filterAgency;

    return matchesSearch && matchesComp && matchesStatus && matchesAgency;
  });

  const getStatusBadge = (status: RecommendationRecord['status']) => {
    switch (status) {
      case 'DISETUJUI':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            DISETUJUI
          </span>
        );
      case 'REVIEW':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
            DALAM REVIEW
          </span>
        );
      case 'DRAFT':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            DRAFT
          </span>
        );
      case 'PERLU_REVISI':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
            PERLU REVISI
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Database className="w-6 h-6 text-emerald-600" />
            Bank Rekomendasi SAKIP
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Repositori resmi seluruh rekomendasi hasil evaluasi AKIP dengan fitur pelacakan versi dan duplikasi template
          </p>
        </div>

        <button
          onClick={onOpenReportModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Ekspor KKE / LHE (Excel & Word)
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari rekomendasi berdasarkan kata kunci, redaksi, penanggung jawab, atau kondisi..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <select
            value={filterAgency}
            onChange={(e) => setFilterAgency(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium"
          >
            {agencies.map((a) => (
              <option key={a} value={a}>
                {a === 'SEMUA' ? 'Semua Perangkat Daerah' : a}
              </option>
            ))}
          </select>

          <select
            value={filterComponent}
            onChange={(e) => setFilterComponent(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium"
          >
            <option value="SEMUA">Semua Komponen SAKIP</option>
            <option value="Perencanaan Kinerja">Perencanaan Kinerja</option>
            <option value="Pengukuran Kinerja">Pengukuran Kinerja</option>
            <option value="Pelaporan Kinerja">Pelaporan Kinerja</option>
            <option value="Evaluasi Akuntabilitas Kinerja Internal">Evaluasi Internal</option>
            <option value="Capaian Kinerja">Capaian Kinerja</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium"
          >
            <option value="SEMUA">Semua Status</option>
            <option value="DISETUJUI">Disetujui (LHE)</option>
            <option value="REVIEW">Dalam Review</option>
            <option value="DRAFT">Draft</option>
            <option value="PERLU_REVISI">Perlu Revisi</option>
          </select>

          <span className="ml-auto text-slate-500 font-semibold">
            Menampilkan <strong>{filteredRecommendations.length}</strong> dari {recommendations.length} data
          </span>
        </div>
      </div>

      {/* Recommendations Cards List */}
      <div className="space-y-4">
        {filteredRecommendations.map((rec) => (
          <div
            key={rec.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all space-y-3"
          >
            {/* Header info */}
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-900 text-sm">{rec.perangkatDaerah}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                    {rec.komponen}
                  </span>
                  <span className="text-xs text-slate-500">Tahun {rec.tahunEvaluasi}</span>
                  {getStatusBadge(rec.status)}
                </div>
                <p className="text-[11px] text-slate-500">
                  Subkomponen: {rec.subkomponen} • Auditor: {rec.auditorName} • Mode: {rec.modeFormulasi}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase">Keyakinan</span>
                <span className="text-xs font-bold text-emerald-700">
                  {rec.confidenceLevel} ({rec.confidenceScore}%)
                </span>
              </div>
            </div>

            {/* Rekomendasi box */}
            <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-950 uppercase tracking-wider block">
                  Rekomendasi Formal Auditor:
                </span>
                <span className="text-[11px] text-emerald-800 font-semibold">
                  PJ: {rec.pihakBertanggungJawab}
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-900 leading-relaxed bg-white p-3 rounded-lg border border-emerald-200">
                “{rec.rekomendasi}”
              </p>
            </div>

            {/* Condition preview */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
              <p>
                <strong>Kondisi Temuan:</strong> {rec.kondisiText}
              </p>
              <p className="text-[11px] text-slate-500">
                <strong>Dasar Hukum ({rec.dasarHukum.length}):</strong>{' '}
                {rec.dasarHukum.map((d) => `${d.regulationName} (${d.article})`).join('; ')}
              </p>
            </div>

            {/* Actions Toolbar */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenAuditTrail(rec)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Audit Trail
                </button>
                <button
                  type="button"
                  onClick={() => onDuplicateAsTemplate(rec)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-blue-600" />
                  Jadikan Template
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenEditor(rec)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Buka Editor
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Hapus rekomendasi untuk ${rec.perangkatDaerah}?`)) {
                      onDeleteRecommendation(rec.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Hapus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredRecommendations.length === 0 && (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 space-y-3">
            <Database className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold">Tidak ada rekomendasi yang sesuai dengan kriteria filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};
