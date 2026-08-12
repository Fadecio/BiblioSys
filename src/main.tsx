import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

const rootElement = document.getElementById('root')!
const root = createRoot(rootElement)

function renderStartupError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  root.render(
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ maxWidth: 560 }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
          Não foi possível iniciar o BiblioSys
        </h1>
        <p style={{ marginBottom: '0.75rem', color: '#dc2626', fontFamily: 'monospace' }}>
          {message}
        </p>
        <p style={{ color: '#525252' }}>
          Verifique se o arquivo <code>.env</code> existe na raiz do projeto com{' '}
          <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> preenchidos
          (veja <code>.env.example</code> e <code>docs/database.md</code>), depois reinicie o
          servidor de desenvolvimento.
        </p>
      </div>
    </div>,
  )
}

async function bootstrap() {
  const [{ BrowserRouter }, { AlunosProvider }, { LivrosProvider }, { EmprestimosProvider }, { default: App }] =
    await Promise.all([
      import('react-router-dom'),
      import('@/hooks/useAlunos'),
      import('@/hooks/useLivros'),
      import('@/hooks/useEmprestimos'),
      import('./App.tsx'),
    ])

  root.render(
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
}

bootstrap().catch(renderStartupError)
