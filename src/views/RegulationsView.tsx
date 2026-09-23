import React, { useState } from 'react';
import { Regulation } from '../types/sakip';
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  Upload,
  Eye,
  Trash2,
  Edit,
  CheckCircle2,
  Copy,
  FileText,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface RegulationsViewProps {
  regulations: Regulation[];
  onAddRegulation: () => void;
  onEditRegulation: (reg: Regulation) => void;
  onDeleteRegulation: (id: string) => void;
}

export const RegulationsView: React.FC<RegulationsViewProps> = ({
  regulations,
  onAddRegulation,
  onEditRegulation,
  onDeleteRegulation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJenis, setSelectedJenis] = useState<string>('SEMUA');
  const [selectedTahun, setSelectedTahun] = useState<string>('SEMUA');
  const [previewReg, setPreviewReg] = useState<Regulation | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const availableYears = Array.from(new Set(regulations.map((r) => r.tahun.toString()))).sort((a, b) => Number(b) - Number(a));
  const availableJenis = Array.from(new Set(regulations.map((r) => r.jenis)));

  const filteredRegulations = regulations.filter((reg) => {
    const matchesSearch =
      searchQuery === '' ||
      reg.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.nomor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.topik.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      reg.kataKunci.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase())) ||
      reg.articles.some((a) => a.text.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesJenis = selectedJenis === 'SEMUA' || reg.jenis === selectedJenis;
    const matchesTahun = selectedTahun === 'SEMUA' || reg.tahun.toString() === selectedTahun;

    return matchesSearch && matchesJenis && matchesTahun;
  });

  const handleCopyCitation = (citation: string, id: string) => {
    navigator.clipboard.writeText(citation);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            Database Peraturan & Regulasi SAKIP
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Basis data referensi hukum resmi untuk penelusuran kriteria dan perumusan rekomendasi auditor
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onAddRegulation}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Upload className="w-4 h-4" />
            Unggah / Tambah Peraturan
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari peraturan berdasarkan nomor, tahun, judul, pasal, atau kata kunci..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedJenis}
            onChange={(e) => setSelectedJenis(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium"
          >
            <option value="SEMUA">Semua Jenis Peraturan</option>
            {availableJenis.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>

          <select
            value={selectedTahun}
            onChange={(e) => setSelectedTahun(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium"
          >
            <option value="SEMUA">Semua Tahun</option>
            {availableYears.map((y) => (
              <option key={y} value={y}>
                Tahun {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Regulations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRegulations.map((reg) => (
          <div
            key={reg.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200 uppercase tracking-wider">
                  {reg.jenis}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  Tahun {reg.tahun}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {reg.jenis} {reg.nomor} Tahun {reg.tahun}
                </h3>
                <p className="text-xs font-medium text-slate-600 mt-1">
                  tentang {reg.judul}
                </p>
              </div>

              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {reg.ringkasan}
              </p>

              {/* Topics */}
              <div className="flex flex-wrap gap-1 pt-1">
                {reg.topik.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Actions & Articles Info */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-blue-700">
                {reg.articles.length} Ketentuan / Pasal Terekstrak
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPreviewReg(reg)}
                  className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Lihat Detail Pasal & Preview"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onEditRegulation(reg)}
                  className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Edit Metadata & Pasal"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Hapus peraturan ${reg.jenis} ${reg.nomor}?`)) {
                      onDeleteRegulation(reg.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Hapus Peraturan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredRegulations.length === 0 && (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 space-y-3">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold">Tidak ditemukan peraturan yang sesuai kriteria pencarian.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedJenis('SEMUA');
                setSelectedTahun('SEMUA');
              }}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Reset Filter Pencarian
            </button>
          </div>
        )}
      </div>

      {/* Preview Regulation Drawer / Modal */}
      {previewReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                  Pratinjau Ketentuan Resmi
                </span>
                <h3 className="text-base font-bold text-white">
                  {previewReg.jenis} {previewReg.nomor} Tahun {previewReg.tahun}
                </h3>
                <p className="text-xs text-slate-300">tentang {previewReg.judul}</p>
              </div>
              <button
                onClick={() => setPreviewReg(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4 bg-slate-50/50">
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs space-y-1">
                <p><strong>Penerbit:</strong> {previewReg.penerbit}</p>
                <p><strong>Tanggal Penetapan:</strong> {previewReg.tanggalPenetapan}</p>
                <p><strong>File Dokumen:</strong> {previewReg.fileName} ({previewReg.fileSize})</p>
                <p><strong>Ringkasan:</strong> {previewReg.ringkasan}</p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Daftar Pasal & Ketentuan Terekstrak ({previewReg.articles.length}):
                </h4>

                {previewReg.articles.map((art) => {
                  const label = [art.bab, art.pasal, art.ayat, art.lampiran].filter(Boolean).join(' ');
                  return (
                    <div
                      key={art.id}
                      className="bg-white p-4 rounded-xl border border-slate-200 text-xs space-y-2 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-900">{label}</span>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-semibold">
                            {art.topic}
                          </span>
                          <button
                            onClick={() => handleCopyCitation(art.text, art.id)}
                            className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-blue-700 font-semibold"
                            title="Salin Kutipan"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            {copiedId === art.id ? 'Tersalin!' : 'Salin'}
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-700 leading-relaxed font-mono italic bg-slate-50 p-2.5 rounded border border-slate-200">
                        “{art.text}”
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white px-6 py-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setPreviewReg(null)}
                className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
