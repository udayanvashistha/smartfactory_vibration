import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TextInput from './TextInput'
import { Login } from '../../api/login/login.api'

const LoginForm = () => {
  const [formValues, setFormValues] = useState({
    email: 'smartfactory',
    password: 'Password@123',
    remember: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setFormValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')

    const payload = {
      username: formValues.email.trim(),
      password: formValues.password,
    }

    if (!payload.username || !payload.password) {
      setErrorMessage('Email and password are required.')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await Login(payload)
      const responseData = response?.data ?? response
      const apiError = responseData?.error
      const loginFailed =
        response.error ||
        apiError?.status === false ||
        apiError?.error?.code === 'LOGIN_FAILED'

      if (loginFailed) {
        const message =
          apiError?.message ||
          responseData?.message ||
          'Invalid credentials.'
        setErrorMessage(message)
        return
      }

      const userData = responseData
      const token = userData?.data?.id
      const userId = userData?.data?.userId

      if (token) {
        localStorage.setItem('id', token)
      }
      if (userId) {
        localStorage.setItem('userId', userId)
      }

      navigate('/dashboard', { replace: true, state: { user: userData } })
    } catch (error) {
      setErrorMessage(error.message || 'An unexpected error occurred.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <TextInput
        label="Work email"
        name="email"
        autoComplete="email"
        placeholder="alex@smartfactory.com"
        value={formValues.email}
        onChange={handleChange}
        required
      />

      <TextInput
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="********"
        value={formValues.password}
        onChange={handleChange}
        required
      />

      {errorMessage && (
        <p className="form-error" role="alert">
          {errorMessage}
        </p>
      )}

      <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in...' : 'Continue'}
      </button>
    </form>
  )
}

export default LoginForm
