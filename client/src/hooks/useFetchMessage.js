// src/hooks/useFetchMessage.js
import { useState, useEffect } from "react";

function useFetchMessage() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/message")
      .then((response) => response.json())
      .then((data) => setMessage(data.message))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  // Return both the message and the setMessage function
  return [message, setMessage];
}

export default useFetchMessage;
