import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import NotificationAlert, { NotificationType } from '../components/NotificationAlert';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  duration?: number;
}

interface NotificationContextType {
  showNotification: (
    message: string,
    type?: NotificationType,
    title?: string,
    duration?: number
  ) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxNotifications?: number;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  position = 'top-right',
  maxNotifications = 3,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback(
    (
      message: string,
      type: NotificationType = 'info',
      title?: string,
      duration: number = 5000
    ) => {
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const newNotification: Notification = { id, type, message, title, duration };

      setNotifications((prev) => {
        const updated = [newNotification, ...prev];
        // Limit number of notifications
        return updated.slice(0, maxNotifications);
      });
    },
    [maxNotifications]
  );

  const showSuccess = useCallback(
    (message: string, title?: string) => {
      showNotification(message, 'success', title || 'Success');
    },
    [showNotification]
  );

  const showError = useCallback(
    (message: string, title?: string) => {
      showNotification(message, 'error', title || 'Error');
    },
    [showNotification]
  );

  const showWarning = useCallback(
    (message: string, title?: string) => {
      showNotification(message, 'warning', title || 'Warning');
    },
    [showNotification]
  );

  const showInfo = useCallback(
    (message: string, title?: string) => {
      showNotification(message, 'info', title || 'Info');
    },
    [showNotification]
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  return (
    <NotificationContext.Provider
      value={{ showNotification, showSuccess, showError, showWarning, showInfo }}
    >
      {children}
      <div className="notification-container">
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            style={{
              marginTop: index > 0 ? '8px' : '0',
            }}
          >
            <NotificationAlert
              type={notification.type}
              message={notification.message}
              title={notification.title}
              duration={notification.duration}
              onClose={() => removeNotification(notification.id)}
              position={position}
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
