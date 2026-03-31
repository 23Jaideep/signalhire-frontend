// import React, { useState } from "react";

// function App() {
//   const [candidateId, setCandidateId] = useState("");
//   const [sessions, setSessions] = useState([]);
//   const [selectedSession, setSelectedSession] = useState(null);
//   const [sessionData, setSessionData] = useState(null);

//   const fetchCandidate = async () => {
//     const res = await fetch(`http://127.0.0.1:8000/candidate/${candidateId}`);
//     const data = await res.json();
//     setSessions(data.sessions);
//     setSelectedSession(null);
//     setSessionData(null);
//   };

//   const fetchSession = async (session_id) => {
//     const res = await fetch(`http://127.0.0.1:8000/session/${session_id}`);
//     const data = await res.json();
//     setSelectedSession(session_id);
//     setSessionData(data);
//   };

//   return (
//     <div style={{ padding: 20 }}>
//       <h2>Candidate Viewer</h2>

//       <input
//         placeholder="Enter candidate ID"
//         value={candidateId}
//         onChange={(e) => setCandidateId(e.target.value)}
//       />
//       <button onClick={fetchCandidate}>Load</button>

//       <hr />

//       <h3>Sessions</h3>
//       {sessions.map((s) => (
//         <div key={s.session_id} style={{ marginBottom: 10 }}>
//           <button onClick={() => fetchSession(s.session_id)}>
//             {s.session_id}
//           </button>
//           <div>
//             Iteration: {s.summary.scores.iteration ?? "N/A"} | Adaptability:{" "}
//             {s.summary.scores.adaptability ?? "N/A"} | Recovery:{" "}
//             {s.summary.scores.recovery ?? "N/A"}
//           </div>
//         </div>
//       ))}

//       <hr />

//       {sessionData && (
//         <>
//           <h3>Session Details</h3>

//           <div>
//             <b>Iteration:</b> {sessionData.summary.scores.iteration ?? "N/A"}
//           </div>
//           <div>
//             <b>Adaptability:</b>{" "}
//             {sessionData.summary.scores.adaptability ?? "N/A"}
//           </div>
//           <div>
//             <b>Recovery:</b> {sessionData.summary.scores.recovery ?? "N/A"}
//           </div>

//           <h4>Events Timeline</h4>
//           {sessionData.events.map((e, idx) => (
//             <div key={idx}>
//               [{new Date(e.timestamp * 1000).toLocaleTimeString()}]{" "}
//               {e.event_type}
//               {e.event_type === "test_run" && (
//                 <>
//                   {" "}
//                   → {e.passed ? "PASSED" : "FAILED"} ({e.tests_passed} tests)
//                 </>
//               )}
//             </div>
//           ))}
//         </>
//       )}
//     </div>
//   );
// }

// export default App;

import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";

function App() {
  // --- STATE ---
  const [code, setCode] = useState(`def add(a, b):
    return a - b  # BUG: should be +`);

  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  // --- START SESSION ---
  const startSession = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/session/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          candidate_id: "test_user",
          task_name: "task1",
        }),
      });

      const data = await res.json();
      setSessionId(data.session_id);

      console.log("SESSION STARTED:", data.session_id);
    } catch (err) {
      console.error("Failed to start session", err);
      setOutput("Failed to start session");
    }
  };

  // --- AUTO START ON LOAD ---
  useEffect(() => {
    startSession();
  }, []);

  // --- RUN TESTS (REAL BACKEND) ---
  const runTests = async () => {
    if (!sessionId) {
      setOutput("Session not started yet");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/run_tests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          session_id: sessionId,
        }),
      });

      const data = await res.json();

      if (data.passed) {
        setOutput("PASSED");
      } else {
        setOutput("FAILED");
      }

    } catch (err) {
      console.error(err);
      setOutput("Error connecting to backend");
    }

    setLoading(false);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      {/* LEFT: EDITOR */}
      <div style={{ flex: 2 }}>
        <Editor
          height="100%"
          defaultLanguage="python"
          value={code}
          onChange={(value) => setCode(value)}
          theme="vs-dark"
        />
      </div>

      {/* RIGHT: PANEL */}
      <div style={{ flex: 1, padding: 20, borderLeft: "1px solid gray" }}>
        
        <h3>Test Runner</h3>

        <div style={{ marginBottom: 10 }}>
          <b>Session ID:</b>
          <div style={{ fontSize: 12 }}>
            {sessionId || "Starting..."}
          </div>
        </div>

        <button onClick={runTests} disabled={loading}>
          {loading ? "Running..." : "Run Tests"}
        </button>

        <div style={{ marginTop: 20 }}>
          <b>Output:</b>
          <pre>{output}</pre>
        </div>

      </div>
    </div>
  );
}

export default App;