import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getParticipants, createParticipant, updateParticipant, deleteParticipant } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Participants() {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState(null);
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "" });
  const { role } = useAuth();
  const navigate = useNavigate();

  const fetchParticipants = () => {
    setLoading(true);
    getParticipants()
      .then((res) => setParticipants(res.data))
      .catch(() => setError("Failed to load participants."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchParticipants(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingParticipant) {
        await updateParticipant(editingParticipant.id, form);
      } else {
        await createParticipant(form);
      }
      setShowForm(false);
      setEditingParticipant(null);
      setForm({ first_name: "", last_name: "", email: "" });
      fetchParticipants();
    } catch {
      setError("Failed to save participant.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this participant?")) return;
    try {
      await deleteParticipant(id);
      fetchParticipants();
    } catch {
      setError("Failed to delete participant.");
    }
  };

  const handleEdit = (p) => {
    setEditingParticipant(p);
    setForm({ first_name: p.first_name, last_name: p.last_name, email: p.email });
    setShowForm(true);
  };

  if (loading) return <p style={{ textAlign: "center", marginTop: "2rem" }}>Loading...</p>;
  if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Participants</h2>
        <button onClick={() => navigate("/dashboard")}
          style={{ padding: "0.4rem 1rem", backgroundColor: "#6b7280", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          ← Back
        </button>
      </div>

      {role === "admin" && (
        <button onClick={() => { setShowForm(true); setEditingParticipant(null); setForm({ first_name: "", last_name: "", email: "" }); }}
          style={{ margin: "1rem 0", padding: "0.5rem 1rem", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          + Add Participant
        </button>
      )}

      {showForm && (
        <div style={{ backgroundColor: "#f9fafb", padding: "1.5rem", borderRadius: "8px", marginBottom: "1.5rem", border: "1px solid #e5e7eb" }}>
          <h3>{editingParticipant ? "Edit Participant" : "New Participant"}</h3>
          <form onSubmit={handleSubmit}>
            <input placeholder="First Name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              required style={{ display: "block", width: "100%", padding: "0.5rem", marginBottom: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }} />
            <input placeholder="Last Name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              required style={{ display: "block", width: "100%", padding: "0.5rem", marginBottom: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }} />
            <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              required style={{ display: "block", width: "100%", padding: "0.5rem", marginBottom: "1rem", borderRadius: "4px", border: "1px solid #ccc" }} />
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button type="submit"
                style={{ padding: "0.5rem 1rem", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                {editingParticipant ? "Update" : "Create"}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                style={{ padding: "0.5rem 1rem", backgroundColor: "#6b7280", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {participants.length === 0 ? <p>No participants found.</p> : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f3f4f6" }}>
              <th style={{ padding: "0.75rem", textAlign: "left", border: "1px solid #e5e7eb" }}>First Name</th>
              <th style={{ padding: "0.75rem", textAlign: "left", border: "1px solid #e5e7eb" }}>Last Name</th>
              <th style={{ padding: "0.75rem", textAlign: "left", border: "1px solid #e5e7eb" }}>Email</th>
              {role === "admin" && (
                <th style={{ padding: "0.75rem", textAlign: "left", border: "1px solid #e5e7eb" }}>Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {participants.map((p) => (
              <tr key={p.id}>
                <td style={{ padding: "0.75rem", border: "1px solid #e5e7eb" }}>{p.first_name}</td>
                <td style={{ padding: "0.75rem", border: "1px solid #e5e7eb" }}>{p.last_name}</td>
                <td style={{ padding: "0.75rem", border: "1px solid #e5e7eb" }}>{p.email}</td>
                {role === "admin" && (
                  <td style={{ padding: "0.75rem", border: "1px solid #e5e7eb" }}>
                    <button onClick={() => handleEdit(p)}
                      style={{ marginRight: "0.5rem", padding: "0.3rem 0.7rem", backgroundColor: "#f59e0b", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(p.id)}
                      style={{ padding: "0.3rem 0.7rem", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}