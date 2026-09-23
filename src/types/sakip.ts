export type UserRole = 'ADMIN' | 'AUDITOR' | 'REVIEWER';

export interface UserProfile {
  id: string;
  name: string;
  nip: string;
  role: UserRole;
  roleLabel?: string;
  agency: string;
  avatar?: string;
  jabatan?: string;
  email?: string;
}

export type SakipComponent = 
  | 'Perencanaan Kinerja'
  | 'Pengukuran Kinerja'
  | 'Pelaporan Kinerja'
  | 'Evaluasi Akuntabilitas Kinerja Internal'
  | 'Capaian Kinerja';

export interface RegulationArticle {
  id: string;
  bab?: string;
  pasal?: string;
  ayat?: string;
  lampiran?: string;
  text: string;
  topic: string;
  keywords: string[];
}

export interface Regulation {
  id: string;
  nomor: string;
  tahun: number;
  jenis: 'PermenPANRB' | 'PP' | 'Perpres' | 'Permendagri' | 'Perda' | 'Pergub' | 'SE MenPANRB' | 'Lainnya';
  judul: string;
  penerbit: string;
  tanggalPenetapan: string;
  topik: string[];
  statusBerlaku: boolean;
  fileName?: string;
  fileSize?: string;
  fileData?: string; // base64 or simulated text content
  kataKunci: string[];
  ringkasan: string;
  articles: RegulationArticle[];
  createdAt: string;
}

export interface SakipCriteria {
  id: string;
  kode: string; // e.g. "A.1.1"
  komponen: SakipComponent;
  subkomponen: string;
  kriteria: string;
  indikator: string;
  buktiDukung: string[];
  pertanyaanEvaluasi: string;
  dasarHukumIds: string[]; // references Regulation ids
  dasarHukumDisplay: string;
  bobotNilai: number;
}

export interface LegalBasisCitation {
  regulationId: string;
  regulationName: string;
  article: string; // e.g. "Pasal 7 ayat (2)" or "Lampiran I Bab III"
  page?: string;
  citation: string;
  relevanceReason: string;
  isVerifiedInDatabase: boolean;
}

export interface ConditionEvaluation {
  id: string;
  perangkatDaerah: string;
  tahunEvaluasi: number;
  komponen: SakipComponent;
  subkomponen: string;
  kriteriaId?: string;
  criteriaId?: string;
  kriteriaText: string;
  criteriaText?: string;
  kondisi: string;
  buktiDukung: string;
  faktaPendukung: string;
  dokumenBuktiNama?: string;
  dokumenBuktiSize?: string;
  dokumenBuktiUrl?: string;
  permasalahan: string;
  dampak: string;
  auditorId?: string;
  auditorName?: string;
  createdAt: string;
  updatedAt?: string;
  statusAnalisis: 'BELUM_DIANALISIS' | 'SUDAH_DIANALISIS';
}

export type RecommendationStatus = 'DRAFT' | 'REVIEW' | 'DISETUJUI' | 'PERLU_REVISI';

export interface AuditTrailNode {
  type: 'REKOMENDASI' | 'KONDISI' | 'KRITERIA' | 'PERATURAN' | 'PASAL' | 'BUKTI';
  title: string;
  subtitle: string;
  details: string;
}

export interface ValidationItem {
  id: number;
  question: string;
  status: 'SESUAI' | 'PERLU_PERBAIKAN' | 'TIDAK_TERPENUHI';
  explanation: string;
}

export interface RecommendationValidation {
  recommendationId?: string;
  overallStatus: 'Sesuai' | 'Perlu Penyempurnaan' | 'Tidak Didukung Database';
  summary: string;
  items: ValidationItem[];
  checkedAt: string;
}

export interface RecommendationVersion {
  version: number;
  content: string;
  author: string;
  authorRole: UserRole;
  timestamp: string;
  note?: string;
}

export interface RecommendationRecord {
  id: string;
  conditionId: string;
  perangkatDaerah: string;
  tahunEvaluasi: number;
  komponen: SakipComponent;
  subkomponen: string;
  kriteriaText: string;
  kondisiText: string;
  intiMasalah?: string;
  kesenjangan?: string;
  penyebab?: string;
  dampak?: string;
  rekomendasi: string;
  pihakBertanggungJawab: string;
  gayaBahasa?: string;
  modeFormulasi: 'DATABASE' | 'AI' | 'HYBRID';
  confidenceLevel: 'Tinggi' | 'Sedang' | 'Rendah';
  confidenceScore: number;
  dasarHukum: LegalBasisCitation[];
  status: RecommendationStatus;
  auditorName: string;
  reviewerName?: string;
  reviewerNotes?: string;
  validationResult?: RecommendationValidation;
  versions: RecommendationVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  targetType: 'PERATURAN' | 'KONDISI' | 'REKOMENDASI' | 'VALIDASI' | 'KRITERIA' | 'USER';
  targetTitle: string;
  details: string;
}

export interface EvidenceDocument {
  id: string;
  perangkatDaerah: string;
  tahun?: number;
  jenisDokumen: string;
  namaFile: string;
  ukuranFile?: string;
  fileSize?: string;
  contentSnippet?: string;
  uploadedAt: string;
  statusReview?: 'Belum Direview' | 'Sesuai' | 'Ada Catatan' | 'Perlu Pemenuhan';
  aiReviewStatus?: 'Belum Direview' | 'Sesuai' | 'Ada Catatan' | 'Perlu Pemenuhan';
  aiReviewSummary?: string;
  ringkasanTemuan?: string;
  potensiGap?: string[];
  rekomendasiAwal?: string;
}
