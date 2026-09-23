import React, { useState } from 'react';
import { EvidenceDocument } from '../types/sakip';
import { callAuditEvidence } from '../services/aiService';
import {
  FolderLock,
  Upload,
  Sparkles,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  Search,
  Check,
} from 'lucide-react';

interface EvidenceViewProps {
  evidenceList: EvidenceDocument[];
  onSaveEvidence: (doc: EvidenceDocument) => void;
}

const DOCUMENT_TYPES = [
  'Renstra (Rencana Strategis)',
  'Renja (Rencana Kerja Tahunan)',
  'Perjanjian Kinerja (PK)',
  'Indikator Kinerja Utama (IKU)',
  'Pohon Kinerja / Cascading',
  'LKjIP (Laporan Kinerja)',
  'Laporan Monev Triwulanan',
  'Laporan Hasil Evaluasi Internal',
];

export const EvidenceView: React.FC<EvidenceViewProps> = ({
  evidenceList,
  onSaveEvidence,
}) => {
  const [agency, setAgency] = useState('Dinas Kesehatan');
  const [docType, setDocType] = useState(DOCUMENT_TYPES[0]);
  const [fileName, setFileName] = useState('');
  const [snippetText, setSnippetText] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<{
    ringkasanTemuan: string;
    statusReview: string;
    potensiGap: string[];
    rekomendasiAwal: string;
  } | null>(null);

  const handleAuditDocument = async () => {
    if (!snippetText.trim()) {
      alert('Masukkan cuplikan teks isi dokumen bukti!');
      return;
    }

    setIsAuditing(true);
    setAuditResult(null);

    try {
      const res = await callAuditEvidence(docType, snippetText, agency);
      setAuditResult(res);

      const newDoc: EvidenceDocument = {
        id: `ev-${Date.now()}`,
        perangkatDaerah: agency,
        jenisDokumen: docType,
        namaFile: fileName || `${docType.replace(/\s+/g, '_')}_${agency.replace(/\s+/g, '_')}.pdf`,
        fileSize: '2.4 MB',
        contentSnippet: snippetText,
        aiReviewSummary: res.ringkasanTemuan,
        aiReviewStatus: res.statusReview as any,
        uploadedAt: new Date().toISOString(),
      };

      onSaveEvidence(newDoc);
    } catch (err: any) {
      alert('Pemeriksaan dokumen gagal: ' + err.message);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <FolderLock className="w-6 h-6 text-indigo-600" />
            Dokumen Bukti & Analisis Otomatis (Document Intelligence)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Uji petik digital terhadap dokumen perencanaan, pengukuran, dan pelaporan kinerja perangkat daerah
          </p>
        </div>
      </div>

      {/* Document Reviewer Tool Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
          Uji Petik Dokumen Bukti Fisik
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Perangkat Daerah:
            </label>
            <input
              type="text"
              value={agency}
              onChange={(e) => setAgency(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Jenis Dokumen SAKIP:
            </label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
            >
              {DOCUMENT_TYPES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Nama File:
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Contoh: Renstra_Dinkes_2024.pdf"
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span>Cuplikan Teks Dokumen (Tabel Matriks Kinerja / Bab III / IKU):</span>
            <button
              type="button"
              onClick={() => {
                setSnippetText(`BAB IV: TARGET KINERJA DAN KERANGKA PENDANAAN
Sasaran Strategis: Meningkatnya derajat kesehatan masyarakat
Indikator Kinerja Utama:
1. Jumlah puskesmas terakreditasi paripurna (Target: 15 Unit, Realisasi: 15 Unit, 100%)
2. Jumlah pengadaan obat esensial (Target: 25 Paket, Realisasi: 25 Paket, 100%)
3. Angka Harapan Hidup (Target: 73.5 Tahun, Realisasi: 72.8 Tahun, 99.04%)
Catatan Renstra: Belum ada penjelasan teknis formulasi perhitungan indikator operasional.`);
              }}
              className="text-[11px] font-bold text-indigo-600 hover:underline"
            >
              + Muat Contoh Teks Cuplikan IKU
            </button>
          </label>
          <textarea
            rows={5}
            value={snippetText}
            onChange={(e) => setSnippetText(e.target.value)}
            className="w-full text-xs p-3 bg-white border border-slate-300 rounded-xl font-mono leading-relaxed"
            placeholder="Salin atau ketik isi teks cuplikan bab dokumen kinerja..."
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleAuditDocument}
            disabled={isAuditing}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            {isAuditing ? 'Sedang Menganalisis Dokumen...' : 'Analisis Kualitas Dokumen Bukti'}
          </button>
        </div>

        {/* Audit Result Display */}
        {auditResult && (
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs space-y-3 mt-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-bold text-slate-900 uppercase tracking-wider">
                Hasil Telaah Otomatis APIP:
              </span>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                  auditResult.statusReview === 'Sesuai'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                Status: {auditResult.statusReview}
              </span>
            </div>

            <p className="text-slate-800 font-medium leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
              {auditResult.ringkasanTemuan}
            </p>

            {auditResult.potensiGap && auditResult.potensiGap.length > 0 && (
              <div className="space-y-1">
                <span className="font-bold text-amber-900">Potensi Kesenjangan (Gap) Terdeteksi:</span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                  {auditResult.potensiGap.map((gap, i) => (
                    <li key={i}>{gap}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-emerald-950">
              <strong>Rekomendasi Awal:</strong> {auditResult.rekomendasiAwal}
            </div>
          </div>
        )}
      </div>

      {/* Uploaded / Reviewed Evidence List */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Arsip Dokumen Bukti Terekam ({evidenceList.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {evidenceList.map((doc) => (
            <div
              key={doc.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 text-xs space-y-2 hover:bg-white transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{doc.perangkatDaerah}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                  {doc.jenisDokumen}
                </span>
              </div>
              <p className="text-slate-600 font-mono text-[11px] truncate">
                File: {doc.namaFile} ({doc.fileSize})
              </p>
              {doc.aiReviewSummary && (
                <p className="text-slate-700 bg-white p-2 rounded border border-slate-200 text-[11px]">
                  <strong>Catatan APIP:</strong> {doc.aiReviewSummary}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
