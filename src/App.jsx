import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import './index.css';

// ── CONFIG & CONSTANTS ──
const CYCLE_ID = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
const SATYA_ID = '00000000-0000-0000-0000-000000400116'; // Top Director ID

function getInitials(p) {
  if (!p) return "??";
  const f = p.first_name?.[0] || "";
  const l = p.last_name?.[0] || "";
  return (f + l).toUpperCase() || "??";
}

// ── SHARED COMPONENTS ──
function Toast({ msg, color, show }) {
  return (
    <div className={`toast ${show ? "toast-show" : "toast-hidden"}`} style={{ background: color }}>
      <span className="toast-icon">✓</span><span>{msg}</span>
    </div>
  );
}

function Badge({ cls, dot, children }) {
  return (
    <span className={`badge badge-${cls}`}>
      {dot && <span className="badge-dot" />}{children}
    </span>
  );
}

function StatCard({ cls, label, val, valCls, note }) {
  return (
    <div className={`stat-card stat-card-${cls}`}>
      <div className="stat-label">{label}</div>
      <div className={`stat-val ${valCls || ""}`}>{val}</div>
      {note && <div className="stat-note">◈ {note}</div>}
    </div>
  );
}


// ── OVERVIEW PORTAL ──
function Overview({ profile }) {
  const [allProfilesCount, setAllProfilesCount] = useState(0);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [yesOutcomeCount, setYesOutcomeCount] = useState(0);
  const [cycleThemes, setCycleThemes] = useState([]);

  const completionRate = allProfilesCount > 0 ? Math.round((submissionCount / allProfilesCount) * 100) : 0;
  const overallYesRate = submissionCount > 0 ? Math.round((yesOutcomeCount / submissionCount) * 100) : 0;
  const pendingGeneral = cycleThemes.filter(t => t.status === 'pending_review' || t.status === 'pending_hr_approval').length;

  useEffect(() => {
    async function fetchOverviewData() {
      // 1. Total employees
      const { count: empCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      setAllProfilesCount(empCount || 0);

      // 2. Reviews for cycle
      const { data: cycleReviews } = await supabase.from('monthly_reviews').select('overall_result').eq('cycle_id', CYCLE_ID);
      setSubmissionCount(cycleReviews?.length || 0);
      setYesOutcomeCount(cycleReviews?.filter(r => r.overall_result === 'YES').length || 0);

      // 3. Themes for cycle
      const { data: themes } = await supabase.from('themes').select('*').eq('cycle_id', CYCLE_ID);
      setCycleThemes(themes || []);
    }
    fetchOverviewData();
  }, []);

  return (
    <div className="page">
      <div className="portal-label">◆ EXECUTIVE OVERVIEW · APRIL 2025</div>
      <div className="page-title">Continuous Performance<br/><span>Framework Dashboard</span></div>
      <div className="page-sub">Monthly binary review cycles · Theme validation · Rolling period roll-up · SAP Connect integration</div>
      
      <div className="stats-grid" style={{ marginBottom: 32 }}>
        <StatCard cls="blue" label="Active Employees" val={allProfilesCount.toString()} note="Synced from database" />
        <StatCard cls="blue" label="Submission Completion" val={`${completionRate}%`} note={`${submissionCount} reviews submitted`} />
        <StatCard cls="yellow" label="Overall YES Rate" val={`${overallYesRate}%`} valCls="yellow" note={`${yesOutcomeCount} positive outcomes`} />
        <StatCard cls="purple" label="Pending Validations" val={pendingGeneral} valCls="purple" note="Actions awaiting approval" />
      </div>

      <div className="sec-title">How It Works</div>
      <div className="flow-container">
        <div className="flow-rows">
          <div className="flow-row">
            <div className="flow-step"><div className="flow-step-label">SAP CONNECT</div><div className="flow-step-name">Employee Data</div></div>
            <div className="flow-arrow">→</div>
            <div className="flow-step"><div className="flow-step-label">STEP 1</div><div className="flow-step-name">Manager Direction</div></div>
            <div className="flow-arrow">→</div>
            <div className="flow-step hl"><div className="flow-step-label">STEP 2</div><div className="flow-step-name">Employee Themes</div></div>
            <div className="flow-arrow">→</div>
            <div className="flow-step hl"><div className="flow-step-label">STEP 3</div><div className="flow-step-name">4 Binary Inputs</div></div>
            <div className="flow-arrow">→</div>
          </div>
          <div className="flow-row" style={{ marginTop: 12 }}>
            <div className="flow-step green-step"><div className="flow-step-label">AUTO CALC</div><div className="flow-step-name">Yes / No Result</div></div>
            <div className="flow-arrow">→</div>
            <div className="flow-step"><div className="flow-step-label">STEP 4</div><div className="flow-step-name">Theme Validation</div></div>
            <div className="flow-arrow">→</div>
            <div className="flow-step purple-step"><div className="flow-step-label">ROLL-UP</div><div className="flow-step-name">Q / Annual View</div></div>
          </div>
        </div>
      </div>

      <div className="info-grid">
        <div className="frame frame-blue">
          <div className="stat-label" style={{ color: 'var(--cyan)', marginBottom: 14 }}>Decision Rule</div>
          <div className="rule-row"><span>4 Yes / 3 Yes + 1 No / 2 + 2</span><Badge cls="green">YES</Badge></div>
          <div className="rule-row"><span>1 Yes + 3 No / 4 No</span><Badge cls="red">NO</Badge></div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 10, padding: 8, background: 'var(--bg2)', borderRadius: 6 }}>2 or more Yes inputs = overall monthly YES</div>
        </div>
        <div className="frame frame-purple">
          <div className="stat-label" style={{ color: 'var(--purple)', marginBottom: 14 }}>Period Roll-Up</div>
          <div className="v-stack" style={{ gap: 12 }}>
            <div className="h-stack" style={{ gap: 12 }}><span className="badge badge-teal" style={{ minWidth: 70 }}>Monthly</span><span style={{ fontSize: 13 }}>4 binary inputs + themes</span></div>
            <div className="h-stack" style={{ gap: 12 }}><span className="badge badge-purple" style={{ minWidth: 70 }}>Quarterly</span><span style={{ fontSize: 13 }}>Roll-up of 3 results + trends</span></div>
            <div className="h-stack" style={{ gap: 12 }}><span className="badge badge-green" style={{ minWidth: 70 }}>Annual</span><span style={{ fontSize: 13 }}>Full year aggregate + rewards</span></div>
          </div>
        </div>
        <div className="frame frame-blue">
          <div className="stat-label" style={{ color: 'var(--cyan)', marginBottom: 14 }}>User Roles</div>
          <div className="v-stack" style={{ gap: 10 }}>
            <div style={{ fontSize: 13 }}><span style={{ color: 'var(--cyan)', fontWeight: 700 }}>Employee</span> — Create themes, submit evidence</div>
            <div style={{ fontSize: 13 }}><span style={{ color: 'var(--green)', fontWeight: 700 }}>Manager</span> — 4 binary inputs, validate themes</div>
            <div style={{ fontSize: 13 }}><span style={{ color: 'var(--purple)', fontWeight: 700 }}>HR</span> — Dashboards, trends, governance</div>
          </div>
        </div>
      </div>

      <div className="frame">
        <div className="sec-title">Department Distribution</div>
        <div className="bar-row"><span className="bar-label">Engineering</span><div className="bar-track"><div className="bar-fill" style={{ width: '76%', background: 'var(--cyan)' }}></div></div><span className="bar-pct">76%</span></div>
        <div className="bar-row"><span className="bar-label">Product</span><div className="bar-track"><div className="bar-fill" style={{ width: '71%', background: 'var(--purple)' }}></div></div><span className="bar-pct">71%</span></div>
        <div className="bar-row"><span className="bar-label">Marketing</span><div className="bar-track"><div className="bar-fill" style={{ width: '68%', background: 'var(--blue)' }}></div></div><span className="bar-pct">68%</span></div>
        <div className="bar-row"><span className="bar-label">Operations</span><div className="bar-track"><div className="bar-fill" style={{ width: '74%', background: 'var(--yellow)' }}></div></div><span className="bar-pct">74%</span></div>
        <div className="bar-row"><span className="bar-label">Sales</span><div className="bar-track"><div className="bar-fill" style={{ width: '63%', background: 'var(--red)' }}></div></div><span className="bar-pct">63%</span></div>
        <div className="bar-row"><span className="bar-label">HR</span><div className="bar-track"><div className="bar-fill" style={{ width: '80%', background: 'var(--green)' }}></div></div><span className="bar-pct">80%</span></div>
      </div>

      <div className="frame" style={{ marginBottom: 20 }}>
        <div className="sec-title">Monthly Trend — Yes Rate</div>
        <svg width="100%" viewBox="0 0 800 80" style={{ display: 'block' }}>
          <polyline points="0,65 160,58 320,48 480,42 640,36 800,30" style={{ stroke: 'var(--cyan)', strokeWidth: 2, fill: 'none' }}/>
          <circle cx="0" cy="65" r="4" fill="var(--cyan)"/><circle cx="160" cy="58" r="4" fill="var(--cyan)"/><circle cx="320" cy="48" r="4" fill="var(--cyan)"/><circle cx="480" cy="42" r="4" fill="var(--cyan)"/><circle cx="640" cy="36" r="4" fill="var(--cyan)"/><circle cx="800" cy="30" r="4" fill="var(--cyan)"/>
          <text x="0" y="78" fontSize="10" fill="#8c959f">Nov</text><text x="148" y="78" fontSize="10" fill="#8c959f">Dec</text><text x="308" y="78" fontSize="10" fill="#8c959f">Jan</text><text x="462" y="78" fontSize="10" fill="#8c959f">Feb</text><text x="622" y="78" fontSize="10" fill="#8c959f">Mar</text><text x="778" y="78" fontSize="10" fill="#8c959f">Apr</text>
        </svg>
      </div>

      <div className="sec-title">Exceptions & Alerts</div>
      <div className="v-stack" style={{ gap: 8 }}>
        <div className="alert-item alert-warn"><div style={{ color: 'var(--red)', flexShrink: 0 }}>⚠</div><div><strong style={{ color: 'var(--red)' }}>3 employees</strong> have received No results for 3+ consecutive months — flagged for manager follow-up</div></div>
        <div className="alert-item alert-info"><div style={{ color: 'var(--yellow)', flexShrink: 0 }}>○</div><div><strong style={{ color: 'var(--yellow)' }}>14 theme submissions</strong> pending manager validation — cycle closes in 4 days</div></div>
        <div className="alert-item alert-ok"><div style={{ color: 'var(--green)', flexShrink: 0 }}>✓</div><div>Nightly SAP Connect sync completed successfully — 847 employee records current</div></div>
      </div>
    </div>
  );
}

function EvidenceBox({ themeId, evidence, updateEvidence, readonly, onReflectionSubmit }) {
  const WORD_LIMIT = 125;
  const countWords = (text) => text?.trim() ? text.trim().split(/\s+/).length : 0;

  const handleDateUpdate = (field, value) => {
    updateEvidence(themeId, field, value);
  };

  const fields = [
    { key: 'achievements', label: 'KEY ACHIEVEMENTS THIS MONTH', placeholder: 'Describe your main contributions, project outcomes, and delivery highlights...' },
    { key: 'blockers', label: 'CHALLENGES / BLOCKERS', placeholder: 'Any blockers or challenges faced this month...' },
    { key: 'learning', label: 'LEARNING & DEVELOPMENT POINTS', placeholder: 'Skills developed, courses completed, initiatives taken...' }
  ];

  return (
    <div className="evidence-box">
      {!readonly && (
        <div className="h-stack" style={{ gap: 12, marginBottom: 20, padding: '12px', background: 'var(--bg)', borderRadius: 6, border: '1px solid var(--border)' }}>
           <div className="v-stack" style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)' }}>ACTIVITY START</div>
              <input type="date" className="input" value={evidence?.start_date || ""} onChange={(e) => handleDateUpdate('start_date', e.target.value)} />
           </div>
           <div className="v-stack" style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)' }}>ACTIVITY END</div>
              <input type="date" className="input" value={evidence?.end_date || ""} onChange={(e) => handleDateUpdate('end_date', e.target.value)} />
           </div>
        </div>
      )}

      {fields.map(f => (
        <div key={f.key} className="evidence-group" style={f.key === 'learning' ? { marginBottom: 0 } : {}}>
           <div className="evidence-label">
             {f.label}
             {!readonly && (
               <span className={`evidence-counter ${countWords(evidence?.[f.key] || "") >= WORD_LIMIT ? 'limit-hit' : ''}`}>
                 {countWords(evidence?.[f.key] || "")} / {WORD_LIMIT} words
               </span>
             )}
           </div>
           <textarea 
             className={`evidence-input ${readonly ? 'readonly' : ''}`} 
             placeholder={f.placeholder}
             value={evidence?.[f.key] || ""}
             onChange={(e) => {
               if (readonly) return;
               let val = e.target.value;
               if (countWords(val) > WORD_LIMIT) {
                 val = val.trim().split(/\s+/).slice(0, WORD_LIMIT).join(' ');
               }
               updateEvidence(themeId, f.key, val);
             }}
             readOnly={readonly}
             rows={4}
           />
        </div>
      ))}
      {!readonly && (
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
           <button 
             className="btn-primary" 
             style={{ background: 'var(--cyan)', padding: '10px 24px', fontSize: 13, border: 'none' }}
             onClick={() => onReflectionSubmit(themeId)}
           >
             Submit Monthly Subtheme →
           </button>
        </div>
      )}
    </div>
  );
}

// ── EMPLOYEE PORTAL ──
function Employee({ profile, activeUser, showToast }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [themes, setThemes] = useState([]);
  const [rootThemes, setRootThemes] = useState([]); // SATYA'S 5 PILLARS
  const [form, setForm] = useState({ title: "", category: "Delivery Quality", description: "", linked_objective: "", achievement_evidence: "", start_date: "", end_date: "" });
  const [themeEvidence, setThemeEvidence] = useState({}); // { theme_id: { achievements, blockers, learning, start_date, end_date } }
   const [activeSubthemeId, setActiveSubthemeId] = useState(null);
   const [editSubthemeId, setEditSubthemeId] = useState(null);
   const [editThemeId, setEditThemeId] = useState(null);
   const [isPillarPickerOpen, setIsPillarPickerOpen] = useState(false);
  
  // Authority Console States
  const [team, setTeam] = useState([]);
  const [myAssignedThemes, setMyAssignedThemes] = useState([]);
  const [teamThemes, setTeamThemes] = useState([]);
  const [showCreator, setShowCreator] = useState(false);
  const [newDirective, setNewDirective] = useState({ title: "", description: "", category: "Delivery Quality", start_date: "", end_date: "" });

  const countWords = (text) => text?.trim() ? text.trim().split(/\s+/).length : 0;

  useEffect(() => {
    refreshEmployeeDash();
  }, [activeUser]);

  async function refreshEmployeeDash() {
    const { data: allThemes } = await supabase.from('themes').select('*').eq('cycle_id', CYCLE_ID);
    const pillars = allThemes?.filter(t => t.employee_id === SATYA_ID && !t.parent_id) || [];
    setRootThemes(pillars);

    const myThemes = allThemes?.filter(t => {
      const isMine = (t.assigned_to === activeUser || t.employee_id === activeUser);
      const isMyChosenPillar = pillars.some(p => p.id === t.id);
      if (isMine) {
         if (!t.parent_id) return true;
         return t.status !== 'rejected';
      }
      return false;
    }) || [];
    setThemes(myThemes);
    
    const { data: teamData } = await supabase.from('profiles').select('*').eq('manager_id', activeUser);
    const drs = teamData || [];
    setTeam(drs);
    const drIds = new Set(drs.map(d => d.id));
    setTeamThemes(allThemes?.filter(t => drIds.has(t.employee_id) || drIds.has(t.assigned_to)) || []);
  }

  async function handleProposeStrategicTheme() {
    if (!newDirective.title) return;
    const { error } = await supabase.from('themes').insert([{
      title: newDirective.title,
      description: newDirective.description,
      category: newDirective.category,
      employee_id: activeUser,
      assigned_by: activeUser,
      assigned_to: activeUser,
      cycle_id: CYCLE_ID,
      start_date: newDirective.start_date,
      end_date: newDirective.end_date,
      status: 'pending_hr_approval'
    }]);
    if (!error) {
       showToast(`Strategic proposal submitted to HR validation queue`, "var(--purple)");
       setShowCreator(false);
       setNewDirective({ title: "", description: "", category: "Delivery Quality", start_date: "", end_date: "" });
       refreshEmployeeDash();
    } else {
       showToast("Error submitting proposal", "#cf222e");
    }
  }

  async function handleSubmit(e) {
    if (!form.title || !form.description) return showToast("Title and Description required", "#cf222e");
    const { error } = await supabase.from('themes').insert([{
      ...form,
      employee_id: activeUser,
      cycle_id: CYCLE_ID,
      status: 'submitted_to_manager'
    }]);
    if (error) {
      showToast("Error submitting theme", "#cf222e");
    } else {
      showToast("Theme submitted successfully", "var(--green)");
      setIsFormOpen(false);
      setForm({ title: "", category: "Delivery Quality", description: "", linked_objective: "", achievement_evidence: "", start_date: "", end_date: "" });
      refreshEmployeeDash();
    }
  }

  async function handleSubthemeAction(themeId, action) {
    if (action === 'reject') {
      const { error } = await supabase.from('themes').delete().eq('id', themeId);
      if (!error) {
        showToast("Subtheme rejected and removed", "var(--red)");
        refreshEmployeeDash();
      }
    } else {
      const { error } = await supabase.from('themes').update({ status: action === 'approve' ? 'approved' : 'reverted' }).eq('id', themeId);
      if (!error) {
        showToast(action === 'approve' ? "Subtheme approved" : "Subtheme reverted to employee", action === 'approve' ? "var(--green)" : "var(--yellow)");
        refreshEmployeeDash();
      }
    }
  }

  const updateEvidence = (tid, field, val) => {
    setThemeEvidence(prev => ({
      ...prev,
      [tid]: { ...(prev[tid] || {}), [field]: val }
    }));
  };

  async function handleSubthemeSubmit(parentThemeId, formData, existingId = null) {
    if (!formData.title || !formData.description) return showToast("Title and Description required", "#cf222e");
    // Check both local themes and root pillars for the parent metadata
    const parent = themes.find(t => t.id === parentThemeId) || rootThemes.find(rt => rt.id === parentThemeId);
    const themeData = {
      title: formData.title,
      description: formData.description,
      category: parent?.category || "Delivery Quality",
      parent_id: parentThemeId,
      employee_id: activeUser,
      assigned_by: activeUser,
      assigned_to: activeUser,
      cycle_id: CYCLE_ID,
      start_date: formData.start_date,
      end_date: formData.end_date,
      status: 'pending_review'
    };
    let res;
    if (existingId) {
      res = await supabase.from('themes').update(themeData).eq('id', existingId);
    } else {
      res = await supabase.from('themes').insert([themeData]);
    }
    if (!res.error) {
       showToast(existingId ? "Execution item updated" : "Execution item submitted successfully", "var(--green)");
       setActiveSubthemeId(null);
       setEditSubthemeId(null);
       refreshEmployeeDash();
    } else {
       showToast("Error submitting subtheme", "#cf222e");
    }
  }

  async function handleStrategicThemeUpdate(themeId, formData) {
    if (!formData.title || !formData.description) return showToast("Title and Description required", "#cf222e");
    const { error } = await supabase.from('themes').update({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      start_date: formData.start_date,
      end_date: formData.end_date,
      status: 'pending_hr_approval'
    }).eq('id', themeId);
    if (!error) {
       showToast("Strategic proposal updated and resubmitted", "var(--green)");
       setEditThemeId(null);
       refreshEmployeeDash();
    } else {
       showToast("Error updating proposal", "#cf222e");
    }
  }

  return (
    <div className="page">
      <div className="portal-label">○ EMPLOYEE PORTAL</div>
      <div className="page-title">My <span>Monthly Review</span></div>
      <div className="page-sub">{profile?.first_name} {profile?.last_name} · {profile?.job_title}</div>
      
      <div className="emp-profile">
        <div className="emp-left">
          <div className="emp-avatar">{getInitials(profile)}</div>
          <div><div className="emp-name">{profile?.first_name} {profile?.last_name}</div><div className="emp-meta">EMP-{profile?.id?.slice(0,5)} · {profile?.job_title}</div></div>
        </div>
        <div className="emp-right">
          <Badge cls="yellow" dot>In Progress</Badge>
          <div className="v-stack"><div className="period-label-sm">Review Period</div><div className="period-val">APR 2025</div></div>
        </div>
      </div>

      <div className="frame" style={{ borderLeft: '4px solid var(--purple)', background: 'rgba(130,80,223,0.02)' }}>
         <div className="sec-title" style={{ color: 'var(--purple)' }}>Yearly Strategic Pillars</div>
         <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 16 }}>Broadcasted by Direction (Satya) for Year 2025 Alignment.</div>
         <div className="h-stack" style={{ gap: 12, flexWrap: 'wrap' }}>
            {rootThemes.map(p => {
              const isAdopted = themes.some(t => t.parent_id === p.id || t.id === p.id);
              return (
                <div key={p.id} className={`pillar-tag ${isAdopted ? 'active' : ''}`} style={{ 
                  padding: '10px 16px', 
                  background: isAdopted ? 'var(--purple-bg)' : 'var(--bg2)', 
                  border: `1px solid ${isAdopted ? 'var(--purple)' : 'var(--frame-border)'}`,
                  borderRadius: 12,
                  display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700,
                  color: isAdopted ? 'var(--purple)' : 'var(--text3)'
                }}>
                  <span style={{ fontSize: 16 }}>{isAdopted ? '◈' : '◇'}</span>
                  {p.title}
                </div>
              );
            })}
         </div>
      </div>

      {profile?.role !== 'hr' && (
        <div className="frame frame-blue">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
             <div className="sec-title" style={{ margin: 0 }}>My Execution Items — Monthly Update</div>
             {profile?.role === 'manager' && (
               <button className="badge badge-teal" style={{ cursor: 'pointer', border: 'none', padding: '6px 12px' }} onClick={() => setShowCreator(!showCreator)}>
                  {showCreator ? '✕ Cancel' : '+ Propose Strategic Theme'}
               </button>
             )}
          </div>

          {showCreator && (
            <div className="assignment-panel" style={{ border: '1px solid var(--purple)', padding: 16, borderRadius: 8, background: 'rgba(138,43,226,0.02)', marginBottom: 20 }}>
               <div className="v-stack" style={{ gap: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--purple)' }}>STRATEGIC THEME PROPOSAL (AWAITS HR APPROVAL)</div>
                  <input className="input" placeholder="Strategic Goal Title..." value={newDirective.title} onChange={e => setNewDirective({...newDirective, title: e.target.value})} />
                  <textarea className="input" placeholder="Context, objectives, and success criteria..." value={newDirective.description} onChange={e => setNewDirective({...newDirective, description: e.target.value})} style={{ height: 80 }} />
                  <div className="h-stack" style={{ gap: 12 }}>
                     <select className="input" style={{ flex: 1 }} value={newDirective.category} onChange={e => setNewDirective({...newDirective, category: e.target.value})}>
                        <option>Delivery Quality</option>
                        <option>Stakeholder Collaboration</option>
                        <option>Technical Initiative</option>
                        <option>Growth & Innovation</option>
                     </select>
                     <div className="h-stack" style={{ gap: 10, flex: 1 }}>
                        <input type="date" className="input" value={newDirective.start_date} onChange={e => setNewDirective({...newDirective, start_date: e.target.value})} style={{ flex: 1 }} />
                        <input type="date" className="input" value={newDirective.end_date} onChange={e => setNewDirective({...newDirective, end_date: e.target.value})} style={{ flex: 1 }} />
                     </div>
                  </div>
                  <button className="btn-primary" style={{ background: 'var(--purple)', border: 'none' }} disabled={!newDirective.title} onClick={handleProposeStrategicTheme}>
                     Submit Proposal to HR Validation Queue →
                  </button>
               </div>
            </div>
          )}

          <div className="theme-notice">
            <span style={{ color: 'var(--cyan)' }}>ℹ</span> {profile?.role === 'manager' 
              ? "As a manager, you can propose Strategic Themes to HR. For your own review, align your work to Satya's pillars." 
              : "Select a Strategic Pillar to add your monthly execution details (subthemes)."}
          </div>
        
          {/* RENDER ALIGNED THEMES */}
          {rootThemes.filter(rt => themes.some(t => t.parent_id === rt.id || t.id === rt.id)).map(rt => {
            const myExecutionItems = themes.filter(st => st.parent_id === rt.id);
            return (
              <div key={rt.id} className="theme-card" style={{ paddingBottom: 16 }}>
                 <div className="theme-card-header">
                    <div>
                        <div className="theme-card-name" style={{ color: 'var(--purple)', fontSize: 11, letterSpacing: 1, fontWeight: 800 }}>STRATEGIC PILLAR</div>
                        <div className="theme-card-name" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                           {rt.title}
                        </div>
                        <div className="theme-card-cat">Category: {rt.category} · Director Validation Locked</div>
                    </div>
                    <div className="h-stack" style={{ gap: 12 }}>
                       {(rt.status === 'reverted' || rt.status === 'returned') && profile?.role === 'manager' && editThemeId !== rt.id && (
                         <button 
                           className="btn-link" 
                           style={{ color: 'var(--cyan)', fontSize: 11, fontWeight: 700 }}
                           onClick={() => {
                             setEditThemeId(rt.id);
                             setNewDirective({ title: rt.title, description: rt.description, category: rt.category, start_date: rt.start_date, end_date: rt.end_date });
                           }}
                         >
                           ✎ EDIT & RE-SUBMIT
                         </button>
                       )}
                       <Badge cls="green" dot>Active Strategy</Badge>
                    </div>
                 </div>
                 
                 {rt.status === 'reverted' && profile?.role === 'manager' && editThemeId !== rt.id && (
                   <div style={{ fontSize: 11, color: 'var(--yellow)', margin: '8px 0 12px 0', fontWeight: 700 }}>⚠️ HR REQUEST: PLEASE MAKE A CHANGE TO YOUR STRATEGIC PROPOSAL</div>
                 )}

                 {editThemeId === rt.id ? (
                   <div style={{ padding: 16, background: 'var(--bg2)', borderRadius: 8, border: '1px solid var(--purple-bg)', marginBottom: 12 }}>
                      <div className="v-stack" style={{ gap: 12 }}>
                         <input className="input" value={newDirective.title} onChange={e => setNewDirective({...newDirective, title: e.target.value})} placeholder="Theme Title" />
                         <textarea className="input" value={newDirective.description} onChange={e => setNewDirective({...newDirective, description: e.target.value})} style={{ height: 80 }} placeholder="Description" />
                         <div className="h-stack" style={{ gap: 8 }}>
                            <button className="btn-primary" style={{ flex: 1, padding: '8px', background: 'var(--purple)', border: 'none' }} onClick={() => handleStrategicThemeUpdate(rt.id, newDirective)}>Save & Resubmit</button>
                            <button className="btn-outline" style={{ flex: 1, padding: '8px' }} onClick={() => setEditThemeId(null)}>Cancel</button>
                         </div>
                      </div>
                   </div>
                 ) : (
                   <div className="theme-card-desc" style={{ marginBottom: 12 }}>{rt.description}</div>
                 )}
                 
                 {myExecutionItems.length > 0 && (
                   <div className="sub-themes-container" style={{ margin: '12px 0' }}>
                      {myExecutionItems.map(st => {
                        const isReverted = st.status === 'reverted';
                        const isApproved = st.status === 'approved';
                        const isEditing = editSubthemeId === st.id;
                        const date = st.created_at ? new Date(st.created_at) : new Date();
                        const dateStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                        
                        return (
                          <div key={st.id} className={`sub-theme-nested-card ${isReverted ? 'reverted' : ''}`} style={{ borderLeft: isReverted ? '4px solid var(--yellow)' : isApproved ? '4px solid var(--green)' : '' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div className="reflection-title">{st.title}</div>
                                <div className="h-stack" style={{ gap: 8 }}>
                                  <Badge cls={isApproved ? 'green' : isReverted ? 'yellow' : 'blue'} dot>{st.status}</Badge>
                                  {isReverted && !isEditing && (
                                    <button 
                                      className="btn-link" 
                                      style={{ color: 'var(--cyan)', fontSize: 11, fontWeight: 700 }}
                                      onClick={() => {
                                        setEditSubthemeId(st.id);
                                        setNewDirective({ title: st.title, description: st.description, category: st.category, start_date: st.start_date, end_date: st.end_date });
                                      }}
                                    >
                                      ✎ EDIT & RE-SUBMIT
                                    </button>
                                  )}
                                </div>
                              </div>

                              {isReverted && !isEditing && (
                                <div style={{ fontSize: 11, color: 'var(--yellow)', margin: '8px 0', fontWeight: 700 }}>⚠️ MANAGER REQUEST: PLEASE MAKE A CHANGE</div>
                              )}

                              {isEditing ? (
                                <div style={{ marginTop: 12, padding: 12, background: 'var(--bg2)', borderRadius: 8 }}>
                                   <div className="v-stack" style={{ gap: 8 }}>
                                      <input className="input" value={newDirective.title} onChange={e => setNewDirective({...newDirective, title: e.target.value})} placeholder="Title" />
                                      <textarea className="input" value={newDirective.description} onChange={e => setNewDirective({...newDirective, description: e.target.value})} style={{ height: 60 }} placeholder="Description" />
                                      <div className="h-stack" style={{ gap: 8 }}>
                                        <button className="btn-primary" style={{ flex: 1, padding: '6px' }} onClick={() => handleSubthemeSubmit(rt.id, newDirective, st.id)}>Save Changes</button>
                                        <button className="btn-outline" style={{ flex: 1, padding: '6px' }} onClick={() => setEditSubthemeId(null)}>Cancel</button>
                                      </div>
                                   </div>
                                </div>
                              ) : (
                                <div className="reflection-body">{st.description}</div>
                              )}
                              
                              <div className="card-footer-meta">
                                 <span>○ Period: {st.start_date} → {st.end_date}</span>
                                 <span>○ Submitted {dateStr}</span>
                              </div>
                          </div>
                        );
                      })}
                   </div>
                 )}

                  {!activeSubthemeId && profile?.role === 'employee' && myExecutionItems.length === 0 && (
                    <div style={{ marginTop: 16 }}>
                       <button 
                         className="btn-outline" 
                         style={{ color: 'var(--cyan)', borderColor: 'var(--cyan)', fontSize: 12, padding: '6px 12px' }}
                         onClick={() => {
                           setActiveSubthemeId(rt.id);
                           setNewDirective({ title: "", description: "", category: rt.category, start_date: rt.start_date || "", end_date: rt.end_date || "" });
                         }}
                       >
                         + Add Execution Detail
                       </button>
                    </div>
                  )}

                 {activeSubthemeId === rt.id && (
                    <div className="subtheme-form-container" style={{ background: 'rgba(0,178,236,0.02)', padding: 20, borderRadius: 10, border: '1px solid var(--frame-border)', marginBottom: 16 }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                          <div className="period-label-sm" style={{ color: 'var(--cyan)' }}>SUGGESTED EXECUTION ITEM</div>
                          <button style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 13 }} onClick={() => setActiveSubthemeId(null)}>✕ Cancel</button>
                       </div>
                       
                       <div className="v-stack" style={{ gap: 12 }}>
                          <input 
                            className="input" 
                            placeholder="Execution Title (e.g., Sprint 4 Completion...)" 
                            value={newDirective.title} 
                            onChange={e => setNewDirective({...newDirective, title: e.target.value})} 
                          />
                          <textarea 
                            className="input" 
                            placeholder="Detailed notes and outcomes..." 
                            value={newDirective.description} 
                            onChange={e => setNewDirective({...newDirective, description: e.target.value})} 
                            style={{ height: 80 }} 
                          />
                          <div className="h-stack" style={{ gap: 12 }}>
                             <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', marginBottom: 4 }}>CATEGORY (LOCKED)</div>
                                <input className="input readonly" value={rt.category} readOnly />
                             </div>
                             <div className="h-stack" style={{ gap: 10, flex: 1.5 }}>
                                <div style={{ flex: 1 }}>
                                   <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', marginBottom: 4 }}>START</div>
                                   <input type="date" className="input" value={newDirective.start_date} onChange={e => setNewDirective({...newDirective, start_date: e.target.value})} />
                                </div>
                                <div style={{ flex: 1 }}>
                                   <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', marginBottom: 4 }}>END</div>
                                   <input type="date" className="input" value={newDirective.end_date} onChange={e => setNewDirective({...newDirective, end_date: e.target.value})} />
                                </div>
                             </div>
                          </div>
                          <button 
                            className="btn-primary" 
                            style={{ background: 'var(--cyan)', border: 'none', marginTop: 8 }} 
                            onClick={() => handleSubthemeSubmit(rt.id, newDirective)}
                          >
                             Submit Execution Item →
                          </button>
                       </div>
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      )}

      {/* PILLAR SELECTION FOR NEW UPDATES */}
      {rootThemes.filter(rt => !themes.some(t => t.parent_id === rt.id || t.id === rt.id)).length > 0 && (
        <div className="frame" style={{ border: '1px dashed var(--cyan)', background: 'rgba(0,178,236,0.01)' }}>
          <div className="sec-title" style={{ fontSize: 13, color: 'var(--cyan)' }}>Optional: Align to New Strategic Pillar</div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 12 }}>If you have work this month that aligns with a different pillar, pick it below.</div>
          <div className="h-stack" style={{ gap: 8, flexWrap: 'wrap', marginBottom: activeSubthemeId ? 16 : 0 }}>
            {rootThemes.filter(rt => !themes.some(t => t.parent_id === rt.id || t.id === rt.id)).map(p => (
              <button 
                key={p.id} 
                className={`btn-outline ${activeSubthemeId === p.id ? 'active' : ''}`}
                style={{ fontSize: 11, padding: '6px 10px', borderColor: activeSubthemeId === p.id ? 'var(--cyan)' : '' }}
                onClick={() => {
                  setActiveSubthemeId(p.id);
                  setNewDirective({ title: "", description: "", category: p.category, start_date: "", end_date: "" });
                }}
              >
                + Align to {p.title}
              </button>
            ))}
          </div>

          {/* FORM FOR NEW ALIGNMENT */}
          {activeSubthemeId && !themes.some(t => t.id === activeSubthemeId || t.parent_id === activeSubthemeId) && (
            <div className="subtheme-form-container" style={{ background: 'rgba(0,178,236,0.02)', padding: 20, borderRadius: 10, border: '1px solid var(--frame-border)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div className="period-label-sm" style={{ color: 'var(--cyan)' }}>NEW ALIGNMENT: {rootThemes.find(r => r.id === activeSubthemeId)?.title}</div>
                  <button style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 13 }} onClick={() => setActiveSubthemeId(null)}>✕ Cancel</button>
               </div>
               
               <div className="v-stack" style={{ gap: 12 }}>
                  <input 
                    className="input" 
                    placeholder="Execution Title (e.g., Sprint 4 Completion...)" 
                    value={newDirective.title} 
                    onChange={e => setNewDirective({...newDirective, title: e.target.value})} 
                  />
                  <textarea 
                    className="input" 
                    placeholder="Detailed notes and outcomes..." 
                    value={newDirective.description} 
                    onChange={e => setNewDirective({...newDirective, description: e.target.value})} 
                    style={{ height: 80 }} 
                  />
                  <div className="h-stack" style={{ gap: 12 }}>
                     <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', marginBottom: 4 }}>CATEGORY (LOCKED)</div>
                        <input className="input readonly" value={rootThemes.find(r => r.id === activeSubthemeId)?.category} readOnly />
                     </div>
                     <div className="h-stack" style={{ gap: 10, flex: 1.5 }}>
                        <div style={{ flex: 1 }}>
                           <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', marginBottom: 4 }}>START</div>
                           <input type="date" className="input" value={newDirective.start_date} onChange={e => setNewDirective({...newDirective, start_date: e.target.value})} />
                        </div>
                        <div style={{ flex: 1 }}>
                           <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', marginBottom: 4 }}>END</div>
                           <input type="date" className="input" value={newDirective.end_date} onChange={e => setNewDirective({...newDirective, end_date: e.target.value})} />
                        </div>
                     </div>
                  </div>
                  <button 
                    className="btn-primary" 
                    style={{ background: 'var(--cyan)', border: 'none', marginTop: 8 }} 
                    onClick={() => handleSubthemeSubmit(activeSubthemeId, newDirective)}
                  >
                     Submit Execution Item →
                  </button>
               </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION: TEAM ALIGNMENT TRACKER (MANAGERS ONLY - THE AUTHORITY CONSOLE) */}
      {profile?.role === 'manager' && (
        <div className="frame" style={{ borderLeft: '4px solid var(--teal)', marginTop: 24 }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="sec-title" style={{ color: 'var(--teal)', margin: 0 }}>Team Strategic Alignment (Bridge View)</div>
              <Badge cls="purple">L2 Authority</Badge>
           </div>
           <div className="v-stack" style={{ gap: 12, marginTop: 16 }}>
              {team.filter(m => m.id !== activeUser).map(m => {
                const reportsThemes = teamThemes.filter(t => t.employee_id === m.id || t.assigned_to === m.id);
                return (
                  <div key={m.id} style={{ padding: '16px', background: 'var(--bg2)', borderRadius: 12, border: '1px solid var(--frame-border)', marginBottom: 12 }}>
                     <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
                        <div className="emp-avatar" style={{ width: 36, height: 36, fontSize: 11 }}>{getInitials(m)}</div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 14 }}>{m.first_name} {m.last_name}</div>
                          <div style={{ fontSize: 11, opacity: 0.7 }}>{m.job_title}</div>
                        </div>
                     </div>
                     
                     {rootThemes.filter(rt => reportsThemes.some(t => t.parent_id === rt.id)).map(rt => {
                       const sub = reportsThemes.find(st => st.parent_id === rt.id && st.employee_id === m.id);
                       const managerSupplement = reportsThemes.find(st => st.parent_id === rt.id && st.employee_id === activeUser);
                       
                       return (
                         <div key={rt.id} style={{ padding: 12, background: 'rgba(0,0,0,0.1)', borderRadius: 8, marginBottom: 8 }}>
                            <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--purple)', marginBottom: 6 }}>ROOT: {rt.title}</div>
                            
                            <div style={{ display: 'flex', gap: 12 }}>
                               {sub && (
                                 <div style={{ flex: 1, padding: 10, background: 'var(--bg1)', borderRadius: 6, borderLeft: '3px solid var(--cyan)' }}>
                                    <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--cyan)' }}>EMPLOYEE EXECUTION</div>
                                    <div style={{ fontSize: 12, fontWeight: 700 }}>{sub.title}</div>
                                    <div style={{ fontSize: 11, opacity: 0.8, marginTop: 4 }}>{sub.description}</div>
                                 </div>
                               )}
                               
                               <div style={{ flex: 1, padding: 10, background: 'var(--bg1)', borderRadius: 6, borderLeft: '3px solid var(--teal)' }}>
                                  <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--teal)' }}>SUPERIOR STRATEGIC ALIGNMENT</div>
                                  {managerSupplement ? (
                                    <>
                                      <div style={{ fontSize: 12, fontWeight: 700 }}>{managerSupplement.title}</div>
                                      <div style={{ fontSize: 11, opacity: 0.8, marginTop: 4 }}>{managerSupplement.description}</div>
                                    </>
                                  ) : (
                                    <button 
                                      className="btn-link" 
                                      style={{ color: 'var(--teal)', fontSize: 11, fontWeight: 700, marginTop: 8 }}
                                      onClick={() => {
                                        setActiveSubthemeId(rt.id);
                                        setNewDirective({ title: `Verification: ${rt.title}`, description: `Validated execution for ${m.first_name}. Outcomes met core pillars.`, category: rt.category, start_date: "", end_date: "" });
                                      }}
                                    >
                                      + ADD SUPERIOR INPUT
                                    </button>
                                  )}
                               </div>
                            </div>

                            <div className="h-stack" style={{ gap: 10, marginTop: 12, justifyContent: 'flex-end' }}>
                               <button className="btn-outline" style={{ border: 'none', color: 'var(--green)', fontSize: 11 }} onClick={() => handleSubthemeAction(sub?.id, 'approve')}>✓ Verify Branch</button>
                               <button className="btn-primary" style={{ background: 'var(--teal)', border: 'none', fontSize: 11, padding: '4px 10px' }} onClick={() => {
                                 showToast("Branch submitted to Satya (Director) for final validation", "var(--purple)");
                                 refreshEmployeeDash();
                               }}>Package & Submit to Director →</button>
                            </div>
                         </div>
                       );
                     })}
                  </div>
                );
              })}
           </div>
        </div>
      )}

      <div className="frame">
        <div className="sec-title">Supporting Evidence</div>
        <div className="form-group">
          <label className="form-label">Evidence & Proof Points</label>
          <textarea className="input" placeholder="Project outcomes, behavioural examples, quality metrics, recognition instances, specific delivery proof..." style={{ height: 100 }} />
        </div>
      </div>

      <div className="frame" style={{ marginBottom: 24 }}>
        <div className="sec-title">My Review History</div>
        <table className="hist-table">
          <thead>
            <tr>
              <th>Period</th>
              <th>Result</th>
              <th>Themes</th>
              <th>Manager Feedback</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Mar 2025</td><td><Badge cls="green">YES</Badge></td><td><Badge cls="green">3 Approved</Badge></td><td>🔥 Strong delivery, great collaboration this month</td></tr>
            <tr><td>Feb 2025</td><td><Badge cls="green">YES</Badge></td><td><Badge cls="green">2 Approved</Badge></td><td>🔥 Met expectations across all areas</td></tr>
            <tr><td>Jan 2025</td><td><Badge cls="red">NO</Badge></td><td><Badge cls="yellow">1 Returned</Badge></td><td>💡 Please address Q4 carry-over items before next cycle</td></tr>
          </tbody>
        </table>
      </div>

      <div className="action-row" style={{ display: 'flex', gap: 12, marginTop: 24, alignItems: 'center' }}>
        <button className="btn-outline" onClick={() => showToast('💾 Draft saved successfully', 'var(--cyan)')}>💾 Save Draft</button>
        <button className="btn-primary" onClick={() => showToast('✓ Review submitted successfully', 'var(--green)')}>Submit for Review →</button>
      </div>
    </div>
  );
}

// ── MANAGER PORTAL ──
function ManagerPortal({ profile, activeUser, showToast }) {
  const [team, setTeam] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [teamThemes, setTeamThemes] = useState([]); 
  const [activePanel, setActivePanel] = useState(null);
  const [binaryInputs, setBinaryInputs] = useState({ overallResult: true, comment: "" });

  useEffect(() => {
    fetchManagerData();
  }, [activeUser]);

  async function fetchManagerData() {
    const { data: teamData } = await supabase.from('profiles').select('*').eq('manager_id', activeUser);
    setTeam(teamData || []);
    
    if (teamData?.length) {
      const ids = teamData.map(t => t.id);
      const { data: revs } = await supabase.from('monthly_reviews').select('*').in('employee_id', ids).eq('cycle_id', CYCLE_ID);
      setReviews(revs || []);
      const { data: allCycleThemes } = await supabase.from('themes').select('*').eq('cycle_id', CYCLE_ID);
      const idSet = new Set(ids);
      const tThemes = allCycleThemes?.filter(t => 
        idSet.has(t.employee_id) || 
        idSet.has(t.assigned_to) || 
        (t.assigned_to === activeUser && !t.parent_id && t.status === 'approved')
      ) || [];
      setTeamThemes(tThemes);
    }
  }

  async function handleReviewSubmit(employeeId) {
    const overall = binaryInputs.overallResult ? 'YES' : 'NO';
    const { error } = await supabase.from('monthly_reviews').upsert({
      employee_id: employeeId,
      manager_id: activeUser,
      cycle_id: CYCLE_ID,
      overall_result: overall,
      manager_comment: binaryInputs.comment,
      is_draft: false,
      submitted_at: new Date().toISOString()
    }, { onConflict: 'employee_id,cycle_id' });

    if (!error) {
      showToast(`Review submitted successfully`, "var(--green)");
      setActivePanel(null);
      fetchManagerData();
    } else {
      showToast("Error saving review", "var(--red)");
    }
  }

  async function handleThemeAction(themeId, action) {
    if (action === 'reject') {
      const { error } = await supabase.from('themes').delete().eq('id', themeId);
      if (!error) {
        showToast("Theme rejected and removed", "var(--red)");
        fetchManagerData();
      }
    } else {
      const statusMap = { 'approve': 'approved', 'return': 'reverted' };
      const { error } = await supabase.from('themes').update({ status: statusMap[action] }).eq('id', themeId);
      if (!error) {
         showToast(`Theme ${action}d successfully`, action === 'approve' ? "var(--green)" : "var(--yellow)");
         fetchManagerData();
      }
    }
  }

  const completedCount = reviews.length;
  const pendingCount = team.length - completedCount;
  const yesRate = completedCount > 0 ? Math.round((reviews.filter(r => r.overall_result === 'YES').length / completedCount) * 100) : 0;
  const AVATAR_COLORS = ['#008CC8', '#8250df', '#cf222e', '#1a7f37', '#9a6700', '#bc4c00'];

  return (
    <div className="page" style={{ paddingBottom: 60 }}>
      <div className="portal-label">◈ MANAGER PORTAL</div>
      <div className="page-title">Team <span>Reviews</span></div>
      <div className="page-sub">April 2025 · {profile?.first_name} {profile?.last_name} · {team.length} Direct Reports</div>

      <div className="stats-grid" style={{ marginBottom: 32 }}>
        <StatCard cls="blue" label="Direct Reports" val={team.length} valCls="cyan" note="Staff in your team" />
        <StatCard cls={pendingCount > 0 ? "orange" : "blue"} label="Pending Inputs" val={pendingCount} valCls={pendingCount > 0 ? "orange" : "cyan"} note="Requires action" />
        <StatCard cls="blue" label="Completed" val={completedCount} valCls="green" note="For April 2025" />
        <StatCard cls="blue" label="Team YES Rate" val={`${yesRate}%`} valCls="cyan" note="Overall monthly result" />
      </div>

      <div className="frame">
        <div className="sec-title">Team Monthly Inputs — April 2025</div>
        {team.map((m, i) => {
          const review = reviews.find(r => r.employee_id === m.id);
          const themesForUser = teamThemes.filter(t => t.assigned_to === m.id || t.employee_id === m.id);
          return (
            <React.Fragment key={m.id}>
              <div className="member-row" style={{ padding: '16px 24px' }}>
                <div className="member-info">
                  <div className="emp-avatar" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>{getInitials(m)}</div>
                  <div className="v-stack">
                    <div className="member-name">{m.first_name} {m.last_name}</div>
                    <div className="member-role">{m.job_title}</div>
                  </div>
                </div>
                <div className="member-actions">
                   {review ? <Badge cls={review.overall_result === 'YES' ? 'green' : 'red'}>{review.overall_result}</Badge> : <Badge cls="yellow" dot>Pending</Badge>}
                   <button className="badge badge-teal" onClick={() => setActivePanel(activePanel === m.id ? null : m.id)}>
                     {review ? "Edit Inputs →" : "Enter Inputs →"}
                   </button>
                 </div>
              </div>
              {activePanel === m.id && (
                <div className="binary-panel">
                    <div className="binary-panel-header">
                       <div className="h-stack" style={{ gap: 12 }}>
                         <div className="emp-avatar">{getInitials(m)}</div>
                         <div className="v-stack">
                           <div className="member-name">{m.first_name} {m.last_name}</div>
                           <div className="member-role">{m.job_title} · April 2025</div>
                         </div>
                       </div>
                       <button className="badge badge-gray" onClick={() => setActivePanel(null)}>✕ Close</button>
                    </div>
                    <div className="dropdown-section" style={{ marginTop: 16 }}>
                      <div className="stat-label" style={{ color: 'var(--cyan)', marginBottom: 12 }}>CONNECTED THEMES & EXECUTION DETAILS</div>
                      {themesForUser.filter(t => !t.parent_id).map(pt => {
                        const sub = themesForUser.find(st => st.parent_id === pt.id);
                        return (
                          <details key={pt.id} style={{ background: 'var(--bg2)', padding: '10px 16px', borderRadius: 8, marginBottom: 10, border: '1px solid var(--frame-border)' }}>
                            <summary style={{ cursor: 'pointer', fontWeight: 700, fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                               <span>{pt.title}</span>
                               <Badge cls={sub ? 'green' : 'yellow'}>{sub ? '✓ Executed' : '○ Pending'}</Badge>
                            </summary>
                            <div style={{ marginTop: 12, paddingLeft: 12, borderLeft: '2px solid var(--cyan)' }}>
                               <div style={{ fontSize: 12 }}>{pt.description}</div>
                               {sub && (
                                 <div style={{ marginTop: 8 }}>
                                   <div style={{ fontSize: 12, fontWeight: 700 }}>{sub.title}</div>
                                   <div style={{ fontSize: 12, fontStyle: 'italic' }}>{sub.description}</div>
                                 </div>
                               )}
                            </div>
                          </details>
                        );
                      })}
                    </div>
                    <div className="single-input-row" style={{ marginTop: 24, padding: '20px', background: 'var(--bg2)', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <div><div style={{ fontSize: 14, fontWeight: 700 }}>Monthly Achievement</div></div>
                       <div className="binary-btns">
                          <button className={`btn-binary ${binaryInputs.overallResult ? 'active-yes' : ''}`} onClick={() => setBinaryInputs({...binaryInputs, overallResult: true})}>👍 YES</button>
                          <button className={`btn-binary ${binaryInputs.overallResult === false ? 'active-no' : ''}`} onClick={() => setBinaryInputs({...binaryInputs, overallResult: false})}>👎 NO</button>
                       </div>
                    </div>
                    <div className="form-group" style={{ marginTop: 24 }}>
                       <label className="form-label">MANAGER SUMMARY & FEEDBACK</label>
                       <textarea className="input" style={{ height: 120 }} value={binaryInputs.comment} onChange={e => setBinaryInputs({...binaryInputs, comment: e.target.value})} />
                    </div>
                    <div className="h-stack" style={{ gap: 12, marginTop: 20 }}><button className="btn-primary" onClick={() => handleReviewSubmit(m.id)}>Submit Inputs →</button></div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="frame" style={{ border: '1px solid var(--orange)', background: 'rgba(188,76,0,0.02)', marginTop: 24 }}>
        <div className="sec-title" style={{ color: 'var(--orange)' }}>Theme Validations Pending</div>
        <div className="v-stack" style={{ gap: 12 }}>
          {teamThemes.filter(t => t.status === 'pending_review' || t.status === 'pending_hr_approval').length > 0 ? (
            teamThemes.filter(t => t.status === 'pending_review' || t.status === 'pending_hr_approval').map(t => (
               <div key={t.id} className="validation-card">
                <div className="validation-info">
                   <div className="validation-title">{t.title}</div>
                   <div className="validation-meta">{team.find(e => e.id === t.assigned_to)?.first_name} · {t.category}</div>
                </div>
                <div className="validation-actions">
                   <button className="badge badge-green" onClick={() => handleThemeAction(t.id, 'approve')}>✓ Approve</button>
                   <button className="badge badge-yellow" onClick={() => handleThemeAction(t.id, 'return')}>↩ Return</button>
                </div>
              </div>
            ))
          ) : <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>○ No pending theme validations.</div>}
        </div>
      </div>
    </div>
  );
}

// ── DIRECTOR PORTAL (SATYA L3) ──
function DirectorPortal({ profile, activeUser, showToast }) {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDirectorData();
  }, [activeUser]);

  async function fetchDirectorData() {
    setLoading(true);
    // 1. Fetch the Managers reporting to this Director
    const { data: managers } = await supabase.from('profiles').select('*').eq('manager_id', activeUser);
    
    // 2. Fetch all themes in the organization for this cycle
    const { data: allThemes } = await supabase.from('themes').select('*, profiles(first_name, last_name)').eq('cycle_id', CYCLE_ID);
    
    // 3. Fetch the 5 Root Pillars (Strategic Portfolio)
    const { data: pillars } = await supabase.from('themes').select('*').is('parent_id', null).eq('cycle_id', CYCLE_ID);
    setGovernancePillars(pillars || []);

    const branchData = managers?.map(m => {
      // Find themes specifically for this manager's branch
      const managerThemes = allThemes?.filter(t => t.employee_id === m.id || t.assigned_to === m.id || t.parent_id === m.id) || [];
      return { manager: m, themes: managerThemes };
    }) || [];
    
    setBranches(branchData);
    setLoading(false);
  }

  const [governancePillars, setGovernancePillars] = useState([]);

  return (
    <div className="page">
      <div className="portal-label">◈ DIRECTORATE DASHBOARD</div>
      <div className="page-title">Yearly Strategic <span>Governance</span></div>
      <div className="page-sub">Root Manager: {profile?.first_name} {profile?.last_name}</div>
      
      <div className="frame" style={{ background: 'rgba(0,178,236,0.02)', borderLeft: '4px solid var(--cyan)' }}>
         <div className="sec-title" style={{ color: 'var(--cyan)' }}>Yearly Strategic Pillars Portfolio</div>
         <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 16 }}>These 5 core pillars are broadcasted as the organizational strategy for Year 2025.</div>
         <div className="h-stack" style={{ gap: 10, flexWrap: 'wrap' }}>
            {governancePillars.map(p => (
              <div key={p.id} className="pillar-tag active" style={{ padding: '8px 12px', background: 'var(--bg2)', border: '1px solid var(--cyan)', borderRadius: 8, fontSize: 12, color: 'var(--cyan)' }}>
                ◈ {p.title}
              </div>
            ))}
         </div>
      </div>

      <div className="frame">
        <div className="sec-title">Organizational Alignment Tree</div>
        {loading ? <div style={{ padding: 40, textAlign: 'center' }}>Synchronizing...</div> : (
          <div className="v-stack" style={{ gap: 20, marginTop: 16 }}>
             {branches.length === 0 && (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)', border: '1px dashed var(--frame-border)', borderRadius: 12 }}>
                   ○ No management branches linked to your profile yet.
                </div>
             )}
             {branches.map(b => (
               <div key={b.manager.id} className="branch-card" style={{ padding: 20, background: 'var(--bg2)', borderRadius: 12, border: '1px solid var(--frame-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                     <div className="h-stack" style={{ gap: 12 }}>
                        <div className="avatar" style={{ background: 'var(--purple)', width: 44, height: 44 }}>{getInitials(b.manager)}</div>
                        <div>
                          <div style={{ fontWeight: 800 }}>{b.manager.first_name} {b.manager.last_name}</div>
                          <div style={{ fontSize: 11, opacity: 0.6 }}>Branch Manager</div>
                        </div>
                     </div>
                     <button className="btn-primary" onClick={() => showToast(`Alignment for ${b.manager.first_name} validated`, "var(--green)")}>Validate Output →</button>
                  </div>
                  <div className="v-stack" style={{ gap: 12 }}>
                     {b.themes.filter(t => !t.parent_id).map(pt => (
                       <div key={pt.id} style={{ padding: 16, background: 'rgba(0,0,0,0.1)', borderRadius: 8 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--cyan)' }}>PILLAR: {pt.title}</div>
                          <div className="v-stack" style={{ gap: 8, marginTop: 12 }}>
                             {b.themes.filter(st => st.parent_id === pt.id).map(st => (
                               <div key={st.id} style={{ padding: 10, background: 'var(--bg1)', display: 'flex', justifyContent: 'space-between' }}>
                                  <div style={{ fontSize: 12 }}>{st.title}</div>
                                  <Badge cls={st.status === 'approved' ? 'green' : 'yellow'}>{st.status}</Badge>
                               </div>
                             ))}
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── HR DASHBOARD ──
function HRDashboard({ profile, activeUser, showToast }) {
  const [allProfilesCount, setAllProfilesCount] = useState(0);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [yesOutcomeCount, setYesOutcomeCount] = useState(0);
  const [cycleThemes, setCycleThemes] = useState([]);
  const [managers, setManagers] = useState([]);

  const completionRate = allProfilesCount > 0 ? Math.round((submissionCount / allProfilesCount) * 100) : 0;
  const overallYesRate = submissionCount > 0 ? Math.round((yesOutcomeCount / submissionCount) * 100) : 0;
  const pendingHR = cycleThemes.filter(t => !t.parent_id && t.status === 'pending_hr_approval').length;

  useEffect(() => {
    fetchHRData();
  }, []);

  async function fetchHRData() {
    const { data: mgrs } = await supabase.from('profiles').select('*').eq('role', 'manager');
    setManagers(mgrs || []);
    const { count: empCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    setAllProfilesCount(empCount || 0);
    const { data: cycleReviews } = await supabase.from('monthly_reviews').select('overall_result').eq('cycle_id', CYCLE_ID);
    setSubmissionCount(cycleReviews?.length || 0);
    setYesOutcomeCount(cycleReviews?.filter(r => r.overall_result === 'YES').length || 0);
    const { data: themes } = await supabase.from('themes').select('*').eq('cycle_id', CYCLE_ID);
    setCycleThemes(themes || []);
  }

  async function handleHRAction(themeId, action) {
    const { error } = await supabase.from('themes').update({ status: action === 'approve' ? 'approved' : 'reverted' }).eq('id', themeId);
    if (!error) {
       showToast(`Action successful`, "var(--green)");
       fetchHRData();
    }
  }

  return (
    <div className="page">
      <div className="portal-label">◆ HR DASHBOARD</div>
      <div className="page-title">Organisation <span>Analytics</span></div>
      <div className="stats-grid" style={{ marginBottom: 32 }}>
        <StatCard cls="blue" label="ACTIVE EMPLOYEES" val={allProfilesCount} note="Database sync" />
        <StatCard cls="blue" label="COMPLETION" val={`${completionRate}%`} note="Submitted reviews" />
        <StatCard cls="blue" label="YES RATE" val={`${overallYesRate}%`} note="Positive outcomes" />
        <StatCard cls="orange" label="HR PENDING" val={pendingHR} note="Awaiting validation" />
      </div>
      <div className="frame">
        <div className="sec-title">Manager Requests</div>
        {cycleThemes.filter(t => !t.parent_id && t.status === 'pending_hr_approval').map(t => (
          <div key={t.id} className="theme-card">
            <div className="theme-card-header">
               <div><div className="theme-card-name">{t.title}</div></div>
               <div className="h-stack" style={{ gap: 12 }}>
                  <button className="badge badge-green" onClick={() => handleHRAction(t.id, 'approve')}>✓ Approve</button>
                  <button className="badge badge-yellow" onClick={() => handleHRAction(t.id, 'revert')}>↩ Return</button>
               </div>
            </div>
            <div className="theme-card-desc">{t.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MAIN APPLICATION ──
export default function App() {
  const [page, setPage] = useState("employee");
  const [profile, setProfile] = useState(null);
  const [toast, setToast] = useState({ show: false, msg: "", color: "" });
  const navigate = useNavigate();
  const timerRef = useRef();

  useEffect(() => {
    async function initSession() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/");
      } else {
        const { data: profileData } = await supabase.from('profiles').select('*').eq('auth_email', user.email).single();
        setProfile(profileData);
        if (profileData?.role === 'manager') setPage("employee");
        else if (profileData?.role === 'hr') setPage("hr");
        else setPage("employee");
      }
    }
    initSession();
  }, [navigate]);

  function showToast(msg, color) {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ show: true, msg, color });
    timerRef.current = setTimeout(() => setToast({ show: false, msg: "", color: "" }), 3000);
  }

  const TABS = [
    ["employee", "○ My Reviews"],
    profile?.role === 'manager' || profile?.role === 'hr' ? ["manager", "◈ Manager"] : null,
    !profile?.manager_id ? ["director", "◈ Director Dashboard"] : null,
    profile?.role === 'hr' ? ["hr", "◆ HR Dashboard"] : null,
    ["reports", "◈ Reports"]
  ].filter(Boolean);

  return (
    <div className="pr-wrap">
      <nav className="nav">
        <div className="nav-logo"><span>PulseReview</span></div>
        <div className="nav-tabs">
          {TABS.map(([id, label]) => (
            <button key={id} className={`nav-tab ${page === id ? "active" : ""}`} onClick={() => setPage(id)}>{label}</button>
          ))}
        </div>
        <div className="nav-right">
          <div className="nav-user">{profile?.first_name} <div className="avatar">{getInitials(profile)}</div></div>
          <button className="badge badge-red" onClick={() => supabase.auth.signOut().then(() => navigate("/"))}>Logout</button>
        </div>
      </nav>
      {page === "employee" && <Employee profile={profile} activeUser={profile?.id} showToast={showToast} />}
      {page === "manager" && <ManagerPortal profile={profile} activeUser={profile?.id} showToast={showToast} />}
      {page === "director" && <DirectorPortal profile={profile} activeUser={profile?.id} showToast={showToast} />}
      {page === "hr" && <HRDashboard profile={profile} activeUser={profile?.id} showToast={showToast} />}
      {page === "reports" && <Reports profile={profile} activeUser={profile?.id} showToast={showToast} />}
      <Toast {...toast} />
    </div>
  );
}

// ── REPORTS PORTAL ──
function Reports({ profile, activeUser, showToast }) {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      setLoading(true);
      let targetProfiles = [];
      if (profile?.role === 'manager') {
        const { data } = await supabase.from('profiles').select('*').eq('manager_id', activeUser);
        targetProfiles = data || [];
      } else {
        const { data } = await supabase.from('profiles').select('*');
        targetProfiles = data || [];
      }
      const reportIds = targetProfiles.map(p => p.id);
      if (reportIds.length > 0) {
        const { data: approvedThemes } = await supabase.from('themes').select('*').in('employee_id', reportIds).eq('status', 'approved');
        const { data: reviews } = await supabase.from('monthly_reviews').select('*').in('employee_id', reportIds).eq('cycle_id', CYCLE_ID);
        const finalData = targetProfiles.map(p => {
          const empThemes = approvedThemes?.filter(t => t.employee_id === p.id).map(t => t.title) || [];
          const review = reviews?.find(r => r.employee_id === p.id);
          return { id: p.id, name: `${p.first_name} ${p.last_name}`, themes: empThemes, outcome: review?.overall_result || 'PENDING' };
        });
        setReportData(finalData);
      }
      setLoading(false);
    }
    fetchReports();
  }, [activeUser, profile]);

  return (
    <div className="page">
      <div className="portal-label">◈ GOVERNANCE REPORTING</div>
      <div className="page-title">Monthly <span>Performance Reports</span></div>
      <div className="report-table-frame">
        <table className="report-table">
          <thead><tr><th>Employee</th><th>Themes</th><th>Outcome</th></tr></thead>
          <tbody>
            {reportData.map(d => (
              <tr key={d.id}>
                <td>{d.name}</td>
                <td>{d.themes.join(', ')}</td>
                <td><Badge cls={d.outcome === 'YES' ? 'green' : 'red'}>{d.outcome}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
