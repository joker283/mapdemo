import React, { useState } from "react";
import { motion } from "framer-motion";

// === Demo data ===
const trains = [
  {
    id: "train1",
    name: "Đoàn tàu A",
    color: "#ef4444",
    path: [
      { id: "hn", x: 420, y: 300, title: "Hà Nội", img: "https://placehold.co/200x120", desc: "Thủ đô Việt Nam" },
      { id: "bj", x: 520, y: 140, title: "Bắc Kinh", img: "https://placehold.co/200x120", desc: "Thủ đô Trung Quốc" },
      { id: "vt", x: 360, y: 380, title: "Viêng Chăn", img: "https://placehold.co/200x120", desc: "Thủ đô Lào" }
    ]
  }
];

const hotels = [
  { id: "hn-h", x: 430, y: 300, title: "Hotel Hà Nội", img: "https://placehold.co/240x140", desc: "4★ – Trung tâm Hà Nội" },
  { id: "qn-h", x: 480, y: 260, title: "Hotel Quảng Ninh", img: "https://placehold.co/240x140", desc: "5★ – Gần vịnh Hạ Long" },
  { id: "ha-h", x: 450, y: 360, title: "Hotel Hội An", img: "https://placehold.co/240x140", desc: "4★ – Phố cổ" }
];

export default function MapDemo() {
  const [activeTab, setActiveTab] = useState("all");
  const [popup, setPopup] = useState(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [hoverCountry, setHoverCountry] = useState(null);

  const clampScale = v => Math.min(2.5, Math.max(0.7, v));

  const handleWheel = e => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    setScale(prev => {
      const next = clampScale(prev - e.deltaY * 0.0012);
      const ratio = next / prev;
      setOffset(o => ({
        x: mx - ratio * (mx - o.x),
        y: my - ratio * (my - o.y)
      }));
      return next;
    });
  };

  const resetView = tab => {
    setActiveTab(tab);
    setPopup(null);
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const allPoints = [
    ...trains[0].path.map(p => ({ ...p, type: "train" })),
    ...hotels.map(h => ({ ...h, type: "hotel" }))
  ];

  const visiblePoints =
    activeTab === "all" ? allPoints : activeTab === "train" ? trains[0].path : hotels;

  return (
    <div className="w-full h-screen bg-gray-100 p-4">
      <div className="flex gap-2 mb-3">
        <button onClick={() => resetView("all")} className={`px-3 py-1 rounded-xl shadow text-sm ${activeTab === 'all' ? 'bg-blue-500 text-white' : 'bg-white'}`}>🌍 All</button>
        <button onClick={() => resetView("train")} className={`px-3 py-1 rounded-xl shadow text-sm ${activeTab === 'train' ? 'bg-blue-500 text-white' : 'bg-white'}`}>🚆 Tàu</button>
        <button onClick={() => resetView("hotel")} className={`px-3 py-1 rounded-xl shadow text-sm ${activeTab === 'hotel' ? 'bg-blue-500 text-white' : 'bg-white'}`}>🏨 Khách sạn</button>
      </div>

      <div
        className="relative overflow-hidden bg-white rounded-2xl shadow"
        style={{ height: 520 }}
        onWheel={handleWheel}
      >
        <motion.div
          animate={{ scale, x: offset.x, y: offset.y }}
          transition={{ type: "spring", damping: 26, stiffness: 140 }}
          className="origin-top-left w-[900px] h-[520px]"
        >
          <svg width="900" height="520" className="absolute inset-0">
            <rect width="900" height="520" fill="#ecfeff" />

            <path d="M400 40 L700 40 L820 200 L650 260 L420 180 Z" fill={hoverCountry === 'cn' ? '#bfdbfe' : '#e0f2fe'} stroke="#93c5fd" onMouseEnter={() => setHoverCountry('cn')} onMouseLeave={() => setHoverCountry(null)} />
            {hoverCountry === 'cn' && <text x="560" y="160" textAnchor="middle" fontSize="28" fill="#1e40af" opacity="0.25">TRUNG QUỐC</text>}

            <path d="M420 200 L480 240 L460 360 L430 420 L390 380 L400 300 Z" fill={hoverCountry === 'vn' ? '#bbf7d0' : '#dcfce7'} stroke="#86efac" onMouseEnter={() => setHoverCountry('vn')} onMouseLeave={() => setHoverCountry(null)} />
            {hoverCountry === 'vn' && <text x="430" y="330" textAnchor="middle" fontSize="26" fill="#14532d" opacity="0.25">VIỆT NAM</text>}

            <path d="M300 240 L420 200 L400 300 L360 420 L280 360 Z" fill={hoverCountry === 'lao' ? '#fde68a' : '#fef3c7'} stroke="#fde68a" onMouseEnter={() => setHoverCountry('lao')} onMouseLeave={() => setHoverCountry(null)} />
            {hoverCountry === 'lao' && <text x="340" y="330" textAnchor="middle" fontSize="24" fill="#92400e" opacity="0.25">LÀO</text>}
          </svg>

          {activeTab === "train" && (
            <svg width="900" height="520" className="absolute inset-0">
              <motion.path d={`M ${trains[0].path.map(p => `${p.x} ${p.y}`).join(" L ")}`} stroke="#ef4444" strokeWidth="4" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />
            </svg>
          )}

          {visiblePoints.map(p => (
            <div key={p.id} className="absolute" style={{ left: p.x - 4, top: p.y - 4 }} onMouseEnter={() => setPopup(p)} onMouseLeave={() => setPopup(null)}>
              <div className="w-3 h-3 rounded-full bg-black" />
            </div>
          ))}
        </motion.div>

        {popup && (
          <div
            className="absolute w-64 bg-white rounded-xl shadow p-3"
            style={{ left: popup.x * scale + offset.x + 12, top: popup.y * scale + offset.y + 12 }}
          >
            <img src={popup.img} alt="" className="rounded-lg mb-2" />
            <h3 className="font-semibold text-sm">{popup.title}</h3>
            <p className="text-xs text-gray-600">{popup.desc}</p>
          </div>
        )}
      </div>
    </div>
  );
}
