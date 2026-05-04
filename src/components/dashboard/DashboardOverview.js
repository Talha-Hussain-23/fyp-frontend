import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import { BriefcaseIcon, UsersIcon } from './DashboardIcons';
import KPICard from './KPICard';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);



const DashboardOverview = ({ kpis, pipelineData, applicationTrendData }) => {
  return (
    <div className="space-y-6">
      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Jobs"
          value={kpis?.kpis?.total_jobs || 0}
          subtitle={`${kpis?.kpis?.active_jobs || 0} Active`}
          icon={<BriefcaseIcon className="h-8 w-8" />}
          color="blue"
        />
        <KPICard
          title="Total Applications"
          value={kpis?.kpis?.total_applications || 0}
          subtitle={`${kpis?.kpis?.avg_applications_per_job || 0} per job`}
          icon={<UsersIcon className="h-8 w-8" />}
          color="purple"
        />
        <KPICard
          title="Candidates Interviewed"
          value={kpis?.kpis?.total_candidates_interviewed || 0}
          subtitle={`${kpis?.kpis?.interview_rate || 0}% of applicants`}
          icon={<UsersIcon className="h-8 w-8" />}
          color="green"
        />
        <KPICard
          title="Total Hired"
          value={kpis?.kpis?.total_hired || 0}
          subtitle={`${kpis?.kpis?.hire_rate || 0}% success rate`}
          icon={<UsersIcon className="h-8 w-8" />}
          color="emerald"
        />
      </div>

      {/* Job Status Breakdown */}
      {kpis?.job_breakdown && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">Active Jobs</p>
                <p className="text-4xl font-bold mt-2">{kpis.job_breakdown.active || 0}</p>
                <p className="text-xs mt-1 opacity-75">Currently accepting applications</p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <BriefcaseIcon className="h-8 w-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">Closed Jobs</p>
                <p className="text-4xl font-bold mt-2">{kpis.job_breakdown.closed || 0}</p>
                <p className="text-xs mt-1 opacity-75">Completed hiring process</p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">Draft Jobs</p>
                <p className="text-4xl font-bold mt-2">{kpis.job_breakdown.draft || 0}</p>
                <p className="text-xs mt-1 opacity-75">Pending publication</p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Row - First Two Charts Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Candidate Pipeline - Doughnut Chart */}
        <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Candidate Pipeline</h3>
            <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">
              {pipelineData && pipelineData.datasets[0].data.length > 0 ? 
                `${pipelineData.datasets[0].data.reduce((a, b) => a + b, 0)} Total` : 
                'No Data'
              }
            </div>
          </div>
          {pipelineData && pipelineData.datasets[0].data.length > 0 ? (
            <div className="h-80 flex items-center justify-center">
              <div className="w-full max-w-md">
                <Doughnut
                  data={pipelineData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    aspectRatio: 1.3,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          padding: 15,
                          font: {
                            size: 12,
                            weight: '600',
                            family: "'Inter', 'Segoe UI', sans-serif"
                          },
                          usePointStyle: true,
                          pointStyle: 'circle',
                          boxWidth: 8,
                          boxHeight: 8
                        }
                      },
                      tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        padding: 14,
                        titleFont: { size: 15, weight: 'bold', family: "'Inter', 'Segoe UI', sans-serif" },
                        bodyFont: { size: 14, family: "'Inter', 'Segoe UI', sans-serif" },
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                          label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return ` ${label}: ${value} candidates (${percentage}%)`;
                          }
                        }
                      }
                    },
                    cutout: '65%',
                    animation: { animateRotate: true, animateScale: true, duration: 1000, easing: 'easeInOutQuart' }
                  }}
                />
              </div>
            </div>
          ) : (
             <div className="h-80 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
              <div className="text-center p-8">
                <div className="bg-white rounded-full p-4 inline-block mb-4 shadow-md">
                  <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-gray-600 font-semibold mb-1">No Candidate Data</p>
                <p className="text-sm text-gray-500">Applications will appear here once received</p>
              </div>
            </div>
          )}
        </div>

        {/* Weekly Application Trends - Line Chart */}
        <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Weekly Application Trends</h3>
            <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
              Last 7 Days
            </div>
          </div>
          {applicationTrendData && applicationTrendData.datasets[0].data.length > 0 ? (
            <div className="h-80">
              <Line
                data={applicationTrendData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  interaction: { mode: 'index', intersect: false },
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      enabled: true,
                      backgroundColor: 'rgba(0, 0, 0, 0.9)',
                      padding: 14,
                      titleFont: { size: 15, weight: 'bold', family: "'Inter', 'Segoe UI', sans-serif" },
                      bodyFont: { size: 14, family: "'Inter', 'Segoe UI', sans-serif" },
                      borderColor: 'rgba(59, 130, 246, 0.3)',
                      borderWidth: 2,
                      cornerRadius: 8,
                      displayColors: true,
                      callbacks: {
                        label: function(context) {
                          return ` Applications: ${context.parsed.y}`;
                        }
                      }
                    }
                  },
                  scales: {
                    y: { 
                      beginAtZero: true,
                      ticks: { precision: 0, font: { size: 12, weight: '500' }, color: '#6b7280' },
                      grid: { color: 'rgba(0, 0, 0, 0.05)', drawBorder: false },
                      border: { display: false }
                    },
                    x: {
                      ticks: { font: { size: 12, weight: '500' }, color: '#6b7280' },
                      grid: { display: false, drawBorder: false },
                      border: { display: false }
                    }
                  },
                  animation: { duration: 1000, easing: 'easeInOutQuart' }
                }}
              />
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
              <div className="text-center p-8">
                <div className="bg-white rounded-full p-4 inline-block mb-4 shadow-md">
                  <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <p className="text-gray-600 font-semibold mb-1">No Trend Data</p>
                <p className="text-sm text-gray-500">Application trends will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>


    </div>
  );
};

export default DashboardOverview;
