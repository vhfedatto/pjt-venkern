function ContactCard({ name, role, team, email }) {
  return (
    <article className="contact-card">
      <div className="contact-avatar" aria-hidden="true">
        {name
          .split(' ')
          .slice(0, 2)
          .map((part) => part[0])
          .join('')}
      </div>

      <div className="contact-meta">
        <strong>{name}</strong>
        <span>{role}</span>
      </div>

      <div className="contact-extra">
        <span>{team}</span>
        <a href={`mailto:${email}`}>{email}</a>
      </div>
    </article>
  )
}

export default ContactCard
