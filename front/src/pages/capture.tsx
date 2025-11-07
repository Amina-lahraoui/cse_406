"use client";

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Camera, Download, Trash2, RotateCw, Home, Volume2, VolumeX } from "lucide-react";

interface DeviceInfo extends MediaDeviceInfo {
  deviceId: string;
  label: string;
  kind: string;
}
type PermissionState = "unknown" | "granted" | "denied";
type FacingMode = "user" | "environment";

export default function CameraCapture(): JSX.Element {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const videoRef = useRef < HTMLVideoElement > (null);
  const canvasRef = useRef < HTMLCanvasElement > (null);
  const streamRef = useRef < MediaStream | null > (null);
  const fileInputRef = useRef < HTMLInputElement > (null);

  const [permissionState, setPermissionState] = useState < PermissionState > ("unknown");
  const [facingMode, setFacingMode] = useState < FacingMode > ("user");
  const [capturedDataUrl, setCapturedDataUrl] = useState < string | null > (null);
  const [error, setError] = useState < string | null > (null);
  const [devices, setDevices] = useState < DeviceInfo[] > ([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState < string | null > (null);
  const [isMuted, setIsMuted] = useState < boolean > (true);

  const startCamera = async (deviceId: string | null = null): Promise<void> => {
    stopCamera();
    setError(null);

    try {
      const constraints: MediaStreamConstraints = deviceId
        ? { video: { deviceId: { exact: deviceId } } }
        : { video: { facingMode } };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setPermissionState("granted");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("startCamera error", err);
      setError(errorMessage);
      setPermissionState("denied");
    }
  };

  const stopCamera = (): void => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      }
    } catch (err) {
      console.error("stopCamera error", err);
    }
  };

  const capturePhoto = (): void => {
    setError(null);
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement("canvas");

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (facingMode === "user") {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedDataUrl(dataUrl);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Veuillez choisir un fichier image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCapturedDataUrl(result);
    };
    reader.onerror = () => setError("Impossible de charger l'image.");
    reader.readAsDataURL(file);
  };

  const enumerateVideoDevices = async (): Promise<void> => {
    try {
      const all = await navigator.mediaDevices.enumerateDevices();
      const vids = all.filter((d) => d.kind === "videoinput") as DeviceInfo[];
      setDevices(vids);
      if (vids.length && !selectedDeviceId) {
        setSelectedDeviceId(vids[0].deviceId);
      }
    } catch (err) {
      console.warn("enumerateDevices error", err);
    }
  };

  useEffect(() => {
    if (selectedDeviceId) {
      startCamera(selectedDeviceId);
    }
  }, [selectedDeviceId]);

  useEffect(() => {
    let mounted = true;

    const initCamera = async (): Promise<void> => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("La capture vidéo n'est pas supportée par ce navigateur.");
        return;
      }

      await enumerateVideoDevices();

      if (navigator.permissions && navigator.permissions.query) {
        try {
          const res = await navigator.permissions.query({ name: "camera" } as PermissionDescriptor);
          if (!mounted) return;
          setPermissionState(res.state as PermissionState);
          res.addEventListener("change", () => {
            if (mounted) setPermissionState(res.state as PermissionState);
          });
        } catch (err) {
          console.warn("Permission query not supported", err);
        }
      }
    };

    initCamera();

    return () => {
      mounted = false;
      stopCamera();
    };
  }, []);

  const toggleFacing = (): void => {
    setFacingMode((f) => (f === "user" ? "environment" : "user"));
    setSelectedDeviceId(null);
    startCamera();
  };

  const downloadCaptured = (): void => {
    if (!capturedDataUrl) return;
    const a = document.createElement("a");
    a.href = capturedDataUrl;
    a.download = `photo-${Date.now()}.jpg`;
    a.click();
  };

  const handleGoHome = (): void => {
    stopCamera();
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-stone-200">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Capture Photo</h1>
                <p className="text-sm text-gray-500">Prenez ou importez une photo</p>
              </div>
            </div>
            <button
              onClick={handleGoHome}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Retour à l'accueil"
            >
              <Home className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Section Capture */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Video Section */}
              <div className="relative bg-black rounded-t-2xl overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-[500px] object-cover"
                  playsInline
                  muted={isMuted}
                />

                {error && (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-t-2xl">
                    <div className="text-center">
                      <p className="text-red-400 text-lg font-semibold">{error}</p>
                    </div>
                  </div>
                )}

                {/* Mute Button */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full transition-all border border-white/30"
                  aria-label={isMuted ? "Activer le son" : "Désactiver le son"}
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5 text-white" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>

              {/* Controls Section */}
              <div className="p-6 space-y-4">
                {/* Device Selection */}
                {devices.length > 0 && (
                  <div className="space-y-2">
                    <label htmlFor="camera-select" className="text-sm font-medium text-gray-700">
                      Sélectionner la caméra
                    </label>
                    <select
                      id="camera-select"
                      value={selectedDeviceId || ""}
                      onChange={(e) => setSelectedDeviceId(e.target.value || null)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      <option value="">(Caméra par défaut)</option>
                      {devices.map((d) => (
                        <option key={d.deviceId} value={d.deviceId}>
                          {d.label || `Caméra ${d.deviceId}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => startCamera(selectedDeviceId)}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Démarrer
                  </button>

                  <button
                    onClick={stopCamera}
                    className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-all duration-300"
                  >
                    Arrêter
                  </button>

                  <button
                    onClick={toggleFacing}
                    className="flex-1 px-4 py-3 bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <RotateCw className="w-5 h-5" />
                    Basculer
                  </button>
                </div>

                {/* Capture & Import */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={capturePhoto}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <Camera className="w-5 h-5" />
                    Prendre une photo
                  </button>

                  <label className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg transition-all duration-300 cursor-pointer flex items-center justify-center gap-2">
                    Importer une image
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={onFileChange}
                      className="hidden"
                      aria-label="Importer une image"
                    />
                  </label>
                </div>

                {/* Permission Status */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">État de permission :</span>
                  <span
                    className={`text-sm font-semibold px-3 py-1 rounded-full ${permissionState === "granted"
                        ? "bg-emerald-100 text-emerald-700"
                        : permissionState === "denied"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                  >
                    {permissionState === "granted"
                      ? "Accordée"
                      : permissionState === "denied"
                        ? "Refusée"
                        : "Inconnue"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Aperçu</h3>

              {capturedDataUrl ? (
                <>
                  <img
                    src={capturedDataUrl}
                    alt="Aperçu de la photo capturée"
                    className="w-full rounded-xl object-contain mb-4 shadow-md"
                  />

                  <div className="space-y-3">
                    <button
                      onClick={downloadCaptured}
                      className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Télécharger
                    </button>

                    <button
                      onClick={() => setCapturedDataUrl(null)}
                      className="w-full px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-5 h-5" />
                      Supprimer
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Aucune photo capturée</p>
                  </div>
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700 leading-relaxed">
                  💡 <strong>Astuce :</strong> Sur mobile, autorise l&apos;accès à la caméra quand le
                  navigateur le demande. HTTPS requis pour getUserMedia.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}