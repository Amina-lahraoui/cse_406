import { useState } from "react";
import { Camera, Upload as Uploadd, X, Check } from "lucide-react";

export default function Upload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Choisir un fichier ou une photo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file)); // génère un aperçu
    }
  };

  // Annuler
  const handleCancel = () => {
    setSelectedFile(null);
    setPreview(null);
  };

  // Valider et envoyer au backend
  const handleSubmit = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("http://localhost:8080/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        alert("Fichier envoyé avec succès !");
        handleCancel();
      } else {
        alert("Erreur lors de l'envoi !");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white p-6">
      {!preview ? (
        <div className="space-y-6 text-center">
          <h2 className="text-2xl font-bold">Choisis une option</h2>
          <div className="flex space-x-6">
            {/* Importer un fichier */}
            <label className="cursor-pointer flex flex-col items-center p-6 bg-white/10 rounded-xl hover:bg-white/20 transition">
              <Uploadd className="w-8 h-8 mb-2" />
              <span>Importer</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            {/* Prendre une photo */}
            <label className="cursor-pointer flex flex-col items-center p-6 bg-white/10 rounded-xl hover:bg-white/20 transition">
              <Camera className="w-8 h-8 mb-2" />
              <span>Prendre photo</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>
      ) : (
        <div className="space-y-6 text-center">
          <h2 className="text-xl font-semibold">Aperçu</h2>
          <img
            src={preview}
            alt="Preview"
            className="max-w-xs rounded-lg shadow-lg mx-auto"
          />

          <div className="flex justify-center space-x-6">
            <button
              onClick={handleCancel}
              className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-full transition"
            >
              <X className="w-5 h-5" /> <span>Annuler</span>
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-full transition"
            >
              <Check className="w-5 h-5" /> <span>Valider</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
