function SummaryCard({ label, value, trend, accent }) {
  return (
    <article className={`summary-card ${accent}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{trend}</p>
    </article>
  )
}

export default SummaryCard
