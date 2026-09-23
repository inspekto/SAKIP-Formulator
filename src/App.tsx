import React, { useState, useEffect } from 'react';
import {
  Regulation,
  SakipCriteria,
  ConditionEvaluation,
  RecommendationRecord,
  UserProfile,
  EvidenceDocument,
  AuditLogItem,
  UserRole,
} from './types/sakip';
import {
  initStorage,
  subscribeStorage,
  getRegulations,
  getCriteriaList,
  getConditions,
  getRecommendations,
  getEvidenceList,
  getAuditLogs,
  getUsers,
  saveUser,
  getActiveUser,
  setActiveUserRole,
  saveRegulation,
  deleteRegulation,
  saveCriteria,
  deleteCriteria,
  saveCondition,
  deleteCondition,
  saveRecommendation,
  deleteRecommendation,
  saveEvidence,
  resetToInitialSeed,
} from './services/storageService';
import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { DashboardView } from './views/DashboardView';
import { RegulationsView } from './views/RegulationsView';
import { CriteriaView } from './views/CriteriaView';
import { InputConditionView } from './views/InputConditionView';
import { RecommendationFormulatorView } from './views/RecommendationFormulatorView';
import { ValidationView } from './views/ValidationView';
import { RecommendationBankView } from './views/RecommendationBankView';
import { ComparisonMatrixView } from './views/ComparisonMatrixView';
import { EvidenceView } from './views/EvidenceView';
import { SettingsView } from './views/SettingsView';

// Modals
import { RegulationModal } from './components/RegulationModal';
import { CriteriaModal } from './components/CriteriaModal';
import { AuditTrailModal } from './components/AuditTrailModal';
import { RecommendationEditorModal } from './components/RecommendationEditorModal';
import { ReportExportModal } from './components/ReportExportModal';

export function App() {
  // Persistence state
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [criteriaList, setCriteriaList] = useState<SakipCriteria[]>([]);
  const [conditions, setConditions] = useState<ConditionEvaluation[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationRecord[]>([]);
  const [evidenceList, setEvidenceList] = useState<EvidenceDocument[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile>(getActiveUser());
  const [usersList, setUsersList] = useState<UserProfile[]>([]);

  // Navigation state
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [activeConditionForAnalysis, setActiveConditionForAnalysis] = useState<ConditionEvaluation | null>(null);

  // Modals state
  const [showRegModal, setShowRegModal] = useState(false);
  const [editingReg, setEditingReg] = useState<Regulation | null>(null);

  const [showCritModal, setShowCritModal] = useState(false);
  const [editingCrit, setEditingCrit] = useState<SakipCriteria | null>(null);

  const [selectedAuditRec, setSelectedAuditRec] = useState<RecommendationRecord | null>(null);
  const [selectedEditRec, setSelectedEditRec] = useState<RecommendationRecord | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  // Reload data from storage
  const reloadData = () => {
    setRegulations(getRegulations());
    setCriteriaList(getCriteriaList());
    setConditions(getConditions());
    setRecommendations(getRecommendations());
    setEvidenceList(getEvidenceList());
    setAuditLogs(getAuditLogs());
    setUsersList(getUsers());
    setCurrentUser(getActiveUser());
  };

  useEffect(() => {
    initStorage();
    reloadData();
    const unsubscribe = subscribeStorage(() => {
      reloadData();
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Handlers
  const handleSwitchRole = (role: UserRole) => {
    setActiveUserRole(role);
  };

  const handleResetSeed = () => {
    if (confirm('Apakah Anda yakin ingin mereset seluruh database ke data awal? Perubahan lokal akan dikembalikan.')) {
      resetToInitialSeed();
    }
  };

  const handleTriggerAnalysisFromInput = (cond: ConditionEvaluation) => {
    setActiveConditionForAnalysis(cond);
    setActiveTab('recommendation');
  };

  const handleDuplicateAsTemplate = (rec: RecommendationRecord) => {
    const duplicated: RecommendationRecord = {
      ...rec,
      id: `rec-${Date.now()}`,
      rekomendasi: `[Template] ${rec.rekomendasi}`,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      versions: [
        {
          version: 1,
          content: rec.rekomendasi,
          author: currentUser.name,
          authorRole: currentUser.role,
          timestamp: new Date().toISOString(),
          note: `Duplikasi dari rekomendasi ${rec.perangkatDaerah}`,
        },
      ],
    };
    saveRecommendation(duplicated);
    setSelectedEditRec(duplicated);
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 antialiased flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onSwitchRole={handleSwitchRole}
        onOpenReport={() => setShowReportModal(true)}
        onResetSeed={handleResetSeed}
        regCount={regulations.length}
        recCount={recommendations.length}
      />

      {/* Main Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          badgeCounts={{
            regulations: regulations.length,
            criteria: criteriaList.length,
            conditions: conditions.length,
            recommendations: recommendations.length,
          }}
        />

        {/* Content View Area */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-5xl">
          {activeTab === 'dashboard' && (
            <DashboardView
              regulations={regulations}
              criteria={criteriaList}
              conditions={conditions}
              recommendations={recommendations}
              auditLogs={auditLogs}
              onNavigate={setActiveTab}
              currentUserRole={currentUser.role}
            />
          )}

          {activeTab === 'regulations' && (
            <RegulationsView
              regulations={regulations}
              onAddRegulation={() => {
                setEditingReg(null);
                setShowRegModal(true);
              }}
              onEditRegulation={(reg) => {
                setEditingReg(reg);
                setShowRegModal(true);
              }}
              onDeleteRegulation={(id) => deleteRegulation(id)}
            />
          )}

          {activeTab === 'criteria' && (
            <CriteriaView
              criteria={criteriaList}
              onAddCriteria={() => {
                setEditingCrit(null);
                setShowCritModal(true);
              }}
              onEditCriteria={(crit) => {
                setEditingCrit(crit);
                setShowCritModal(true);
              }}
              onDeleteCriteria={(id) => deleteCriteria(id)}
            />
          )}

          {activeTab === 'input-condition' && (
            <InputConditionView
              criteriaList={criteriaList}
              conditions={conditions}
              onSaveCondition={(cond) => saveCondition(cond)}
              onDeleteCondition={(id) => deleteCondition(id)}
              onTriggerAnalysis={handleTriggerAnalysisFromInput}
            />
          )}

          {activeTab === 'recommendation' && (
            <RecommendationFormulatorView
              conditions={conditions}
              regulations={regulations}
              criteriaList={criteriaList}
              activeCondition={activeConditionForAnalysis}
              currentUserRole={currentUser.role}
              currentUserName={currentUser.name}
              onSaveRecommendation={(rec) => saveRecommendation(rec)}
              onViewAuditTrail={(rec) => setSelectedAuditRec(rec)}
            />
          )}

          {activeTab === 'validation' && (
            <ValidationView
              recommendations={recommendations}
              onOpenEditor={(rec) => setSelectedEditRec(rec)}
            />
          )}

          {activeTab === 'bank' && (
            <RecommendationBankView
              recommendations={recommendations}
              onOpenEditor={(rec) => setSelectedEditRec(rec)}
              onOpenAuditTrail={(rec) => setSelectedAuditRec(rec)}
              onDeleteRecommendation={(id) => deleteRecommendation(id)}
              onDuplicateAsTemplate={handleDuplicateAsTemplate}
              onOpenReportModal={() => setShowReportModal(true)}
            />
          )}

          {activeTab === 'comparison' && (
            <ComparisonMatrixView
              conditions={conditions}
              criteriaList={criteriaList}
            />
          )}

          {activeTab === 'evidence' && (
            <EvidenceView
              evidenceList={evidenceList}
              onSaveEvidence={(doc) => saveEvidence(doc)}
            />
          )}

          {activeTab === 'reports' && (
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <h3 className="text-lg font-bold text-slate-900">
                  Pusat Generator LHE & KKE SAKIP
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Format resmi Kertas Kerja Evaluasi (KKE) dan Laporan Hasil Evaluasi (LHE) siap cetak dan ekspor
                </p>
                <button
                  onClick={() => setShowReportModal(true)}
                  className="mt-4 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Buka Dokumen Resmi KKE / LHE
                </button>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <SettingsView
              currentUser={currentUser}
              usersList={usersList}
              onSwitchRole={handleSwitchRole}
              onSaveUser={saveUser}
              auditLogs={auditLogs}
              onResetSeed={handleResetSeed}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      {showRegModal && (
        <RegulationModal
          regulation={editingReg}
          onClose={() => setShowRegModal(false)}
          onSave={(saved) => {
            saveRegulation(saved);
            setShowRegModal(false);
          }}
        />
      )}

      {showCritModal && (
        <CriteriaModal
          criteria={editingCrit}
          availableRegulations={regulations}
          onClose={() => setShowCritModal(false)}
          onSave={(saved) => {
            saveCriteria(saved);
            setShowCritModal(false);
          }}
        />
      )}

      {selectedAuditRec && (
        <AuditTrailModal
          recommendation={selectedAuditRec}
          onClose={() => setSelectedAuditRec(null)}
        />
      )}

      {selectedEditRec && (
        <RecommendationEditorModal
          recommendation={selectedEditRec}
          availableRegulations={regulations}
          currentUserRole={currentUser.role}
          currentUserName={currentUser.name}
          onClose={() => setSelectedEditRec(null)}
          onSave={(updated) => {
            saveRecommendation(updated);
            setSelectedEditRec(null);
          }}
        />
      )}

      {showReportModal && (
        <ReportExportModal
          recommendations={recommendations}
          conditions={conditions}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
}

export default App;
