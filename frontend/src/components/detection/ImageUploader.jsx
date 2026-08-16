import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Sliders, Play, AlertCircle, Loader2, Sparkles } from 'lucide-react';

export default function ImageUploader({ onDetect, isAnalyzing }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [confidence, setConfidence] = useState(0.30);
  const fileInputRef = useRef(null);

  const handleFileChange = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedFile) {
      onDetect(selectedFile, confidence);
    }
  };

  return (
    <div className="industrial-panel rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-safety-amber" /> Upload Construction Site Image
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Supports JPEG, PNG, WebP up to 25MB for real-time YOLO11 PPE analysis
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Drag and Drop Box */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
            dragActive
              ? 'border-safety-amber bg-safety-amber/10 scale-[1.01]'
              : 'border-industrial-700 hover:border-slate-500 bg-industrial-900/60 hover:bg-industrial-850'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
            }}
          />

          {previewUrl ? (
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-48 h-32 rounded-xl overflow-hidden border border-industrial-700 bg-industrial-950 shadow-md">
                <img
                  src={previewUrl}
                  alt="Upload Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center p-2">
                  <span className="text-[11px] font-mono text-white truncate max-w-full">
                    {selectedFile?.name}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Click or drag another image to replace
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="p-4 rounded-2xl bg-industrial-800 border border-industrial-700 text-safety-amber shadow-inner">
                <UploadCloud className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  Click to browse or drag & drop worker photo
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  YOLO11 will automatically scan for Helmets, Vests, and Personnel
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Controls: Confidence Slider & Action Button */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
          {/* Confidence Slider */}
          <div className="p-3.5 rounded-xl bg-industrial-850 border border-industrial-700/60 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-safety-cyan" /> Confidence Threshold
              </span>
              <span className="font-mono font-bold text-safety-cyan bg-industrial-800 px-2 py-0.5 rounded border border-industrial-700">
                {Math.round(confidence * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.90"
              step="0.05"
              value={confidence}
              onChange={(e) => setConfidence(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-industrial-700 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>10% (High Recall)</span>
              <span>50%</span>
              <span>90% (Strict)</span>
            </div>
          </div>

          {/* Run Inference Button */}
          <button
            type="submit"
            disabled={!selectedFile || isAnalyzing}
            className={`w-full py-4 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition shadow-lg ${
              !selectedFile || isAnalyzing
                ? 'bg-industrial-800 text-slate-500 cursor-not-allowed border border-industrial-700'
                : 'bg-gradient-to-r from-safety-amber to-safety-orange hover:from-amber-400 hover:to-orange-400 text-industrial-950 shadow-safety-amber/20 hover:scale-[1.01] active:scale-[0.99]'
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Running YOLO11 Inference...</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-industrial-950" />
                <span>Run PPE Safety Scan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
