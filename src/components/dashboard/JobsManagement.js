import { useState } from 'react';
import axios from '../../axios';
import { getLocalDateString } from '../../utils/dateUtils';
import Skeleton from '../common/Skeleton';
import { BriefcaseIcon, EditIcon, PlusIcon, TrashIcon } from './DashboardIcons';

const JobsManagement = ({ jobs, loading, onJobClick, onEdit, onDelete, onCreate, showMessage }) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [reopeningJob, setReopeningJob] = useState(null);

  // Filter jobs based on status
  const filteredJobs = jobs.filter(job => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return job.status === 'open';
    if (statusFilter === 'closed') return ['closed', 'filled'].includes(job.status);
    if (statusFilter === 'draft') return job.status === 'draft';
    return true;
  });

  const counts = {
    all: jobs.length,
    active: jobs.filter(j => j.status === 'open').length,
    closed: jobs.filter(j => ['closed', 'filled'].includes(j.status)).length,
    draft: jobs.filter(j => j.status === 'draft').length
  };

  const handleReopenJob = async (jobId) => {
    try {
      setReopeningJob(jobId);
      const response = await axios.post(`/jobs/${jobId}/reopen`);
      // Update the job in the local state instead of full page reload
      if (response.data) {
        // Trigger parent component to refresh jobs list
        if (typeof onJobClick === 'function') {
           // We are abusing onJobClick a bit here to force a parent refresh if we want, 
           // but technically Dashboard should handle the state update if we had a proper callback.
           // However, for now, we'll just reload as per original code behavior or rely on props.
           // Actually original code did window.location.reload().
        }
        
        if (showMessage) showMessage('success', 'Job reopened successfully!');
         // For modularity, we might want to expose a specific onRefresh prop, but 
         // since we are refactoring, let's keep it consistent with the behavior:
         // Ideally we should call a prop like onJobUpdated().
         // For now, let's use the quick fix from the original code - reload.
         window.location.reload();
      }
    } catch (err) {
      let errorMsg = err?.response?.data?.detail || 'Failed to reopen job';
      if (typeof errorMsg !== 'string') {
          if (Array.isArray(errorMsg)) {
              errorMsg = errorMsg.map(e => e.msg || JSON.stringify(e)).join('; ');
          } else if (typeof errorMsg === 'object' && errorMsg !== null) {
              errorMsg = errorMsg.msg || JSON.stringify(errorMsg);
          } else {
              errorMsg = String(errorMsg);
          }
      }
      if (showMessage) showMessage('error', errorMsg);
    } finally {
        setReopeningJob(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'open': 'bg-green-100 text-green-800 border border-green-200',
      'closed': 'bg-gray-100 text-gray-800 border border-gray-200',
      'filled': 'bg-blue-100 text-blue-800 border border-blue-200',
      'draft': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      'paused': 'bg-orange-100 text-orange-800 border border-orange-200',
      'scheduled': 'bg-purple-100 text-purple-800 border border-purple-200'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Job Management</h2>
        <button
          onClick={onCreate}
          className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-lg transition"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Create New Job</span>
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex space-x-2 bg-white rounded-xl p-2 shadow">
        <button
          onClick={() => setStatusFilter('all')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
            statusFilter === 'all'
              ? 'bg-emerald-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          All Jobs ({counts.all})
        </button>
        <button
          onClick={() => setStatusFilter('active')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
            statusFilter === 'active'
              ? 'bg-emerald-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Active ({counts.active})
        </button>
        <button
          onClick={() => setStatusFilter('closed')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
            statusFilter === 'closed'
              ? 'bg-emerald-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Closed ({counts.closed})
        </button>
        <button
          onClick={() => setStatusFilter('draft')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
            statusFilter === 'draft'
              ? 'bg-emerald-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Drafts ({counts.draft})
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-6 border border-gray-100">
              <div className="space-y-3">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <BriefcaseIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-700 mb-2">
            {statusFilter === 'all' ? 'No jobs yet' : `No ${statusFilter} jobs`}
          </p>
          <p className="text-gray-500 mb-6">
            {statusFilter === 'all' 
              ? 'Create your first job posting to get started'
              : `You don't have any ${statusFilter} jobs at the moment`
            }
          </p>
          {statusFilter === 'all' && (
            <button
              onClick={onCreate}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition"
            >
              Create Job
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{job.title || 'Untitled Job'}</p>
                        <p className="text-sm text-gray-500 line-clamp-1">{job.snippet}</p>
                        {job.closed_reason && (
                          <p className="text-xs text-gray-400 mt-1">
                            Closed: {job.closed_reason.replace(/_/g, ' ')}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {getLocalDateString(job.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(job.status)}`}>
                        {job.status ? job.status.charAt(0).toUpperCase() + job.status.slice(1) : 'Open'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onJobClick(job)}
                          className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition"
                        >
                          View
                        </button>
                        
                        {/* Reopen button for closed jobs */}
                        {['closed', 'filled'].includes(job.status) && (
                          <button
                            onClick={() => handleReopenJob(job.id)}
                            disabled={reopeningJob === job.id}
                            className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm font-medium transition disabled:opacity-50"
                            title="Reopen this job"
                          >
                            {reopeningJob === job.id ? '...' : '🔄 Reopen'}
                          </button>
                        )}
                        
                        <button
                          onClick={() => onEdit(job)}
                          className="p-2 text-gray-600 hover:text-emerald-600 transition"
                          title="Edit job"
                        >
                          <EditIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDelete(job.id)}
                          className="p-2 text-gray-600 hover:text-red-600 transition"
                          title="Archive job"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsManagement;
