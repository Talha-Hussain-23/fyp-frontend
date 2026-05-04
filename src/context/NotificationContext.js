import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { toast } from 'sonner';
import axios from '../axios';

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [socketConnected, setSocketConnected] = useState(false);
    const socketRef = useRef(null);

    // Fetch initial state
    const fetchNotifications = useCallback(async () => {
        try {
            const res = await axios.get('/notifications', { params: { limit: 20 } });
            if (res.data.success) {
                setNotifications(res.data.notifications || []);
                setUnreadCount(res.data.unread_count || 0);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    }, []);

    // Initialize Socket
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Use env var or default
        const SOCKET_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace('/api', '');
        
        socketRef.current = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
            console.log('✅ Notification Socket Connected');
            setSocketConnected(true);
            fetchNotifications(); 
        });

        socket.on('disconnect', () => {
            console.log('❌ Notification Socket Disconnected');
            setSocketConnected(false);
        });

        // Sound Effect removed to fix CSP violation

        // The "Exceptional" Listener
        socket.on('new_notification', (data, callback) => {
            console.log('🔔 New Notification Received:', data);
            
            // Optimistic UI Update
            setNotifications(prev => [data, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Exceptional Toast Notification
            toast(data.title, {
                description: data.message,
                action: data.link ? {
                    label: 'View',
                    onClick: () => window.location.href = data.link
                } : undefined,
                duration: 5000,
            });
            
            // Browser Notification
            if (Notification.permission === 'granted') {
                 new Notification(data.title, { body: data.message });
            }

            // Acknowledge receipt
            if (callback) callback('ack');
        });

        return () => {
            if (socket) socket.disconnect();
        };
    }, [fetchNotifications]);

    const markAsRead = async (notificationId) => {
        try {
            setNotifications(prev => 
                prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
            await axios.put(`/notifications/${notificationId}/read`);
        } catch (error) {
            console.error('Failed to mark read:', error);
            fetchNotifications(); 
        }
    };
    
    const markAllAsRead = async () => {
        try {
             setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
             setUnreadCount(0);
             await axios.put('/notifications/mark-all-read');
        } catch (error) {
            console.error('Failed to mark all read:', error);
            fetchNotifications();
        }
    };

    const value = {
        notifications,
        unreadCount,
        socketConnected,
        markAsRead,
        markAllAsRead,
        refresh: fetchNotifications
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
