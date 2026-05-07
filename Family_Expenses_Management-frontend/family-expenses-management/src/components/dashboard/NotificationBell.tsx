'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react'
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotificationApi,
} from '@/service/API'

interface Notification {
  _id: string
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
  related_id?: string
}

const typeIcon: Record<string, string> = {
  expense_added: '💸',
  budget_exceeded: '⚠️',
  budget_request: '📋',
  budget_approved: '✅',
  budget_denied: '❌',
}

const typeColor: Record<string, string> = {
  expense_added: 'border-l-blue-400',
  budget_exceeded: 'border-l-red-400',
  budget_request: 'border-l-yellow-400',
  budget_approved: 'border-l-green-400',
  budget_denied: 'border-l-red-400',
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Vừa xong'
  if (minutes < 60) return `${minutes} phút trước`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} giờ trước`
  const days = Math.floor(hours / 24)
  return `${days} ngày trước`
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const fetchUnread = async () => {
    try {
      const res = await getUnreadNotificationCount()
      setUnreadCount(res.data.count || 0)
    } catch (_) {}
  }

  const fetchNotifications = async () => {
    setIsLoading(true)
    try {
      const res = await getNotifications()
      setNotifications(res.data || [])
    } catch (_) {}
    setIsLoading(false)
  }

  // Poll unread count every 30 seconds
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) return
    fetchUnread()
    const interval = setInterval(fetchUnread, 30000)
    return () => clearInterval(interval)
  }, [])

  // Close when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleOpen = () => {
    setOpen(prev => !prev)
    if (!open) fetchNotifications()
  }

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id)
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, is_read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (_) {}
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (_) {}
  }

  const handleDelete = async (id: string, wasUnread: boolean) => {
    try {
      await deleteNotificationApi(id)
      setNotifications(prev => prev.filter(n => n._id !== id))
      if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (_) {}
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
        aria-label="Thông báo"
      >
        <Bell className="h-5 w-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-[3px] animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-11 z-50 w-[360px] max-h-[480px] flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-blue-600" />
              <span className="font-semibold text-gray-800 text-sm">Thông báo</span>
              {unreadCount > 0 && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  {unreadCount} mới
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Đọc tất cả
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {isLoading ? (
              <div className="py-10 text-center text-sm text-gray-400">Đang tải...</div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="h-10 w-10 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Không có thông báo nào</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n._id}
                  className={`flex gap-3 px-4 py-3 border-l-4 border-b border-gray-50 transition-colors cursor-pointer group
                    ${!n.is_read ? 'bg-blue-50/60' : 'bg-white hover:bg-gray-50'}
                    ${typeColor[n.type] || 'border-l-gray-300'}
                  `}
                  onClick={() => !n.is_read && handleMarkRead(n._id)}
                >
                  <span className="text-xl mt-0.5 flex-shrink-0">
                    {typeIcon[n.type] || '🔔'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium leading-tight ${!n.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-2">
                      {n.message}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    {!n.is_read && (
                      <button
                        onClick={e => { e.stopPropagation(); handleMarkRead(n._id) }}
                        className="p-1 rounded-full hover:bg-blue-100 text-blue-500"
                        title="Đánh dấu đã đọc"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(n._id, !n.is_read) }}
                      className="p-1 rounded-full hover:bg-red-100 text-red-400"
                      title="Xóa"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
