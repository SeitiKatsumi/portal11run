export function Timeline({ items }: { items: { label: string; detail: string }[] }) {
  return (
    <div className="timeline">
      {items.map((item, index) => (
        <div className="timeline-item" key={item.label}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <div>
            <strong>{item.label}</strong>
            <p>{item.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
