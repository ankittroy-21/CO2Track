import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Leaf } from 'lucide-react'

/** Inline Google SVG icon (no emoji) */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

/** Inline GitHub SVG icon */
function GithubIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
    </svg>
  )
}

export default function Login() {
  const { signInWithGoogle, signInWithGitHub } = useAuth()
  const [loadingProvider, setLoadingProvider] = useState(null)
  const [error, setError] = useState(null)

  const handleSignIn = async (provider) => {
    setLoadingProvider(provider)
    setError(null)
    try {
      if (provider === 'google') await signInWithGoogle()
      else await signInWithGitHub()
    } catch (err) {
      setError('Sign-in failed. Please try again.')
      setLoadingProvider(null)
    }
  }

  return (
    <div className="min-h-screen bg-offwhite flex flex-col">
      {/* Decorative top bar */}
      <div className="h-1 bg-green-dark w-full" />

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Logo + Brand */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-dark mb-5 shadow-sm">
            <Leaf className="w-8 h-8 text-white" strokeWidth={1.5} />
          </div>

          <h1 className="text-4xl font-bold text-charcoal tracking-tight">
            CO<sub className="text-2xl font-semibold text-green-dark">2</sub>Track
          </h1>

          <p className="mt-3 text-gray-500 text-base max-w-xs mx-auto leading-relaxed">
            India's smart carbon footprint tracker — log, measure, and reduce your impact.
          </p>
        </div>

        {/* Sign-in card */}
        <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl p-8">
          <h2 className="text-sm font-semibold text-gray-500 text-center mb-6 uppercase tracking-wider">
            Sign in to continue
          </h2>

          <div className="space-y-3">
            {/* Google */}
            <button
              id="sign-in-google"
              type="button"
              onClick={() => handleSignIn('google')}
              disabled={loadingProvider !== null}
              className="w-full flex items-center justify-center gap-3 border border-gray-300 bg-white hover:bg-gray-50 text-charcoal py-3 px-4 rounded-xl text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-dark disabled:opacity-60 disabled:cursor-not-allowed"
              aria-label="Sign in with Google"
            >
              {loadingProvider === 'google' ? (
                <div className="w-4 h-4 border-2 border-green-dark border-t-transparent rounded-full animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              Continue with Google
            </button>

            {/* GitHub */}
            <button
              id="sign-in-github"
              type="button"
              onClick={() => handleSignIn('github')}
              disabled={loadingProvider !== null}
              className="w-full flex items-center justify-center gap-3 bg-[#24292e] hover:bg-[#1b1f23] text-white py-3 px-4 rounded-xl text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#24292e] disabled:opacity-60 disabled:cursor-not-allowed"
              aria-label="Sign in with GitHub"
            >
              {loadingProvider === 'github' ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <GithubIcon className="w-4 h-4" />
              )}
              Continue with GitHub
            </button>
          </div>

          {error && (
            <p className="mt-4 text-xs text-red-600 text-center" role="alert">{error}</p>
          )}

          {/* Privacy note */}
          <p className="mt-6 text-xs text-gray-400 text-center leading-relaxed">
            We only store your name and email to personalise your experience. Your data is never sold.
          </p>
        </div>

        {/* Stats row */}
        <div className="mt-10 flex gap-8 text-center">
          {[
            { label: 'Emission factors', value: '25+' },
            { label: 'Indian food items', value: '9' },
            { label: 'AI insights / month', value: '2' },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="text-xl font-bold text-green-dark">{value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <footer className="py-6 text-center text-xs text-gray-400">
        CO2Track · Built for India · Open source on GitHub
      </footer>
    </div>
  )
}
