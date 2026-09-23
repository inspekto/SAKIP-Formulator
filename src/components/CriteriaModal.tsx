import React, { useState } from 'react';
import { SakipCriteria, SakipComponent, Regulation } from '../types/sakip';
import { X, Scale, Save } from 'lucide-react';

interface CriteriaModalProps {
  criteria?: SakipCriteria | null;
  availableRegulations: Regulation[];
  onClose: () => void;
  onSave: (crit: SakipCriteria) => void;
}

export const CriteriaModal: React.FC<CriteriaModalProps> = ({
  criteria,
  availableRegulations,
  onClose,
  onSave,
}) => {
  const [komponen, setKomponen] = useState<SakipComponent>(criteria?.komponen || 'Perencanaan Kinerja');
  const [kode, setKode] = useState(criteria?.kode || 'A.1.5');
  const [subkomponen, setSubkomponen] = useState(criteria?.subkomponen || '');
  const [kriteria, setKriteria] = useState(criteria?.kriteria || '');
  const [indikator, setIndikator] = useState(criteria?.indikator || '');
  const [pertanyaanEvaluasi, setPertanyaanEvaluasi] = useState(criteria?.pertanyaanEvaluasi || '');
  const [buktiDukungInput, setBuktiDukungInput] = useState(criteria?.buktiDukung.join('\n') || '');
  const [dasarHukumDisplay, setDasarHukumDisplay] = useState(criteria?.dasarHukumDisplay || '');
  const [bobotNilai, setBobotNilai] = useState(criteria?.bobotNilai || 5.0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kriteria.trim() || !subkomponen.trim()) return;

    const saved: SakipCriteria = {
      id: criteria?.id || `crit-${Date.now()}`,
      kode,
      komponen,
      subkomponen,
      kriteria,
      indikator,
      pertanyaanEvaluasi,
      buktiDukung: buktiDukungInput.split('\n').map(s => s.trim()).filter(Boolean),
      dasarHukumIds: criteria?.dasarHukumIds || [],
      dasarHukumDisplay,
      bobotNilai: Number(bobotNilai),
    };

    onSave(saved);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {criteria ? 'Edit Kriteria Evaluasi SAKIP' : 'Tambah Kriteria Evaluasi SAKIP'}
              </h3>
              <p className="text-xs text-slate-300">
                Standar Kriteria Penilaian Berdasarkan PermenPANRB No. 88 Tahun 2021
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto bg-slate-50/50">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Komponen SAKIP:
              </label>
              <select
                value={komponen}
                onChange={(e) => setKomponen(e.target.value as SakipComponent)}
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg font-semibold"
              >
                <option value="Perencanaan Kinerja">A. Perencanaan Kinerja</option>
                <option value="Pengukuran Kinerja">B. Pengukuran Kinerja</option>
                <option value="Pelaporan Kinerja">C. Pelaporan Kinerja</option>
                <option value="Evaluasi Akuntabilitas Kinerja Internal">D. Evaluasi Internal</option>
                <option value="Capaian Kinerja">E. Capaian Kinerja</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Kode / Nomor:
              </label>
              <input
                type="text"
                value={kode}
                onChange={(e) => setKode(e.target.value)}
                placeholder="A.1.1"
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Subkomponen:
            </label>
            <input
              type="text"
              value={subkomponen}
              onChange={(e) => setSubkomponen(e.target.value)}
              placeholder="Contoh: Kualitas Perencanaan Kinerja / Cascading & Crosscutting"
              className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg font-medium"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Kriteria Yang Seharusnya:
            </label>
            <input
              type="text"
              value={kriteria}
              onChange={(e) => setKriteria(e.target.value)}
              placeholder="Contoh: Keterkaitan dan keselarasan sasaran Renstra dengan RPJMD"
              className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg font-semibold"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Indikator Kriteria:
            </label>
            <textarea
              rows={2}
              value={indikator}
              onChange={(e) => setIndikator(e.target.value)}
              placeholder="Uraian indikator pemenuhan kriteria..."
              className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Pertanyaan Evaluasi (Uji Petik Auditor):
            </label>
            <textarea
              rows={2}
              value={pertanyaanEvaluasi}
              onChange={(e) => setPertanyaanEvaluasi(e.target.value)}
              placeholder="Apakah seluruh sasaran strategis selaras..."
              className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Bukti Dukung Yang Dipersyaratkan (Satu per baris):
            </label>
            <textarea
              rows={3}
              value={buktiDukungInput}
              onChange={(e) => setBuktiDukungInput(e.target.value)}
              placeholder="Renstra Perangkat Daerah&#10;RPJMD Daerah&#10;Pohon Kinerja"
              className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Dasar Hukum Rujukan:
              </label>
              <input
                type="text"
                value={dasarHukumDisplay}
                onChange={(e) => setDasarHukumDisplay(e.target.value)}
                placeholder="PermenPANRB No. 88/2021 Lampiran I"
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Bobot Nilai (%):
              </label>
              <input
                type="number"
                step="0.1"
                value={bobotNilai}
                onChange={(e) => setBobotNilai(Number(e.target.value))}
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg font-bold"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs"
            >
              <Save className="w-4 h-4" />
              Simpan Kriteria SAKIP
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
