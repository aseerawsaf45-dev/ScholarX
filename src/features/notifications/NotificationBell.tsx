"use client";

import { useState, useEffect } from "react";
import { Icon } from "@/components/ui/icon";
import { motion, AnimatePresence } from "framer-motion";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]); // To be fetched from API
  const unreadCount = notifications.filter(n => !n.readStatus).length;

  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)}
        className="relative p-2 text-slate-400 hover:text-slate-200 transition-colors rounded-full hover:bg-slate-800"
      >
        <Icon name="bell" className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0B1120]" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden z-50"
          >
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
              <h3 className="font-semibold text-slate-100">Notifications</h3>
              {unreadCount > 0 && (
                <button className="text-xs text-primary-400 hover:text-primary-300">
                  Mark all as read
                </button>
              )}
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">
                  <Icon name="bell-off" className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800/50">
                  {notifications.map((n, i) => (
                    <div key={i} className={`p-4 hover:bg-slate-800/30 transition-colors flex gap-3 ${!n.readStatus ? 'bg-primary-500/5' : ''}`}>
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.readStatus ? 'bg-primary-500' : 'bg-transparent'}`} />
                      <div>
                        <p className={`text-sm ${!n.readStatus ? 'text-slate-200 font-medium' : 'text-slate-400'}`}>
                          {n.message}
                        </p>
                        <span className="text-xs text-slate-500 mt-1 block">Just now</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-3 border-t border-slate-800 text-center bg-slate-800/30">
              <button className="text-xs text-slate-400 hover:text-slate-200 font-medium">
                View all notifications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
