import React, { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import StatCards from './components/dashboard/StatCards';
import ComplianceChart from './components/dashboard/ComplianceChart';
import RecentActivity from './components/dashboard/RecentActivity';
import ImageUploader from './components/detection/ImageUploader';
import DetectionViewer from './components/detection/DetectionViewer';
import SafetyBanner from './components/detection/SafetyBanner';
import DetectionStats from './components/detection/DetectionStats';
import HistoryTable from './components/history/HistoryTable';
import HistoryDetailModal from './components/history/HistoryDetailModal';
import {
  checkHealth,
  getDashboardStats,
  getDetectionHistory,
  detectImage,
} from './api/client';
import { AlertCircle, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [health, setHealth] = useState(null);
  const [stats, setStats] = useState(null);
  const [historyData, setHistoryData] = useState(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyStatusFilter, setHistoryStatusFilter] = useState('ALL');
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  // Detection State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentDetection, setCurrentDetection] = useState(null);
  const [originalImageUrl, setOriginalImageUrl] = useState(null);
  const [selectedHistoryRecord, setSelectedHistoryRecord] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch Health Status
  const fetchHealth = async () => {
    try {
      const data = await checkHealth();
      setHealth(data);
    } catch (err) {
      console.error('Health check failed', err);
      setHealth({ model_loaded: false, database_connected: false, status: 'offline' });
    }
  };

  // Fetch Dashboard Stats
  const fetchStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats', err);
    }
  };

  // Fetch Detection History
  const fetchHistory = async (page = historyPage, status = historyStatusFilter) => {
    setIsHistoryLoading(true);
    try {
      const data = await getDetectionHistory(page, 10, status);
      setHistoryData(data);
    } catch (err) {
      console.error('Failed to fetch history', err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    fetchStats();
    fetchHistory(1, 'ALL');
  }, []);

  // Handle Detection Trigger
  const handleDetect = async (file, confidence) => {
    setIsAnalyzing(true);
    const originalUrl = URL.createObjectURL(file);
    setOriginalImageUrl(originalUrl);

    try {
      const result = await detectImage(file, confidence);
      setCurrentDetection({
        ...result,
        filename: file.name,
      });

      // Reload stats and history in background
      fetchStats();
      fetchHistory(1, historyStatusFilter);

      if (result.summary?.safety_status === 'VIOLATION') {
        showToast(`Safety Violation Detected: ${result.summary.total_violations} issue(s) found!`, 'error');
      } else {
        showToast('Image scan completed successfully! 100% compliant.', 'success');
      }

      setActiveTab('detection');
    } catch (err) {
      console.error('Detection request failed', err);
      showToast(err.response?.data?.detail || 'Detection failed. Please check backend connection.', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-industrial-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar health={health} onRefreshHealth={fetchHealth} />

      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed top-16 right-6 z-50 p-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-top-2 duration-200 text-sm font-medium ${
            toastMessage.type === 'error'
              ? 'bg-red-950/90 border-red-500/50 text-red-200'
              : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span>{toastMessage.message}</span>
        </div>
      )}

      {/* Main Layout Container */}
      <div className="flex flex-1">
        {/* Left Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Dynamic Content Views */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8 overflow-y-auto">
          {/* TAB 1: SAFETY DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">
                    Industrial Safety Dashboard
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Continuous monitoring of PPE compliance across active industrial work zones
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('detection')}
                  className="self-start sm:self-auto px-4 py-2 rounded-xl bg-safety-amber hover:bg-amber-400 text-industrial-950 font-bold text-xs transition shadow-lg shadow-safety-amber/20"
                >
                  + New PPE Inspection
                </button>
              </div>

              {/* KPI Stat Cards */}
              <StatCards stats={stats} />

              {/* Visual Compliance Charts */}
              <ComplianceChart stats={stats} />

              {/* Recent Activity Timeline */}
              <RecentActivity
                recentDetections={stats?.recent_detections}
                onSelectDetection={(item) => setSelectedHistoryRecord(item)}
                onNavigateToDetection={() => setActiveTab('detection')}
              />
            </div>
          )}

          {/* TAB 2: PPE DETECTION STUDIO */}
          {activeTab === 'detection' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">
                  PPE Detection Studio
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Automated computer vision PPE inference utilizing pre-trained YOLO11 weights
                </p>
              </div>

              {/* Upload Zone */}
              <ImageUploader onDetect={handleDetect} isAnalyzing={isAnalyzing} />

              {/* Detection Results Output */}
              {currentDetection && (
                <div className="space-y-6 pt-2">
                  {/* Safety Alert Banner */}
                  <SafetyBanner
                    summary={currentDetection.summary}
                    inferenceTimeMs={currentDetection.inference_time_ms}
                  />

                  {/* Image Viewer */}
                  <DetectionViewer
                    originalUrl={originalImageUrl}
                    annotatedBase64={currentDetection.annotated_image_base64}
                    detections={currentDetection.detections}
                    filename={currentDetection.filename}
                  />

                  {/* Stats Breakdown & BBox Entity List */}
                  <DetectionStats
                    summary={currentDetection.summary}
                    detections={currentDetection.detections}
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DETECTION HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">
                  Audit History & Compliance Records
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Immutable inspection logs with detected entities and violation classifications
                </p>
              </div>

              <HistoryTable
                historyData={historyData}
                currentPage={historyPage}
                onPageChange={(p) => {
                  setHistoryPage(p);
                  fetchHistory(p, historyStatusFilter);
                }}
                statusFilter={historyStatusFilter}
                onStatusFilterChange={(st) => {
                  setHistoryStatusFilter(st);
                  setHistoryPage(1);
                  fetchHistory(1, st);
                }}
                onSelectRecord={(rec) => setSelectedHistoryRecord(rec)}
                onRefresh={() => fetchHistory(historyPage, historyStatusFilter)}
                isLoading={isHistoryLoading}
              />
            </div>
          )}
        </main>
      </div>

      {/* History Record Detail Modal */}
      {selectedHistoryRecord && (
        <HistoryDetailModal
          record={selectedHistoryRecord}
          onClose={() => setSelectedHistoryRecord(null)}
        />
      )}
    </div>
  );
}
