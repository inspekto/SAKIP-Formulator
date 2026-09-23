import React, { useState } from 'react';
import { SakipCriteria, SakipComponent } from '../types/sakip';
import {
  Scale,
  Search,
  Plus,
  Edit,
  Trash2,
  FileCheck,
  HelpCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface CriteriaViewProps {
  criteria: SakipCriteria[];
  onAddCriteria: () => void;
  onEditCriteria: (crit: SakipCriteria) => void;
  onDeleteCriteria: (id: string) => void;
}

const COMPONENTS: Array<{ name: SakipComponent; weight: string; code: string }> = [
  { name: 'Perencanaan Kinerja', weight: '30%', code: 'A' },
  { name: 'Pengukuran Kinerja', weight: '30%', code: 'B' },
  { name: 'Pelaporan Kinerja', weight: '15%', code: 'C' },
  { name: 'Evaluasi Akuntabilitas Kinerja Internal', weight: '10%', code: 'D' },
  { name: 'Capaian Kinerja', weight: '15%', code: 'E' },
];

export const CriteriaView: React.FC<CriteriaViewProps> = ({
  criteria,
  onAddCriteria,
  onEditCriteria,
  onDeleteCriteria,
}) => {
  const [activeComponent, setActiveComponent] = useState<SakipComponent>('Perencanaan Kinerja');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredCriteria = criteria.filter((c) => {
    const matchesComp = c.komponen === activeComponent;
    const matchesSearch =
      searchQuery === '' ||
      c.kriteria.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subkomponen.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.indikator.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesComp && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Scale className="w-6 h-6 text-indigo-600" />
            Kriteria Evaluasi SAKIP
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Standar Kriteria Penilaian Evaluasi Akuntabilitas Kinerja Perangkat Daerah (PermenPANRB No. 88 Tahun 2021)
          </p>
        </div>

        <button
          onClick={onAddCriteria}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Kriteria SAKIP
        </button>
      </div>

      {/* Component Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {COMPONENTS.map((comp) => {
          const isActive = activeComponent === comp.name;
          const count = criteria.filter((c) => c.komponen === comp.name).length;

          return (
            <button
              key={comp.code}
              onClick={() => setActiveComponent(comp.name)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                isActive
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-indigo-500/30 text-indigo-300' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Komponen {comp.code}
                </span>
                <span
                  className={`text-xs font-bold ${
                    isActive ? 'text-emerald-400' : 'text-emerald-700'
                  }`}
                >
                  Bobot {comp.weight}
                </span>
              </div>
              <h4 className="text-xs font-bold mt-2 truncate">{comp.name}</h4>
              <p
                className={`text-[10px] mt-0.5 ${
                  isActive ? 'text-slate-300' : 'text-slate-400'
                }`}
              >
                {count} Kriteria Acuan
              </p>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Cari kriteria dalam komponen ${activeComponent}...`}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Criteria List */}
      <div className="space-y-3">
        {filteredCriteria.map((item) => {
          const isExpanded = expandedId === item.id;

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden hover:border-indigo-300 transition-all"
            >
              <div className="p-5 flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-indigo-100 text-indigo-800 border border-indigo-200">
                      {item.kode}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {item.subkomponen}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 ml-auto">
                      Bobot: {item.bobotNilai}%
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {item.kriteria}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong>Indikator:</strong> {item.indikator}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    title={isExpanded ? 'Sembunyikan Rincian' : 'Lihat Rincian'}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => onEditCriteria(item)}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit Kriteria"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus kriteria ${item.kode}?`)) {
                        onDeleteCriteria(item.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Hapus Kriteria"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expandable Details: Bukti Dukung & Pertanyaan Evaluasi & Dasar Hukum */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/70 text-xs space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                        Pertanyaan Evaluasi (Uji Petik):
                      </span>
                      <p className="text-slate-600">{item.pertanyaanEvaluasi || '-'}</p>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                        Dasar Hukum Rujukan:
                      </span>
                      <p className="text-slate-600 font-medium">
                        {item.dasarHukumDisplay || 'PermenPANRB Nomor 88 Tahun 2021'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Bukti Dukung Yang Dipersyaratkan:
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      {item.buktiDukung.map((b, idx) => (
                        <li key={idx}>{b}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
