"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./auth-context";
import { toast } from "sonner";
import Cookies from "js-cookie";

interface Notification {
  id: string;
  type: string;
  message: string;
  data: any;
  read: boolean;
  createdAt: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback((type: string, data: any) => {
    let message = "Nouvelle notification";
    
    if (type === "application_status_updated") {
      message = `Le statut de votre candidature pour "${data.jobTitle}" a été mis à jour : ${data.status}`;
    } else if (type === "JOB_APPROVED") {
      message = data.message || `Votre offre "${data.jobTitle}" a été approuvée ✅`;
    } else if (type === "JOB_REJECTED") {
      message = data.message || `Votre offre "${data.jobTitle}" a été rejetée ❌`;
    }

    const newNotification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      message,
      data,
      read: false,
      createdAt: new Date(),
    };

    setNotifications((prev) => [newNotification, ...prev]);
    toast.info(message, {
      description: new Date().toLocaleTimeString(),
    });
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const token = Cookies.get("accessToken");
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      query: { token },
    });

    newSocket.on("connect", () => {
      console.log("Connected to notification server");
      setSocket(newSocket);
    });

    newSocket.on("application_status_updated", (data) => {
      addNotification("application_status_updated", data);
    });

    newSocket.on("notification", (data) => {
      if (data.type) {
        addNotification(data.type, data);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, user, addNotification]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
