import React, { useState } from "react";
import { motion } from "framer-motion";

// === Demo data ===
const trains = [
  {
    id: "train1",
    name: "Đoàn tàu A",
    color: "#ef4444",
    path: [
      {
        id: "hn",
        x: 420,
        y: 300,
        title: "Hà Nội",
        img: "https://placehold.co/200x120",
        desc: "Thủ đô Việt Nam"
      },
      {
        id: "bj",
        x: 520,
        y: 140,
        title: "Bắc Kinh",
        img: "https://placehold.co/200x120",
        desc: "Thủ đô Trung Quốc"
      },
      {
        id: "vt",
        x: 360,
        y: 380,
        title: "Viêng Chăn",
        img: "https://placehold.co/200x120",
        desc: "Thủ đô Lào"
      }
    ]
  }
];

const hotels = [
  {
    id: "hn-h",
    x: 430,
    y: 300,
    title: "Hotel Hà Nội",
    img: "https://placehold.co/240x140",
    desc: "4★ – Trung tâm Hà Nội"
  },
  {
    id: "qn-h",
    x: 480,
    y: 260,
    title: "Hotel Quảng Ninh",
    img: "https://placehold.co/240x140",
    desc: "5★ – Gần vịnh Hạ Long"
  },
  {
    id: "ha-h",
    x: 450,
    y: 360,
    title: "Hotel Hội An",
    img: "https://placehold.co/240x140",
    desc: "4★ – Phố cổ"
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState("all"); // all | train | hotel
  const [popup, setPopup] = useState(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [hoverCountry, setHoverCountry] = useState(null); // vn | cn | lao | null

  const clampScale = v => Math.min(3, Math.max(0.6, v));

  // Zoom centered on mouse
  const handleWheel = e => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    setScale(prev => {
      const next = clampScale(prev - e.deltaY * 0.0015);
      const ratio = next / prev;
      setOffset(o => ({
        x: mx - ratio * (mx - o.x),
        y: my - ratio * (my - o.y)
      }));
      return next;
    });
  };

  const fitToPoints = points => {
    if (!points?.length) return;

    const padding = 60;
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);

    const minX = Math.min(...xs) - padding;
    const maxX = Math.max(...xs) + padding;
    const minY = Math.min(...ys) - padding;
    const maxY = Math.max(...ys) + padding;

    const viewW = 900;
    const viewH = 520;

    const scaleX = viewW / (maxX - minX);
    const scaleY = viewH / (maxY - minY);
    const nextScale = clampScale(Math.min(scaleX, scaleY));

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    setScale(nextScale);
    setOffset({
      x: viewW / 2 - centerX * nextScale,
      y: viewH / 2 - centerY * nextScale
    });
  };

  const resetView = tab => {
    setActiveTab(tab);
    setPopup(null);

    if (tab === "train") {
      fitToPoints(trains[0].path);
    } else if (tab === "hotel") {
      fitToPoints(hotels);
    } else {
      setScale(1);
      setOffset({ x: 0, y: 0 });
    }
  };

  const allPoints = [
    ...trains.flatMap(t => t.path.map(p => ({ ...p, type: "train" }))),
    ...hotels.map(h => ({ ...h, type: "hotel" }))
  ];

  const visiblePoints =
    activeTab === "all"
      ? allPoints
      : activeTab === "train"
      ? trains[0].path
      : hotels;

  return (
    <div className="w-full h-screen bg-gray-100 p-4">
      {/* Tabs */}
      <div className="flex gap-2 mb-3">
        <button onClick={() => resetView("all")} className="px-3 py-1 rounded-xl bg-white shadow text-sm">
          🌍 All
        </button>
        <button onClick={() => resetView("train")} className="px-3 py-1 rounded-xl bg-white shadow text-sm">
          🚆 Tàu
        </button>
        <button onClick={() => resetView("hotel")} className="px-3 py-1 rounded-xl bg-white shadow text-sm">
          🏨 Khách sạn
        </button>
      </div>

      {/* Map */}
      <div
        className="relative overflow-hidden bg-white rounded-2xl shadow"
        style={{ height: 520 }}
        onWheel={handleWheel}
      >
        <motion.div
          animate={{ scale, x: offset.x, y: offset.y }}
          transition={{ type: "spring", damping: 30, stiffness: 120, mass: 0.6 }}
          className="origin-top-left w-[900px] h-[520px]"
        >
          {/* Vector map */}
          <svg width="900" height="520" className="absolute inset-0">
            <rect width="900" height="520" fill="#ecfeff" />

            {/* China */}
            <path
              d="M400 40 L700 40 L820 200 L650 260 L420 180 Z"
              fill={hoverCountry === "cn" ? "#bfdbfe" : "#e0f2fe"}
              stroke={hoverCountry === "cn" ? "#2563eb" : "#93c5fd"}
              strokeWidth={hoverCountry === "cn" ? 2 : 1}
              className="cursor-pointer transition-all"
              onMouseEnter={() => setHoverCountry("cn")}
              onMouseLeave={() => setHoverCountry(null)}
            />
            {hoverCountry === "cn" && (
              <text x="560" y="160" textAnchor="middle" fontSize="28" fill="#1e40af" opacity="0.25">
                TRUNG QUỐC
              </text>
            )}

            {/* Vietnam */}
            <path
              d="M420 200 L480 240 L460 360 L430 420 L390 380 L400 300 Z"
              fill={hoverCountry === "vn" ? "#bbf7d0" : "#dcfce7"}
              stroke={hoverCountry === "vn" ? "#15803d" : "#86efac"}
              strokeWidth={hoverCountry === "vn" ? 2 : 1}
              className="cursor-pointer transition-all"
              onMouseEnter={() => setHoverCountry("vn")}
              onMouseLeave={() => setHoverCountry(null)}
            />
            {hoverCountry === "vn" && (
              <text x="430" y="330" textAnchor="middle" fontSize="26" fill="#14532d" opacity="0.25">
                VIỆT NAM
              </text>
            )}

            {/* Laos */}
            <path
              d="M300 240 L420 200 L400 300 L360 420 L280 360 Z"
              fill={hoverCountry === "lao" ? "#fde68a" : "#fef3c7"}
              stroke={hoverCountry === "lao" ? "#ca8a04" : "#fde68a"}
              strokeWidth={hoverCountry === "lao" ? 2 : 1}
              className="cursor-pointer transition-all"
              onMouseEnter={() => setHoverCountry("lao")}
              onMouseLeave={() => setHoverCountry(null)}
            />
            {hoverCountry === "lao" && (
              <text x="340" y="330" textAnchor="middle" fontSize="24" fill="#92400e" opacity="0.25">
                LÀO
              </text>
            )}
          </svg>

          {/* Train route */}
          {activeTab === "train" && (
            <svg width="900" height="520" className="absolute inset-0">
              <motion.path
                d={`M ${trains[0].path.map(p => `${p.x} ${p.y}`).join(" L ")}`}
                stroke={trains[0].color}
                strokeWidth="4"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
              />
            </svg>
          )}

          {/* Points */}
          {visiblePoints.map(p => (
            <div
              key={p.id}
              onMouseEnter={() => setPopup(p)}
              onMouseLeave={() => setPopup(null)}
              className="absolute cursor-pointer"
              style={{ left: p.x - 5, top: p.y - 5 }}
            >
              <div className="w-3 h-3 rounded-full bg-black opacity-70" />
            </div>
          ))}
        </motion.div>

        {/* Popup (screen-space) */}
        {popup && (() => {
          const POPUP_W = 260;
          const POPUP_H = 220;
          const MARGIN = 12;

          const screenX = popup.x * scale + offset.x;
          const screenY = popup.y * scale + offset.y;

          let left = screenX + 10;
          let top = screenY + 10;

          if (left + POPUP_W > 900) left = screenX - POPUP_W - 10;
          if (top + POPUP_H > 520) top = screenY - POPUP_H - 10;

          return (
            <div
              className="absolute w-64 bg-white rounded-xl shadow p-3"
              style={{ left: Math.max(MARGIN, left), top: Math.max(MARGIN, top) }}
            >
              <img src={popup.img} alt="" className="rounded-lg mb-2" />
              <h3 className="font-semibold text-sm">{popup.title}</h3>
              <p className="text-xs text-gray-600">{popup.desc}</p>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
