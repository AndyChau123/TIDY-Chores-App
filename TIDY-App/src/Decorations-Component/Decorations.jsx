import React, { useEffect, useState } from "react";
import "./Decorations.css";

// ============================================================================
// DECORATIONS COMPONENT
// Renders the active decoration overlay on the entire app
// ============================================================================
function Decorations({ activeDecoration }) {
  if (!activeDecoration) return null;

  return (
    <div className="decorations-container">
      {activeDecoration === "halloween" && <HalloweenDecoration />}
      {activeDecoration === "christmas_lights" && <ChristmasLightsDecoration />}
      {activeDecoration === "snowflakes" && <SnowflakesDecoration />}
    </div>
  );
}

// ============================================================================
// BATS DECORATION
// Flying bats that move across the screen
// ============================================================================
function HalloweenDecoration() {
  const [pumpkins, setPumpkins] = useState([]);

  useEffect(() => {
    const items = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 20 + Math.random() * 25,
      duration: 5 + Math.random() * 10,
      delay: Math.random() * 5,
      opacity: 0.5 + Math.random() * 0.5
    }));
    setPumpkins(items);
  }, []);

  return (
    <div className="halloween-decoration">
      {pumpkins.map((p) => (
        <div
          key={p.id}
          className="pumpkin"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity
          }}
        >
          🎃
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// CHRISTMAS LIGHTS DECORATION
// String of lights along the top of the screen
// ============================================================================
function ChristmasLightsDecoration() {
  const colors = ["#ff0000", "#00ff00", "#ffff00", "#0000ff", "#ff00ff", "#00ffff"];
  const lights = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    delay: i * 0.2
  }));

  return (
    <div className="christmas-lights-decoration">
      <div className="lights-string">
        {lights.map((light) => (
          <div
            key={light.id}
            className="light-bulb"
            style={{
              backgroundColor: light.color,
              animationDelay: `${light.delay}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// SNOWFLAKES DECORATION
// Falling snowflakes
// ============================================================================
function SnowflakesDecoration() {
  const [snowflakes, setSnowflakes] = useState([]);

  useEffect(() => {
    const flakes = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 10 + Math.random() * 20,
      duration: 5 + Math.random() * 10,
      delay: Math.random() * 5,
      opacity: 0.4 + Math.random() * 0.6
    }));
    setSnowflakes(flakes);
  }, []);

  return (
    <div className="snowflakes-decoration">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="snowflake"
          style={{
            left: `${flake.left}%`,
            fontSize: `${flake.size}px`,
            animationDuration: `${flake.duration}s`,
            animationDelay: `${flake.delay}s`,
            opacity: flake.opacity
          }}
        >
          ❄
        </div>
      ))}
    </div>
  );
}

export default Decorations;
