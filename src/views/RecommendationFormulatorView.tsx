import React, { useState } from 'react';
import {
  ConditionEvaluation,
  Regulation,
  SakipCriteria,
  RecommendationRecord,
  LegalBasisCitation,
  RecommendationValidation,
  UserRole,
} from '../types/sakip';
import {
  callAnalyzeCondition,
  callValidateRecommendation,
} from '../services/aiService';
import {
  Bot,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Scale,
  FileText,
  Search,
  Check,
  Edit3,
  Layers,
  Database,
  Cpu,
  BookmarkPlus,
  RefreshCw,
} from 'lucide-react';
import { AuditTrailModal } from '../components/AuditTrailModal';
import { ValidationModal } from '../components/ValidationModal';
import { RecommendationEditorModal } from '../components/RecommendationEditorModal';

interface RecommendationFormulatorViewProps {
  conditions: ConditionEvaluation[];
  regulations: Regulation[];
  criteriaList: SakipCriteria[];
  activeCondition: ConditionEvaluation | null;
  currentUserRole: UserRole;
  currentUserName: string;
  onSaveRecommendation: (rec: RecommendationRecord) => void;
  onViewAuditTrail: (rec: RecommendationRecord) => void;
}

export const RecommendationFormulatorView: React.FC<RecommendationFormulatorViewProps> = ({
  conditions,
  regulations,
  criteriaList,
  activeCondition,
  currentUserRole,
  currentUserName,
  onSaveRecommendation,
  onViewAuditTrail,
}) => {
  const [selectedConditionId, setSelectedConditionId] = useState<string>(
    activeCondition?.id || conditions[0]?.id || ''
  );
  const [mode, setMode] = useState<'HYBRID' | 'DATABASE' | 'AI'>('HYBRID');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<number>(0);

  // Analysis result state
  const [analysisResult, setAnalysisResult] = useState<{
    problemCore: string;
    matchedCriteria: string;
    gapAnalysis: string;
    rootCause: string;
    impactAnalysis: string;
    responsibleParty: string;
    recommendationText: string;
    confidenceLevel: 'Tinggi' | 'Sedang' | 'Rendah';
    confidenceScore: number;
    legalBasisList: LegalBasisCitation[];
  } | null>(null);

  const [savedRecord, setSavedRecord] = useState<RecommendationRecord | null>(null);

  // Modals state
  const [showAuditTrailModal, setShowAuditTrailModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [validationResult, setValidationResult] = useState<RecommendationValidation | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const currentCondition =
    conditions.find((c) => c.id === selectedConditionId) || conditions[0];

  const handleRunAnalysis = async () => {
    if (!currentCondition) return;

    setIsAnalyzing(true);
    setAnalysisStep(1);
    setAnalysisResult(null);
    setSavedRecord(null);

    try {
      // Step tracker animation
      const t1 = setTimeout(() => setAnalysisStep(2), 400);
      const t2 = setTimeout(() => setAnalysisStep(3), 800);
      const t3 = setTimeout(() => setAnalysisStep(4), 1200);
      const t4 = setTimeout(() => setAnalysisStep(5), 1600);
      const t5 = setTimeout(() => setAnalysisStep(6), 2000);

      const condCriteria = currentCondition.kriteriaText || currentCondition.criteriaText || 'Kriteria SAKIP';

      const res = await callAnalyzeCondition({
        conditionText: currentCondition.kondisi,
        component: currentCondition.komponen,
        subcomponent: currentCondition.subkomponen,
        criteriaText: condCriteria,
        agency: currentCondition.perangkatDaerah,
        year: currentCondition.tahunEvaluasi,
        facts: currentCondition.faktaPendukung,
        impact: currentCondition.dampak,
        evidenceText: currentCondition.buktiDukung,
        mode,
        availableRegulations: regulations,
        availableCriteria: criteriaList,
      });

      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      setAnalysisStep(6);
      setAnalysisResult(res);
    } catch (err: any) {
      console.error(err);
      alert('Analisis gagal: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToBank = () => {
    if (!analysisResult || !currentCondition) return;

    const record: RecommendationRecord = {
      id: savedRecord?.id || `rec-${Date.now()}`,
      conditionId: currentCondition.id,
      perangkatDaerah: currentCondition.perangkatDaerah,
      tahunEvaluasi: currentCondition.tahunEvaluasi,
      komponen: currentCondition.komponen,
      subkomponen: currentCondition.subkomponen,
      kondisiText: currentCondition.kondisi,
      kriteriaText: analysisResult.matchedCriteria || currentCondition.kriteriaText || currentCondition.criteriaText || 'Kriteria SAKIP',
      kesenjangan: analysisResult.gapAnalysis,
      penyebab: analysisResult.rootCause,
      dampak: analysisResult.impactAnalysis,
      rekomendasi: analysisResult.recommendationText,
      pihakBertanggungJawab: analysisResult.responsibleParty,
      modeFormulasi: mode,
      status: currentUserRole === 'REVIEWER' ? 'DISETUJUI' : 'DRAFT',
      dasarHukum: analysisResult.legalBasisList,
      confidenceLevel: analysisResult.confidenceLevel,
      confidenceScore: analysisResult.confidenceScore,
      auditorName: currentUserName,
      reviewerName: currentUserRole === 'REVIEWER' ? currentUserName : undefined,
      versions: [
        {
          version: 1,
          content: analysisResult.recommendationText,
          author: currentUserName,
          authorRole: currentUserRole,
          timestamp: new Date().toISOString(),
          note: 'Formulasi awal dari sistem AI/Engine',
        },
      ],
      createdAt: savedRecord?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveRecommendation(record);
    setSavedRecord(record);
  };

  const handleTriggerValidation = async () => {
    const textToValidate = savedRecord
      ? savedRecord.rekomendasi
      : analysisResult?.recommendationText;

    if (!textToValidate || !currentCondition) return;

    setIsValidating(true);
    try {
      const res = await callValidateRecommendation({
        recommendationText: textToValidate,
        conditionText: currentCondition.kondisi,
        criteriaText: currentCondition.kriteriaText || currentCondition.criteriaText || 'Kriteria SAKIP',
        legalBasisList: analysisResult?.legalBasisList || [],
        agency: currentCondition.perangkatDaerah,
      });

      const validationObj: RecommendationValidation = {
        recommendationId: savedRecord?.id || 'temp',
        overallStatus: res.overallStatus,
        summary: res.summary,
        items: res.items,
        checkedAt: new Date().toISOString(),
      };

      setValidationResult(validationObj);
      setShowValidationModal(true);
    } catch (err: any) {
      alert('Validasi gagal: ' + err.message);
    } finally {
      setIsValidating(false);
    }
  };

  // 6 Stages descriptions
  const stages = [
    { num: 1, title: 'Identifikasi Masalah', desc: 'Mengekstrak inti permasalahan dari kondisi' },
    { num: 2, title: 'Identifikasi Kriteria SAKIP', desc: 'Mencocokkan kriteria pada komponen evaluasi' },
    { num: 3, title: 'Pencarian Dasar Hukum', desc: 'Mencari pasal & ayat relevan dalam database' },
    { num: 4, title: 'Analisis Kesenjangan (Gap)', desc: 'Membandingkan kondisi aktual vs kriteria' },
    { num: 5, title: 'Identifikasi Akar Penyebab', desc: 'Menganalisis root cause dan dampak risiko' },
    { num: 6, title: 'Formulasi Rekomendasi Formal', desc: 'Menyusun rekomendasi direktif auditor APIP' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Bot className="w-6 h-6 text-emerald-600" />
            Formulator Rekomendasi SAKIP
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Analisis AKIP 6-Tahap otomatis dengan prinsip ketat: Dasar hukum wajib bersumber dari database resmi
          </p>
        </div>

        {/* Mode Selector */}
        <div className="inline-flex rounded-xl border border-slate-300 p-1 bg-slate-50">
          <button
            type="button"
            onClick={() => setMode('HYBRID')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'HYBRID'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Mode 3: Hybrid (Utama)
          </button>
          <button
            type="button"
            onClick={() => setMode('DATABASE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'DATABASE'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Mode 1: Database
          </button>
          <button
            type="button"
            onClick={() => setMode('AI')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'AI'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Mode 2: AI Murni
          </button>
        </div>
      </div>

      {/* Target Condition Selector Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Pilih Kondisi Temuan untuk Dianalisis:
          </label>
          <span className="text-xs text-slate-400">
            Tersedia {conditions.length} catatan kondisi temuan
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <select
              value={selectedConditionId}
              onChange={(e) => {
                setSelectedConditionId(e.target.value);
                setAnalysisResult(null);
                setSavedRecord(null);
              }}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900"
            >
              {conditions.map((c) => (
                <option key={c.id} value={c.id}>
                  [{c.perangkatDaerah}] ({c.komponen}) - {c.kondisi.substring(0, 90)}...
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleRunAnalysis}
            disabled={isAnalyzing || !currentCondition}
            className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all ${
              isAnalyzing
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20'
            }`}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Sedang Menganalisis...
              </>
            ) : (
              <>
                <Bot className="w-4 h-4" />
                Mulai Analisis & Formulasi Rekomendasi
              </>
            )}
          </button>
        </div>

        {/* Selected Condition Quick Specs */}
        {currentCondition && (
          <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 text-xs space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-bold text-amber-950 uppercase tracking-wide">
                {currentCondition.perangkatDaerah} • Tahun {currentCondition.tahunEvaluasi}
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-200/80 text-amber-900 font-semibold">
                {currentCondition.komponen} ({currentCondition.subkomponen})
              </span>
            </div>
            <p className="text-slate-800 font-medium leading-relaxed">
              <strong>Kondisi Temuan:</strong> {currentCondition.kondisi}
            </p>
            {currentCondition.faktaPendukung && (
              <p className="text-slate-600">
                <strong>Fakta:</strong> {currentCondition.faktaPendukung}
              </p>
            )}
          </div>
        )}
      </div>

      {/* 6-Stages Visual Progress Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Alur Analisis 6-Tahap Formulasi SAKIP:
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {stages.map((st) => {
            const isDone = analysisStep >= st.num;
            const isCurrent = analysisStep === st.num && isAnalyzing;

            return (
              <div
                key={st.num}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isDone
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : isCurrent
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-950 animate-pulse'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold">Tahap {st.num}</span>
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-300" />
                  )}
                </div>
                <h5 className="text-[11px] font-bold truncate">{st.title}</h5>
                <p className="text-[9px] line-clamp-2 mt-0.5 opacity-80">{st.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Formulated Output Display */}
      {analysisResult && currentCondition && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
          {/* Output Header */}
          <div className="bg-slate-900 text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Formulasi Selesai
                </span>
                <span className="text-xs text-slate-300">Mode: {mode}</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">
                Hasil Formulasi Rekomendasi Formal Auditor APIP
              </h3>
            </div>

            <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase">Tingkat Keyakinan</span>
                <span className="text-xs font-bold text-emerald-400">
                  {analysisResult.confidenceLevel} ({analysisResult.confidenceScore}%)
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-400 text-xs">
                {analysisResult.confidenceScore}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Primary Recommendation Banner */}
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-300 rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white">
                  <CheckCircle2 className="w-4 h-4" /> FORMULASI REKOMENDASI AUDITOR:
                </span>
                <span className="text-xs text-emerald-900 font-semibold">
                  Unit Penanggung Jawab: <strong className="text-emerald-950">{analysisResult.responsibleParty}</strong>
                </span>
              </div>

              <p className="text-base font-bold text-slate-900 leading-relaxed bg-white p-4 rounded-xl border border-emerald-200/90 shadow-xs">
                “{analysisResult.recommendationText}”
              </p>

              <div className="text-[11px] text-emerald-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Dirumuskan dengan gaya bahasa direktif, objektif, tidak menyalahkan, spesifik, dan dapat ditindaklanjuti.
              </div>
            </div>

            {/* Analysis Grid Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-600 uppercase tracking-wider block">
                  1. Kondisi Temuan:
                </span>
                <p className="text-slate-900 font-medium leading-relaxed">{currentCondition.kondisi}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-600 uppercase tracking-wider block">
                  2. Kriteria Acuan SAKIP:
                </span>
                <p className="text-slate-900 leading-relaxed">
                  {analysisResult.matchedCriteria || currentCondition.criteriaText}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-600 uppercase tracking-wider block">
                  3. Analisis Kesenjangan (Gap):
                </span>
                <p className="text-slate-900 leading-relaxed">{analysisResult.gapAnalysis}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-600 uppercase tracking-wider block">
                  4. Akar Masalah & Dampak:
                </span>
                <p className="text-slate-900"><strong>Penyebab:</strong> {analysisResult.rootCause}</p>
                <p className="text-slate-700 mt-1"><strong>Dampak:</strong> {analysisResult.impactAnalysis}</p>
              </div>
            </div>

            {/* Legal Basis Found in Database */}
            <div className="bg-indigo-50/70 p-5 rounded-2xl border border-indigo-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                    Dasar Hukum Resmi yang Ditemukan dalam Database ({analysisResult.legalBasisList.length}):
                  </h4>
                </div>
                <span className="text-[11px] font-bold text-indigo-700">
                  Sesuai Prinsip: Tanpa Rekayasa Hukum
                </span>
              </div>

              {analysisResult.legalBasisList.length === 0 ? (
                <div className="p-4 bg-amber-100/80 border border-amber-300 rounded-xl text-xs text-amber-900 font-medium">
                  ⚠️ Dasar hukum belum ditemukan dalam database. Auditor perlu melakukan verifikasi manual atau menambahkan peraturan terkait ke dalam database.
                </div>
              ) : (
                <div className="space-y-3">
                  {analysisResult.legalBasisList.map((legal, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-4 rounded-xl border border-indigo-200 text-xs space-y-2 shadow-xs"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="font-bold text-indigo-950">{legal.regulationName}</span>
                        <span className="px-2 py-0.5 rounded font-mono font-bold bg-indigo-100 text-indigo-800 text-[11px] border border-indigo-300">
                          {legal.article}
                        </span>
                      </div>
                      <p className="text-slate-700 italic font-mono bg-slate-50 p-2.5 rounded border border-slate-200">
                        “{legal.citation}”
                      </p>
                      <p className="text-indigo-900 text-[11px]">
                        <strong>Alasan Relevansi:</strong> {legal.relevanceReason}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Actions Toolbar */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAuditTrailModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Lihat Dasar Rekomendasi (Audit Trail)
                </button>

                <button
                  type="button"
                  onClick={handleTriggerValidation}
                  disabled={isValidating}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-indigo-300" />
                  {isValidating ? 'Memeriksa 9 Parameter...' : 'Uji Kesesuaian (9 Parameter)'}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!savedRecord) handleSaveToBank();
                    setShowEditorModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit & Persetujuan (Editor)
                </button>

                <button
                  type="button"
                  onClick={handleSaveToBank}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all"
                >
                  <BookmarkPlus className="w-4 h-4" />
                  {savedRecord ? 'Tersimpan di Bank Rekomendasi' : 'Simpan ke Bank Rekomendasi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAuditTrailModal && (
        <AuditTrailModal
          recommendation={
            savedRecord || {
              id: 'temp',
              conditionId: currentCondition?.id || '',
              perangkatDaerah: currentCondition?.perangkatDaerah || '',
              tahunEvaluasi: currentCondition?.tahunEvaluasi || 2024,
              komponen: currentCondition?.komponen || 'Perencanaan Kinerja',
              subkomponen: currentCondition?.subkomponen || '',
              kondisiText: currentCondition?.kondisi || '',
              kriteriaText: analysisResult?.matchedCriteria || currentCondition?.kriteriaText || currentCondition?.criteriaText || '',
              kesenjangan: analysisResult?.gapAnalysis,
              penyebab: analysisResult?.rootCause,
              dampak: analysisResult?.impactAnalysis,
              rekomendasi: analysisResult?.recommendationText || '',
              pihakBertanggungJawab: analysisResult?.responsibleParty || '',
              modeFormulasi: mode,
              status: 'DRAFT',
              dasarHukum: analysisResult?.legalBasisList || [],
              confidenceLevel: analysisResult?.confidenceLevel || 'Tinggi',
              confidenceScore: analysisResult?.confidenceScore || 90,
              auditorName: currentUserName,
              versions: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          }
          onClose={() => setShowAuditTrailModal(false)}
        />
      )}

      {showValidationModal && validationResult && (
        <ValidationModal
          validation={validationResult}
          recommendationText={savedRecord?.rekomendasi || analysisResult?.recommendationText || ''}
          onClose={() => setShowValidationModal(false)}
          onApplyFix={() => {
            setShowValidationModal(false);
            if (!savedRecord) handleSaveToBank();
            setShowEditorModal(true);
          }}
        />
      )}

      {showEditorModal && (savedRecord || analysisResult) && (
        <RecommendationEditorModal
          recommendation={
            savedRecord || {
              id: `rec-${Date.now()}`,
              conditionId: currentCondition?.id || '',
              perangkatDaerah: currentCondition?.perangkatDaerah || '',
              tahunEvaluasi: currentCondition?.tahunEvaluasi || 2024,
              komponen: currentCondition?.komponen || 'Perencanaan Kinerja',
              subkomponen: currentCondition?.subkomponen || '',
              kondisiText: currentCondition?.kondisi || '',
              kriteriaText: analysisResult?.matchedCriteria || currentCondition?.kriteriaText || currentCondition?.criteriaText || '',
              kesenjangan: analysisResult?.gapAnalysis,
              penyebab: analysisResult?.rootCause,
              dampak: analysisResult?.impactAnalysis,
              rekomendasi: analysisResult?.recommendationText || '',
              pihakBertanggungJawab: analysisResult?.responsibleParty || '',
              modeFormulasi: mode,
              status: 'DRAFT',
              dasarHukum: analysisResult?.legalBasisList || [],
              confidenceLevel: analysisResult?.confidenceLevel || 'Tinggi',
              confidenceScore: analysisResult?.confidenceScore || 90,
              auditorName: currentUserName,
              versions: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          }
          availableRegulations={regulations}
          currentUserRole={currentUserRole}
          currentUserName={currentUserName}
          onClose={() => setShowEditorModal(false)}
          onSave={(updated) => {
            onSaveRecommendation(updated);
            setSavedRecord(updated);
            if (analysisResult) {
              setAnalysisResult({
                ...analysisResult,
                recommendationText: updated.rekomendasi,
                responsibleParty: updated.pihakBertanggungJawab,
                legalBasisList: updated.dasarHukum,
              });
            }
            setShowEditorModal(false);
          }}
        />
      )}
    </div>
  );
};
