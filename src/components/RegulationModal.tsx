import React, { useState } from 'react';
import { Regulation, RegulationArticle } from '../types/sakip';
import { X, Upload, Plus, Trash2, BookOpen, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import { callExtractRegulation } from '../services/aiService';

interface RegulationModalProps {
  regulation?: Regulation | null;
  onClose: () => void;
  onSave: (reg: Regulation) => void;
}

export const RegulationModal: React.FC<RegulationModalProps> = ({
  regulation,
  onClose,
  onSave,
}) => {
  const isEditing = !!regulation;

  const [jenis, setJenis] = useState<Regulation['jenis']>(regulation?.jenis || 'PermenPANRB');
  const [nomor, setNomor] = useState(regulation?.nomor || 'Nomor ');
  const [tahun, setTahun] = useState(regulation?.tahun || 2024);
  const [judul, setJudul] = useState(regulation?.judul || '');
  const [penerbit, setPenerbit] = useState(regulation?.penerbit || 'Kementerian PANRB');
  const [tanggalPenetapan, setTanggalPenetapan] = useState(regulation?.tanggalPenetapan || new Date().toISOString().split('T')[0]);
  const [statusBerlaku, setStatusBerlaku] = useState(regulation?.statusBerlaku ?? true);
  const [topikInput, setTopikInput] = useState(regulation?.topik.join(', ') || 'SAKIP, Evaluasi AKIP, Kinerja');
  const [kataKunciInput, setKataKunciInput] = useState(regulation?.kataKunci.join(', ') || 'evaluasi, indikator, rekomendasi');
  const [ringkasan, setRingkasan] = useState(regulation?.ringkasan || '');
  const [articles, setArticles] = useState<RegulationArticle[]>(regulation?.articles || []);

  // Upload state
  const [isExtracting, setIsExtracting] = useState(false);
  const [fileName, setFileName] = useState(regulation?.fileName || '');
  const [fileSize, setFileSize] = useState(regulation?.fileSize || '');
  const [uploadTextSample, setUploadTextSample] = useState('');

  // New Article Form
  const [newBab, setNewBab] = useState('');
  const [newPasal, setNewPasal] = useState('');
  const [newAyat, setNewAyat] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newText, setNewText] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
    setIsExtracting(true);

    try {
      // Read text or sample simulated extraction
      const text = await file.text().catch(() => 'Peraturan perundang-undangan akuntabilitas kinerja instansi pemerintah.');
      setUploadTextSample(text.substring(0, 1000));

      const extracted = await callExtractRegulation({
        documentTitle: file.name.replace(/\.[^/.]+$/, ''),
        rawText: text,
        jenis,
        nomor,
        tahun,
      });

      if (extracted) {
        if (extracted.ringkasan) setRingkasan(extracted.ringkasan);
        if (extracted.topik && extracted.topik.length > 0) setTopikInput(extracted.topik.join(', '));
        if (extracted.kataKunci && extracted.kataKunci.length > 0) setKataKunciInput(extracted.kataKunci.join(', '));
        if (extracted.articles && extracted.articles.length > 0) {
          const formattedArts: RegulationArticle[] = extracted.articles.map((a: any, idx: number) => ({
            id: `art-${Date.now()}-${idx}`,
            bab: a.bab || '',
            pasal: a.pasal || '',
            ayat: a.ayat || '',
            lampiran: a.lampiran || '',
            topic: a.topic || 'Ketentuan',
            text: a.text || '',
            keywords: a.keywords || [],
          }));
          setArticles([...articles, ...formattedArts]);
        }
      }
    } catch (err) {
      console.error('Extraction error:', err);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAddArticle = () => {
    if (!newText.trim()) return;
    const newArt: RegulationArticle = {
      id: `art-${Date.now()}`,
      bab: newBab,
      pasal: newPasal,
      ayat: newAyat,
      topic: newTopic || 'Ketentuan Penting',
      text: newText,
      keywords: newTopic ? [newTopic.toLowerCase()] : [],
    };
    setArticles([...articles, newArt]);
    setNewBab('');
    setNewPasal('');
    setNewAyat('');
    setNewTopic('');
    setNewText('');
  };

  const handleRemoveArticle = (id: string) => {
    setArticles(articles.filter((a) => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim() || !nomor.trim()) return;

    const saved: Regulation = {
      id: regulation?.id || `reg-${Date.now()}`,
      jenis,
      nomor,
      tahun: Number(tahun),
      judul,
      penerbit,
      tanggalPenetapan,
      statusBerlaku,
      fileName: fileName || `${jenis}_${nomor.replace(/\s+/g, '_')}_${tahun}.pdf`,
      fileSize: fileSize || '1.5 MB',
      topik: topikInput.split(',').map((s) => s.trim()).filter(Boolean),
      kataKunci: kataKunciInput.split(',').map((s) => s.trim()).filter(Boolean),
      ringkasan: ringkasan || `Peraturan tentang ${judul}`,
      articles,
      createdAt: regulation?.createdAt || new Date().toISOString(),
    };

    onSave(saved);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {isEditing ? 'Perbarui Peraturan SAKIP' : 'Tambah & Ekstraksi Peraturan Baru'}
              </h3>
              <p className="text-xs text-slate-300">
                Database Peraturan Resmi untuk Rujukan Dasar Hukum Rekomendasi Auditor APIP
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto bg-slate-50/50">
          {/* Upload Box */}
          <div className="bg-white p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 transition-colors text-center">
            <input
              type="file"
              id="pdf-upload"
              accept=".pdf,.docx,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label htmlFor="pdf-upload" className="cursor-pointer block">
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-sm font-bold text-blue-600 hover:underline">
                    Unggah Dokumen PDF/DOCX Peraturan
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sistem akan membaca isi dokumen dan mengekstrak bab, pasal, ayat, dan ketentuan penting secara otomatis
                  </p>
                </div>
                {fileName && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5" /> File terlampir: {fileName} ({fileSize})
                  </span>
                )}
                {isExtracting && (
                  <span className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 animate-pulse">
                    <Sparkles className="w-4 h-4 animate-spin" /> Sedang mengekstrak pasal dan ketentuan dokumen...
                  </span>
                )}
              </div>
            </label>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Jenis Peraturan:
              </label>
              <select
                value={jenis}
                onChange={(e) => setJenis(e.target.value as any)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
              >
                <option value="PermenPANRB">PermenPANRB</option>
                <option value="PP">PP (Peraturan Pemerintah)</option>
                <option value="Perpres">Perpres (Peraturan Presiden)</option>
                <option value="Permendagri">Permendagri</option>
                <option value="Perda">Perda</option>
                <option value="Pergub">Pergub</option>
                <option value="SE MenPANRB">Surat Edaran MenPANRB</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Nomor Peraturan:
              </label>
              <input
                type="text"
                value={nomor}
                onChange={(e) => setNomor(e.target.value)}
                placeholder="Contoh: Nomor 88"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Tahun:
              </label>
              <input
                type="number"
                value={tahun}
                onChange={(e) => setTahun(Number(e.target.value))}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Judul Lengkap Peraturan:
              </label>
              <input
                type="text"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                placeholder="Contoh: Evaluasi Akuntabilitas Kinerja Instansi Pemerintah"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Instansi Penerbit:
              </label>
              <input
                type="text"
                value={penerbit}
                onChange={(e) => setPenerbit(e.target.value)}
                placeholder="Kementerian PANRB"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Tanggal Penetapan:
              </label>
              <input
                type="date"
                value={tanggalPenetapan}
                onChange={(e) => setTanggalPenetapan(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Topik SAKIP (Pisahkan koma):
              </label>
              <input
                type="text"
                value={topikInput}
                onChange={(e) => setTopikInput(e.target.value)}
                placeholder="Evaluasi AKIP, SAKIP, Kinerja, Indikator, Pengukuran"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Ringkasan */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Ringkasan Substansi Peraturan:
            </label>
            <textarea
              rows={2}
              value={ringkasan}
              onChange={(e) => setRingkasan(e.target.value)}
              className="w-full text-xs p-3 bg-white border border-slate-300 rounded-xl"
              placeholder="Jelaskan substansi pokok yang diatur..."
            />
          </div>

          {/* Extracted Articles List */}
          <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Pasal, Ayat, & Ketentuan Terekstrak ({articles.length}):
              </h4>
              <span className="text-[11px] text-slate-500">
                Ketentuan ini akan menjadi kutipan resmi rujukan AI
              </span>
            </div>

            {articles.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                Belum ada pasal terekstrak. Anda dapat mengunggah file di atas atau menambahkan secara manual di bawah.
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {articles.map((art) => (
                  <div
                    key={art.id}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-900">
                          {[art.bab, art.pasal, art.ayat, art.lampiran].filter(Boolean).join(' ')}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-blue-100/70 text-blue-800 text-[10px] font-semibold">
                          {art.topic}
                        </span>
                      </div>
                      <p className="text-slate-700 font-mono italic">“{art.text}”</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveArticle(art.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Manual Article Form */}
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2.5">
              <span className="text-xs font-bold text-slate-800 block">
                + Tambah Pasal / Ayat / Ketentuan Manual:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <input
                  type="text"
                  placeholder="Bab (e.g. Bab II)"
                  value={newBab}
                  onChange={(e) => setNewBab(e.target.value)}
                  className="text-xs p-2 bg-white border border-slate-300 rounded"
                />
                <input
                  type="text"
                  placeholder="Pasal (e.g. Pasal 8)"
                  value={newPasal}
                  onChange={(e) => setNewPasal(e.target.value)}
                  className="text-xs p-2 bg-white border border-slate-300 rounded"
                />
                <input
                  type="text"
                  placeholder="Ayat (e.g. Ayat (1))"
                  value={newAyat}
                  onChange={(e) => setNewAyat(e.target.value)}
                  className="text-xs p-2 bg-white border border-slate-300 rounded"
                />
                <input
                  type="text"
                  placeholder="Topik Ketentuan"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="text-xs p-2 bg-white border border-slate-300 rounded"
                />
              </div>
              <textarea
                rows={2}
                placeholder="Teks ketentuan / kutipan pasal resmi..."
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAddArticle}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambahkan Ketentuan
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
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
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs"
            >
              Simpan Peraturan ke Database
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
