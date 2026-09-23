import React, { useState } from 'react';
import { ConditionEvaluation, SakipCriteria } from '../types/sakip';
import {
  ArrowLeftRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Filter,
  FileCheck,
  Search,
  Building2,
  X,
  Layers,
} from 'lucide-react';

interface ComparisonMatrixViewProps {
  conditions: ConditionEvaluation[];
  criteriaList: SakipCriteria[];
}

export const ComparisonMatrixView: React.FC<ComparisonMatrixViewProps> = ({
  conditions,
  criteriaList,
}) => {
  const [agencyInput, setAgencyInput] = useState<string>('');
  const [selectedComp, setSelectedComp] = useState<string>('SEMUA');

  // Daftar perangkat daerah unik yang ada di data
  const existingAgencies = Array.from(
    new Set(conditions.map((c) => c.perangkatDaerah).filter(Boolean))
  );

  const filteredConditions = conditions.filter((c) => {
    const matchesAgency =
      !agencyInput.trim() ||
      agencyInput.trim().toUpperCase() === 'SEMUA' ||
      c.perangkatDaerah.toLowerCase().includes(agencyInput.trim().toLowerCase());
    const matchesComp = selectedComp === 'SEMUA' || c.komponen === selectedComp;
    return matchesAgency && matchesComp;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <ArrowLeftRight className="w-6 h-6 text-indigo-600" />
            Matriks Perbandingan (Kondisi vs Kriteria)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Analisis kesenjangan (Gap Analysis) antara kondisi empiris perangkat daerah terhadap kriteria normatif SAKIP
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 bg-indigo-50 text-indigo-800 rounded-xl border border-indigo-200">
            Total Temuan: {conditions.length} ({filteredConditions.length} Tampil)
          </span>
        </div>
      </div>

      {/* Filter Toolbar with Manual OPD Input */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 text-xs">
          {/* Manual Input for Perangkat Daerah */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="matrix-agency-input" className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                Perangkat Daerah (Ketik Manual):
              </label>
              <span className="text-[10px] text-slate-500 font-medium">
                (Ketik bebas / cari nama OPD)
              </span>
            </div>
            <div className="relative">
              <input
                id="matrix-agency-input"
                type="text"
                list="matrix-agency-list"
                value={agencyInput}
                onChange={(e) => setAgencyInput(e.target.value)}
                placeholder="Ketik manual nama Perangkat Daerah (misal: Dinas Kesehatan, Bappeda, Inspektorat...)"
                className="w-full text-xs pl-8 pr-8 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:font-normal placeholder:text-slate-400"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {agencyInput && (
                <button
                  type="button"
                  onClick={() => setAgencyInput('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 rounded-full"
                  title="Hapus filter nama OPD"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <datalist id="matrix-agency-list">
                {existingAgencies.map((ag) => (
                  <option key={ag} value={ag} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Component Filter */}
          <div className="md:w-64">
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1.5">
              Komponen SAKIP:
            </label>
            <select
              value={selectedComp}
              onChange={(e) => setSelectedComp(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="SEMUA">Semua Komponen SAKIP</option>
              <option value="Perencanaan Kinerja">Perencanaan Kinerja</option>
              <option value="Pengukuran Kinerja">Pengukuran Kinerja</option>
              <option value="Pelaporan Kinerja">Pelaporan Kinerja</option>
              <option value="Evaluasi Akuntabilitas Kinerja Internal">Evaluasi Akuntabilitas Internal</option>
              <option value="Capaian Kinerja">Capaian Kinerja</option>
            </select>
          </div>
        </div>

        {/* Quick Selection Chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100 text-[11px]">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Pilihan Cepat:</span>
          <button
            type="button"
            onClick={() => setAgencyInput('')}
            className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold transition-colors border ${
              !agencyInput
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
            }`}
          >
            Semua OPD
          </button>
          {existingAgencies.map((ag) => (
            <button
              key={ag}
              type="button"
              onClick={() => setAgencyInput(ag)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors border ${
                agencyInput.trim().toLowerCase() === ag.toLowerCase()
                  ? 'bg-indigo-100 text-indigo-900 border-indigo-300 font-bold'
                  : 'bg-slate-50 hover:bg-indigo-50 hover:text-indigo-800 text-slate-600 border-slate-200'
              }`}
            >
              {ag}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredConditions.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">
              Tidak Ada Data Temuan yang Sesuai
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              {agencyInput
                ? `Tidak ditemukan kondisi evaluasi untuk Perangkat Daerah "${agencyInput}". Anda dapat mengetik nama lain atau menghapus filter.`
                : 'Belum ada kondisi evaluasi yang sesuai dengan filter yang dipilih.'}
            </p>
            {agencyInput && (
              <button
                type="button"
                onClick={() => setAgencyInput('')}
                className="mt-2 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
              >
                Reset Filter Perangkat Daerah
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white uppercase text-[11px] tracking-wider">
                  <th className="p-3.5 w-12 text-center">No</th>
                  <th className="p-3.5 w-48">Perangkat Daerah & Aspek</th>
                  <th className="p-3.5 w-1/4">Kondisi Aktual (Fakta)</th>
                  <th className="p-3.5 w-1/4">Kriteria Normatif (Standar SAKIP)</th>
                  <th className="p-3.5 w-1/4">Kesenjangan (Gap)</th>
                  <th className="p-3.5 w-32 text-center">Status Bukti</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredConditions.map((cond, idx) => {
                  // derive status bukti
                  const hasEvidence = cond.buktiDukung && cond.buktiDukung.length > 15;
                  const statusBukti = hasEvidence
                    ? 'Ada Sebagian'
                    : cond.dokumenBuktiUrl
                    ? 'Ada (Sesuai)'
                    : 'Tidak Ada';

                  return (
                    <tr key={cond.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 text-center font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 block">{cond.perangkatDaerah}</span>
                        <span className="text-indigo-700 font-semibold text-[11px] block mt-0.5">
                          {cond.komponen}
                        </span>
                        <span className="text-slate-400 text-[10px] block">
                          {cond.subkomponen}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-800 leading-relaxed font-medium">
                        {cond.kondisi}
                      </td>
                      <td className="p-3.5 text-slate-700 leading-relaxed">
                        {cond.criteriaText}
                      </td>
                      <td className="p-3.5 text-slate-800 leading-relaxed bg-amber-50/40">
                        {cond.permasalahan ? (
                          <>
                            <strong className="text-amber-950 block">Akar Masalah:</strong>
                            {cond.permasalahan}
                          </>
                        ) : (
                          'Kondisi aktual belum memenuhi kriteria SAKIP secara optimal.'
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        {statusBukti === 'Ada (Sesuai)' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" /> Ada (Sesuai)
                          </span>
                        ) : statusBukti === 'Ada Sebagian' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            <AlertTriangle className="w-3 h-3" /> Ada Sebagian
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            <XCircle className="w-3 h-3" /> Belum Lengkap
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
