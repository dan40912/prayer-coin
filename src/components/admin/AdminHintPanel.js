"use client";

export default function AdminHintPanel({
  title = "操作提示",
  description = "",
  items = [],
  tone = "info",
}) {
  if (!description && (!Array.isArray(items) || items.length === 0)) {
    return null;
  }

  return (
    <section className={`admin-hint-panel admin-hint-panel--${tone}`}>
      <header className="admin-hint-panel__header">
        <strong>{title}</strong>
      </header>
      {description ? <p className="admin-hint-panel__description">{description}</p> : null}
      {items.length ? (
        <ul className="admin-hint-panel__list">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
