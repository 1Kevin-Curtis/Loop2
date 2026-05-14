
import React from "react";

const LOOP_MEMORY = {
  currentFocus: "Approach control from 140–170 yards",
  momentum: "No 3-putts in your last 2 rounds",
  nextObjective: "Commit to smaller mid-iron targets",
  confidence: "A stronger trend is beginning to emerge",
  practiceReason:
    "Recent rounds showed increasing short-right misses with mid irons."
};

function LoopMemoryCard({ eyebrow, title, body }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 24,
        padding: 18,
        marginBottom: 14
      }}
    >
      <div
        style={{
          fontSize: 11,
          letterSpacing: 1,
          textTransform: "uppercase",
          opacity: 0.6,
          marginBottom: 8
        }}
      >
        {eyebrow}
      </div>

      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          lineHeight: 1.3,
          marginBottom: 10
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 15,
          lineHeight: 1.5,
          opacity: 0.82
        }}
      >
        {body}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#08120d",
        color: "white",
        fontFamily: "Inter, sans-serif",
        padding: 24
      }}
    >
      <h1 style={{ fontSize: 42, marginBottom: 10 }}>Loop</h1>

      <div
        style={{
          opacity: 0.72,
          lineHeight: 1.5,
          marginBottom: 30,
          fontSize: 18
        }}
      >
        Your golf journey is beginning to form clearer themes and patterns.
      </div>

      {/* HOME MEMORY LAYER */}

      <LoopMemoryCard
        eyebrow="Current Focus"
        title={LOOP_MEMORY.currentFocus}
        body="Your recent rounds suggest approach consistency is now the clearest opportunity to save shots."
      />

      <LoopMemoryCard
        eyebrow="Momentum"
        title={LOOP_MEMORY.momentum}
        body="Your putting consistency is helping stabilise scoring."
      />

      <LoopMemoryCard
        eyebrow="Next Round Objective"
        title={LOOP_MEMORY.nextObjective}
        body="A smaller adjustment in strategy could quickly improve scoring."
      />

      {/* REVIEW LAYER */}

      <div style={{ marginTop: 34 }}>
        <LoopMemoryCard
          eyebrow="What Changed"
          title="Approach play is becoming the clearest scoring opportunity"
          body="Driving accuracy improved and 3-putts reduced, but mid-iron dispersion is now becoming the biggest influence on score."
        />

        <LoopMemoryCard
          eyebrow="Trend Confidence"
          title={LOOP_MEMORY.confidence}
          body="The app is beginning to recognise repeatable patterns across recent rounds."
        />
      </div>

      {/* PRACTICE LAYER */}

      <div style={{ marginTop: 34 }}>
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 20,
            padding: 16,
            marginBottom: 20
          }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: 1,
              textTransform: "uppercase",
              opacity: 0.6,
              marginBottom: 8
            }}
          >
            Based on recent rounds
          </div>

          <div
            style={{
              fontSize: 15,
              lineHeight: 1.5,
              opacity: 0.82
            }}
          >
            {LOOP_MEMORY.practiceReason}
          </div>
        </div>
      </div>
    </div>
  );
}
