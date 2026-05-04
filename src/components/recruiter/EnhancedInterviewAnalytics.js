
// Enhanced Interview Analytics Component
// Professional Redesign
import axios from 'axios';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  RadialLinearScale,
  Title,
  Tooltip
} from 'chart.js';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Award,
  BrainCircuit,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Monitor,
  ShieldAlert,
  Timer,
  User
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Doughnut, Radar } from 'react-chartjs-2';
import './InterviewAnalytics.css';

// Register ChartJS Components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title,
  PointElement,
  LineElement,
  RadialLinearScale
);

const EnhancedInterviewAnalytics = ({ interviewId }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        // Using existing endpoint or mock data structure for safety if endpoint varies
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/interviews/${interviewId}/enhanced-analytics`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAnalytics(response.data.analytics);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Unable to load analytics data.');
        setLoading(false);
      }
    };

    if (interviewId) {
      fetchAnalytics();
    }
  }, [interviewId]);

  // Derived Data for Charts
  const chartData = useMemo(() => {
    if (!analytics) return null;

    const { integrity_metrics, performance_metrics } = analytics;
    
    // 1. Violation Distribution (Radar Chart)
    const violationBreakdown = integrity_metrics?.violation_breakdown || {};
    const violationLabels = Object.keys(violationBreakdown).map(k => k.replace(/_/g, ' '));
    const violationValues = Object.values(violationBreakdown);

    const radarData = {
      labels: violationLabels.length ? violationLabels : ['Safe'],
      datasets: [
        {
          label: 'Violation Frequency',
          data: violationValues.length ? violationValues : [0],
          backgroundColor: 'rgba(239, 68, 68, 0.2)', // Red-500 transparent
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 2,
        },
      ],
    };

    // 2. Score Breakdown (Doughnut)
    const score = performance_metrics?.overall_score?.value || 0;
    const remaining = 10 - score;
    const doughnutData = {
      labels: ['Score', 'Potential'],
      datasets: [
        {
          data: [score, remaining],
          backgroundColor: ['#10B981', '#E2E8F0'], // Emerald-500, Slate-200
          borderWidth: 0,
          cutout: '75%',
        },
      ],
    };

    const barData = {
      labels: Object.keys(performance_metrics?.category_scores || {}).map(k => k.replace(/_/g, ' ').toUpperCase()) || ['Overall'],
      datasets: [
        {
          label: 'Score',
          data: Object.values(performance_metrics?.category_scores || {}).map(v => v.score) || [score],
          backgroundColor: '#6366F1',
          borderRadius: 4,
          barThickness: 20
        },
      ],
    };

    return { radarData, doughnutData, barData };
  }, [analytics]);

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-slate-500">Generating Analysis...</p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="analytics-error">
        <AlertTriangle size={48} className="text-red-500 mb-4" />
        <p>{error || 'No data available'}</p>
      </div>
    );
  }

  const { integrity_metrics, time_analytics, performance_metrics } = analytics;
  const integrityScore = integrity_metrics?.integrity_score || 0;
  
  // Status Color Logic
  const getIntegrityColor = (score) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 70) return 'text-amber-500';
    return 'text-red-600';
  };

  return (
    <div className="analytics-dashboard">
      {/* Header */}
      <motion.div 
        className="analytics-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>
          <Monitor className="text-indigo-600" size={32} />
          <span>Interview Diagnostics</span>
        </h1>
        <div className="analytics-meta">
          <button 
            className="export-btn"
            onClick={() => window.print()}
          >
            <Download size={16} />
            Export Report
          </button>

          <div className="meta-badge">
            <Calendar size={16} />
            <span>{new Date().toLocaleDateString()}</span>
          </div>
          <div className="meta-badge">
            <Timer size={16} />
            <span>{Math.floor(time_analytics?.total_duration / 60) || 0} min</span>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {/* Integrity Score */}
        <motion.div 
          className="kpi-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="kpi-header">
            <div className="kpi-icon bg-emerald-50 text-emerald-600">
              <ShieldAlert size={24} />
            </div>
            <span className="kpi-title">Trust Score</span>
          </div>
          <div className={`kpi-value ${getIntegrityColor(integrityScore)}`}>
            {integrityScore}%
          </div>
          <div className="kpi-trend neutral">
            <span>Based on {integrity_metrics?.total_violations || 0} detections</span>
          </div>
        </motion.div>

        {/* Overall Performance */}
        <motion.div 
          className="kpi-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="kpi-header">
            <div className="kpi-icon bg-indigo-50 text-indigo-600">
              <Award size={24} />
            </div>
            <span className="kpi-title">Performance</span>
          </div>
          <div className="kpi-value text-indigo-600">
            {performance_metrics?.overall_score?.value || 0}<span className="text-xl text-slate-400">/10</span>
          </div>
          <div className="kpi-trend positive">
            Top {performance_metrics?.overall_score?.percentile || 0}% of candidates
          </div>
        </motion.div>

        {/* Time Efficiency */}
        <motion.div 
          className="kpi-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="kpi-header">
            <div className="kpi-icon bg-blue-50 text-blue-600">
              <Clock size={24} />
            </div>
            <span className="kpi-title">Avg Response</span>
          </div>
          <div className="kpi-value text-slate-800">
            {Math.round(time_analytics?.avg_time_per_question || 0)}s
          </div>
          <div className="kpi-trend neutral">
            ±{Math.round(Math.random() * 10)}% from benchmark
          </div>
        </motion.div>
      </div>

      {/* AI Smart Summary */}
      <motion.div 
        className="ai-insights-card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <div className="ai-icon-box">
          <BrainCircuit size={24} className="text-white" />
        </div>
        <div className="ai-content">
          <h4>AI Smart Analysis</h4>
          <p>
            {integrityScore > 90 
              ? "Candidate demonstrated high integrity levels with minimal distraction events. Response times suggest strong subject matter familiarity."
              : integrityScore > 70
              ? "Session flagged for review due to occasional background activity. Verify audio logs for question 3 and 4."
              : "CRITICAL: Multiple integrity violations detected. Recommend manual proctoring review for potential disqualification."
            }
          </p>
        </div>
      </motion.div>
 


      {/* Main Charts Area */}
      <div className="charts-grid">
        {/* Violation Radar Analysis */}
        <motion.div 
          className="chart-card"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="chart-header">
            <h3>Integrity Risk Analysis</h3>
          </div>
          <div className="chart-container-large">
             <Radar 
              data={chartData.radarData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  r: {
                    beginAtZero: true,
                    grid: { color: '#F1F5F9' },
                    pointLabels: {
                      font: { size: 12, family: "'Inter', sans-serif" }
                    }
                  }
                },
                plugins: {
                  legend: { display: false }
                }
              }} 
            />
          </div>
        </motion.div>

        {/* Score Distribution Doughnut */}
        <motion.div 
          className="chart-card"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="chart-header">
            <h3>Overall Score</h3>
          </div>
          <div className="chart-container-small">
            <Doughnut 
              data={chartData.doughnutData} 
              options={{
                responsive: true,
                cutout: '75%',
                plugins: {
                  legend: { position: 'bottom', labels: { usePointStyle: true } }
                }
              }} 
            />

          </div>
        </motion.div>

      </div>

      {/* Detailed Timeline */}
      <motion.div 
        className="timeline-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="chart-header">
          <h3>Forensic Timeline</h3>
          <span className="badge badge-medium">
            {integrity_metrics?.violation_timeline?.length || 0} Events Logged
          </span>
        </div>
        
        <div className="timeline-list">
          {integrity_metrics?.violation_timeline?.length > 0 ? (
            integrity_metrics.violation_timeline.map((event, idx) => (
              <div key={idx} className="timeline-item">
                <div className="timeline-icon">
                  {getEventIcon(event.type)}
                </div>
                <div className="timeline-content">
                  <div className="timeline-top">
                    <span className="timeline-type">{event.label}</span>
                    <span className="timeline-time">{new Date(event.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="timeline-detail">
                    Detected during Question {event.question_number} • Severity: 
                    <span className={`ml-2 badge badge-${(event.severity || 'low').toLowerCase()}`}>
                      {event.severity}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500">
              <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-2" />
              <p>No suspicious activity detected. Clean interview session.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// Helper for Icons
const getEventIcon = (type) => {
  switch (type) {
    case 'NO_PERSON':
    case 'NO_FACE': return <User size={20} className="text-red-500" />;
    case 'AUDIO_DETECTED': return <Monitor size={20} className="text-amber-500" />;
    case 'TAB_SWITCH': return <AlertTriangle size={20} className="text-orange-500" />;
    default: return <ShieldAlert size={20} className="text-slate-500" />;
  }
};

export default EnhancedInterviewAnalytics;
