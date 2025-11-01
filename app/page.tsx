export default function Home() {
  return (
    <main className="main">
      <div className="container">
        <h1 className="title">
          Bienvenido a <span className="highlight">IA en Reformas</span>
        </h1>
        <p className="description">
          Tu proyecto Next.js está listo para desplegar en Vercel
        </p>
        <div className="grid">
          <div className="card">
            <h2>Next.js 14</h2>
            <p>Framework React con App Router</p>
          </div>
          <div className="card">
            <h2>TypeScript</h2>
            <p>Tipado estático para mayor seguridad</p>
          </div>
          <div className="card">
            <h2>Vercel</h2>
            <p>Deploy automático y optimizado</p>
          </div>
        </div>
      </div>
    </main>
  )
}

