import { 
  Regulation, 
  SakipCriteria, 
  ConditionEvaluation, 
  RecommendationRecord, 
  UserProfile, 
  EvidenceDocument, 
  AuditLogItem,
  UserRole
} from '../types/sakip';
import { 
  SEED_REGULATIONS, 
  SEED_CRITERIA, 
  SEED_CONDITIONS, 
  SEED_RECOMMENDATIONS, 
  SEED_EVIDENCE_DOCS, 
  SEED_AUDIT_LOGS, 
  SEED_USERS 
} from '../data/seedData';

const STORAGE_KEYS = {
  REGULATIONS: 'sakip_regulations_v1',
  CRITERIA: 'sakip_criteria_v1',
  CONDITIONS: 'sakip_conditions_v1',
  RECOMMENDATIONS: 'sakip_recommendations_v1',
  EVIDENCE: 'sakip_evidence_v1',
  AUDIT_LOGS: 'sakip_audit_logs_v1',
  ACTIVE_USER: 'sakip_active_user_v1',
  USERS: 'sakip_users_list_v1',
};

// Listeners for multi-component reactivity
type StorageListener = () => void;
const listeners: Set<StorageListener> = new Set();

export const subscribeStorage = (listener: StorageListener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const notifyListeners = () => {
  listeners.forEach(l => l());
};

// Initializer
export const initStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.REGULATIONS)) {
    localStorage.setItem(STORAGE_KEYS.REGULATIONS, JSON.stringify(SEED_REGULATIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CRITERIA)) {
    localStorage.setItem(STORAGE_KEYS.CRITERIA, JSON.stringify(SEED_CRITERIA));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CONDITIONS)) {
    localStorage.setItem(STORAGE_KEYS.CONDITIONS, JSON.stringify(SEED_CONDITIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.RECOMMENDATIONS)) {
    localStorage.setItem(STORAGE_KEYS.RECOMMENDATIONS, JSON.stringify(SEED_RECOMMENDATIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.EVIDENCE)) {
    localStorage.setItem(STORAGE_KEYS.EVIDENCE, JSON.stringify(SEED_EVIDENCE_DOCS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(SEED_AUDIT_LOGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ACTIVE_USER)) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(SEED_USERS[0])); // default Auditor
  }
};

// Users List
export const getUsers = (): UserProfile[] => {
  initStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.USERS);
  return raw ? JSON.parse(raw) : SEED_USERS;
};

export const saveUser = (user: UserProfile) => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === user.id || u.role === user.role);
  let updatedUsers: UserProfile[];
  if (index >= 0) {
    updatedUsers = [...users];
    updatedUsers[index] = { ...updatedUsers[index], ...user };
  } else {
    updatedUsers = [...users, user];
  }
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));

  // If this user is active or same role, update active user as well
  const activeUser = getActiveUser();
  if (activeUser.id === user.id || activeUser.role === user.role) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify({ ...activeUser, ...user }));
  }

  logAction('UPDATE_USER', 'USER', `${user.name} (${user.roleLabel || user.role})`, `Memperbarui nama dan profil peran pengguna.`);
  notifyListeners();
  return user;
};

// Active User
export const getActiveUser = (): UserProfile => {
  initStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
  return raw ? JSON.parse(raw) : SEED_USERS[0];
};

export const setActiveUserRole = (role: UserRole) => {
  const users = getUsers();
  const found = users.find(u => u.role === role) || users[0];
  localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(found));
  logAction('SWITCH_ROLE', 'USER', `Berganti peran aktif ke ${found.roleLabel || role}`, `Pengguna ${found.name} (${found.roleLabel || role}) aktif.`);
  notifyListeners();
  return found;
};

// Audit Log Helper
export const logAction = (action: string, targetType: AuditLogItem['targetType'], targetTitle: string, details: string) => {
  const user = getActiveUser();
  const logs = getAuditLogs();
  const newLog: AuditLogItem = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    userName: user.name,
    userRole: user.role,
    action,
    targetType,
    targetTitle,
    details,
  };
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify([newLog, ...logs].slice(0, 100)));
  notifyListeners();
};

export const getAuditLogs = (): AuditLogItem[] => {
  initStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
  return raw ? JSON.parse(raw) : [];
};

// Regulations CRUD
export const getRegulations = (): Regulation[] => {
  initStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.REGULATIONS);
  return raw ? JSON.parse(raw) : [];
};

export const saveRegulation = (reg: Regulation): Regulation => {
  const list = getRegulations();
  const idx = list.findIndex(r => r.id === reg.id);
  if (idx >= 0) {
    list[idx] = reg;
    logAction('UPDATE_PERATURAN', 'PERATURAN', `${reg.jenis} ${reg.nomor} Th ${reg.tahun}`, `Memperbarui metadata peraturan.`);
  } else {
    list.unshift(reg);
    logAction('TAMBAH_PERATURAN', 'PERATURAN', `${reg.jenis} ${reg.nomor} Th ${reg.tahun}`, `Menambahkan peraturan baru.`);
  }
  localStorage.setItem(STORAGE_KEYS.REGULATIONS, JSON.stringify(list));
  notifyListeners();
  return reg;
};

export const deleteRegulation = (id: string): boolean => {
  const list = getRegulations();
  const target = list.find(r => r.id === id);
  const filtered = list.filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEYS.REGULATIONS, JSON.stringify(filtered));
  if (target) {
    logAction('HAPUS_PERATURAN', 'PERATURAN', `${target.jenis} ${target.nomor}`, `Menghapus peraturan dari database.`);
  }
  notifyListeners();
  return true;
};

// Criteria CRUD
export const getCriteriaList = (): SakipCriteria[] => {
  initStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.CRITERIA);
  return raw ? JSON.parse(raw) : [];
};

export const saveCriteria = (item: SakipCriteria): SakipCriteria => {
  const list = getCriteriaList();
  const idx = list.findIndex(c => c.id === item.id);
  if (idx >= 0) {
    list[idx] = item;
    logAction('UPDATE_KRITERIA', 'KRITERIA', `${item.kode} - ${item.kriteria}`, `Memperbarui kriteria evaluasi SAKIP.`);
  } else {
    list.push(item);
    logAction('TAMBAH_KRITERIA', 'KRITERIA', `${item.kode} - ${item.kriteria}`, `Menambahkan kriteria evaluasi SAKIP baru.`);
  }
  localStorage.setItem(STORAGE_KEYS.CRITERIA, JSON.stringify(list));
  notifyListeners();
  return item;
};

export const deleteCriteria = (id: string): boolean => {
  const list = getCriteriaList();
  const target = list.find(c => c.id === id);
  const filtered = list.filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEYS.CRITERIA, JSON.stringify(filtered));
  if (target) {
    logAction('HAPUS_KRITERIA', 'KRITERIA', `${target.kode}`, `Menghapus kriteria SAKIP.`);
  }
  notifyListeners();
  return true;
};

// Conditions CRUD
export const getConditions = (): ConditionEvaluation[] => {
  initStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.CONDITIONS);
  return raw ? JSON.parse(raw) : [];
};

export const saveCondition = (cond: ConditionEvaluation): ConditionEvaluation => {
  const list = getConditions();
  const idx = list.findIndex(c => c.id === cond.id);
  if (idx >= 0) {
    list[idx] = cond;
    logAction('UPDATE_KONDISI', 'KONDISI', `${cond.perangkatDaerah} (${cond.komponen})`, `Memperbarui data kondisi evaluasi.`);
  } else {
    list.unshift(cond);
    logAction('INPUT_KONDISI', 'KONDISI', `${cond.perangkatDaerah} (${cond.komponen})`, `Memasukkan kondisi evaluasi baru.`);
  }
  localStorage.setItem(STORAGE_KEYS.CONDITIONS, JSON.stringify(list));
  notifyListeners();
  return cond;
};

export const deleteCondition = (id: string): boolean => {
  const list = getConditions();
  const target = list.find(c => c.id === id);
  const filtered = list.filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEYS.CONDITIONS, JSON.stringify(filtered));
  if (target) {
    logAction('HAPUS_KONDISI', 'KONDISI', `${target.perangkatDaerah}`, `Menghapus catatan kondisi evaluasi.`);
  }
  notifyListeners();
  return true;
};

// Recommendations CRUD
export const getRecommendations = (): RecommendationRecord[] => {
  initStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.RECOMMENDATIONS);
  return raw ? JSON.parse(raw) : [];
};

export const saveRecommendation = (rec: RecommendationRecord): RecommendationRecord => {
  const list = getRecommendations();
  const idx = list.findIndex(r => r.id === rec.id);
  if (idx >= 0) {
    list[idx] = rec;
    logAction('UPDATE_REKOMENDASI', 'REKOMENDASI', `${rec.perangkatDaerah}`, `Memperbarui rekomendasi. Status: ${rec.status}`);
  } else {
    list.unshift(rec);
    logAction('FORMULASI_REKOMENDASI', 'REKOMENDASI', `${rec.perangkatDaerah}`, `Menyimpan rekomendasi baru. Mode: ${rec.modeFormulasi}`);
  }
  localStorage.setItem(STORAGE_KEYS.RECOMMENDATIONS, JSON.stringify(list));

  // Mark condition as SUDAH_DIANALISIS
  const conditions = getConditions();
  const condIdx = conditions.findIndex(c => c.id === rec.conditionId);
  if (condIdx >= 0) {
    conditions[condIdx].statusAnalisis = 'SUDAH_DIANALISIS';
    localStorage.setItem(STORAGE_KEYS.CONDITIONS, JSON.stringify(conditions));
  }

  notifyListeners();
  return rec;
};

export const deleteRecommendation = (id: string): boolean => {
  const list = getRecommendations();
  const target = list.find(r => r.id === id);
  const filtered = list.filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEYS.RECOMMENDATIONS, JSON.stringify(filtered));
  if (target) {
    logAction('HAPUS_REKOMENDASI', 'REKOMENDASI', `${target.perangkatDaerah}`, `Menghapus rekomendasi dari Bank Rekomendasi.`);
  }
  notifyListeners();
  return true;
};

// Evidence CRUD
export const getEvidenceList = (): EvidenceDocument[] => {
  initStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.EVIDENCE);
  return raw ? JSON.parse(raw) : [];
};

export const saveEvidence = (doc: EvidenceDocument): EvidenceDocument => {
  const list = getEvidenceList();
  const idx = list.findIndex(d => d.id === doc.id);
  if (idx >= 0) {
    list[idx] = doc;
  } else {
    list.unshift(doc);
  }
  localStorage.setItem(STORAGE_KEYS.EVIDENCE, JSON.stringify(list));
  logAction('UPLOAD_BUKTI', 'KONDISI', doc.namaFile, `Mengunggah dokumen bukti dukung ${doc.jenisDokumen} untuk ${doc.perangkatDaerah}`);
  notifyListeners();
  return doc;
};

// Reset to initial seed
export const resetToInitialSeed = () => {
  localStorage.setItem(STORAGE_KEYS.REGULATIONS, JSON.stringify(SEED_REGULATIONS));
  localStorage.setItem(STORAGE_KEYS.CRITERIA, JSON.stringify(SEED_CRITERIA));
  localStorage.setItem(STORAGE_KEYS.CONDITIONS, JSON.stringify(SEED_CONDITIONS));
  localStorage.setItem(STORAGE_KEYS.RECOMMENDATIONS, JSON.stringify(SEED_RECOMMENDATIONS));
  localStorage.setItem(STORAGE_KEYS.EVIDENCE, JSON.stringify(SEED_EVIDENCE_DOCS));
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(SEED_AUDIT_LOGS));
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
  localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(SEED_USERS[0]));
  logAction('RESET_DATABASE', 'PERATURAN', 'Semua Data', 'Mengembalikan database ke konfigurasi seed awal.');
  notifyListeners();
};

// Backup and Restore
export const exportDatabaseJSON = () => {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    regulations: getRegulations(),
    criteria: getCriteriaList(),
    conditions: getConditions(),
    recommendations: getRecommendations(),
    evidence: getEvidenceList(),
    auditLogs: getAuditLogs(),
    users: getUsers(),
  };
  return JSON.stringify(data, null, 2);
};

export const importDatabaseJSON = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString);
    if (data.regulations) localStorage.setItem(STORAGE_KEYS.REGULATIONS, JSON.stringify(data.regulations));
    if (data.criteria) localStorage.setItem(STORAGE_KEYS.CRITERIA, JSON.stringify(data.criteria));
    if (data.conditions) localStorage.setItem(STORAGE_KEYS.CONDITIONS, JSON.stringify(data.conditions));
    if (data.recommendations) localStorage.setItem(STORAGE_KEYS.RECOMMENDATIONS, JSON.stringify(data.recommendations));
    if (data.evidence) localStorage.setItem(STORAGE_KEYS.EVIDENCE, JSON.stringify(data.evidence));
    if (data.auditLogs) localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(data.auditLogs));
    if (data.users) localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data.users));
    logAction('IMPORT_DATABASE', 'PERATURAN', 'Restore Database', 'Memulihkan cadangan database dari file JSON eksternal.');
    notifyListeners();
    return true;
  } catch (err) {
    console.error('Import failed', err);
    return false;
  }
};
