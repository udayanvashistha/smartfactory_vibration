import LoginForm from '../components/forms/LoginForm'

const LoginPage = () => {
  return (
    <main className="auth-page">
      <section className="auth-page__hero">
        <p className="eyebrow">Secure access</p>
        <h1>Welcome back to Vibration Insight</h1>
        <p className="hero__body">
          Monitor sensor data, identify anomalies faster, and deliver confident
          reports to clients from a centralized dashboard designed for
          industrial reliability teams.
        </p>
        <ul className="hero-highlights">
          <li>Live vibration telemetry with AI assisted alerts</li>
          <li>Prebuilt maintenance playbooks for rapid troubleshooting</li>
          <li>Role-based access so the right people see the right data</li>
        </ul>
      </section>

      <section className="auth-page__panel">
        <div className="auth-card">
          <div className="auth-card__header">
            <p className="eyebrow">Welcome back</p>
            <h2>Sign in to your dashboard</h2>
            <p>Use your company email to continue.</p>
          </div>

          <LoginForm />

          <div className="auth-card__footer">
            <span>Need an account?</span>
            <a href="#">Request access</a>
          </div>
        </div>
      </section>
    </main>
  )
}

export default LoginPage
