'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, X, Zap, CloudFog, Wind } from 'lucide-react';
import { create } from 'zustand';

// Notification types
export type NotificationType = 'crash' | 'weather' | 'grid' | 'info' | 'success';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
}

// Notification store for global access
interface NotificationStore {
  notifications: Notification[];
  addNotification: (type: NotificationType, title: string, message: string) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  addNotification: (type, title, message) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    set((state) => ({
      notifications: [
        ...state.notifications,
        { id, type, title, message, timestamp: Date.now() }
      ].slice(-5) // Keep only last 5 notifications
    }));
    // Auto-remove after 6 seconds
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      }));
    }, 6000);
  },
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  clearAll: () => set({ notifications: [] })
}));

// Get icon based on notification type
const getIcon = (type: NotificationType) => {
  switch (type) {
    case 'crash':
      return <AlertTriangle size={18} className="text-red-400" />;
    case 'weather':
      return <CloudFog size={18} className="text-amber-400" />;
    case 'grid':
      return <Zap size={18} className="text-orange-400" />;
    case 'success':
      return <CheckCircle size={18} className="text-emerald-400" />;
    default:
      return <Info size={18} className="text-cyan-400" />;
  }
};

// Get border color based on type
const getBorderColor = (type: NotificationType) => {
  switch (type) {
    case 'crash':
      return 'border-red-500/50';
    case 'weather':
      return 'border-amber-500/50';
    case 'grid':
      return 'border-orange-500/50';
    case 'success':
      return 'border-emerald-500/50';
    default:
      return 'border-cyan-500/50';
  }
};

/**
 * NotificationToast - Individual toast notification
 */
const NotificationToast = ({ notification, onClose }: { notification: Notification; onClose: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`relative bg-slate-900/95 backdrop-blur-md border ${getBorderColor(notification.type)} rounded-lg p-3 shadow-xl min-w-[280px] max-w-[360px]`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-slate-200 font-mono">
            {notification.title}
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            {notification.message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition-colors"
          title="Dismiss notification"
          aria-label="Dismiss notification"
        >
          <X size={14} />
        </button>
      </div>
      {/* Progress bar for auto-dismiss */}
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 6, ease: 'linear' }}
        className={`absolute bottom-0 left-0 h-0.5 rounded-b-lg ${
          notification.type === 'crash' ? 'bg-red-500' :
          notification.type === 'weather' ? 'bg-amber-500' :
          notification.type === 'grid' ? 'bg-orange-500' :
          notification.type === 'success' ? 'bg-emerald-500' :
          'bg-cyan-500'
        }`}
      />
    </motion.div>
  );
};

/**
 * NotificationContainer - Renders all active notifications
 */
export const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

/**
 * Helper function to show notifications (can be called from store actions)
 */
export const showNotification = (type: NotificationType, title: string, message: string) => {
  useNotificationStore.getState().addNotification(type, title, message);
};
