import { useState, useRef, useEffect, useCallback } from "react";

/* ══════════════════════════════════════════════════════════
   DATA & CONFIGURATION (Fully Documented & Structured)
══════════════════════════════════════════════════════════ */
const FINE_DB = {
  "No Helmet":             { base:1000,  repeat:2000,  states:{Delhi:1000,Maharashtra:500,Karnataka:500,Kerala:500,"Tamil Nadu":500,"West Bengal":500},  section:"Section 129 MV Act",  vehicles:["two-wheeler"] },
  "Speeding":              { base:1000,  repeat:2000,  states:{Delhi:2000,Maharashtra:1500,Karnataka:1000,Kerala:1500,"Tamil Nadu":1500,"West Bengal":1000}, section:"Section 183 MV Act",  vehicles:["car","two-wheeler","truck","bus"] },
  "Jumping Red Light":     { base:1000,  repeat:2000,  states:{Delhi:5000,Maharashtra:1000,Karnataka:1000,Kerala:1000,"Tamil Nadu":1000,"West Bengal":1000}, section:"Section 119 MV Act",  vehicles:["car","two-wheeler","truck","bus"] },
  "No Seat Belt":          { base:1000,  repeat:1000,  states:{Delhi:1000,Maharashtra:1000,Karnataka:500, Kerala:1000,"Tamil Nadu":500,"West Bengal":500},  section:"Section 138 MV Act",  vehicles:["car","bus","truck"] },
  "Mobile While Driving":  { base:5000,  repeat:10000, states:{Delhi:5000,Maharashtra:5000,Karnataka:5000,Kerala:5000,"Tamil Nadu":5000,"West Bengal":5000}, section:"Section 184 MV Act",  vehicles:["car","two-wheeler","truck","bus"] },
  "Drunk Driving":         { base:10000, repeat:15000, states:{Delhi:10000,Maharashtra:10000,Karnataka:10000,Kerala:10000,"Tamil Nadu":10000,"West Bengal":10000}, section:"Section 185 MV Act", vehicles:["car","two-wheeler","truck","bus"] },
  "No PUC Certificate":    { base:10000, repeat:10000, states:{Delhi:10000,Maharashtra:2000,Karnataka:1000,Kerala:1000,"Tamil Nadu":1000,"West Bengal":1000}, section:"Section 190(2) MV Act",vehicles:["car","two-wheeler","truck","bus"] },
  "No Insurance":          { base:2000,  repeat:4000,  states:{Delhi:2000,Maharashtra:2000,Karnataka:2000,Kerala:2000,"Tamil Nadu":2000,"West Bengal":2000},  section:"Section 196 MV Act",  vehicles:["car","two-wheeler","truck","bus"] },
  "Overloading":           { base:2000,  repeat:2000,  states:{Delhi:2000,Maharashtra:2000,Karnataka:1000,Kerala:1500,"Tamil Nadu":1000,"West Bengal":1000},  section:"Section 194 MV Act",  vehicles:["truck","bus","car"] },
  "No Licence":            { base:5000,  repeat:10000, states:{Delhi:5000,Maharashtra:5000,Karnataka:5000,Kerala:5000,"Tamil Nadu":5000,"West Bengal":5000},  section:"Section 181 MV Act",  vehicles:["car","two-wheeler","truck","bus"] },
};

const COUNTRY_DATA = {
  "India": {
    flag:"🇮🇳", drivesSide:"Left", currency:"₹",
    lastVerified: "June 2026",
    emergency:{ police:"100", ambulance:"108", highway:"1033", fire:"101" },
    speedLimits:{ school:"25 km/h", residential:"30 km/h", urban:"50 km/h", highway:"80–100 km/h", expressway:"120 km/h" },
    keyLaws:[
      { icon:"🪖", rule:"Helmet mandatory for 2-wheelers", fine:"₹1,000", law:"Sec 129 MVA" },
      { icon:"🎗️", rule:"Seatbelt mandatory (all seats)", fine:"₹1,000", law:"Sec 138 MVA" },
      { icon:"📵", rule:"No phone while driving", fine:"₹5,000", law:"Sec 184 MVA" },
      { icon:"🍺", rule:"Drunk driving (BAC >30mg/100ml)", fine:"₹10,000+", law:"Sec 185 MVA" },
      { icon:"RL", rule:"Speeding", fine:"₹1,000–2,000", law:"Sec 183 MVA" },
      { icon:"🚦", rule:"Jumping red light", fine:"₹1,000–5,000", law:"Sec 119 MVA" },
      { icon:"🔴", rule:"No insurance", fine:"₹2,000", law:"Sec 196 MVA" },
      { icon:"📄", rule:"Driving without licence", fine:"₹5,000", law:"Sec 181 MVA" },
    ],
    source:"Motor Vehicles Act 1988 (Amended 2019)",
    tips:["Carry DL, RC, Insurance & PUC at all times","Digital documents on DigiLocker are legally accepted","Use Parivahan app to check vehicle details"],
  },
  "USA": {
    flag:"🇺🇸", drivesSide:"Right", currency:"$",
    lastVerified: "June 2026",
    emergency:{ police:"911", emergency:"911", highway:"511" },
    speedLimits:{ school:"15–25 mph", residential:"25–35 mph", urban:"35–45 mph", highway:"65–70 mph", expressway:"75–80 mph" },
    keyLaws:[
      { icon:"🎗️", rule:"Seatbelt mandatory (all 50 states)", fine:"$25–$200", law:"State-specific" },
      { icon:"🪖", rule:"Motorcycle helmet (most states)", fine:"$25–$500", law:"State-specific" },
      { icon:"📵", rule:"No handheld phone (most states)", fine:"$50–$500", law:"State-specific" },
      { icon:"🍺", rule:"DUI BAC limit 0.08%", fine:"$500–$2,000+", law:"State Traffic Codes" },
      { icon:"𚸓", rule:"Stop for school bus (flashing lights)", fine:"$100–$1,000", law:"State-specific" },
      { icon:"🔴", rule:"Running red light", fine:"$100–$500", law:"State-specific" },
    ],
    source:"FMVSS + State Traffic Laws (varies by state)",
    tips:["Laws vary significantly by state","Always carry your Driver's License","Stop completely at stop signs"],
  },
  "UK": {
    flag:"🇬🇧", drivesSide:"Left", currency:"£",
    lastVerified: "June 2026",
    emergency:{ police:"999", ambulance:"999", emergency:"999", highway:"0300 123 5000" },
    speedLimits:{ school:"20 mph", residential:"30 mph", urban:"30–40 mph", highway:"70 mph", expressway:"70 mph" },
    keyLaws:[
      { icon:"🎗️", rule:"Seatbelt mandatory", fine:"£500", law:"RTA 1988 S.14" },
      { icon:"🪖", rule:"Motorcycle helmet mandatory", fine:"£500", law:"RTA 1988 S.16" },
      { icon:"📵", rule:"No handheld phone", fine:"£1,000 + 6 points", law:"RTA 1988 S.41D" },
      { icon:"🍺", rule:"Drink driving BAC 80mg/100ml", fine:"Unlimited fine + ban", law:"RTA 1988 S.5" },
      { icon:"⚡", rule:"Speeding (30mph zone)", fine:"£100 + 3 points", law:"RTOA 1988" },
      { icon:"🚦", rule:"Red light violation", fine:"£100 + 3 points", law:"TSRGD 2016" },
    ],
    source:"Road Traffic Act 1988 & UK Highway Code",
    tips:["Highway Code mandatory knowledge for all drivers","Keep left except when overtaking on motorways","Speed cameras are widespread"],
  },
  "Germany": {
    flag:"🇩🇪", drivesSide:"Right", currency:"€",
    lastVerified: "June 2026",
    emergency:{ police:"110", ambulance:"112", fire:"112", breakdown:"0800 5 10 11 12" },
    speedLimits:{ residential:"30 km/h", urban:"50 km/h", highway:"100 km/h", expressway:"130 km/h (Advisory)" },
    keyLaws:[
      { icon:"🎗️", rule:"Seatbelt mandatory", fine:"€30", law:"§21a StVO" },
      { icon:"🪖", rule:"Motorcycle helmet mandatory", fine:"€15", law:"§21a StVO" },
      { icon:"📵", rule:"No handheld phone", fine:"€100 + 1 point", law:"§23 StVO" },
      { icon:"🍺", rule:"Drunk driving BAC 0.05% (0% for new drivers)", fine:"€500–1,500", law:"§24a StVG" },
      { icon:"🔦", rule:"First aid kit + reflective triangle mandatory", fine:"€5–€15", law:"§35h StVZO" },
      { icon:"🌨️", rule:"Winter tyres required in icy/snowy conditions", fine:"€60–€80", law:"§2 StVO" },
    ],
    source:"Straßenverkehrsordnung (StVO) & StVG",
    tips:["Autobahn advisory limit is 130 km/h but enforceable during bad weather","Right of way: traffic from the right unless signed","Passing on the right on motorways is illegal"],
  },
};

const ALL_COUNTRIES = Object.keys(COUNTRY_DATA);
const VIOLATIONS = Object.keys(FINE_DB);
const STATES_LIST = ["Delhi","Maharashtra","Karnataka","Kerala","Tamil Nadu","West Bengal","Rajasthan","Gujarat","Punjab","Haryana","Other"];
const VEHICLES_LIST = ["car","two-wheeler","truck","bus","auto-rickshaw"];

const QUIZ_Q = [
  { q:"What is the fine for not wearing a helmet in Delhi?", opts:["₹500","₹1,000","₹2,000","₹5,000"], ans:1, exp:"Section 129 MV Act — ₹1,000 for first offence in Delhi." },
  { q:"India's legal BAC (blood alcohol) limit for driving?", opts:["80mg/100ml","30mg/100ml","50mg/100ml","Zero tolerance"], ans:1, exp:"India's limit is 30mg per 100ml of blood under Section 185 MV Act." },
  { q:"Fine for using mobile phone while driving in India?", opts:["₹1,000","₹2,000","₹5,000","₹500"], ans:2, exp:"Section 184 MV Act — ₹5,000 fine for mobile phone use while driving." },
];

/* ══════════════════════════════════════════════════════════
   HELPERS & LIGHTWEIGHT MARKDOWN PARSER UTILITIES
══════════════════════════════════════════════════════════ */
const ts = () => new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
let _id = 1;
const nid = () => _id++;

// Simple bold token utility (**text** -> <strong>)
function parseBold(str) {
  const parts = str.split(/\*\*([\s\S]*?)\*\*/g);
  return parts.map((part, i) => (i % 2 === 1 ? <strong key={i} style={{ fontWeight: 700 }}>{part}</strong> : part));
}

// Lightweight Markdown Processor — handles ####, nested bullets (* *), and tables
function renderMarkdown(text) {
  if (!text) return "";

  const lines = text.split("\n");
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const t = raw.trim();

    // blank line — skip
    if (!t) { i++; continue; }

    // #### heading → styled section label
    if (t.startsWith("#### ")) {
      out.push(
        <div key={i} style={{ fontWeight: 700, fontSize: 14, color: "#FF6B35", margin: "16px 0 5px", paddingBottom: 4, borderBottom: "1px solid #F3F4F6" }}>
          {parseBold(t.slice(5))}
        </div>
      );
      i++; continue;
    }

    // ### heading
    if (t.startsWith("### ")) {
      out.push(<h4 key={i} style={{ margin: "14px 0 6px", fontSize: 15, fontWeight: 700, color: "#0A1628" }}>{parseBold(t.slice(4))}</h4>);
      i++; continue;
    }

    // ## heading
    if (t.startsWith("## ")) {
      out.push(<h3 key={i} style={{ margin: "16px 0 8px", fontSize: 16, fontWeight: 700, color: "#0A1628" }}>{parseBold(t.slice(3))}</h3>);
      i++; continue;
    }

    // # heading
    if (t.startsWith("# ")) {
      out.push(<h2 key={i} style={{ margin: "16px 0 8px", fontSize: 17, fontWeight: 800, color: "#0A1628" }}>{parseBold(t.slice(2))}</h2>);
      i++; continue;
    }

    // horizontal rule
    if (t === "---") {
      out.push(<hr key={i} style={{ border: "none", borderTop: "1px solid #E5E7EB", margin: "12px 0" }} />);
      i++; continue;
    }

    // table block — collect all consecutive | lines
    if (t.startsWith("|")) {
      const tLines = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tLines.push(lines[i].trim());
        i++;
      }
      const isSep = (l) => /^\|[\s\-:|]+\|$/.test(l);
      const dataRows = tLines.filter(l => !isSep(l));
      const parseRow = (l) => l.replace(/^\||\|$/g, "").split("|").map(c => c.trim());
      if (dataRows.length > 0) {
        const headers = parseRow(dataRows[0]);
        const bodyRows = dataRows.slice(1);
        out.push(
          <div key={`t${i}`} style={{ overflowX: "auto", margin: "12px 0 16px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  {headers.map((h, j) => (
                    <th key={j} style={{ padding: "9px 13px", background: "#0A1628", color: "#fff", fontWeight: 700, textAlign: "left", whiteSpace: "nowrap" }}>
                      {parseBold(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, j) => {
                  const cells = parseRow(row);
                  return (
                    <tr key={j} style={{ background: j % 2 === 0 ? "#F9FAFB" : "#FFFFFF" }}>
                      {cells.map((c, k) => (
                        <td key={k} style={{ padding: "8px 13px", borderBottom: "1px solid #E5E7EB", verticalAlign: "top" }}>
                          {parseBold(c)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    // bullet / numbered list — with nested "* * " sub-bullet support
    if (t.startsWith("* ") || t.startsWith("- ") || t.startsWith("* * ") || /^\d+\.\s/.test(t)) {
      const listLines = [];
      while (i < lines.length) {
        const lt = lines[i].trim();
        if (!lt) { i++; break; }
        if (lt.startsWith("* * ") || lt.startsWith("* ") || lt.startsWith("- ") || /^\d+\.\s/.test(lt)) {
          listLines.push(lt);
          i++;
        } else break;
      }

      // group into parent items, each carrying optional sub-items
      const items = [];
      for (const ll of listLines) {
        if (ll.startsWith("* * ")) {
          const subText = ll.slice(4);
          if (items.length) items[items.length - 1].subs.push(subText);
        } else {
          const text = ll.replace(/^(\* |- |\d+\.\s)/, "");
          items.push({ text, subs: [] });
        }
      }

      out.push(
        <ul key={`l${i}`} style={{ margin: "5px 0 10px", paddingLeft: 20, listStyleType: "disc" }}>
          {items.map((item, j) => (
            <li key={j} style={{ marginBottom: item.subs.length ? 3 : 5, lineHeight: 1.55 }}>
              {parseBold(item.text)}
              {item.subs.length > 0 && (
                <ul style={{ margin: "4px 0 4px", paddingLeft: 18, listStyleType: "circle" }}>
                  {item.subs.map((s, k) => (
                    <li key={k} style={{ marginBottom: 3, lineHeight: 1.45, color: "#374151" }}>{parseBold(s)}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // default paragraph
    out.push(<p key={i} style={{ margin: "0 0 8px", lineHeight: 1.6 }}>{parseBold(t)}</p>);
    i++;
  }

  return out;
}

async function shrinkImage(file, max = 1024) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const r = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = img.width * r; c.height = img.height * r;
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        res(c.toDataURL("image/jpeg", 0.82).split(",")[1]);
      };
      img.onerror = rej;
      img.src = e.target.result;
    };
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}

async function apiGatewayFetch(endpoint, payload) {
  const res = await fetch(`/api/legal-co-pilot/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Gateway Error (${res.status})`);
  return res.json();
}

const buildSysPrompt = (loc) =>
`You are DriveLegal — a precise, professional AI assistant for global road safety and traffic law.
${loc ? `Verified User location context: ${loc.city || ""}${loc.country ? ", " + loc.country : ""}.` : ""}
Current Year: 2026.

Provide structured legal context covering:
- Traffic acts, penal codes, and official amendments.
- Statutory liability, document retention rules, and jurisdictional variances.

When presenting an action or fine amount:
1. State the baseline statutory authority explicitly (e.g., Section 184 of the MV Act).
2. Append a transparency note identifying whether data stems from embedded internal matrix records or generalized baseline distributions.
3. Keep responses conversational yet authoritative, accurate, and completely localized.`;

const T = {
  bg:       "#F2F0EB",
  hdr:      "#FFFFFF",
  botBub:   "#FFFFFF",
  usrBub:   "#1A1A2E",
  usrTxt:   "#FFFFFF",
  botTxt:   "#1C1C1E",
  sub:      "#6B7280",
  accent:   "#FF6B35",
  accentBg: "#FFF2EC",
  navy:     "#0A1628",
  red:      "#DC2626",
  redBg:    "#FEF2F2",
  green:    "#059669",
  greenBg:  "#ECFDF5",
  blue:     "#1565C0",
  blueBg:   "#EFF6FF",
  border:   "#E5E7EB",
  shadow:   "rgba(0,0,0,0.06)",
};

/* ══════════════════════════════════════════════════════════
   WIDGETS (Fixed Lookups & Applicability Mappings)
══════════════════════════════════════════════════════════ */
function ChallancCalc({ onDone }) {
  const [violation, setViolation] = useState(VIOLATIONS[0]);
  const [state, setState] = useState("Delhi");
  const [vehicle, setVehicle] = useState("car");
  const [repeat, setRepeat] = useState(false);
  const [result, setResult] = useState(null);

  function calc() {
    const d = FINE_DB[violation]; if (!d) return;
    const stateAmt = d.states[state] !== undefined ? d.states[state] : d.base;
    const amount = repeat ? Math.max(d.repeat, stateAmt * 2) : stateAmt;
    
    const applies = d.vehicles.includes(vehicle);
    setResult({ amount, section: d.section, applies, restrictedTo: d.vehicles });
  }

  const sel = (v, s) => ({ 
    value: v, 
    onChange: e => { s(e.target.value); setResult(null); }, 
    style: { width:"100%", padding:"9px 12px", borderRadius:8, border:`1.5px solid ${T.border}`, fontSize:13.5, background:"#FAFAF8", color:T.botTxt, cursor:"pointer" } 
  });

  return (
    <div style={{ background:T.botBub, borderRadius:16, overflow:"hidden", border:`1px solid ${T.border}`, maxWidth:340 }} role="region" aria-label="Challan Calculator">
      <div style={{ background:T.navy, padding:"11px 15px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ color:"#fff", fontWeight:700, fontSize:14 }}>⚖️ Challan Calculator</span>
        <button onClick={onDone} aria-label="Close Calculator" style={{ background:"none", border:"none", color:"#8DB6D8", cursor:"pointer", fontSize:20, padding:0 }}>×</button>
      </div>
      <div style={{ padding:14 }}>
        <div style={{ marginBottom:10 }}>
          <div style={{ fontSize:11, fontWeight:600, color:T.sub, marginBottom:5, textTransform:"uppercase" }}>Violation</div>
          <select {...sel(violation, setViolation)} aria-label="Select Violation">{VIOLATIONS.map(v=><option key={v}>{v}</option>)}</select>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
          <div>
            <div style={{ fontSize:11, fontWeight:600, color:T.sub, marginBottom:5, textTransform:"uppercase" }}>State</div>
            <select {...sel(state, setState)} aria-label="Select State">{STATES_LIST.map(s=><option key={s}>{s}</option>)}</select>
          </div>
          <div>
            <div style={{ fontSize:11, fontWeight:600, color:T.sub, marginBottom:5, textTransform:"uppercase" }}>Vehicle Type</div>
            <select {...sel(vehicle, setVehicle)} aria-label="Select Vehicle Type">{VEHICLES_LIST.map(v=><option key={v}>{v}</option>)}</select>
          </div>
        </div>
        <label style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12, cursor:"pointer", fontSize:13, color:T.botTxt }}>
          <input type="checkbox" checked={repeat} onChange={e=>{setRepeat(e.target.checked);setResult(null);}} style={{ accentColor:T.accent, width:15, height:15 }}/>
          Repeat offence (higher penalty)
        </label>
        <button onClick={calc} style={{ width:"100%", padding:"10px", borderRadius:10, background:T.accent, color:"#fff", border:"none", fontWeight:700, fontSize:14, cursor:"pointer" }}>
          Calculate Fine →
        </button>
        {result && (
          <div style={{ marginTop:12, padding:14, borderRadius:12, background:result.applies ? T.accentBg : T.redBg, border:`1.5px solid ${result.applies ? T.accent : T.red}` }}>
            {result.applies ? (
              <>
                <div style={{ fontSize:10, fontWeight:700, color:T.accent, marginBottom:6, textTransform:"uppercase" }}>Estimated Fine</div>
                <div style={{ fontSize:36, fontWeight:800, color:T.navy, letterSpacing:"-1px" }}>₹{result.amount.toLocaleString("en-IN")}</div>
                <div style={{ fontSize:12, color:T.sub, marginTop:6 }}>{result.section} · {repeat ? "Repeat offence" : "First offence"}</div>
              </>
            ) : (
              <div style={{ fontSize:12, color:T.red }}>
                ⚠️ <strong>Statutory Variance:</strong> This rule is not enforced for <strong>{vehicle}</strong>. It explicitly targets: {result.restrictedTo.join(", ")}.
              </div>
            )}
            <div style={{ marginTop:10, fontSize:11, color:T.blue, background:T.blueBg, padding:"7px 10px", borderRadius:6, lineHeight:1.4 }}>
              ℹ️ Verified via {result.section || "Motor Vehicles Act Matrix"}. Multi-jurisdictional criteria apply.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function QuizCard({ onDone, onPoints }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = QUIZ_Q[idx];

  function pick(i) {
    if (sel !== null) return;
    setSel(i);
    if (i === q.ans) { setScore(s => s+1); onPoints(10); }
  }
  function next() {
    if (idx + 1 >= QUIZ_Q.length) { setDone(true); return; }
    setIdx(i => i+1); setSel(null);
  }

  if (done) return (
    <div style={{ background:T.botBub, borderRadius:16, overflow:"hidden", border:`1px solid ${T.border}`, maxWidth:340 }}>
      <div style={{ padding:20, textAlign:"center" }}>
        <div style={{ fontSize:52 }}>🎯</div>
        <div style={{ fontSize:26, fontWeight:800, color:T.navy, margin:"8px 0 4px" }}>{score} / {QUIZ_Q.length} Correct</div>
        <button onClick={onDone} style={{ marginTop:10, padding:"8px 20px", borderRadius:10, background:T.accent, color:"#fff", border:"none", fontWeight:700, cursor:"pointer" }}>Finish</button>
      </div>
    </div>
  );

  return (
    <div style={{ background:T.botBub, borderRadius:16, overflow:"hidden", border:`1px solid ${T.border}`, maxWidth:340 }}>
      <div style={{ background:T.navy, padding:"11px 15px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ color:"#fff", fontWeight:700, fontSize:14 }}>🎯 Safety Quiz</span>
      </div>
      <div style={{ padding:14 }}>
        <div style={{ fontSize:14, fontWeight:600, color:T.navy, marginBottom:14 }}>{q.q}</div>
        {q.opts.map((opt, i) => {
          let bg="#FAFAF8", bdr=T.border, clr=T.botTxt;
          if (sel!==null) {
            if (i===q.ans) { bg=T.greenBg; bdr=T.green; clr=T.green; }
            else if (i===sel) { bg=T.redBg; bdr=T.red; clr=T.red; }
          }
          return (
            <button key={i} onClick={()=>pick(i)} style={{ width:"100%", marginBottom:8, padding:"10px 14px", borderRadius:10, border:`1.5px solid ${bdr}`, background:bg, color:clr, textAlign:"left", cursor:sel===null?"pointer":"default" }}>
              {opt}
            </button>
          );
        })}
        {sel!==null && (
          <div style={{ marginTop:10 }}>
            <div style={{ padding:"8px 10px", background:"#FFFBEB", fontSize:12, color:"#92400E", marginBottom:10 }}>{q.exp}</div>
            <button onClick={next} style={{ width:"100%", padding:10, borderRadius:10, background:T.accent, color:"#fff", border:"none", fontWeight:700, cursor:"pointer" }}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
}

function RulebookCard({ countryName, onDone }) {
  const [selected, setSelected] = useState(countryName || "India");
  const d = COUNTRY_DATA[selected];
  if (!d) return null;

  return (
    <div style={{ background:T.botBub, borderRadius:16, overflow:"hidden", border:`1px solid ${T.border}`, maxWidth:360 }} role="region" aria-label="Rulebook Matrix">
      <div style={{ background:T.navy, padding:"11px 15px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ color:"#fff", fontWeight:700, fontSize:14 }}>{d.flag} Direct Rulebook Lookup</span>
        <button onClick={onDone} aria-label="Close Rulebook" style={{ background:"none", border:"none", color:"#8DB6D8", cursor:"pointer", fontSize:20 }}>×</button>
      </div>
      <div style={{ padding:14 }}>
        <select value={selected} onChange={e=>setSelected(e.target.value)} style={{ width:"100%", padding:"8px 12px", borderRadius:8, border:`1.5px solid ${T.border}`, fontSize:13, marginBottom:12 }} aria-label="Change Jurisdiction">
          {ALL_COUNTRIES.map(c=><option key={c}>{c}</option>)}
        </select>
        
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:12 }}>
          <div style={{ padding:"7px 10px", borderRadius:8, background:T.bg, border:`1px solid ${T.border}`, fontSize:11.5 }}>
            <div style={{ color:T.sub }}>🚗 Side</div>
            <div style={{ fontWeight:700, color:T.navy }}>{d.drivesSide}</div>
          </div>
          <div style={{ padding:"7px 10px", borderRadius:8, background:T.bg, border:`1px solid ${T.border}`, fontSize:11.5 }}>
            <div style={{ color:T.sub }}>🏙️ Urban Limit</div>
            <div style={{ fontWeight:700, color:T.navy }}>{d.speedLimits.urban || "See Grid"}</div>
          </div>
          <div style={{ padding:"7px 10px", borderRadius:8, background:T.bg, border:`1px solid ${T.border}`, fontSize:11.5 }}>
            <div style={{ color:T.sub }}>🚔 Emergency</div>
            <div style={{ fontWeight:700, color:T.navy }}>{d.emergency.police || d.emergency.emergency}</div>
          </div>
        </div>

        <div style={{ padding:"8px 10px", borderRadius:8, background:T.blueBg, border:`1px solid #BFDBFE`, marginBottom:12, fontSize:11.5, color:"#1E40AF" }}>
          🛡️ <strong>Verification Layer:</strong> Static Rulebook data matches verified legislation up to <strong>{d.lastVerified}</strong>. Current runtime context is <strong>June 2026</strong>.
        </div>

        <div style={{ fontSize:11, fontWeight:700, color:T.sub, marginBottom:6, textTransform:"uppercase" }}>Full Metric Ranges</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:12 }}>
          {Object.entries(d.speedLimits).map(([k,v])=>(
            <div key={k} style={{ padding:"7px 9px", borderRadius:8, background:T.bg, border:`1px solid ${T.border}`, fontSize:12 }}>
              <div style={{ color:T.sub, fontSize:11, textTransform:"capitalize" }}>{k} Zone</div>
              <div style={{ fontWeight:700, color:T.accent }}>{v}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize:11, fontWeight:700, color:T.sub, marginBottom:6, textTransform:"uppercase" }}>Statutory Key Measures</div>
        {d.keyLaws.map((law,i)=>(
          <div key={i} style={{ display:"flex", gap:10, padding:"8px 10px", borderRadius:8, background:i%2===0?T.bg:"transparent", alignItems:"center" }}>
            <span style={{ fontSize:16 }}>{law.icon}</span>
            <div style={{ flex:1, fontSize:12 }}>
              <div style={{ color:T.botTxt, fontWeight:500 }}>{law.rule}</div>
              <div style={{ color:T.sub, fontSize:10 }}>{law.law}</div>
            </div>
            <div style={{ fontSize:12, fontWeight:700, color:T.accent }}>{law.fine}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PRIVACY CONTROLLED EMERGENCY CONTEXT
══════════════════════════════════════════════════════════ */
function EmergencyModal({ loc, onClose }) {
  const [country, setCountry] = useState(() => {
    if (!loc?.country) return "India";
    return ALL_COUNTRIES.find(c => loc.country.toLowerCase().includes(c.toLowerCase())) || "India";
  });
  const d = COUNTRY_DATA[country];

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.65)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:999 }} onClick={onClose}>
      <div style={{ background:"#fff", borderRadius:"20px 20px 0 0", width:"100%", maxWidth:520, overflow:"hidden" }} onClick={e=>e.stopPropagation()}>
        <div style={{ background:T.red, padding:"16px 18px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ color:"#fff", fontWeight:800, fontSize:17 }}>🆘 Emergency Dispatch Matrix</span>
          <button onClick={onClose} aria-label="Dismiss Modal" style={{ background:"none", border:"none", color:"#fff", fontSize:20, cursor:"pointer" }}>×</button>
        </div>
        <div style={{ padding:16, maxHeight:"70vh", overflowY:"auto" }}>
          {loc && (
            <div style={{ padding:"10px 13px", borderRadius:10, background:T.greenBg, border:`1px solid #6EE7B7`, marginBottom:14, fontSize:13, color:"#065F46" }}>
              📍 <strong>Active Local Context:</strong> {loc.city ? `${loc.city}, ${loc.country}` : "Coordinate Anchor Validated"}
            </div>
          )}
          <div style={{ marginBottom:12 }}>
            <select value={country} onChange={e=>setCountry(e.target.value)} style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:`1.5px solid ${T.border}`, fontSize:13.5 }}>
              {ALL_COUNTRIES.map(c=><option key={c}>{c} {COUNTRY_DATA[c].flag}</option>)}
            </select>
          </div>
          {d && Object.entries(d.emergency).map(([label, num])=>(
            <a key={label} href={`tel:${num}`} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"13px 15px", borderRadius:12, background:"#FAFAF8", border:`1px solid ${T.border}`, marginBottom:8, textDecoration:"none" }}>
              <span style={{ fontSize:14, color:T.botTxt, textTransform:"capitalize", fontWeight:500 }}>{label}</span>
              <span style={{ fontSize:18, fontWeight:800, color:T.red }}>{num}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN CO-PILOT APP VIEW
══════════════════════════════════════════════════════════ */
export default function DriveLegal() {
  const [msgs, setMsgs] = useState([{
    id:nid(), role:"bot", time:ts(),
    text:"Welcome to **DriveLegal** — Your global verification co-pilot.\n\nType queries in natural phrasing, or leverage sandboxed utilities:\n→ **/challan** — Fine Matrix engine\n→ **/quiz** — Assessment system\n→ **/rules [country]** — Jurisdictional rulebooks\n→ **/emergency** — SOS operational routing",
    suggestions:["Fine for no helmet in Delhi?","UK speed limits?","Drunk driving penalty UAE?"],
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [offline, setOffline] = useState(!navigator.onLine);
  const [pendingImg, setPendingImg] = useState(null);
  const [pts, setPts] = useState(0);
  const [showCmds, setShowCmds] = useState(false);
  const [activeWidget, setActiveWidget] = useState(null);

  /* Opt-In Privacy Managed States */
  const [loc, setLoc] = useState(null);
  const [locPermission, setLocPermission] = useState("prompt");

  const bottomRef = useRef(null);
  const recog = useRef(null);
  const fileRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const goOnline  = () => setOffline(false);
    const goOffline = () => setOffline(true);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => { window.removeEventListener("online", goOnline); window.removeEventListener("offline", goOffline); };
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs, loading]);

  const requestLocationAccess = useCallback(() => {
    if (!navigator.geolocation) {
      setLocPermission("denied");
      return;
    }
    navigator.geolocation.getCurrentPosition(async pos => {
      const { latitude: lat, longitude: lng } = pos.coords;
      setLocPermission("granted");
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
        const data = await r.json();
        setLoc({ lat, lng, city: data.address?.city || data.address?.town || null, country: data.address?.country || null });
      } catch {
        setLoc({ lat, lng, city: null, country: null });
      }
    }, () => setLocPermission("denied"), { timeout: 8000 });
  }, []);

  function addMsg(msg) { setMsgs(prev => [...prev, { id:nid(), time:ts(), ...msg }]); }

  function toggleVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Voice input is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    // If already listening, abort the active session
    if (listening) {
      if (recog.current) {
        recog.current.abort();
        recog.current = null;
      }
      setListening(false);
      return;
    }

    // Create a FRESH instance every time — reusing a finished instance causes a silent InvalidStateError
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.lang = "en-IN";

    recognition.onstart = () => setListening(true);

    recognition.onresult = (e) => {
      setInput(e.results[0][0].transcript);
      setListening(false);
      recog.current = null;
    };

    recognition.onerror = (e) => {
      setListening(false);
      recog.current = null;
      if (e.error === "not-allowed") {
        alert("Microphone access was denied. Please allow microphone permission in your browser settings and try again.");
      }
    };

    recognition.onend = () => {
      setListening(false);
      recog.current = null;
    };

    recog.current = recognition;

    try {
      recognition.start();
    } catch (err) {
      console.error("Could not start mic:", err);
      setListening(false);
      recog.current = null;
    }
  }

  async function onFile(e) {
    const file = e.target.files?.[0]; if (!file) return;
    e.target.value = "";
    try {
      const b64 = await shrinkImage(file);
      setPendingImg({ b64, preview:`data:image/jpeg;base64,${b64}` });
    } catch { 
      addMsg({ role:"bot", text:"Failed to process image attachment correctly." }); 
    }
  }

  async function handleSend(forcedText = null) {
    const rawQuery = forcedText !== null ? forcedText : input;
    const cleanQuery = rawQuery.trim();
    
    if (!cleanQuery && !pendingImg) return;
    
    setInput("");
    setShowCmds(false);

    // 1. Intercept Isolated Local Commands
    if (cleanQuery.startsWith("/")) {
      const lowerCmd = cleanQuery.toLowerCase();
      if (lowerCmd === "/challan") {
        addMsg({ role: "user", text: "🧮 Opened Challan Calculator" });
        setActiveWidget("challan");
        return;
      }
      if (lowerCmd === "/quiz") {
        addMsg({ role: "user", text: "🎯 Opened Safety Quiz" });
        setActiveWidget("quiz");
        return;
      }
      if (lowerCmd.startsWith("/rules")) {
        const targetCountry = cleanQuery.substring(6).trim();
        addMsg({ role: "user", text: `📖 Requested Rulebook for: ${targetCountry || "Default Grid"}` });
        setActiveWidget({ type: "rules", country: targetCountry });
        return;
      }
      if (lowerCmd === "/emergency") {
        addMsg({ role: "user", text: "🆘 Triggered Emergency Routing Modal" });
        setShowEmergency(true);
        return;
      }
    }

    // 2. Commit User Messages to Layout Pipeline
    const currentImg = pendingImg;
    setPendingImg(null);
    addMsg({ 
      role: "user", 
      text: cleanQuery || "👁️ Analyzing uploaded image layer asset...",
      imgPreview: currentImg?.preview 
    });

    setLoading(true);

    // 3. Fallback Layer for Sandbox Offline Continuity
    if (offline) {
      setTimeout(() => {
        addMsg({
          role: "bot",
          text: `⚠️ **Offline Mode Active:**\n\nYour sandbox system is disconnected from local networks. Here is your baseline resolution:\n\n* **Query Received:** "${cleanQuery || "Multimodal Asset Stream"}"\n* **Note:** Connect to your network interface gateway to run active Gemini live rulesets.`
        });
        setLoading(false);
      }, 800);
      return;
    }

    // 4. Production API Gateway Execution
    try {
      let resultData;
      if (currentImg) {
        resultData = await apiGatewayFetch("analyze-image", {
          image: `data:image/jpeg;base64,${currentImg.b64}`,
          prompt: cleanQuery || undefined
        });
      } else {
        const operationalMessages = [
          { role: "system", content: buildSysPrompt(loc) },
          { role: "user", content: cleanQuery }
        ];
        resultData = await apiGatewayFetch("chat", { messages: operationalMessages });
      }

      addMsg({ role: "bot", text: resultData.reply });
    } catch (error) {
      console.error("Gateway Processing Defect:", error);
      addMsg({ 
        role: "bot", 
        text: `❌ **Network execution timeout.** Ensure API Gateway interface is live.\n\n*Error Context:* ${error.message}` 
      });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div style={{ fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', background: T.bg, height: "100vh", display: "flex", flexDirection: "column", color: T.botTxt }}>
      
      {/* HEADER BAR */}
      <header style={{ background: T.hdr, borderBottom: `1px solid ${T.border}`, padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: `0 2px 8px ${T.shadow}`, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ background: T.navy, color: "#fff", width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16 }}>Δ</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: T.navy, letterSpacing: "-0.3px" }}>DriveLegal Matrix</h1>
            <div style={{ fontSize: 11, color: T.sub, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: offline ? T.red : T.green, display: "inline-block" }}></span>
              {offline ? "Sandbox Offline Loop" : "Simulation Gateway Live (Port 5000)"}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {locPermission === "prompt" && (
            <button onClick={requestLocationAccess} style={{ background: T.accentBg, border: `1px solid ${T.accent}`, color: T.accent, fontSize: 11.5, fontWeight: 700, padding: "6px 12px", borderRadius: 8, cursor: "pointer" }}>
              Allow Location Localization Context?
            </button>
          )}
          {locPermission === "granted" && (
            <div style={{ background: T.greenBg, border: `1px solid ${T.green}`, color: T.green, fontSize: 11.5, padding: "6px 12px", borderRadius: 8, fontWeight: 500 }}>
              📍 {loc?.city || "GPS Anchored"}
            </div>
          )}
          
          <div style={{ background: T.bg, padding: "5px 11px", borderRadius: 20, fontSize: 12, fontWeight: 700, color: T.navy, border: `1px solid ${T.border}` }}>
            🏆 {pts} pts
          </div>

          <button onClick={() => setShowEmergency(true)} aria-label="Trigger Emergency Dispatch" style={{ background: T.red, color: "#fff", border: "none", fontWeight: 800, padding: "8px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer", boxShadow: "0 2px 6px rgba(220,38,38,0.2)" }}>
            SOS
          </button>
        </div>
      </header>

      {/* CORE DISPLAY FEED PANEL */}
      <main style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ maxWidth: 720, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
          
          {msgs.map((m) => (
            <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start", width: "100%" }}>
              <div style={{ maxWidth: "82%", background: m.role === "user" ? T.usrBub : T.botBub, color: m.role === "user" ? T.usrTxt : T.botTxt, padding: "12px 16px", borderRadius: m.role === "user" ? "16px 16px 2px 16px" : "16px 16px 16px 2px", boxShadow: m.role === "user" ? "none" : `0 2px 6px ${T.shadow}`, border: m.role === "user" ? "none" : `1px solid ${T.border}`, fontSize: 14.5, lineHeight: 1.5 }}>
                
                {m.imgPreview && (
                  <img src={m.imgPreview} alt="User Attachment Layer" style={{ maxWidth: "100%", maxHeight: 220, borderRadius: 12, marginBottom: 10, display: "block" }} />
                )}
                
                {/* REFACTORED WORKSPACE: Inline Markdown Parser Injection layer */}
                <div style={{ wordBreak: "break-word" }}>
                  {renderMarkdown(m.text)}
                </div>

                {m.suggestions && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
                    {m.suggestions.map((s, idx) => (
                      <button key={idx} onClick={() => handleSend(s)} style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.navy, fontSize: 12, padding: "6px 12px", borderRadius: 20, cursor: "pointer", fontWeight: 500, transition: "all 0.15s ease" }}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <span style={{ fontSize: 10, color: T.sub, marginTop: 4, padding: "0 4px" }}>{m.time}</span>
            </div>
          ))}

          {/* DYNAMIC COMPONENT INJECTIONS */}
          {activeWidget === "challan" && (
            <div style={{ width: "100%", display: "flex", justifyContent: "flex-start" }}>
              <ChallancCalc onDone={() => setActiveWidget(null)} />
            </div>
          )}
          {activeWidget === "quiz" && (
            <div style={{ width: "100%", display: "flex", justifyContent: "flex-start" }}>
              <QuizCard onDone={() => setActiveWidget(null)} onPoints={(p) => setPts(prev => prev + p)} />
            </div>
          )}
          {activeWidget?.type === "rules" && (
            <div style={{ width: "100%", display: "flex", justifyContent: "flex-start" }}>
              <RulebookCard countryName={activeWidget.country} onDone={() => setActiveWidget(null)} />
            </div>
          )}

          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: T.botBub, borderRadius: 12, border: `1px solid ${T.border}`, alignSelf: "flex-start", fontSize: 13, color: T.sub, boxShadow: `0 2px 6px ${T.shadow}` }}>
              <span style={{ display: "inline-block", borderRadius: "50%", background: T.accent, width: 8, height: 8 }}></span>
              DriveLegal Matrix compiling legal references...
            </div>
          )}
          
          <div ref={bottomRef} />
        </div>
      </main>

      {/* INPUT COMMAND HUD BASEMENT */}
      <footer style={{ background: T.hdr, borderTop: `1px solid ${T.border}`, padding: "14px 20px", zIndex: 10 }}>
        <div style={{ maxWidth: 720, width: "100%", margin: "0 auto", position: "relative" }}>
          
          {showCmds && (
            <div style={{ position: "absolute", bottom: "115%", left: 0, right: 0, background: "#fff", borderRadius: 14, border: `1px solid ${T.border}`, boxShadow: "0 -4px 20px rgba(0,0,0,0.08)", padding: 6, display: "flex", flexDirection: "column", gap: 2 }}>
              <button onClick={() => { setInput("/challan"); handleSend("/challan"); }} style={{ display: "flex", gap: 10, padding: "9px 12px", border: "none", background: "transparent", width: "100%", textAlign: "left", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>
                <strong>/challan</strong> <span style={{ color: T.sub }}>— Calculate multi-state Indian compounding fines</span>
              </button>
              <button onClick={() => { setInput("/quiz"); handleSend("/quiz"); }} style={{ display: "flex", gap: 10, padding: "9px 12px", border: "none", background: "transparent", width: "100%", textAlign: "left", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>
                <strong>/quiz</strong> <span style={{ color: T.sub }}>— Run interactive traffic safety compliance assessment</span>
              </button>
              <button onClick={() => { setInput("/rules India"); setShowCmds(false); inputRef.current?.focus(); }} style={{ display: "flex", gap: 10, padding: "9px 12px", border: "none", background: "transparent", width: "100%", textAlign: "left", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>
                <strong>/rules [country]</strong> <span style={{ color: T.sub }}>— Directly render an official baseline rulebook panel</span>
              </button>
              <button onClick={() => { setInput("/emergency"); handleSend("/emergency"); }} style={{ display: "flex", gap: 10, padding: "9px 12px", border: "none", background: "transparent", width: "100%", textAlign: "left", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>
                <strong>/emergency</strong> <span style={{ color: T.sub }}>— Open geo-located hotlines and emergency services</span>
              </button>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#FAFAF8", border: `1.5px solid ${T.border}`, borderRadius: 24, padding: "4px 6px 4px 14px", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.02)" }}>
            <button onClick={() => fileRef.current?.click()} aria-label="Upload Traffic Sign Photo Asset" style={{ background: pendingImg ? T.accentBg : "none", border: "none", color: pendingImg ? T.accent : T.sub, cursor: "pointer", fontSize: 18, padding: 4, display: "flex", alignItems: "center", borderRadius: "50%" }}>
              {pendingImg ? "🖼️" : "📷"}
            </button>
            
            <input ref={inputRef} type="text" value={input} onKeyDown={handleKeyDown} onChange={(e) => { setInput(e.target.value); setShowCmds(e.target.value === "/"); }} placeholder="Type /challan, /quiz, or legal questions safely..." style={{ flex: 1, border: "none", background: "transparent", padding: "8px 0", fontSize: 14, outline: "none", color: T.botTxt }} />
            
            <button onClick={toggleVoice} aria-label={listening ? "Stop voice listening loop" : "Trigger microphone speech detection input"} style={{ background: "none", border: "none", color: listening ? T.red : T.sub, cursor: "pointer", fontSize: 16, padding: 6, display: "flex", alignItems: "center" }}>
              {listening ? "🛑" : "🎤"}
            </button>

            <button onClick={() => handleSend()} disabled={loading} style={{ background: T.accent, color: "#fff", border: "none", padding: "8px 20px", borderRadius: 20, fontWeight: 700, fontSize: 13.5, cursor: "pointer", transition: "background 0.2s" }}>
              Send
            </button>
          </div>

          <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: "none" }} />
        </div>
      </footer>

      {showEmergency && <EmergencyModal loc={loc} onClose={() => setShowEmergency(false)} />}
    </div>
  );
}