function ResourceList({ resources }) {
  if (resources.length === 0) {
    return <p className="empty">No resources yet.</p>;
  }

  return (
    <ul className="resource-list">
      {resources.map((r) => (
        <li key={r.id} className="card">
          <div className="card-top">
            <h3>
              <a href={r.url} target="_blank" rel="noreferrer">
                {r.title}
              </a>
            </h3>
            <span className="badge">{r.resource_type}</span>
            </div>
            <p className="author">
              by {r.author}
              {r.rating ? " - Rating: " + r.rating + "/5" : ""}
            </p>
            {r.summary && <p>{r.summary}</p>}
            <div className="tags">
              {r.tags.map((t) => (
                <span key={t.id} className="tag">
                  {t.name}
                </span>
              ))}
            </div>
          </li>
        ))}
    </ul>
  );
}

export default ResourceList;