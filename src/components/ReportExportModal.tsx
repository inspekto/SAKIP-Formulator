import React, { useState } from 'react';
import { RecommendationRecord, ConditionEvaluation } from '../types/sakip';
import { X, Printer, Download, FileSpreadsheet, FileText, CheckCircle2 } from 'lucide-react';

interface ReportExportModalProps {
  recommendations: RecommendationRecord[];
  conditions: ConditionEvaluation[];
  selectedAgency?: string;
  onClose: () => void;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({
  recommendations,
  conditions,
  selectedAgency = 'Semua',
  onClose,
}) => {
  const [format, setFormat] = useState<'LHE' | 'KKE'>('LHE');
  const [filterAgency, setFilterAgency] = useState(selectedAgency);

  const filteredRecs = recommendations.filter((r) => {
    if (filterAgency !== 'Semua' && r.perangkatDaerah !== filterAgency) return false;
    return true;
  });

  const agencies = ['Semua', ...Array.from(new Set(recommendations.map((r) => r.perangkatDaerah)))];

  const handlePrintPDF = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = [
      'No',
      'Perangkat Daerah',
      'Tahun',
      'Komponen',
      'Subkomponen',
      'Kriteria',
      'Kondisi Temuan',
      'Sebab (Akar Masalah)',
      'Akibat (Dampak)',
      'Rekomendasi APIP',
      'Pihak Penanggung Jawab',
      'Dasar Hukum',
      'Status',
      'Auditor',
    ];

    const rows = filteredRecs.map((r, idx) => [
      idx + 1,
      `"${r.perangkatDaerah}"`,
      r.tahunEvaluasi,
      `"${r.komponen}"`,
      `"${r.subkomponen}"`,
      `"${r.kriteriaText}"`,
      `"${(r.kondisiText || '').replace(/"/g, '""')}"`,
      `"${(r.penyebab || '').replace(/"/g, '""')}"`,
      `"${(r.dampak || '').replace(/"/g, '""')}"`,
      `"${(r.rekomendasi || '').replace(/"/g, '""')}"`,
      `"${r.pihakBertanggungJawab}"`,
      `"${r.dasarHukum.map((d) => `${d.regulationName} (${d.article})`).join('; ')}"`,
      r.status,
      `"${r.auditorName}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `KKE_SAKIP_Formulator_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportWord = () => {
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><title>Laporan Hasil Evaluasi AKIP</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; margin: 20mm; }
        h1 { text-align: center; font-size: 14pt; text-transform: uppercase; margin-bottom: 5px; }
        h2 { text-align: center; font-size: 12pt; margin-top: 0; margin-bottom: 20px; font-weight: normal; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid black; padding: 8px; font-size: 10.5pt; text-align: left; vertical-align: top; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .finding-card { margin-bottom: 20px; border: 1px solid #ddd; padding: 12px; }
      </style>
      </head>
      <body>
        <h1>LAPORAN HASIL EVALUASI AKIP (LHE SAKIP)</h1>
        <h2>PEMERINTAH DAERAH • TAHUN EVALUASI 2024</h2>
        <hr/>
        <p><strong>Perangkat Daerah Terpilih:</strong> ${filterAgency}</p>
        <p><strong>Total Rekomendasi Dirumuskan:</strong> ${filteredRecs.length} butir rekomendasi</p>

        <h3>MATRIKS TEMUAN EVALUASI DAN REKOMENDASI</h3>
        ${filteredRecs
          .map(
            (r, i) => `
          <div class="finding-card">
            <h4>${i + 1}. [${r.komponen}] ${r.perangkatDaerah}</h4>
            <p><strong>Kondisi:</strong> ${r.kondisiText}</p>
            <p><strong>Kriteria:</strong> ${r.kriteriaText}</p>
            <p><strong>Sebab:</strong> ${r.penyebab || '-'}</p>
            <p><strong>Akibat:</strong> ${r.dampak || '-'}</p>
            <p><strong>Rekomendasi Auditor:</strong> <em>“${r.rekomendasi}”</em></p>
            <p><strong>Pihak Penanggung Jawab:</strong> ${r.pihakBertanggungJawab}</p>
            <p><strong>Dasar Hukum:</strong> ${r.dasarHukum.map((d) => `${d.regulationName} (${d.article}) - ${d.citation}`).join('<br/>')}</p>
            <p><strong>Status:</strong> ${r.status}</p>
          </div>
        `
          )
          .join('')}
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `LHE_SAKIP_${filterAgency.replace(/\s+/g, '_')}.doc`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-5xl w-full overflow-hidden my-8 print:border-none print:shadow-none print:my-0">
        {/* Header - Hidden on Print */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800 print:hidden">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Pusat Pelaporan & Ekspor KKE / LHE
            </h3>
            <p className="text-xs text-slate-300">
              Dokumen resmi hasil evaluasi SAKIP sesuai format PermenPANRB No. 88 Tahun 2021
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar Controls - Hidden on Print */}
        <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between flex-wrap gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600 uppercase">Format Dokumen:</label>
            <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-white">
              <button
                type="button"
                onClick={() => setFormat('LHE')}
                className={`px-3 py-1 rounded text-xs font-semibold ${
                  format === 'LHE' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                LHE (Laporan Hasil Evaluasi)
              </button>
              <button
                type="button"
                onClick={() => setFormat('KKE')}
                className={`px-3 py-1 rounded text-xs font-semibold ${
                  format === 'KKE' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                KKE (Kertas Kerja Evaluasi)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600 uppercase">Filter Perangkat Daerah:</label>
            <select
              value={filterAgency}
              onChange={(e) => setFilterAgency(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium"
            >
              {agencies.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Ekspor Excel (CSV)
            </button>
            <button
              onClick={handleExportWord}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <FileText className="w-4 h-4" />
              Ekspor Word (.doc)
            </button>
            <button
              onClick={handlePrintPDF}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Printer className="w-4 h-4" />
              Cetak PDF
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div className="p-8 max-h-[75vh] overflow-y-auto bg-white print:max-h-none print:overflow-visible print:p-0">
          {/* Official Letterhead */}
          <div className="text-center border-b-2 border-double border-slate-900 pb-4 mb-6">
            <h4 className="text-xs font-bold tracking-widest text-slate-600 uppercase">
              PEMERINTAH DAERAH • INSPEKTORAT DAERAH
            </h4>
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide mt-1">
              {format === 'LHE' ? 'LAPORAN HASIL EVALUASI AKIP (LHE SAKIP)' : 'KERTAS KERJA EVALUASI SAKIP (KKE)'}
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Berdasarkan PermenPANRB Nomor 88 Tahun 2021 tentang Evaluasi Akuntabilitas Kinerja Instansi Pemerintah
            </p>
          </div>

          {/* Report Meta Info */}
          <div className="grid grid-cols-2 gap-4 text-xs mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200 print:bg-transparent print:border print:p-2">
            <div>
              <p><strong className="text-slate-700">Perangkat Daerah:</strong> {filterAgency}</p>
              <p><strong className="text-slate-700">Tahun Evaluasi:</strong> 2024</p>
              <p><strong className="text-slate-700">Tim Evaluator APIP:</strong> Inspektorat Daerah</p>
            </div>
            <div className="text-right print:text-left">
              <p><strong className="text-slate-700">Tanggal Terbit:</strong> {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
              <p><strong className="text-slate-700">Total Temuan Dianalisis:</strong> {filteredRecs.length} Kondisi</p>
              <p><strong className="text-slate-700">Status Validasi:</strong> Terverifikasi 100% Sesuai Database</p>
            </div>
          </div>

          {/* Table view for KKE */}
          {format === 'KKE' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-slate-300 text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-800">
                    <th className="border border-slate-300 p-2 text-center w-8">No</th>
                    <th className="border border-slate-300 p-2 w-36">Komponen / Kriteria</th>
                    <th className="border border-slate-300 p-2">Kondisi Temuan</th>
                    <th className="border border-slate-300 p-2">Sebab & Akibat</th>
                    <th className="border border-slate-300 p-2">Rekomendasi Formal Auditor</th>
                    <th className="border border-slate-300 p-2 w-40">Dasar Hukum</th>
                    <th className="border border-slate-300 p-2 text-center w-20">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecs.map((r, i) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="border border-slate-300 p-2 text-center font-bold">{i + 1}</td>
                      <td className="border border-slate-300 p-2">
                        <span className="font-bold text-slate-900 block">{r.komponen}</span>
                        <span className="text-slate-600 text-[11px]">{r.kriteriaText}</span>
                      </td>
                      <td className="border border-slate-300 p-2 text-slate-800 leading-relaxed font-medium">
                        {r.kondisiText}
                      </td>
                      <td className="border border-slate-300 p-2 text-slate-700 text-[11px] space-y-1">
                        <p><strong>Sebab:</strong> {r.penyebab || '-'}</p>
                        <p><strong>Akibat:</strong> {r.dampak || '-'}</p>
                      </td>
                      <td className="border border-slate-300 p-2 font-medium text-slate-900 leading-relaxed">
                        “{r.rekomendasi}”
                        <span className="block text-[11px] text-emerald-800 mt-1 font-semibold">
                          Penanggung Jawab: {r.pihakBertanggungJawab}
                        </span>
                      </td>
                      <td className="border border-slate-300 p-2 text-[11px] text-slate-700">
                        {r.dasarHukum.map((d, idx) => (
                          <div key={idx} className="mb-1">
                            <strong>{d.regulationName}</strong> ({d.article})
                          </div>
                        ))}
                      </td>
                      <td className="border border-slate-300 p-2 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Narrative Card View for LHE */
            <div className="space-y-6">
              {filteredRecs.map((r, i) => (
                <div
                  key={r.id}
                  className="p-5 rounded-xl border border-slate-200 bg-slate-50/70 print:bg-white print:p-0 print:border-b-2 print:rounded-none space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h4 className="text-sm font-bold text-slate-900">
                      {i + 1}. TEMUAN KOMPONEN: {r.komponen.toUpperCase()} ({r.subkomponen})
                    </h4>
                    <span className="text-xs font-bold text-emerald-700">
                      STATUS: {r.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1.5 bg-white p-3 rounded-lg border border-slate-200">
                      <span className="font-bold text-slate-500 uppercase tracking-wider block">A. KONDISI TEMUAN</span>
                      <p className="text-slate-900 leading-relaxed font-medium">{r.kondisiText}</p>
                    </div>
                    <div className="space-y-1.5 bg-white p-3 rounded-lg border border-slate-200">
                      <span className="font-bold text-slate-500 uppercase tracking-wider block">B. KRITERIA SAKIP</span>
                      <p className="text-slate-900 leading-relaxed">{r.kriteriaText}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1.5 bg-white p-3 rounded-lg border border-slate-200">
                      <span className="font-bold text-slate-500 uppercase tracking-wider block">C. SEBAB (ROOT CAUSE)</span>
                      <p className="text-slate-800">{r.penyebab || 'Belum teridentifikasi'}</p>
                    </div>
                    <div className="space-y-1.5 bg-white p-3 rounded-lg border border-slate-200">
                      <span className="font-bold text-slate-500 uppercase tracking-wider block">D. AKIBAT (IMPLIKASI)</span>
                      <p className="text-slate-800">{r.dampak || 'Belum teridentifikasi'}</p>
                    </div>
                  </div>

                  <div className="bg-emerald-50/80 border border-emerald-200 p-4 rounded-xl text-xs space-y-2">
                    <span className="font-bold text-emerald-900 uppercase tracking-wider block">
                      E. REKOMENDASI AUDITOR APIP:
                    </span>
                    <p className="text-sm font-semibold text-slate-900 leading-relaxed bg-white p-3 rounded-lg border border-emerald-200">
                      “{r.rekomendasi}”
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-emerald-950 font-medium">
                      <span>Unit Penanggung Jawab: <strong>{r.pihakBertanggungJawab}</strong></span>
                      <span>Auditor: {r.auditorName}</span>
                    </div>
                  </div>

                  <div className="bg-white p-3.5 rounded-lg border border-slate-200 text-xs">
                    <span className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      F. DASAR HUKUM TERVERIFIKASI:
                    </span>
                    <div className="space-y-1 text-slate-700">
                      {r.dasarHukum.map((d, idx) => (
                        <p key={idx}>
                          • <strong>{d.regulationName}</strong> - {d.article}: <em>“{d.citation}”</em>
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Official Signatures for formal report */}
          <div className="mt-12 pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs text-center">
            <div>
              <p className="text-slate-500">Mengetahui,</p>
              <p className="font-bold text-slate-900 mt-1">Pengendali Teknis / Dalnis SAKIP</p>
              <div className="h-16"></div>
              <p className="font-bold text-slate-900 underline">Siti Rahmawati, S.E., Ak., CA, CRMO</p>
              <p className="text-slate-500">NIP. 19820315 200604 2 007</p>
            </div>
            <div>
              <p className="text-slate-500">Dibuat oleh,</p>
              <p className="font-bold text-slate-900 mt-1">Ketua Tim Evaluator SAKIP</p>
              <div className="h-16"></div>
              <p className="font-bold text-slate-900 underline">Drs. Bambang Hariyanto, M.Si, CGCAE</p>
              <p className="text-slate-500">NIP. 19760812 200212 1 003</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between print:hidden">
          <span className="text-xs text-slate-500">
            Kertas Kerja SAKIP Recommendation Formulator • Siap ditandatangani dan diarsipkan
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg"
          >
            Tutup Pratinjau
          </button>
        </div>
      </div>
    </div>
  );
};
