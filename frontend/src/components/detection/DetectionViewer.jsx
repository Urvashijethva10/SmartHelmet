import React, { useState } from 'react';
import { Layers, Eye, EyeOff, Maximize2, ZoomIn, ZoomOut, Check, SlidersHorizontal } from 'lucide-react';
import { getClassBadgeColor } from '../../utils/formatters';

export default function DetectionViewer({ originalUrl, annotatedBase64, detections, filename }) {
  const [showAnnotated, setShowAnnotated] = useState(true);
  const [filterClass, setFilterClass] = useState('ALL');
  const [zoom, setZoom] = useState(1);

  const classes = ['ALL', 'Helmet', 'No-Helmet', 'Vest', 'No-Vest', 'Person'];

  const filteredDetections = filterClass === 'ALL'
    ? detections
    : detections.filter((d) => d.class_name === filterClass);

  return (
    <div className="industrial-panel rounded-2xl p-6 space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-industrial-700/60">
        <div>
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-safety-cyan" /> Visual Detection Output
          </h4>
          <span className="text-xs text-slate-400 font-mono">{filename || 'inspected_frame.jpg'}</span>
        </div>

        {/* View Switcher & Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Toggle Annotated vs Original */}
          <div className="flex items-center p-1 rounded-xl bg-industrial-850 border border-industrial-700 text-xs">
            <button
              onClick={() => setShowAnnotated(true)}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                showAnnotated
                  ? 'bg-safety-amber text-industrial-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Annotated (YOLO)
            </button>
            <button
              onClick={() => setShowAnnotated(false)}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                !showAnnotated
                  ? 'bg-safety-amber text-industrial-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Original Source
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-industrial-850 border border-industrial-700 rounded-xl p-1">
            <button
              onClick={() => setZoom((z) => Math.max(0.75, z - 0.25))}
              className="p-1 rounded-lg hover:bg-industrial-700 text-slate-300 transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-1 text-slate-400">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))}
              className="p-1 rounded-lg hover:bg-industrial-700 text-slate-300 transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Image Display Viewport */}
      <div className="relative w-full min-h-[380px] max-h-[600px] overflow-auto rounded-xl bg-industrial-950 border border-industrial-800 flex items-center justify-center p-2">
        <div
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          className="transition-transform duration-200"
        >
          {showAnnotated && annotatedBase64 ? (
            <img
              src={annotatedBase64}
              alt="YOLO Annotated PPE Detections"
              className="max-h-[560px] w-auto rounded-lg object-contain shadow-2xl"
            />
          ) : originalUrl ? (
            <img
              src={originalUrl}
              alt="Original Upload"
              className="max-h-[560px] w-auto rounded-lg object-contain shadow-2xl"
            />
          ) : (
            <div className="text-slate-500 text-sm">No image available</div>
          )}
        </div>
      </div>

      {/* Quick Class Highlight Filter Bar */}
      <div className="pt-2 flex items-center gap-2 flex-wrap text-xs">
        <span className="text-slate-400 font-medium flex items-center gap-1">
          <SlidersHorizontal className="w-3.5 h-3.5" /> Filter Table:
        </span>
        {classes.map((cls) => {
          const isSelected = filterClass === cls;
          return (
            <button
              key={cls}
              onClick={() => setFilterClass(cls)}
              className={`px-2.5 py-1 rounded-lg font-medium transition text-xs border ${
                isSelected
                  ? 'bg-industrial-700 text-white border-slate-500'
                  : 'bg-industrial-850 text-slate-400 border-industrial-750 hover:text-slate-200'
              }`}
            >
              {cls}
            </button>
          );
        })}
      </div>
    </div>
  );
}
