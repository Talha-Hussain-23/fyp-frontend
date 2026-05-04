import { motion } from 'framer-motion';
import { AlertCircle, Bell, Monitor, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import axios from '../../axios';

const NotificationPreferences = () => {
    const [preferences, setPreferences] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                const res = await axios.get('/notifications/preferences');
                if (res.data.success) {
                    setPreferences(res.data.preferences);
                }
            } catch (error) {
                console.error("Failed to load preferences", error);
                toast.error("Failed to load settings");
            } finally {
                setLoading(false);
            }
        };
        fetchPreferences();
    }, []);

    const handleToggle = (key, category = null) => {
        setPreferences(prev => {
            const newPrefs = { ...prev };
            if (category) {
                newPrefs.categories = { ...prev.categories, [category]: !prev.categories[category] };
            } else {
                newPrefs[key] = !prev[key];
            }
            return newPrefs;
        });
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            await axios.put('/notifications/preferences', preferences);
            toast.success("Preferences saved successfully");
        } catch (error) {
            console.error("Failed to save", error);
            toast.error("Failed to save changes");
        } finally {
            setLoading(false);
        }
    };

    if (loading && !preferences) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
            >
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Bell className="w-6 h-6" /> Notification Settings
                    </h2>
                    <p className="text-blue-100 mt-1">Manage how and when you want to be notified.</p>
                </div>

                <div className="p-6 space-y-8">
                    {/* General Channels */}
                    <section>
                        <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Monitor className="w-4 h-4" /> Global Channels
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div>
                                    <p className="font-medium text-gray-900">In-App Notifications</p>
                                    <p className="text-sm text-gray-500">Show notifications inside the dashboard</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={preferences.in_app_enabled} 
                                        onChange={() => handleToggle('in_app_enabled')}
                                        className="sr-only peer" 
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div>
                                    <p className="font-medium text-gray-900">Email Notifications</p>
                                    <p className="text-sm text-gray-500">Receive updates via email</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={preferences.email_enabled} 
                                        onChange={() => handleToggle('email_enabled')}
                                        className="sr-only peer" 
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>
                    </section>
                    
                    <div className="border-t border-gray-100"></div>

                    {/* Categories */}
                    <section>
                        <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> Notification Types
                        </h3>
                        <div className="grid gap-3">
                            {Object.entries(preferences.categories).map(([key, enabled]) => (
                                <div key={key} className="flex items-center justify-between py-2">
                                    <span className="text-gray-700 capitalize">
                                        {key.replace('_', ' ')}
                                    </span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={enabled} 
                                            onChange={() => handleToggle(null, key)}
                                            className="sr-only peer" 
                                        />
                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className={`flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all ${
                                loading ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                        >
                            <Save className="w-4 h-4" />
                            {loading ? 'Saving...' : 'Save Preferences'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default NotificationPreferences;
