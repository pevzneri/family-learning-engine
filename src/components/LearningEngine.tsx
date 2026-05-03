"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Child, GradeBand, GeneratedQuestion, ProgressRow } from "@/lib/types";
import { CURRICULUM, GRADE_BANDS, LEARNING_STYLES, AVATARS, MASTERY, getTopics, PLACEMENT_QUESTIONS, scorePlacement } from "@/lib/curriculum";

type View = "login"|"profiles"|"childPin"|"createChild"|"editChild"|"dashboard"|"subject"|"lesson"|"parent"|"parentDash"|"achievements"|"settings"|"placement";

/* ─── CELEBRATIONS ─── */
const CELEBRATIONS = [
  { name: "Confetti", emoji: "\u{1F389}", colors: ["#f59e0b","#10b981","#3b82f6","#ec4899","#8b5cf6","#ef4444"] },
  { name: "Stars", emoji: "\u{2B50}", colors: ["#fbbf24","#f59e0b","#fcd34d","#fde68a","#f97316","#eab308"] },
  { name: "Fireworks", emoji: "\u{1F386}", colors: ["#ef4444","#3b82f6","#8b5cf6","#ec4899","#06b6d4","#f59e0b"] },
  { name: "Hearts", emoji: "\u{1F496}", colors: ["#ec4899","#f472b6","#f9a8d4","#fb7185","#e11d48","#be185d"] },
  { name: "Sparkles", emoji: "\u{2728}", colors: ["#a78bfa","#818cf8","#c084fc","#e879f9","#7c3aed","#6366f1"] },
];

function Celebration({ type, onDone }: { type: number; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t); }, [onDone]);
  const cel = CELEBRATIONS[type % CELEBRATIONS.length];
  const ps = Array.from({ length: 35 }, (_, i) => ({ left: Math.random()*100, delay: Math.random()*0.4, size: 5+Math.random()*7, color: cel.colors[i%cel.colors.length], dur: 1.2+Math.random()*0.8 }));
  return (<div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:999}}>
    <style>{`@keyframes cF{0%{transform:translateY(-10px) rotate(0);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}`}</style>
    {ps.map((p,i)=>(<div key={i} style={{position:"absolute",top:-10,left:`${p.left}%`,width:p.size,height:p.size,borderRadius:p.size<8?"50%":2,background:p.color,animation:`cF ${p.dur}s ease-in ${p.delay}s forwards`}}/>))}
  </div>);
}

/* ─── WIKI IMAGE ─── */
function useWikiImage(q: string|undefined) {
  const [url, setUrl] = useState<string|null>(null);
  useEffect(() => { if (!q) { setUrl(null); return; }
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q.replace(/ /g,"_"))}`)
      .then(r=>r.json()).then(d=>{setUrl(d.thumbnail?.source?.replace(/\/\d+px-/,"/800px-")||d.originalimage?.source||null);}).catch(()=>setUrl(null));
  }, [q]); return url;
}

/* ─── SPEAK ─── */
function speak(text: string, voiceIdx?: number) {
  if (typeof window==="undefined"||!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text); u.rate=0.85; u.pitch=1.1;
  const voices = window.speechSynthesis.getVoices();
  const enVoices = voices.filter(v=>v.lang.startsWith("en"));
  if (voiceIdx !== undefined && enVoices[voiceIdx]) u.voice = enVoices[voiceIdx];
  else if (enVoices.length > 0) u.voice = enVoices[0];
  window.speechSynthesis.speak(u);
}

function calcPoints(lv: number, st: number, ok: boolean): number { return ok ? 10+(lv*5)+(Math.min(st,5)*3) : 0; }
function notesAutoBoost(notes: string): number { if(!notes)return 0; const n=notes.toLowerCase(); let b=0; if(/\brsm\b|russian school/i.test(n))b+=2; if(/\b2e\b|twice.?exceptional|gifted/i.test(n))b+=1; if(/\badvanced\b|above.?grade/i.test(n))b+=1; return Math.min(b,3); }
function scrambleWord(w: string): string { const a=w.split(""); for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} const s=a.join(""); return s===w?scrambleWord(w):s; }
const EMMA_WORDS: Record<string,string[]> = {math:["addition","multiply","fraction","decimal","geometry","algebra"],reading:["sentence","paragraph","synonym","metaphor","fiction","summary"],science:["energy","gravity","habitat","molecule","weather","circuit"],geography:["mountain","compass","continent","island","climate","resource"],history:["freedom","ancient","explore","invention","colony","liberty"],bible:["kindness","courage","wisdom","forgive","charity","faithful"]};
function PointsBurst({ pts }: { pts: number }) { return pts>0?<div className="animate-fade-up text-center mb-2"><span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-700 font-bold font-body text-sm">+{pts} Bab$ Bux!</span></div>:null; }

/* ─── ICONS ─── */
const Lock=()=>(<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>);
const CheckCircle=()=>(<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/></svg>);
const FlameIcon=()=>(<svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1"><path d="M12 2c1 4-2 6-2 10a4 4 0 008 0c0-4-3-6-2-10-2 2-6 4-6 8a2 2 0 004 0c0-2-2-3-2-8z"/></svg>);
const PlusIcon=()=>(<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>);
const PencilIcon=()=>(<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M17 3a2.85 2.85 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>);
const StarIcon=()=>(<svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>);
const SpeakerIcon=()=>(<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 010 7.07"/></svg>);

function SceneDisplay({ sceneHtml, wikiQuery }: { sceneHtml?: string; wikiQuery?: string }) {
  const wikiUrl = useWikiImage(wikiQuery);
  const hasScene = sceneHtml && sceneHtml.trim().length > 20;
  if (!hasScene && !wikiUrl) return null;
  return (<div className="mb-3 rounded-2xl overflow-hidden border border-gray-200 bg-white">
    {hasScene && <div dangerouslySetInnerHTML={{__html:sceneHtml!}} className="flex items-center justify-center min-h-[140px] p-3"/>}
    {!hasScene && wikiUrl && <img src={wikiUrl} alt="" className="w-full h-56 object-cover" onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>}
  </div>);
}

function TopicBar({ tp, color }: { tp: ProgressRow; color: string }) {
  const pct=tp.total>0?Math.round((tp.correct/tp.total)*100):0;
  const mp=Math.min(100,Math.round((tp.total/MASTERY.minQ)*50+(tp.level/MASTERY.minLevel)*50));
  return (<div className="mt-2 ml-6"><div className="flex justify-between text-[9px] font-body text-gray-400 mb-0.5"><span>{pct}% accuracy</span><span>{tp.total} answered</span></div>
    <div className="h-2 rounded-full bg-gray-100"><div className="h-full rounded-full transition-all duration-500" style={{background:color,width:`${mp}%`}}/></div></div>);
}

/* ─── GRADE LEVEL ASSESSMENT ─── */
function assessGradeLevel(progress: Record<string,Record<string,ProgressRow>>, gradeBand: string): {label:string;color:string;detail:string} {
  let totalTopics=0,mastered=0,avgLevel=0,count=0;
  for(const subj of Object.values(progress)){for(const tp of Object.values(subj)){totalTopics++;if(tp.mastered)mastered++;if(tp.total>0){avgLevel+=tp.level;count++;}}}
  const avg=count>0?avgLevel/count:0;const mastPct=totalTopics>0?(mastered/totalTopics)*100:0;
  if(avg>=6&&mastPct>=50)return{label:"Above Grade Level",color:"#10b981",detail:`Avg level ${avg.toFixed(1)}, ${mastered}/${totalTopics} mastered. Ready for harder material.`};
  if(avg>=3&&mastPct>=20)return{label:"On Grade Level",color:"#3b82f6",detail:`Avg level ${avg.toFixed(1)}, ${mastered}/${totalTopics} mastered. Progressing well.`};
  if(count>0)return{label:"Building Foundations",color:"#f59e0b",detail:`Avg level ${avg.toFixed(1)}, ${mastered}/${totalTopics} mastered. Focus on current topics.`};
  return{label:"Just Starting",color:"#9ca3af",detail:"Not enough data yet."};
}

/* ═══ MAIN ═══ */
export default function LearningEngine() {
  const [parent,setParent]=useState<{id:string;name:string;email:string}|null>(null);
  const [authMode,setAuthMode]=useState<"login"|"signup">("login");
  const [authEmail,setAuthEmail]=useState("");const [authPassword,setAuthPassword]=useState("");const [authName,setAuthName]=useState("");
  const [authError,setAuthError]=useState("");const [authLoading,setAuthLoading]=useState(false);
  const [children,setChildren]=useState<Child[]>([]);const [activeChild,setActiveChild]=useState<Child|null>(null);
  const [progress,setProgress]=useState<Record<string,Record<string,ProgressRow>>>({});const [view,setView]=useState<View>("login");
  const [pinInput,setPinInput]=useState("");const [pinError,setPinError]=useState("");const [selChild,setSelChild]=useState<Child|null>(null);
  const [activeSubject,setActiveSubject]=useState<string|null>(null);const [activeTopic,setActiveTopic]=useState<string|null>(null);
  const [question,setQuestion]=useState<any>(null);const [loading,setLoading]=useState(false);
  const [error,setError]=useState<string|null>(null);const [selectedAnswer,setSelectedAnswer]=useState<number|null>(null);
  const [showResult,setShowResult]=useState(false);const [sessionStats,setSessionStats]=useState({correct:0,total:0,points:0,hints:0});
  const [loadingMsg,setLoadingMsg]=useState("");const [lastPoints,setLastPoints]=useState(0);
  const [recentQs,setRecentQs]=useState<string[]>([]);
  const [showCel,setShowCel]=useState(false);const [celEnabled,setCelEnabled]=useState(true);const [celType,setCelType]=useState(0);
  const [testMode,setTestMode]=useState(false);const [testQ,setTestQ]=useState(0);const [testC,setTestC]=useState(0);
  const [testDone,setTestDone]=useState(false);const [testPass,setTestPass]=useState(false);
  const [voiceIdx,setVoiceIdx]=useState(0);const [parentPinMode,setParentPinMode]=useState(false);const [parentPinInput,setParentPinInput]=useState("");const [parentPinError,setParentPinError]=useState("");const [parentPinTarget,setParentPinTarget]=useState<View>("parentDash");const [parentPinSetup,setParentPinSetup]=useState(false);const [auditLogs,setAuditLogs]=useState<any[]>([]);const [voices,setVoices]=useState<string[]>([]);
  const [diffBoost,setDiffBoost]=useState<Record<string,Record<string,number>>>({});
  const [showBabsWelcome,setShowBabsWelcome]=useState(false);
  const [showSurrenderPopup,setShowSurrenderPopup]=useState(false);
  const [emmaChallenge,setEmmaChallenge]=useState<{word:string;scrambled:string;topic:string}|null>(null);
  const [emmaInput,setEmmaInput]=useState("");
  const [emmaResult,setEmmaResult]=useState<"pending"|"correct"|"wrong">("pending");
  const [hiddenSubjects,setHiddenSubjects]=useState<Record<string,string[]>>({});
  const [customFocus,setCustomFocus]=useState<Record<string,string>>({});
  const [assessedLevels,setAssessedLevels]=useState<Record<string,Record<string,number>>>({});
  const [placementSubj,setPlacementSubj]=useState<string|null>(null);
  const [placementStep,setPlacementStep]=useState(0);
  const [placementCorrects,setPlacementCorrects]=useState(0);
  const [placementAnswer,setPlacementAnswer]=useState<number|null>(null);
  const [placementShowResult,setPlacementShowResult]=useState(false);
  const [placementQueue,setPlacementQueue]=useState<string[]>([]);
  const [milestoneBonus,setMilestoneBonus]=useState(0);
  /* All children progress for parent dash */
  const [allChildProgress,setAllChildProgress]=useState<Record<string,Record<string,Record<string,ProgressRow>>>>({});
  const msgIdx=useRef(0);const loadMsgs=["Thinking up a good one...","Picking the right challenge...","Making this just right...","Almost ready..."];
  const [fN,sfN]=useState("");const [fP,sfP]=useState("");const [fG,sfG]=useState<GradeBand>("2-3");
  const [fS,sfS]=useState("visual");const [fA,sfA]=useState("\u{1F98A}");const [fNt,sfNt]=useState("");const [fI,sfI]=useState("");const [eId,sEId]=useState<string|null>(null);

  useEffect(()=>{if(typeof window!=="undefined"){const loadV=()=>{const v=window.speechSynthesis.getVoices().filter(v=>v.lang.startsWith("en"));setVoices(v.map(v=>v.name));};loadV();window.speechSynthesis.onvoiceschanged=loadV;}},[]);
  useEffect(()=>{try{const s=localStorage.getItem("kk_diffBoost");if(s)setDiffBoost(JSON.parse(s));}catch{}},[]);
  useEffect(()=>{try{localStorage.setItem("kk_diffBoost",JSON.stringify(diffBoost));}catch{}},[diffBoost]);
  useEffect(()=>{try{const s=localStorage.getItem("kk_hiddenSubjects");if(s)setHiddenSubjects(JSON.parse(s));}catch{}},[]);
  useEffect(()=>{try{localStorage.setItem("kk_hiddenSubjects",JSON.stringify(hiddenSubjects));}catch{}},[hiddenSubjects]);
  useEffect(()=>{try{const s=localStorage.getItem("kk_customFocus");if(s)setCustomFocus(JSON.parse(s));}catch{}},[]);
  useEffect(()=>{try{localStorage.setItem("kk_customFocus",JSON.stringify(customFocus));}catch{}},[customFocus]);
  useEffect(()=>{try{const s=localStorage.getItem("kk_assessedLevels");if(s)setAssessedLevels(JSON.parse(s));}catch{}},[]);
  useEffect(()=>{try{localStorage.setItem("kk_assessedLevels",JSON.stringify(assessedLevels));}catch{}},[assessedLevels]);
  const getAssessedLevel=(childId:string,subj:string)=>assessedLevels[childId]?.[subj]||0;
  const childHasAssessment=(childId:string)=>!!assessedLevels[childId]&&Object.keys(assessedLevels[childId]).length>0;
  const getChildHidden=(childId:string):string[]=>hiddenSubjects[childId]||[];
  const toggleChildSubject=(childId:string,subj:string)=>{setHiddenSubjects(p=>{const cur=p[childId]||[];return{...p,[childId]:cur.includes(subj)?cur.filter(s=>s!==subj):[...cur,subj]};});};
  const getChildBoost=(childId:string,subj:string)=>(diffBoost[childId]?.[subj]||0);
  const setChildBoost=(childId:string,subj:string,val:number)=>{setDiffBoost(p=>({...p,[childId]:{...(p[childId]||{}),[subj]:val}}));};
  useEffect(()=>{fetch("/api/children").then(async r=>{if(r.ok){const d=await r.json();const kids=d.children||[];setChildren(kids);setParent({id:"s",name:"",email:""});
    try{const savedId=localStorage.getItem("kk_activeChild");if(savedId){const saved=kids.find((c:Child)=>c.id===savedId);if(saved){setActiveChild(saved);loadProg(saved.id);setView("dashboard");return;}}}catch{}
    setView("profiles");}}).catch(()=>{});},[]);

  const handleAuth=async(e:React.FormEvent)=>{e.preventDefault();setAuthLoading(true);setAuthError("");
    const ep=authMode==="signup"?"/api/auth/signup":"/api/auth/login";
    const b=authMode==="signup"?{email:authEmail,password:authPassword,name:authName}:{email:authEmail,password:authPassword};
    try{const r=await fetch(ep,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b)});const d=await r.json();if(!r.ok)throw new Error(d.error);setParent(d.parent);logAudit("parent_login",d.parent.email);const cr=await fetch("/api/children");const cd=await cr.json();setChildren(cd.children||[]);if(authMode==="signup"){setShowBabsWelcome(true);}else{setView("profiles");}}catch(e:any){setAuthError(e.message);}setAuthLoading(false);};
  const handleLogout=()=>{document.cookie="fle_session=; max-age=0; path=/";try{localStorage.removeItem("kk_activeChild");}catch{}setParent(null);setActiveChild(null);setView("login");setChildren([]);setProgress({});setAllChildProgress({});};
  const handlePin=(child:Child,val?:string)=>{if((val||pinInput)===child.pin){setActiveChild(child);setPinInput("");setPinError("");loadProg(child.id);logAudit("child_login",child.name,child.id);try{localStorage.setItem("kk_activeChild",child.id);}catch{}setView("dashboard");}else{setPinError("Wrong PIN");setPinInput("");}};
  const loadProg=async(id:string)=>{const r=await fetch(`/api/progress?child_id=${id}`);const d=await r.json();const bs:Record<string,Record<string,ProgressRow>>={};(d.progress||[]).forEach((p:ProgressRow)=>{if(!bs[p.subject])bs[p.subject]={};bs[p.subject][p.topic_id]=p;});setProgress(bs);};
  const loadAllProgress=async()=>{const all:Record<string,Record<string,Record<string,ProgressRow>>>={};for(const c of children){const r=await fetch(`/api/progress?child_id=${c.id}`);const d=await r.json();const bs:Record<string,Record<string,ProgressRow>>={};(d.progress||[]).forEach((p:ProgressRow)=>{if(!bs[p.subject])bs[p.subject]={};bs[p.subject][p.topic_id]=p;});all[c.id]=bs;}setAllChildProgress(all);};
  const logAudit=async(action:string,detail?:string,childId?:string)=>{try{await fetch("/api/audit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,detail:detail||"",child_id:childId||null})});}catch{}};
  const loadAuditLogs=async()=>{const r=await fetch("/api/audit");const d=await r.json();setAuditLogs(d.logs||[]);};
  const checkParentPin=async(target:View)=>{const r=await fetch("/api/auth/verify-parent-pin",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({pin:""})});const d=await r.json();if(d.needsSetup){setParentPinSetup(true);setParentPinTarget(target);setParentPinMode(true);}else{setParentPinTarget(target);setParentPinMode(true);setParentPinInput("");setParentPinError("");}};
  const submitParentPin=async()=>{if(parentPinSetup){const r=await fetch("/api/auth/verify-parent-pin",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({pin:parentPinInput})});if(r.ok){setParentPinSetup(false);setParentPinMode(false);logAudit("parent_pin_set");if(parentPinTarget==="parentDash"){loadAllProgress();loadAuditLogs();}setView(parentPinTarget);}return;}const r=await fetch("/api/auth/verify-parent-pin",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({pin:parentPinInput})});if(r.ok){setParentPinMode(false);logAudit("parent_access",parentPinTarget);if(parentPinTarget==="parentDash"){loadAllProgress();loadAuditLogs();}setView(parentPinTarget);}else{setParentPinError("Wrong PIN");setParentPinInput("");}};
  const resetForm=()=>{sfN("");sfP("");sfG("2-3");sfS("visual");sfA("\u{1F98A}");sfNt("");sfI("");sEId(null);};
  const createChild=async()=>{if(!fN.trim()||fP.length!==4)return;const r=await fetch("/api/children",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:fN.trim(),pin:fP,avatar:fA,grade_band:fG,learning_style:fS,notes:fNt.trim(),interests:fI.trim()})});const d=await r.json();if(r.ok){setChildren([...children,d.child]);logAudit("child_created",d.child.name,d.child.id);setView("profiles");resetForm();}};
  const updateChild=async()=>{if(!fN.trim()||fP.length!==4||!eId)return;const r=await fetch("/api/children",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:eId,name:fN.trim(),pin:fP,avatar:fA,grade_band:fG,learning_style:fS,notes:fNt.trim(),interests:fI.trim()})});const d=await r.json();if(r.ok){setChildren(children.map(c=>c.id===eId?d.child:c));if(activeChild?.id===eId)setActiveChild(d.child);setView("profiles");resetForm();}};
  const deleteChild=async(id:string)=>{if(!confirm("Delete?"))return;await fetch(`/api/children?id=${id}`,{method:"DELETE"});setChildren(children.filter(c=>c.id!==id));if(activeChild?.id===id){setActiveChild(null);setView("profiles");}};
  const startEdit=(c:Child)=>{sfN(c.name);sfP(c.pin);sfG(c.grade_band as GradeBand);sfS(c.learning_style);sfA(c.avatar);sfNt(c.notes||"");sfI(c.interests||"");sEId(c.id);setView("editChild");};

  /* ─── PLACEMENT TEST ─── */
  const startPlacement=(subjects?:string[])=>{
    const subjs=subjects||Object.keys(CURRICULUM).filter(k=>!activeChild||!getChildHidden(activeChild.id).includes(k));
    if(subjs.length===0)return;
    setPlacementQueue(subjs.slice(1));setPlacementSubj(subjs[0]);setPlacementStep(0);setPlacementCorrects(0);setPlacementAnswer(null);setPlacementShowResult(false);setView("placement");
  };
  const placementSelectAnswer=(idx:number)=>{
    if(placementShowResult||!placementSubj)return;
    const qs=PLACEMENT_QUESTIONS[placementSubj];if(!qs||!qs[placementStep])return;
    setPlacementAnswer(idx);setPlacementShowResult(true);
    if(idx===qs[placementStep].correct)setPlacementCorrects(c=>c+1);
  };
  const placementNext=()=>{
    if(!placementSubj||!activeChild)return;
    const qs=PLACEMENT_QUESTIONS[placementSubj];
    if(placementStep+1<(qs?.length||0)){
      setPlacementStep(s=>s+1);setPlacementAnswer(null);setPlacementShowResult(false);
    } else {
      const level=scorePlacement(placementCorrects);
      setAssessedLevels(p=>({...p,[activeChild.id]:{...(p[activeChild.id]||{}),[placementSubj]:level}}));
      /* Apply assessed level to all topics in this subject */
      const topics=getTopics(placementSubj,activeChild.grade_band as GradeBand);
      const updatedProgress={...progress};
      if(!updatedProgress[placementSubj])updatedProgress[placementSubj]={};
      for(const topic of topics){
        const tp=updatedProgress[placementSubj][topic.id];
        if(tp){
          const newLevel=Math.max(tp.level,level);
          updatedProgress[placementSubj][topic.id]={...tp,level:newLevel,unlocked:true};
          fetch("/api/progress",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({child_id:activeChild.id,subject:placementSubj,topic_id:topic.id,updates:{level:newLevel,unlocked:true}})}).catch(()=>{});
        }
      }
      setProgress(updatedProgress);
      if(placementQueue.length>0){
        const next=placementQueue[0];setPlacementQueue(q=>q.slice(1));setPlacementSubj(next);setPlacementStep(0);setPlacementCorrects(0);setPlacementAnswer(null);setPlacementShowResult(false);
      } else { setView("dashboard"); }
    }
  };

  const genQ=useCallback(async(subj:string,tid:string,test?:boolean)=>{
    if(!activeChild)return;setLoading(true);setError(null);setSelectedAnswer(null);setShowResult(false);setLastPoints(0);
    msgIdx.current=0;setLoadingMsg(loadMsgs[0]);
    const iv=setInterval(()=>{msgIdx.current=Math.min(msgIdx.current+1,3);setLoadingMsg(loadMsgs[msgIdx.current]);},2500);
    const topics=getTopics(subj,activeChild.grade_band as GradeBand);const topic=topics.find(t=>t.id===tid);const tp=progress[subj]?.[tid];
    if(!topic||!tp){clearInterval(iv);setLoading(false);return;}
    try{const r=await fetch("/api/generate-question",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({profileName:activeChild.name,gradeBand:activeChild.grade_band,learningStyle:activeChild.learning_style,notes:activeChild.notes,interests:activeChild.interests,subject:subj,topicName:topic.name,topicDesc:topic.desc,level:tp.level,streak:tp.streak,totalAnswered:tp.total,recentQuestions:recentQs.slice(-5),difficultyBoost:getChildBoost(activeChild.id,subj)+notesAutoBoost(activeChild.notes||""),customFocus:customFocus[activeChild.id]||"",assessedLevel:getAssessedLevel(activeChild.id,subj)})});
    if(!r.ok)throw new Error(`Server ${r.status}`);const d=await r.json();if(d.error)throw new Error(d.error);
    setQuestion(d);setRecentQs(p=>[...p.slice(-9),d.question]);}catch(e:any){setError(e.message);}finally{clearInterval(iv);setLoading(false);}
  },[activeChild,progress,recentQs,diffBoost]);

  const handleAns=useCallback(async(idx:number)=>{
    if(showResult||!question||!activeChild||!activeSubject||!activeTopic)return;
    setSelectedAnswer(idx);setShowResult(true);const ok=idx===question.correct;
    const tp=progress[activeSubject]?.[activeTopic];if(!tp)return;
    const pts=calcPoints(tp.level,Math.max(0,tp.streak)+(ok?1:0),ok);setLastPoints(pts);
    if(ok&&celEnabled){setCelType(t=>t+1);setShowCel(true);}
    if(testMode){const nt=testQ+1;const nc=testC+(ok?1:0);setTestQ(nt);setTestC(nc);if(nt>=10){setTestDone(true);setTestPass(nc>=8);if(nc>=9&&activeSubject){const words=EMMA_WORDS[activeSubject]||EMMA_WORDS.math;const w=words[Math.floor(Math.random()*words.length)];setEmmaChallenge({word:w,scrambled:scrambleWord(w.toUpperCase()),topic:activeTopic});setEmmaInput("");setEmmaResult("pending");}}}
    const n={...tp};n.total+=1;
    if(ok){n.correct+=1;n.streak=Math.max(0,n.streak)+1;n.best_streak=Math.max(n.best_streak,n.streak);}else{n.streak=Math.min(0,n.streak)-1;}
    if(n.streak>=MASTERY.advance){n.level=n.level+1;n.streak=0;}else if(n.streak<=-MASTERY.struggle){n.level=Math.max(1,n.level-1);n.streak=0;}
    /* Milestone bonus every 10 questions */
    const newTotal=sessionStats.total+1;
    let bonusPts=0;
    if(newTotal>0&&newTotal%10===0){bonusPts=50+(Math.floor(newTotal/10)*25);setMilestoneBonus(bonusPts);if(celEnabled){setCelType(t=>t+1);setShowCel(true);}}
    const pct=n.total>0?(n.correct/n.total)*100:0;const topics=getTopics(activeSubject,activeChild.grade_band as GradeBand);const ci=topics.findIndex(t=>t.id===activeTopic);
    let unlock:string|undefined;
    if(testMode&&testQ+1>=10&&testC+(ok?1:0)>=8){n.mastered=true;if(ci<topics.length-1)unlock=topics[ci+1].id;}
    else if(!testMode&&pct>=MASTERY.masteredPct&&n.total>=MASTERY.minQ&&n.level>=MASTERY.minLevel){n.mastered=true;if(ci<topics.length-1)unlock=topics[ci+1].id;}
    if(n.level>=3&&n.total>=5&&ci<topics.length-1){unlock=unlock||topics[ci+1].id;}
    setProgress(p=>({...p,[activeSubject]:{...p[activeSubject],[activeTopic]:n}}));
    setSessionStats(p=>({correct:p.correct+(ok?1:0),total:p.total+1,points:p.points+pts+bonusPts,hints:p.hints}));
    await fetch("/api/progress",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({child_id:activeChild.id,subject:activeSubject,topic_id:activeTopic,updates:{level:n.level,correct:n.correct,total:n.total,streak:n.streak,best_streak:n.best_streak,mastered:n.mastered,unlock_next_topic_id:unlock}})});
    if(unlock&&progress[activeSubject]?.[unlock])setProgress(p=>({...p,[activeSubject]:{...p[activeSubject],[unlock!]:{...p[activeSubject][unlock!],unlocked:true}}}));
  },[progress,activeChild,activeSubject,activeTopic,question,showResult,celEnabled,testMode,testQ,testC]);

  const goSubj=(s:string)=>{setActiveSubject(s);setView("subject");};
  const goLesson=(t:string)=>{if(!activeSubject)return;setActiveTopic(t);setSessionStats({correct:0,total:0,points:0,hints:0});setRecentQs([]);setTestMode(false);setTestDone(false);setMilestoneBonus(0);setView("lesson");genQ(activeSubject,t);};
  const goTest=(t:string)=>{if(!activeSubject)return;setActiveTopic(t);setSessionStats({correct:0,total:0,points:0,hints:0});setRecentQs([]);setTestMode(true);setTestQ(0);setTestC(0);setTestDone(false);setTestPass(false);setView("lesson");genQ(activeSubject,t,true);};
  const goBack=()=>{window.speechSynthesis?.cancel();if(view==="lesson"){setView("subject");setQuestion(null);setTestMode(false);setTestDone(false);}else if(view==="subject"||view==="parent")setView("dashboard");else if(view==="editChild"||view==="createChild"){setView("profiles");resetForm();}else if(view==="childPin"){setView("profiles");setPinInput("");setPinError("");}else if(view==="parentDash"||view==="achievements"||view==="settings"||view==="placement")setView("dashboard");};
  const tryLeaveLesson=()=>{if(view==="lesson"&&sessionStats.total>0&&!testDone){setShowSurrenderPopup(true);}else{goBack();}};
  const goProfiles=()=>{try{localStorage.removeItem("kk_activeChild");}catch{}setView("profiles");setActiveChild(null);setActiveSubject(null);};
  const getStats=(s:string,prog?:Record<string,Record<string,ProgressRow>>)=>{const p=prog||progress;if(!activeChild&&!prog)return{pct:0,done:0,total:0};const gb=activeChild?.grade_band||"2-3";const t=getTopics(s,gb as GradeBand);const d=t.filter(x=>p[s]?.[x.id]?.mastered).length;return{pct:t.length>0?Math.round((d/t.length)*100):0,done:d,total:t.length};};
  const getTotalPts=(prog?:Record<string,Record<string,ProgressRow>>)=>{const p=prog||progress;let t=0;for(const s of Object.values(p))for(const tp of Object.values(s))t+=(tp.correct||0)*15;return t;};

  /* Achievements for student view */
  const getAchievements=()=>{
    const a:{icon:string;title:string;desc:string;earned:boolean}[]=[];
    let totalMastered=0,totalAnswered=0,bestStreak=0;
    for(const s of Object.values(progress))for(const tp of Object.values(s)){if(tp.mastered)totalMastered++;totalAnswered+=tp.total;bestStreak=Math.max(bestStreak,tp.best_streak);}
    a.push({icon:"\u{1F31F}",title:"First Question",desc:"Answer your first question",earned:totalAnswered>=1});
    a.push({icon:"\u{1F525}",title:"On Fire",desc:"Get a streak of 5",earned:bestStreak>=5});
    a.push({icon:"\u{1F3C6}",title:"Topic Master",desc:"Master your first topic",earned:totalMastered>=1});
    a.push({icon:"\u{1F4DA}",title:"Bookworm",desc:"Answer 50 questions",earned:totalAnswered>=50});
    a.push({icon:"\u{1F680}",title:"Super Scholar",desc:"Master 5 topics",earned:totalMastered>=5});
    a.push({icon:"\u{2B50}",title:"Rising Star",desc:"Answer 100 questions",earned:totalAnswered>=100});
    a.push({icon:"\u{1F451}",title:"Champion",desc:"Master 10 topics",earned:totalMastered>=10});
    a.push({icon:"\u{1F30D}",title:"World Explorer",desc:"Master 20 topics",earned:totalMastered>=20});
    return a;
  };

  return (
    <div className="font-display max-w-xl mx-auto px-4 py-5 min-h-screen">
      {showCel && <Celebration type={celType} onDone={()=>setShowCel(false)}/>}

      {/* TOP BAR */}
      <div className="flex justify-between items-center mb-4">
        <div>{!["login","profiles"].includes(view)&&(<button onClick={view==="dashboard"?goProfiles:view==="lesson"?tryLeaveLesson:goBack} className="text-sm font-semibold font-body text-gray-400 hover:text-gray-600">&larr; {view==="dashboard"?"Profiles":"Back"}</button>)}</div>
        <div className="flex gap-2 items-center">
          {parent&&view!=="login"&&(<button onClick={handleLogout} className="px-2 py-1 rounded-lg text-[10px] font-bold font-body uppercase bg-gray-100 text-gray-400 hover:bg-gray-200">Logout</button>)}
          {activeChild&&!["login","profiles","childPin","createChild","editChild"].includes(view)&&(<>
            <button onClick={()=>{setCelEnabled(!celEnabled);}} className={`px-2 py-1 rounded-lg text-[10px] font-bold font-body ${celEnabled?"bg-amber-100 text-amber-600":"bg-gray-100 text-gray-400"}`}>{CELEBRATIONS[celType%CELEBRATIONS.length].emoji}</button>
            {view!=="parentDash"&&<button onClick={()=>setView(view==="parent"?"dashboard":"parent")} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold font-body uppercase tracking-wide ${view==="parent"?"bg-gray-900 text-white":"bg-gray-100 text-gray-500"}`}>{view==="parent"?"Student":"Progress"}</button>}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-lg"><span className="text-base">{activeChild.avatar}</span><span className="text-xs font-semibold font-body text-gray-500">{activeChild.name}</span></div>
          </>)}
        </div>
      </div>

      {/* LOGIN */}
      {view==="login"&&(<div className="animate-fade-up max-w-sm mx-auto mt-12">
        <div className="text-center mb-6"><img src="/babs-logo.jpeg" alt="Babs" className="w-20 h-20 rounded-full object-cover mx-auto mb-2 border-4 border-pink-200 shadow-lg" /><h1 className="text-2xl font-bold">Katz Kourse</h1><p className="text-xs font-body text-gray-400 mt-1">{authMode==="login"?"Sign in":"Create an account"}</p></div>
        <form onSubmit={handleAuth}>
          {authMode==="signup"&&<input value={authName} onChange={e=>setAuthName(e.target.value)} placeholder="Your name" className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 text-base font-body focus:border-amber-400 focus:outline-none mb-3"/>}
          <input type="email" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} placeholder="Email" className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 text-base font-body focus:border-amber-400 focus:outline-none mb-3"/>
          <input type="password" value={authPassword} onChange={e=>setAuthPassword(e.target.value)} placeholder="Password" className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 text-base font-body focus:border-amber-400 focus:outline-none mb-3"/>
          {authError&&<p className="text-red-500 text-sm font-body mb-3">{authError}</p>}
          <button type="submit" disabled={authLoading} className="w-full py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold font-body">{authLoading?"...":authMode==="login"?"Sign In":"Create Account"}</button>
        </form>
        <button onClick={()=>{setAuthMode(authMode==="login"?"signup":"login");setAuthError("");}} className="block w-full mt-3 text-sm text-gray-400 font-body text-center">{authMode==="login"?"Need an account? Sign up":"Have an account? Sign in"}</button>
      </div>)}

      {/* PROFILES */}
      {view==="profiles"&&(<div className="animate-fade-up">
        <div className="text-center mb-6"><p className="text-xs font-body tracking-[0.2em] uppercase text-gray-400 mb-1">Katz Kourse</p><h1 className="text-2xl font-bold">Who&apos;s learning today?</h1></div>
        {/* Parent Dashboard Button */}
        {children.length>0&&(<button onClick={()=>checkParentPin("parentDash")} className="w-full mb-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-sm font-semibold font-body text-gray-600 hover:border-amber-300 hover:bg-amber-50 flex items-center justify-center gap-2">{"\u{1F4CA}"} Parent Dashboard — All Children</button>)}
        <div className={`grid gap-3 ${children.length>0?"grid-cols-2":"grid-cols-1"}`}>
          {children.map(c=>(<button key={c.id} onClick={()=>{setSelChild(c);setPinInput("");setPinError("");setView("childPin");}} className="relative p-6 rounded-2xl border-2 border-gray-200 bg-white text-center hover:border-amber-300 hover:shadow-md active:scale-[0.98]">
            <div className="text-4xl mb-2">{c.avatar}</div><div className="text-base font-bold">{c.name}</div><div className="text-xs font-body text-gray-400 mt-0.5">{GRADE_BANDS.find(g=>g.id===c.grade_band)?.label}</div>
            <button onClick={e=>{e.stopPropagation();setParentPinTarget("editChild" as View);sfN(c.name);sfP(c.pin);sfG(c.grade_band as GradeBand);sfS(c.learning_style);sfA(c.avatar);sfNt(c.notes||"");sfI(c.interests||"");sEId(c.id);checkParentPin("editChild");}} className="absolute top-2 right-2 w-6 h-6 rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center hover:bg-gray-100"><PencilIcon/></button>
          </button>))}
          <button onClick={()=>{resetForm();setView("createChild");}} className="p-6 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 text-center hover:border-amber-400 flex flex-col items-center justify-center gap-2 min-h-[140px]"><PlusIcon/><span className="text-sm font-semibold font-body text-gray-500">Add Learner</span></button>
        </div>
      </div>)}

      {/* PARENT DASHBOARD — ALL CHILDREN */}
      {view==="parentDash"&&(<div className="animate-fade-up">
        <h2 className="text-xl font-bold text-center mb-5">{"\u{1F4CA}"} Katz Kourse — Family Progress</h2>
        {children.map(child=>{const cp=allChildProgress[child.id]||{};const assess=assessGradeLevel(cp,child.grade_band);
          return(<div key={child.id} className="mb-6 p-4 rounded-2xl border-2 border-gray-200 bg-white">
            <div className="flex items-center gap-3 mb-3"><span className="text-3xl">{child.avatar}</span><div><div className="font-bold text-lg">{child.name}</div><div className="text-xs font-body text-gray-400">{GRADE_BANDS.find(g=>g.id===child.grade_band)?.label}</div></div>
              <div className="ml-auto text-right"><div className="text-xs font-bold font-body px-2 py-1 rounded-full" style={{background:assess.color+"20",color:assess.color}}>{assess.label}</div><div className="text-xs font-body text-gray-400 mt-0.5"><StarIcon/> {getTotalPts(cp).toLocaleString()} Bab$</div></div>
            </div>
            <p className="text-xs font-body text-gray-500 mb-3">{assess.detail}</p>
            {/* Subject bars */}
            {Object.entries(CURRICULUM).map(([k,s])=>{const topics=getTopics(k,child.grade_band as GradeBand);const mastered=topics.filter(t=>cp[k]?.[t.id]?.mastered).length;const pct=topics.length>0?Math.round((mastered/topics.length)*100):0;
              const avgLv=topics.reduce((a,t)=>{const tp=cp[k]?.[t.id];return a+(tp&&tp.total>0?tp.level:0);},0)/(topics.filter(t=>cp[k]?.[t.id]?.total).length||1);
              return(<div key={k} className="mb-2">
                <div className="flex justify-between items-center text-xs font-body mb-0.5"><span style={{color:s.color}} className="font-bold">{s.icon} {s.label}</span><span className="text-gray-400">{mastered}/{topics.length} mastered</span></div>
                <div className="h-2.5 rounded-full bg-gray-100"><div className="h-full rounded-full" style={{background:s.color,width:`${pct}%`}}/></div>
                {avgLv>4&&<div className="text-[10px] font-body text-green-600 mt-0.5">{"\u{2B06}\u{FE0F}"} Ready for higher difficulty (avg Lv{avgLv.toFixed(1)})</div>}
              </div>);})}
            {/* Difficulty dials */}
            <div className="mt-3 pt-3 border-t border-gray-100"><div className="text-xs font-bold font-body text-gray-500 mb-2">Difficulty Boost</div>
              <div className="flex flex-wrap gap-2">{Object.entries(CURRICULUM).map(([k,s])=>(<div key={k} className="flex items-center gap-1">
                <span className="text-xs font-body" style={{color:s.color}}>{s.icon}</span>
                {[0,1,2,3].map(n=>(<button key={n} onClick={()=>setChildBoost(child.id,k,n)} className={`w-5 h-5 rounded-full text-[9px] font-bold font-body ${getChildBoost(child.id,k)===n?"bg-gray-900 text-white":"bg-gray-100 text-gray-400"}`}>{n}</button>))}
              </div>))}</div>
            </div>
            {/* Subject visibility */}
            <div className="mt-3 pt-3 border-t border-gray-100"><div className="text-xs font-bold font-body text-gray-500 mb-2">Visible Subjects</div>
              <div className="flex flex-wrap gap-2">{Object.entries(CURRICULUM).map(([k,s])=>{const hidden=getChildHidden(child.id).includes(k);return(<button key={k} onClick={()=>toggleChildSubject(child.id,k)} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-body font-semibold border ${hidden?"border-gray-200 bg-gray-50 text-gray-300 line-through":"border-green-200 bg-green-50 text-green-700"}`}><span>{s.icon}</span>{s.label}</button>);})}</div>
            </div>
            {/* Custom focus */}
            <div className="mt-3 pt-3 border-t border-gray-100"><div className="text-xs font-bold font-body text-gray-500 mb-1">Custom Focus</div>
              <p className="text-[10px] font-body text-gray-300 mb-1.5">Add topics or instructions for Claude (e.g. &ldquo;Focus on RSM-level multiplication&rdquo;)</p>
              <textarea value={customFocus[child.id]||""} onChange={e=>setCustomFocus(p=>({...p,[child.id]:e.target.value}))} rows={2} placeholder="e.g. Practice 3-digit addition with regrouping, focus on word problems with money..." className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-body resize-y focus:border-amber-400 focus:outline-none"/>
            </div>
          </div>);})}
        {/* Audit Log */}
        <div className="mt-4 p-4 rounded-2xl border-2 border-gray-200 bg-white">
          <div className="flex justify-between items-center mb-2"><div className="text-sm font-bold font-body text-gray-600">{"\u{1F4CB}"} Activity Log</div><button onClick={loadAuditLogs} className="text-[10px] font-body text-gray-400 hover:text-gray-600">Refresh</button></div>
          <div className="max-h-60 overflow-y-auto">{auditLogs.length===0?<p className="text-xs font-body text-gray-300">No activity yet</p>:auditLogs.slice(0,20).map((log:any,i:number)=>(<div key={i} className="py-1.5 border-b border-gray-50 last:border-0">
            <div className="flex justify-between items-center"><span className="text-xs font-body font-semibold text-gray-600">{log.action.replace(/_/g," ")}</span><span className="text-[9px] font-body text-gray-300">{new Date(log.created_at).toLocaleString()}</span></div>
            {log.detail&&<div className="text-[10px] font-body text-gray-400">{log.detail}</div>}
            <div className="text-[9px] font-body text-gray-200">{log.ip_address} &middot; {(log.device_info||"").substring(0,40)}</div>
          </div>))}</div>
        </div>
        {/* Voice selection */}
        <div className="mt-4 p-4 rounded-2xl border-2 border-gray-200 bg-white">
          <div className="text-sm font-bold font-body text-gray-600 mb-2">{"\u{1F50A}"} Voice for Audio</div>
          <div className="flex flex-wrap gap-2">{voices.slice(0,8).map((v,i)=>(<button key={i} onClick={()=>{ setVoiceIdx(i); speak("Hello! I'm your tutor.",i); }} className={`px-3 py-1.5 rounded-lg text-xs font-body ${voiceIdx===i?"bg-violet-100 border-violet-400 border-2 text-violet-700 font-bold":"bg-gray-50 border border-gray-200 text-gray-500"}`}>{v.split(" ")[0]}</button>))}</div>
        </div>
      </div>)}

      {/* PIN */}
      {view==="childPin"&&selChild&&(<div className="animate-fade-up max-w-xs mx-auto mt-12 text-center">
        <div className="text-5xl mb-3">{selChild.avatar}</div><h2 className="text-xl font-bold mb-1">Hi {selChild.name}!</h2><p className="text-sm font-body text-gray-400 mb-6">Enter your 4-digit PIN</p>
        <input type="tel" inputMode="numeric" maxLength={4} autoFocus value={pinInput} onChange={e=>{const v=e.target.value.replace(/\D/g,"").slice(0,4);setPinInput(v);setPinError("");if(v.length===4)setTimeout(()=>handlePin(selChild!,v),100);}} className="sr-only" id="pin-input"/>
        <label htmlFor="pin-input" className="cursor-pointer"><div className="flex justify-center gap-3 mb-4">{[0,1,2,3].map(i=>(<div key={i} className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold ${pinInput.length>i?"border-amber-400 bg-amber-50":"border-gray-200"}`}>{pinInput.length>i?"\u25CF":""}</div>))}</div></label>
        {pinError&&<p className="text-red-500 text-sm font-body mb-3">{pinError}</p>}
        <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">{[1,2,3,4,5,6,7,8,9,null,0,"\u232B"].map((n,i)=>(
          <button key={i} onClick={()=>{if(n===null)return;if(n==="\u232B"){setPinInput(pinInput.slice(0,-1));setPinError("");return;}const v=pinInput+n;setPinInput(v);setPinError("");if(v.length===4)setTimeout(()=>handlePin(selChild!,v),100);}} disabled={n===null} className={`h-12 rounded-xl text-lg font-bold font-body ${n===null?"invisible":"bg-white border-2 border-gray-200 hover:border-gray-300 active:bg-gray-50"}`}>{n!==null?n:""}</button>))}</div>
      </div>)}

      {/* CREATE/EDIT */}
      {(view==="createChild"||view==="editChild")&&(<div className="animate-fade-up">
        <h2 className="text-xl font-bold text-center mb-5">{view==="editChild"?"Edit Profile":"New Learner"}</h2>
        <div className="mb-5"><label className="text-xs font-bold font-body text-gray-500 block mb-2">Avatar</label><div className="flex flex-wrap gap-2">{AVATARS.map(a=>(<button key={a} onClick={()=>sfA(a)} className={`w-10 h-10 rounded-xl border-2 text-xl flex items-center justify-center ${fA===a?"border-amber-500 bg-amber-50 scale-110":"border-gray-200 bg-white"}`}>{a}</button>))}</div></div>
        <div className="mb-4"><label className="text-xs font-bold font-body text-gray-500 block mb-1">Name</label><input value={fN} onChange={e=>sfN(e.target.value)} placeholder="e.g. Cat" className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 text-base font-body focus:border-amber-400 focus:outline-none"/></div>
        <div className="mb-4"><label className="text-xs font-bold font-body text-gray-500 block mb-1">4-Digit PIN</label><input value={fP} onChange={e=>sfP(e.target.value.replace(/\D/g,"").slice(0,4))} placeholder="1234" inputMode="numeric" maxLength={4} className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 text-base font-body focus:border-amber-400 focus:outline-none tracking-[0.5em] text-center"/></div>
        <div className="mb-4"><label className="text-xs font-bold font-body text-gray-500 block mb-2">Grade</label><div className="flex flex-col gap-2">{GRADE_BANDS.map(g=>(<button key={g.id} onClick={()=>sfG(g.id)} className={`px-3.5 py-2.5 rounded-xl border-2 text-left text-sm ${fG===g.id?"border-amber-500 bg-amber-50 font-bold text-amber-900":"border-gray-200 bg-white"}`}>{g.label}</button>))}</div></div>
        <div className="mb-4"><label className="text-xs font-bold font-body text-gray-500 block mb-2">Learning Style</label><div className="flex flex-col gap-2">{LEARNING_STYLES.map(s=>(<button key={s.id} onClick={()=>sfS(s.id)} className={`px-3.5 py-2.5 rounded-xl border-2 text-left text-sm flex items-center gap-3 ${fS===s.id?"border-violet-500 bg-violet-50 text-violet-900":"border-gray-200 bg-white"}`}><span className="text-lg">{s.icon}</span><div><div className={fS===s.id?"font-bold":"font-semibold"}>{s.label}</div><div className="text-xs text-gray-400 font-body">{s.desc}</div></div></button>))}</div></div>
        <div className="mb-4"><label className="text-xs font-bold font-body text-gray-500 block mb-1">Interests <span className="font-normal text-gray-300">(for personalized questions)</span></label><textarea value={fI} onChange={e=>sfI(e.target.value)} rows={2} placeholder="Spider-Man, Frozen, ballet, dogs..." className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-body resize-y focus:border-amber-400 focus:outline-none"/></div>
        <div className="mb-5"><label className="text-xs font-bold font-body text-gray-500 block mb-1">Notes</label><textarea value={fNt} onChange={e=>sfNt(e.target.value)} rows={2} placeholder="2E, RSM, etc..." className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-body resize-y focus:border-amber-400 focus:outline-none"/></div>
        <div className="flex gap-2.5">
          <button onClick={view==="editChild"?updateChild:createChild} disabled={!fN.trim()||fP.length!==4} className={`flex-1 py-3 rounded-xl text-sm font-semibold font-body ${fN.trim()&&fP.length===4?"bg-gray-900 text-white":"bg-gray-200 text-gray-400 cursor-not-allowed"}`}>{view==="editChild"?"Save":"Create"}</button>
          {view==="editChild"&&eId&&<button onClick={()=>deleteChild(eId)} className="px-4 py-3 rounded-xl border-2 border-red-200 text-red-500 text-xs font-semibold font-body">Delete</button>}
        </div><button onClick={goBack} className="block w-full mt-2 py-2.5 text-sm text-gray-400 font-body">Cancel</button>
      </div>)}

      {/* DASHBOARD */}
      {view==="dashboard"&&activeChild&&(<div className="animate-fade-up">
        <div className="text-center mb-4"><div className="text-5xl mb-1">{activeChild.avatar}</div><h1 className="text-2xl font-bold">Hi {activeChild.name}!</h1></div>
        <div className="flex justify-center gap-2 mb-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full"><StarIcon/><span className="text-sm font-bold font-body text-amber-700">{getTotalPts().toLocaleString()} Bab$</span></div>
          <button onClick={()=>setView("achievements")} className="flex items-center gap-2 px-4 py-2 bg-violet-50 border border-violet-200 rounded-full hover:bg-violet-100"><span className="text-sm">{"\u{1F3C6}"}</span><span className="text-sm font-bold font-body text-violet-700">Badges</span></button>
          <button onClick={()=>setView("settings")} className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-full hover:bg-gray-100"><span className="text-sm">{"\u{2699}\u{FE0F}"}</span></button>
        </div>
        {!childHasAssessment(activeChild.id)&&(<button onClick={()=>startPlacement()} className="w-full mb-4 py-3.5 rounded-2xl border-2 border-pink-300 bg-pink-50 text-center hover:bg-pink-100 active:scale-[0.99]">
          <div className="text-sm font-bold font-body text-pink-700">{"\u{1F4CB}"} Take Placement Test <span className="font-normal text-pink-400">(Recommended)</span></div>
          <div className="text-[10px] font-body text-pink-400 mt-0.5">Helps Babs find the right level for each subject</div>
        </button>)}
        {childHasAssessment(activeChild.id)&&(<div className="flex flex-wrap justify-center gap-1.5 mb-4">{Object.entries(assessedLevels[activeChild.id]||{}).map(([k,lv])=>(<div key={k} className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 border border-blue-200"><span className="text-xs">{CURRICULUM[k]?.icon}</span><span className="text-[10px] font-bold font-body text-blue-600">Lv{lv}</span></div>))}
          <button onClick={()=>startPlacement()} className="px-2 py-1 rounded-full bg-gray-50 border border-gray-200 text-[10px] font-body text-gray-400 hover:bg-gray-100">Retake</button>
        </div>)}
        {Object.entries(CURRICULUM).filter(([k])=>!activeChild||!getChildHidden(activeChild.id).includes(k)).map(([k,s])=>{const st=getStats(k);return(
          <button key={k} onClick={()=>goSubj(k)} className="block w-full text-left p-5 mb-3 rounded-2xl border-2 hover:shadow-md active:scale-[0.99]" style={{borderColor:s.colorMid,background:s.colorLight}}>
            <div className="flex justify-between items-center"><div><span className="text-xl mr-2">{s.icon}</span><span className="text-lg font-bold" style={{color:s.color}}>{s.label}</span><div className="text-xs font-body text-gray-400 mt-0.5 ml-8">{st.done}/{st.total} mastered</div></div><div className="text-2xl font-bold" style={{color:s.color}}>{st.pct}%</div></div>
            <div className="mt-3 h-1.5 rounded-full" style={{background:s.colorMid}}><div className="h-full rounded-full transition-all duration-500" style={{background:s.color,width:`${st.pct}%`}}/></div>
          </button>);})}
      </div>)}

      {/* ACHIEVEMENTS */}
      {view==="achievements"&&activeChild&&(<div className="animate-fade-up">
        <div className="text-center mb-5"><span className="text-4xl">{"\u{1F3C6}"}</span><h2 className="text-xl font-bold mt-1">{activeChild.name}&apos;s Badges</h2></div>
        <div className="grid grid-cols-2 gap-3">{getAchievements().map((a,i)=>(<div key={i} className={`p-4 rounded-2xl border-2 text-center ${a.earned?"border-amber-300 bg-amber-50":"border-gray-200 bg-gray-50 opacity-40"}`}>
          <div className="text-3xl mb-1">{a.icon}</div><div className="text-sm font-bold">{a.title}</div><div className="text-[10px] font-body text-gray-500 mt-0.5">{a.desc}</div>
        </div>))}</div>
      </div>)}

      {/* SETTINGS (student) */}
      {view==="settings"&&activeChild&&(<div className="animate-fade-up">
        <h2 className="text-xl font-bold text-center mb-5">{"\u{2699}\u{FE0F}"} Settings</h2>
        {/* Interests */}
        <div className="mb-4 p-4 rounded-2xl border-2 border-gray-200 bg-white">
          <div className="text-sm font-bold font-body text-gray-600 mb-2">My Interests</div>
          <p className="text-xs font-body text-gray-400 mb-2">Questions will feature things you love!</p>
          <textarea value={activeChild.interests||""} readOnly className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-body bg-gray-50" rows={2}/>
          <p className="text-[10px] font-body text-gray-300 mt-1">Ask a parent to update these in your profile</p>
        </div>
        {/* Celebration style */}
        <div className="mb-4 p-4 rounded-2xl border-2 border-gray-200 bg-white">
          <div className="text-sm font-bold font-body text-gray-600 mb-2">Celebration Style</div>
          <div className="flex gap-2">{CELEBRATIONS.map((c,i)=>(<button key={i} onClick={()=>setCelType(i)} className={`px-3 py-2 rounded-xl border-2 text-center ${celType%CELEBRATIONS.length===i?"border-amber-400 bg-amber-50":"border-gray-200 bg-white"}`}>
            <div className="text-2xl">{c.emoji}</div><div className="text-[10px] font-body">{c.name}</div>
          </button>))}</div>
        </div>
        {/* Voice */}
        <div className="p-4 rounded-2xl border-2 border-gray-200 bg-white">
          <div className="text-sm font-bold font-body text-gray-600 mb-2">{"\u{1F50A}"} Voice</div>
          <div className="flex flex-wrap gap-2">{voices.slice(0,6).map((v,i)=>(<button key={i} onClick={()=>{setVoiceIdx(i);speak("Hi "+activeChild.name+"!",i);}} className={`px-3 py-1.5 rounded-lg text-xs font-body ${voiceIdx===i?"bg-violet-100 border-2 border-violet-400 text-violet-700 font-bold":"bg-gray-50 border border-gray-200 text-gray-500"}`}>{v.split(" ")[0]}</button>))}</div>
        </div>
      </div>)}

      {/* PLACEMENT TEST */}
      {view==="placement"&&activeChild&&placementSubj&&(()=>{
        const subj=CURRICULUM[placementSubj];const qs=PLACEMENT_QUESTIONS[placementSubj]||[];const q=qs[placementStep];
        if(!q)return null;
        const totalSubjects=Object.keys(CURRICULUM).filter(k=>!getChildHidden(activeChild.id).includes(k)).length;
        const currentSubjIdx=totalSubjects-placementQueue.length-1;
        return(<div className="animate-fade-up">
          <div className="text-center mb-4">
            <div className="text-3xl mb-1">{"\u{1F4CB}"}</div>
            <h2 className="text-lg font-bold">Placement Test</h2>
            <div className="text-xs font-body text-gray-400 mt-1"><span style={{color:subj.color}} className="font-semibold">{subj.icon} {subj.label}</span> — Question {placementStep+1} of {qs.length}</div>
            <div className="flex justify-center gap-1 mt-2">{Array.from({length:totalSubjects},(_,i)=>(<div key={i} className={`w-6 h-1.5 rounded-full ${i<currentSubjIdx?"bg-green-400":i===currentSubjIdx?"bg-blue-400":"bg-gray-200"}`}/>))}</div>
          </div>
          <div className="px-4 py-4 bg-gray-50 rounded-2xl border border-gray-200 mb-4">
            <div className="text-base font-semibold leading-relaxed">{q.q}</div>
          </div>
          <div className="flex flex-col gap-2.5 mb-4">{q.opts.map((opt,idx)=>{const isSel=placementAnswer===idx;const isC=idx===q.correct;const gG=placementShowResult&&isC;const gR=placementShowResult&&isSel&&!isC;
            return(<button key={idx} onClick={()=>placementSelectAnswer(idx)} disabled={placementShowResult} className={`px-3.5 py-3 rounded-xl border-2 text-left text-sm flex items-center gap-3 active:scale-[0.98] transition ${gG?"border-green-400 bg-green-50 text-green-900":gR?"border-red-300 bg-red-50 text-red-900":placementShowResult?"border-gray-200 bg-white":"border-gray-200 bg-white hover:border-gray-300"}`}>
              <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-body flex-shrink-0" style={{background:gG?"#10b981":gR?"#f87171":subj.colorLight,color:gG||gR?"#fff":subj.color}}>{gG?"\u2713":gR?"\u2717":String.fromCharCode(65+idx)}</span>
              <span>{opt}</span>
            </button>);})}</div>
          {placementShowResult&&<div className="flex gap-2.5">
            <button onClick={placementNext} className="flex-1 py-2.5 rounded-xl text-sm font-semibold font-body text-white hover:opacity-90" style={{background:subj.color}}>{placementStep+1<qs.length?"Next →":placementQueue.length>0?"Next Subject →":"See Results"}</button>
            <button onClick={()=>setView("dashboard")} className="px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-body text-gray-400 hover:bg-gray-50">Skip rest</button>
          </div>}
        </div>);
      })()}

      {/* SUBJECT */}
      {view==="subject"&&activeChild&&activeSubject&&(<div className="animate-fade-up">
        <div className="text-center mb-5"><span className="text-3xl">{CURRICULUM[activeSubject].icon}</span><h2 className="text-xl font-bold mt-1" style={{color:CURRICULUM[activeSubject].color}}>{CURRICULUM[activeSubject].label}</h2></div>
        {getTopics(activeSubject,activeChild.grade_band as GradeBand).map((topic,idx)=>{
          const tp=progress[activeSubject]?.[topic.id];if(!tp)return null;const subj=CURRICULUM[activeSubject];const canTest=tp.level>=4&&tp.total>=8&&!tp.mastered;
          const aLv=getAssessedLevel(activeChild.id,activeSubject);const isUnlocked=tp.unlocked||aLv>=4;
          return(<div key={topic.id} className="mb-2">
            <button onClick={()=>isUnlocked&&goLesson(topic.id)} disabled={!isUnlocked} className={`block w-full text-left px-3.5 py-3 rounded-xl border-2 transition ${!isUnlocked?"opacity-50 cursor-not-allowed border-gray-200 bg-gray-50":tp.mastered?"border-green-200 bg-green-50":"border-gray-200 bg-white hover:border-gray-300 active:scale-[0.99]"}`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2"><span className="text-[10px] font-bold font-body text-gray-300 w-4">{idx+1}</span><div><div className="text-sm font-bold flex items-center gap-1.5">{topic.name}{tp.mastered&&<CheckCircle/>}{!isUnlocked&&<Lock/>}</div><div className="text-xs font-body text-gray-400">{topic.desc}</div></div></div>
                {isUnlocked&&tp.total>0&&<div className="text-right ml-3"><div className="text-sm font-bold font-body" style={{color:subj.color}}>Lv{tp.level}</div></div>}
              </div>{isUnlocked&&tp.total>0&&<TopicBar tp={tp} color={subj.color}/>}
            </button>
            {canTest&&<button onClick={()=>goTest(topic.id)} className="mt-1 w-full py-2 rounded-lg border-2 border-amber-300 bg-amber-50 text-xs font-bold font-body text-amber-700 hover:bg-amber-100">{"\u{1F3C6}"} Mastery Test (8/10)</button>}
          </div>);})}      </div>)}

      {/* LESSON */}
      {view==="lesson"&&activeChild&&activeSubject&&activeTopic&&(()=>{
        const subj=CURRICULUM[activeSubject];const topics=getTopics(activeSubject,activeChild.grade_band as GradeBand);
        const topic=topics.find(t=>t.id===activeTopic);const tp=progress[activeSubject]?.[activeTopic];
        if(!topic||!tp)return null;
        if(testDone)return(<div className="animate-fade-up text-center py-12"><div className="text-5xl mb-4">{testPass?"\u{1F389}":"\u{1F4AA}"}</div><h2 className="text-2xl font-bold mb-2">{testPass?"Test Passed!":"Keep Practicing!"}</h2><p className="text-lg font-body text-gray-600 mb-2">{testC}/10</p><div className="w-48 h-3 rounded-full bg-gray-200 mx-auto mb-4"><div className="h-full rounded-full" style={{width:`${testC*10}%`,background:testPass?"#10b981":"#f59e0b"}}/></div><button onClick={goBack} className="px-8 py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold font-body">Back</button></div>);
        return(<div className="animate-fade-up">
          <div className="flex justify-between items-center mb-3 px-3.5 py-2.5 rounded-xl" style={{background:subj.colorLight}}>
            <div><div className="text-sm font-bold font-body flex items-center gap-2" style={{color:subj.color}}>{topic.name}{testMode&&<span className="text-[10px] px-2 py-0.5 bg-amber-200 text-amber-800 rounded-full font-bold">TEST</span>}</div>
              <div className="text-[10px] text-gray-400 font-body">Lv{tp.level}{activeChild&&getChildBoost(activeChild.id,activeSubject)?"+"+getChildBoost(activeChild.id,activeSubject):""} &middot; {sessionStats.correct}/{sessionStats.total}{testMode&&` \u00b7 ${testQ}/10`}</div></div>
            <div className="flex items-center gap-2">{sessionStats.points>0&&<div className="flex items-center gap-1 px-2 py-1 bg-amber-50 border border-amber-200 rounded-full"><StarIcon/><span className="text-xs font-bold font-body text-amber-600">{sessionStats.points}</span></div>}{tp.streak>0&&<div className="flex items-center gap-1 px-2 py-1 bg-orange-50 border border-orange-200 rounded-full"><FlameIcon/><span className="text-xs font-bold font-body text-orange-600">{tp.streak}</span></div>}</div>
          </div>
          {/* Milestone progress */}
          {!testMode&&<div className="mb-3 px-1"><div className="flex items-center gap-2"><div className="flex-1"><div className="flex gap-0.5">{Array.from({length:10},(_,i)=>(<div key={i} className="flex-1 h-2 rounded-full" style={{background:i<(sessionStats.total%10)?"#f59e0b":"#e5e7eb"}}/>))}</div></div><span className="text-[10px] font-bold font-body text-amber-500">{sessionStats.total%10}/10</span></div>
            {milestoneBonus>0&&<div className="text-center mt-1 animate-fade-up"><span className="inline-block px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-700 font-bold font-body text-xs">{"\u{1F389}"} Milestone! +{milestoneBonus} Bab$ Bux!</span></div>}
          </div>}
          {testMode&&<div className="mb-3 px-1"><div className="flex gap-1">{Array.from({length:10},(_,i)=>(<div key={i} className="flex-1 h-2 rounded-full" style={{background:i<testQ?(i<testC?"#10b981":"#f87171"):"#e5e7eb"}}/>))}</div></div>}
          {loading&&<div className="text-center py-12"><div className="w-10 h-10 rounded-full border-[3px] mx-auto mb-3 animate-spin" style={{borderColor:subj.colorMid,borderTopColor:subj.color}}/><p className="text-sm font-body text-gray-400">{loadingMsg}</p></div>}
          {error&&!loading&&<div className="text-center py-8"><p className="text-sm text-red-500 font-body mb-3">{error}</p><button onClick={()=>genQ(activeSubject,activeTopic,testMode)} className="px-5 py-2 rounded-lg text-sm font-semibold font-body text-white" style={{background:subj.color}}>Retry</button></div>}
          {question&&!loading&&!error&&(<>
            <SceneDisplay sceneHtml={question.scene_illustration} wikiQuery={question.image_query}/>
            <div className="relative mb-3 px-4 py-4 bg-gray-50 rounded-2xl border border-gray-200">
              <div className="text-base font-semibold leading-relaxed whitespace-pre-wrap pr-10">{question.question}</div>
              <button onClick={()=>speak(question.question,voiceIdx)} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center hover:border-violet-400 hover:bg-violet-50" title="Read aloud"><SpeakerIcon/></button>
            </div>
            {!showResult&&question.audio_hint&&<button onClick={()=>{speak(question.audio_hint,voiceIdx);setSessionStats(p=>({...p,hints:p.hints+1}));}} className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-violet-300 bg-violet-50 text-sm font-body font-semibold text-violet-600 hover:bg-violet-100 mb-3"><SpeakerIcon/> Need a hint?</button>}
            <div className="flex flex-col gap-2.5 mb-5">{question.options.map((opt:string,idx:number)=>{const isSel=selectedAnswer===idx;const isC=idx===question.correct;const gG=showResult&&isC;const gR=showResult&&isSel&&!isC;
              return(<button key={idx} onClick={()=>handleAns(idx)} disabled={showResult} className={`px-3.5 py-3 rounded-xl border-2 text-left text-sm flex items-center gap-3 active:scale-[0.98] transition ${gG?"border-green-400 bg-green-50 text-green-900":gR?"border-red-300 bg-red-50 text-red-900":showResult?"border-gray-200 bg-white":"border-gray-200 bg-white hover:border-gray-300"}`}>
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-body flex-shrink-0" style={{background:gG?"#10b981":gR?"#f87171":subj.colorLight,color:gG||gR?"#fff":subj.color}}>{gG?"\u2713":gR?"\u2717":String.fromCharCode(65+idx)}</span>
                <span dangerouslySetInnerHTML={{__html:opt.replace(/^[A-D]\)\s*/i,"")}}/>
              </button>);})}</div>
            {showResult&&<div className="animate-fade-up">
              {lastPoints>0&&<PointsBurst pts={lastPoints}/>}
              <div className="px-4 py-3.5 rounded-2xl mb-3 border" style={{background:selectedAnswer===question.correct?"#ecfdf5":"#fffbeb",borderColor:selectedAnswer===question.correct?"#a7f3d0":"#fde68a"}}>
                <p className="text-sm font-body text-gray-700 mb-1.5">{question.explanation}</p><p className="text-xs font-body font-semibold italic" style={{color:subj.color}}>{question.encouragement}</p></div>
              <div className="flex gap-2.5">{(!testMode||testQ<10)&&<button onClick={()=>genQ(activeSubject,activeTopic,testMode)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold font-body text-white hover:opacity-90 active:scale-[0.98]" style={{background:subj.color}}>{testMode?`Next (${testQ}/10)`:"Next"} &rarr;</button>}
                <button onClick={tryLeaveLesson} className="px-4 py-2.5 rounded-xl border-2 text-sm font-semibold font-body hover:bg-gray-50" style={{borderColor:subj.colorMid,color:subj.color}}>Done</button></div>
            </div>}
          </>)}
        </div>);
      })()}

      {/* PARENT (child-specific) */}
      {view==="parent"&&activeChild&&(<div className="animate-fade-up">
        <div className="text-center mb-5"><h2 className="text-xl font-bold">{activeChild.avatar} {activeChild.name}&apos;s Progress</h2>
          <div className="text-xs font-body text-gray-400 mt-1">{(() => { const a = assessGradeLevel(progress, activeChild.grade_band); return <span style={{color:a.color}} className="font-bold">{a.label}</span>; })()}</div>
          <div className="flex justify-center gap-3 mt-2"><div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full"><StarIcon/><span className="text-xs font-bold font-body text-amber-700">{getTotalPts().toLocaleString()} Bab$</span></div></div>
        </div>
        {Object.entries(CURRICULUM).map(([k,s])=>{const topics=getTopics(k,activeChild.grade_band as GradeBand);const act=topics.filter(t=>progress[k]?.[t.id]?.unlocked||(progress[k]?.[t.id]?.total||0)>0);
          return(<div key={k} className="mb-5"><div className="text-sm font-bold font-body mb-2" style={{color:s.color}}>{s.icon} {s.label}</div>
            {act.length===0?<div className="text-xs font-body text-gray-300 px-3 py-2 bg-gray-50 rounded-lg">Not started</div>:
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="grid grid-cols-[1fr_40px_40px_40px_40px] px-3 py-1.5 bg-gray-50 border-b border-gray-200 text-[9px] font-bold font-body text-gray-300 uppercase tracking-wider"><div>Topic</div><div className="text-center">Lv</div><div className="text-center">Acc</div><div className="text-center">#</div><div className="text-center">{"\u{1F525}"}</div></div>
                {act.map(topic=>{const tp=progress[k]?.[topic.id];if(!tp)return null;const pct=tp.total>0?Math.round((tp.correct/tp.total)*100):0;
                  return(<div key={topic.id} className="grid grid-cols-[1fr_40px_40px_40px_40px] px-3 py-1.5 border-b border-gray-50 items-center">
                    <div className="text-xs font-body text-gray-700 flex items-center gap-1">{tp.mastered&&<CheckCircle/>}{topic.name}</div>
                    <div className="text-center text-xs font-bold font-body" style={{color:s.color}}>{tp.level}</div>
                    <div className={`text-center text-xs font-body ${pct>=80?"text-green-500":pct>=60?"text-amber-500":tp.total>0?"text-red-400":"text-gray-200"}`}>{tp.total>0?`${pct}%`:"\u2014"}</div>
                    <div className="text-center text-xs font-body text-gray-400">{tp.total||"\u2014"}</div>
                    <div className="text-center text-xs font-body text-amber-500">{tp.best_streak||"\u2014"}</div>
                  </div>);})}
              </div>}
          </div>);})}
      </div>)}

      {/* PARENT PIN MODAL */}
      {parentPinMode&&(<div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.5)",zIndex:998,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
        <div className="bg-white rounded-2xl p-6 max-w-xs w-full text-center">
          <div className="text-3xl mb-2">{parentPinSetup?"\u{1F512}":"\u{1F510}"}</div>
          <h3 className="text-lg font-bold mb-1">{parentPinSetup?"Set Parent PIN":"Enter Parent PIN"}</h3>
          <p className="text-xs font-body text-gray-400 mb-4">{parentPinSetup?"Choose a PIN to protect parent settings":"This area is PIN-protected"}</p>
          <input type="tel" inputMode="numeric" maxLength={6} autoFocus value={parentPinInput} onChange={e=>{setParentPinInput(e.target.value.replace(/\D/g,"").slice(0,6));setParentPinError("");}}
            onKeyDown={e=>{if(e.key==="Enter"&&parentPinInput.length>=4)submitParentPin();}}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-2xl font-bold text-center tracking-[0.5em] font-body focus:border-amber-400 focus:outline-none mb-3" placeholder="\u25CF\u25CF\u25CF\u25CF"/>
          {parentPinError&&<p className="text-red-500 text-sm font-body mb-3">{parentPinError}</p>}
          <div className="flex gap-2">
            <button onClick={()=>{setParentPinMode(false);setParentPinInput("");setParentPinError("");setParentPinSetup(false);}} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold font-body text-gray-500">Cancel</button>
            <button onClick={submitParentPin} disabled={parentPinInput.length<4} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold font-body ${parentPinInput.length>=4?"bg-gray-900 text-white":"bg-gray-200 text-gray-400"}`}>{parentPinSetup?"Set PIN":"Enter"}</button>
          </div>
        </div>
      </div>)}

      {/* EMMA CHALLENGE */}
      {emmaChallenge&&(<div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.6)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
        <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center animate-fade-up">
          <div className="text-4xl mb-2">{"\u{1F9E9}"}</div>
          <h3 className="text-lg font-bold mb-1">Emma Challenge!</h3>
          <p className="text-xs font-body text-gray-500 mb-3">Unscramble the word for <span className="font-bold text-amber-600">+50 bonus Bab$ Bux!</span></p>
          <div className="flex justify-center gap-1.5 mb-4">{emmaChallenge.scrambled.split("").map((c,i)=>(<div key={i} className="w-8 h-10 rounded-lg bg-violet-100 border-2 border-violet-300 flex items-center justify-center text-lg font-bold text-violet-700">{c}</div>))}</div>
          {emmaResult==="correct"?(<div className="animate-fade-up"><div className="text-3xl mb-2">{"\u{1F389}"}</div><p className="text-sm font-bold text-green-600 mb-3">You got it! +50 Bab$ Bux!</p><button onClick={()=>setEmmaChallenge(null)} className="px-6 py-2.5 rounded-xl bg-green-500 text-white text-sm font-bold font-body">Awesome!</button></div>)
          :emmaResult==="wrong"?(<div className="animate-fade-up"><p className="text-sm text-red-500 font-body mb-2">Not quite! The word was <strong>{emmaChallenge.word}</strong></p><button onClick={()=>setEmmaChallenge(null)} className="px-6 py-2.5 rounded-xl bg-gray-200 text-gray-600 text-sm font-bold font-body">Next time!</button></div>)
          :(<div><input type="text" autoFocus value={emmaInput} onChange={e=>setEmmaInput(e.target.value.replace(/[^a-zA-Z]/g,""))} onKeyDown={e=>{if(e.key==="Enter"&&emmaInput.length>0){if(emmaInput.toLowerCase()===emmaChallenge.word.toLowerCase()){setEmmaResult("correct");setSessionStats(p=>({...p,points:p.points+50}));}else{setEmmaResult("wrong");}}}}
            className="w-full px-4 py-3 rounded-xl border-2 border-violet-300 text-lg font-bold text-center tracking-wider font-body focus:border-violet-500 focus:outline-none mb-3" placeholder="Type the word..."/>
          <div className="flex gap-2"><button onClick={()=>{if(emmaInput.toLowerCase()===emmaChallenge.word.toLowerCase()){setEmmaResult("correct");setSessionStats(p=>({...p,points:p.points+50}));}else{setEmmaResult("wrong");}}} disabled={!emmaInput} className={`flex-1 py-2.5 rounded-xl text-sm font-bold font-body ${emmaInput?"bg-violet-500 text-white":"bg-gray-200 text-gray-400"}`}>Check!</button>
            <button onClick={()=>setEmmaChallenge(null)} className="px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-body text-gray-400">Skip</button></div></div>)}
        </div>
      </div>)}

      {/* BABS WELCOME INTERSTITIAL */}
      {showBabsWelcome&&(<div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.6)",zIndex:998,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center animate-fade-up">
          <img src="/babs-logo.jpeg" alt="Babs" className="w-24 h-24 rounded-full object-cover mx-auto mb-3 border-4 border-pink-200 shadow-lg" />
          <h2 className="text-2xl font-bold mb-2">Welcome to Katz Kourse!</h2>
          <p className="text-sm font-body text-gray-500 mb-4">Babs says: <em>&ldquo;Are you ready to pay the fees? And where&apos;s my margarita?&rdquo;</em></p>
          <div className="bg-pink-50 border-2 border-pink-200 rounded-2xl p-4 mb-5">
            <p className="text-xs font-body text-pink-700 mb-2 font-semibold">Here&apos;s how it works:</p>
            <p className="text-xs font-body text-gray-600">1. Add your learners with their own PINs</p>
            <p className="text-xs font-body text-gray-600">2. They pick subjects and answer questions</p>
            <p className="text-xs font-body text-gray-600">3. Earn Bab$ Bux and master topics!</p>
          </div>
          <button onClick={()=>{setShowBabsWelcome(false);setView("profiles");}} className="w-full py-3 rounded-xl bg-pink-500 text-white text-sm font-bold font-body hover:bg-pink-600 active:scale-[0.98]">Let&apos;s Goooo! {"\u{1F389}"}</button>
        </div>
      </div>)}

      {/* FRENCH SURRENDER POPUP */}
      {showSurrenderPopup&&(<div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.5)",zIndex:998,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
        <div className="bg-white rounded-3xl p-6 max-w-xs w-full text-center animate-fade-up">
          <div className="text-5xl mb-2">{"\u{1F1EB}\u{1F1F7}"}</div>
          <h3 className="text-lg font-bold mb-1">Are you French?</h3>
          <p className="text-sm font-body text-gray-500 mb-1">Babs says: <em>&ldquo;Quitting already?! In my day we studied uphill both ways!&rdquo;</em></p>
          <p className="text-xs font-body text-gray-400 mb-4">You&apos;ve got {sessionStats.total < 3 ? "barely started" : "a good streak going"}!</p>
          <div className="flex gap-2.5">
            <button onClick={()=>setShowSurrenderPopup(false)} className="flex-1 py-2.5 rounded-xl bg-green-500 text-white text-sm font-bold font-body hover:bg-green-600">Keep Going! {"\u{1F4AA}"}</button>
            <button onClick={()=>{setShowSurrenderPopup(false);goBack();}} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold font-body text-gray-500 hover:bg-gray-50">I surrender {"\u{1F3F3}\u{FE0F}"}</button>
          </div>
        </div>
      </div>)}

      <p className="mt-8 text-center text-[10px] text-gray-200 font-body">Powered by Claude &middot; Katz Kourse</p>
    </div>
  );
}
