import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../axios';

function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    setError('');
    setSuccess('');
    setLoading(true);
    setUploadResult(null);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await axios.post('/upload_resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setSuccess('✅ Resume uploaded successfully!');
      setUploadResult(response.data);
      setFile(null);
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
      
      // Redirect to jobs page after 2 seconds
      setTimeout(() => {
        navigate('/jobs');
      }, 2000);
      
    } catch (err) {
      let errorMessage = err?.response?.data?.detail || 'Upload failed. Please try again.';
      if (typeof errorMessage !== 'string') {
        if (Array.isArray(errorMessage)) {
          errorMessage = errorMessage.map(e => e.msg || JSON.stringify(e)).join('; ');
        } else if (typeof errorMessage === 'object' && errorMessage !== null) {
          errorMessage = errorMessage.msg || JSON.stringify(errorMessage);
        } else {
            errorMessage = String(errorMessage);
        }
      }
      setError(errorMessage);
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Invalid file type. Please upload PDF, DOC, DOCX, JPG, or PNG.');
      setFile(null);
      return;
    }
    
    // Validate file size (10MB max)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10MB.');
      setFile(null);
      return;
    }
    
    setFile(selectedFile);
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">📄 Upload Resume</h2>
          <p className="text-gray-600">Upload your resume in PDF, DOCX, DOC, JPG, or PNG format</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded">
            <p className="font-semibold">{success}</p>
            {uploadResult && (
              <div className="mt-3 text-sm">
                <p><strong>Candidate Name:</strong> {uploadResult.candidate_name}</p>
                <p><strong>Email:</strong> {uploadResult.email}</p>
                <p><strong>Skills Extracted:</strong> {uploadResult.skills_extracted}</p>
                <p className="mt-2 text-green-600">Redirecting to job board...</p>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Resume File
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
                id="file-input"
                disabled={loading}
              />
              <label
                htmlFor="file-input"
                className="cursor-pointer block"
              >
                <div className="text-4xl mb-2">📎</div>
                <p className="text-gray-600 mb-2">
                  {file ? file.name : 'Click to select or drag and drop'}
                </p>
                <p className="text-sm text-gray-500">
                  PDF, DOCX, DOC, JPG, PNG (Max 10MB)
                </p>
              </label>
              {file && (
                <div className="mt-4 p-3 bg-blue-50 rounded">
                  <p className="text-sm font-semibold text-blue-800">
                    Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">ℹ️ Supported Formats</h3>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>PDF files (.pdf)</li>
              <li>Microsoft Word (.doc, .docx)</li>
              <li>Image files (.jpg, .jpeg, .png) - OCR supported</li>
            </ul>
            <p className="text-xs text-blue-600 mt-2">
              The system will automatically extract your skills, experience, and contact information.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={!file || loading}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition shadow-md ${
                !file || loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                  Uploading...
                </span>
              ) : (
                '📤 Upload Resume'
              )}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/jobs')}
              className="px-6 py-3 rounded-lg font-semibold bg-gray-600 hover:bg-gray-700 text-white transition shadow-md"
            >
              View Jobs
            </button>
          </div>
        </form>

        {!file && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have a resume? <a href="/jobs" className="text-blue-600 hover:text-blue-800 font-semibold">Browse Jobs</a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResumeUpload;