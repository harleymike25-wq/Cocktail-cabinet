import { useRef, useState } from "react";

export default function PhotoCapture({ onCapture }) {
  const fileRef = useRef();
  const [preview, setPreview] = useState(null);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const MAX = 1280;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      setPreview(dataUrl);
      const data = dataUrl.split(",")[1];
      onCapture(data, "image/jpeg");
    };
    img.src = objectUrl;
  }

  function openCamera() {
    fileRef.current.setAttribute("capture", "environment");
    fileRef.current.accept = "image/*";
    fileRef.current.click();
  }

  function openGallery() {
    fileRef.current.removeAttribute("capture");
    fileRef.current.accept = "image/*";
    fileRef.current.click();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {preview && (
        <img
          src={preview}
          alt="bottle preview"
          style={{ width: "100%", maxHeight: 180, objectFit: "contain", borderRadius: "var(--radius)", background: "var(--bg-surface)" }}
        />
      )}
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn btn--ghost" onClick={openCamera}>📷 Camera</button>
        <button className="btn btn--ghost" onClick={openGallery}>🖼 Upload Photo</button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
    </div>
  );
}
