
import React, { useState } from "react";

const screens = ["welcome","profile","home","rounds","ready","setup","round","hole","review","plan","practice","progress"];

const COURSES = {
  "Chipstead Golf Club": {
    Yellow:{par:70,yards:6214}
  },
  "The Oaks Golf Club": {
    Yellow:{par:72,yards:6481}
  },
  "Kingswood Golf and Country Club": {
    Yellow:{par:71,yards:6338}
  },
  "Coulsdon Manor": {
    Yellow:{par:70,yards:6022}
  },
  "Parkwood Golf Club": {
    Yellow:{par:71,yards:6401}
  }
};

const sampleRounds = [
  {
    course:"Chipstead Golf Club",
    score:82,
    relative:"+11",
    date:"14 May 2026",
    insights:[
      "Driving improving ↑",
      "No three putts",
      "Approach distance still costing shots"
    ]
  },
  {
    course:"Parkwood Golf Club",
    score:85,
    relative:"+14",
    date:"7 May 2026",
    insights:[
      "Short game improving",
      "Penalty shots increasing",
      "Putting confidence stable"
    ]
  }
];

function Btn({children,onClick,secondary}) {
  return <button onClick={onClick} className={`btn ${secondary ? "secondary":""}`}>{children}</button>
}

function Card({children,soft,dark}) {
  return <div className={`card ${soft ? "soft":""} ${dark ? "dark":""}`}>{children}</div>
}

function Header({title,sub}) {
  return <div className="header">
    <div>
      <h2>{title}</h2>
      <p>{sub}</p>
    </div>
  </div>
}

function Nav({go}) {
  return <div className="nav">
    {[
      ["home","Home"],
      ["rounds","Rounds"],
      ["setup","Play"],
      ["plan","Plan"],
      ["progress","Progress"]
    ].map(([k,v]) => (
      <button key={k} onClick={()=>go(k)}>{v}</button>
    ))}
  </div>
}

function Welcome({go}) {
  return <div className="screenWrap">
    <div className="welcome">
      <img src="/loop-logo.png" className="logo"/>
      <h1>An easier way to track your round, spot patterns and play your next round with a clearer plan.</h1>

      <Card>
        <h3>Simple post-hole tracking</h3>
        <p>Quick to use. Built for your game.</p>
      </Card>

      <Btn onClick={()=>go("profile")}>Get started</Btn>
    </div>
  </div>
}

function Profile({go}) {
  const [goal,setGoal] = useState("Break 80");

  return <div className="screenWrap">
    <Header title="Your golfer profile" sub="Shape the experience around your goals."/>

    <div className="stack">

      <Card>
        <p className="eyebrow">Current handicap</p>
        <div className="handicapRow"><button>-</button><h2>14.2</h2><button>+</button></div>
      </Card>

      <Card soft>
        <p className="eyebrow">Main goal</p>
        <h2>{goal}</h2>
        <p>Loop adapts your plans and insights around the scoring target you are chasing.</p>

        <div className="pills">
          {["Break 90","Break 85","Break 80","Single figures"].map(x => (
            <button key={x} className={`pill ${goal===x?"on":""}`} onClick={()=>setGoal(x)}>
              {x}
            </button>
          ))}
        </div>
      </Card>

      <Btn onClick={()=>go("home")}>Continue</Btn>
    </div>
  </div>
}

function Home({go}) {
  return <div className="screenWrap">
    <Header title="Today" sub="Play, reflect and improve."/>

    <div className="stack">
      <Card dark>
        <h2>Ready to Play</h2>
        <p>Simple warm-up movements before the first tee.</p>
        <Btn secondary onClick={()=>go("ready")}>Start prep</Btn>
      </Card>

      <Btn onClick={()=>go("setup")}>Start round</Btn>
    </div>

    <Nav go={go}/>
  </div>
}

function Ready({go}) {
  const moves = [
    "Shoulder turns",
    "Hip openers",
    "Hamstring sweep",
    "Wrist circles"
  ];

  const [done,setDone] = useState([]);

  const toggle = (x) => {
    setDone(prev => prev.includes(x) ? prev.filter(i=>i!==x) : [...prev,x]);
  };

  return <div className="screenWrap">
    <Header title="Ready to Play" sub="Four minute warm-up."/>

    <div className="stack">
      {moves.map(x => (
        <Card key={x} soft={done.includes(x)}>
          <div className="row">
            <button className={`tick ${done.includes(x)?"done":""}`} onClick={()=>toggle(x)}>✓</button>
            <div>
              <h3>{x}</h3>
              <p>30–45 seconds. Smooth and relaxed.</p>
            </div>
          </div>
        </Card>
      ))}
    </div>

    <Nav go={go}/>
  </div>
}

function Setup({go,course,setCourse}) {

  return <div className="screenWrap">
    <Header title="Course setup" sub="Select your course."/>

    <div className="stack">
      
        <Card>
          <p className="eyebrow">Course</p>
          <select className="courseSelect">
            {Object.keys(COURSES).map(c => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <div className="teeSelector">
            <button className="tee active">White</button>
            <button className="tee">Yellow</button>
            <button className="tee">Red</button>
          </div>
        </Card>

        {Object.keys(COURSES).map(c => (
        
        <Card key={c} soft={course===c}>
          <button className="courseBtn" onClick={()=>setCourse(c)}>
            <strong>{c}</strong>
            <p>
              Yellow tees · Par {COURSES[c].Yellow.par} · {COURSES[c].Yellow.yards.toLocaleString()} yards
            </p>
          </button>
        </Card>
      ))}

      <Btn onClick={()=>go("round")}>Continue to round capture</Btn>
    </div>

    <Nav go={go}/>
  </div>
}

function Round({go}) {

  const holes = Array.from({length:18},(_,i)=>({
    hole:i+1
  }));

  return <div className="screenWrap">
    <Header title="Round capture" sub="Quick and easy hole tracking."/>

    <div className="holes">
      {holes.map(h => (
        <button key={h.hole} className="holeCard" onClick={()=>go("hole")}>
          <strong>{h.hole}</strong>
          <span>Ready</span>
        </button>
      ))}
    </div>

    <Nav go={go}/>
  </div>
}

function Hole({go}) {
  const par = 4;
  const [score,setScore] = useState(par);

  return <div className="screenWrap">
    <Header title="Hole 1" sub="Par 4 · SI 10"/>

    <div className="stack">

      <Card>
        <p className="eyebrow">Score</p>
        <div className="scoreRow">
          <button onClick={()=>setScore(score-1)}>-</button>
          <h1>{score}</h1>
          <button onClick={()=>setScore(score+1)}>+</button>
        </div>
      </Card>

      
        <Card soft>
          <p className="eyebrow">What best described the hole?</p>

          <div className="tagGrid">
            <button className="tag active">Good drive</button>
            <button className="tag">Miss left</button>
            <button className="tag">Miss right</button>
            <button className="tag">Penalty</button>
            <button className="tag">Three putt</button>
            <button className="tag">Up & down</button>
          </div>
        </Card>

        <Btn onClick={()=>go("review")}>Save hole and continue</Btn>
        
    </div>
  </div>
}

function Review({go}) {
  return <div className="screenWrap">
    <Header title="Round review" sub="What mattered today."/>

    <div className="stack">
      <Card>
        <h3>What worked</h3>
        <p>Driving becoming more reliable.</p>
      </Card>

      <Card>
        <h3>What cost shots</h3>
        <p>Approach distance control still costing strokes.</p>
      </Card>

      <Btn onClick={()=>go("plan")}>Next round plan</Btn>
    </div>

    <Nav go={go}/>
  </div>
}

function Plan({go}) {
  return <div className="screenWrap">
    <Header title="Next round plan" sub="Updated from your recent rounds."/>

    <div className="stack">
      <Card soft>
        <p className="eyebrow">↑ Updated focus</p>
        <h3>Take one more club into greens.</h3>
      </Card>

      <Card>
        <h3>Stable strength</h3>
        <p>Putting confidence holding steady.</p>
      </Card>
    </div>

    <Nav go={go}/>
  </div>
}

function Practice({go}) {

  const [done,setDone] = useState([]);

  const drills = [
    "Driver confidence",
    "Distance control",
    "Short putts"
  ];

  const toggle = (x) => {
    setDone(prev => prev.includes(x) ? prev.filter(i=>i!==x) : [...prev,x]);
  };

  return <div className="screenWrap">
    <Header title="Practice plan" sub="Simple and practical."/>

    <div className="stack">
      {drills.map(x => (
        <Card key={x} soft={done.includes(x)}>
          <div className="row">
            <button className={`tick ${done.includes(x)?"done":""}`} onClick={()=>toggle(x)}>✓</button>

            <div>
              <h3>{x}</h3>
              <p>Built around your recent round patterns.</p>
            </div>
          </div>
        </Card>
      ))}
    </div>

    <Nav go={go}/>
  </div>
}

function Progress({go}) {
  return <div className="screenWrap">
    <Header title="Progress" sub="Patterns over time."/>

    <div className="stack">
      <Card>
        <h3>Round 1</h3>
        <p>No three putts.</p>
      </Card>

      <Card soft>
        <h3>Round 2</h3>
        <p>Waiting for another completed round.</p>
      </Card>

      <Card soft>
        <h3>Round 3</h3>
        <p>More rounds unlock stronger trend confidence.</p>
      </Card>
    </div>

    <Nav go={go}/>
  </div>
}

function Rounds({go}) {
  return <div className="screenWrap">
    <Header title="Rounds" sub="Your golf story over time."/>

    <div className="stack">
      {sampleRounds.map((r,i)=>(
        <Card key={i}>
          <div className="between">
            <div>
              <p className="eyebrow">{r.course}</p>
              <h2>{r.score} ({r.relative})</h2>
            </div>

            <span>{r.date}</span>
          </div>

          <div className="pills">
            {r.insights.map(x=>(
              <div key={x} className="pill on lightPill">{x}</div>
            ))}
          </div>
        </Card>
      ))}
    </div>

    <Nav go={go}/>
  </div>
}

export default function App() {

  const [screen,setScreen] = useState("welcome");
  const [course,setCourse] = useState("Chipstead Golf Club");

  const go = (x) => {
    if(screens.includes(x)) setScreen(x);
  };

  return <>
    <style>{css}</style>

    {screen==="welcome" && <Welcome go={go}/>}
    {screen==="profile" && <Profile go={go}/>}
    {screen==="home" && <Home go={go}/>}
    {screen==="rounds" && <Rounds go={go}/>}
    {screen==="ready" && <Ready go={go}/>}
    {screen==="setup" && <Setup go={go} course={course} setCourse={setCourse}/>}
    {screen==="round" && <Round go={go}/>}
    {screen==="hole" && <Hole go={go}/>}
    {screen==="review" && <Review go={go}/>}
    {screen==="plan" && <Plan go={go}/>}
    {screen==="practice" && <Practice go={go}/>}
    {screen==="progress" && <Progress go={go}/>}
  </>
}

const css = `
body{
  margin:0;
  font-family:Inter,sans-serif;
  background:#E6F4EE;
  color:#0F2D2E;
}

.screenWrap{
  max-width:430px;
  margin:0 auto;
  min-height:100vh;
  background:white;
  padding-bottom:100px;
}

.logo{
  width:180px;
  margin:20px auto;
  display:block;
}

.welcome{
  padding:28px;
}

.header{
  padding:24px;
  border-bottom:1px solid #eee;
}

.stack{
  display:flex;
  flex-direction:column;
  gap:16px;
  padding:20px;
}

.card{
  border-radius:24px;
  padding:20px;
  background:white;
  border:1px solid #eee;
}

.card.soft{
  background:#F5FBF8;
}

.card.dark{
  background:#0F2D2E;
  color:white;
}

.btn{
  height:56px;
  border-radius:18px;
  border:0;
  background:#0F2D2E;
  color:white;
  font-weight:700;
}

.btn.secondary{
  background:white;
  color:#0F2D2E;
}

.row{
  display:flex;
  gap:14px;
}

.tick{
  width:42px;
  height:42px;
  border-radius:999px;
  border:0;
  background:#E6F4EE;
}

.tick.done{
  background:#17A589;
  color:white;
}

.pills{
  display:flex;
  flex-wrap:wrap;
  gap:10px;
  margin-top:12px;
}

.pill{
  border-radius:999px;
  padding:10px 14px;
  border:0;
}

.pill.on{
  background:#0F2D2E;
  color:white;
}

.lightPill{
  background:#E6F4EE !important;
  color:#0F2D2E !important;
}

.nav{
  position:fixed;
  bottom:0;
  width:100%;
  max-width:430px;
  display:grid;
  grid-template-columns:repeat(5,1fr);
  background:white;
  border-top:1px solid #eee;
}

.nav button{
  height:70px;
  border:0;
  background:white;
}

.holes{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:16px;
  padding:20px;
}

.holeCard{
  min-height:100px;
  border-radius:24px;
  border:1px solid #ddd;
  background:#F7F7F4;
}

.holeCard strong{
  display:block;
  font-size:34px;
  font-weight:800;
}

.holeCard span{
  font-size:14px;
}

.scoreRow{
  display:flex;
  align-items:center;
  justify-content:space-between;
}

.scoreRow button{
  width:44px;
  height:44px;
  border-radius:999px;
}

.courseBtn{
  width:100%;
  text-align:left;
  border:0;
  background:none;
}

.eyebrow{
  text-transform:uppercase;
  font-size:12px;
  letter-spacing:.08em;
}

.handicapRow{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:18px;
}

.handicapRow button,
.scoreRow button{
  width:52px;
  height:52px;
  border-radius:999px;
  border:0;
  background:#E6F4EE;
  font-size:22px;
  font-weight:700;
}

.courseSelect{
  width:100%;
  height:56px;
  border-radius:18px;
  border:1px solid rgba(15,45,46,.08);
  padding:0 16px;
  margin-top:12px;
  font-size:16px;
  background:white;
}

.teeSelector{
  display:flex;
  gap:10px;
  margin-top:16px;
}

.tee{
  flex:1;
  height:46px;
  border-radius:999px;
  border:1px solid rgba(15,45,46,.08);
  background:white;
  font-weight:600;
}

.tee.active{
  background:#0F2D2E;
  color:white;
}

.tagGrid{
  display:flex;
  flex-wrap:wrap;
  gap:12px;
  margin-top:16px;
}

.tag{
  border-radius:999px;
  padding:12px 16px;
  border:1px solid rgba(15,45,46,.08);
  background:white;
  font-weight:600;
}

.tag.active{
  background:#0F2D2E;
  color:white;
}

`;
