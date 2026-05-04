import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../axios';



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

const Eye = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOff = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

function UserSettings() {
  const navigate = useNavigate();
  // const [profile, setProfile] = useState(null); // Removed unused state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [settings, setSettings] = useState({
    notifications: true,
    theme: 'light'
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/user/profile');
      if (response.data.success) {
        const prof = response.data.profile;
        // setProfile(prof); // Removed unused state update
        setSettings(prof.settings || { notifications: true, theme: 'light' });
      }
    } catch (err) {
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsChange = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    try {
      const updateData = { [key]: value };
      const response = await axios.put('/api/user/settings', updateData);
      if (response.data.success) {
        setSuccess('Settings updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      let errorMessage = err?.response?.data?.detail || err?.message || 'Failed to update settings';
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
      // Revert on error
      setSettings(settings);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.new_password.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match');
      return;
    }

    setChangingPassword(true);

    try {
      const response = await axios.put('/api/user/password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });

      if (response.data.success) {
        setSuccess('Password changed successfully!');
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      let errorMessage = err?.response?.data?.detail || err?.message || 'Failed to change password';
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
      setChangingPassword(false);
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
          <p className="mt-4 text-gray-600">Loading settings...</p>
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
                <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                <p className="text-emerald-100">Manage your account preferences</p>
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
          <div className="p-6 space-y-8">
            {/* Success/Error Messages */}
            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Notification Settings */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Notifications</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-500">Receive email updates about your account</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications}
                      onChange={(e) => handleSettingsChange('notifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Theme Settings */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Appearance</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div>
                  <p className="font-medium text-gray-900 mb-3">Theme</p>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleSettingsChange('theme', 'light')}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                        settings.theme === 'light'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Light
                    </button>
                    <button
                      onClick={() => handleSettingsChange('theme', 'dark')}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                        settings.theme === 'dark'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Dark
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Password Change */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Change Password</h2>
              <form onSubmit={handlePasswordChange} className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div>
                  <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      id="current_password"
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="new_password"
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {passwordData.new_password && passwordData.new_password.length < 6 && (
                    <p className="mt-1 text-xs text-red-600">Password must be at least 6 characters</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirm_password"
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {passwordData.confirm_password && passwordData.new_password !== passwordData.confirm_password && (
                    <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={changingPassword || passwordData.new_password.length < 6 || passwordData.new_password !== passwordData.confirm_password}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    changingPassword || passwordData.new_password.length < 6 || passwordData.new_password !== passwordData.confirm_password
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {changingPassword ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserSettings;

