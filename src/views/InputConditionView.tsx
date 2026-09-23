import React, { useState } from 'react';
import {
  ConditionEvaluation,
  SakipCriteria,
  SakipComponent,
  EvidenceDocument,
} from '../types/sakip';
import {
  Search,
  Bot,
  Plus,
  Upload,
  Sparkles,
  FileText,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Clock,
  ArrowRight,
  Edit3,
  X,
} from 'lucide-react';

interface InputConditionViewProps {
  criteriaList: SakipCriteria[];
  conditions: ConditionEvaluation[];
  onSaveCondition: (condition: ConditionEvaluation) => void;
  onDeleteCondition: (id: string) => void;
  onTriggerAnalysis: (condition: ConditionEvaluation) => void;
}

const AGENCIES = [
  'Dinas Kesehatan',
  'Dinas Pendidikan',
  'Badan Perencanaan Pembangunan Daerah (Bappeda)',
  'Dinas Perhubungan',
  'Dinas Pekerjaan Umum dan Penataan Ruang (PUPR)',
  'Dinas Sosial',
  'Inspektorat Daerah',
  'Badan Pengelolaan Keuangan dan Aset Daerah (BPKAD)',
  'Dinas Lingkungan Hidup',
];

const PRESETS = [
  {
    title: 'Kelemahan Crosscutting & Cascading (Bappeda)',
    agency: 'Badan Perencanaan Pembangunan Daerah (Bappeda)',
    component: 'Perencanaan Kinerja' as SakipComponent,
    subcomponent: 'Kualitas Perencanaan Kinerja - Cascading & Crosscutting',
    criteriaCode: 'A.1.2',
    condition:
      'Diagram crosscutting dan cascading perencanaan kinerja belum menggambarkan pembagian peran serta kontribusi perangkat daerah pengampu sasaran secara komprehensif, sehingga indikator kinerja program tidak saling mengunci pencapaian sasaran outcome strategis daerah.',
    facts:
      'Ditemukan dalam dokumen Renstra dan Cascading Bappeda Tahun 2024–2026 bahwa indikator sasaran antara Dinkes dan Dinsos belum terhubung jelas ke sasaran penanggulangan kemiskinan dan stunting.',
    evidence: 'Dokumen Cascading Pemda 2024, Matriks Kinerja Program Renstra',
    problem: 'Penyusunan pohon kinerja belum melalui koordinasi lintas sektor yang mendalam.',
    impact: 'Risiko ego-sektoral antar-OPD dan target penurunan angka stunting tidak tercapai secara terintegrasi.',
  },
  {
    title: 'Indikator Sasaran Masih Output (Dinas Kesehatan)',
    agency: 'Dinas Kesehatan',
    component: 'Perencanaan Kinerja' as SakipComponent,
    subcomponent: 'Pemenuhan Indikator Kinerja Utama (IKU)',
    criteriaCode: 'A.1.1',
    condition:
      'Indikator Sasaran Strategis pada Renstra Dinas Kesehatan masih berorientasi pada keluaran (output kegiatan), seperti "Jumlah puskesmas yang direnovasi" dan "Jumlah penyuluhan gizi", belum mengukur hasil akhir (outcome) seperti "Persentase balita gizi buruk yang ditangani tuntas".',
    facts:
      'Dari 7 indikator sasaran dalam Renstra Dinkes Tahun 2024, 4 diantaranya masih berupa volume aktivitas (output proses).',
    evidence: 'Dokumen Renstra Dinas Kesehatan Bab IV dan Formulir IKU 2024',
    problem: 'Pemahaman penyusun Renstra terhadap hierarki indikator hasil (outcome-oriented) masih minim.',
    impact: 'Anggaran belanja operasional terserap tinggi namun tidak tercermin pada perbaikan derajat kesehatan masyarakat secara riil.',
  },
  {
    title: 'Analisis Bab III LKjIP Belum Memadai (Dinas Pendidikan)',
    agency: 'Dinas Pendidikan',
    component: 'Pelaporan Kinerja' as SakipComponent,
    subcomponent: 'Kualitas Analisis Capaian Kinerja pada Laporan Kinerja (LKjIP)',
    criteriaCode: 'C.1.2',
    condition:
      'Penyajian analisis pencapaian kinerja dalam Bab III Laporan Kinerja (LKjIP) belum menguraikan faktor pemicu disparitas antara target dan realisasi Rata-Rata Lama Sekolah, serta belum menyajikan analisis efisiensi penggunaan sumber daya anggaran.',
    facts:
      'Dokumen LKjIP hanya menyajikan tabel capaian angka nominal persentase (92%) tanpa menyajikan analisis faktor kegagalan dan upaya perbaikan ke depan.',
    evidence: 'Laporan Kinerja (LKjIP) Dinas Pendidikan Tahun 2023 Bab III',
    problem: 'Penyusunan LKjIP sekadar formalitas tahunan dan tidak didukung data evaluasi berkala.',
    impact: 'Pimpinan daerah dan publik tidak memperoleh informasi akuntabilitas yang objektif untuk perbaikan kebijakan pendidikan.',
  },
  {
    title: 'Monitoring & Evaluasi Triwulanan Belum Efektif (Dinas Perhubungan)',
    agency: 'Dinas Perhubungan',
    component: 'Pengukuran Kinerja' as SakipComponent,
    subcomponent: 'Pemanfaatan Hasil Pemantauan Kinerja Berkala',
    criteriaCode: 'B.1.2',
    condition:
      'Hasil pemantauan capaian kinerja triwulan belum dimanfaatkan oleh pimpinan perangkat daerah sebagai instrumen early warning system dan dasar pengendalian operasional untuk perbaikan strategi berkala.',
    facts:
      'Tidak terdapat notula rapat pimpinan atau instruksi tindak lanjut terhadap capaian triwulan I dan II yang mengalami deviasi negatif target uji kelayakan kendaraan bermotor.',
    evidence: 'Laporan Pemantauan Kinerja Triwulan I & II Dinas Perhubungan',
    problem: 'Pengukuran triwulanan hanya berhenti pada entri data sistem informasi tanpa ada rapat evaluasi manajemen.',
    impact: 'Target keselamatan dan kelayakan transportasi publik tidak tercapai di akhir tahun anggaran.',
  },
];

export const InputConditionView: React.FC<InputConditionViewProps> = ({
  criteriaList,
  conditions,
  onSaveCondition,
  onDeleteCondition,
  onTriggerAnalysis,
}) => {
  const [selectedAgency, setSelectedAgency] = useState('');
  const [year, setYear] = useState(2024);
  const [component, setComponent] = useState<SakipComponent>('Perencanaan Kinerja');
  const [selectedCriteriaId, setSelectedCriteriaId] = useState(
    criteriaList[0]?.id || ''
  );
  const [subcomponent, setSubcomponent] = useState('');
  const [conditionText, setConditionText] = useState('');
  const [facts, setFacts] = useState('');
  const [evidenceText, setEvidenceText] = useState('');
  const [problem, setProblem] = useState('');
  const [impact, setImpact] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [editingConditionId, setEditingConditionId] = useState<string | null>(null);

  // Handle Criteria change
  const handleCriteriaChange = (critId: string) => {
    setSelectedCriteriaId(critId);
    const found = criteriaList.find((c) => c.id === critId);
    if (found) {
      setComponent(found.komponen);
      setSubcomponent(found.subkomponen);
      setEvidenceText(found.buktiDukung.join(', '));
    }
  };

  const handleApplyPreset = (preset: (typeof PRESETS)[0]) => {
    setSelectedAgency(preset.agency);
    setComponent(preset.component);
    setSubcomponent(preset.subcomponent);
    setConditionText(preset.condition);
    setFacts(preset.facts);
    setEvidenceText(preset.evidence);
    setProblem(preset.problem);
    setImpact(preset.impact);

    const matchCrit = criteriaList.find((c) => c.kode === preset.criteriaCode);
    if (matchCrit) {
      setSelectedCriteriaId(matchCrit.id);
    }
  };

  const handleEditCondition = (c: ConditionEvaluation) => {
    setEditingConditionId(c.id);
    setSelectedAgency(c.perangkatDaerah);
    setYear(c.tahunEvaluasi);
    setComponent(c.komponen);
    setSelectedCriteriaId(c.kriteriaId || c.criteriaId || '');
    setSubcomponent(c.subkomponen);
    setConditionText(c.kondisi);
    setFacts(c.faktaPendukung || '');
    setEvidenceText(c.buktiDukung || '');
    setProblem(c.permasalahan || '');
    setImpact(c.dampak || '');
    setUploadedFileName(c.dokumenBuktiUrl || '');
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingConditionId(null);
    setConditionText('');
    setFacts('');
    setProblem('');
    setImpact('');
    setUploadedFileName('');
  };

  const handleSubmit = (triggerAnalyze = false) => {
    if (!selectedAgency.trim()) {
      alert('Nama Perangkat Daerah yang dievaluasi wajib diisi secara manual!');
      return;
    }

    if (!conditionText.trim()) {
      alert('Deskripsi kondisi temuan tidak boleh kosong!');
      return;
    }

    const critObj = criteriaList.find((c) => c.id === selectedCriteriaId);
    const critText = critObj?.kriteria || 'Kriteria evaluasi SAKIP';
    const existingCond = editingConditionId
      ? conditions.find((c) => c.id === editingConditionId)
      : null;

    const newCond: ConditionEvaluation = {
      id: editingConditionId || `cond-${Date.now()}`,
      perangkatDaerah: selectedAgency.trim(),
      tahunEvaluasi: Number(year),
      komponen: component,
      subkomponen: subcomponent || critObj?.subkomponen || 'Subkomponen Terkait',
      kriteriaId: selectedCriteriaId,
      criteriaId: selectedCriteriaId,
      kriteriaText: critText,
      criteriaText: critText,
      kondisi: conditionText,
      buktiDukung: evidenceText,
      faktaPendukung: facts,
      dokumenBuktiUrl: uploadedFileName,
      permasalahan: problem,
      dampak: impact,
      statusAnalisis: existingCond?.statusAnalisis || 'BELUM_DIANALISIS',
      createdAt: existingCond?.createdAt || new Date().toISOString(),
    };

    onSaveCondition(newCond);

    if (triggerAnalyze) {
      onTriggerAnalysis(newCond);
    } else {
      // Clear form
      setEditingConditionId(null);
      setConditionText('');
      setFacts('');
      setProblem('');
      setImpact('');
      setUploadedFileName('');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Search className="w-6 h-6 text-amber-600" />
            Input Kondisi & Temuan Evaluasi AKIP
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Masukkan kondisi aktual hasil pengujian bukti fisik dan uji petik auditor terhadap kriteria SAKIP
          </p>
        </div>
      </div>

      {/* Preset Templates Accordion/Cards */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-600" />
            Gunakan Template Temuan Populer (1-Klik Isi Form):
          </span>
          <span className="text-[11px] text-amber-800">
            Sesuai kasus nyata evaluasi AKIP
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="p-3 bg-white rounded-xl border border-amber-200 hover:border-amber-400 hover:shadow-xs text-left transition-all group"
            >
              <span className="text-[10px] font-bold text-amber-700 block uppercase">
                {p.component}
              </span>
              <h5 className="text-xs font-bold text-slate-900 mt-0.5 group-hover:text-amber-900 line-clamp-2">
                {p.title}
              </h5>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {p.agency}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Input Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              {editingConditionId ? 'Mode Edit Kondisi Temuan' : 'Formulir Lembar Temuan Evaluasi'}
            </h3>
            {editingConditionId && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-md">
                Mengedit Data Tersimpan
              </span>
            )}
          </div>
          {editingConditionId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Batal Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Agency */}
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="agency-input" className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Perangkat Daerah yang Dievaluasi: <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-slate-500 font-medium">
                (Ketik Manual / Bebas)
              </span>
            </div>
            <div className="relative">
              <input
                id="agency-input"
                type="text"
                list="agency-datalist"
                value={selectedAgency}
                onChange={(e) => setSelectedAgency(e.target.value)}
                placeholder="Ketik manual nama Perangkat Daerah (contoh: Dinas Kebudayaan, Bappeda, Inspektorat, Bagian Organisasi...)"
                className="w-full text-xs p-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all placeholder:font-normal placeholder:text-slate-400"
              />
              <datalist id="agency-datalist">
                {AGENCIES.map((ag) => (
                  <option key={ag} value={ag} />
                ))}
              </datalist>
            </div>
            {/* Quick Suggestions */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[11px] text-slate-500">
              <span className="text-[10px] text-slate-400">Contoh / Pilihan Cepat:</span>
              {['Bappeda', 'Dinas Kesehatan', 'Dinas Pendidikan', 'Inspektorat Daerah', 'Dinas PUPR', 'Dinas Perhubungan'].map((quick) => (
                <button
                  key={quick}
                  type="button"
                  onClick={() => setSelectedAgency(quick)}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-600 rounded text-[10px] transition-colors font-medium border border-slate-200"
                >
                  + {quick}
                </button>
              ))}
            </div>
          </div>

          {/* Year */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Tahun Evaluasi:
            </label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
            />
          </div>

          {/* Component */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Komponen SAKIP:
            </label>
            <select
              value={component}
              onChange={(e) => {
                const comp = e.target.value as SakipComponent;
                setComponent(comp);
                const firstMatching = criteriaList.find((c) => c.komponen === comp);
                if (firstMatching) {
                  setSelectedCriteriaId(firstMatching.id);
                  setSubcomponent(firstMatching.subkomponen);
                }
              }}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
            >
              <option value="Perencanaan Kinerja">A. Perencanaan Kinerja</option>
              <option value="Pengukuran Kinerja">B. Pengukuran Kinerja</option>
              <option value="Pelaporan Kinerja">C. Pelaporan Kinerja</option>
              <option value="Evaluasi Akuntabilitas Kinerja Internal">D. Evaluasi Internal</option>
              <option value="Capaian Kinerja">E. Capaian Kinerja</option>
            </select>
          </div>

          {/* Subcomponent / Criteria */}
          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Kriteria Acuan SAKIP (PermenPANRB 88/2021):
            </label>
            <select
              value={selectedCriteriaId}
              onChange={(e) => handleCriteriaChange(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
            >
              {criteriaList
                .filter((c) => c.komponen === component)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    [{c.kode}] {c.subkomponen} - {c.kriteria.substring(0, 70)}...
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Condition Text */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span className="text-amber-900 font-extrabold flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              Kondisi Temuan Aktual (Deskripsi Fakta Lapangan):
            </span>
            <span className="text-[11px] font-normal text-slate-500">
              Uraikan kelemahan akuntabilitas secara spesifik
            </span>
          </label>
          <textarea
            rows={4}
            value={conditionText}
            onChange={(e) => setConditionText(e.target.value)}
            className="w-full text-xs p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-medium leading-relaxed"
            placeholder="Contoh: Indikator kinerja pada Renstra belum berorientasi hasil (outcome) dan cascading belum menghubungkan sasaran program dengan target outcome..."
          />
        </div>

        {/* Facts & Evidence */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Fakta Pendukung (Data Konkret Uji Petik):
            </label>
            <textarea
              rows={3}
              value={facts}
              onChange={(e) => setFacts(e.target.value)}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl"
              placeholder="Contoh: Dari 7 indikator Renstra Dinkes, 4 diantaranya masih berupa volume aktivitas..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Bukti Dukung yang Diperoleh:
            </label>
            <textarea
              rows={3}
              value={evidenceText}
              onChange={(e) => setEvidenceText(e.target.value)}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl"
              placeholder="Contoh: Renstra Bab IV, Formulir IKU, Laporan Kinerja LKjIP 2023..."
            />
          </div>
        </div>

        {/* Problem Root & Impact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Penyebab Pokok / Akar Permasalahan:
            </label>
            <input
              type="text"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              placeholder="Contoh: Kurangnya koordinasi antar bidang dalam penyusunan pohon kinerja..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Akibat / Dampak / Risiko:
            </label>
            <input
              type="text"
              value={impact}
              onChange={(e) => setImpact(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              placeholder="Contoh: Anggaran terserap namun tidak berdampak nyata pada sasaran strategis..."
            />
          </div>
        </div>

        {/* Upload Dokumen Bukti */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white border border-slate-300 rounded-lg text-slate-600">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                Lampirkan File Dokumen Bukti (Opsional)
              </span>
              <span className="text-[11px] text-slate-500">
                Format PDF/Word/Excel: Renstra, PK, LKjIP, Cascading, dll
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              id="cond-file"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setUploadedFileName(e.target.files[0].name);
                }
              }}
            />
            {uploadedFileName ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {uploadedFileName}
              </span>
            ) : (
              <label
                htmlFor="cond-file"
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Pilih Berkas
              </label>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              {editingConditionId ? 'Simpan Perubahan Kondisi' : 'Simpan Kondisi Saja'}
            </button>
            {editingConditionId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 text-xs font-semibold rounded-xl border border-slate-200 transition-colors"
              >
                Batal
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleSubmit(true)}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-900/20 transition-all"
          >
            <Bot className="w-4 h-4" />
            {editingConditionId ? 'Perbarui & Langsung Analisis AI' : 'Simpan & Langsung Analisis AI'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Recorded Conditions List */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Daftar Kondisi Temuan Tersimpan ({conditions.length})
          </h3>
          <span className="text-xs text-slate-500">
            Klik tombol "Analisis" untuk memformulasikan rekomendasi
          </span>
        </div>

        <div className="space-y-3">
          {conditions.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-900">
                    {c.perangkatDaerah}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800">
                    {c.komponen}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Tahun {c.tahunEvaluasi}
                  </span>
                  {c.statusAnalisis === 'SUDAH_DIANALISIS' ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Sudah Dianalisis
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                      Menunggu Formulasi
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-700 line-clamp-2 font-medium">
                  {c.kondisi}
                </p>
                <p className="text-[11px] text-slate-400">
                  Kriteria: {c.criteriaText}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleEditCondition(c)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                  title="Muat dan Edit Kondisi / Perangkat Daerah"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onTriggerAnalysis(c)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                >
                  <Bot className="w-3.5 h-3.5" />
                  Formulasi AI
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Hapus catatan kondisi ${c.perangkatDaerah}?`)) {
                      onDeleteCondition(c.id);
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Hapus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
