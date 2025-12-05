import { useState, useEffect } from "react";
import API from "../api/api.js";
import { useNavigate, useParams } from "react-router-dom";
import { getToken } from "../utils/auth.js";

export default function NewInspection() {
  const { id } = useParams(); // edit mode if id exists
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [images, setImages] = useState([]); // [{id?, file?, url, label}]
  const navigate = useNavigate();

  // Fetch inspection data in edit mode
  useEffect(() => {
    if (id) {
      API.get(`/inspections/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
        .then(res => {
          setAddress(res.data.address || "");
          setNotes(res.data.notes || "");
          if (res.data.photos) {
            const preloaded = res.data.photos.map(p => ({
              id: p.id,
              file: null,
              url: p.url,
              label: p.label || ""
            }));
            setImages(preloaded);
          }
        })
        .catch(console.error);
    }
  }, [id]);

  // Handle new file selection
  const handleFileSelect = (files) => {
    const newImages = Array.from(files).map(file => ({
      file,
      url: URL.createObjectURL(file),
      label: ""
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  // Remove image
  const removeImage = async (index) => {
    const img = images[index];
    if (img.id) {
      // Delete existing photo from backend
      try {
        await API.delete(`/inspections/photos/${img.id}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
      } catch (err) {
        console.error("Failed to delete photo:", err);
        alert("Failed to delete photo");
        return;
      }
    }
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Update image label
  const updateImageLabel = (index, label) => {
    setImages(prev => {
      const newImages = [...prev];
      newImages[index].label = label;
      return newImages;
    });
  };

  // Upload new image to Cloudinary
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

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let inspectionId = id;

      // Create or update inspection
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

      // Handle all images
      for (let img of images) {
        if (img.file) {
          // Upload new file and save to backend
          const imageUrl = await handleImageUpload(img.file);
          await API.post(
            "/inspections/upload-photo",
            { inspection_id: inspectionId, label: img.label || "Photo", image_url: imageUrl },
            { headers: { Authorization: `Bearer ${getToken()}` } }
          );
        } else if (img.id) {
          // Update label of existing photo if changed
          await API.put(
            `/inspections/photos/${img.id}`,
            { label: img.label || "Photo", url: img.url },
            { headers: { Authorization: `Bearer ${getToken()}` } }
          );
        }
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
          onChange={(e) => handleFileSelect(e.target.files)}
          style={{ marginBottom: 15 }}
        />

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 15 }}>
          {images.map((img, idx) => (
            <div key={idx} style={{ position: "relative", width: 120 }}>
              <img
                src={img.url}
                alt="preview"
                style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 5 }}
              />
              <input
                type="text"
                placeholder="Label"
                value={img.label}
                onChange={(e) => updateImageLabel(idx, e.target.value)}
                style={{ width: "100%", marginTop: 5, borderRadius: 5, padding: 3, border: "1px solid #ccc" }}
              />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  background: "#e84118",
                  color: "#fff",
                  border: "none",
                  borderRadius: "50%",
                  width: 20,
                  height: 20,
                  cursor: "pointer"
                }}
              >
                X
              </button>
            </div>
          ))}
        </div>

        <button
          type="submit"
          style={{
            padding: "10px 20px",
            borderRadius: 5,
            border: "none",
            background: "#0097e6",
            color: "#fff",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          {id ? "Update Inspection" : "Save Inspection"}
        </button>
      </form>
    </div>
  );
}
