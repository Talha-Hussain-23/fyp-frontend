import { useCallback, useEffect, useState } from 'react';
import axios from '../../axios';
import { useConfirm } from '../../context/ConfirmContext';
import { getLocalDateTimeString } from '../../utils/dateUtils';

function EmailPanel() {
  const { confirm } = useConfirm();
  const [emails, setEmails] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [composeData, setComposeData] = useState({
    to_email: '',
    candidate_name: '',
    template: 'recruiter_announcement',
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);
  const [filters, setFilters] = useState({
    job_id: '',
    type: '',
    search: '',
    unread_only: false,
    page: 1,
    limit: 20
  });
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({
    total_emails: 0,
    total_notifications: 0,
    unread_count: 0
  });

  const fetchEmailsAndNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', filters.page);
      params.append('limit', filters.limit);
      if (filters.job_id) params.append('job_id', filters.job_id);
      if (filters.type) params.append('type_filter', filters.type);
      if (filters.search) params.append('search', filters.search);
      if (filters.unread_only) params.append('unread_only', 'true');

      const response = await axios.get(`/recruiter/emails-and-notifications?${params.toString()}`);
      
      if (response.data.success) {
        setEmails(response.data.emails || []);
        setNotifications(response.data.notifications || []);
        setJobs(response.data.jobs || []);
        setStats({
          total_emails: response.data.total_emails || 0,
          total_notifications: response.data.total_notifications || 0,
          unread_count: response.data.unread_count || 0
        });
      }
    } catch (err) {
      console.error('Failed to fetch emails and notifications:', err);
      setEmails([]);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchEmailsAndNotifications();
  }, [fetchEmailsAndNotifications]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.put(`/notifications/${notificationId}/read`);
      // Refresh the list
      fetchEmailsAndNotifications();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      alert('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.put('/notifications/mark-all-read');
      fetchEmailsAndNotifications();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      alert('Failed to mark all notifications as read');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    const isConfirmed = await confirm('Are you sure you want to delete this notification?');
    if (!isConfirmed) {
      return;
    }
    
    try {
      await axios.delete(`/notifications/${notificationId}`);
      fetchEmailsAndNotifications();
    } catch (err) {
      console.error('Failed to delete notification:', err);
      alert('Failed to delete notification');
    }
  };

  const handleSendEmail = async () => {
    if (!composeData.to_email || !composeData.candidate_name || !composeData.message) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSending(true);
      const variables = {
        candidateName: composeData.candidate_name,
        customMessage: composeData.message,
        subject: composeData.subject || 'Message from Smart Recruiter AI'
      };

      const response = await axios.post('/email/send', {
        to_email: composeData.to_email,
        candidate_name: composeData.candidate_name,
        template: composeData.template,
        subject: composeData.subject || 'Message from Smart Recruiter AI',
        variables: variables
      });

      if (response.data.success) {
        alert('Email sent successfully!');
        setShowCompose(false);
        setComposeData({
          to_email: '',
          candidate_name: '',
          template: 'recruiter_announcement',
          subject: '',
          message: ''
        });
        fetchEmailsAndNotifications();
      }
    } catch (err) {
      let errorMsg = err?.response?.data?.detail || 'Failed to send email';
      if (typeof errorMsg !== 'string') {
          if (Array.isArray(errorMsg)) {
              errorMsg = errorMsg.map(e => e.msg || JSON.stringify(e)).join('; ');
          } else if (typeof errorMsg === 'object' && errorMsg !== null) {
              errorMsg = errorMsg.msg || JSON.stringify(errorMsg);
          } else {
              errorMsg = String(errorMsg);
          }
      }
      alert(errorMsg);
      console.error('Email send error:', err);
    } finally {
      setSending(false);
    }
  };

  const templates = [
    { value: 'recruiter_announcement', label: 'Recruiter Announcement' },
    { value: 'application_submitted', label: 'Application Submitted' },
    { value: 'interview_invite', label: 'Interview Invitation' },
    { value: 'interview_reminder', label: 'Interview Reminder' },
    { value: 'result_selected', label: 'Result: Selected' },
    { value: 'result_rejected', label: 'Result: Rejected' },
    { value: 'cheating_warning', label: 'Cheating Warning' },
    { value: 'cheating_disqualification', label: 'Cheating Disqualification' }
  ];

  const combinedItems = [
    ...emails.map(email => ({ ...email, itemType: 'email' })),
    ...notifications.map(notif => ({ ...notif, itemType: 'notification' }))
  ].sort((a, b) => {
    const dateA = new Date(a.created_at || a.sentAt || 0);
    const dateB = new Date(b.created_at || b.sentAt || 0);
    return dateB - dateA;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email & Notifications</h2>
          <p className="text-sm text-gray-600 mt-1">
            View emails and notifications for your jobs only
          </p>
        </div>
        <button
          onClick={() => setShowCompose(!showCompose)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition"
        >
          {showCompose ? 'Cancel' : '+ Compose Email'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-600">{stats.total_emails}</div>
          <div className="text-sm text-gray-600 mt-2">Total Emails</div>
        </div>
        <div className="bg-blue-50 rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-blue-600">{stats.total_notifications}</div>
          <div className="text-sm text-gray-600 mt-2">Total Notifications</div>
        </div>
        <div className="bg-orange-50 rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-orange-600">{stats.unread_count}</div>
          <div className="text-sm text-gray-600 mt-2">Unread Notifications</div>
        </div>
        <div className="bg-purple-50 rounded-xl shadow-lg p-6 text-center">
          <div className="text-2xl font-bold text-purple-600">{jobs.length}</div>
          <div className="text-sm text-gray-600 mt-2">Your Jobs</div>
        </div>
      </div>

      {/* Compose Email Modal */}
      {showCompose && (
        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
          <h3 className="text-xl font-bold text-gray-900">Compose Email</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Email *</label>
              <input
                type="email"
                value={composeData.to_email}
                onChange={(e) => setComposeData({ ...composeData, to_email: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="candidate@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Candidate Name *</label>
              <input
                type="text"
                value={composeData.candidate_name}
                onChange={(e) => setComposeData({ ...composeData, candidate_name: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="John Doe"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Template</label>
            <select
              value={composeData.template}
              onChange={(e) => setComposeData({ ...composeData, template: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {templates.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <input
              type="text"
              value={composeData.subject}
              onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Email subject"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
            <textarea
              value={composeData.message}
              onChange={(e) => setComposeData({ ...composeData, message: e.target.value })}
              rows={6}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Enter your message here..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowCompose(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSendEmail}
              disabled={sending}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                sending
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {sending ? 'Sending...' : 'Send Email'}
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Job</label>
            <select
              value={filters.job_id}
              onChange={(e) => setFilters({ ...filters, job_id: e.target.value, page: 1 })}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">All Jobs</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">All Types</option>
              <option value="application">Application</option>
              <option value="interview">Interview</option>
              <option value="evaluation">Evaluation</option>
              <option value="system">System</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Search by candidate or subject..."
            />
          </div>
          <div className="flex items-end gap-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.unread_only}
                onChange={(e) => setFilters({ ...filters, unread_only: e.target.checked, page: 1 })}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <span className="text-sm text-gray-700">Unread Only</span>
            </label>
            {stats.unread_count > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition text-sm"
              >
                Mark All Read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Combined Emails and Notifications List */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Job</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Subject/Title</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Message/To</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Loading emails and notifications...
                  </td>
                </tr>
              ) : combinedItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No emails or notifications found
                  </td>
                </tr>
              ) : (
                combinedItems.map((item) => (
                  <tr key={`${item.itemType}-${item.id}`} className={`hover:bg-gray-50 ${!item.is_read && !item.read_status ? 'bg-blue-50' : ''}`}>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.itemType === 'email' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.itemType === 'email' ? 'Email' : 'Notification'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {item.job_title || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.subject || item.title || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {item.itemType === 'email' ? item.to : (item.message || 'N/A')}
                      {item.candidate_name && (
                        <div className="text-xs text-gray-500 mt-1">{item.candidate_name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {item.itemType === 'email' ? (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          item.status === 'sent'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.status || 'N/A'}
                        </span>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          item.is_read || item.read_status
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {item.is_read || item.read_status ? 'Read' : 'Unread'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.created_at || item.sentAt 
                        ? getLocalDateTimeString(item.created_at || item.sentAt)
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      {item.itemType === 'notification' && !item.is_read && !item.read_status && (
                        <button
                          onClick={() => handleMarkAsRead(item.id)}
                          className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs font-medium transition mr-2"
                        >
                          Mark Read
                        </button>
                      )}
                      {item.itemType === 'notification' && (
                        <button
                          onClick={() => handleDeleteNotification(item.id)}
                          className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs font-medium transition"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {(stats.total_emails + stats.total_notifications) > filters.limit && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <button
              onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
              disabled={filters.page === 1}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {filters.page} - Showing {combinedItems.length} items
            </span>
            <button
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              disabled={combinedItems.length < filters.limit}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmailPanel;
