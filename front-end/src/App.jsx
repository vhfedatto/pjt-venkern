import './App.css'
import ContactCard from './components/ContactCard'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import SummaryCard from './components/SummaryCard'
import TaskColumn from './components/TaskColumn'
import { contacts, summaryCards, taskColumns } from './data/mockData'

function App() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-content">
        <Header
          title="Dashboard"
          subtitle="Manage your team, contacts and tasks in one place."
        />

        <main className="dashboard-content">
          <section className="summary-grid" aria-label="Platform summary">
            {summaryCards.map((card) => (
              <SummaryCard key={card.label} {...card} />
            ))}
          </section>

          <section className="content-grid">
            <div className="panel contacts-panel">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">Contacts</span>
                  <h2>People you work with most</h2>
                </div>
                <button type="button" className="ghost-button">
                  View all
                </button>
              </div>

              <div className="contacts-list">
                {contacts.map((contact) => (
                  <ContactCard key={contact.email} {...contact} />
                ))}
              </div>
            </div>

            <div className="panel activity-panel">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">Operations</span>
                  <h2>Alpha delivery status</h2>
                </div>
              </div>

              <div className="activity-metrics">
                <div className="metric-card accent-card">
                  <span>Current sprint</span>
                  <strong>12 active deliverables</strong>
                  <p>Focus on API polish, Kanban visibility and frontend onboarding.</p>
                </div>

                <div className="metric-split">
                  <div className="mini-metric">
                    <span>Team health</span>
                    <strong>86%</strong>
                  </div>
                  <div className="mini-metric">
                    <span>Reviews pending</span>
                    <strong>4 items</strong>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="panel kanban-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Kanban</span>
                <h2>Workflow preview</h2>
              </div>
              <p className="panel-note">Static mockup for the first product presentation.</p>
            </div>

            <div className="kanban-grid">
              {taskColumns.map((column) => (
                <TaskColumn key={column.title} {...column} />
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default App
