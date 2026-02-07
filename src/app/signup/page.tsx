'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleGoogleSignup = async () => {
    setOauthLoading(true)
    setError('')
    
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
        setOauthLoading(false)
      }
    } catch (error) {
      setError('Failed to sign up with Google')
      setOauthLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Check for rate limit specifically
        if (response.status === 429) {
          setError('Email rate limit exceeded. Please wait a few minutes before trying again.')
        } else {
          setError(data.error || 'Signup failed')
        }
        setLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (error) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 -top-48 -right-48 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute w-96 h-96 top-1/2 -left-48 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute w-96 h-96 -bottom-48 right-1/2 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 animate-fade-in-up">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl group-hover:scale-110 transition-transform">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">HeimdallAI</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Get Started</h1>
          <p className="text-gray-400">Create your account and start securing your infrastructure</p>
        </div>

        <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/50 backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <CardHeader>
            <CardTitle className="text-white text-2xl">Sign Up</CardTitle>
            <CardDescription className="text-gray-400">Enter your information to create an account</CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="p-4 text-sm text-green-300 bg-gradient-to-br from-green-900/30 to-green-800/10 border border-green-500/30 rounded-lg animate-fade-in-up text-center">
                <div className="text-4xl mb-2">✅</div>
                <div className="font-semibold mb-1">Account created successfully!</div>
                <div className="text-xs text-green-400">Redirecting to login...</div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-red-400 bg-gradient-to-br from-red-900/30 to-red-800/10 border border-red-500/30 rounded-lg animate-fade-in-up">
                    ⚠️ {error}
                  </div>
                )}

                {/* Google OAuth Button */}
                <Button
                  type="button"
                  onClick={handleGoogleSignup}
                  disabled={oauthLoading || loading}
                  className="w-full bg-white hover:bg-gray-100 text-gray-900 border border-gray-300 font-semibold py-6 transition-all"
                >
                  {oauthLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400/20 border-t-gray-900"></div>
                      Connecting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </span>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-700/50" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-gray-900 px-2 text-gray-400">Or continue with email</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-gray-300 font-medium">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300 font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300 font-medium">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                  <p className="text-xs text-gray-500">At least 6 characters</p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 font-semibold py-6 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all" 
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
                      Creating account...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Create Account
                    </span>
                  )}
                </Button>
              </form>
            )}

            <div className="mt-6 pt-6 border-t border-gray-700/50 text-center text-sm text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-500 mt-6">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
