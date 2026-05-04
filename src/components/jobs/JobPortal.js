import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../axios";
import { getLocalDateString, getLocalDateTimeString } from "../../utils/dateUtils";
import AdvancedSearchFilters from "./AdvancedSearchFilters";
import ApplyModal from "./ApplyModal";
import JobDetailModal from "./JobDetailModal";
import { AlertCircle, BriefcaseIcon, CheckCircle, XIcon } from "./JobPortalIcons";

function JobPortal() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applicationData, setApplicationData] = useState({
    name: "",
    email: "",
    file: null,
    fileName: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });
  const [activeTab, setActiveTab] = useState("browse");
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [applicationStatuses, setApplicationStatuses] = useState({});
  const { jobId } = useParams();

  // Load applied jobs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("appliedJobs");
    if (saved) {
      try {
        setAppliedJobs(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load applied jobs:", e);
      }
    }
  }, []);

  const showAlertMsg = useCallback((type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: "", message: "" }), 5000);
  }, []);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/public/jobs", { params: { status_filter: "open" } });
      const jobsList = res.data.items || [];
      setJobs(jobsList);
      setFilteredJobs(jobsList);
    } catch (e) {
      showAlertMsg("error", "Failed to load jobs. Please try again later.");
      console.error("Failed to load jobs:", e);
    } finally {
      setLoading(false);
    }
  }, [showAlertMsg]);

  const fetchJobDetails = useCallback(async (id) => {
    try {
      const res = await axios.get(`/public/jobs/${id}`);
      setSelectedJob(res.data);
      setShowJobModal(true);
    } catch (e) {
      showAlertMsg("error", "Failed to load job details.");
      console.error("Failed to load job details:", e);
    }
  }, [showAlertMsg]);

  useEffect(() => {
    fetchJobs();
    if (jobId) fetchJobDetails(jobId);
  }, [jobId, fetchJobs, fetchJobDetails]);

  const handleSearch = useCallback(async (term) => {
    try {
      const res = await axios.get("/public/jobs", { params: { search: term, status_filter: "open" } });
      setFilteredJobs(res.data.items || []);
    } catch (e) {
      console.error("Search failed:", e);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) handleSearch(searchTerm);
      else setFilteredJobs(jobs);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, jobs, handleSearch]);

  const handleAdvancedSearch = async (filters) => {
    try {
      setLoading(true);
      const params = { ...filters };
      if (filters.status) {
        params.status_filter = filters.status === "all" ? "all" : "open";
        delete params.status;
      } else {
        params.status_filter = "open";
      }
      const res = await axios.get("/public/jobs", { params });
      if (res.data.items) {
        setFilteredJobs(res.data.items || []);
        setJobs(res.data.items || []);
      }
    } catch (e) {
      showAlertMsg("error", "Advanced search failed. Please try again.");
      console.error("Advanced search failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilteredJobs(jobs);
    setSearchTerm("");
  };

  const openJobModal = async (job) => {
    if (job.id) await fetchJobDetails(job.id);
    else { setSelectedJob(job); setShowJobModal(true); }
  };

  const openApplyModal = (job) => {
    setSelectedJob(job);
    setShowApplyModal(true);
    setShowJobModal(false);
    setApplicationData({ name: "", email: "", file: null, fileName: "" });
  };

  const closeModals = () => {
    setShowJobModal(false);
    setShowApplyModal(false);
    setSelectedJob(null);
    setApplicationData({ name: "", email: "", file: null, fileName: "" });
    setAlert({ show: false, type: "", message: "" });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    const allowedExtensions = [".pdf", ".doc", ".docx"];
    const fileExtension = "." + file.name.split(".").pop().toLowerCase();
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      showAlertMsg("error", "Invalid file type. Please upload PDF, DOC, or DOCX files only.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showAlertMsg("error", "File size exceeds 5MB limit. Please upload a smaller file.");
      return;
    }
    setApplicationData({ ...applicationData, file, fileName: file.name });
  };

  const checkIfApplied = (jobId, email) => {
    const localCheck = appliedJobs.some((app) => app.jobId === jobId && app.email === email);
    const backendCheck = applicationStatuses[jobId]?.has_applied || false;
    return localCheck || backendCheck;
  };

  const checkApplicationStatus = async (jId, email) => {
    if (!email) return;
    try {
      const res = await axios.get(`/public/jobs/${jId}/application-status`, { params: { email } });
      setApplicationStatuses((prev) => ({ ...prev, [jId]: res.data }));
    } catch (e) {
      console.error("Failed to check application status:", e);
    }
  };

  const getDeadlineStatus = (deadline) => {
    if (!deadline) return null;
    const deadlineDate = new Date(deadline);
    const now = new Date();
    if (deadlineDate < now) return { text: "Deadline passed", color: "red", urgent: true };
    const diffMs = deadlineDate - now;
    const daysUntil = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hoursUntil = Math.floor(diffMs / (1000 * 60 * 60));
    const minutesUntil = Math.floor(diffMs / (1000 * 60));
    if (daysUntil === 0) {
      if (hoursUntil < 1) return { text: `Closes in ${minutesUntil}m`, color: "red", urgent: true };
      return { text: `Closes in ${hoursUntil}h`, color: "red", urgent: true };
    }
    if (daysUntil === 1) return { text: "Closes tomorrow", color: "orange", urgent: true };
    if (daysUntil <= 3) return { text: `${daysUntil} days left`, color: "orange", urgent: true };
    if (daysUntil <= 7) return { text: `${daysUntil} days left`, color: "yellow", urgent: false };
    return { text: `${daysUntil} days left`, color: "green", urgent: false };
  };

  const saveAppliedJob = (jId, jobTitle, email) => {
    const newApp = { jobId: jId, jobTitle, email, appliedAt: new Date().toISOString() };
    const updated = [...appliedJobs, newApp];
    setAppliedJobs(updated);
    localStorage.setItem("appliedJobs", JSON.stringify(updated));
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!applicationData.name.trim()) { showAlertMsg("error", "Please enter your full name."); return; }
    if (!applicationData.email.trim() || !applicationData.email.includes("@")) { showAlertMsg("error", "Please enter a valid email address."); return; }
    if (checkIfApplied(selectedJob.id, applicationData.email)) { showAlertMsg("error", "You have already applied for this job with this email address."); return; }

    setSubmitting(true);
    setAlert({ show: false, type: "", message: "" });

    try {
      const formData = new FormData();
      if (applicationData.file) formData.append("file", applicationData.file);
      formData.append("name", applicationData.name.trim());
      formData.append("email", applicationData.email.trim());
      
      const res = await axios.post(`/public/jobs/${selectedJob.id}/apply`, formData, { 
        headers: { "Content-Type": "multipart/form-data" } 
      });
      
      saveAppliedJob(selectedJob.id, selectedJob.title, applicationData.email);
      
      // Use message from backend (includes background processing notice)
      showAlertMsg("success", res.data.message || "Application submitted! We are processing your resume.");
      
      setApplicationData({ name: "", email: "", file: null, fileName: "" });
      
      // Close modal sooner for better responsiveness
      setTimeout(() => { 
        setShowApplyModal(false); 
        setAlert({ show: false, type: "", message: "" }); 
      }, 1500);
    } catch (err) {
      console.error("Application submission error:", err);
      let errorMsg = "Failed to submit application. Please try again.";
      const detail = err?.response?.data?.detail;
      if (detail) {
        if (typeof detail === 'string') errorMsg = detail;
        else if (Array.isArray(detail)) errorMsg = detail.map(d => d.msg || JSON.stringify(d)).join('; ');
        else if (typeof detail === 'object') errorMsg = detail.msg || JSON.stringify(detail);
      }
      showAlertMsg("error", errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Alert Component
  const Alert = ({ type, message, onClose }) => {
    if (!message) return null;
    const styles = { success: "bg-green-50 border-green-500 text-green-800", error: "bg-red-50 border-red-500 text-red-800", info: "bg-blue-50 border-blue-500 text-blue-800" };
    return (
      <div className={`fixed top-4 right-4 z-50 border-l-4 p-4 rounded-lg shadow-xl max-w-md ${styles[type]}`}>
        <div className="flex items-start">
          {type === "success" && <CheckCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />}
          {type === "error" && <AlertCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />}
          <p className="flex-1 text-sm font-medium">{message}</p>
          <button onClick={onClose} className="ml-3 text-gray-400 hover:text-gray-600"><XIcon className="h-4 w-4" /></button>
        </div>
      </div>
    );
  };

  // Fetch application statuses
  useEffect(() => {
    if (appliedJobs.length > 0 && activeTab === 'applications') {
      appliedJobs.forEach(app => checkApplicationStatus(app.jobId, app.email));
    }
  }, [appliedJobs, activeTab]);

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Hired': return 'bg-green-100 text-green-800';
      case 'Interview': return 'bg-purple-100 text-purple-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Review': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f9]">
      {alert.show && <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ show: false, type: "", message: "" })} />}

      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 lg:py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 self-start sm:self-center">
              <BriefcaseIcon className="h-6 w-6 lg:h-8 lg:w-8 text-emerald-600" />
              <div>
                <h1 className="text-lg lg:text-2xl font-bold text-gray-900 leading-tight">Job Portal</h1>
                <p className="text-[10px] lg:text-sm text-gray-600">Find your dream job</p>
              </div>
            </div>
            <div className="flex space-x-2 w-full sm:w-auto">
              <button onClick={() => setActiveTab("browse")} className={`flex-1 sm:flex-none px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === "browse" ? "bg-emerald-600 text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>Browse Jobs</button>
              <button onClick={() => setActiveTab("applications")} className={`flex-1 sm:flex-none px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === "applications" ? "bg-emerald-600 text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>My Apps ({appliedJobs.length})</button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "browse" ? (
          <>
            <AdvancedSearchFilters type="jobs" onSearch={handleAdvancedSearch} onClear={handleClearFilters} initialFilters={{ keyword: searchTerm, status: "open" }} />

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="bg-white rounded-2xl shadow-xl p-6 animate-pulse">
                    <div className="flex items-center gap-2 mb-4"><div className="w-8 h-8 bg-gray-200 rounded-full"></div><div className="flex-1"><div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div><div className="h-3 bg-gray-200 rounded w-1/2"></div></div></div>
                    <div className="h-6 bg-gray-200 rounded w-full mb-3"></div><div className="h-3 bg-gray-200 rounded w-full mb-2"></div><div className="h-3 bg-gray-200 rounded w-5/6 mb-4"></div>
                    <div className="flex gap-2"><div className="flex-1 h-10 bg-gray-200 rounded-xl"></div><div className="flex-1 h-10 bg-gray-200 rounded-xl"></div></div>
                  </div>
                ))}
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <BriefcaseIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-xl font-semibold text-gray-700 mb-2">No jobs found</p>
                <p className="text-gray-500">Try adjusting your search or check back later.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {filteredJobs.map((job) => {
                  const isApplied = checkIfApplied(job.id, applicationData.email || "");
                  const isClosed = job.status === "closed";
                  const deadlineStatus = getDeadlineStatus(job.apply_deadline);
                  const canApply = !isApplied && !isClosed;
                  return (
                    <motion.div key={job.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -8, transition: { duration: 0.2 } }} className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 relative">
                      <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                        {isClosed && <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">CLOSED</span>}
                        {isApplied && <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg">APPLIED</span>}
                        {!isClosed && !isApplied && deadlineStatus?.urgent && (
                          <span className={`px-2 py-1 text-white text-xs font-bold rounded-full shadow-lg ${deadlineStatus.color === "red" ? "bg-red-500" : "bg-orange-500"}`}>{deadlineStatus.text.toUpperCase()}</span>
                        )}
                      </div>
                      <div className="mb-4 pr-16 sm:pr-20">
                        <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-2 line-clamp-2">{job.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-[10px] lg:text-xs">{(job.recruiter_name || "U")[0].toUpperCase()}</div>
                          <div>
                            <p className="font-medium text-xs lg:text-sm">By {job.recruiter_name || "Unknown"}</p>
                            {job.created_at && <p className="text-[10px] text-gray-500">{getLocalDateString(job.created_at)}</p>}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-4 line-clamp-3 text-sm">{job.snippet}</p>
                      <div className="flex items-center justify-between mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${job.difficulty === "Easy" ? "bg-green-100 text-green-800" : job.difficulty === "Hard" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>{job.difficulty || "Medium"}</span>
                        {job.apply_deadline && deadlineStatus && <span className={`text-xs font-medium ${deadlineStatus.color === "red" ? "text-red-600" : deadlineStatus.color === "orange" ? "text-orange-600" : deadlineStatus.color === "yellow" ? "text-yellow-600" : "text-green-600"}`}>📅 {deadlineStatus.text}</span>}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openJobModal(job)} className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition">View Details</button>
                        <div className="relative flex-1 group">
                          <button onClick={() => canApply && openApplyModal(job)} disabled={!canApply} className={`w-full px-4 py-2 rounded-xl font-medium transition ${isClosed ? "bg-red-100 text-red-700 cursor-not-allowed" : isApplied ? "bg-green-100 text-green-700 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`} title={isClosed ? "This job is no longer accepting applications" : isApplied ? "You have already applied to this job" : "Click to apply for this position"}>
                            {isClosed ? "Closed" : isApplied ? "Applied ✓" : "Apply Now"}
                          </button>
                          {!canApply && <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-10">{isClosed ? "🔒 Job is closed" : "✓ Already applied"}<div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div></div>}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Applications</h2>
            {appliedJobs.length === 0 ? (
              <div className="text-center py-12">
                <BriefcaseIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">You haven't applied to any jobs yet.</p>
                <button onClick={() => setActiveTab("browse")} className="mt-4 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition">Browse Jobs</button>
              </div>
            ) : (
              <div className="space-y-4">
                {appliedJobs.map((app, idx) => {
                  const statusInfo = applicationStatuses[app.jobId];
                  const currentStatus = statusInfo?.application_status || 'Applied';
                  return (
                    <div key={idx} className="border-2 border-gray-200 rounded-xl p-6 hover:border-emerald-300 transition">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">{app.jobTitle}</h3>
                          <p className="text-sm text-gray-600 mb-1">Email: {app.email}</p>
                          <p className="text-xs text-gray-500">Applied: {getLocalDateTimeString(app.appliedAt)}</p>
                          {statusInfo?.has_applied && currentStatus === 'Interview' && <p className="text-xs text-purple-600 font-bold mt-1">ℹ Check your email for interview details</p>}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(currentStatus)}`}>{currentStatus}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showJobModal && selectedJob && <JobDetailModal job={selectedJob} onClose={closeModals} onApply={openApplyModal} getDeadlineStatus={getDeadlineStatus} />}
      {showApplyModal && selectedJob && <ApplyModal job={selectedJob} applicationData={applicationData} setApplicationData={setApplicationData} alert={alert} submitting={submitting} onSubmit={handleSubmitApplication} onFileChange={handleFileChange} onClose={closeModals} />}
    </div>
  );
}

export default JobPortal;
