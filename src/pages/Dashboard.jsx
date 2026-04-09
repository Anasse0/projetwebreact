import { useState, useEffect } from "react";
import { getEvents, getParticipants, getRegistrations } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { logout, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getEvents(), getParticipants(), getRegistrations()])
      .then(([evRes, partRes, regRes]) => {
        setEvents(evRes.data);
        setParticipants(partRes.data);
        setRegistrations(regRes.data);
      })
      .catch(() => setError("Failed to load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ textAlign: "center", marginTop: "2rem" }}>Loading...</p>;
  if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Dashboard</h2>
        <div>
          <span style={{ marginRight: "1rem" }}>Role: <strong>{role}</strong></span>
          <button onClick={() => { logout(); navigate("/login"); }}
            style={{ padding: "0.4rem 1rem", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
        <div style={{ flex: 1, padding: "1.5rem", backgroundColor: "#4f46e5", color: "white", borderRadius: "8px", textAlign: "center" }}>
          <h3>Total Events</h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold" }}>{events.length}</p>
        </div>
        <div style={{ flex: 1, padding: "1.5rem", backgroundColor: "#10b981", color: "white", borderRadius: "8px", textAlign: "center" }}>
          <h3>Total Participants</h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold" }}>{participants.length}</p>
        </div>
        <div style={{ flex: 1, padding: "1.5rem", backgroundColor: "#f59e0b", color: "white", borderRadius: "8px", textAlign: "center" }}>
          <h3>Total Registrations</h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold" }}>{registrations.length}</p>
        </div>
      </div>

      <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
        <button onClick={() => navigate("/events")}
          style={{ padding: "0.7rem 1.5rem", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          Go to Events
        </button>
        <button onClick={() => navigate("/participants")}
          style={{ padding: "0.7rem 1.5rem", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          Go to Participants
        </button>
      </div>
    </div>
  );
}