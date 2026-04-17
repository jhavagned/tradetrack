import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/health")
      .then((res) => res.json())
      .then((data) => setMessage(data.message));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>TradeTrack</h1>
      <p>Backend says: {message}</p>
    </div>
  );
}

export default App;