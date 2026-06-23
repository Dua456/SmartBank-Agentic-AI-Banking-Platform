import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Loading from './components/Loading'

const Login = lazy(() => import('./features/auth/Login'))
const Dashboard = lazy(() => import('./features/dashboard/Dashboard'))
const Classify = lazy(() => import('./features/classify/Classify'))
const ChatPage = lazy(() => import('./features/chat/ChatPage'))
const Document = lazy(() => import('./features/document/Document'))
const Workflows = lazy(() => import('./features/workflows/Workflows'))
const AdminLayout = lazy(() => import('./features/admin/AdminLayout'))

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/classify" element={<Classify />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/document" element={<Document />} />
          <Route path="/workflows" element={<Workflows />} />
          <Route path="/admin/*" element={<AdminLayout />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}
