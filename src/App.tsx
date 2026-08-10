import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { AlunosPage } from '@/pages/AlunosPage'
import { LivrosPage } from '@/pages/LivrosPage'
import { EmprestimosPage } from '@/pages/EmprestimosPage'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/alunos" element={<AlunosPage />} />
        <Route path="/livros" element={<LivrosPage />} />
        <Route path="/emprestimos" element={<EmprestimosPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}

export default App
