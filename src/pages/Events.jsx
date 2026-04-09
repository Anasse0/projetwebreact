import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getEvents, createEvent, updateEvent, deleteEvent } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", date: "", status: "draft" });
  const { role } = useAuth();
  const navigate = useNavigate();

  const fetchEvents = () => {
    setLoading(true);
    getEvents()
      .then((res) => setEvents(res.data))
      .catch(() => setError("Failed to load events."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, form);
      } else {
        await createEvent(form);
      }
      setShowForm(false);
      setEditingEvent(null);
      setForm({ title: "", description: "", date: "", status: "draft" });
      fetchEvents();
    } catch {
      setError("Failed to save event.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      await deleteEvent(id);
      fetchEvents();
    } catch {
      setError("Failed to delete event.");
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setForm({ title: event.title, description: event.description, date: event.date, status: event.status });
    setShowForm(true);
  };

  const filtered = events.filter((e) => {
    const eventDate = e.date ? e.date.slice(0, 10) : "";
    return (
      (filterStatus === "" || e.status === filterStatus) &&
      (filterDate === "" || eventDate === filterDate)
    );
  });

  if (loading) return <p style={{ textAlign: "center", marginTop: "2rem" }}>Loading...</p>;
  if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Events</h2>
        <button onClick={() => navigate("/dashboard")}
          style={{ padding: "0.4rem 1rem", backgroundColor: "#6b7280", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          ← Back
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", marginBottom: "1rem" }}>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}>
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
        <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)}
          style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }} />
        <button onClick={() => { setFilterStatus(""); setFilterDate(""); }}
          style={{ padding: "0.5rem 1rem", backgroundColor: "#6b7280", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          Clear
        </button>
      </div>

      {/* Add Event button (admin only) */}
      {role === "admin" && (
        <button onClick={() => { setShowForm(true); setEditingEvent(null); setForm({ title: "", description: "", date: "", status: "draft" }); }}
          style={{ marginBottom: "1rem", padding: "0.5rem 1rem", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          + Add Event
        </button>
      )}

      {/* Form */}
      {showForm && (
        <div style={{ backgroundColor: "#f9fafb", padding: "1.5rem", borderRadius: "8px", marginBottom: "1.5rem", border: "1px solid #e5e7eb" }}>
          <h3>{editingEvent ? "Edit Event" : "New Event"}</h3>
          <form onSubmit={handleSubmit}>
            <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              required style={{ display: "block", width: "100%", padding: "0.5rem", marginBottom: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }} />
            <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              style={{ display: "block", width: "100%", padding: "0.5rem", marginBottom: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }} />
            <input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
              required style={{ display: "block", width: "100%", padding: "0.5rem", marginBottom: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }} />
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
              style={{ display: "block", width: "100%", padding: "0.5rem", marginBottom: "1rem", borderRadius: "4px", border: "1px solid #ccc" }}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button type="submit" style={{ padding: "0.5rem 1rem", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                {editingEvent ? "Update" : "Create"}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                style={{ padding: "0.5rem 1rem", backgroundColor: "#6b7280", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events List */}
      {filtered.length === 0 ? <p>No events found.</p> : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f3f4f6" }}>
              <th style={{ padding: "0.75rem", textAlign: "left", border: "1px solid #e5e7eb" }}>Title</th>
              <th style={{ padding: "0.75rem", textAlign: "left", border: "1px solid #e5e7eb" }}>Date</th>
              <th style={{ padding: "0.75rem", textAlign: "left", border: "1px solid #e5e7eb" }}>Status</th>
              <th style={{ padding: "0.75rem", textAlign: "left", border: "1px solid #e5e7eb" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((event) => (
              <tr key={event.id}>
                <td style={{ padding: "0.75rem", border: "1px solid #e5e7eb" }}>{event.title}</td>
                <td style={{ padding: "0.75rem", border: "1px solid #e5e7eb" }}>{event.date}</td>
                <td style={{ padding: "0.75rem", border: "1px solid #e5e7eb" }}>{event.status}</td>
                <td style={{ padding: "0.75rem", border: "1px solid #e5e7eb" }}>
                  <button onClick={() => navigate(`/events/${event.id}`)}
                    style={{ marginRight: "0.5rem", padding: "0.3rem 0.7rem", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                    View
                  </button>
                  {role === "admin" && (
                    <>
                      <button onClick={() => handleEdit(event)}
                        style={{ marginRight: "0.5rem", padding: "0.3rem 0.7rem", backgroundColor: "#f59e0b", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(event.id)}
                        style={{ padding: "0.3rem 0.7rem", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}