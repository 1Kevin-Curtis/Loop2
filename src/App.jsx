
import React, { useState } from 'react'

const COURSE_DATA = {
  "Chipstead Golf Club": { par: 70, yards: 6214 },
  "The Oaks Golf Club": { par: 72, yards: 6841 },
  "Kingswood Golf & Country Club": { par: 72, yards: 6610 },
  "Tandridge Golf Club": { par: 70, yards: 6483 },
  "Walton Heath Golf Club": { par: 72, yards: 7128 }
}

function TagGroup({title,tags}) {
  const [selected,setSelected] = useState("")
  return (
    <div className="card">
      <h3>{title}</h3>
      <div className="row">
        {tags.map(tag => (
          <button
            key={tag}
            className={selected === tag ? "tag active" : "tag"}
            onClick={() => setSelected(selected === tag ? "" : tag)}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const [course,setCourse] = useState("Chipstead Golf Club")

  return (
    <div className="page">
      <div className="phone">
        <div className="screen">

          <h1>Loop</h1>

          <div className="banner">
            Insight engine connected · analysing round patterns
          </div>

          <div className="card dark">
            <h2>Course setup</h2>
            <p>Select your course before the round starts.</p>
          </div>

          <div className="card">
            <p className="small">Course</p>

            <select
              value={course}
              onChange={(e)=>setCourse(e.target.value)}
            >
              {Object.keys(COURSE_DATA).map(course => (
                <option key={course}>{course}</option>
              ))}
            </select>

            <div className="meta">
              <strong>{course}</strong>
              <p>
                Par {COURSE_DATA[course].par} · {COURSE_DATA[course].yards} yards
              </p>
            </div>
          </div>

          <TagGroup
            title="Tee shot"
            tags={["Fairway","Left","Right","Penalty"]}
          />

          <TagGroup
            title="Approach"
            tags={["Green hit","Short","Left","Right","Long"]}
          />

          <TagGroup
            title="Putting"
            tags={["1-putt","2-putt","3-putt"]}
          />

          <div className="card">
            <h3>Live insight preview</h3>
            <p><strong>Main pattern detected</strong></p>
            <p>Approaches are consistently finishing short from 140+ yards.</p>
            <p className="small">
              Confidence · Medium · Based on 6 logged holes
            </p>
          </div>

          <button className="btn">
            Save hole and continue
          </button>

        </div>
      </div>

      <style>{`
      body{
        margin:0;
        font-family:-apple-system,BlinkMacSystemFont,sans-serif;
        background:#E6F4EE;
      }
      .page{
        min-height:100vh;
        display:flex;
        justify-content:center;
        align-items:center;
        padding:20px;
      }
      .phone{
        width:390px;
        height:844px;
        background:white;
        border-radius:42px;
        overflow:hidden;
        box-shadow:0 20px 60px rgba(0,0,0,.18);
      }
      .screen{
        height:100%;
        overflow:auto;
        padding:24px;
        background:linear-gradient(180deg,#fff 0%,#F7F7F4 70%,#E6F4EE 100%);
      }
      h1{
        font-size:42px;
        margin:0 0 20px;
        color:#0F2D2E;
      }
      .card{
        background:white;
        border-radius:24px;
        padding:18px;
        margin-bottom:16px;
        box-shadow:0 8px 24px rgba(0,0,0,.05);
      }
      .dark{
        background:#0F2D2E;
        color:white;
      }
      .banner{
        background:#E6F4EE;
        color:#0F2D2E;
        padding:14px;
        border-radius:16px;
        margin-bottom:16px;
        font-weight:700;
      }
      select{
        width:100%;
        height:54px;
        border-radius:16px;
        padding:0 16px;
        margin-top:8px;
      }
      .meta{
        margin-top:14px;
      }
      .row{
        display:flex;
        gap:8px;
        flex-wrap:wrap;
        margin-top:12px;
      }
      .tag{
        border:none;
        padding:12px 14px;
        border-radius:999px;
        cursor:pointer;
      }
      .active{
        background:#0F2D2E;
        color:white;
      }
      .btn{
        width:100%;
        height:56px;
        border:none;
        border-radius:18px;
        background:#0F2D2E;
        color:white;
        font-weight:700;
      }
      .small{
        opacity:.7;
        font-size:13px;
      }
      `}</style>
    </div>
  )
}
