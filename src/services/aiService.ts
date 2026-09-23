import { Regulation, SakipCriteria, LegalBasisCitation } from '../types/sakip';

export interface AnalyzeConditionParams {
  conditionText: string;
  component: string;
  subcomponent: string;
  criteriaText: string;
  agency: string;
  year: number;
  facts?: string;
  impact?: string;
  evidenceText?: string;
  mode: 'DATABASE' | 'AI' | 'HYBRID';
  availableRegulations: Regulation[];
  availableCriteria: SakipCriteria[];
}

export interface AnalyzeConditionResult {
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
}

export const callAnalyzeCondition = async (params: AnalyzeConditionParams): Promise<AnalyzeConditionResult> => {
  const response = await fetch('/api/gemini/analyze-condition', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Gagal melakukan analisis kondisi evaluasi.');
  }

  return response.json();
};

export interface ValidateRecommendationParams {
  recommendationText: string;
  conditionText: string;
  criteriaText: string;
  legalBasisList: LegalBasisCitation[];
  agency: string;
}

export interface ValidateRecommendationResult {
  overallStatus: 'Sesuai' | 'Perlu Penyempurnaan' | 'Tidak Didukung Database';
  summary: string;
  items: Array<{
    id: number;
    question: string;
    status: 'SESUAI' | 'PERLU_PERBAIKAN' | 'TIDAK_TERPENUHI';
    explanation: string;
  }>;
  checkedAt?: string;
}

export const callValidateRecommendation = async (params: ValidateRecommendationParams): Promise<ValidateRecommendationResult> => {
  const response = await fetch('/api/gemini/validate-recommendation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Gagal memvalidasi rekomendasi.');
  }

  return response.json();
};

export interface ExtractRegulationParams {
  documentTitle: string;
  rawText: string;
  jenis?: string;
  nomor?: string;
  tahun?: number;
}

export const callExtractRegulation = async (params: ExtractRegulationParams) => {
  const response = await fetch('/api/gemini/extract-regulation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Gagal mengekstrak peraturan.');
  }

  return response.json();
};

export const callAuditEvidence = async (documentType: string, contentSnippet: string, agency: string) => {
  const response = await fetch('/api/gemini/audit-document', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentType, contentSnippet, agency }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Gagal memeriksa dokumen bukti.');
  }

  return response.json();
};
