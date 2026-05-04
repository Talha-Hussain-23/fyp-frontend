import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// New Modular Components
import NotificationCenter from '../common/NotificationCenter';
import BottomNav from './BottomNav';
import CandidatesManagement from './CandidatesManagement';
import DashboardOverview from './DashboardOverview';
import JobModal from './JobModal';
import JobsManagement from './JobsManagement';
import Sidebar from './Sidebar';

// Existing Components
import EmailPanel from '../recruiter/EmailPanel';
import ReclaimRequestsList from '../recruiter/ReclaimRequestsList';

// Custom Hooks
import { toast } from 'sonner';
import axios from '../../axios';
import { useCandidates } from '../../hooks/dashboard/useCandidates';
import { useDashboardData } from '../../hooks/dashboard/useDashboardData';
import { useJobs } from '../../hooks/dashboard/useJobs';
import { toDateTimeLocal } from '../../utils/dateUtils';

function Dashboard({ onLogout }) {
  const [activeView, setActiveView] = useState('overview'); // overview, jobs, candidates, emails, reclaims
  const [selectedJob, setSelectedJob] = useState(null);
  
  // Job Form State
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    num_vacancies: 1,
    num_questions: 5,
    question_type: 'Descriptive',
    question_types: ['Descriptive'],
    difficulty_level: 'Moderate',
    apply_deadline: '',
    max_shortlist: 10,
    ai_instructions: '',
    invite_rule: 'Top 10',
    invite_rule_n: null,
    status: 'open',
    start_date: ''
  });

  const navigate = useNavigate();

  // Helper for messages - NOW USES TOAST
  const showMessage = useCallback((type, text) => {
    if (type === 'success') {
      toast.success(text);
    } else if (type === 'error') {
      toast.error(text);
    } else {
      toast.info(text);
    }
  }, []);

  // -- HOOKS --
  // 1. Dashboard Data (KPIs, Trends)
  const { kpis, trends, fetchKPIs } = useDashboardData();

  // 2. Jobs Logic
  const { 
    myJobs, 
    loading: loadingJobs, 
    submittingJob,
    fetchMyJobs, 
    createJob, 
    updateJob, 
    deleteJob 
  } = useJobs(fetchKPIs, showMessage);

  // 3. Candidates Logic
  const { 
    candidates, 
    loadingCandidates, 
    fetchCandidates, 
    updateCandidateStatus 
  } = useCandidates(fetchKPIs, showMessage);

  // -- EFFECTS --
  useEffect(() => {
    fetchKPIs();
    fetchMyJobs();
  }, [fetchKPIs, fetchMyJobs]);

  useEffect(() => {
    if (activeView === 'candidates') {
      fetchCandidates(selectedJob?.id || null);
    }
  }, [selectedJob, activeView, fetchCandidates]);

  // -- HANDLERS --
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('token');
      navigate('/');
    }
  };

  const openJobModal = async (job = null) => {
     if (job) {
      // Fetch full job details if editing
      try {
        const response = await axios.get(`/jobs/${job.id}`);
        const fullJob = response.data.job || job;
        
        setEditingJob(fullJob);
        setJobForm({
          title: fullJob.title || '',
          description: fullJob.description || '',
          num_vacancies: fullJob.num_vacancies || 1,
          num_questions: fullJob.num_questions || 5,
          question_type: fullJob.question_type || 'Descriptive',
          question_types: fullJob.question_types || (fullJob.question_type ? [fullJob.question_type] : ['Descriptive']),
          difficulty_level: fullJob.difficulty_level || fullJob.difficulty || 'Moderate',
          apply_deadline: toDateTimeLocal(fullJob.apply_deadline),
          max_shortlist: fullJob.max_shortlist || 10,
          ai_instructions: fullJob.ai_instructions || '',
          invite_rule: fullJob.invite_rule || 'Top 10',
          invite_rule_n: fullJob.invite_rule_n || null,
          status: fullJob.status || 'open',
          start_date: toDateTimeLocal(fullJob.start_date)
        });
      } catch (err) {
        console.error('Failed to fetch full job details:', err);
        setEditingJob(job);
        // Fallback...
         setJobForm({
          title: job.title || '',
          description: job.description || '',
          num_vacancies: job.num_vacancies || 1,
          num_questions: job.num_questions || 5,
          question_type: job.question_type || 'Descriptive',
          question_types: job.question_types || (job.question_type ? [job.question_type] : ['Descriptive']),
          difficulty_level: job.difficulty_level || job.difficulty || 'Moderate',
          apply_deadline: toDateTimeLocal(job.apply_deadline),
          max_shortlist: job.max_shortlist || 10,
          ai_instructions: job.ai_instructions || '',
          invite_rule: job.invite_rule || 'Top 10',
          invite_rule_n: job.invite_rule_n || null,
          status: job.status || 'open',
          start_date: toDateTimeLocal(job.start_date)
        });
      }
    } else {
      setEditingJob(null);
      resetJobForm();
    }
    setShowJobModal(true);
  };

  const resetJobForm = () => {
    setJobForm({
      title: '',
      description: '',
      num_vacancies: 1,
      num_questions: 5,
      question_type: 'Descriptive',
      question_types: ['Descriptive'],
      difficulty_level: 'Moderate',
      apply_deadline: '',
      max_shortlist: 10,
      ai_instructions: '',
      invite_rule: 'Top 10',
      invite_rule_n: null,
      status: 'open',
      start_date: ''
    });
  };

  const handleSaveJob = async (jobData) => {
    // CRITICAL FIX: Use jobData from JobModal (includes interview_config & question_types)
    // Previously this ignored the argument and read from jobForm state, which had NO interview_config
    const formData = jobData || jobForm;
    
    if (!formData.title || !formData.description || formData.description.length < 50) {
      showMessage('error', 'Please fill in all required fields. Description must be at least 50 characters.');
      return;
    }

    const callbacks = () => {
        setShowJobModal(false);
        resetJobForm();
        if (editingJob) setEditingJob(null);
    };

    if (editingJob) {
        await updateJob(editingJob.id, formData, callbacks);
    } else {
        await createJob(formData, callbacks);
    }
  };

  // Chart Data Preparation (moved logic here or keep in Overview? Keep in Overview logic if possible, but data is computed here)
  // Actually, Overview component expects `pipelineData` and `applicationTrendData` objects.
  // We should construct them here or pass raw `trends` and `kpis` to Overview and let it construct.
  // For cleaner separation, let's construct here as per original, or refactor Overview to take raw data.
  // The original Dashboard constructed them inline. I'll construct them here to match the prop signature I created for DashboardOverview.

  const pipelineData = kpis?.chart_data ? {
    labels: kpis.chart_data.labels || [],
    datasets: [{
      label: 'Candidates',
      data: kpis.chart_data.values || [],
      backgroundColor: (kpis.chart_data.labels || []).map(label => getStatusColor(label).bg),
      borderColor: (kpis.chart_data.labels || []).map(label => getStatusColor(label).border),
      borderWidth: 2,
      hoverOffset: 10
    }]
  } : null;

  const applicationTrendData = trends ? {
    labels: trends.trends.map(t => new Date(t.date).toLocaleDateString('en-US', { weekday: 'short' })),
    datasets: [{
      label: 'Applications',
      data: trends.trends.map(t => t.applications),
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: 'rgb(59, 130, 246)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6
    }]
  } : null;

  return (
    <div className="min-h-screen bg-[#f4f7f9] flex">
      <Sidebar 
        activeView={activeView} 
        onNavigate={(view) => {
            setActiveView(view);
            if (view === 'candidates' && !selectedJob) {
                // keep selectedJob null (All Jobs)
            }
        }} 
        onLogout={handleLogout} 
      />

      <div className="flex-1 flex flex-col overflow-hidden pb-[var(--nav-height-mobile)] lg:pb-0">
        {/* Top Bar */}
        <div className="bg-white shadow-sm px-4 lg:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 capitalize">{activeView}</h2>
          <div className="flex items-center space-x-2 lg:space-x-4">
            <NotificationCenter />
            <span className="text-gray-600 hidden sm:inline text-sm lg:text-base">Welcome back!</span>
          </div>
        </div>

        {/* Message Alert - Handled by Sonner Toast now */}

        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {activeView === 'reclaims' && (
            <ReclaimRequestsList showMessage={showMessage} />
          )}

          {activeView === 'overview' && (
            <DashboardOverview 
                kpis={kpis} 
                pipelineData={pipelineData} 
                applicationTrendData={applicationTrendData} 
            />
          )}

          {activeView === 'jobs' && (
            <JobsManagement
              jobs={myJobs}
              loading={loadingJobs}
              onJobClick={(job) => {
                setSelectedJob(job);
                setActiveView('candidates');
              }}
              onEdit={openJobModal}
              onDelete={deleteJob}
              onCreate={() => openJobModal()}
              showMessage={showMessage}
            />
          )}

          {activeView === 'candidates' && (
            <CandidatesManagement
              jobs={myJobs}
              selectedJob={selectedJob}
              candidates={candidates}
              loading={loadingCandidates}
              onJobSelect={setSelectedJob}
              onStatusUpdate={updateCandidateStatus}
              onRefresh={async () => {
                 fetchCandidates(selectedJob?.id || null);
              }}
              showMessage={showMessage}
            />
          )}

          {activeView === 'emails' && (
            <div className="space-y-6">
              <EmailPanel />
            </div>
          )}
        </div>
      </div>

      <BottomNav 
        activeView={activeView} 
        onNavigate={(view) => {
          setActiveView(view);
        }} 
        onLogout={handleLogout} 
      />

      {showJobModal && (
        <JobModal
          job={editingJob}
          form={jobForm}
          onFormChange={setJobForm}
          onSave={handleSaveJob}
          onClose={() => {
            setShowJobModal(false);
            setEditingJob(null);
            resetJobForm();
          }}
          submittingJob={submittingJob}
        />
      )}
    </div>
  );
}

// Helper needed for getStatusColor in main component? 
// Original code used it for Chart data construction.
const getStatusColor = (status) => {
  const colorMap = {
    'New': { bg: 'rgba(59, 130, 246, 0.9)', border: 'rgba(59, 130, 246, 1)' },
    'Under Review': { bg: 'rgba(234, 179, 8, 0.9)', border: 'rgba(234, 179, 8, 1)' },
    'Review': { bg: 'rgba(234, 179, 8, 0.9)', border: 'rgba(234, 179, 8, 1)' },
    'Interview': { bg: 'rgba(139, 92, 246, 0.9)', border: 'rgba(139, 92, 246, 1)' },
    'Rejected': { bg: 'rgba(239, 68, 68, 0.9)', border: 'rgba(239, 68, 68, 1)' },
    'Hired': { bg: 'rgba(34, 197, 94, 0.9)', border: 'rgba(34, 197, 94, 1)' }
  };
  return colorMap[status] || { bg: 'rgba(107, 114, 128, 0.9)', border: 'rgba(107, 114, 128, 1)' };
};

export default Dashboard;
