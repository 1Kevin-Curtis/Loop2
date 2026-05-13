import React, { useMemo, useState } from "react";

const screens = ["welcome", "profile", "home", "ready", "setup", "round", "hole", "review", "plan", "prompt", "practice", "progress"];

import { COURSE_DATA } from "./courseData.js";
import { LoopInsightEngine } from "./loopInsightEngine.js";

function LogoMark({ size = 142 }) {
  return (
    <div className="loopLogo" style={{ width: size * 2.2 }}>
      <img
        className="loopLogoImage"
        src="/loop-logo.png"
        alt="Loop. Play. Reflect. Improve."
      />
    </div>
  );
}

function FeatureIcon({ symbol }) {
  return <div className="featureIcon">{symbol}</div>;
}

function buildRound(course, tee) {
  const data = COURSE_DATA[course][tee];
  return Array.from({ length: 18 }, (_, i) => ({
    hole: i + 1,
    par: data.pars[i],
    si: data.si[i],
    yards: data.yards[i],
    score: data.pars[i] + 1,
    saved: i < 4,
    tee: i === 1 ? ["Right"] : i === 3 ? ["Fairway"] : [],
    approach: i === 1 || i === 2 ? ["Short"] : i === 3 ? ["Green hit"] : [],
    green: i === 2 ? ["Poor chip"] : [],
    putting: i === 0 ? ["2-putt"] : i === 1 ? ["3-putt"] : []
  }));
}

function toEngineHole(h) {
  const puttTag = h.putting.includes("3-putt") ? "3-putt" : h.putting.includes("1-putt") ? "1-putt" : "2-putt";
  return {
    hole: h.hole,
    par: h.par,
    score: h.score,
    putts: puttTag === "3-putt" ? 3 : puttTag === "1-putt" ? 1 : 2,
    teeShot: h.tee.includes("Penalty") ? "penalty" : h.tee.includes("Right") ? "miss_right" : h.tee.includes("Left") ? "miss_left" : h.tee.includes("Fairway") ? "fairway" : "in_play",
    approach: h.approach.includes("Green hit") ? "good" : h.approach.includes("Short") ? "short" : h.approach.includes("Long") ? "long" : h.approach.includes("Left") ? "left" : h.approach.includes("Right") ? "right" : "unknown",
    penalties: h.tee.includes("Penalty") ? 1 : 0,
    shortGame: h.green.includes("Up and down") ? "up_and_down" : h.green.includes("Chunk") || h.green.includes("Thin") || h.green.includes("Bunker") ? "missed_up_down" : h.green.includes("Good recovery") ? "good_recovery" : undefined
  };
}

function analyse(round, courseName = "Prototype course") {
  const saved = round.filter((h) => h.saved);
  const sample = saved.length ? saved : round.slice(0, 4).map((h) => ({ ...h, saved: true }));
  const currentRound = {
    id: "prototype_round",
    date: new Date().toISOString().slice(0, 10),
    courseName,
    holes: sample.map(toEngineHole)
  };
  const result = LoopInsightEngine.generateRoundInsights({ currentRound, previousRounds: [], adviceHistory: [] });
  const strengths = (result.insights || [])
    .filter((i) => i.category === "positive" || i.categoryLabel === "Positive pattern")
    .map((i) => ({ title: i.title, detail: i.observation || i.meaning || i.action, label: "Well done" }));
  const improvements = (result.insights || [])
    .filter((i) => i.category !== "positive" && i.categoryLabel !== "Positive pattern")
    .map((i) => ({
      title: i.title,
      detail: i.observation || i.meaning,
      source: i.evidence || i.source || `Based on ${sample.length} logged holes`,
      action: i.action,
      confidence: i.state === "repeat" ? "Recurring pattern" : i.state === "improving" ? "Improving" : "Worth watching",
      practicePlan: i.practicePlan
    }));
  return {
    engine: result,
    strengths: strengths.length ? strengths.slice(0, 2) : [{ title: "Steady scoring", detail: "You kept enough holes under control to build from next round.", label: "Good sign" }],
    improvements: improvements.length ? improvements.slice(0, 3) : [{ title: "Course management", detail: "No major leak stands out yet. Keep logging to build a clearer pattern.", source: `Based on ${sample.length} logged holes`, action: "Choose the shot that removes the worst miss.", confidence: "Needs more rounds" }]
  };
}

function Phone({ children }) { return <main className="page"><section className="phone"><div className="notch" /><div className="screen">{children}</div></section></main>; }
function Header({ title, sub, back, hideBack }) { return <div className="header">{!hideBack && <button className="back" onClick={back}>‹</button>}<div><h2>{title}</h2>{sub && <p>{sub}</p>}</div></div>; }
function Card({ children, dark = false, soft = false }) { return <div className={`card ${dark ? "dark" : ""} ${soft ? "soft" : ""}`}>{children}</div>; }
function Btn({ children, onClick, secondary = false, className = "" }) { return <button onClick={onClick} className={`btn ${secondary ? "secondary" : ""} ${className}`}>{children}</button>; }
function Pill({ children, on, click }) { return <button onClick={click} className={`pill ${on ? "on" : ""}`}>{children}</button>; }
function Nav({ go }) { return <div className="nav">{[["home", "⛳", "Home"], ["ready", "◌", "Ready"], ["setup", "＋", "Round"], ["plan", "◎", "Plan"], ["practice", "◉", "Practice"]].map(([s, i, t]) => <button key={s} onClick={() => go(s)}><span>{i}</span>{t}</button>)}</div>; }

function Welcome({ go }) { return <Phone><div className="versionRibbon">Loop build v3 · course selector + insight engine</div><div className="welcomeScreen"><div className="welcomeHero"><LogoMark /><p className="welcomeCopy">An easier way to <strong>track your round</strong>,<br /><strong>spot patterns</strong> and play your next round with a <strong>clearer plan</strong>.</p></div><Card><div className="featureList"><div className="featureRow"><FeatureIcon symbol="✓" /><div><h3>Simple post-hole tracking</h3><p>Quick to use. Built for your game.</p></div></div><div className="featureRow"><FeatureIcon symbol="▥" /><div><h3>Clear insight from your patterns</h3><p>See what’s working and what’s not.</p></div></div><div className="featureRow"><FeatureIcon symbol="◎" /><div><h3>Practice that transfers to the course</h3><p>Build better habits. Play better golf.</p></div></div></div></Card><button className="btn welcomeBtn" onClick={() => go("profile")}>Get started <span>→</span></button></div></Phone>; }

function Profile({ go, back }) { const [h, setH] = useState(14), [goal, setGoal] = useState("Break 80"); return <Phone><Header title="Your golfer profile" sub="A quick setup so advice feels relevant." back={back} /><div className="stack"><Card><p className="eyebrow">Current handicap</p><div className="counter"><button onClick={() => setH(Math.max(1, h - 1))}>−</button><strong>{h}</strong><button onClick={() => setH(h + 1)}>+</button></div></Card><div><p className="eyebrow">Main goal</p><div className="pills">{["Break 90", "Break 85", "Break 80", "Single figures"].map(x => <Pill key={x} on={goal === x} click={() => setGoal(x)}>{x}</Pill>)}</div></div><Btn onClick={() => go("home")}>Continue</Btn></div></Phone>; }

function Home({ go }) { return <Phone><Header title="Today" sub="Get ready, play, then review what mattered." hideBack /><div className="stack"><Card dark><p className="eyebrow light">Before you tee off</p><h2>Ready to Play</h2><p>A short warm-up to loosen up, find rhythm and settle your first tee focus.</p><button className="white" onClick={() => go("ready")}>Start prep</button></Card><Card><h3>How better rounds are built</h3><p className="muted">A simple rhythm that helps you learn from each round and carry improvements into the next one.</p><div className="journey">{["Play", "Review", "Practice", "Improve"].map((x, i) => <React.Fragment key={x}><div><b>{i + 1}</b><span>{x}</span></div>{i < 3 && <em />}</React.Fragment>)}</div></Card><Btn onClick={() => go("setup")}>Start round capture</Btn></div><Nav go={go} /></Phone>; }

function Ready({ go, back }) { const moves = ["Shoulder turns", "Hip openers", "Hamstring sweep", "Wrist circles", "Three easy swings"]; return <Phone><Header title="Ready to Play" sub="Four minutes. Calm body, clear first tee." back={back} /><div className="stack bottomGap"><Card dark><p className="eyebrow light">First tee reset</p><h2>Loosen up and find rhythm</h2><p>Simple movements you can do by the car park or practice green.</p><p className="note">Better starts usually lead to steadier opening holes.</p></Card>{moves.map((m, i) => <Card key={m}><div className="row"><b className="num">{i + 1}</b><div><h3>{m}</h3><p className="muted">30–45 seconds. Smooth and easy.</p></div></div></Card>)}<Card><p className="eyebrow">First tee focus</p><h3>Pick a safe target. Commit to one smooth swing.</h3></Card><Btn onClick={() => go("setup")}>Start round</Btn></div><Nav go={go} /></Phone>; }

function Setup({ go, back, course, setCourse, tee, setTee }) {
  const courseNames = Object.keys(COURSE_DATA);
  const teeNames = Object.keys(COURSE_DATA[course] || {});
  const currentTee = COURSE_DATA[course]?.[tee] || COURSE_DATA[course]?.[teeNames[0]];
  return <Phone><Header title="Course setup" sub="Choose your course and tee before you start." back={back} /><div className="stack bottomGap"><Card dark><p className="eyebrow light">Today’s round</p><h2>Where are you playing?</h2><p>Loop uses the course, tee, par, yardage and stroke index to make your round review more useful without adding GPS or shot tracking.</p></Card><Card><p className="eyebrow">Course</p><select className="selectInput" value={course} onChange={(e) => setCourse(e.target.value)}>{courseNames.map((x) => <option key={x} value={x}>{x}</option>)}</select><p className="muted"><strong>{courseNames.length} courses loaded</strong> from the Loop course database. Change the dropdown to test the course data.</p></Card><Card><p className="eyebrow">Tee colour</p><select className="selectInput" value={tee} onChange={(e) => setTee(e.target.value)}>{teeNames.map((x) => <option key={x} value={x}>{x}</option>)}</select></Card><Card><div className="courseSummary"><div><span>18</span><p>holes</p></div><div><span>{currentTee?.pars?.reduce((a, b) => a + b, 0)}</span><p>par</p></div><div><span>{currentTee?.yards?.reduce((a, b) => a + b, 0)}</span><p>yards</p></div></div><p className="muted">Hole pars, yardages and stroke indexes are attached to the round, so post-round entry feels less disconnected.</p></Card><Btn onClick={() => go("round")}>Continue to round capture</Btn></div><Nav go={go} /></Phone>;
}

function HoleGrid({ round, select }) { return <div className="holes">{round.map((h, i) => <button key={h.hole} onClick={() => select(i)} className={`${h.saved ? "saved" : ""}`}><b>{h.hole}</b><span>{h.saved ? "Saved" : `${h.yards}y`}</span></button>)}</div>; }

function Round({ go, back, round, setHole, lastSaved, course, tee }) { const done = round.filter(h => h.saved).length; const current = round.find(h => !h.saved) || round[17]; return <Phone><Header title="Round capture" sub={`${course} · ${tee} tees`} back={back} /><div className="stack bottomGap">{lastSaved && <div className="savedMsg">Hole {lastSaved} saved. Ready for the next one.</div>}<Card><div className="between"><div><p className="eyebrow">Current hole</p><h2>Hole {current.hole}</h2></div><span className="badge">Par {current.par} · {current.yards}y · SI {current.si}</span></div><div className="bar"><i style={{ width: `${done / 18 * 100}%` }} /></div><p className="muted">{done} of 18 holes saved</p></Card><HoleGrid round={round} select={(i) => { setHole(i); go("hole"); }} /><Card soft>Most golfers log each hole walking to the next tee.</Card><Btn onClick={() => go("review")}>Finish and review</Btn></div><Nav go={go} /></Phone>; }

function TagSection({ title, hint, options, selected, choose }) { return <Card><div className="between"><div><h3>{title}</h3><p className="muted">{hint}</p></div><span className="badge">Single select</span></div><div className="pills">{options.map(o => <Pill key={o} on={selected[0] === o} click={() => choose(o)}>{o}</Pill>)}</div></Card>; }

function Hole({ go, back, round, setRound, hole, setHole, setLastSaved }) { const h = round[hole]; const update = p => setRound(prev => prev.map((x, i) => i === hole ? { ...x, ...p } : x)); const choose = (sec, tag) => update({ [sec]: h[sec][0] === tag ? [] : [tag] }); const save = () => { update({ saved: true }); setLastSaved(h.hole); setHole(Math.min(hole + 1, 17)); go("round"); }; return <Phone><Header title={`Hole ${h.hole}`} sub={`Par ${h.par} · ${h.yards} yards · SI ${h.si}`} back={back} /><div className="stack scroll bottomGap"><Card><p className="eyebrow">Score</p><div className="counter"><button onClick={() => update({ score: Math.max(1, h.score - 1) })}>−</button><strong>{h.score}</strong><button onClick={() => update({ score: h.score + 1 })}>+</button></div></Card><TagSection title="Tee shot" hint="Only the first shot on par 4s and par 5s." options={["Fairway", "Left", "Right", "Penalty", "Top/thin"]} selected={h.tee} choose={t => choose("tee", t)} /><TagSection title="Approach" hint="The shot into the green." options={["Green hit", "Short", "Left", "Right", "Long"]} selected={h.approach} choose={t => choose("approach", t)} /><TagSection title="Short game" hint="Only if you missed the green." options={["Up and down", "Bunker", "Chunk", "Thin", "Good recovery"]} selected={h.green} choose={t => choose("green", t)} /><TagSection title="Putting" hint="What happened once you reached the green." options={["1-putt", "2-putt", "3-putt"]} selected={h.putting} choose={t => choose("putting", t)} /><Btn onClick={save} className="saveHoleBtn">Save hole and continue</Btn></div></Phone>; }

function Review({ go, back, round, course }) { const result = analyse(round, course); const main = result.improvements[0]; const strength = result.strengths[0]; const summary = result.engine?.roundSummary; return <Phone><Header title="Round review" sub="What worked, what cost shots and what to take forward." back={back} /><div className="stack bottomGap"><Card dark><p className="eyebrow light">Round story</p><h2>{summary?.headline || "Round patterns are building"}</h2><p>{summary?.mainOpportunity || "Loop is using your saved holes to separate useful patterns from one-off mistakes."}</p><p className="note">Based on the holes you saved in this prototype round.</p></Card><Card><div className="between"><h3>What worked today</h3><span className="good">Well done</span></div><p>{strength.detail}</p><p className="muted">Good rounds are built by keeping strengths reliable, not only fixing weaknesses.</p></Card><Card><div className="between"><h3>What cost shots</h3><span className="badge">{main.confidence}</span></div><p>{main.detail}</p><p className="muted">{main.source}</p></Card><Card><p className="eyebrow">Next round focus</p><h3>{main.action}</h3><p className="muted">One clear playing rule beats taking five swing thoughts to the first tee.</p></Card><Card soft><div className="between"><div><p className="eyebrow">Insight engine</p><h3>Connected and running</h3></div><span className="good">Live</span></div><p className="muted">Generated from {round.filter(h => h.saved).length || 4} saved holes, the selected course data and the Loop insight rules.</p></Card><Card><p className="eyebrow">One thing to remember</p><p className="quote">“Started trusting the middle of the green more on the back nine.”</p></Card><div className="two"><Btn onClick={() => go("plan")}>Next Round Plan</Btn><Btn secondary onClick={() => go("practice")}>Practice ideas</Btn></div></div><Nav go={go} /></Phone>; }

function PlanCard({ n, title, body, evidence }) { return <Card><div className="row"><b className="num">{n}</b><div><h3>{title}</h3><p>{body}</p><p className="muted">{evidence}</p></div></div></Card>; }
function Plan({ go, back, round, course }) { const main = analyse(round, course).improvements[0]; return <Phone><Header title="Next Round Plan" sub="Three simple rules to take to the course." back={back} /><div className="stack bottomGap"><PlanCard n="1" title={main.action} body="Use this as your main playing rule next round. Keep it simple and repeat it before each relevant shot." evidence={main.source} /><PlanCard n="2" title="Play the first three holes safely" body="Start steady. Pick targets that remove the worst miss and avoid chasing early birdies." evidence="Your opening holes are now being tracked as a round phase." /><PlanCard n="3" title="Protect against doubles" body="A bogey after a poor shot is fine. The scorecard damage comes from forcing the next one." evidence="This is the fastest improvement route for most mid-handicap golfers." /><div className="two"><Btn onClick={() => go("prompt")}>Start round</Btn><Btn secondary onClick={() => go("practice")}>Practice</Btn></div></div><Nav go={go} /></Phone>; }
function Prompt({ go, back, round, course }) { const insight = analyse(round, course).improvements[0]; return <Phone><Header title="Hole 4" sub="Smart prompt · based on your plan" back={back} /><div className="stack bottomGap"><Card dark><p className="eyebrow light">Before you hit</p><h2>{insight.action}</h2><p>{insight.detail}</p></Card><Card><p className="eyebrow">Why this prompt appears</p><p>{insight.source}. This prompt only appears when it connects to your current plan.</p></Card><Btn onClick={() => go("round")}>Log this hole</Btn></div><Nav go={go} /></Phone>; }
function Drill({ title, body }) { return <Card><div className="row"><b className="tick">✓</b><div><h3>{title}</h3><p>{body}</p></div></div></Card>; }
function Practice({ go, back, round, course }) { const insight = analyse(round, course).improvements[0]; return <Phone><Header title="Practice plan" sub="Short, practical and built for your next round." back={back} /><div className="stack bottomGap"><Card dark><p className="eyebrow light">Before your next round</p><h2>{insight.practicePlan?.title || insight.title}</h2><p>{insight.practicePlan?.duration || insight.action}</p></Card>{(insight.practicePlan?.blocks || ["Hit 5 tee shots at 70% tempo. Focus only on balance and finishing the swing.", "Land 10 wedges inside 15 paces without changing target. The goal is pin-high, not perfect.", "Make 20 three-foot putts before leaving the green. Keep the routine the same every time."]).map((block, i) => <Drill key={block} title={`Block ${i + 1}`} body={block} />)}<Btn onClick={() => go("progress")}>Mark practice complete</Btn></div><Nav go={go} /></Phone>; }
function Progress({ go, back }) { return <Phone><Header title="Progress" sub="Simple trends. No stats overload." back={back} /><div className="stack bottomGap"><Card dark><p className="eyebrow light">Current pattern</p><h2>Reliable strengths are building</h2><p>Your driving and putting are giving you a stronger base while approach distance control remains the focus.</p></Card><Card><h3>Trend confidence</h3>{[["Round 1", "No three putts", "Strong"], ["Round 2", "More tee shots in play", "Improving"], ["Round 3", "Short approaches reduced", "Stronger"]].map(([r, l, s]) => <div className="trend" key={r}><div><b>{r}</b><p>{l}</p></div><span>{s}</span></div>)}</Card><Btn onClick={() => go("plan")}>View updated plan</Btn></div><Nav go={go} /></Phone>; }

export default function App() {
  const [screen, setScreen] = useState("welcome");
  const [history, setHistory] = useState([]);
  const [course, setCourseState] = useState("Chipstead Golf Club");
  const [tee, setTeeState] = useState("Yellow");
  const [round, setRound] = useState(() => buildRound("Chipstead Golf Club", "Yellow"));
  const [hole, setHole] = useState(4);
  const [lastSaved, setLastSaved] = useState(null);

  const setCourse = (nextCourse) => {
    setCourseState(nextCourse);
    const nextTee = COURSE_DATA[nextCourse][tee] ? tee : Object.keys(COURSE_DATA[nextCourse])[0]; setTeeState(nextTee); setRound(buildRound(nextCourse, nextTee));
    setHole(0);
    setLastSaved(null);
  };

  const setTee = (nextTee) => {
    setTeeState(nextTee);
    setRound(buildRound(course, nextTee));
    setHole(0);
    setLastSaved(null);
  };

  const go = (s) => { if (!screens.includes(s)) return; setHistory((h) => [...h, screen]); setScreen(s); };
  const back = () => setHistory((h) => { if (!h.length) return h; setScreen(h[h.length - 1]); return h.slice(0, -1); });
  const props = useMemo(() => ({ go, back, round, setRound, hole, setHole, lastSaved, setLastSaved, course, setCourse, tee, setTee }), [round, hole, lastSaved, course, tee]);

  return <div><style>{css}</style>{screen === "welcome" && <Welcome {...props} />} {screen === "profile" && <Profile {...props} />} {screen === "home" && <Home {...props} />} {screen === "ready" && <Ready {...props} />} {screen === "setup" && <Setup {...props} />} {screen === "round" && <Round {...props} />} {screen === "hole" && <Hole {...props} />} {screen === "review" && <Review {...props} />} {screen === "plan" && <Plan {...props} />} {screen === "prompt" && <Prompt {...props} />} {screen === "practice" && <Practice {...props} />} {screen === "progress" && <Progress {...props} />}</div>;
}

const css = `
:root{--deep:#0F2D2E;--mint:#17A589;--soft:#7EDBB4;--pale:#E6F4EE;--off:#F7F7F4;--ink:#0F2D2E}
*{box-sizing:border-box}
body{margin:0;font-family:Inter,-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",sans-serif;background:var(--pale);color:var(--ink)}
button{font:inherit}
.page{min-height:100vh;display:grid;place-items:center;padding:20px;background:var(--pale)}
.phone{width:390px;height:844px;border:10px solid #09090b;border-radius:46px;background:white;overflow:hidden;position:relative;box-shadow:0 28px 70px rgba(15,45,46,.22)}
.notch{width:140px;height:28px;border-radius:0 0 22px 22px;background:#09090b;position:absolute;left:50%;top:0;transform:translateX(-50%);z-index:2}
.screen{height:100%;overflow-y:auto;padding:38px 0 0;background:linear-gradient(180deg,#fff 0%,var(--off) 68%,var(--pale) 100%)}
.header{position:sticky;top:0;z-index:2;display:flex;gap:12px;align-items:center;padding:16px 20px 12px;background:rgba(255,255,255,.92);backdrop-filter:blur(12px);border-bottom:1px solid rgba(126,219,180,.25)}
.header h2{font-size:18px;margin:0;color:var(--deep);font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
.header p{font-size:12px;color:rgba(15,45,46,.58);margin:2px 0 0}
.back{border:0;background:var(--pale);color:var(--deep);border-radius:999px;width:36px;height:36px;font-size:24px}
.stack{display:flex;flex-direction:column;gap:16px;padding:20px}
.bottomGap{padding-bottom:110px}
.scroll{flex:1;overflow-y:auto;padding-bottom:120px;min-height:0}
h1{font-size:42px;line-height:.95;letter-spacing:-.04em;margin:0;color:var(--deep)}
h2{font-size:30px;line-height:1;letter-spacing:-.03em;margin:0}
h3,p{margin:0}
h3{font-size:17px;color:var(--deep)}
.muted{color:rgba(15,45,46,.58);font-size:13px;line-height:1.45;margin-top:7px}
.eyebrow{font-size:12px;text-transform:uppercase;letter-spacing:.08em;font-weight:800;color:rgba(15,45,46,.55);margin-bottom:8px}
.light{color:rgba(232,245,239,.85)}
.card{padding:18px;border-radius:24px;border:1px solid rgba(126,219,180,.25);background:rgba(255,255,255,.95);box-shadow:0 8px 30px rgba(15,45,46,.07)}
.card.dark{background:linear-gradient(145deg,var(--deep),#051f20);color:white;border-color:transparent;box-shadow:0 12px 34px rgba(15,45,46,.20)}
.card.soft{background:var(--off);color:rgba(15,45,46,.65)}
.card p,.card li{font-size:14px;line-height:1.5;color:rgba(15,45,46,.72)}
.card.dark p{color:#e4e4e7}
.btn{border:0;cursor:pointer;min-height:54px;height:54px;flex-shrink:0;border-radius:18px;background:linear-gradient(135deg,var(--deep),#051f20);color:white;font-weight:750;width:100%;padding:0 16px;box-shadow:0 8px 22px rgba(23,165,137,.22);display:flex;align-items:center;justify-content:center;text-align:center}
.btn.secondary{background:white;color:var(--deep);border:1px solid var(--deep);box-shadow:none}
.saveHoleBtn{min-height:54px;height:54px;margin-top:2px;margin-bottom:12px}
.white{margin-top:20px;background:white;color:var(--deep);border:0;border-radius:16px;height:48px;padding:0 18px;font-weight:750}
.nav{position:absolute;bottom:0;left:0;right:0;display:grid;grid-template-columns:repeat(5,1fr);gap:4px;padding:8px 12px 24px;background:rgba(255,255,255,.96);border-top:1px solid rgba(126,219,180,.25);backdrop-filter:blur(12px)}
.nav button{border:0;background:transparent;color:rgba(15,45,46,.72);font-size:11px;display:flex;flex-direction:column;gap:3px;align-items:center}
.nav span{font-size:17px}
.pills{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
.coursePills .pill{max-width:100%;text-align:left;line-height:1.25}
.selectInput{width:100%;min-height:52px;border:1px solid rgba(126,219,180,.35);border-radius:16px;background:white;color:var(--deep);padding:0 14px;font-size:16px;font-weight:750}
.courseSummary{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;text-align:center;margin-bottom:10px}.courseSummary div{border-radius:16px;background:var(--off);padding:12px}.courseSummary span{font-size:22px;font-weight:850;color:var(--deep)}.courseSummary p{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:rgba(15,45,46,.55)}
.pill{border:1px solid rgba(126,219,180,.25);border-radius:999px;background:var(--off);color:rgba(15,45,46,.78);padding:10px 12px;font-size:13px}
.pill.on{background:var(--deep);color:white;border-color:var(--deep)}
.counter{display:flex;align-items:center;justify-content:space-between}
.counter button{width:44px;height:44px;border-radius:999px;border:0;background:var(--pale);color:var(--deep);font-size:20px}
.counter strong{font-size:60px;color:var(--deep)}
.journey{display:flex;align-items:flex-start;margin-top:18px;text-align:center}
.journey div{flex:1}.journey b{display:grid;place-items:center;width:38px;height:38px;border-radius:999px;background:var(--pale);margin:0 auto;color:var(--deep)}
.journey span{display:block;font-size:11px;margin-top:8px;color:rgba(15,45,46,.72);font-weight:700}.journey em{height:1px;background:rgba(126,219,180,.5);flex:.5;margin-top:19px}
.row{display:flex;gap:14px;align-items:flex-start}.num,.tick{display:grid;place-items:center;min-width:36px;height:36px;border-radius:999px;background:var(--deep);color:white}.tick{background:var(--mint)}
.note{background:rgba(255,255,255,.1);border-radius:16px;padding:12px;margin-top:14px;font-size:12px}.savedMsg{background:var(--pale);color:var(--mint);border-radius:16px;padding:12px 14px;font-size:14px;font-weight:700}
.between{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.badge,.good{border-radius:999px;background:var(--off);color:rgba(15,45,46,.68);padding:7px 10px;font-size:11px;white-space:nowrap}.good{background:var(--pale);color:var(--mint)}
.bar{height:8px;background:var(--pale);border-radius:999px;overflow:hidden}.bar i{display:block;height:100%;background:var(--mint)}
.holes{display:grid;grid-template-columns:repeat(6,1fr);gap:8px}.holes button{border:1px solid rgba(126,219,180,.18);background:var(--off);color:rgba(15,45,46,.58);border-radius:16px;padding:11px 4px}.holes button.saved{background:var(--pale);color:var(--mint);border:1px solid var(--soft)}.holes b{display:block}.holes span{display:block;font-size:10px;margin-top:3px}
.two{display:grid;grid-template-columns:1fr 1fr;gap:10px}.trend{display:flex;justify-content:space-between;gap:12px;padding:12px;border-radius:16px;background:var(--off);margin-top:10px}.trend p{color:rgba(15,45,46,.58)}.trend span{background:white;border-radius:999px;padding:7px 10px;font-size:11px;color:rgba(15,45,46,.68);height:max-content}
.selectRow{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px;border-radius:18px;background:var(--off)}.selectRow span{font-weight:800;color:var(--deep)}.selectRow button{border:0;border-radius:999px;background:white;color:var(--mint);padding:8px 12px;font-weight:800}.quote{background:var(--off);border-radius:18px;padding:14px;font-style:italic;color:rgba(15,45,46,.72)}
@media(max-width:440px){.page{padding:0}.phone{width:100vw;height:100vh;border:0;border-radius:0}.notch{display:none}.screen{padding-top:0}}
.welcomeScreen{position:relative;display:flex;min-height:100%;flex-direction:column;justify-content:space-between;overflow-y:auto;padding:48px 28px 40px;background:linear-gradient(180deg,#fff 0%,var(--off) 58%,var(--pale) 100%)}
.welcomeScreen:after{content:"";position:absolute;left:0;right:0;bottom:96px;height:288px;opacity:.4;background-image:radial-gradient(ellipse at 20% 30%,rgba(23,165,137,.1),transparent 42%),radial-gradient(ellipse at 80% 20%,rgba(126,219,180,.14),transparent 44%);pointer-events:none}
.welcomeHero{position:relative;z-index:1;text-align:center}.loopLogo{position:relative;z-index:1;margin:0 auto;text-align:center;display:flex;flex-direction:column;align-items:center}.loopLogoImage{display:block;width:100%;height:auto;object-fit:contain}.welcomeCopy{max-width:340px;margin:42px auto 0;text-align:center;font-size:26px;font-weight:500;line-height:1.45;color:var(--deep)}.welcomeCopy strong{color:var(--mint);font-weight:800}.featureList{padding:20px}.featureRow{display:flex;align-items:center;gap:20px;padding:18px 0}.featureRow+ .featureRow{border-top:1px solid #f1f1f2}.featureRow h3{font-size:18px;font-weight:800;color:var(--deep)}.featureRow p{margin-top:4px;font-size:14px;color:#71717a}.featureIcon{display:flex;align-items:center;justify-content:center;flex-shrink:0;width:64px;height:64px;border-radius:999px;background:var(--pale);color:var(--mint);font-size:30px;font-weight:700}.welcomeBtn{height:64px;min-height:64px;border-radius:24px;font-size:20px;position:relative;z-index:3;display:flex;align-items:center;justify-content:center;margin-top:20px;flex-shrink:0;cursor:pointer}.welcomeBtn span{font-size:30px;margin-left:12px}
`;
