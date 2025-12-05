import React, { useEffect, useState } from "react";
import API from "../api/api.js";
import { Link, useNavigate } from "react-router-dom";
import { removeToken, getToken } from "../utils/auth.js";

export default function Dashboard() {
  const [inspections, setInspections] = useState([]);
  const navigate = useNavigate();

  const fetchInspections = async () => {
    try {
      const res = await API.get("/inspections", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setInspections(res.data || []);
    } catch (err) {
      console.error("Fetch inspections failed:", err);
      alert("Failed to fetch inspections");
    }
  };

  useEffect(() => { fetchInspections(); }, []);

  const handleLogout = () => {
    removeToken();
    navigate("/login");
  };

  const handleDownloadPDF = async (id) => {
    try {
      const token = getToken();
      const res = await fetch(`http://127.0.0.1:5000/inspections/${id}/pdf`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch PDF");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `inspection_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download PDF failed:", err);
      alert("Failed to download PDF");
    }
  };

  const handleDeleteInspection = async (id) => {
    if (!window.confirm("Delete this inspection?")) return;
    try {
      await API.delete(`/inspections/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setInspections((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error("Delete inspection failed:", err);
      alert(err.response?.data?.msg || "Failed to delete inspection");
    }
  };

  return (
    <div style={{ padding: 30, fontFamily: "Arial, sans-serif", background: "#f5f6fa", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
        <h1 style={{ color: "#2f3640" }}>Property Dashboard</h1>
        <div>
          <Link to="/new-inspection" style={{ marginRight: 15, textDecoration: "none", background: "#0097e6", color: "#fff", padding: "10px 20px", borderRadius: 5 }}>New Inspection</Link>
          <button onClick={handleLogout} style={{ padding: "10px 20px", borderRadius: 5, border: "none", background: "#e84118", color: "#fff", cursor: "pointer" }}>Logout</button>
        </div>
      </div>

      {inspections.length === 0 ? (
        <p style={{ color: "#718093" }}>No inspections yet. Click "New Inspection" to create one.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {inspections.map((i) => (
            <div key={i.id} style={{ background: "#fff", borderRadius: 10, padding: 20, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
              <h2 style={{ margin: 0, color: "#2f3640" }}>{i.address}</h2>
              <p style={{ color: "#718093", marginTop: 10 }}>{i.notes}</p>
              {i.photos && i.photos.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
                  {i.photos.map((url, idx) => <img key={idx} src={url} alt="inspection" style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 5 }} />)}
                </div>
              )}
              <button onClick={() => handleDownloadPDF(i.id)} style={{ display: "block", marginTop: 15, textAlign: "center", textDecoration: "none", background: "#44bd32", color: "#fff", padding: "10px 0", borderRadius: 5, fontWeight: "bold", width: "100%", cursor: "pointer" }}>Download PDF</button>
              <div style={{ display: "flex", marginTop: 10 }}>
                <button onClick={() => navigate(`/edit-inspection/${i.id}`)} style={{ flex: 1, marginRight: 5, background: "#fbc531", color: "#fff", border: "none", padding: "5px 0", borderRadius: 5, cursor: "pointer" }}>Edit</button>
                <button onClick={() => handleDeleteInspection(i.id)} style={{ flex: 1, background: "#e84118", color: "#fff", border: "none", padding: "5px 0", borderRadius: 5, cursor: "pointer" }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
