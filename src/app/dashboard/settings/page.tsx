"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Building, Shield, Save, Settings as SettingsIcon, Bell, Key, Database } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function SettingsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState({
    full_name: '',
    organization: '',
    timezone: 'UTC',
    notifications: true,
  })

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        window.location.href = '/login'
        return
      }

      setUser(authUser)

      // Load profile from users table
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (userData) {
        setProfile({
          full_name: userData.full_name || '',
          organization: userData.organization || '',
          timezone: userData.preferences?.timezone || 'UTC',
          notifications: userData.preferences?.notifications !== false,
        })
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: profile.full_name,
          organization: profile.organization,
          preferences: {
            timezone: profile.timezone,
            notifications: profile.notifications,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Loading settings...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-gray-400 mt-2">Manage your account preferences and security settings</p>
        </div>

        {/* Account Information */}
        <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <User className="h-5 w-5 text-blue-400" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                <div className="flex items-center gap-2 mt-2 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">{user?.email}</span>
                  <Badge variant="outline" className="ml-auto border-green-500/30 text-green-400">Verified</Badge>
                </div>
              </div>

              <div>
                <Label htmlFor="role" className="text-gray-300">Role</Label>
                <div className="flex items-center gap-2 mt-2 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                  <Shield className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300 capitalize">{user?.role || 'User'}</span>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="full_name" className="text-gray-300">Full Name</Label>
              <Input
                id="full_name"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="John Doe"
                className="mt-2 bg-gray-800/50 border-gray-700/50 text-white"
              />
            </div>

            <div>
              <Label htmlFor="organization" className="text-gray-300">Organization</Label>
              <div className="flex items-center gap-2 mt-2">
                <Building className="h-4 w-4 text-gray-400 absolute ml-3" />
                <Input
                  id="organization"
                  value={profile.organization}
                  onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
                  placeholder="Acme Inc."
                  className="pl-10 bg-gray-800/50 border-gray-700/50 text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <SettingsIcon className="h-5 w-5 text-purple-400" />
              Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="timezone" className="text-gray-300">Timezone</Label>
              <select
                id="timezone"
                value={profile.timezone}
                onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                className="mt-2 w-full p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Europe/Paris">Central European Time (CET)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
                <option value="Asia/Shanghai">China (CST)</option>
                <option value="Australia/Sydney">Sydney (AEDT)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-yellow-400" />
                <div>
                  <div className="font-medium text-white">Email Notifications</div>
                  <div className="text-sm text-gray-400">Receive alerts for scan completions and findings</div>
                </div>
              </div>
              <button
                onClick={() => setProfile({ ...profile, notifications: !profile.notifications })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  profile.notifications ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    profile.notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Key className="h-5 w-5 text-red-400" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">Password</div>
                  <div className="text-sm text-gray-400">Last changed: Never</div>
                </div>
                <Button variant="outline" size="sm" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                  Change Password
                </Button>
              </div>
            </div>

            <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">Two-Factor Authentication</div>
                  <div className="text-sm text-gray-400">Add an extra layer of security</div>
                </div>
                <Button variant="outline" size="sm" className="border-green-500/50 text-green-400 hover:bg-green-500/10">
                  Enable 2FA
                </Button>
              </div>
            </div>

            <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">API Keys</div>
                  <div className="text-sm text-gray-400">Manage API access tokens</div>
                </div>
                <Button variant="outline" size="sm" className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10">
                  Manage Keys
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage & Quota */}
        <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Database className="h-5 w-5 text-green-400" />
              Usage & Quota
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Scans this month</span>
                <span className="text-white font-medium">12 / 100</span>
              </div>
              <div className="w-full bg-gray-700/30 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '12%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Storage used</span>
                <span className="text-white font-medium">124 MB / 1 GB</span>
              </div>
              <div className="w-full bg-gray-700/30 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '12%' }}></div>
              </div>
            </div>

            <Button variant="outline" className="w-full border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
              Upgrade Plan
            </Button>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => window.location.href = '/dashboard'}
            className="border-gray-500/50 text-gray-400 hover:bg-gray-500/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}
