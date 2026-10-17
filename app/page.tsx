"use client";

import { useMemo, useState } from "react";
import { Activity, ArrowDownRight, ArrowUpRight, BadgeCheck, Bell, Building2, Check, ChevronDown, CircleHelp, ClipboardList, Compass, ExternalLink, Filter, Globe2, LayoutDashboard, Mail, MapPin, Menu, Plus, Search, Send, Settings2, ShieldCheck, Sparkles, Target, Trash2, Users, X } from "lucide-react";

type Lead = { id:string; name:string; address:string; website:string; phone:string; mapsUrl:string; category:string; status:string; email:string; source:string; stage:string; emailSubject:string; emailDraft:string };
const services = ["Electrical works","Plumbing","Aluminium roofing","Project consultancy","Event planning","Conferences & seminars","Speaker coordination"];
const initialLeads: Lead[] = [];

export default function Home() {
  const [leads,setLeads] = useState<Lead[]>(initialLeads);
  const [query,setQuery] = useState("Electrical contractors");
  const [city,setCity] = useState("Lagos");
  const [service,setService] = useState(services[0]);
  const [section,setSection] = useState("Overview");
  const [searching,setSearching] = useState(false);
  const [error,setError] = useState("");
  const [notice,setNotice] = useState("");
  const [selected,setSelected] = useState<Lead|null>(null);
  const [drafting,setDrafting] = useState(false);
  const [approved,setApproved] = useState(false);
  const [email,setEmail] = useState("");
  const [subject,setSubject] = useState("");
  const [message,setMessage] = useState("");
  const [filter,setFilter] = useState("All leads");
  const [mobileNav,setMobileNav] = useState(false);
  const pending = leads.filter(l=>l.stage==="Review").length;
  const filtered = useMemo(()=>leads.filter(l=>filter==="All leads" || (filter==="Needs review" ? l.stage==="Review" : l.stage===filter)),[leads,filter]);

  async function discover() {
    setSearching(true); setError(""); setNotice("");
    try {
      const res = await fetch("/api/discover",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({service:query||service,city:city||"Nigeria"})});
      const data = await res.json();
      if(!res.ok) throw new Error(data.error||"Search failed");
      setLeads(prev=>{const seen=new Set(prev.map(l=>l.id)); return [...prev,...data.leads.filter((l:Lead)=>!seen.has(l.id))];});
      setNotice(`Found ${data.count} public business listings. These are prospects, not confirmed demand. ${data.note||""}`);
    } catch(e:any) {setError(e.message||"Search failed.");}
    finally {setSearching(false);}
  }
  function openLead(l:Lead) {setSelected(l);setEmail(l.email||"");setSubject(l.emailSubject||"");setMessage(l.emailDraft||"");setApproved(false);}
  async function generateDraft() {
    if(!selected)return; setDrafting(true);setError("");setNotice("");
    try {
      const res=await fetch("/api/draft",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({lead:selected,service})});
      const data=await res.json();if(!res.ok)throw new Error(data.error||"Draft failed");
      setSubject(data.subject||"");setMessage(data.body||"");setLeads(prev=>prev.map(l=>l.id===selected.id?{...l,emailSubject:data.subject,emailDraft:data.body,stage:"Review"}:l));setSelected({...selected,emailSubject:data.subject,emailDraft:data.body,stage:"Review"});
    } catch(e:any){setError(e.message||"Draft failed.");}finally{setDrafting(false);}
  }
  async function sendApproved() {
    setError("");setNotice("");
    try {
      const res=await fetch("/api/send",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:email,subject,message,approved})});
      const data=await res.json();if(!res.ok)throw new Error(data.error||"Sending failed");
      setLeads(prev=>prev.map(l=>l.id===selected?.id?{...l,stage:"Contacted",email,emailSubject:subject,emailDraft:message}:l));setNotice("Email accepted by provider.");setSelected(null);
    }catch(e:any){setError(e.message||"Sending failed.");}
  }
  const nav=[{name:"Overview",icon:LayoutDashboard},{name:"Discover leads",icon:Compass},{name:"Lead pipeline",icon:Users},{name:"Email approvals",icon:ShieldCheck}];
  return <main className="shell">
    <aside className={`sidebar ${mobileNav?"nav-open":""}`}>
      <div className="brand"><div className="brand-mark">M<span>.</span></div><div><strong>MOBZENOX</strong><small>LEAD ENGINE</small></div><button className="close-nav" onClick={()=>setMobileNav(false)}><X size={18}/></button></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav>{nav.map(n=><button key={n.name} onClick={()=>{setSection(n.name);setMobileNav(false)}} className={section===n.name?"nav-item active":"nav-item"}><n.icon size={18}/><span>{n.name}</span>{n.name==="Email approvals"&&pending>0&&<b>{pending}</b>}</button>)}</nav>
      <div className="side-bottom"><div className="system-card"><div className="system-head"><span className="pulse"></span> SYSTEM STATUS</div><strong>Integration setup</strong><p>Connect discovery, AI and email providers to activate live prospecting.</p><button onClick={()=>setSection("Settings")} className="system-link">Configure integrations <ArrowUpRight size={14}/></button></div><div className="profile"><div className="avatar">ME</div><div><strong>MOBZENOX Team</strong><small>Lead operations</small></div><ChevronDown size={16}/></div></div>
    </aside>
    {mobileNav&&<button className="mobile-shade" onClick={()=>setMobileNav(false)} aria-label="Close navigation"/>}
    <section className="main">
      <header className="topbar"><button className="menu-button" onClick={()=>setMobileNav(true)}><Menu/></button><div className="breadcrumb">Workspace <span>/</span> <strong>{section}</strong></div><div className="top-actions"><div className="top-status"><span className="pulse"></span> Approval mode enabled</div><button className="icon-button" title="Notifications"><Bell size={18}/></button><a href="https://mobzenox-enterprises.vercel.app" target="_blank" rel="noreferrer" className="website-link">Company site <ExternalLink size={14}/></a></div></header>
      <div className="content">
        <div className="welcome-row"><div><div className="eyebrow"><Sparkles size={14}/> INTELLIGENCE WORKSPACE</div><h1>{section==="Overview"?"Your next client starts here.":section}</h1><p className="subtitle">{section==="Overview"?"Discover Nigerian businesses, qualify opportunities, and prepare outreach with a human in control.":section==="Discover leads"?"Search public business listings across Nigeria for potential service buyers.":section==="Email approvals"?"Review every message before anything leaves your inbox.":section==="Settings"?"Connect the services that power prospect discovery and outreach.":"Track prospects from discovery to first contact."}</p></div><div className="date-chip"><Activity size={15}/> Live workspace</div></div>
        {(error||notice)&&<div className={error?"alert error":"alert success"}><span>{error||notice}</span><button onClick={()=>{setError("");setNotice("")}}><X size={16}/></button></div>}
        {section==="Settings"?<div className="settings-grid"><div className="panel settings-panel"><div className="panel-heading"><div><h3>Integrations</h3><p>API keys stay on the server in Vercel environment variables.</p></div><Settings2 size={20}/></div>{[{name:"Google Places API",env:"GOOGLE_PLACES_API_KEY",desc:"Find real public business listings nationwide."},{name:"OpenAI API",env:"OPENAI_API_KEY",desc:"Research context and generate tailored drafts."},{name:"Resend",env:"RESEND_API_KEY + EMAIL_FROM",desc:"Send only after explicit approval."},{name:"Supabase",env:"SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY",desc:"Persistent lead records, team access and audit trail."}].map((i)=><div className="integration" key={i.name}><div className="integration-icon"><Globe2 size={18}/></div><div className="integration-copy"><strong>{i.name}</strong><p>{i.desc}</p><code>{i.env}</code></div><span className="pill waiting">Setup needed</span></div>)}<div className="callout"><ShieldCheck size={18}/><div><strong>Approval-first sending</strong><p>The send endpoint rejects requests unless the approval flag is explicitly true. Keep keys private and configure provider restrictions before production use.</p></div></div></div><div className="panel checklist"><h3>Go-live checklist</h3>{["Add provider keys in Vercel","Deploy and verify API routes","Run a real discovery search","Review the generated email","Send a single approved test email","Connect persistent database + access control"].map((s,i)=><div className="check-row" key={s}><span>{i+1}</span><p>{s}</p><span className="pill waiting">Pending</span></div>)}</div></div>
        :<><div className="stats-grid"><Stat icon={Building2} label="Businesses found" value={String(leads.length)} change="Public listings only" tone="blue"/><Stat icon={Target} label="Needs review" value={String(pending)} change="Human approval queue" tone="orange"/><Stat icon={Mail} label="Contacted" value={String(leads.filter(l=>l.stage==="Contacted").length)} change="Sent via provider" tone="green"/><Stat icon={BadgeCheck} label="Qualified prospects" value={String(leads.filter(l=>l.stage==="Qualified").length)} change="Mark after verification" tone="purple"/></div>
        <div className="panel discovery-panel"><div className="panel-heading"><div><div className="section-kicker"><Compass size={15}/> PROSPECT DISCOVERY</div><h2>Find your next opportunity</h2><p>Search business listings by service and location. No uploaded lead list required.</p></div><div className="search-icon"><Search size={20}/></div></div><div className="search-controls"><label className="field"><span>What are you looking for?</span><div className="select-wrap"><select value={service} onChange={e=>{setService(e.target.value);setQuery(e.target.value)}}>{services.map(s=><option key={s}>{s}</option>)}</select><ChevronDown size={16}/></div></label><label className="field"><span>Search term (editable)</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="e.g. event venues, facility managers"/></label><label className="field location-field"><span>Location</span><div className="input-icon"><MapPin size={16}/><input value={city} onChange={e=>setCity(e.target.value)} placeholder="Lagos or Nigeria"/></div></label><button className="primary-button search-button" onClick={discover} disabled={searching}>{searching?<span className="spinner"/>:<Search size={17}/>} {searching?"Searching…":"Find prospects"}</button></div><div className="discovery-foot"><span><ShieldCheck size={15}/> Public business data</span><span><Globe2 size={15}/> Nigeria-wide coverage by location</span><span><CircleHelp size={15}/> Demand is not assumed</span></div></div>
        <div className="panel leads-panel"><div className="panel-heading leads-heading"><div><div className="section-kicker"><ClipboardList size={15}/> YOUR PIPELINE</div><h2>Prospect workspace</h2><p>Review details, generate a draft, and approve outreach.</p></div><div className="filter-wrap"><Filter size={15}/><select value={filter} onChange={e=>setFilter(e.target.value)}><option>All leads</option><option>New</option><option>Needs review</option><option>Contacted</option><option>Qualified</option></select></div></div>
        {filtered.length===0?<div className="empty-state"><div className="empty-icon"><Search size={23}/></div><h3>{leads.length===0?"Your pipeline is ready for its first search":"No prospects in this view"}</h3><p>{leads.length===0?"Choose a service and location above. Add the Google Places API key in Vercel to discover real businesses.":"Try a different filter or run another discovery search."}</p><button className="secondary-button" onClick={()=>{setSection("Settings");setFilter("All leads")}}><Settings2 size={16}/> Check integrations</button></div>:<div className="table-scroll"><table><thead><tr><th>BUSINESS</th><th>LOCATION</th><th>CONTACT</th><th>STAGE</th><th></th></tr></thead><tbody>{filtered.map(l=><tr key={l.id}><td><div className="business-cell"><div className="business-avatar">{l.name.slice(0,1).toUpperCase()}</div><div><strong>{l.name}</strong><small>{l.category}</small></div></div></td><td className="address-cell">{l.address||"—"}</td><td>{l.phone||"No public phone"}{l.website&&<a className="mini-link" href={l.website} target="_blank" rel="noreferrer">Website <ExternalLink size={12}/></a>}</td><td><span className={`pill ${l.stage==="Contacted"?"green":l.stage==="Review"?"orange":"waiting"}`}>{l.stage}</span></td><td><button className="row-action" onClick={()=>openLead(l)}>Review <ArrowDownRight size={14}/></button></td></tr>)}</tbody></table></div>}</div></>}
        <footer><span>© {new Date().getFullYear()} MOBZENOX ENTERPRISES</span><span><ShieldCheck size={13}/> Human-controlled outreach · Privacy-aware prospecting</span></footer>
      </div>
    </section>
    {selected&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setSelected(null)}}><section className="review-modal"><div className="modal-header"><div><div className="section-kicker"><ShieldCheck size={15}/> LEAD REVIEW</div><h2>{selected.name}</h2><p>{selected.address}</p></div><button className="icon-button" onClick={()=>setSelected(null)}><X/></button></div><div className="lead-detail">{selected.website&&<a href={selected.website} target="_blank" rel="noreferrer">{selected.website} <ExternalLink size={13}/></a>}{selected.phone&&<span>{selected.phone}</span>}{selected.mapsUrl&&<a href={selected.mapsUrl} target="_blank" rel="noreferrer">Open map <ExternalLink size={13}/></a>}</div><div className="callout"><CircleHelp size={18}/><div><strong>Verify before outreach</strong><p>Public listing data does not confirm need or provide an email address. Find a public business email from its official site before sending.</p></div></div><button className="primary-button full" onClick={generateDraft} disabled={drafting}>{drafting?<span className="spinner"/>:<Sparkles size={16}/>} {drafting?"Generating…":"Generate personalized draft"}</button><label className="field"><span>Recipient email (verify first)</span><input type="email" value={email} onChange={e=>{setEmail(e.target.value);setApproved(false)}} placeholder="name@business.com"/></label><label className="field"><span>Subject</span><input value={subject} onChange={e=>{setSubject(e.target.value);setApproved(false)}} placeholder="Email subject"/></label><label className="field"><span>Message</span><textarea rows={7} value={message} onChange={e=>{setMessage(e.target.value);setApproved(false)}} placeholder="Generate a draft or write your own…"/></label><label className="approval-check"><input type="checkbox" checked={approved} onChange={e=>setApproved(e.target.checked)}/><span>I reviewed the recipient, subject, and message. I approve sending this email.</span></label><button className="primary-button full" onClick={sendApproved} disabled={!approved||!email||!subject||!message}><Send size={16}/> Approve & send email</button><p className="fineprint">Sending requires valid Resend configuration. Only contact relevant business recipients, honour opt-outs, and follow applicable privacy and marketing rules.</p></section></div>}
  </main>;
}
function Stat({icon:Icon,label,value,change,tone}:{icon:any;label:string;value:string;change:string;tone:string}) {return <div className="stat-card"><div className="stat-top"><span>{label}</span><div className={`stat-icon ${tone}`}><Icon size={17}/></div></div><div className="stat-value">{value}</div><div className="stat-bottom"><span className="stat-dot"></span>{change}</div></div>}