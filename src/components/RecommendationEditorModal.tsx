import React, { useState } from 'react';
import { RecommendationRecord, Regulation, UserRole } from '../types/sakip';
import { X, Save, History, Check, ShieldCheck, Plus, Trash2, BookOpen } from 'lucide-react';

interface RecommendationEditorModalProps {
  recommendation: RecommendationRecord;
  availableRegulations: Regulation[];
  currentUserRole: UserRole;
  currentUserName: string;
  onClose: () => void;
  onSave: (updated: RecommendationRecord) => void;
}

export const RecommendationEditorModal: React.FC<RecommendationEditorModalProps> = ({
  recommendation,
  availableRegulations,
  currentUserRole,
  currentUserName,
  onClose,
  onSave,
}) => {
  const [content, setContent] = useState(recommendation.rekomendasi);
  const [responsibleParty, setResponsibleParty] = useState(recommendation.pihakBertanggungJawab);
  const [status, setStatus] = useState(recommendation.status);
  const [versionNote, setVersionNote] = useState('');
  const [reviewerNotes, setReviewerNotes] = useState(recommendation.reviewerNotes || '');
  const [dasarHukumList, setDasarHukumList] = useState(recommendation.dasarHukum || []);
  const [showAddLegal, setShowAddLegal] = useState(false);
  const [selectedRegId, setSelectedRegId] = useState(availableRegulations[0]?.id || '');
  const [selectedArticle, setSelectedArticle] = useState('');
  const [articleCitation, setArticleCitation] = useState('');
  const [relevanceReason, setRelevanceReason] = useState('');

  const handleSelectRegulation = (regId: string) => {
    setSelectedRegId(regId);
    const reg = availableRegulations.find(r => r.id === regId);
    if (reg && reg.articles && reg.articles.length > 0) {
      const firstArt = reg.articles[0];
      const loc = [firstArt.bab, firstArt.pasal, firstArt.ayat, firstArt.lampiran].filter(Boolean).join(' ');
      setSelectedArticle(loc);
      setArticleCitation(firstArt.text);
      setRelevanceReason(`Mengatur standar SAKIP mengenai ${firstArt.topic}`);
    }
  };

  const handleAddLegalBasis = () => {
    const reg = availableRegulations.find(r => r.id === selectedRegId);
    if (!reg) return;

    setDasarHukumList([
      ...dasarHukumList,
      {
        regulationId: reg.id,
        regulationName: `${reg.jenis} ${reg.nomor} Tahun ${reg.tahun} tentang ${reg.judul}`,
        article: selectedArticle || 'Pasal Umum',
        citation: articleCitation || reg.ringkasan,
        relevanceReason: relevanceReason || 'Dasar hukum pendukung implementasi rekomendasi SAKIP.',
        isVerifiedInDatabase: true,
      },
    ]);
    setShowAddLegal(false);
    setSelectedArticle('');
    setArticleCitation('');
    setRelevanceReason('');
  };

  const handleRemoveLegalBasis = (index: number) => {
    setDasarHukumList(dasarHukumList.filter((_, idx) => idx !== index));
  };

  const handleSave = () => {
    const isModified = content !== recommendation.rekomendasi;
    const newVersions = [...recommendation.versions];

    if (isModified) {
      newVersions.push({
        version: newVersions.length + 1,
        content,
        author: currentUserName,
        authorRole: currentUserRole,
        timestamp: new Date().toISOString(),
        note: versionNote || `Perubahan redaksi oleh ${currentUserRole}`,
      });
    }

    const updated: RecommendationRecord = {
      ...recommendation,
      rekomendasi: content,
      pihakBertanggungJawab: responsibleParty,
      status,
      reviewerNotes: reviewerNotes || recommendation.reviewerNotes,
      reviewerName: currentUserRole === 'REVIEWER' ? currentUserName : recommendation.reviewerName,
      dasarHukum: dasarHukumList,
      versions: newVersions,
      updatedAt: new Date().toISOString(),
    };

    onSave(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Editor & Persetujuan Rekomendasi
            </h3>
            <p className="text-xs text-slate-300">
              Draft AI ➔ Edit Auditor ➔ Final Recommendation (Disimpan beserta riwayat versi)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto bg-slate-50/50">
          {/* Target Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div>
              <span className="text-slate-400 font-semibold block uppercase tracking-wider">Perangkat Daerah</span>
              <span className="font-bold text-slate-900">{recommendation.perangkatDaerah}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block uppercase tracking-wider">Komponen</span>
              <span className="font-bold text-slate-900">{recommendation.komponen}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block uppercase tracking-wider">Tahun Evaluasi</span>
              <span className="font-bold text-slate-900">{recommendation.tahunEvaluasi}</span>
            </div>
          </div>

          {/* Kondisi Temuan Display */}
          <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200 text-xs">
            <span className="font-bold text-amber-900 uppercase tracking-wide block mb-1">
              Kondisi Temuan yang Dianalisis:
            </span>
            <p className="text-slate-800 leading-relaxed font-medium">{recommendation.kondisiText}</p>
          </div>

          {/* Recommendation Text Editor */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Redaksi Rekomendasi (Bahasa Formal Auditor APIP):</span>
              <span className="text-[11px] font-normal text-slate-500">
                Format: Pihak berwenang agar ... dengan memperhatikan ... sehingga ...
              </span>
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full text-sm font-medium text-slate-900 bg-white border border-slate-300 rounded-xl p-3.5 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 leading-relaxed shadow-xs"
              placeholder="Masukkan redaksi rekomendasi..."
            />
          </div>

          {/* Pihak Bertanggung Jawab & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Pihak Penanggung Jawab (Sesuai Kewenangan):
              </label>
              <input
                type="text"
                value={responsibleParty}
                onChange={(e) => setResponsibleParty(e.target.value)}
                className="w-full text-sm text-slate-900 bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-slate-900"
                placeholder="Contoh: Kepala Dinas Kesehatan"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Status Rekomendasi:
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full text-sm text-slate-900 bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-slate-900 font-semibold"
              >
                <option value="DRAFT">DRAFT (Dalam Perumusan)</option>
                <option value="REVIEW">REVIEW (Menunggu Telaah Dalnis/Reviewer)</option>
                <option value="DISETUJUI">DISETUJUI (Final untuk LHE/KKE)</option>
                <option value="PERLU_REVISI">PERLU REVISI (Ada Catatan Penelaahan)</option>
              </select>
            </div>
          </div>

          {/* Reviewer Notes (jika role Reviewer atau ada catatan) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Catatan Telaah Pengendali Teknis / Dalnis (Reviewer):</span>
              <span className="text-[11px] font-normal text-slate-400">
                {currentUserRole === 'REVIEWER' ? 'Wajib diisi jika status Perlu Revisi / Disetujui' : 'Catatan resmi dari Dalnis'}
              </span>
            </label>
            <textarea
              rows={2}
              value={reviewerNotes}
              onChange={(e) => setReviewerNotes(e.target.value)}
              className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-slate-900"
              placeholder="Tuliskan catatan telaah mutu rekomendasi..."
            />
          </div>

          {/* Dasar Hukum Management */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                Dasar Hukum Terverifikasi Database ({dasarHukumList.length}):
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowAddLegal(!showAddLegal);
                  if (!showAddLegal) handleSelectRegulation(selectedRegId);
                }}
                className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Dasar Hukum dari Database
              </button>
            </div>

            {/* List of current legal basis */}
            <div className="space-y-2">
              {dasarHukumList.map((item, idx) => (
                <div key={idx} className="flex items-start justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200 text-xs shadow-xs">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-indigo-950">{item.regulationName}</span>
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                        {item.article}
                      </span>
                    </div>
                    <p className="text-slate-600 italic">“{item.citation}”</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveLegalBasis(idx)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                    title="Hapus dasar hukum"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Form Add Legal Basis from DB */}
            {showAddLegal && (
              <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-200 text-xs space-y-3 mt-2">
                <h5 className="font-bold text-indigo-950">Pilih dari Database Peraturan:</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Pilih Peraturan:</label>
                    <select
                      value={selectedRegId}
                      onChange={(e) => handleSelectRegulation(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded"
                    >
                      {availableRegulations.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.jenis} {r.nomor} Th {r.tahun} - {r.judul.substring(0, 45)}...
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Pasal / Ayat / Bab:</label>
                    <input
                      type="text"
                      value={selectedArticle}
                      onChange={(e) => setSelectedArticle(e.target.value)}
                      placeholder="e.g. Pasal 8 ayat (1) atau Lampiran I"
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kutipan Ketentuan:</label>
                  <textarea
                    rows={2}
                    value={articleCitation}
                    onChange={(e) => setArticleCitation(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded"
                    placeholder="Teks kutipan resmi dari peraturan..."
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Alasan Relevansi:</label>
                  <input
                    type="text"
                    value={relevanceReason}
                    onChange={(e) => setRelevanceReason(e.target.value)}
                    placeholder="Contoh: Mengatur kewajiban perumusan indikator outcome..."
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddLegal(false)}
                    className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded text-xs font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleAddLegalBasis}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold"
                  >
                    Tambahkan ke Rekomendasi
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Catatan Perubahan Versi */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-slate-500" />
              Catatan Perubahan Versi Baru (Opsional):
            </label>
            <input
              type="text"
              value={versionNote}
              onChange={(e) => setVersionNote(e.target.value)}
              placeholder="Contoh: Menyesuaikan redaksi agar mencantumkan manual indikator IKU"
              className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Version History Log */}
          {recommendation.versions && recommendation.versions.length > 0 && (
            <div className="border border-slate-200 rounded-xl p-3.5 bg-white text-xs space-y-2">
              <span className="font-bold text-slate-700 uppercase tracking-wider block">
                Riwayat Versi Perubahan ({recommendation.versions.length}):
              </span>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {recommendation.versions.map((ver, idx) => (
                  <div key={idx} className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span className="font-bold text-slate-800">Versi {ver.version} • {ver.author} ({ver.authorRole})</span>
                      <span>{new Date(ver.timestamp).toLocaleString('id-ID')}</span>
                    </div>
                    <p className="text-slate-800 italic">“{ver.content}”</p>
                    {ver.note && <p className="text-[11px] text-indigo-700 mt-1">Catatan: {ver.note}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
          >
            Batal
          </button>
          <div className="flex items-center gap-2">
            {currentUserRole === 'REVIEWER' && (
              <button
                type="button"
                onClick={() => {
                  setStatus('DISETUJUI');
                  setTimeout(handleSave, 50);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                Setujui Rekomendasi (LHE)
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
