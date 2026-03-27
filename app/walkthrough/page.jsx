'use client';
import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/Layout/AppLayout';

const MOCK_PATIENTS = [
  { id: 'p1', name: 'Alice Johnson', priority: 'urgent', waitDays: 7, avatar: 'A', color: '#ef4444' },
  { id: 'p2', name: 'David Kim',     priority: 'urgent', waitDays: 5, avatar: 'D', color: '#ef4444' },
  { id: 'p3', name: 'Robert Chen',   priority: 'high',   waitDays: 6, avatar: 'R', color: '#f97316' },
  { id: 'p4', name: 'Kevin Patel',   priority: 'high',   waitDays: 3, avatar: 'K', color: '#f97316' },
  { id: 'p5', name: 'Maria Garcia',  priority: 'medium', waitDays: 4, avatar: 'M', color: '#eab308' },
  { id: 'p6', name: 'Linda Martinez',priority: 'low',    waitDays: 1, avatar: 'L', color: '#22c55e' },
];

const PRIORITY_WEIGHT = { urgent: 4, high: 3, medium: 2, low: 1 };
const PRIORITY_COLORS = { urgent: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e' };
const PRIORITY_BG = { urgent: '#fef2f2', high: '#fff7ed', medium: '#fefce8', low: '#f0fdf4' };

const MOCK_DOCTORS = [
  { id: 'd1', name: 'Dr. Sarah Mitchell', spec: 'Cardiologist',   color: '#4f46e5', initial: 'S' },
  { id: 'd2', name: 'Dr. James Thornton', spec: 'Gen. Physician', color: '#06b6d4', initial: 'J' },
  { id: 'd3', name: 'Dr. Priya Sharma',   spec: 'Neurologist',    color: '#a855f7', initial: 'P' },
];

const SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30'];

function computeScore(patient) {
  return PRIORITY_WEIGHT[patient.priority] * 10 + Math.min(patient.waitDays, 7);
}

const scoredAndSorted = [...MOCK_PATIENTS]
  .map((p) => ({ ...p, score: computeScore(p) }))
  .sort((a, b) => b.score - a.score);

const FINAL_ASSIGNMENTS = scoredAndSorted.map((patient, index) => {
  const doctorIndex = index % MOCK_DOCTORS.length;
  const slotIndex = Math.floor(index / MOCK_DOCTORS.length);
  return {
    ...patient,
    doctor: MOCK_DOCTORS[doctorIndex],
    slot: SLOTS[slotIndex] || null,
  };
});

const STEPS = [
  {
    id: 1,
    title: 'Patients arrive with different urgencies',
    subtitle: 'Each patient has a priority level — from urgent emergencies to routine check-ups.',
    hint: 'Notice how they arrive in random order. The system needs to figure out who gets seen first.',
  },
  {
    id: 2,
    title: 'Calculate an urgency score for each patient',
    subtitle: 'Formula: (Priority Weight × 10) + Wait Days Bonus (capped at 7)',
    hint: 'Urgent = 4×10 = 40 base. A patient waiting 7 days gets +7. Max possible score: 47.',
  },
  {
    id: 3,
    title: 'Sort patients — highest score first',
    subtitle: 'The queue is now re-ordered so critical patients always get assigned before lower-priority ones.',
    hint: 'This guarantees: even a brand-new urgent case (score 40) beats any high-priority case (max 37).',
  },
  {
    id: 4,
    title: 'Generate available time slots per doctor',
    subtitle: 'Each doctor has 30-minute slots from 09:00–17:00. Already-booked slots are removed.',
    hint: 'Slots are shared across doctors. The algorithm picks the earliest free slot for each patient.',
  },
  {
    id: 5,
    title: 'Greedily assign — highest priority gets earliest slot',
    subtitle: 'Walk down the sorted queue. Each patient gets the first available slot from the first eligible doctor.',
    hint: 'This is the "greedy" step — always take the earliest free slot. No backtracking needed.',
  },
  {
    id: 6,
    title: 'Done — optimised schedule produced',
    subtitle: 'Every patient is assigned. Urgent cases locked in the earliest slots. Zero double-bookings.',
    hint: 'The whole process runs in milliseconds — O(R log R + R × D × S) time complexity.',
  },
];

function Avatar({ initial, color, size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, ${color}, ${color}cc)`,
      color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, fontSize: size * 0.38, flexShrink: 0,
      boxShadow: `0 2px 8px ${color}44`,
    }}>{initial}</div>
  );
}

function PriorityBadge({ priority }) {
  return (
    <span style={{
      padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
      background: PRIORITY_BG[priority], color: PRIORITY_COLORS[priority],
      border: `1px solid ${PRIORITY_COLORS[priority]}33`, textTransform: 'capitalize',
    }}>{priority}</span>
  );
}

function Arrow({ direction = 'down', animated = false, color = '#4f46e5' }) {
  const style = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color, fontSize: 20,
    animation: animated ? 'pulse-arrow 1.2s ease-in-out infinite' : 'none',
  };
  const arrows = { down: '↓', right: '→', left: '←' };
  return <div style={style}>{arrows[direction] || '↓'}</div>;
}

function FlowArrow({ label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, margin: '4px 0' }}>
      <div style={{ width: 2, height: 20, background: 'linear-gradient(#4f46e5, #818cf8)', borderRadius: 1 }} />
      <div style={{
        width: 0, height: 0,
        borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
        borderTop: '8px solid #818cf8',
      }} />
      {label && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{label}</div>}
    </div>
  );
}

function StepIndicator({ total, current, onGoTo }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
      {Array.from({ length: total }).map((_, index) => (
        <button
          key={index}
          onClick={() => onGoTo(index + 1)}
          style={{
            width: current === index + 1 ? 32 : 10,
            height: 10, borderRadius: 5, border: 'none', cursor: 'pointer',
            background: current === index + 1 ? '#4f46e5' : current > index + 1 ? '#818cf8' : '#e2e8f0',
            transition: 'all 0.3s ease',
            padding: 0,
          }}
        />
      ))}
    </div>
  );
}

function PatientCard({ patient, showScore = false, rank = null, animateIn = false, delay = 0 }) {
  const score = computeScore(patient);
  return (
    <div style={{
      background: 'white', border: `2px solid ${patient.color}22`,
      borderRadius: 12, padding: '12px 14px',
      display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      animation: animateIn ? `slideIn 0.4s ease ${delay}s both` : 'none',
      position: 'relative',
    }}>
      {rank !== null && (
        <div style={{
          position: 'absolute', top: -8, left: -8,
          width: 22, height: 22, borderRadius: '50%', fontSize: 11, fontWeight: 800,
          background: rank === 0 ? '#fbbf24' : rank === 1 ? '#94a3b8' : rank === 2 ? '#cd7f32' : '#e2e8f0',
          color: rank < 3 ? 'white' : '#64748b',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{rank + 1}</div>
      )}
      <Avatar initial={patient.avatar} color={patient.color} size={34} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{patient.name}</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 3, alignItems: 'center', flexWrap: 'wrap' }}>
          <PriorityBadge priority={patient.priority} />
          <span style={{ fontSize: 11, color: '#94a3b8' }}>{patient.waitDays}d wait</span>
        </div>
      </div>
      {showScore && (
        <div style={{
          background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
          color: 'white', borderRadius: 8, padding: '4px 10px',
          fontWeight: 800, fontSize: 15, flexShrink: 0,
        }}>{score}</div>
      )}
    </div>
  );
}

function ScoreBreakdown({ patient }) {
  const weight = PRIORITY_WEIGHT[patient.priority];
  const waitBonus = Math.min(patient.waitDays, 7);
  const score = weight * 10 + waitBonus;
  return (
    <div style={{
      background: '#f8fafc', borderRadius: 12, padding: 14, border: '1px solid #e2e8f0',
      animation: 'fadeIn 0.5s ease both',
    }}>
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Avatar initial={patient.avatar} color={patient.color} size={26} />
        {patient.name}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', fontSize: 13 }}>
        <div style={{ background: PRIORITY_BG[patient.priority], border: `1px solid ${PRIORITY_COLORS[patient.priority]}33`, borderRadius: 6, padding: '3px 10px', fontWeight: 700, color: PRIORITY_COLORS[patient.priority] }}>
          {patient.priority} = {weight}
        </div>
        <span style={{ color: '#94a3b8' }}>×10</span>
        <span style={{ color: '#64748b', fontWeight: 600 }}>= {weight * 10}</span>
        <span style={{ color: '#94a3b8' }}>+</span>
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6, padding: '3px 10px', fontWeight: 700, color: '#3b82f6' }}>
          wait {waitBonus}
        </div>
        <span style={{ color: '#94a3b8' }}>=</span>
        <div style={{ background: 'linear-gradient(135deg, #4f46e5, #818cf8)', borderRadius: 8, padding: '3px 12px', fontWeight: 800, color: 'white', fontSize: 15 }}>
          {score}
        </div>
      </div>
    </div>
  );
}

function SlotGrid({ assignedUpTo = 0 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {MOCK_DOCTORS.map((doctor, doctorIndex) => (
        <div key={doctor.id} style={{ background: 'white', borderRadius: 12, padding: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Avatar initial={doctor.initial} color={doctor.color} size={28} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 12 }}>{doctor.name}</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>{doctor.spec}</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {SLOTS.map((slot, slotIndex) => {
              const assignmentIndex = doctorIndex + slotIndex * MOCK_DOCTORS.length;
              const isAssigned = assignedUpTo > assignmentIndex;
              const assignment = isAssigned ? FINAL_ASSIGNMENTS[assignmentIndex] : null;
              return (
                <div
                  key={slot}
                  title={assignment ? assignment.name : slot}
                  style={{
                    padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                    background: isAssigned ? doctor.color : '#f1f5f9',
                    color: isAssigned ? 'white' : '#94a3b8',
                    border: `1px solid ${isAssigned ? doctor.color : '#e2e8f0'}`,
                    transition: 'all 0.4s ease',
                    cursor: 'default',
                    minWidth: 52, textAlign: 'center',
                    animation: isAssigned ? 'popIn 0.3s ease both' : 'none',
                  }}
                >
                  {isAssigned ? assignment.avatar : slot}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function FinalAssignmentCard({ assignment, delay = 0 }) {
  return (
    <div style={{
      background: 'white', border: `2px solid ${assignment.doctor.color}33`,
      borderRadius: 12, padding: '12px 14px',
      display: 'flex', alignItems: 'center', gap: 10,
      animation: `slideIn 0.4s ease ${delay}s both`,
      boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    }}>
      <Avatar initial={assignment.avatar} color={assignment.color} size={34} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 13 }}>{assignment.name}</div>
        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Score: <b style={{ color: '#4f46e5' }}>{assignment.score}</b> · <PriorityBadge priority={assignment.priority} /></div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 11, color: '#94a3b8' }}>→</div>
        <Avatar initial={assignment.doctor.initial} color={assignment.doctor.color} size={28} />
        <div style={{ fontSize: 10, color: assignment.doctor.color, fontWeight: 700, marginTop: 2 }}>{assignment.slot}</div>
      </div>
    </div>
  );
}

export default function WalkthroughPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [slotAssigned, setSlotAssigned] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);

  useEffect(() => {
    if (currentStep === 4) setSlotAssigned(0);
    if (currentStep === 5) {
      let count = 0;
      const interval = setInterval(() => {
        count++;
        setSlotAssigned(count);
        if (count >= FINAL_ASSIGNMENTS.length) clearInterval(interval);
      }, 350);
      return () => clearInterval(interval);
    }
  }, [currentStep]);

  useEffect(() => {
    if (!autoPlay) return;
    if (currentStep >= STEPS.length) { setAutoPlay(false); return; }
    const timeout = setTimeout(() => setCurrentStep((s) => s + 1), 2800);
    return () => clearTimeout(timeout);
  }, [autoPlay, currentStep]);

  const goNext = () => currentStep < STEPS.length && setCurrentStep((s) => s + 1);
  const goPrev = () => currentStep > 1 && setCurrentStep((s) => s - 1);

  const step = STEPS[currentStep - 1];

  return (
    <AppLayout>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes popIn {
          0%   { transform: scale(0.6); opacity: 0; }
          70%  { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse-arrow {
          0%, 100% { opacity: 1; transform: translateY(0); }
          50%       { opacity: 0.5; transform: translateY(4px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .nav-btn {
          padding: 10px 24px; border-radius: 10px; font-weight: 700; font-size: 14px;
          cursor: pointer; border: none; transition: all 0.2s;
        }
        .nav-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(79,70,229,0.3); }
        .nav-btn:active { transform: translateY(0); }
      `}</style>

      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 10,
            background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
            padding: '6px 16px', borderRadius: 999,
          }}>
            <span style={{ fontSize: 16 }}>✨</span>
            <span style={{ fontWeight: 700, color: '#6d28d9', fontSize: 13 }}>Interactive Walkthrough</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', margin: '0 0 6px' }}>How Smart Scheduling Works</h1>
          <p style={{ fontSize: 15, color: '#64748b' }}>Step through the algorithm one piece at a time</p>
        </div>

        <StepIndicator total={STEPS.length} current={currentStep} onGoTo={setCurrentStep} />

        <div style={{
          background: 'white', borderRadius: 20, border: '1px solid #e2e8f0',
          boxShadow: '0 4px 24px rgba(0,0,0,0.07)', overflow: 'hidden', marginBottom: 20,
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            padding: '20px 28px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, fontSize: 20, color: 'white', flexShrink: 0,
              }}>{currentStep}</div>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Step {currentStep} of {STEPS.length}
                </div>
                <div style={{ color: 'white', fontWeight: 800, fontSize: 18, lineHeight: 1.3 }}>{step.title}</div>
              </div>
            </div>
            <div style={{ marginTop: 10, color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>{step.subtitle}</div>
          </div>

          <div style={{ padding: '24px 28px', minHeight: 400 }}>
            {currentStep === 1 && (
              <div>
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16, fontWeight: 500 }}>
                  6 patients arrive — in no particular order
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
                  {MOCK_PATIENTS.map((patient, index) => (
                    <PatientCard key={patient.id} patient={patient} animateIn delay={index * 0.1} />
                  ))}
                </div>
                <div style={{ marginTop: 24, padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Priority Levels</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {[
                      { level: 'urgent', weight: 4, example: 'Chest pain, acute conditions' },
                      { level: 'high',   weight: 3, example: 'Worsening chronic illness' },
                      { level: 'medium', weight: 2, example: 'Follow-up visits' },
                      { level: 'low',    weight: 1, example: 'Routine check-ups' },
                    ].map((item) => (
                      <div key={item.level} style={{ background: PRIORITY_BG[item.level], border: `1px solid ${PRIORITY_COLORS[item.level]}33`, borderRadius: 8, padding: '8px 12px', minWidth: 170 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          <span style={{ fontWeight: 700, textTransform: 'capitalize', color: PRIORITY_COLORS[item.level] }}>{item.level}</span>
                          <span style={{ fontSize: 11, color: '#94a3b8' }}>weight = {item.weight}</span>
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{item.example}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <div style={{ background: 'linear-gradient(135deg, #eff6ff, #f5f3ff)', borderRadius: 12, padding: '14px 18px', marginBottom: 20, border: '1px solid #ddd6fe' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#4f46e5', fontFamily: 'monospace' }}>
                    score = (priority_weight × 10) + min(wait_days, 7)
                  </div>
                  <div style={{ fontSize: 12, color: '#6d28d9', marginTop: 4 }}>
                    The ×10 multiplier ensures urgent always beats high, regardless of wait time.
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
                  {MOCK_PATIENTS.map((patient, index) => (
                    <div key={patient.id} style={{ animation: `fadeIn 0.4s ease ${index * 0.12}s both` }}>
                      <ScoreBreakdown patient={patient} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                      Before — random order
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {MOCK_PATIENTS.map((patient, index) => (
                        <PatientCard key={patient.id} patient={patient} showScore animateIn delay={index * 0.08} />
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 40, gap: 6 }}>
                    <div style={{ width: 2, height: 30, background: '#e2e8f0', borderRadius: 1 }} />
                    <div style={{
                      background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                      color: 'white', borderRadius: 12, padding: '8px 14px',
                      fontSize: 13, fontWeight: 700, textAlign: 'center', whiteSpace: 'nowrap',
                      boxShadow: '0 4px 14px rgba(79,70,229,0.4)',
                      animation: 'float 2s ease-in-out infinite',
                    }}>
                      Sort ↓<br /><span style={{ fontSize: 11, fontWeight: 500, opacity: 0.85 }}>O(R log R)</span>
                    </div>
                    <div style={{ width: 2, height: 30, background: '#e2e8f0', borderRadius: 1 }} />
                    <div style={{ width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '10px solid #4f46e5' }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 220 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                      After — sorted by score
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {scoredAndSorted.map((patient, index) => (
                        <PatientCard key={patient.id} patient={patient} showScore rank={index} animateIn delay={index * 0.1} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div>
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
                  Each doctor gets <b>10 visible slots</b> (09:00–13:30 shown). Slots already booked are removed. The rest are free to assign.
                </div>
                <SlotGrid assignedUpTo={0} />
                <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {MOCK_DOCTORS.map((doctor) => (
                    <div key={doctor.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                      <div style={{ width: 12, height: 12, borderRadius: 3, background: doctor.color }} />
                      <span style={{ color: '#64748b' }}>{doctor.name.split(' ')[1]} {doctor.name.split(' ')[2]}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: '#f1f5f9', border: '1px solid #e2e8f0' }} />
                    <span style={{ color: '#94a3b8' }}>Free slot</span>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div>
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
                  Walking down the priority queue — each patient grabs the earliest available slot. Watch the slots fill up.
                </div>
                <SlotGrid assignedUpTo={slotAssigned} />
                <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    flex: 1, height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%', borderRadius: 4,
                      background: 'linear-gradient(90deg, #4f46e5, #818cf8)',
                      width: `${(slotAssigned / FINAL_ASSIGNMENTS.length) * 100}%`,
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#4f46e5', minWidth: 60 }}>
                    {slotAssigned}/{FINAL_ASSIGNMENTS.length} assigned
                  </span>
                </div>
              </div>
            )}

            {currentStep === 6 && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10, marginBottom: 20 }}>
                  {FINAL_ASSIGNMENTS.map((assignment, index) => (
                    <FinalAssignmentCard key={assignment.id} assignment={assignment} delay={index * 0.08} />
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {[
                    { label: 'Scheduled', value: FINAL_ASSIGNMENTS.length, color: '#22c55e', icon: '✓' },
                    { label: 'Unscheduled', value: 0, color: '#ef4444', icon: '✗' },
                    { label: 'Avg Score', value: Math.round(FINAL_ASSIGNMENTS.reduce((sum, a) => sum + a.score, 0) / FINAL_ASSIGNMENTS.length), color: '#4f46e5', icon: '★' },
                  ].map((stat) => (
                    <div key={stat.label} style={{
                      background: `${stat.color}10`, borderRadius: 12, padding: '14px 16px',
                      border: `1px solid ${stat.color}33`, textAlign: 'center',
                      animation: 'popIn 0.4s ease both',
                    }}>
                      <div style={{ fontSize: 22, marginBottom: 2 }}>{stat.icon}</div>
                      <div style={{ fontSize: 28, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 16, padding: '14px 18px', background: 'linear-gradient(135deg, #eff6ff, #f5f3ff)', borderRadius: 12, border: '1px solid #ddd6fe' }}>
                  <div style={{ fontWeight: 700, color: '#4f46e5', marginBottom: 4 }}>Complexity: O(R log R + R × D × S)</div>
                  <div style={{ fontSize: 13, color: '#6d28d9' }}>
                    With 6 patients, 3 doctors, 16 slots → ~288 operations. Runs in under 1ms.
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{
            padding: '14px 28px', background: '#fafafa', borderTop: '1px solid #f1f5f9',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{ fontSize: 16 }}>💡</div>
            <div style={{ fontSize: 13, color: '#64748b', fontStyle: 'italic' }}>{step.hint}</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            className="nav-btn"
            onClick={goPrev}
            disabled={currentStep === 1}
            style={{
              background: currentStep === 1 ? '#f1f5f9' : 'white',
              color: currentStep === 1 ? '#94a3b8' : '#1e293b',
              border: `2px solid ${currentStep === 1 ? '#e2e8f0' : '#e2e8f0'}`,
              cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            ← Previous
          </button>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              className="nav-btn"
              onClick={() => { setCurrentStep(1); setAutoPlay(true); }}
              style={{
                background: autoPlay ? '#fef2f2' : 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
                color: autoPlay ? '#ef4444' : '#6d28d9',
                border: `2px solid ${autoPlay ? '#fecaca' : '#ddd6fe'}`,
              }}
            >
              {autoPlay ? '⏹ Stop' : '▶ Auto Play'}
            </button>

            <button
              className="nav-btn"
              onClick={() => { setCurrentStep(1); setSlotAssigned(0); }}
              style={{ background: '#f8fafc', color: '#64748b', border: '2px solid #e2e8f0' }}
            >
              ↺ Restart
            </button>
          </div>

          <button
            className="nav-btn"
            onClick={goNext}
            disabled={currentStep === STEPS.length}
            style={{
              background: currentStep === STEPS.length ? '#f1f5f9' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              color: currentStep === STEPS.length ? '#94a3b8' : 'white',
              border: 'none',
              cursor: currentStep === STEPS.length ? 'not-allowed' : 'pointer',
            }}
          >
            Next →
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
