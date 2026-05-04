import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Briefcase, Check, Mail, MessageSquare, Settings } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { getLocalDateString } from '../../utils/dateUtils';

const NotificationCenter = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'unread'
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredNotifications = activeTab === 'all' 
        ? notifications 
        : notifications.filter(n => !n.is_read);

    const handleNotificationClick = (notification) => {
        if (!notification.is_read) markAsRead(notification.id);
        if (notification.link) window.location.href = notification.link;
        setIsOpen(false);
    };

    const getIcon = (type) => {
        switch(type) {
            case 'application': return <Briefcase className="w-4 h-4 text-blue-500" />;
            case 'interview': return <MessageSquare className="w-4 h-4 text-purple-500" />;
            case 'system': return <Settings className="w-4 h-4 text-gray-500" />;
            default: return <Mail className="w-4 h-4 text-green-500" />;
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return getLocalDateString(date.toISOString());
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Trigger */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
                <div className="relative">
                    <Bell className={`w-6 h-6 ${unreadCount > 0 ? 'text-gray-800' : 'text-gray-500'}`} />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </div>
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-96 origin-top-right rounded-2xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-white px-4 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
                            <h2 className="text-lg font-bold text-gray-800 tracking-tight">Notifications</h2>
                            <div className="flex gap-2">
                                <button 
                                    onClick={markAllAsRead}
                                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all text-xs font-medium flex items-center gap-1"
                                    title="Mark all as read"
                                >
                                    <Check className="w-4 h-4" /> Mark all read
                                </button>
                                <button 
                                    onClick={() => navigate('/settings/notifications')}
                                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    <Settings className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex px-4 pt-2 gap-4 border-b border-gray-100 bg-gray-50/50">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`pb-2 text-sm font-medium transition-colors relative ${
                                    activeTab === 'all' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                All
                                {activeTab === 'all' && (
                                    <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('unread')}
                                className={`pb-2 text-sm font-medium transition-colors relative ${
                                    activeTab === 'unread' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Unread
                                {activeTab === 'unread' && (
                                    <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
                                )}
                            </button>
                        </div>

                        {/* List */}
                        <div className="overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-gray-200">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                    <div className="bg-gray-100 p-4 rounded-full mb-3">
                                        <Bell className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-900 font-medium">All caught up!</p>
                                    <p className="text-sm text-gray-500 mt-1">No new notifications to show.</p>
                                </div>
                            ) : filteredNotifications.length === 0 ? (
                                <div className="py-12 text-center text-gray-500 text-sm">
                                    No {activeTab} notifications
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {filteredNotifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            onClick={() => handleNotificationClick(notif)}
                                            className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors relative group ${
                                                !notif.is_read ? 'bg-blue-50/40' : 'bg-white'
                                            }`}
                                        >
                                            <div className="flex gap-3">
                                                <div className="flex-shrink-0 mt-1">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                        !notif.is_read ? 'bg-blue-100' : 'bg-gray-100'
                                                    }`}>
                                                        {getIcon(notif.type)}
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className={`text-sm font-semibold truncate pr-2 ${
                                                            !notif.is_read ? 'text-gray-900' : 'text-gray-700'
                                                        }`}>
                                                            {notif.title}
                                                        </h4>
                                                        <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0">
                                                            {formatTime(notif.created_at)}
                                                        </span>
                                                    </div>
                                                    <p className={`text-sm line-clamp-2 ${
                                                        !notif.is_read ? 'text-gray-700' : 'text-gray-500'
                                                    }`}>
                                                        {notif.message}
                                                    </p>
                                                </div>
                                                {!notif.is_read && (
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 p-2 text-center border-t border-gray-100">
                           <button 
                                onClick={() => { setIsOpen(false); navigate('/notifications'); }}
                                className="text-xs font-semibold text-blue-600 hover:text-blue-700 py-1 px-3 rounded-full hover:bg-blue-50 transition-colors"
                           >
                               View History
                           </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationCenter;
