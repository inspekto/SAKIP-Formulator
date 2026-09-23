import React from 'react';
import { UserProfile, UserRole } from '../types/sakip';
import { ShieldCheck, Sparkles, UserCheck, RefreshCw, FileText } from 'lucide-react';
import { SEED_USERS } from '../data/seedData';

interface NavbarProps {
  currentUser: UserProfile;
  onSwitchRole: (role: UserRole) => void;
  onOpenReport: () => void;
  onResetSeed: () => void;
  regCount: number;
  recCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSwitchRole,
  onOpenReport,
  onResetSeed,
  regCount,
  recCount,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 flex items-center justify-center shadow-md shadow-emerald-950">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-tight text-white uppercase">
                SAKIP Formulator
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Sparkles className="w-3 h-3 text-emerald-400" /> APIP AI Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Evaluasi AKIP & Formulasi Rekomendasi Formal Auditor Perangkat Daerah
            </p>
          </div>
        </div>

        {/* Right Section: Stats & Role Switcher */}
        <div className="flex items-center gap-3">
          {/* Quick Stat Badges */}
          <div className="hidden lg:flex items-center gap-2 text-xs border-r border-slate-800 pr-3 mr-1">
            <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
              📚 <strong className="text-white">{regCount}</strong> Peraturan
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
              📝 <strong className="text-white">{recCount}</strong> Rekomendasi
            </span>
          </div>

          {/* Quick Export Button */}
          <button
            onClick={onOpenReport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            title="Buka Pratinjau & Ekspor Laporan LHE / KKE"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Cetak LHE / KKE</span>
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={onResetSeed}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Reset Database ke Data Seed Awal"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Role Switcher */}
          <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 rounded-xl px-2.5 py-1">
            <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-left hidden sm:block">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block leading-tight">
                Peran Aktif:
              </span>
              <span className="text-xs font-bold text-white leading-tight truncate max-w-[150px] block" title={`${currentUser.name} (${currentUser.roleLabel || currentUser.role})`}>
                {currentUser.roleLabel || currentUser.role}
              </span>
            </div>
            <select
              value={currentUser.role}
              onChange={(e) => onSwitchRole(e.target.value as UserRole)}
              className="bg-slate-900 text-white text-xs font-semibold rounded-lg px-2 py-1 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="AUDITOR">Auditor (APIP)</option>
              <option value="REVIEWER">Reviewer (Dalnis)</option>
              <option value="ADMIN">Admin (SAKIP)</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
