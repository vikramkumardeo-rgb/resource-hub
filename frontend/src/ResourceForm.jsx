import { useState } from "react";
import { createResource, updateResource } from "./api";

function ResourceForm({ resource, onSaved, onCancel }) {
  const isEdit = Boolean(resource);

  const [title, setTitle] = useState(resource ? resource.title : "");
  const [author, setAuthor] = useState(resource ? resource.author : "");
  const [resourceType, setResourceType] = useState(
    resource ? resource.resource_type : "Book"
  );
  const [url, setUrl] = useState(resource ? resource.url : "");
  const [summary, setSummary] = useState(
    resource && resource.summary ? resource.summary : ""
  );
  const [rating, setRating] = useState(
    resource && resource.rating ? String(resource.rating) : ""
  );
  const [tags, setTags] = useState(
    resource ? resource.tags.map((t) => t.name).join(", ") : ""
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const data = {
      title,
      author,
      resource_type: resourceType,
      url,
      summary,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t !== ""),
    };
    if (rating !== "") {
      data.rating = Number(rating);
    } else if (isEdit) {
      data.rating = null;
    }

    try {
      const saved = isEdit
        ? await updateResource(resource.id, data)
        : await createResource(data);
      onSaved(saved);
      if (!isEdit) {
        setTitle("");
        setAuthor("");
        setResourceType("Book");
        setUrl("");
        setSummary("");
        setRating("");
        setTags("");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="resource-form" onSubmit={handleSubmit}>
      <h2>{isEdit ? "Edit resource" : "Add a resource"}</h2>

      {error && <p className="error">{error}</p>}

      <label>
        Title
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </label>

      <label>
        Author
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
        />
      </label>

      <label>
        Type
        <select
          value={resourceType}
          onChange={(e) => setResourceType(e.target.value)}
        >
          <option>Book</option>
          <option>Article</option>
          <option>Video</option>
          <option>Whitepaper</option>
        </select>
      </label>

      <label>
        URL
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          required
        />
      </label>

      <label>
        Summary
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={3}
        />
      </label>

      <label>
        Rating (optional)
        <select value={rating} onChange={(e) => setRating(e.target.value)}>
          <option value="">No rating</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
      </label>

      <label>
        Tags (separated by commas)
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="ai, signal processing"
        />
      </label>

      <div className="actions">
        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : isEdit ? "Save changes" : "Add resource"}
        </button>
        {onCancel && (
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default ResourceForm;