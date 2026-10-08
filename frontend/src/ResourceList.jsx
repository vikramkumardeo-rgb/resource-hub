import { useState } from "react";
import ResourceForm from "./ResourceForm";

function ResourceList({ resources, onDelete, onUpdated }) {
  const [editingId, setEditingId] = useState(null);

  if (resources.length === 0) {
    return <p className="empty">No resources yet.</p>;
  }

  return (
    <div className="resource-list">
      {resources.map((r) =>
        r.id === editingId ? (
          <ResourceForm
            key={r.id}
            resource={r}
            onSaved={() => {
              setEditingId(null);
              onUpdated();
            }}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <div className="card" key={r.id}>
            <div className="card-top">
              <a
                className="link"
                href={r.url}
                target="_blank"
                rel="noreferrer"
              >
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

            <div className="actions">
              <button onClick={() => setEditingId(r.id)}>Edit</button>
              <button onClick={() => onDelete(r.id)}>Delete</button>
            </div>
          </div>
        )
      )}
    </div>
  );
}

export default ResourceList;