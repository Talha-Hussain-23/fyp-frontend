import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../axios';

const User = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const Camera = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 001.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CheckCircle = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const AlertCircle = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

function UserProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    role: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/user/profile');
      if (response.data.success) {
        const prof = response.data.profile;
        setProfile(prof);
        setFormData({
          name: prof.name || '',
          organization: prof.organization || '',
          role: prof.role || ''
        });
      }
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.put('/user/profile', formData);
      if (response.data.success) {
        setSuccess('Profile updated successfully!');
        setEditing(false);
        fetchProfile();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      let errorMessage = err?.response?.data?.detail || err?.message || 'Failed to update profile';
      
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
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      setError('Please select a JPG or PNG image');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/user/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setSuccess('Avatar uploaded successfully!');
        fetchProfile();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      let errorMessage = err?.response?.data?.detail || err?.message || 'Failed to upload avatar';
      
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
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7f9]">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-emerald-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7f9] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
                <p className="text-emerald-100">Manage your account information</p>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Success/Error Messages */}
            {success && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            )}

            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Avatar Section */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-4">Profile Picture</label>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  {profile?.avatar_url ? (
                    <img
                      src={`${process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace('/api', '') : 'http://localhost:8000'}${profile.avatar_url}`}
                      alt="Avatar"
                      className="h-24 w-24 rounded-full object-cover border-4 border-emerald-100"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'User')}&background=10b981&color=fff&size=128`;
                      }}
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-emerald-100 flex items-center justify-center border-4 border-emerald-200">
                      <User className="h-12 w-12 text-emerald-600" />
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 bg-emerald-600 text-white p-2 rounded-full cursor-pointer hover:bg-emerald-700 transition-colors">
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {uploading ? 'Uploading...' : 'Click the camera icon to upload a new photo'}
                  </p>
                  <p className="text-xs text-gray-500">JPG or PNG, max 5MB</p>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-2">
                    Company / Organization
                  </label>
                  <input
                    id="organization"
                    name="organization"
                    type="text"
                    value={formData.organization}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                    Role / Designation
                  </label>
                  <input
                    id="role"
                    name="role"
                    type="text"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      fetchProfile();
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                  <p className="text-lg text-gray-900">{profile?.name || 'Not set'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                  <p className="text-lg text-gray-900">{profile?.email || 'Not set'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Company / Organization</label>
                  <p className="text-lg text-gray-900">{profile?.organization || 'Not set'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Role / Designation</label>
                  <p className="text-lg text-gray-900">{profile?.role || 'Not set'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Account Type</label>
                  <p className="text-lg text-gray-900">
                    {profile?.is_recruiter ? 'Recruiter' : 'Candidate'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email Verification</label>
                  <p className="text-lg">
                    {profile?.is_verified ? (
                      <span className="text-green-600 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Verified
                      </span>
                    ) : (
                      <span className="text-red-600">Not Verified</span>
                    )}
                  </p>
                </div>

                <button
                  onClick={() => setEditing(true)}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;

