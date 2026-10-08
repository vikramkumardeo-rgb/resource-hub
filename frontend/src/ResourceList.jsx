function ResourceList({ resources, onDelete}) {
  if (resources.length === 0) {
    return <p className="empty">No resources yet.</p>;
  }

  return(
    <div className="resource-list">
      {resources.map((r) => (
        <div className="card" key={r.id}>
          <div className="card-top">
            <a className="link" href={r.url} target="_blank" rel="noreferrer">
              {r.title}
            </a>
            <span className="badge">{r.resource_type}</span>
          </div>

          <p className="author">
            by {r.author}
            {r.rating ? " - Rating: " + r.rating + "/5" : ""}
          </p>

          {r.summary && <p>{r.summary}</p>}

          <div className="tags">
            {r.tags.map((t) => (
              <span className="tag" key={t.id}>
                {t.name}
              </span>
            ))}
          </div>

          <button onClick={() => onDelete(r.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
  export default ResourceList;