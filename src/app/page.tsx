"use client";

import React, { useState, useEffect } from 'react';
import { format, isToday, isPast, parseISO, differenceInCalendarDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, subMonths, addMonths, isSameMonth, isSameDay } from 'date-fns';
import { Plus, Trash2, Calendar, ChevronLeft, ChevronRight, Clock, Tag as TagIcon, LayoutDashboard, CalendarDays, AlertCircle, Archive, RefreshCcw, LogOut, Search, X, Pencil, Info, Bell, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserButton, Show, SignInButton } from "@clerk/nextjs";

import Magnetic from '@/components/Magnetic';
import SpotlightCard from '@/components/SpotlightCard';
import OnboardingSlideshow from '@/components/OnboardingSlideshow';
import toast, { Toaster } from 'react-hot-toast';

interface Task {
  id: string;
  title: string;
  due_date: string;
  due_time: string | null;
  priority: string;
  tag: string | null;
  done: boolean;
  notified: boolean;
  deleted_at: string | null;
}

interface AppNotification {
  id: string;
  message: string;
  time: string;
  read: boolean;
  type: 'success' | 'alert' | 'default';
}

const SECTION_LABELS: Record<string, string> = {
  today: "Today's Entries",
  upcoming: "Upcoming",
  overdue: "Past Due",
  all: "All Entries",
  trash: "Recycle Bin",
};

const EMPTY_MESSAGES: Record<string, { glyph: string; text: string }> = {
  today:    { glyph: '✦', text: "Nothing due today — enjoy the clear ledger." },
  upcoming: { glyph: '◌', text: "No upcoming entries." },
  overdue:  { glyph: '◎', text: "All caught up." },
  all:      { glyph: '◆', text: "No entries yet. Add your first task above." },
  trash:    { glyph: '∅', text: "The bin is empty." },
};

function InstructionsModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <motion.div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--color-text-inverse)' }}>How to use Ledger</h2>
          <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.4)' }}><X size={20} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: '1.5' }}>
          <div>
            <strong style={{ color: 'white', display: 'block', marginBottom: '0.25rem' }}>✏️ Adding & Editing Tasks</strong>
            Use the form at the top to quickly add tasks. You can set the priority (Low, Med, Important) and add a custom tag (like #work or #personal). Click the pencil icon on any task to edit its details later.
          </div>
          <div>
            <strong style={{ color: 'white', display: 'block', marginBottom: '0.25rem' }}>🔔 Browser Notifications</strong>
            If you set a specific Time for your task and leave Ledger open in a tab, you will receive a desktop notification right when the task is due! Make sure you clicked "Allow" for notifications.
          </div>
          <div>
            <strong style={{ color: 'white', display: 'block', marginBottom: '0.25rem' }}>🗑️ Deleting & Restoring</strong>
            Click the trash icon to move a task to the Recycle Bin. You can always view the Bin from the navigation menu and click the restore icon to bring tasks back.
          </div>
          <div>
            <strong style={{ color: 'white', display: 'block', marginBottom: '0.25rem' }}>🔍 Searching</strong>
            Click the magnifying glass icon to search through all your tasks by their title or #tag.
          </div>
        </div>
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
          <button type="button" onClick={onClose} style={{ padding: '0.6rem 1.5rem', background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px', fontWeight: 500 }}>Got it</button>
        </div>
      </motion.div>
    </div>
  );
}

function NotificationCenterModal({ 
  notifications, 
  onClose, 
  onClear 
}: { 
  notifications: AppNotification[], 
  onClose: () => void, 
  onClear: () => void 
}) {
  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1000, justifyContent: 'flex-end', alignItems: 'flex-start' }}>
      <motion.div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        style={{ width: '350px', maxHeight: '80vh', overflowY: 'auto', margin: '1rem', borderRadius: '12px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--color-text-inverse)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={16} /> Notification Center
          </h2>
          <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.4)' }}><X size={18} /></button>
        </div>
        
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '2rem 0', fontSize: '0.9rem' }}>
            No recent notifications.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {notifications.map(n => (
              <div key={n.id} style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <div style={{ marginTop: '2px' }}>
                  {n.type === 'success' ? <CheckCircle2 size={16} color="var(--color-accent-teal)" /> :
                   n.type === 'alert' ? <AlertCircle size={16} color="#f43f5e" /> : 
                   <Bell size={16} color="rgba(255,255,255,0.5)" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', color: 'white', lineHeight: '1.4' }}>{n.message}</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem' }}>
                    {format(new Date(n.time), 'MMM d, h:mm a')}
                  </div>
                </div>
              </div>
            ))}
            <button 
              onClick={onClear}
              style={{ marginTop: '1rem', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', cursor: 'pointer', border: 'none', transition: 'background 0.2s' }}
            >
              Clear All History
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function CalendarView({ 
  tasks, 
  selectedDate, 
  onSelectDate 
}: { 
  tasks: Task[], 
  selectedDate: Date, 
  onSelectDate: (d: Date) => void 
}) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const dateFormat = "d";
  const days = [];
  let day = startDate;
  let formattedDate = "";

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, dateFormat);
      const cloneDay = day;
      
      const isCurrentMonth = isSameMonth(day, monthStart);
      const isDaySelected = isSameDay(day, selectedDate);
      const isTodayDate = isToday(day);
      
      const dayTasks = tasks.filter(t => isSameDay(parseISO(t.due_date), cloneDay) && !t.deleted_at);
      const pendingTasks = dayTasks.filter(t => !t.done);
      
      days.push(
        <div 
          className={`calendar-cell ${isCurrentMonth ? "active-month" : ""} ${isDaySelected ? "selected" : ""} ${isTodayDate ? "today" : ""}`} 
          key={day.toString()} 
          onClick={() => onSelectDate(cloneDay)}
        >
          <span className="calendar-date-num">{formattedDate}</span>
          <div className="calendar-indicators">
            {pendingTasks.slice(0, 4).map(t => (
              <div key={t.id} className={`cal-dot ${t.priority}`} title={t.title} />
            ))}
            {pendingTasks.length > 4 && <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>+</span>}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
  }

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="calendar-wrapper">
      <div className="calendar-header">
        <h3>{format(currentMonth, 'MMMM yyyy')}</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="calendar-nav-btn" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft size={16} /></button>
          <button className="calendar-nav-btn" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight size={16} /></button>
        </div>
      </div>
      <div className="calendar-grid">
        {weekDays.map(d => <div key={d} className="calendar-day-header">{d}</div>)}
        {days}
      </div>
    </div>
  );
}

function EditTaskModal({ task, onClose, onSave }: { task: Task, onClose: () => void, onSave: (t: Task) => void }) {
  const [title, setTitle] = useState(task.title);
  const [dueDate, setDueDate] = useState(task.due_date ? format(parseISO(task.due_date), 'yyyy-MM-dd') : '');
  const [dueTime, setDueTime] = useState(task.due_time || '');
  const [priority, setPriority] = useState(task.priority || 'med');
  const [tag, setTag] = useState(task.tag || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      ...task,
      title: title.trim(),
      due_date: new Date(dueDate).toISOString(),
      due_time: dueTime || null,
      priority,
      tag: tag.trim() || null,
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <motion.div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--color-text-inverse)' }}>Edit Entry</h2>
          <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.4)' }}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} aria-label="Edit task">
          <div>
            <label htmlFor="edit-task-title" className="sr-only">Task title</label>
            <input
              id="edit-task-title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Task title"
              required
              autoFocus
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '0.75rem',
                borderRadius: '8px',
                color: 'white',
                fontFamily: 'var(--font-sans)',
                fontSize: '1rem'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="edit-task-date" className="sr-only">Due Date</label>
              <input id="edit-task-date" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required 
                style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'white' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="edit-task-time" className="sr-only">Due Time</label>
              <input id="edit-task-time" type="time" value={dueTime} onChange={e => setDueTime(e.target.value)} 
                style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'white' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="edit-task-priority" className="sr-only">Priority</label>
              <select id="edit-task-priority" value={priority} onChange={e => setPriority(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'white' }}>
                <option value="low">Low Priority</option>
                <option value="med">Medium Priority</option>
                <option value="high">🚨 Important</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="edit-task-tag" className="sr-only">Tag</label>
              <input id="edit-task-tag" type="text" placeholder="#tag" value={tag} onChange={e => setTag(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'white' }} />
            </div>
          </div>
          <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} style={{ padding: '0.5rem 1rem', color: 'rgba(255,255,255,0.6)' }}>Cancel</button>
            <button type="submit" style={{ padding: '0.5rem 1.25rem', background: 'var(--color-accent-amber)', color: '#000', borderRadius: '6px', fontWeight: 600 }}>Save Changes</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState('today');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date());
  const [isLoaded, setIsLoaded] = useState(false);
  const [alerted1hTasks] = useState(() => new Set<string>());
  const [searchQuery, setSearchQuery] = useState('');

  // Wait for client to mount before reading localStorage
  const [showWelcome, setShowWelcome] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('ledger_hasSeenWelcome')) {
      setShowWelcome(true);
    }
  }, []);

  const dismissWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('ledger_hasSeenWelcome', 'true');
  };
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const searchRef = React.useRef<HTMLInputElement>(null);

  // Track mobile breakpoint
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Form State
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState('med');
  const [tag, setTag] = useState('work');

  // Notification Center State
  const [appNotifications, setAppNotifications] = useState<AppNotification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('ledger_notifications');
    if (stored) {
      try { setAppNotifications(JSON.parse(stored)); } catch (e) {}
    }
  }, []);

  const addNotification = (message: string, type: 'success' | 'alert' | 'default' = 'default') => {
    const newNotif: AppNotification = { id: Date.now().toString() + Math.random().toString(), message, time: new Date().toISOString(), read: false, type };
    setAppNotifications(prev => {
      const updated = [newNotif, ...prev].slice(0, 50); // Keep last 50
      localStorage.setItem('ledger_notifications', JSON.stringify(updated));
      return updated;
    });
    if (type === 'success') toast.success(message);
    else if (type === 'alert') toast(message, { icon: '🚨', duration: 6000 });
    else toast(message, { icon: '🔔' });
  };

  const markNotificationsRead = () => {
    const updated = appNotifications.map(n => ({ ...n, read: true }));
    setAppNotifications(updated);
    localStorage.setItem('ledger_notifications', JSON.stringify(updated));
  };

  const clearNotifications = () => {
    setAppNotifications([]);
    localStorage.removeItem('ledger_notifications');
  };

  const unreadCount = appNotifications.filter(n => !n.read).length;

  useEffect(() => {
    // Request notification permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }

    fetchTasks().then(() => setIsLoaded(true));
    const interval = setInterval(fetchTasks, 60000);
    return () => clearInterval(interval);
  }, []);

  // Check reminders whenever tasks change or every minute
  useEffect(() => {
    const checkReminders = () => {
      if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') return;

      const now = new Date();
      tasks.forEach(async (task) => {
        if (!task.done && !task.deleted_at && !task.notified && task.due_time) {
          const taskDate = new Date(`${task.due_date.split('T')[0]}T${task.due_time}`);
          if (taskDate <= now && taskDate.getTime() > now.getTime() - 5 * 60000) {
            // Task is due and was due within the last 5 minutes
            new Notification('Task Reminder', {
              body: `"${task.title}" is due now!`,
              icon: '/favicon.ico',
            });
            addNotification(`"${task.title}" is due now!`, 'alert');
            // Mark as notified locally
            setTasks(prev => prev.map(t => t.id === task.id ? { ...t, notified: true } : t));
            // Mark as notified in DB
            await fetch(`/api/tasks/${task.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ notified: true })
            });
          } else if (taskDate > now && taskDate.getTime() - now.getTime() <= 60 * 60000 && !alerted1hTasks.has(task.id)) {
            // Due in less than 1 hour, and we haven't alerted yet in this session
            alerted1hTasks.add(task.id);
            addNotification(`Only 1 hour left to complete: "${task.title}"!`, 'alert');
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              new Notification('Task Reminder', {
                body: `Only 1 hour left to complete: "${task.title}"!`,
                icon: '/favicon.ico',
              });
            }
          }
        }
      });
    };

    checkReminders();
    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [tasks]);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) setTasks(await res.json());
    } catch (e) { console.error('Failed to fetch tasks', e); }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          due_date: new Date(dueDate).toISOString(),
          due_time: dueTime || null,
          priority,
          tag: tag.trim() || null,
        })
      });
      if (res.ok) {
        const newTask = await res.json();
        setTasks(prev => [...prev, newTask]);
        addNotification('Task created!', 'success');
        setTitle('');
        setDueDate(format(new Date(), 'yyyy-MM-dd'));
        setDueTime('');
        setPriority('med');
        setTag('work');
      }
    } catch (e) { console.error(e); }
  };

  const toggleTask = async (id: string, done: boolean) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !done } : t));
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: !done })
    });
  };

  const updateTask = async (updatedTask: Task) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    addNotification('Task updated', 'success');
    await fetch(`/api/tasks/${updatedTask.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: updatedTask.title,
        due_date: new Date(updatedTask.due_date).toISOString(),
        due_time: updatedTask.due_time || null,
        priority: updatedTask.priority,
        tag: updatedTask.tag || null,
      })
    });
  };

  const deleteTask = async (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, deleted_at: new Date().toISOString() } : t));
    addNotification('Task moved to Trash', 'default');
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
  };

  const restoreTask = async (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, deleted_at: null } : t));
    addNotification('Task restored!', 'success');
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deleted_at: null })
    });
  };

  // Derived state
  const activeTasks = tasks.filter(t => !t.deleted_at);
  const deletedTasks = tasks.filter(t => !!t.deleted_at);
  const todayTasks = activeTasks.filter(t => isToday(parseISO(t.due_date)));
  const overdueTasks = activeTasks.filter(t => isPast(parseISO(t.due_date)) && !isToday(parseISO(t.due_date)) && !t.done);
  const completedToday = todayTasks.filter(t => t.done).length;
  const progressPercent = todayTasks.length === 0 ? 0 : (completedToday / todayTasks.length) * 100;

  const displayedTasks = (() => {
    let list: Task[];
    if (activeTab === 'today')    list = todayTasks;
    else if (activeTab === 'overdue')  list = overdueTasks;
    else if (activeTab === 'upcoming') list = activeTasks.filter(t => !isPast(parseISO(t.due_date)) && !isToday(parseISO(t.due_date)));
    else if (activeTab === 'calendar') list = activeTasks.filter(t => isSameDay(parseISO(t.due_date), selectedCalendarDate));
    else if (activeTab === 'trash')    list = deletedTasks;
    else list = activeTasks;

    // Apply search filter across title and tag
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.tag && t.tag.toLowerCase().includes(q))
      );
    }
    return list;
  })();

  const ringCircumference = 2 * Math.PI * 32;
  const ringOffset = ringCircumference - (progressPercent / 100) * ringCircumference;

  const itemVariants = {
    hidden: { opacity: 0, y: 16, scale: 0.98 },
    show:   { opacity: 1, y: 0,  scale: 1,   transition: { type: "spring" as const, stiffness: 500, damping: 35 } },
    exit:   { opacity: 0, scale: 0.96, transition: { duration: 0.15 } },
  };

  if (!isLoaded) return null;

  const emptyState = EMPTY_MESSAGES[activeTab] ?? { glyph: '◆', text: 'No tasks found.' };

  const switchTab = (id: string) => {
    setActiveTab(id);
    setIsSidebarOpen(false); // close sidebar on mobile after selecting
  };

  return (
    <div className="app-container">

      {/* ── Mobile top bar (brand + search only) ── */}
      <div className="mobile-topbar">
        <div className="mobile-brand">
          <div className="brand-dot" style={{ width: 8, height: 8 }} />
          Ledger
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="mobile-search-btn" onClick={() => setActiveTab(activeTab === 'calendar' ? 'today' : 'calendar')} title="Calendar">
            <Calendar size={18} color={activeTab === 'calendar' ? 'var(--color-accent-teal)' : 'currentColor'} />
          </button>
          <button className="mobile-search-btn" onClick={() => { setIsNotifOpen(true); markNotificationsRead(); }} title="Notifications" style={{ position: 'relative' }}>
            <Bell size={18} />
            {unreadCount > 0 && <span className="nav-badge" style={{ position: 'absolute', top: '0px', right: '0px', background: '#f43f5e', color: 'white', fontSize: '0.6rem', width: '14px', height: '14px' }}>{unreadCount}</span>}
          </button>
          <button className="mobile-search-btn" onClick={() => setIsHelpOpen(true)} title="Help">
            <Info size={18} />
          </button>
          <button
            className="mobile-search-btn"
            onClick={() => { setIsSearchOpen(o => !o); setTimeout(() => searchRef.current?.focus(), 100); }}
          >
            <Search size={18} />
          </button>
        </div>
      </div>

      {/* ── Desktop Top Nav ── */}
      <nav className="desktop-topbar">
        <div className="desktop-topbar-inner">
          <div className="desktop-brand">
            <div className="brand-dot" />
            Ledger
          </div>

          <ul className="desktop-nav-list">
            {[
              { id: 'today',    icon: LayoutDashboard, label: 'Today' },
              { id: 'upcoming', icon: CalendarDays,    label: 'Upcoming' },
              { id: 'overdue',  icon: AlertCircle,     label: 'Overdue', badge: overdueTasks.length, badgeClass: 'overdue' },
              { id: 'all',      icon: Archive,         label: 'All Tasks' },
              { id: 'trash',    icon: Trash2,          label: 'Recycle Bin', badge: deletedTasks.length, badgeClass: 'trash' },
            ].map(tab => (
              <Magnetic key={tab.id} strength={0.1}>
                <motion.li
                  whileTap={{ scale: 0.97 }}
                  className={`desktop-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <tab.icon size={15} />
                  {tab.label}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className={`nav-badge ${tab.badgeClass || ''}`}>
                      {tab.badge}
                    </motion.span>
                  )}
                  {activeTab === tab.id && (
                    <motion.div layoutId="desktop-active-bar" className="desktop-active-indicator"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                </motion.li>
              </Magnetic>
            ))}
          </ul>

          <div className="desktop-topbar-actions">
            <Magnetic strength={0.2}>
              <motion.button whileTap={{ scale: 0.95 }} className="action-btn" style={{ color: activeTab === 'calendar' ? 'var(--color-accent-teal)' : 'currentColor' }} onClick={() => setActiveTab(activeTab === 'calendar' ? 'today' : 'calendar')} title="Calendar">
                <Calendar size={16} />
              </motion.button>
            </Magnetic>
            <Magnetic strength={0.2}>
              <motion.button whileTap={{ scale: 0.95 }} className="action-btn" onClick={() => { setIsSearchOpen(o => !o); setTimeout(() => searchRef.current?.focus(), 100); }} title="Search">
                <Search size={16} />
              </motion.button>
            </Magnetic>
            <div className="action-divider" />
            <Magnetic strength={0.2}>
              <motion.button whileTap={{ scale: 0.95 }} className="action-btn" onClick={() => { setIsNotifOpen(true); markNotificationsRead(); }} title="Notifications" style={{ position: 'relative' }}>
                <Bell size={16} />
                {unreadCount > 0 && <span className="nav-badge" style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#f43f5e', color: 'white' }}>{unreadCount}</span>}
              </motion.button>
            </Magnetic>
            <Magnetic strength={0.2}>
              <motion.button whileTap={{ scale: 0.95 }} className="action-btn" onClick={() => setIsHelpOpen(true)} title="Instructions">
                <Info size={16} />
              </motion.button>
            </Magnetic>
            <div className="action-divider" style={{ margin: '0 8px' }} />
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="action-btn" style={{ padding: '0.25rem 0.75rem', borderRadius: '4px', background: 'var(--color-accent-teal)', color: '#000', fontWeight: 600 }}>Log In</button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </div>
        </div>
      </nav>

      {/* ── Main ── */}
      <main className="main-content">
        <div className="main-content-inner">

          {/* Header */}
          <motion.header
            className="header"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="header-date">
              <div className="day">{format(new Date(), 'dd')}</div>
              <div className="day-name">{format(new Date(), 'EEEE')}</div>
              <div className="month-year">{format(new Date(), 'MMMM yyyy').toUpperCase()}</div>
            </div>
            <div className="progress-container">
              <div className="task-progress">
                <div className="task-progress-numbers">
                  <span className="task-pending-count">
                    {todayTasks.length - completedToday}
                  </span>
                  <span className="task-pending-label">pending</span>
                </div>
                <div className="task-progress-bar-wrap">
                  <motion.div
                    className="task-progress-bar-fill"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: todayTasks.length === 0 ? 0 : progressPercent / 100 }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    style={{ transformOrigin: 'left' }}
                  />
                </div>
                <div className="task-progress-meta">
                  <span>{completedToday} done</span>
                  <span style={{ opacity: 0.3 }}>·</span>
                  <span>{todayTasks.length} total</span>
                </div>
              </div>
            </div>
          </motion.header>

          {/* Quick Add Form */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.25 }}
          >
            <SpotlightCard style={{ borderRadius: '12px', marginBottom: '2.5rem' }}>
              <form className="quick-add-form" onSubmit={handleAddTask} style={{ margin: 0, width: '100%' }} aria-label="Add new task">
                <div className="quick-add-inputs">
                  <label htmlFor="task-title" className="sr-only">Task title</label>
                  <input
                    id="task-title"
                    name="title"
                    type="text"
                    className="input-title"
                    placeholder="New entry — what needs doing?"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    autoFocus
                    required
                    autoComplete="off"
                  />
                  <div className="quick-add-meta">
                    <label htmlFor="task-due-date" className="sr-only">Due date</label>
                    <input
                      id="task-due-date"
                      name="due_date"
                      type="date"
                      value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                      required
                    />

                    <label htmlFor="task-due-time" className="sr-only">Due time</label>
                    <input
                      id="task-due-time"
                      name="due_time"
                      type="time"
                      value={dueTime}
                      onChange={e => setDueTime(e.target.value)}
                    />

                    <label htmlFor="task-priority" className="sr-only">Priority</label>
                    <select
                      id="task-priority"
                      name="priority"
                      value={priority}
                      onChange={e => setPriority(e.target.value)}
                    >
                      <option value="low">↓ Low</option>
                      <option value="med">— Med</option>
                      <option value="high">🚨 Important</option>
                    </select>

                    <label htmlFor="task-tag" className="sr-only">Tag</label>
                    <input
                      id="task-tag"
                      name="tag"
                      type="text"
                      placeholder="#tag"
                      value={tag}
                      onChange={e => setTag(e.target.value)}
                      style={{ width: '90px' }}
                      autoComplete="off"
                    />
                  </div>
                </div>
                <Magnetic strength={0.35}>
                  <motion.button type="submit" className="add-btn" whileTap={{ scale: 0.92 }}>
                    <Plus size={20} />
                    Add
                  </motion.button>
                </Magnetic>
              </form>
            </SpotlightCard>

          </motion.div>

          {showWelcome && <OnboardingSlideshow onComplete={dismissWelcome} />}

          {/* Search Bar + Section Header */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <span className="section-title">{SECTION_LABELS[activeTab]}</span>
              <div className="section-divider" />
              <span className="section-count">{displayedTasks.length}</span>

              {/* Search toggle button */}
              <Magnetic strength={0.3}>
                <motion.button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(o => !o);
                    if (!isSearchOpen) {
                      setTimeout(() => searchRef.current?.focus(), 120);
                    } else {
                      setSearchQuery('');
                    }
                  }}
                  whileTap={{ scale: 0.88 }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '0.4rem',
                    height: 30, padding: '0 0.75rem',
                    borderRadius: '6px',
                    background: isSearchOpen
                      ? 'rgba(245,158,11,0.2)'
                      : 'rgba(255,255,255,0.1)',
                    border: `1px solid ${isSearchOpen ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.2)'}`,
                    color: isSearchOpen ? 'var(--color-accent-amber)' : 'rgba(255,255,255,0.7)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    flexShrink: 0,
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.68rem',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                  title="Search tasks"
                >
                  {isSearchOpen ? <X size={12} /> : <Search size={12} />}
                  {isSearchOpen ? 'Close' : 'Search'}
                </motion.button>
              </Magnetic>

            </div>

            {/* Expandable search input */}
            <AnimatePresence>
              {isSearchOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -6 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -6 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(245,158,11,0.2)',
                    borderRadius: '8px',
                    padding: '0.5rem 0.85rem',
                    marginBottom: '0.75rem',
                    boxShadow: '0 0 0 3px rgba(245,158,11,0.05)',
                  }}>
                    <Search size={13} style={{ color: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
                    <input
                      ref={searchRef}
                      id="search-input"
                      name="search"
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search by title or tag…"
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: 'rgba(255,255,255,0.8)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.8rem',
                        letterSpacing: '0.02em',
                      }}
                    />
                    {searchQuery && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        type="button"
                        onClick={() => setSearchQuery('')}
                        style={{
                          display: 'flex', alignItems: 'center',
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: 'rgba(255,255,255,0.25)', padding: '0 2px',
                        }}
                      >
                        <X size={12} />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {activeTab === 'calendar' && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <CalendarView tasks={activeTasks} selectedDate={selectedCalendarDate} onSelectDate={setSelectedCalendarDate} />
            </motion.div>
          )}

          {/* Task List */}
          <div className="task-list">
            <AnimatePresence mode="popLayout">
              {displayedTasks.map(task => {
                const parsedDate = parseISO(task.due_date);
                const isTaskOverdue = isPast(parsedDate) && !isToday(parsedDate) && !task.done && !task.deleted_at;
                const daysOverdue = isTaskOverdue ? differenceInCalendarDays(new Date(), parsedDate) : 0;
                const priorityClass = task.priority !== 'med' ? `priority-${task.priority}` : '';

                return (
                  <motion.div
                    layout
                    key={task.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    style={{ borderRadius: '12px' }}
                  >
                    <SpotlightCard className={`task-card ${task.done ? 'completed' : ''} ${priorityClass}`}>
                      {/* Checkbox */}
                      <div className="checkbox-container">
                        <Magnetic strength={0.25}>
                          <motion.div
                            whileTap={{ scale: 0.82 }}
                            className={`checkbox ${task.done ? 'checked' : ''}`}
                            onClick={() => !task.deleted_at && toggleTask(task.id, task.done)}
                            style={{ cursor: task.deleted_at ? 'default' : 'pointer' }}
                          >
                            <AnimatePresence>
                              {task.done && (
                                <motion.svg
                                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                  width="15" height="15" viewBox="0 0 24 24"
                                  fill="none" stroke="white" strokeWidth="3"
                                  strokeLinecap="round" strokeLinejoin="round"
                                >
                                  <motion.path
                                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                                    transition={{ duration: 0.28, ease: "easeOut" }}
                                    d="M20 6L9 17l-5-5"
                                  />
                                </motion.svg>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        </Magnetic>
                      </div>

                      {/* Content */}
                      <div 
                        className="task-content" 
                        onClick={() => !task.deleted_at && setEditingTask(task)}
                        style={{ cursor: task.deleted_at ? 'default' : 'pointer' }}
                        title="Click to view/edit details"
                      >
                        <div className="task-title">{task.title}</div>
                        <div className="task-meta">
                          <span className="meta-item">
                            <Calendar size={12} />
                            {isToday(parsedDate) ? 'Today' : format(parsedDate, 'MMM d')}
                          </span>

                          {/* Overdue — calm, muted label. NOT alarm-red. */}
                          {daysOverdue > 0 && (
                            <span className="meta-overdue">
                              {daysOverdue}d late
                            </span>
                          )}

                          {task.due_time && (
                            <span className="meta-item" style={{ color: 'var(--color-accent-amber)' }}>
                              <Clock size={12} /> {task.due_time}
                            </span>
                          )}

                          {/* Priority dot / alert instead of verbose text */}
                          {task.priority === 'low' && (
                            <span className="priority-dot low" title="Low priority" />
                          )}
                          {task.priority === 'high' && (
                            <span className="meta-item priority-alert" title="Important!">
                              <AlertCircle size={11} /> Important
                            </span>
                          )}

                          {task.tag && (
                            <span className="meta-tag">
                              <TagIcon size={10} /> {task.tag}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="task-actions">
                        <Magnetic strength={0.35}>
                          {task.deleted_at ? (
                            <motion.button
                              whileTap={{ scale: 0.88 }}
                              type="button"
                              className="action-btn restore"
                              onClick={() => restoreTask(task.id)}
                              title="Restore"
                            >
                              <RefreshCcw size={15} />
                            </motion.button>
                          ) : (
                            <>
                              <Magnetic strength={0.3}>
                                <motion.button
                                  whileTap={{ scale: 0.88 }}
                                  type="button"
                                  className="action-btn"
                                  onClick={() => setEditingTask(task)}
                                  title="Edit Task"
                                >
                                  <Pencil size={15} />
                                </motion.button>
                              </Magnetic>
                              <Magnetic strength={0.3}>
                                <motion.button
                                  whileTap={{ scale: 0.88 }}
                                  type="button"
                                  className="action-btn delete"
                                  onClick={() => deleteTask(task.id)}
                                  title="Move to Recycle Bin"
                                >
                                  <Trash2 size={15} />
                                </motion.button>
                              </Magnetic>
                            </>
                          )}
                        </Magnetic>
                      </div>
                    </SpotlightCard>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Empty state — with character, tied to the ledger metaphor */}
            {displayedTasks.length === 0 && (
              <motion.div
                className="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="empty-state-glyph">{emptyState.glyph}</div>
                <div className="empty-state-text">{emptyState.text}</div>
              </motion.div>
            )}
          </div>

        </div>
      </main>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="mobile-bottom-nav">
        {[
          { id: 'today',    icon: LayoutDashboard, label: 'Today' },
          { id: 'upcoming', icon: CalendarDays,    label: 'Upcoming' },
          { id: 'overdue',  icon: AlertCircle,     label: 'Overdue',  badge: overdueTasks.length },
          { id: 'all',      icon: Archive,         label: 'All' },
          { id: 'trash',    icon: Trash2,          label: 'Bin',      badge: deletedTasks.length },
        ].map(tab => (
          <button
            key={tab.id}
            className={`bottom-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <div className="bottom-tab-icon">
              <tab.icon size={20} />
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="bottom-tab-badge">{tab.badge}</span>
              )}
            </div>
            <span className="bottom-tab-label">{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="bottom-active-bar"
                className="bottom-tab-indicator"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
          </button>
        ))}
      </nav>

      <AnimatePresence>
        {editingTask && (
          <EditTaskModal
            task={editingTask}
            onClose={() => setEditingTask(null)}
            onSave={(t) => {
              updateTask(t);
              setEditingTask(null);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isHelpOpen && <InstructionsModal onClose={() => setIsHelpOpen(false)} />}
        {isNotifOpen && (
          <NotificationCenterModal 
            notifications={appNotifications}
            onClose={() => setIsNotifOpen(false)}
            onClear={clearNotifications}
          />
        )}
      </AnimatePresence>
      <Toaster 
        position="bottom-center" 
        toastOptions={{
          style: {
            background: 'rgba(11, 15, 25, 0.95)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.9rem'
          }
        }} 
      />
    </div>
  );
}
