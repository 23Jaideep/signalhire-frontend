import React, { useState } from "react";

function App() {
  const [candidateId, setCandidateId] = useState("");
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionData, setSessionData] = useState(null);

  const fetchCandidate = async () => {
    const res = await fetch(`http://127.0.0.1:8000/candidate/${candidateId}`);
    const data = await res.json();
    setSessions(data.sessions);
    setSelectedSession(null);
    setSessionData(null);
  };

  const fetchSession = async (session_id) => {
    const res = await fetch(`http://127.0.0.1:8000/session/${session_id}`);
    const data = await res.json();
    setSelectedSession(session_id);
    setSessionData(data);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Candidate Viewer</h2>

      <input
        placeholder="Enter candidate ID"
        value={candidateId}
        onChange={(e) => setCandidateId(e.target.value)}
      />
      <button onClick={fetchCandidate}>Load</button>

      <hr />

      <h3>Sessions</h3>
      {sessions.map((s) => (
        <div key={s.session_id} style={{ marginBottom: 10 }}>
          <button onClick={() => fetchSession(s.session_id)}>
            {s.session_id}
          </button>
          <div>
            Iteration: {s.summary.scores.iteration ?? "N/A"} | Adaptability:{" "}
            {s.summary.scores.adaptability ?? "N/A"} | Recovery:{" "}
            {s.summary.scores.recovery ?? "N/A"}
          </div>
        </div>
      ))}

      <hr />

      {sessionData && (
        <>
          <h3>Session Details</h3>

          <div>
            <b>Iteration:</b> {sessionData.summary.scores.iteration ?? "N/A"}
          </div>
          <div>
            <b>Adaptability:</b>{" "}
            {sessionData.summary.scores.adaptability ?? "N/A"}
          </div>
          <div>
            <b>Recovery:</b> {sessionData.summary.scores.recovery ?? "N/A"}
          </div>

          <h4>Events Timeline</h4>
          {sessionData.events.map((e, idx) => (
            <div key={idx}>
              [{new Date(e.timestamp * 1000).toLocaleTimeString()}]{" "}
              {e.event_type}
              {e.event_type === "test_run" && (
                <>
                  {" "}
                  → {e.passed ? "PASSED" : "FAILED"} ({e.tests_passed} tests)
                </>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default App;