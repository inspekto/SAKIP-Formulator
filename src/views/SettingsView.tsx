import React, { useState } from 'react';
import { UserRole, AuditLogItem, UserProfile } from '../types/sakip';
import {
  Settings,
  ShieldCheck,
  UserCheck,
  Clock,
  Download,
  Upload,
  Server,
  Key,
  Copy,
  Check,
  Terminal,
  RefreshCw,
  Edit3,
  X,
} from 'lucide-react';
import { SEED_USERS } from '../data/seedData';
import { exportDatabaseJSON, importDatabaseJSON, getUsers, saveUser } from '../services/storageService';

interface SettingsViewProps {
  currentUser: UserProfile;
  usersList?: UserProfile[];
  onSwitchRole: (role: UserRole) => void;
  onSaveUser?: (user: UserProfile) => void;
  auditLogs: AuditLogItem[];
  onResetSeed: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  usersList,
  onSwitchRole,
  onSaveUser,
  auditLogs,
  onResetSeed,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'roles' | 'audit' | 'backup' | 'deploy'>('roles');
  const [copiedDocker, setCopiedDocker] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // State edit role / user name
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editName, setEditName] = useState('');
  const [editRoleLabel, setEditRoleLabel] = useState('');
  const [editJabatan, setEditJabatan] = useState('');
  const [editNip, setEditNip] = useState('');
  const [editAgency, setEditAgency] = useState('');

  const effectiveUsers = usersList && usersList.length > 0 ? usersList : getUsers();

  const handleStartEdit = (usr: UserProfile) => {
    setEditingUser(usr);
    setEditName(usr.name);
    setEditRoleLabel(usr.roleLabel || usr.role);
    setEditJabatan(usr.jabatan || '');
    setEditNip(usr.nip || '');
    setEditAgency(usr.agency || '');
  };

  const handleSaveEdit = () => {
    if (!editingUser) return;
    if (!editName.trim()) {
      alert('Nama pengguna/pejabat tidak boleh kosong!');
      return;
    }
    const updated: UserProfile = {
      ...editingUser,
      name: editName.trim(),
      roleLabel: editRoleLabel.trim() || editingUser.role,
      jabatan: editJabatan.trim(),
      nip: editNip.trim(),
      agency: editAgency.trim(),
    };
    if (onSaveUser) {
      onSaveUser(updated);
    } else {
      saveUser(updated);
    }
    setEditingUser(null);
  };

  const handleExport = () => {
    const jsonStr = exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SAKIP_Formulator_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importDatabaseJSON(content);
      if (success) {
        setImportStatus('Database berhasil dipulihkan!');
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setImportStatus('Gagal memulihkan database: Format JSON tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  const dockerfileSnippet = `# SAKIP Recommendation Formulator - Production Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/src/data ./src/data
COPY --from=builder /app/src/types ./src/types
EXPOSE 3000
CMD ["npx", "tsx", "server.ts"]`;

  const dockerComposeSnippet = `version: '3.8'
services:
  sakip-formulator:
    build: .
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - NODE_ENV=production
      - GEMINI_API_KEY=\${GEMINI_API_KEY}
    restart: unless-stopped`;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-slate-700" />
            Pengaturan Sistem, Audit Trail & Deployment
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasi hak akses pengguna, pemantauan riwayat aktivitas sistem, cadangan database, dan panduan rilis
          </p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('roles')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'roles'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Peran & Hak Akses (RBAC)
        </button>
        <button
          onClick={() => setActiveSubTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'audit'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Audit Trail Log ({auditLogs.length})
        </button>
        <button
          onClick={() => setActiveSubTab('backup')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'backup'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Backup & Restore JSON
        </button>
        <button
          onClick={() => setActiveSubTab('deploy')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'deploy'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Panduan Deployment (Docker / Cloud)
        </button>
      </div>

      {/* Tab 1: Roles */}
      {activeSubTab === 'roles' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Daftar Peran Pengguna SAKIP Formulator
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Klik tombol "Ganti Nama & Peran" pada kartu di bawah ini untuk mengubah nama pejabat, NIP, serta label peran SAKIP.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {effectiveUsers.map((usr) => {
                const isCurrent = currentUser.role === usr.role;

                return (
                  <div
                    key={usr.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-emerald-50/80 border-emerald-300 shadow-sm'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <span
                        onClick={() => handleStartEdit(usr)}
                        className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-slate-900 hover:bg-indigo-900 text-white cursor-pointer transition-colors"
                        title="Klik untuk mengubah nama/label peran ini"
                      >
                        {usr.roleLabel || usr.role}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {isCurrent && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                            Aktif
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleStartEdit(usr)}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded transition-colors border border-indigo-200"
                          title="Ganti nama pejabat dan peran ini"
                        >
                          <Edit3 className="w-2.5 h-2.5" />
                          Ganti
                        </button>
                      </div>
                    </div>

                    <h4
                      onClick={() => handleStartEdit(usr)}
                      className="text-sm font-bold text-slate-900 hover:text-indigo-600 cursor-pointer transition-colors flex items-center justify-between group"
                      title="Klik untuk mengubah nama pejabat/auditor ini"
                    >
                      <span>{usr.name}</span>
                      <Edit3 className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">{usr.jabatan}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {usr.nip ? `NIP: ${usr.nip}` : 'NIP: -'}
                    </p>
                    <p className="text-[11px] text-slate-400">{usr.agency}</p>

                    <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-600 space-y-1">
                      <p className="font-semibold text-slate-800">Kewenangan:</p>
                      {usr.role === 'AUDITOR' && (
                        <p>Menginput kondisi temuan, memformulasikan rekomendasi AI, mengedit draft, dan mengunggah dokumen bukti.</p>
                      )}
                      {usr.role === 'REVIEWER' && (
                        <p>Menguji kelayakan 9 parameter, memberikan catatan telaah Pengendali Teknis, dan menyetujui rekomendasi untuk LHE.</p>
                      )}
                      {usr.role === 'ADMIN' && (
                        <p>Mengelola database peraturan, menambah kriteria SAKIP, manajemen user, backup data, dan konfigurasi sistem.</p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onSwitchRole(usr.role)}
                      disabled={isCurrent}
                      className={`w-full mt-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                        isCurrent
                          ? 'bg-emerald-600 text-white cursor-default'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      {isCurrent ? 'Peran Terpilih' : 'Ganti ke Peran Ini'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Audit Logs */}
      {activeSubTab === 'audit' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Log Riwayat Aktivitas & Perubahan (Audit Trail)
            </h3>
            <span className="text-xs text-slate-500 font-semibold">
              Tercatat {auditLogs.length} aktivitas
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="p-3 w-40">Waktu</th>
                  <th className="p-3 w-40">Pengguna & Peran</th>
                  <th className="p-3 w-36">Aksi</th>
                  <th className="p-3 w-48">Objek Target</th>
                  <th className="p-3">Rincian Perubahan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-3 text-slate-500 font-mono">
                      {new Date(log.timestamp).toLocaleString('id-ID')}
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-slate-900 block">{log.userName}</span>
                      <span className="text-[10px] text-indigo-700 font-semibold">{log.userRole}</span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 text-slate-800 border border-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-800">
                      {log.targetTitle}
                    </td>
                    <td className="p-3 text-slate-600">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Backup & Restore */}
      {activeSubTab === 'backup' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Cadangan Data & Pemulihan (Backup & Restore)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ekspor seluruh database peraturan, kriteria, kondisi, dan rekomendasi ke file JSON lokal
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Export Card */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl w-fit">
                <Download className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Ekspor Cadangan Database</h4>
              <p className="text-xs text-slate-600">
                Unduh snapshot lengkap seluruh database dalam format JSON terenkapsulasi.
              </p>
              <button
                type="button"
                onClick={handleExport}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                Unduh File Backup JSON
              </button>
            </div>

            {/* Import Card */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="p-2.5 bg-blue-100 text-blue-800 rounded-xl w-fit">
                <Upload className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Pulihkan dari File Backup</h4>
              <p className="text-xs text-slate-600">
                Pilih file JSON backup yang pernah diunduh untuk memulihkan seluruh data.
              </p>
              <label className="block w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-center rounded-xl text-xs font-bold cursor-pointer transition-colors">
                Pilih File JSON untuk Dipulihkan
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
              {importStatus && (
                <p className="text-xs font-bold text-center text-indigo-700">{importStatus}</p>
              )}
            </div>
          </div>

          {/* Reset button */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Kembalikan ke Konfigurasi Awal (Seed Data)</span>
              <span className="text-[11px] text-slate-500">Menghapus perubahan lokal dan mengembalikan data simulasi resmi PermenPANRB 88/2021.</span>
            </div>
            <button
              type="button"
              onClick={onResetSeed}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-300 rounded-xl text-xs font-bold transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Database
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Deployment Guide */}
      {activeSubTab === 'deploy' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Panduan Deployment Mandiri (Offline / On-Premise / Cloud)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Aplikasi dapat dijalankan secara mandiri dalam intranet Pemda (Docker) maupun cloud platform
            </p>
          </div>

          {/* Step by step */}
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <h5 className="font-bold text-slate-900 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-600" />
                1. Menjalankan di Lingkungan Lokal / Intranet Pemda
              </h5>
              <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-[11px] space-y-1">
                <p># Clone repo dan install dependencies</p>
                <p>npm install</p>
                <p># Salin variabel environment</p>
                <p>cp .env.example .env</p>
                <p># Jalankan dev server</p>
                <p>npm run dev</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-slate-900 flex items-center gap-2">
                  <Server className="w-4 h-4 text-blue-600" />
                  2. Konfigurasi Container Docker (Dockerfile)
                </h5>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(dockerfileSnippet);
                    setCopiedDocker(true);
                    setTimeout(() => setCopiedDocker(false), 2000);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedDocker ? 'Tersalin!' : 'Salin Dockerfile'}
                </button>
              </div>
              <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-[11px] overflow-x-auto">
                {dockerfileSnippet}
              </pre>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <h5 className="font-bold text-slate-900 flex items-center gap-2">
                <Server className="w-4 h-4 text-indigo-600" />
                3. Docker Compose (docker-compose.yml)
              </h5>
              <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-[11px] overflow-x-auto">
                {dockerComposeSnippet}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Nama Pejabat & Label Peran */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Ganti Nama Pejabat & Label Peran
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Peran Dasar Sistem: <strong className="text-slate-800 uppercase">{editingUser.role}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Nama Pejabat / Pengguna (h4) */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nama Pejabat / Auditor (Lengkap dengan Gelar): <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Contoh: Drs. Bambang Hariyanto, M.Si, CGCAE"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Label / Nama Peran (span) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 block">
                    Nama / Label Peran SAKIP: <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">
                    (Tampil pada badge peran)
                  </span>
                </div>
                <input
                  type="text"
                  value={editRoleLabel}
                  onChange={(e) => setEditRoleLabel(e.target.value)}
                  placeholder="Contoh: EVALUATOR SAKIP / AUDITOR APIP"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
                {/* Pilihan Cepat Label Peran */}
                <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400">Pilihan Cepat:</span>
                  {[
                    'EVALUATOR SAKIP',
                    'AUDITOR APIP',
                    'KETUA TIM EVALUASI SAKIP',
                    'PENGENDALI TEKNIS (DALNIS)',
                    'SUPERVISOR AKIP',
                    'ADMINISTRATOR SAKIP',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setEditRoleLabel(preset)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-800 text-slate-600 rounded text-[10px] font-medium border border-slate-200 transition-colors"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Jabatan Kedinasan */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Jabatan Kedinasan:
                </label>
                <input
                  type="text"
                  value={editJabatan}
                  onChange={(e) => setEditJabatan(e.target.value)}
                  placeholder="Contoh: Auditor Ahli Madya / Penilai SAKIP"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* NIP & Instansi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    NIP:
                  </label>
                  <input
                    type="text"
                    value={editNip}
                    onChange={(e) => setEditNip(e.target.value)}
                    placeholder="19760812 200212 1 003"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Instansi / Unit Kerja:
                  </label>
                  <input
                    type="text"
                    value={editAgency}
                    onChange={(e) => setEditAgency(e.target.value)}
                    placeholder="Inspektorat Daerah / APIP"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-[11px]"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
