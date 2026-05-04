/**
 * Analytics Component
 * Displays comprehensive analytics for recruiters
 */
import { useEffect, useState } from 'react';
import axios from '../../axios';
import './Analytics.css';

function Analytics({ recruiterId }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, [recruiterId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/analytics/recruiter/${recruiterId}`);
      setAnalytics(response.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="analytics-loading">Loading analytics...</div>;
  }

  if (error) {
    return <div className="analytics-error">{error}</div>;
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="analytics-container">
      <h2>📊 Analytics Dashboard</h2>

      {/* Summary Cards */}
      <div className="analytics-cards">
        <div className="analytics-card">
          <div className="card-icon">📝</div>
          <div className="card-content">
            <h3>{analytics.total_interviews}</h3>
            <p>Total Interviews</p>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-icon">✅</div>
          <div className="card-content">
            <h3>{analytics.completed_interviews}</h3>
            <p>Completed</p>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-icon">⭐</div>
          <div className="card-content">
            <h3>{analytics.avg_score}/10</h3>
            <p>Average Score</p>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-icon">📈</div>
          <div className="card-content">
            <h3>{analytics.completion_rate}%</h3>
            <p>Completion Rate</p>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-icon">🎯</div>
          <div className="card-content">
            <h3>{analytics.pass_rate}%</h3>
            <p>Pass Rate (≥6.0)</p>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-icon">⚠️</div>
          <div className="card-content">
            <h3>{analytics.total_violations}</h3>
            <p>Total Violations</p>
          </div>
        </div>
      </div>

      {/* Score Distribution */}
      <div className="analytics-section">
        <h3>Score Distribution</h3>
        <div className="score-distribution">
          {Object.entries(analytics.score_distribution).map(([range, count]) => (
            <div key={range} className="score-bar">
              <div className="score-label">{range}</div>
              <div className="score-bar-container">
                <div 
                  className="score-bar-fill" 
                  style={{ 
                    width: `${(count / analytics.total_interviews) * 100}%`,
                    backgroundColor: getScoreColor(range)
                  }}
                >
                  {count}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Interviews */}
      <div className="analytics-section">
        <h3>Recent Interviews</h3>
        <div className="recent-interviews">
          <table>
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Status</th>
                <th>Score</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {analytics.recent_interviews.map((interview) => (
                <tr key={interview.interview_id}>
                  <td>{interview.candidate_name}</td>
                  <td>
                    <span className={`status-badge ${interview.status}`}>
                      {interview.status}
                    </span>
                  </td>
                  <td>
                    {interview.final_score !== null ? (
                      <span className="score-value">{interview.final_score}/10</span>
                    ) : (
                      <span className="score-pending">-</span>
                    )}
                  </td>
                  <td>{new Date(interview.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Trend */}
      {analytics.monthly_trend && analytics.monthly_trend.length > 0 && (
        <div className="analytics-section">
          <h3>Monthly Trend</h3>
          <div className="monthly-trend">
            {analytics.monthly_trend.map((month) => (
              <div key={month.month} className="trend-item">
                <div className="trend-month">{month.month}</div>
                <div className="trend-count">{month.count} interviews</div>
                <div className="trend-score">Avg: {month.avg_score.toFixed(1)}/10</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getScoreColor(range) {
  const colors = {
    '0-2': '#ff4444',
    '2-4': '#ff8800',
    '4-6': '#ffbb33',
    '6-8': '#00C851',
    '8-10': '#007E33'
  };
  return colors[range] || '#ccc';
}

export default Analytics;
