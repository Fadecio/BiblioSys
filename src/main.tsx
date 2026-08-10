import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import { inicializarSeed } from '@/services/storage'
import { AlunosProvider } from '@/hooks/useAlunos'
import { LivrosProvider } from '@/hooks/useLivros'
import { EmprestimosProvider } from '@/hooks/useEmprestimos'
import App from './App.tsx'

inicializarSeed()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AlunosProvider>
        <LivrosProvider>
          <EmprestimosProvider>
            <App />
          </EmprestimosProvider>
        </LivrosProvider>
      </AlunosProvider>
    </BrowserRouter>
  </StrictMode>,
)
