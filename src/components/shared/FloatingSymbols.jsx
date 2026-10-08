import React from 'react';

export function FloatingSymbols() {
  const symbols = [
    { text: "√169", top: "10%", left: "7%", size: "36px" },
    { text: "a² + b² = c²", top: "22%", left: "82%", size: "32px" },
    { text: "3-4-5", top: "74%", left: "10%", size: "38px" },
    { text: "√52 ≈ 7.2", top: "82%", left: "76%", size: "34px" },
    { text: "⊾", top: "42%", left: "93%", size: "32px" },
    { text: "10² − 6² = 8²", top: "16%", left: "46%", size: "28px" },
    { text: "△PQR", top: "64%", left: "52%", size: "30px" },
    { text: "5-12-13", top: "88%", left: "36%", size: "36px" }
  ];

  return (
    <div className="floating-bg-container">
      {symbols.map((s, idx) => (
        <span
          key={idx}
          className="floating-bg-item"
          style={{
            top: s.top,
            left: s.left,
            fontSize: s.size,
            animationDelay: `${idx * 2.2}s`
          }}
        >
          {s.text}
        </span>
      ))}
    </div>
  );
}
