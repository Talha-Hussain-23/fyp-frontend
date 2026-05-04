import React, { useEffect, useState } from "react";
import axios from "../../axios";
import { useConfirm } from "../../context/ConfirmContext";

/**
 * ReclaimRequestsList Component
 *
 * Displays a list of interview reclaim requests for the recruiter to review.
 * Allows approving or rejecting requests with a custom message.
 */
function ReclaimRequestsList({ showMessage }) {
  const { confirm } = useConfirm();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchRequests = React.useCallback(async () => {
    try {
      setLoading(true);
      const query = statusFilter === 'All' ? '' : `?status_filter=${statusFilter}`;
      const res = await axios.get(`/reclaim-requests/${query}`);
      setRequests(res.data.reclaim_requests || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch reclaim requests:", err);
      setError("Failed to load requests. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleApprove = async (request) => {
    const isConfirmed = await confirm(
      `Are you sure you want to approve the reclaim request for ${request.candidate_name}? This will generate a new interview link.`
    );
    if (!isConfirmed) {
      return;
    }

    // ✅ OPTIMISTIC UPDATE
    const originalRequests = [...requests];
    setRequests(prev => prev.map(r => 
      r.reclaim_id === request.reclaim_id ? { ...r, status: 'Approved' } : r
    ));

    try {
      setActionLoading(request.reclaim_id);
      const res = await axios.post(`/reclaim-requests/${request.reclaim_id}/action`, {
        action: "approve",
      });
      
      if (res.data.success) {
          if (res.data.email_sent === false) {
              const warningMsg = `Reclaim Approved, BUT Email Failed. Error: ${res.data.email_error || 'Unknown'}. Please contact candidate manually.`;
              if (showMessage) showMessage('warning', warningMsg);
              else alert(warningMsg);
          } else {
              if (showMessage) showMessage('success', 'Reclaim approved successfully! Candidate will receive an email shortly.');
          }
      }
    } catch (err) {
      setRequests(originalRequests);
      console.error("Failed to approve request:", err);
      let errorMsg = err.response?.data?.detail || err.message;
      if (typeof errorMsg !== 'string') {
        errorMsg = JSON.stringify(errorMsg);
      }
      const msg = "Failed to approve request: " + errorMsg;
      if (showMessage) showMessage('error', msg);
      else alert(msg);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (request) => {
    const isConfirmed = await confirm(
        `Are you sure you want to reject the reclaim request for ${request.candidate_name}?`
    );
    if (!isConfirmed) {
        return;
    }

    // ✅ OPTIMISTIC UPDATE
    const originalRequests = [...requests];
    setRequests(prev => prev.map(r => 
      r.reclaim_id === request.reclaim_id ? { ...r, status: 'Rejected' } : r
    ));

    try {
      setActionLoading(request.reclaim_id);
      const res = await axios.post(
        `/reclaim-requests/${request.reclaim_id}/action`,
        {
          action: "reject",
        }
      );
      
      if (res.data.success) {
          if (res.data.email_sent === false) {
              const warningMsg = `Reclaim Rejected, BUT Email Failed. Error: ${res.data.email_error || 'Unknown'}.`;
              if (showMessage) showMessage('warning', warningMsg);
              else alert(warningMsg);
          } else {
              if (showMessage) showMessage('success', 'Reclaim request rejected.');
          }
      }
    } catch (err) {
      setRequests(originalRequests);
      console.error("Failed to reject request:", err);
      let errorMsg = err.response?.data?.detail || err.message;
      if (typeof errorMsg !== 'string') {
        errorMsg = JSON.stringify(errorMsg);
      }
      const msg = "Failed to reject request: " + errorMsg;
      if (showMessage) showMessage('error', msg);
      else alert(msg);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden ring-1 ring-black/5">
      <div className="px-8 py-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center bg-gradient-to-r from-gray-50/50 to-white/50 gap-4">
        <div>
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            Interview Reclaim Requests
          </h2>
          <p className="text-sm text-gray-500 mt-1">Manage candidate interview restart requests</p>
        </div>
        
        <div className="flex items-center space-x-3 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full pl-3 pr-8 py-2 text-sm border-none focus:ring-0 bg-transparent text-gray-700 font-medium cursor-pointer"
          >
            <option value="Pending">⏳ Pending</option>
            <option value="Approved">✅ Approved</option>
            <option value="Rejected">❌ Rejected</option>
            <option value="All">📋 All Requests</option>
          </select>
          
          <div className="h-6 w-px bg-gray-200"></div>

          <button 
            onClick={handleRefresh}
            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
            title="Refresh list"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
           <div className="relative">
             <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-100 border-t-indigo-600"></div>
           </div>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-red-50 text-red-600 animate-fade-in">
          <p>{error}</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="p-16 text-center text-gray-400">
          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
            <span className="text-4xl filter grayscale opacity-50">✨</span>
          </div>
          <p className="text-lg font-medium text-gray-900">No requests found</p>
          <p className="text-sm">No reclaim requests match the current filter.</p>
        </div>
      ) : (
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Candidate</th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Interview Details</th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason & Status</th>
                <th className="px-8 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {requests.map((req) => (
                <tr key={req.reclaim_id} className="hover:bg-indigo-50/30 transition-all duration-200 group">
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-200 group-hover:scale-110 transition-transform duration-200">
                          {req.candidate_name?.charAt(0) || 'C'}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-gray-900">{req.candidate_name}</div>
                        <div className="text-xs text-gray-500">{req.candidate_email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1">
                      <div className="text-sm font-semibold text-gray-800">{req.job_title}</div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">
                          ⏱ {Math.round((req.time_spent_seconds || 0) / 60)}m spent
                        </span>
                        <span>•</span>
                        <span>{formatDate(req.requested_at)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col items-start gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getStatusBadge(req.status)} shadow-sm`}>
                        {req.status === 'Pending' && '⏳ '}
                        {req.status === 'Approved' && '✅ '}
                        {req.status === 'Rejected' && '❌ '}
                        {req.status}
                      </span>
                      <div className="text-sm text-gray-600 italic bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 w-full max-w-xs">
                        "{req.reason}"
                      </div>
                      {req.detected_reason && (
                        <div className="text-xs text-red-600 font-medium flex items-center bg-red-50 px-2 py-0.5 rounded border border-red-100">
                          <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          System Alert: {req.detected_reason}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                    {req.status === 'Pending' ? (
                      <div className="flex justify-end items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => handleReject(req)}
                          disabled={actionLoading === req.reclaim_id}
                          className="px-4 py-2 bg-white text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-lg text-xs font-bold border border-gray-200 transition-all shadow-sm active:scale-95 flex items-center gap-1"
                        >
                          {actionLoading === req.reclaim_id ? (
                            <div className="w-3 h-3 border-2 border-gray-200/30 border-t-red-600 rounded-full animate-spin" />
                          ) : '✕'}
                          <span>{actionLoading === req.reclaim_id ? 'Wait...' : 'Reject'}</span>
                        </button>
                        <button
                          onClick={() => handleApprove(req)}
                          disabled={actionLoading === req.reclaim_id}
                          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 rounded-lg text-xs font-bold shadow-md shadow-indigo-200 hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-1"
                        >
                          {actionLoading === req.reclaim_id ? (
                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : '✓'} 
                          <span>{actionLoading === req.reclaim_id ? 'Wait...' : 'Approve'}</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 font-medium px-3 py-1 rounded-full bg-gray-50">
                        Completed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ReclaimRequestsList;
