import React from 'react';
import {
  Regulation,
  SakipCriteria,
  ConditionEvaluation,
  RecommendationRecord,
  AuditLogItem,
  UserRole,
} from '../types/sakip';
import { ActiveTab } from '../components/Sidebar';
import {
  BookOpen,
  Scale,
  Search,
  Bot,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  FileCheck,
  ShieldAlert,
  Sparkles,
  Award,
} from 'lucide-react';

interface DashboardViewProps {
  regulations: Regulation[];
  criteria: SakipCriteria[];
  conditions: ConditionEvaluation[];
  recommendations: RecommendationRecord[];
  auditLogs: AuditLogItem[];
  onNavigate: (tab: ActiveTab) => void;
  currentUserRole: UserRole;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  regulations,
  criteria,
  conditions,
  recommendations,
  auditLogs,
  onNavigate,
  currentUserRole,
}) => {
  // Stat calculations
  const regCount = regulations.length;
  const critCount = criteria.length;
  const condCount = conditions.length;
  const recCount = recommendations.length;

  const draftCount = recommendations.filter((r) => r.status === 'DRAFT').length;
  const reviewCount = recommendations.filter((r) => r.status === 'REVIEW').length;
  const approvedCount = recommendations.filter((r) => r.status === 'DISETUJUI').length;
  const revisionCount = recommendations.filter((r) => r.status === 'PERLU_REVISI').length;

  // Components breakdown
  const components = [
    'Perencanaan Kinerja',
    'Pengukuran Kinerja',
    'Pelaporan Kinerja',
    'Evaluasi Akuntabilitas Kinerja Internal',
    'Capaian Kinerja',
  ] as const;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Sistem Pendukung Keputusan APIP • SAKIP Recommendation Formulator
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Evaluasi AKIP & Formulasi Rekomendasi Auditor
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Membantu auditor dan pengendali teknis merumuskan rekomendasi hasil evaluasi secara otomatis,
            berdasar hukum resmi dari database regulasi, spesifik, konstruktif, dan dapat ditelusuri (traceable).
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('input-condition')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all"
            >
              <Search className="w-4 h-4" />
              Input Kondisi Evaluasi Baru
            </button>
            <button
              onClick={() => onNavigate('recommendation')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition-all"
            >
              <Bot className="w-4 h-4 text-emerald-400" />
              Formulasi Rekomendasi AI
            </button>
            <button
              onClick={() => onNavigate('reports')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition-all"
            >
              <FileCheck className="w-4 h-4 text-blue-400" />
              Pratinjau KKE & LHE
            </button>
          </div>
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-emerald-500/10 via-indigo-500/10 to-transparent pointer-events-none hidden lg:block" />
      </div>

      {/* 4 Main Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Peraturan */}
        <div
          onClick={() => onNavigate('regulations')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Database Peraturan
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{regCount}</span>
            <span className="text-xs text-slate-500 font-medium">Peraturan Resmi</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>PermenPANRB 88/2021, PP 8/2006, dll</span>
          </p>
        </div>

        {/* Card 2: Kriteria */}
        <div
          onClick={() => onNavigate('criteria')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Kriteria SAKIP
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{critCount}</span>
            <span className="text-xs text-slate-500 font-medium">Kriteria Evaluasi</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Tersebar di 5 komponen evaluasi AKIP
          </p>
        </div>

        {/* Card 3: Kondisi */}
        <div
          onClick={() => onNavigate('input-condition')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Kondisi Dianalisis
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
              <Search className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{condCount}</span>
            <span className="text-xs text-slate-500 font-medium">Temuan Evaluasi</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Dari seluruh Perangkat Daerah binaan
          </p>
        </div>

        {/* Card 4: Rekomendasi */}
        <div
          onClick={() => onNavigate('bank')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Rekomendasi Dibuat
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{recCount}</span>
            <span className="text-xs text-slate-500 font-medium">Butir Rekomendasi</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {approvedCount} Disetujui • {reviewCount} Review • {draftCount} Draft
          </p>
        </div>
      </div>

      {/* Grid 2: Status Rekomendasi & Breakdown Komponen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Rekomendasi Box */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Status Rekomendasi
            </h3>
            <span className="text-xs text-slate-500 font-semibold">Total {recCount}</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-emerald-600"></div>
                <div>
                  <span className="text-xs font-bold text-emerald-950 block">Disetujui (Final LHE)</span>
                  <span className="text-[10px] text-emerald-700">Tervalidasi siap masuk LHE</span>
                </div>
              </div>
              <span className="text-lg font-black text-emerald-800">{approvedCount}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                <div>
                  <span className="text-xs font-bold text-blue-950 block">Dalam Telaah Reviewer</span>
                  <span className="text-[10px] text-blue-700">Menunggu persetujuan Dalnis</span>
                </div>
              </div>
              <span className="text-lg font-black text-blue-800">{reviewCount}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div>
                  <span className="text-xs font-bold text-amber-950 block">Draft AI / Auditor</span>
                  <span className="text-[10px] text-amber-700">Masih dalam penyusunan</span>
                </div>
              </div>
              <span className="text-lg font-black text-amber-800">{draftCount}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50 border border-rose-200">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <div>
                  <span className="text-xs font-bold text-rose-950 block">Perlu Revisi</span>
                  <span className="text-[10px] text-rose-700">Ada catatan penyempurnaan</span>
                </div>
              </div>
              <span className="text-lg font-black text-rose-800">{revisionCount}</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('bank')}
              className="w-full text-center py-2 text-xs font-bold text-slate-700 hover:text-slate-900 hover:underline flex items-center justify-center gap-1"
            >
              Lihat Semua di Bank Rekomendasi <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Breakdown 5 Komponen SAKIP */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Distribusi Temuan & Kriteria per Komponen SAKIP
              </h3>
              <p className="text-xs text-slate-500">
                Sesuai Bobot dan Pedoman LKE PermenPANRB Nomor 88 Tahun 2021
              </p>
            </div>
          </div>

          <div className="space-y-3.5">
            {components.map((comp, idx) => {
              const countCrit = criteria.filter((c) => c.komponen === comp).length;
              const countCond = conditions.filter((c) => c.komponen === comp).length;
              const countRec = recommendations.filter((r) => r.komponen === comp).length;

              return (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900">
                      {String.fromCharCode(65 + idx)}. {comp}
                    </span>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-500">
                        <strong>{countCrit}</strong> Kriteria
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-amber-700 font-semibold">
                        <strong>{countCond}</strong> Temuan
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-emerald-700 font-bold">
                        <strong>{countRec}</strong> Rekomendasi
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-2"
                      style={{ width: `${Math.min(100, countRec * 25)}%` }}
                    ></div>
                    <div
                      className="bg-amber-400 h-2"
                      style={{ width: `${Math.min(100, countCond * 15)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid 3: Aktivitas Terakhir (Audit Log Timeline) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Aktivitas Terakhir & Riwayat Audit (Audit Trail Log)
            </h3>
          </div>
          <button
            onClick={() => onNavigate('settings')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
          >
            Lihat Log Lengkap
          </button>
        </div>

        <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
          {auditLogs.slice(0, 6).map((log) => (
            <div key={log.id} className="py-3 flex items-start justify-between gap-4 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{log.userName}</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    {log.userRole}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="font-semibold text-indigo-700">{log.action}</span>
                </div>
                <p className="text-slate-700 font-medium">{log.targetTitle}</p>
                <p className="text-slate-500 text-[11px]">{log.details}</p>
              </div>
              <span className="text-[11px] text-slate-400 shrink-0">
                {new Date(log.timestamp).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
