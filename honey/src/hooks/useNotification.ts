import { useState, useCallback } from "react";
import type { NotificationType } from "../types/admin";

interface NotificationState {
  show: boolean;
  message: string;
  type: NotificationType;
}

export const useNotification = () => {
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    message: "",
    type: "info",
  });

  const showNotification = useCallback(
    (message: string, type: NotificationType = "info") => {
      setNotification({
        show: true,
        message,
        type,
      });
    },
    []
  );

  const hideNotification = useCallback(() => {
    setNotification((prev) => ({
      ...prev,
      show: false,
    }));
  }, []);

  return {
    notification,
    showNotification,
    hideNotification,
  };
};
