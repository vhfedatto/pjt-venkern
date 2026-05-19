function TaskColumn({ title, count, tone, tasks }) {
  return (
    <section className="task-column">
      <div className="task-column-header">
        <div className={`task-tone ${tone}`} aria-hidden="true"></div>
        <h3>{title}</h3>
        <span>{count}</span>
      </div>

      <div className="task-list">
        {tasks.map((task) => (
          <article key={task.title} className="task-card">
            <strong>{task.title}</strong>
            <p>{task.description}</p>
            <footer>
              <span>{task.assignee}</span>
              <b>{task.tag}</b>
            </footer>
          </article>
        ))}
      </div>
    </section>
  )
}

export default TaskColumn
