
import React, { useState } from "react";

const screens = [
  "home",
  "story",
  "practice",
  "review"
];

const GAME_MEMORY = {
  currentFocus: "Approach control from 140–170 yards",
  momentum: "No 3-putts in your last 2 rounds",
  confidence: "This pattern is becoming consistent",
  nextObjective: "Commit to clearer mid-iron targets",
  practiceReason:
    "Recent rounds showed increasing short-right misses with mid irons."
};

const STORY_EVENTS = [
  {
    type: "Momentum",
    title: "Driving accuracy improving",
    body: "You have hit more fairways across your last 3 rounds."
  },
  {
    type: "Pattern emerging",
    title: "Approach misses clustering short-right",
    body: "A recurring pattern is beginning to emerge with mid irons."
  },
  {
    type: "Round milestone",
    title: "Best putting round yet",
    body: "Your pace control improved significantly."
  }
];

function ScreenButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "12px 18px",
        borderRadius: 16,
        border: "none",
        background: active ? "#214434" : "#13291f",
        color: "white",
        fontWeight: 600,
        cursor: "pointer"
      }}
    >
      {children}
    </button>
  );
}

function Card({ eyebrow, title, body }) {
  return (
    <div
      style={{
        background: "#13291f",
        borderRadius: 24,
        padding: 22,
        marginBottom: 18,
        border: "1px solid rgba(255,255,255,0.08)"
      }}
    >
      <div
        style={{
          fontSize: 12,
          textTransform: "uppercase",
          opacity: 0.6,
          marginBottom: 10,
          letterSpacing: 1
        }}
      >
        {eyebrow}
      </div>

      <div
        style={{
          fontSize: 26,
          fontWeight: 700,
          lineHeight: 1.2,
          marginBottom: 12
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 16,
          lineHeight: 1.5,
          opacity: 0.82
        }}
      >
        {body}
      </div>
    </div>
  );
}

function HomeScreen() {
  return (
    <div>
      <h1 style={{ fontSize: 42, marginBottom: 8 }}>Loop</h1>

      <div
        style={{
          opacity: 0.7,
          marginBottom: 32,
          fontSize: 18,
          lineHeight: 1.5
        }}
      >
        A living memory of how your golf is evolving over time.
      </div>

      <div style={{ marginBottom: 10, opacity: 0.6 }}>
        CURRENT FOCUS
      </div>

      <div
        style={{
          fontSize: 32,
          fontWeight: 700,
          lineHeight: 1.2,
          marginBottom: 28
        }}
      >
        {GAME_MEMORY.currentFocus}
      </div>

      <Card
        eyebrow="Momentum"
        title={GAME_MEMORY.momentum}
        body="Your putting consistency is helping stabilise scoring."
      />

      <Card
        eyebrow="Confidence"
        title={GAME_MEMORY.confidence}
        body="The app is beginning to recognise repeatable trends."
      />

      <Card
        eyebrow="Next round objective"
        title={GAME_MEMORY.nextObjective}
        body="A smaller adjustment in approach strategy could save shots quickly."
      />
    </div>
  );
}

function StoryScreen() {
  return (
    <div>
      <h1 style={{ fontSize: 40, marginBottom: 8 }}>Your Game</h1>

      <div
        style={{
          opacity: 0.72,
          marginBottom: 30,
          lineHeight: 1.5,
          fontSize: 18
        }}
      >
        Your golf journey is beginning to form clear themes and patterns.
      </div>

      <Card
        eyebrow="Long-term focus"
        title="Turning bogeys into pars through approach consistency"
        body="Driving and putting are stabilising, making approach play the clearest scoring opportunity."
      />

      <div
        style={{
          fontSize: 24,
          fontWeight: 700,
          marginTop: 30,
          marginBottom: 18
        }}
      >
        Momentum
      </div>

      {STORY_EVENTS.map((event, index) => (
        <Card
          key={index}
          eyebrow={event.type}
          title={event.title}
          body={event.body}
        />
      ))}
    </div>
  );
}

function PracticeScreen() {
  return (
    <div>
      <h1 style={{ fontSize: 40, marginBottom: 12 }}>Practice</h1>

      <Card
        eyebrow="Based on recent rounds"
        title="Mid-iron start lines"
        body={GAME_MEMORY.practiceReason}
      />

      <Card
        eyebrow="Block 1"
        title="Target commitment"
        body="Pick smaller targets and commit fully before each swing."
      />

      <Card
        eyebrow="Block 2"
        title="Distance control"
        body="Focus on strike and carry consistency with 7–9 iron."
      />
    </div>
  );
}

function ReviewScreen() {
  return (
    <div>
      <h1 style={{ fontSize: 40, marginBottom: 18 }}>Round Review</h1>

      <Card
        eyebrow="What changed"
        title="Approach play is now the clearest route to lower scores"
        body="Driving accuracy improved and 3-putts reduced, but approach dispersion is becoming the main scoring opportunity."
      />

      <Card
        eyebrow="What improved"
        title="Driving accuracy and pace putting"
        body="You avoided penalty shots and improved first putt proximity."
      />
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("home");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b1712",
        color: "white",
        fontFamily: "Inter, sans-serif",
        padding: 24
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 32,
          flexWrap: "wrap"
        }}
      >
        {screens.map((item) => (
          <ScreenButton
            key={item}
            active={screen === item}
            onClick={() => setScreen(item)}
          >
            {item}
          </ScreenButton>
        ))}
      </div>

      {screen === "home" && <HomeScreen />}
      {screen === "story" && <StoryScreen />}
      {screen === "practice" && <PracticeScreen />}
      {screen === "review" && <ReviewScreen />}
    </div>
  );
}
