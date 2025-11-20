import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import DashboardHome from './pages/DashboardHome'
import ReportsView from './pages/ReportsView'
import LatestReportView from './pages/LatestReportView'

const App = () => (
  <HashRouter>
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />}>
        <Route index element={<DashboardHome />} />
        <Route path="reports" element={<ReportsView />} />
        <Route path="latest-report" element={<LatestReportView />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </HashRouter>
)

export default App
