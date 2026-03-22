'use client'

import { useState, useEffect } from 'react'
import {
  User,
  Palette,
  Brain,
  Database,
  Shield,
  Save,
  Loader2,
  Check,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Mic,
} from 'lucide-react'
import {
  getProfile,
  updateProfile,
  changePassword,
  checkOllamaStatus,
  getDatabaseStats,
} from '@/app/actions/settings.actions'

interface Profile {
  id: string
  name: string
  email: string
  timezone: string
  avatar: string | null
  createdAt: string
}

interface OllamaStatus {
  available: boolean
  models: {
    general: string
    structured: string
    embed: string
  }
}

interface DbStats {
  tasks: number
  pages: number
  files: number
  conversations: number
  productions: number
  habits: number
}

const TIMEZONES = [
  'Asia/Kolkata',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
  'Pacific/Auckland',
]

export default function SettingsView() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus | null>(null)
  const [dbStats, setDbStats] = useState<DbStats | null>(null)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  // Profile form
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [timezone, setTimezone] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Voice shortcut
  const [voiceShortcut, setVoiceShortcut] = useState<string>('')
  const [isRecordingShortcut, setIsRecordingShortcut] = useState(false)

  // Password form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadData()
    // Load voice shortcut from localStorage
    const saved = localStorage.getItem('athena-voice-shortcut')
    setVoiceShortcut(saved || 'Ctrl+Shift+V')
  }, [])

  async function loadData() {
    const [profileResult, ollamaResult, statsResult] = await Promise.all([
      getProfile(),
      checkOllamaStatus(),
      getDatabaseStats(),
    ])

    if (profileResult.success) {
      const p = profileResult.data as Profile
      setProfile(p)
      setName(p.name)
      setEmail(p.email)
      setTimezone(p.timezone)
    }

    if (ollamaResult.success) {
      setOllamaStatus(ollamaResult.data as OllamaStatus)
    }

    if (statsResult.success) {
      setDbStats(statsResult.data as DbStats)
    }
  }

  async function handleProfileSave() {
    setProfileSaving(true)
    setProfileMessage(null)
    try {
      const result = await updateProfile({ name, email, timezone })
      if (result.success) {
        setProfileMessage({ type: 'success', text: 'Profile updated successfully' })
      } else {
        setProfileMessage({ type: 'error', text: result.error })
      }
    } catch {
      setProfileMessage({ type: 'error', text: 'Failed to update profile' })
    } finally {
      setProfileSaving(false)
    }
  }

  async function handlePasswordChange() {
    setPasswordSaving(true)
    setPasswordMessage(null)

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match' })
      setPasswordSaving(false)
      return
    }

    if (newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 8 characters' })
      setPasswordSaving(false)
      return
    }

    try {
      const result = await changePassword(currentPassword, newPassword)
      if (result.success) {
        setPasswordMessage({ type: 'success', text: 'Password changed successfully' })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setPasswordMessage({ type: 'error', text: result.error })
      }
    } catch {
      setPasswordMessage({ type: 'error', text: 'Failed to change password' })
    } finally {
      setPasswordSaving(false)
    }
  }

  async function handleRefreshOllama() {
    const result = await checkOllamaStatus()
    if (result.success) {
      setOllamaStatus(result.data as OllamaStatus)
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-[#F1F1F3]">Settings</h1>
        <p className="mt-1 text-sm text-[#9CA3AF]">
          Manage your account and application preferences
        </p>
      </div>

      <div className="space-y-4">
        {/* Profile Section */}
        <SettingsSection
          icon={<User className="h-5 w-5" />}
          title="Profile"
          description="Update your name, email, and timezone"
        >
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#F1F1F3]">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-[#2D2D3A] bg-[#0F0F14] px-3 py-2 text-sm text-[#F1F1F3] outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#F1F1F3]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[#2D2D3A] bg-[#0F0F14] px-3 py-2 text-sm text-[#F1F1F3] outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#F1F1F3]">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full rounded-lg border border-[#2D2D3A] bg-[#0F0F14] px-3 py-2 text-sm text-[#F1F1F3] outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
            {profileMessage && (
              <div
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                  profileMessage.type === 'success'
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-red-500/10 text-red-400'
                }`}
              >
                {profileMessage.type === 'success' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                {profileMessage.text}
              </div>
            )}
            <button
              onClick={handleProfileSave}
              disabled={profileSaving}
              className="flex items-center gap-2 rounded-lg bg-[#6366F1] px-4 py-2 text-sm font-medium text-white hover:bg-[#818CF8] transition disabled:opacity-50"
            >
              {profileSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Profile
            </button>
          </div>
        </SettingsSection>

        {/* Security Section */}
        <SettingsSection
          icon={<Shield className="h-5 w-5" />}
          title="Security"
          description="Change your password"
        >
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#F1F1F3]">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-lg border border-[#2D2D3A] bg-[#0F0F14] px-3 py-2 text-sm text-[#F1F1F3] outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#F1F1F3]">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-[#2D2D3A] bg-[#0F0F14] px-3 py-2 text-sm text-[#F1F1F3] outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]"
                placeholder="Enter new password (min 8 chars)"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#F1F1F3]">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-[#2D2D3A] bg-[#0F0F14] px-3 py-2 text-sm text-[#F1F1F3] outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]"
                placeholder="Confirm new password"
              />
            </div>
            {passwordMessage && (
              <div
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                  passwordMessage.type === 'success'
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-red-500/10 text-red-400'
                }`}
              >
                {passwordMessage.type === 'success' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                {passwordMessage.text}
              </div>
            )}
            <button
              onClick={handlePasswordChange}
              disabled={passwordSaving || !currentPassword || !newPassword || !confirmPassword}
              className="flex items-center gap-2 rounded-lg bg-[#6366F1] px-4 py-2 text-sm font-medium text-white hover:bg-[#818CF8] transition disabled:opacity-50"
            >
              {passwordSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Shield className="h-4 w-4" />
              )}
              Change Password
            </button>
          </div>
        </SettingsSection>

        {/* AI Models Section */}
        <SettingsSection
          icon={<Brain className="h-5 w-5" />}
          title="AI Models"
          description="Ollama connection and model configuration"
        >
          <div className="space-y-4">
            {/* Connection Status */}
            <div className="flex items-center gap-3">
              <div
                className={`h-3 w-3 rounded-full ${
                  ollamaStatus?.available ? 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.5)]' : 'bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.5)]'
                }`}
              />
              <span className="text-sm text-[#F1F1F3]">
                Ollama is{' '}
                <span className={ollamaStatus?.available ? 'text-green-400' : 'text-red-400'}>
                  {ollamaStatus?.available ? 'connected' : 'disconnected'}
                </span>
              </span>
              <button
                onClick={handleRefreshOllama}
                className="rounded px-2 py-1 text-xs text-[#6366F1] hover:bg-[#6366F1]/10 transition"
              >
                Refresh
              </button>
            </div>

            {/* Models */}
            {ollamaStatus && (
              <div className="space-y-2">
                <ModelRow
                  label="General"
                  model={ollamaStatus.models.general}
                  available={ollamaStatus.available}
                />
                <ModelRow
                  label="Structured"
                  model={ollamaStatus.models.structured}
                  available={ollamaStatus.available}
                />
                <ModelRow
                  label="Embeddings"
                  model={ollamaStatus.models.embed}
                  available={ollamaStatus.available}
                />
              </div>
            )}
          </div>
        </SettingsSection>

        {/* Voice Command Shortcut Section */}
        <SettingsSection
          icon={<Mic className="h-5 w-5" />}
          title="Voice Command"
          description="Customize the keyboard shortcut for voice commands"
        >
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#F1F1F3]">
                Keyboard Shortcut
              </label>
              <p className="mb-3 text-xs text-[#6B7280]">
                Click the box below and press your desired key combination to set a new shortcut.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsRecordingShortcut(true)}
                  onKeyDown={(e) => {
                    if (!isRecordingShortcut) return
                    e.preventDefault()
                    e.stopPropagation()

                    // Ignore lone modifier presses
                    if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return

                    const parts: string[] = []
                    if (e.ctrlKey || e.metaKey) parts.push(e.metaKey ? 'Cmd' : 'Ctrl')
                    if (e.altKey) parts.push('Alt')
                    if (e.shiftKey) parts.push('Shift')

                    // Map special keys
                    let key = e.key
                    if (key === ' ') key = 'Space'
                    else if (key.length === 1) key = key.toUpperCase()
                    else if (key === 'Escape') {
                      // Cancel recording
                      setIsRecordingShortcut(false)
                      return
                    }

                    parts.push(key)
                    const shortcut = parts.join('+')

                    setVoiceShortcut(shortcut)
                    localStorage.setItem('athena-voice-shortcut', shortcut)
                    setIsRecordingShortcut(false)
                    // Dispatch event so VoiceCommandButton picks it up
                    window.dispatchEvent(new CustomEvent('athena-shortcut-changed', { detail: shortcut }))
                  }}
                  onBlur={() => setIsRecordingShortcut(false)}
                  className={`
                    flex items-center justify-center min-w-[200px] h-12 rounded-lg border-2 px-4 text-sm font-mono transition
                    ${isRecordingShortcut
                      ? 'border-[#6366F1] bg-[#6366F1]/10 text-[#F1F1F3] animate-pulse'
                      : 'border-[#2D2D3A] bg-[#0F0F14] text-[#F1F1F3] hover:border-[#6366F1]/50'
                    }
                  `}
                >
                  {isRecordingShortcut ? (
                    <span className="text-[#818CF8]">Press keys...</span>
                  ) : (
                    <span>{voiceShortcut.split('+').map((k, i) => (
                      <span key={i}>
                        {i > 0 && <span className="text-[#6B7280] mx-1">+</span>}
                        <kbd className="inline-flex items-center justify-center min-w-[24px] px-1.5 py-0.5 rounded bg-[#2D2D3A] text-xs font-semibold text-[#F1F1F3]">
                          {k}
                        </kbd>
                      </span>
                    ))}</span>
                  )}
                </button>
                <button
                  onClick={() => {
                    const defaultShortcut = 'Ctrl+Shift+V'
                    setVoiceShortcut(defaultShortcut)
                    localStorage.setItem('athena-voice-shortcut', defaultShortcut)
                    window.dispatchEvent(new CustomEvent('athena-shortcut-changed', { detail: defaultShortcut }))
                  }}
                  className="rounded-lg px-3 py-2 text-xs text-[#6B7280] hover:text-[#F1F1F3] hover:bg-[#2D2D3A] transition"
                >
                  Reset to default
                </button>
              </div>
            </div>
            <div className="rounded-lg bg-[#0F0F14] border border-[#2D2D3A] p-3">
              <p className="text-xs text-[#6B7280]">
                <strong className="text-[#9CA3AF]">Tip:</strong> You can also click the floating mic button in the bottom-right corner.
                Popular choices: <kbd className="px-1 py-0.5 bg-[#2D2D3A] rounded text-[10px]">Cmd+Space</kbd>,{' '}
                <kbd className="px-1 py-0.5 bg-[#2D2D3A] rounded text-[10px]">Ctrl+Shift+V</kbd>,{' '}
                <kbd className="px-1 py-0.5 bg-[#2D2D3A] rounded text-[10px]">Alt+V</kbd>
              </p>
            </div>
          </div>
        </SettingsSection>

        {/* Theme Section */}
        <SettingsSection
          icon={<Palette className="h-5 w-5" />}
          title="Appearance"
          description="Theme and display preferences"
        >
          <div className="flex gap-3">
            <button
              onClick={() => setTheme('dark')}
              className={`rounded-lg px-6 py-3 text-sm transition ${
                theme === 'dark'
                  ? 'border-2 border-[#6366F1] bg-[#0F0F14] text-[#F1F1F3]'
                  : 'border border-[#2D2D3A] bg-[#0F0F14] text-[#9CA3AF]'
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => setTheme('light')}
              className={`rounded-lg px-6 py-3 text-sm transition ${
                theme === 'light'
                  ? 'border-2 border-[#6366F1] bg-white text-gray-900'
                  : 'border border-[#2D2D3A] bg-white text-gray-900'
              }`}
            >
              Light
            </button>
          </div>
          <p className="mt-2 text-xs text-[#6B7280]">
            Dark mode is currently the default theme.
          </p>
        </SettingsSection>

        {/* Data Section */}
        <SettingsSection
          icon={<Database className="h-5 w-5" />}
          title="Data & Storage"
          description="Your data statistics"
        >
          {dbStats ? (
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Tasks" value={dbStats.tasks} />
              <StatCard label="Pages" value={dbStats.pages} />
              <StatCard label="Files" value={dbStats.files} />
              <StatCard label="Conversations" value={dbStats.conversations} />
              <StatCard label="Productions" value={dbStats.productions} />
              <StatCard label="Habits" value={dbStats.habits} />
            </div>
          ) : (
            <p className="text-sm text-[#6B7280]">Loading stats...</p>
          )}
        </SettingsSection>
      </div>
    </div>
  )
}

function SettingsSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-[#2D2D3A] bg-[#1A1A24] p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#6366F1]/10 text-[#6366F1]">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-[#F1F1F3]">{title}</h3>
          <p className="text-xs text-[#6B7280]">{description}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

function ModelRow({
  label,
  model,
  available,
}: {
  label: string
  model: string
  available: boolean
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-[#2D2D3A] bg-[#0F0F14] px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-[#F1F1F3]">{label}</span>
        <span className="text-xs text-[#6B7280]">{model}</span>
      </div>
      {available ? (
        <CheckCircle2 className="h-4 w-4 text-green-400" />
      ) : (
        <XCircle className="h-4 w-4 text-red-400" />
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[#2D2D3A] bg-[#0F0F14] px-3 py-2 text-center">
      <p className="text-lg font-bold text-[#F1F1F3]">{value}</p>
      <p className="text-xs text-[#6B7280]">{label}</p>
    </div>
  )
}
