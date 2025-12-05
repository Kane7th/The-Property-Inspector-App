import { useState, useEffect } from "react";
import API from "../api/api.js";
import { useNavigate, useParams } from "react-router-dom";
import { getToken } from "../utils/auth.js";

export default function NewInspection() {
  const { id } = useParams();
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [images, setImages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      API.get(`/inspections/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
        .then(res => {
          setAddress(res.data.address || "");
          setNotes(res.data.notes || "");
        })
        .catch(console.error);
    }
  }, [id]);

  const handleImageUpload = async (file) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD}/image/upload`,
      { method: "POST", body: formData }
    );
    const data = await res.json();
    return data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let inspectionId = id;

      if (id) {
        await API.put(
          `/inspections/${id}`,
          { address, notes },
          { headers: { Authorization: `Bearer ${getToken()}` } }
        );
      } else {
        const createRes = await API.post(
          "/inspections/create",
          { address, notes },
          { headers: { Authorization: `Bearer ${getToken()}` } }
        );
        inspectionId = createRes.data.inspection_id;
      }

      for (let file of images) {
        const imageUrl = await handleImageUpload(file);
        await API.post(
          "/inspections/upload-photo",
          { inspection_id: inspectionId, label: "Photo", image_url: imageUrl },
          { headers: { Authorization: `Bearer ${getToken()}` } }
        );
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("Save failed:", err);
      alert(err.response?.data?.msg || "Failed to save inspection");
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1>{id ? "Edit Inspection" : "New Inspection"}</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Property Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          style={{ width: "100%", padding: 10, marginBottom: 15, borderRadius: 5, border: "1px solid #ccc" }}
        />
        <textarea
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 15, borderRadius: 5, border: "1px solid #ccc" }}
        />
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setImages(Array.from(e.target.files))}
          style={{ marginBottom: 15 }}
        />
        <button
          type="submit"
          style={{ padding: "10px 20px", borderRadius: 5, border: "none", background: "#0097e6", color: "#fff", cursor: "pointer", fontWeight: "bold" }}
        >
          {id ? "Update Inspection" : "Save Inspection"}
        </button>
      </form>
    </div>
  );
}
