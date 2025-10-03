import { Plus, History, Settings, Calendar, Trash2, CheckCircle, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'

// Types
interface OliEntry {
  id: string
  type: 'mesin' | 'gardan'
  date: string
  notes: string
  nextDate: string
  daysLeft: number
}

interface Settings {
  reminderDays: number
  notifications: boolean
  oliMesinInterval: number
  oliGardanInterval: number
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning'
  message: string
  duration?: number
}

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'add' | 'history' | 'settings'>('dashboard')
  const [selectedOli, setSelectedOli] = useState<'mesin' | 'gardan'>('mesin')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [history, setHistory] = useState<OliEntry[]>([])
  const [settings, setSettings] = useState<Settings>({
    reminderDays: 3,
    notifications: true,
    oliMesinInterval: 30,
    oliGardanInterval: 60
  })
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [modalConfig, setModalConfig] = useState<{
    type: 'delete' | 'reset'
    title: string
    message: string
    onConfirm: () => void
  } | null>(null)

  // Add notification
  const addNotification = (type: Notification['type'], message: string, duration = 3000) => {
    const id = Date.now().toString()
    setNotifications(prev => [...prev, { id, type, message, duration }])
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(notif => notif.id !== id))
    }, duration)
  }

  // Show confirmation modal
  const showModal = (type: 'delete' | 'reset', title: string, message: string, onConfirm: () => void) => {
    setModalConfig({ type, title, message, onConfirm })
    setShowConfirmModal(true)
  }

  // Load data from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('oliHistory')
    const savedSettings = localStorage.getItem('oliSettings')
    
    if (savedHistory) setHistory(JSON.parse(savedHistory))
    if (savedSettings) setSettings(JSON.parse(savedSettings))
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('oliHistory', JSON.stringify(history))
  }, [history])

  useEffect(() => {
    localStorage.setItem('oliSettings', JSON.stringify(settings))
  }, [settings])

  // Calculate next oli dates
  const calculateOliData = () => {
    const today = new Date()
    const latestMesin = history.filter(h => h.type === 'mesin').sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0]
    
    const latestGardan = history.filter(h => h.type === 'gardan').sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0]

    const mesinNextDate = latestMesin 
      ? new Date(new Date(latestMesin.date).getTime() + settings.oliMesinInterval * 24 * 60 * 60 * 1000)
      : new Date(today.getTime() + settings.oliMesinInterval * 24 * 60 * 60 * 1000)
    
    const gardanNextDate = latestGardan 
      ? new Date(new Date(latestGardan.date).getTime() + settings.oliGardanInterval * 24 * 60 * 60 * 1000)
      : new Date(today.getTime() + settings.oliGardanInterval * 24 * 60 * 60 * 1000)

    const mesinDaysLeft = Math.ceil((mesinNextDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000))
    const gardanDaysLeft = Math.ceil((gardanNextDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000))

    return {
      mesin: {
        nextDate: mesinNextDate.toISOString().split('T')[0],
        daysLeft: mesinDaysLeft > 0 ? mesinDaysLeft : 0,
        interval: settings.oliMesinInterval
      },
      gardan: {
        nextDate: gardanNextDate.toISOString().split('T')[0],
        daysLeft: gardanDaysLeft > 0 ? gardanDaysLeft : 0,
        interval: settings.oliGardanInterval
      }
    }
  }

  const oliData = calculateOliData()

  // Add new oli entry
  const handleAddEntry = () => {
    if (!date) {
      addNotification('error', 'Pilih tanggal ganti oli terlebih dahulu!')
      return
    }

    const newEntry: OliEntry = {
      id: Date.now().toString(),
      type: selectedOli,
      date,
      notes,
      nextDate: oliData[selectedOli].nextDate,
      daysLeft: oliData[selectedOli].daysLeft
    }

    setHistory(prev => [newEntry, ...prev])
    setDate(new Date().toISOString().split('T')[0])
    setNotes('')
    setCurrentView('dashboard')
    
    addNotification('success', `Oli ${selectedOli === 'mesin' ? 'Mesin' : 'Gardan'} berhasil dicatat! 🎉`)
  }

  // Delete history entry
  const handleDeleteEntry = (id: string) => {
    showModal('delete', 'Hapus Riwayat', 'Apakah Anda yakin ingin menghapus riwayat ini?', () => {
      setHistory(prev => prev.filter(entry => entry.id !== id))
      addNotification('success', 'Riwayat berhasil dihapus!')
    })
  }

  // Reset all data
  const handleResetData = () => {
    showModal('reset', 'Hapus Semua Data', 'Tindakan ini akan menghapus SEMUA data dan tidak dapat dibatalkan! Yakin ingin melanjutkan?', () => {
      setHistory([])
      localStorage.removeItem('oliHistory')
      addNotification('success', 'Semua data berhasil dihapus!')
    })
  }

  // Styles dengan tema hitam putih elegan
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    padding: '16px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    position: 'relative' as const,
    overflow: 'hidden'
  },
  innerContainer: {
    maxWidth: '400px',
    margin: '0 auto',
    width: '100%',
    position: 'relative' as const,
    zIndex: 1
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '24px'
  },
  title: {
    fontSize: 'clamp(28px, 8vw, 32px)',
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: '16px'
  },
  subtitle: {
    color: '#64748b',
    marginTop: '8px',
    fontSize: 'clamp(14px, 4vw, 16px)'
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: 'clamp(16px, 4vw, 24px)',
    marginBottom: '16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e2e8f0'
  },
  cardGardan: {
    borderLeft: '4px solid #ea580c'
  },
  cardTitle: {
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '4px',
    fontSize: 'clamp(16px, 4vw, 18px)'
  },
  cardSubtitle: {
    fontSize: 'clamp(12px, 3vw, 14px)',
    color: '#64748b',
    marginBottom: '8px'
  },
  cardNext: {
    fontSize: 'clamp(11px, 3vw, 12px)',
    color: '#16a34a',
    marginTop: '4px'
  },
  badge: {
    background: '#1e293b',
    color: 'white',
    fontSize: 'clamp(11px, 3vw, 12px)',
    padding: '6px 12px',
    borderRadius: '20px',
    whiteSpace: 'nowrap' as const,
    fontWeight: '600'
  },
  badgeGardan: {
    background: '#ea580c',
    color: 'white'
  },
  badgeWarning: {
    background: '#d97706',
    color: 'white'
  },
  badgeDanger: {
    background: '#dc2626',
    color: 'white'
  },
  button: {
    border: 'none',
    padding: 'clamp(12px, 4vw, 16px)',
    borderRadius: '12px',
    width: '100%',
    fontSize: 'clamp(14px, 4vw, 16px)',
    fontWeight: '600',
    marginBottom: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.3s ease'
  },
  buttonPrimary: {
    background: '#1e293b',
    color: 'white',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  },
  buttonSecondary: {
    background: 'white',
    color: '#374151',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    border: '1px solid #d1d5db'
  },
  buttonDanger: {
    background: '#dc2626',
    color: 'white',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  },
  stats: {
    background: 'white',
    borderRadius: '16px',
    padding: 'clamp(12px, 4vw, 16px)',
    marginTop: '24px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0'
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '12px',
    fontSize: '16px',
    marginBottom: '16px',
    background: 'white',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
  },
  textarea: {
    width: '100%',
    padding: '14px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '12px',
    fontSize: '16px',
    marginBottom: '16px',
    minHeight: '80px',
    resize: 'vertical' as const,
    fontFamily: 'inherit',
    background: 'white',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
  },
  select: {
    width: '100%',
    padding: '14px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '12px',
    fontSize: '16px',
    marginBottom: '16px',
    background: 'white',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
  },
  backButton: {
    color: '#374151',
    marginBottom: '16px',
    background: 'white',
    border: '1px solid #d1d5db',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    borderRadius: '12px',
    transition: 'all 0.3s ease'
  },
  historyItem: {
    background: 'white',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '12px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    borderLeft: '4px solid #1e293b',
    transition: 'all 0.3s ease'
  },
  historyItemGardan: {
    borderLeft: '4px solid #ea580c'
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '40px 20px',
    color: '#64748b'
  },
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modalContent: {
    background: 'white',
    borderRadius: '20px',
    padding: '24px',
    maxWidth: '400px',
    width: '100%',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    border: '1px solid #e2e8f0'
  },
  notificationContainer: {
    position: 'fixed' as const,
    top: '20px',
    right: '20px',
    zIndex: 1001,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
    maxWidth: '400px'
  },
  notification: {
    background: 'white',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  }
}

  // Dashboard View
  if (currentView === 'dashboard') {
    const getBadgeStyle = (daysLeft: number) => {
      if (daysLeft <= 3) return styles.badgeDanger
      if (daysLeft <= 7) return styles.badgeWarning
      return daysLeft <= 14 ? styles.badgeWarning : styles.badge
    }

    return (
      <div style={styles.container}>
        <div style={styles.innerContainer}>
          {/* Header */}
          <div style={styles.header}>
            <h1 style={styles.title}>🏍️ OliReminder</h1>
            <p style={styles.subtitle}>
              {new Date().toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          {/* Status Cards */}
          <div>
            {/* Oli Mesin Card */}
            <div style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={styles.cardTitle}>Oli Mesin</h3>
                  <p style={styles.cardSubtitle}>Ganti setiap {settings.oliMesinInterval} hari</p>
                  <p style={styles.cardNext}>
                    ● Next: {new Date(oliData.mesin.nextDate).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <span style={{...styles.badge, ...getBadgeStyle(oliData.mesin.daysLeft)}}>
                  {oliData.mesin.daysLeft === 0 ? 'HARI INI!' : 
                   oliData.mesin.daysLeft === 1 ? 'BESOK!' : 
                   `${oliData.mesin.daysLeft} hari lagi`}
                </span>
              </div>
            </div>

            {/* Oli Gardan Card */}
            <div style={{...styles.card, ...styles.cardGardan}}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={styles.cardTitle}>Oli Gardan</h3>
                  <p style={styles.cardSubtitle}>Ganti setiap {settings.oliGardanInterval} hari</p>
                  <p style={styles.cardNext}>
                    ● Next: {new Date(oliData.gardan.nextDate).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <span style={{...styles.badgeGardan, ...getBadgeStyle(oliData.gardan.daysLeft)}}>
                  {oliData.gardan.daysLeft === 0 ? 'HARI INI!' : 
                   oliData.gardan.daysLeft === 1 ? 'BESOK!' : 
                   `${oliData.gardan.daysLeft} hari lagi`}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div>
            <button 
              onClick={() => setCurrentView('add')}
              style={{...styles.button, ...styles.buttonPrimary}}
            >
              <Plus size={20} />
              Catat Ganti Oli
            </button>
            
            <button 
              onClick={() => setCurrentView('history')}
              style={{...styles.button, ...styles.buttonSecondary}}
            >
              <History size={20} />
              Riwayat Maintenance
            </button>

            <button 
              onClick={() => setCurrentView('settings')}
              style={{...styles.button, ...styles.buttonSecondary}}
            >
              <Settings size={20} />
              Pengaturan
            </button>
          </div>

          {/* Quick Stats */}
          <div style={styles.stats}>
            <h3 style={{...styles.cardTitle, marginBottom: '12px'}}>📊 Statistik</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(12px, 4vw, 16px)', textAlign: 'center' as const }}>
              <div>
                <p style={{ fontSize: 'clamp(20px, 6vw, 24px)', fontWeight: 'bold', color: '#3b82f6' }}>{history.length}</p>
                <p style={{ fontSize: 'clamp(11px, 3vw, 12px)', color: '#6b7280' }}>Total Ganti Oli</p>
              </div>
              <div>
                <p style={{ fontSize: 'clamp(20px, 6vw, 24px)', fontWeight: 'bold', color: '#16a34a' }}>
                  {history.filter(h => h.daysLeft > 0).length}
                </p>
                <p style={{ fontSize: 'clamp(11px, 3vw, 12px)', color: '#6b7280' }}>Masih Berlaku</p>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div style={styles.notificationContainer}>
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              style={{
                ...styles.notification,
                borderLeft: `4px solid ${
                  notification.type === 'success' ? '#10b981' :
                  notification.type === 'error' ? '#ef4444' :
                  '#f59e0b'
                }`
              }}
            >
              {notification.type === 'success' ? (
                <CheckCircle size={20} color="#10b981" />
              ) : notification.type === 'error' ? (
                <AlertCircle size={20} color="#ef4444" />
              ) : (
                <AlertCircle size={20} color="#f59e0b" />
              )}
              <span style={{ flex: 1, color: '#1f2937' }}>{notification.message}</span>
            </div>
          ))}
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && modalConfig && (
          <div style={styles.modalOverlay} onClick={() => setShowConfirmModal(false)}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: modalConfig.type === 'delete' ? 
                    'linear-gradient(135deg, #ef4444, #dc2626)' : 
                    'linear-gradient(135deg, #f59e0b, #d97706)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <AlertCircle size={24} color="white" />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
                  {modalConfig.title}
                </h3>
                <p style={{ color: '#6b7280', lineHeight: '1.5' }}>
                  {modalConfig.message}
                </p>
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  style={{
                    ...styles.button,
                    ...styles.buttonSecondary,
                    flex: 1,
                    marginBottom: 0
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    modalConfig.onConfirm()
                    setShowConfirmModal(false)
                  }}
                  style={{
                    ...styles.button,
                    ...(modalConfig.type === 'delete' ? styles.buttonDanger : {
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: 'white'
                    }),
                    flex: 1,
                    marginBottom: 0
                  }}
                >
                  Ya, Lanjutkan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Add Entry View
  if (currentView === 'add') {
    return (
      <div style={styles.container}>
        <div style={styles.innerContainer}>
          <button 
            onClick={() => setCurrentView('dashboard')}
            style={styles.backButton}
          >
            ← Kembali
          </button>

          <h1 style={{...styles.title, marginTop: 0, textAlign: 'left'}}>📝 Catat Ganti Oli</h1>

          {/* Oli Type Selection */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            <button
  onClick={() => setSelectedOli('mesin')}
  style={{
    padding: '20px 12px',
    border: `2px solid ${selectedOli === 'mesin' ? '#1e293b' : '#d1d5db'}`,
    background: selectedOli === 'mesin' ? '#1e293b' : 'white',
    borderRadius: '16px',
    cursor: 'pointer',
    textAlign: 'center' as const,
    color: selectedOli === 'mesin' ? 'white' : '#374151',
    transition: 'all 0.3s ease'
  }}
>
  <div style={{ fontSize: '32px', marginBottom: '8px' }}>🛢️</div>
  <div style={{ fontWeight: '600', fontSize: '16px' }}>Oli Mesin</div>
  <div style={{ fontSize: '12px', opacity: 0.8 }}>{settings.oliMesinInterval} hari</div>
</button>

<button
  onClick={() => setSelectedOli('gardan')}
  style={{
    padding: '20px 12px',
    border: `2px solid ${selectedOli === 'gardan' ? '#ea580c' : '#d1d5db'}`,
    background: selectedOli === 'gardan' ? '#ea580c' : 'white',
    borderRadius: '16px',
    cursor: 'pointer',
    textAlign: 'center' as const,
    color: selectedOli === 'gardan' ? 'white' : '#374151',
    transition: 'all 0.3s ease'
  }}
>
  <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚙️</div>
  <div style={{ fontWeight: '600', fontSize: '16px' }}>Oli Gardan</div>
  <div style={{ fontSize: '12px', opacity: 0.8 }}>{settings.oliGardanInterval} hari</div>
</button>
          </div>

          {/* Date Input */}
          <div style={styles.card}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              📅 Tanggal Ganti Oli
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={styles.input}
            />
          </div>

          {/* Notes Input */}
          <div style={styles.card}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              📝 Catatan (opsional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Oli merek X, km saat ini 15.000..."
              style={styles.textarea}
            />
          </div>

          {/* Submit Button */}
          <button 
            onClick={handleAddEntry}
            style={{
              ...styles.button, 
              ...styles.buttonPrimary,
              background: 'linear-gradient(135deg, #10b981, #059669)'
            }}
          >
            💾 Simpan Catatan
          </button>
        </div>

        {/* Notifications */}
        <div style={styles.notificationContainer}>
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              style={{
                ...styles.notification,
                borderLeft: `4px solid ${
                  notification.type === 'success' ? '#10b981' :
                  notification.type === 'error' ? '#ef4444' :
                  '#f59e0b'
                }`
              }}
            >
              {notification.type === 'success' ? (
                <CheckCircle size={20} color="#10b981" />
              ) : notification.type === 'error' ? (
                <AlertCircle size={20} color="#ef4444" />
              ) : (
                <AlertCircle size={20} color="#f59e0b" />
              )}
              <span style={{ flex: 1, color: '#1f2937' }}>{notification.message}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // History View
if (currentView === 'history') {
  return (
    <div style={styles.container}>
      <div style={styles.innerContainer}>
        <button 
          onClick={() => setCurrentView('dashboard')}
          style={styles.backButton}
        >
          ← Kembali
        </button>

        <h1 style={{...styles.title, marginTop: 0, textAlign: 'left'}}>📋 Riwayat Maintenance</h1>

        {history.length === 0 ? (
<div style={{
  ...styles.emptyState,
  background: 'white',
  borderRadius: '16px',
  border: '1px solid #e2e8f0'
}}>
  <Calendar size={48} style={{ margin: '0 auto 16px', color: '#9ca3af' }} />
  <h3 style={{ color: '#374151', marginBottom: '8px' }}>Belum ada riwayat</h3>
  <p style={{ color: '#6b7280', marginBottom: '24px' }}>Catat ganti oli pertama Anda</p>
  <button 
    onClick={() => setCurrentView('add')}
    style={{
      ...styles.button, 
      ...styles.buttonPrimary, 
      maxWidth: '200px', 
      margin: '0 auto'
    }}
  >
    ➕ Tambah Catatan
  </button>
</div>
        ) : (
          <div>
            {history.map((entry, index) => (
              <div 
                key={entry.id} 
                style={{
                  ...styles.historyItem,
                  ...(entry.type === 'gardan' ? styles.historyItemGardan : {})
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: entry.type === 'mesin' ? 
                          'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 
                          'linear-gradient(135deg, #ea580c, #c2410c)'
                      }} />
                      <span style={{ fontWeight: '600', color: '#1f2937', fontSize: '16px' }}>
                        {entry.type === 'mesin' ? 'Oli Mesin' : 'Oli Gardan'}
                      </span>
                    </div>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                      🗓️ {new Date(entry.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                      ⏱️ Next: {new Date(entry.nextDate).toLocaleDateString('id-ID')}
                    </p>
                    {entry.notes && (
                      <p style={{ 
                        fontSize: '12px', 
                        color: '#6b7280', 
                        fontStyle: 'italic',
                        background: 'rgba(59, 130, 246, 0.1)',
                        padding: '8px',
                        borderRadius: '8px',
                        marginTop: '8px'
                      }}>
                        📝 {entry.notes}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    style={{
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '8px',
                      transition: 'all 0.3s ease'
                    }}
                    title="Hapus"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            
            {/* Clear All Button */}
            {history.length > 0 && (
              <button 
                onClick={() => handleResetData()}
                style={{
                  ...styles.button, 
                  ...styles.buttonDanger, 
                  marginTop: '16px',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)'
                }}
              >
                🗑️ Hapus Semua Riwayat
              </button>
            )}
          </div>
        )}
      </div>

      {/* Notifications */}
      <div style={styles.notificationContainer}>
        {notifications.map((notification) => (
          <div 
            key={notification.id} 
            style={{
              ...styles.notification,
              borderLeft: `4px solid ${
                notification.type === 'success' ? '#10b981' :
                notification.type === 'error' ? '#ef4444' :
                '#f59e0b'
              }`
            }}
          >
            {notification.type === 'success' ? (
              <CheckCircle size={20} color="#10b981" />
            ) : notification.type === 'error' ? (
              <AlertCircle size={20} color="#ef4444" />
            ) : (
              <AlertCircle size={20} color="#f59e0b" />
            )}
            <span style={{ flex: 1, color: '#1f2937' }}>{notification.message}</span>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && modalConfig && (
        <div style={styles.modalOverlay} onClick={() => setShowConfirmModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: modalConfig.type === 'delete' ? 
                  'linear-gradient(135deg, #ef4444, #dc2626)' : 
                  'linear-gradient(135deg, #f59e0b, #d97706)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <AlertCircle size={24} color="white" />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
                {modalConfig.title}
              </h3>
              <p style={{ color: '#6b7280', lineHeight: '1.5' }}>
                {modalConfig.message}
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowConfirmModal(false)}
                style={{
                  ...styles.button,
                  ...styles.buttonSecondary,
                  flex: 1,
                  marginBottom: 0
                }}
              >
                Batal
              </button>
              <button
                onClick={() => {
                  modalConfig.onConfirm()
                  setShowConfirmModal(false)
                }}
                style={{
                  ...styles.button,
                  ...(modalConfig.type === 'delete' ? styles.buttonDanger : {
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: 'white'
                  }),
                  flex: 1,
                  marginBottom: 0
                }}
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
  // Settings View
if (currentView === 'settings') {
  return (
    <div style={styles.container}>
      <div style={styles.innerContainer}>
        <button 
          onClick={() => setCurrentView('dashboard')}
          style={styles.backButton}
        >
          ← Kembali
        </button>

        <h1 style={{...styles.title, marginTop: 0, textAlign: 'left'}}>⚙️ Pengaturan</h1>

        {/* Reminder Settings */}
        <div style={styles.card}>
          <h3 style={{...styles.cardTitle, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
            🔔 Pengaturan Reminder
          </h3>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Ingatkan berapa hari sebelumnya
            </label>
            <select 
              value={settings.reminderDays}
              onChange={(e) => setSettings(prev => ({...prev, reminderDays: Number(e.target.value)}))}
              style={styles.select}
            >
              <option value={1}>1 hari sebelumnya</option>
              <option value={2}>2 hari sebelumnya</option>
              <option value={3}>3 hari sebelumnya</option>
              <option value={7}>7 hari sebelumnya</option>
            </select>
          </div>
        </div>

        {/* Interval Settings */}
        <div style={styles.card}>
          <h3 style={{...styles.cardTitle, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
            ⏱️ Interval Ganti Oli
          </h3>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              🛢️ Oli Mesin (hari)
            </label>
            <input
              type="number"
              value={settings.oliMesinInterval}
              onChange={(e) => setSettings(prev => ({...prev, oliMesinInterval: Number(e.target.value)}))}
              style={styles.input}
              min="1"
              max="365"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              ⚙️ Oli Gardan (hari)
            </label>
            <input
              type="number"
              value={settings.oliGardanInterval}
              onChange={(e) => setSettings(prev => ({...prev, oliGardanInterval: Number(e.target.value)}))}
              style={styles.input}
              min="1"
              max="365"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={styles.card}>
          <h3 style={{...styles.cardTitle, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
            🛠️ Lainnya
          </h3>
          
          <button 
            onClick={() => {
              const dataStr = JSON.stringify(history, null, 2)
              const dataBlob = new Blob([dataStr], { type: 'application/json' })
              const url = URL.createObjectURL(dataBlob)
              const link = document.createElement('a')
              link.href = url
              link.download = `oli-reminder-backup-${new Date().toISOString().split('T')[0]}.json`
              link.click()
              URL.revokeObjectURL(url)
              addNotification('success', 'Data berhasil di-export! 📥')
            }}
            style={{
              ...styles.button, 
              ...styles.buttonSecondary, 
              marginBottom: '12px',
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              color: 'white'
            }}
          >
            📤 Export Data
          </button>

          <button 
            onClick={() => handleResetData()}
            style={{
              ...styles.button, 
              ...styles.buttonDanger,
              background: 'linear-gradient(135deg, #ef4444, #dc2626)'
            }}
          >
            🗑️ Hapus Semua Data
          </button>
        </div>

        {/* App Info */}
        <div style={{ 
          textAlign: 'center', 
          color: 'rgba(255,255,255,0.8)', 
          fontSize: '14px', 
          marginTop: '32px',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          padding: '20px',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <p style={{ fontWeight: '600', marginBottom: '4px' }}>OliReminder v1.0.0</p>
          <p>Dibuat dengan ❤️ untuk para rider</p>
        </div>
      </div>

      {/* Notifications */}
      <div style={styles.notificationContainer}>
        {notifications.map((notification) => (
          <div 
            key={notification.id} 
            style={{
              ...styles.notification,
              borderLeft: `4px solid ${
                notification.type === 'success' ? '#10b981' :
                notification.type === 'error' ? '#ef4444' :
                '#f59e0b'
              }`
            }}
          >
            {notification.type === 'success' ? (
              <CheckCircle size={20} color="#10b981" />
            ) : notification.type === 'error' ? (
              <AlertCircle size={20} color="#ef4444" />
            ) : (
              <AlertCircle size={20} color="#f59e0b" />
            )}
            <span style={{ flex: 1, color: '#1f2937' }}>{notification.message}</span>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && modalConfig && (
        <div style={styles.modalOverlay} onClick={() => setShowConfirmModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: modalConfig.type === 'delete' ? 
                  'linear-gradient(135deg, #ef4444, #dc2626)' : 
                  'linear-gradient(135deg, #f59e0b, #d97706)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <AlertCircle size={24} color="white" />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
                {modalConfig.title}
              </h3>
              <p style={{ color: '#6b7280', lineHeight: '1.5' }}>
                {modalConfig.message}
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowConfirmModal(false)}
                style={{
                  ...styles.button,
                  ...styles.buttonSecondary,
                  flex: 1,
                  marginBottom: 0
                }}
              >
                Batal
              </button>
              <button
                onClick={() => {
                  modalConfig.onConfirm()
                  setShowConfirmModal(false)
                }}
                style={{
                  ...styles.button,
                  ...(modalConfig.type === 'delete' ? styles.buttonDanger : {
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: 'white'
                  }),
                  flex: 1,
                  marginBottom: 0
                }}
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

  return (
    <div style={styles.container}>
      <div style={styles.innerContainer}>
        <div style={{ textAlign: 'center', color: 'white', padding: '40px 20px' }}>
          <h1 style={styles.title}>OliReminder</h1>
          <p style={styles.subtitle}>Aplikasi pengingat ganti oli motor</p>
          <button 
            onClick={() => setCurrentView('dashboard')}
            style={{...styles.button, ...styles.buttonPrimary, maxWidth: '200px', margin: '20px auto'}}
          >
            Mulai
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
