const navigationItems = ['Dashboard', 'Contacts', 'Teams', 'Tasks', 'Kanban']

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-badge">V</div>
        <div>
          <strong>Venkern</strong>
          <span>Software Factory SaaS</span>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Sidebar">
        {navigationItems.map((item, index) => (
          <a
            key={item}
            href="#"
            className={index === 0 ? 'sidebar-link active' : 'sidebar-link'}
          >
            {item}
          </a>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p>Alpha workspace</p>
        <strong>Academic delivery 2026</strong>
      </div>
    </aside>
  )
}

export default Sidebar
