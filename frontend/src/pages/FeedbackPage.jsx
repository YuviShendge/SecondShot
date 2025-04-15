import { useState } from "react";
import axios from "axios";

const FeedbackPage = () => {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/feedback", { message });
      setResponse(res.data.message);
      setMessage("");
    } catch (err) {
      console.error("Error submitting feedback:", err.response ? err.response.data : err);
      setResponse("Error submitting feedback");
    }
  };
  
  

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Submit Feedback</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full p-2 border rounded"
          rows="4"
          placeholder="Write your feedback..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded mt-2" type="submit">
          Submit
        </button>
      </form>
      {response && <p className="mt-2">{response}</p>}
    </div>
  );
};

export default FeedbackPage;
