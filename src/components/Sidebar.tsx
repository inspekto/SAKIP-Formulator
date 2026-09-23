import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Scale,
  Search,
  Bot,
  CheckCircle2,
  Database,
  ArrowLeftRight,
  FolderLock,
  FileText,
  Settings,
  ChevronRight,
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'regulations'
  | 'criteria'
  | 'input-condition'
  | 'recommendation'
  | 'validation'
  | 'bank'
  | 'comparison'
  | 'evidence'
  | 'reports'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  badgeCounts: {
    regulations: number;
    criteria: number;
    conditions: number;
    recommendations: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  badgeCounts,
}) => {
  const menuItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      desc: 'Ringkasan & statistik AKIP',
    },
    {
      id: 'regulations' as ActiveTab,
      label: 'Database Peraturan',
      icon: BookOpen,
      desc: 'Regulasi & ekstraksi pasal',
      badge: badgeCounts.regulations,
    },
    {
      id: 'criteria' as ActiveTab,
      label: 'Kriteria SAKIP',
      icon: Scale,
      desc: '5 Komponen evaluasi',
      badge: badgeCounts.criteria,
    },
    {
      id: 'input-condition' as ActiveTab,
      label: 'Input Kondisi / Temuan',
      icon: Search,
      desc: 'Form evaluasi perangkat daerah',
      badge: badgeCounts.conditions,
    },
    {
      id: 'recommendation' as ActiveTab,
      label: 'Formulator Rekomendasi',
      icon: Bot,
      desc: 'Analisis 6-tahap & rekomendasi AI',
      highlight: true,
    },
    {
      id: 'validation' as ActiveTab,
      label: 'Cek Kesesuaian (Validasi)',
      icon: CheckCircle2,
      desc: 'Uji 9 parameter mutu APIP',
    },
    {
      id: 'bank' as ActiveTab,
      label: 'Bank Rekomendasi',
      icon: Database,
      desc: 'Arsip & riwayat formulasi',
      badge: badgeCounts.recommendations,
    },
    {
      id: 'comparison' as ActiveTab,
      label: 'Matriks Perbandingan',
      icon: ArrowLeftRight,
      desc: 'Kondisi vs Kriteria & Gap',
    },
    {
      id: 'evidence' as ActiveTab,
      label: 'Bukti Dukung',
      icon: FolderLock,
      desc: 'Renstra, IKU, LKjIP analyzer',
    },
    {
      id: 'reports' as ActiveTab,
      label: 'Laporan & Ekspor',
      icon: FileText,
      desc: 'Cetak resmi KKE / LHE',
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Pengaturan & Sistem',
      icon: Settings,
      desc: 'Audit log, role & deployment',
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      {/* Navigation list */}
      <div className="p-3 space-y-1 flex-1">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Menu Utama SAKIP
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all group ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : item.highlight
                  ? 'bg-emerald-50/80 text-emerald-900 hover:bg-emerald-100/80 border border-emerald-200/80'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive
                      ? 'text-emerald-400'
                      : item.highlight
                      ? 'text-emerald-600'
                      : 'text-slate-500 group-hover:text-slate-800'
                  }`}
                />
                <div className="truncate">
                  <span className="block truncate">{item.label}</span>
                  <span
                    className={`block text-[10px] font-normal truncate ${
                      isActive
                        ? 'text-slate-300'
                        : item.highlight
                        ? 'text-emerald-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {item.desc}
                  </span>
                </div>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                    isActive
                      ? 'bg-slate-800 text-slate-200'
                      : 'bg-slate-200/70 text-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500">
        <div className="flex items-center justify-between font-semibold text-slate-700">
          <span>APIP SAKIP v1.0</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5">
          PermenPANRB 88/2021 Compliant
        </p>
      </div>
    </aside>
  );
};
