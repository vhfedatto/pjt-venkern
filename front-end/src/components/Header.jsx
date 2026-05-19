function Header({ title, subtitle }) {
  return (
    <header className="page-header">
      <div>
        <span className="page-kicker">Workspace overview</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      <div className="header-actions">
        <div className="search-pill">Alpha build ready for backend integration</div>
        <button type="button" className="primary-button">
          New task
        </button>
      </div>
    </header>
  )
}

export default Header
