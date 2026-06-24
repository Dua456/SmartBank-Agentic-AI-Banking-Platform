import { SignIn } from '@clerk/clerk-react'

export default function Login() {
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">S</div>
        <h1>Welcome to SmartBank</h1>
        <p className="subtitle">AI-Powered Banking Operations Platform</p>
        <SignIn />
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Secure access for authorized personnel only
        </p>
      </div>
    </div>
  )
}
