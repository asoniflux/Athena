import { Settings, User, Palette, Brain, Calendar, Database, Shield } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-[#F1F1F3]">Settings</h1>
        <p className="mt-1 text-sm text-[#9CA3AF]">Manage your account and application preferences</p>
      </div>

      <div className="space-y-4">
        <SettingsSection icon={<User className="h-5 w-5" />} title="Profile" description="Update your name, email, and avatar">
          <p className="text-sm text-[#6B7280]">Profile editing coming soon</p>
        </SettingsSection>

        <SettingsSection icon={<Palette className="h-5 w-5" />} title="Appearance" description="Theme and display preferences">
          <div className="flex gap-3">
            <button className="rounded-lg border-2 border-[#6366F1] bg-[#0F0F14] px-6 py-3 text-sm text-[#F1F1F3]">Dark</button>
            <button className="rounded-lg border border-[#2D2D3A] bg-white px-6 py-3 text-sm text-gray-900">Light</button>
          </div>
        </SettingsSection>

        <SettingsSection icon={<Brain className="h-5 w-5" />} title="AI Models" description="Configure Ollama models for different tasks">
          <div className="space-y-2 text-sm text-[#9CA3AF]">
            <p>General: llama3.1:8b</p>
            <p>Structured: mistral:7b</p>
            <p>Embeddings: nomic-embed-text</p>
          </div>
        </SettingsSection>

        <SettingsSection icon={<Calendar className="h-5 w-5" />} title="Calendar Integration" description="Connect Google Calendar for sync">
          <button className="rounded-lg border border-[#2D2D3A] bg-[#242430] px-4 py-2 text-sm text-[#9CA3AF] hover:bg-[#2D2D3A] transition">
            Connect Google Calendar
          </button>
        </SettingsSection>

        <SettingsSection icon={<Database className="h-5 w-5" />} title="Backup & Data" description="Backup and restore your data">
          <div className="flex gap-3">
            <button className="rounded-lg border border-[#2D2D3A] bg-[#242430] px-4 py-2 text-sm text-[#9CA3AF] hover:bg-[#2D2D3A] transition">
              Create Backup
            </button>
            <button className="rounded-lg border border-[#2D2D3A] bg-[#242430] px-4 py-2 text-sm text-[#9CA3AF] hover:bg-[#2D2D3A] transition">
              Export Data
            </button>
          </div>
        </SettingsSection>

        <SettingsSection icon={<Shield className="h-5 w-5" />} title="Security" description="Password and session management">
          <button className="rounded-lg border border-[#2D2D3A] bg-[#242430] px-4 py-2 text-sm text-[#9CA3AF] hover:bg-[#2D2D3A] transition">
            Change Password
          </button>
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
