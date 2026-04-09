import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEvents, getParticipants, getRegistrations, createRegistration, deleteRegistration } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();

  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [allParticipants, setAllParticipants] = useState([]);
  const [selectedParticipant, setSelectedParticipant] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = () => {
    Promise.all([getEvents(), getParticipants(), getRegistrations()])
      .then(([evRes, partRes, regRes]) => {
        const found = evRes.data.find((e) => e.id === parseInt(id));
        setEvent(found);
        setAllParticipants(partRes.data);
        const eventRegs = regRes.data.filter((r) => r.event === parseInt(id));
        setRegistrations(eventRegs);
        const registeredIds = eventRegs.map((r) => r.participant);
        setParticipants(partRes.data.filter((p) => registeredIds.includes(p.id)));
      })
      .catch(() => setError("Failed to load event details."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleRegister = async () => {
    if (!selectedParticipant) return;
    try {
      await createRegistration({ event: parseInt(id), participant: parseInt(selectedParticipant) });
      fetchData();
      setSelectedParticipant("");
    } catch {
      setError("Failed to register participant. They may already be registered.");
    }
  };

  const handleUnregister = async (regId) => {
    if (!window.confirm("Remove this participant from the event?")) return;
    try {
      await deleteRegistration(regId);
      fetchData();
    } catch {
      setError("Failed to remove participant.");
    }
  };

  if (loading) return <p style={{ textAlign: "center", marginTop: "2rem" }}>Loading...</p>;
  if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;
  if (!event) return <p style={{ textAlign: "center" }}>Event not found.</p>;

  const unregisteredParticipants = allParticipants.filter(
    (p) => !registrations.map((r) => r.participant).includes(p.id)
  );

  return (
    <div style={{ padding: "2rem" }}>
      <button onClick={() => navigate("/events")}
        style={{ marginBottom: "1rem", padding: "0.4rem 1rem", backgroundColor: "#6b7280", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
        ← Back to Events
      </button>

      <h2>{event.title}</h2>
      <p><strong>Date:</strong> {event.date}</p>
      <p><strong>Status:</strong> {event.status}</p>
      <p><strong>Description:</strong> {event.description}</p>

      <hr style={{ margin: "1.5rem 0" }} />

      <h3>Registered Participants ({participants.length})</h3>

      {role === "admin" && (
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          <select value={selectedParticipant} onChange={(e) => setSelectedParticipant(e.target.value)}
            style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc", flex: 1 }}>
            <option value="">Select a participant to register</option>
            {unregisteredParticipants.map((p) => (
              <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
            ))}
          </select>
          <button onClick={handleRegister}
            style={{ padding: "0.5rem 1rem", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
            Register
          </button>
        </div>
      )}

      {participants.length === 0 ? (
        <p>No participants registered yet.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f3f4f6" }}>
              <th style={{ padding: "0.75rem", textAlign: "left", border: "1px solid #e5e7eb" }}>Name</th>
              <th style={{ padding: "0.75rem", textAlign: "left", border: "1px solid #e5e7eb" }}>Email</th>
              {role === "admin" && (
                <th style={{ padding: "0.75rem", textAlign: "left", border: "1px solid #e5e7eb" }}>Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {participants.map((p) => {
              const reg = registrations.find((r) => r.participant === p.id);
              return (
                <tr key={p.id}>
                  <td style={{ padding: "0.75rem", border: "1px solid #e5e7eb" }}>{p.first_name} {p.last_name}</td>
                  <td style={{ padding: "0.75rem", border: "1px solid #e5e7eb" }}>{p.email}</td>
                  {role === "admin" && (
                    <td style={{ padding: "0.75rem", border: "1px solid #e5e7eb" }}>
                      <button onClick={() => handleUnregister(reg.id)}
                        style={{ padding: "0.3rem 0.7rem", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                        Remove
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}