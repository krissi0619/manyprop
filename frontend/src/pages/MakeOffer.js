import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_OFFERS, API_PROPERTIES } from '../api/config';
import './MakeOffer.css';

/* ─── Helpers ─────────────────────────────────────────────── */
const fmt = (n) => {
  if (!n && n !== 0) return '—';
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(0)}L`;
  return `₹${Number(n).toLocaleString('en-IN')}`;
};

const today = new Date();
const DATES = Array.from({ length: 6 }, (_, i) => {
  const d = new Date(today);
  d.setDate(today.getDate() + i);
  return {
    day:  d.toLocaleDateString('en-IN', { weekday: 'short' }),
    date: d.getDate(),
    full: d.toISOString().split('T')[0],
  };
});

const TIME_SLOTS = ['9:00 AM','10:00 AM','11:00 AM','12:00 PM','2:00 PM','4:00 PM'];

const STEPS = [
  { id: 1, label: 'Chat'           },
  { id: 2, label: 'Schedule Visit' },
  { id: 3, label: 'Make Offer'     },
  { id: 4, label: 'Secure Deal'    },
  { id: 5, label: 'Confirmed'      },
];

/* ─── Buyer types allowed to make offers ──────────────── */
const BUYER_TYPES = ['Buyer', 'Tenant', 'Buyer / Tenant'];
const SELLER_TYPES = ['Owner', 'Builder', 'Agent', 'Landlord'];

/* ─── E-Sign Modal with canvas signature pad ──────────── */
const ESignModal = ({ buyerName, onClose }) => {
  const canvasRef = useRef(null);
  const [signing, setSigning] = useState(false);
  const [signed,  setSigned]  = useState(false);
  const [hasSig,  setHasSig]  = useState(false);

  const startDraw = (e) => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    const r = canvasRef.current.getBoundingClientRect();
    ctx.moveTo(e.clientX - r.left, e.clientY - r.top);
    setSigning(true);
    setHasSig(true);
  };
  const draw = (e) => {
    if (!signing) return;
    const ctx = canvasRef.current.getContext('2d');
    const r = canvasRef.current.getBoundingClientRect();
    ctx.lineTo(e.clientX - r.left, e.clientY - r.top);
    ctx.strokeStyle = '#e85c27'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    ctx.stroke();
  };
  const stopDraw = () => setSigning(false);
  const clearSig = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setHasSig(false);
  };

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:'16px' }}>
      <div style={{ background:'#fff',borderRadius:20,padding:28,maxWidth:440,width:'100%',boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
        {signed ? (
          <div style={{ textAlign:'center',padding:'20px 0' }}>
            <div style={{ width:60,height:60,borderRadius:'50%',background:'#e85c27',color:'#fff',fontSize:'1.8rem',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px' }}>✓</div>
            <h3 style={{ fontWeight:800,fontSize:'1.15rem',marginBottom:8 }}>Agreement Signed!</h3>
            <p style={{ color:'#666',fontSize:'0.85rem',marginBottom:20 }}>Your e-signature has been recorded. A copy will be sent to your email.</p>
            <button onClick={onClose} style={{ padding:'12px 32px',background:'#e85c27',color:'#fff',border:'none',borderRadius:10,fontWeight:800,cursor:'pointer',fontFamily:'inherit' }}>Close</button>
          </div>
        ) : (
          <>
            <h3 style={{ fontWeight:800,fontSize:'1.1rem',marginBottom:4 }}>📄 e-Sign Agreement</h3>
            <p style={{ color:'#666',fontSize:'0.82rem',marginBottom:14,lineHeight:1.6 }}>Review the sale agreement and sign in the box below, {buyerName}.</p>
            <div style={{ background:'#fef7f3',border:'1.5px dashed #e85c27',borderRadius:12,padding:14,marginBottom:14,fontSize:'0.78rem',color:'#555',lineHeight:1.7 }}>
              <strong>Sale Agreement Summary</strong><br/>
              This agreement confirms the property purchase as per the terms agreed between buyer and seller. Token amount of ₹50,000 has been escrowed with ManyProp. Full payment to be completed within 30 days.
            </div>
            <div style={{ marginBottom:6,fontSize:'0.78rem',fontWeight:700,color:'#444' }}>Your Signature <span style={{color:'#e85c27'}}>*</span></div>
            <canvas
              ref={canvasRef} width={380} height={110}
              style={{ border:'1.5px solid #e0e0e0',borderRadius:10,cursor:'crosshair',width:'100%',touchAction:'none',background:'#fafafa' }}
              onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
            />
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:6,marginBottom:16 }}>
              <button onClick={clearSig} style={{ fontSize:'0.75rem',color:'#999',background:'none',border:'none',cursor:'pointer',fontFamily:'inherit' }}>✕ Clear</button>
              <span style={{ fontSize:'0.72rem',color:'#bbb' }}>Draw your signature above</span>
            </div>
            <div style={{ display:'flex',gap:10 }}>
              <button onClick={onClose} style={{ flex:1,padding:'12px',border:'1.5px solid #e0e0e0',borderRadius:10,background:'#fff',fontWeight:600,cursor:'pointer',fontFamily:'inherit' }}>Cancel</button>
              <button
                disabled={!hasSig}
                onClick={() => setSigned(true)}
                style={{ flex:2,padding:'12px',background:hasSig?'linear-gradient(135deg,#e85c27,#f97316)':'#f0d9cc',color:'#fff',border:'none',borderRadius:10,fontWeight:800,cursor:hasSig?'pointer':'not-allowed',fontFamily:'inherit',transition:'all 0.2s' }}
              >✍️ Sign &amp; Submit</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const ShareDocsModal = ({ onClose }) => (
  <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center' }}>
    <div style={{ background:'#fff',borderRadius:20,padding:32,maxWidth:400,width:'90%',boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
      <h3 style={{ fontWeight:800,fontSize:'1.2rem',marginBottom:8 }}>📂 Share Documents</h3>
      <p style={{ color:'#666',fontSize:'0.85rem',marginBottom:18,lineHeight:1.6 }}>Share property documents with the owner securely.</p>
      {['Aadhaar Card','PAN Card','Income Proof','Bank Statement'].map(doc => (
        <div key={doc} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 14px',border:'1px solid #f0f0f0',borderRadius:10,marginBottom:8 }}>
          <span style={{ fontWeight:600,fontSize:'0.88rem' }}>📄 {doc}</span>
          <button style={{ padding:'5px 14px',background:'#fff5f0',color:'#e85c27',border:'1.5px solid #e85c27',borderRadius:20,fontWeight:700,fontSize:'0.75rem',cursor:'pointer',fontFamily:'inherit' }}>Upload</button>
        </div>
      ))}
      <button onClick={onClose} style={{ width:'100%',marginTop:14,padding:'12px',background:'#e85c27',color:'#fff',border:'none',borderRadius:10,fontWeight:800,cursor:'pointer',fontFamily:'inherit' }}>Done</button>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════ */
const MakeOffer = () => {
  const { propertyId } = useParams();
  const navigate       = useNavigate();
  const location       = useLocation();

  /* ─── Buyer-only guard ───────────────────────────────── */
  const currentUser = JSON.parse(localStorage.getItem('mp_user') || '{}');
  const isSeller    = SELLER_TYPES.includes(currentUser.userType);
  useEffect(() => {
    if (isSeller) {
      alert(`You are signed in as ${currentUser.userType}. Only buyers can make an offer.`);
      navigate('/home');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [step,     setStep]     = useState(1);
  const [property, setProperty] = useState(location.state?.property || null);
  const [offerId,  setOfferId]  = useState(location.state?.offerId  || null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [showESign,     setShowESign]     = useState(false);
  const [showShareDocs, setShowShareDocs] = useState(false);

  /* Step 2 – Schedule visit */
  const [selDate, setSelDate] = useState(DATES[0].full);
  const [selTime, setSelTime] = useState('10:00 AM');
  const [visitConfirmed, setVisitConfirmed] = useState(false);

  /* Step 1 – Chat (real, manual, no auto-reply) */
  const [msgs,    setMsgs]    = useState([]);
  const [msgText, setMsgText] = useState('');
  const [polling, setPolling] = useState(false);
  const chatEndRef             = useRef(null);

  /* Step 3 */
  const listPrice   = property?.price || 6600000;
  const minPrice    = Math.round(listPrice * 0.85);
  const maxPrice    = Math.round(listPrice * 1.10);
  const [offerAmt,  setOfferAmt]  = useState(Math.round(listPrice * 0.95));
  const [payType,   setPayType]   = useState('cash');
  const [msgOwner,  setMsgOwner]  = useState('');
  const [offerSent, setOfferSent] = useState(false);

  /* Step 4 */
  const [docs, setDocs]           = useState({ aadhaar: 'pending', pan: 'pending' });
  const [tokenPaying, setTokenPaying] = useState(false);
  const [tokenPaid,   setTokenPaid]   = useState(false);

  /* Step 5 */
  const agreedPrice = offerAmt;

  /* ─── Load property ───────────────────────────────────── */
  useEffect(() => {
    if (!property && propertyId) {
      axios.get(`${API_PROPERTIES}/${propertyId}`)
        .then(r => setProperty(r.data))
        .catch(() => {});
    }
  }, [propertyId, property]);

  /* ─── Auto-scroll chat ────────────────────────────────── */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, step]);

  /* ─── Poll backend for new messages every 5s ─────────── */
  useEffect(() => {
    if (!offerId || step !== 1) return;
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API_OFFERS}/${offerId}`);
        if (res.data?.messages) {
          setMsgs(res.data.messages.map(m => ({ sender: m.sender, text: m.text, time: m.time })));
        }
      } catch (_) {}
    }, 5000);
    return () => clearInterval(interval);
  }, [offerId, step]);

  /* ─── Derived ─────────────────────────────────────────── */
  const user      = JSON.parse(localStorage.getItem('mp_user') || '{}');
  const token     = localStorage.getItem('mp_token');
  const pctDiff   = (((offerAmt - listPrice) / listPrice) * 100).toFixed(1);
  const ownerName = property?.owner?.name || property?.agentContact?.name || 'Owner';
  const propTitle = property?.title || 'Property';
  const propCity  = property?.address?.city || '';

  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  /* ═══════════════════════════════════════════════════════
     STEP HANDLERS
  ════════════════════════════════════════════════════════ */

  /* Step 2 → confirm visit */
  const handleConfirmVisit = async () => {
    setVisitConfirmed(true);
    if (offerId) {
      try {
        await axios.put(`${API_OFFERS}/${offerId}/visit`,
          { visitDate: selDate, visitTime: selTime, visitStatus: 'scheduled' },
          { headers: authHeader }
        );
      } catch (_) {}
    }
  };

  /* Step 2 → next (go to Make Offer) */
  const goToMakeOffer = () => setStep(3);

  /* Step 1 – send message (real, stored in DB) */
  const sendMsg = async () => {
    if (!msgText.trim()) return;
    const text = msgText.trim();
    setMsgText('');

    // Optimistically add to UI
    const m = { sender: 'buyer', text, time: new Date() };
    setMsgs(p => [...p, m]);

    // Create offer record on first message if not yet created
    let currentOfferId = offerId;
    if (!currentOfferId) {
      try {
        const payload = {
          buyer:      user.id || user._id,
          propertyId: propertyId || property?._id,
          offerPrice: Math.round((property?.price || 5000000) * 0.95),
          paymentType: 'cash',
          buyerName:  user.name,
          buyerPhone: user.phone,
          buyerEmail: user.email,
          messageToOwner: text,
        };
        const res = await axios.post(API_OFFERS, payload, { headers: authHeader });
        currentOfferId = res.data._id;
        setOfferId(currentOfferId);
      } catch (_) {}
    } else {
      try {
        await axios.post(`${API_OFFERS}/${currentOfferId}/message`,
          { sender: 'buyer', text },
          { headers: authHeader }
        );
      } catch (_) {}
    }
  };

  /* Step 3 – send offer */
  const handleSendOffer = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        buyer:        user.id || user._id,
        propertyId:   propertyId || property?._id,
        offerPrice:   offerAmt,
        paymentType:  payType,
        buyerName:    user.name,
        buyerPhone:   user.phone,
        buyerEmail:   user.email,
        messageToOwner: msgOwner,
        visitDate:    selDate,
        visitTime:    selTime,
      };
      const res = await axios.post(API_OFFERS, payload, { headers: authHeader });
      setOfferId(res.data._id);
      setOfferSent(true);
      /* Simulate acceptance after 1.5s for demo */
      setTimeout(() => setStep(4), 1500);
    } catch (err) {
      /* Still advance in demo mode */
      setOfferSent(true);
      setTimeout(() => setStep(4), 1500);
    } finally {
      setLoading(false);
    }
  };

  /* Step 4 – upload document (simulated) */
  const uploadDoc = (docKey) => {
    setDocs(p => ({ ...p, [docKey]: 'uploading' }));
    setTimeout(() => setDocs(p => ({ ...p, [docKey]: 'uploaded' })), 1200);
    if (offerId) {
      axios.put(`${API_OFFERS}/${offerId}/documents`,
        { docType: docKey, status: 'uploaded' },
        { headers: authHeader }
      ).catch(() => {});
    }
  };

  /* Step 4 – pay token */
  const handlePayToken = async () => {
    setTokenPaying(true);
    try {
      if (offerId) {
        await axios.post(`${API_OFFERS}/${offerId}/token`,
          { tokenAmount: 50000 },
          { headers: authHeader }
        );
      }
    } catch (_) {}
    setTimeout(() => {
      setTokenPaid(true);
      setTokenPaying(false);
      setStep(5);
    }, 1800);
  };

  /* Step 5 – confirm deal */
  const handleConfirmDeal = async () => {
    if (offerId) {
      try {
        await axios.post(`${API_OFFERS}/${offerId}/confirm-deal`,
          { agreedPrice },
          { headers: authHeader }
        );
      } catch (_) {}
    }
  };

  /* ════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════ */
  return (
    <div className="mo-page">

      {/* ── Top bar ── */}
      <div className="mo-topbar">
        <button className="mo-back-btn" onClick={() => navigate(-1)}>← Back</button>
        <div className="mo-logo" onClick={() => navigate('/home')}>ManyProp</div>
        <div className="mo-secure-badge">🔒 100% Secure</div>
      </div>

      {/* ── Step indicator ── */}
      <div className="mo-stepper">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className={`mo-step-item ${step >= s.id ? 'active' : ''} ${step === s.id ? 'current' : ''}`}>
              <div className="mo-step-circle">
                {step > s.id ? '✓' : s.id}
              </div>
              <span className="mo-step-label">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`mo-step-line ${step > s.id ? 'done' : ''}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* ── Property pill ── */}
      {property && (
        <div className="mo-prop-pill">
          <span className="mo-prop-img-dot" />
          <span className="mo-prop-pill-title">{propTitle}</span>
          <span className="mo-prop-pill-sep">·</span>
          <span className="mo-prop-pill-price">{fmt(listPrice)}</span>
          {propCity && <><span className="mo-prop-pill-sep">·</span><span>{propCity}</span></>}
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          STEP 1 – CHAT WITH OWNER
      ══════════════════════════════════════════════════ */}
      {step === 1 && (
        <div className="mo-card mo-chat-card mo-animate">
          {/* Owner header */}
          <div className="mo-owner-header">
            <div className="mo-owner-avatar">
              {ownerName.charAt(0).toUpperCase()}
            </div>
            <div className="mo-owner-info">
              <div className="mo-owner-name">
                {ownerName}
                <span className="mo-verified-badge">✓ Verified</span>
              </div>
              <div className="mo-owner-meta">
                Trust score: 87 · Owner{propCity && ` · ${propCity}`}
              </div>
            </div>
          </div>

          <hr className="mo-divider" />

          {/* Chat messages */}
          <div className="mo-chat-msgs">
            {msgs.map((m, i) => (
              <div key={i} className={`mo-msg-wrap ${m.sender === 'buyer' ? 'buyer' : 'seller'}`}>
                <div className={`mo-msg-bubble ${m.sender}`}>{m.text}</div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="mo-chat-input-row">
            <input
              className="mo-chat-input"
              placeholder="Type a message..."
              value={msgText}
              onChange={e => setMsgText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMsg()}
            />
            <button className="mo-send-btn" onClick={sendMsg}>➤</button>
          </div>

          {/* Continue hint after first message */}
          {msgs.length > 0 && (
            <div style={{ padding:'10px 20px 0', background:'#fff' }}>
              <p style={{ fontSize:'0.78rem', color:'#888', textAlign:'center' }}>Ready to proceed? Use the buttons below ↓</p>
            </div>
          )}

          {/* Quick actions */}
          <div className="mo-quick-actions">
            <button className="mo-quick-btn" onClick={() => setStep(2)}>📅 Schedule visit</button>
            <button className="mo-quick-btn active" onClick={() => setStep(3)}>💰 Make an offer</button>
            <button className="mo-quick-btn" onClick={() => setShowShareDocs(true)}>📄 Share docs</button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          STEP 2 – SCHEDULE SITE VISIT
      ══════════════════════════════════════════════════ */}
      {step === 2 && (
        <div className="mo-card mo-animate">
          <h2 className="mo-card-title">Schedule site visit</h2>
          <p className="mo-card-sub">{propTitle}{propCity && ` · ${propCity}`}</p>

          <label className="mo-label">Select date</label>
          <div className="mo-date-row">
            {DATES.map(d => (
              <button
                key={d.full}
                className={`mo-date-btn ${selDate === d.full ? 'selected' : ''}`}
                onClick={() => { setSelDate(d.full); setVisitConfirmed(false); }}
              >
                <span className="mo-date-day">{d.day}</span>
                <span className="mo-date-num">{d.date}</span>
              </button>
            ))}
          </div>

          <label className="mo-label" style={{ marginTop: 22 }}>Available time slots</label>
          <div className="mo-time-grid">
            {TIME_SLOTS.map(t => (
              <button
                key={t}
                className={`mo-time-btn ${selTime === t ? 'selected' : ''}`}
                onClick={() => { setSelTime(t); setVisitConfirmed(false); }}
              >
                {t}
              </button>
            ))}
          </div>

          {visitConfirmed && (
            <div className="mo-visit-confirmed">
              <span className="mo-visit-dot" />
              <div>
                <div className="mo-visit-conf-title">Visit confirmed</div>
                <div className="mo-visit-conf-info">
                  {new Date(selDate).toLocaleDateString('en-IN',{ weekday:'long', month:'short', day:'numeric' })} · {selTime}
                </div>
                <div className="mo-visit-conf-info">{ownerName} will meet you at the property</div>
              </div>
            </div>
          )}

          {!visitConfirmed ? (
            <button className="mo-btn-primary mt-24" onClick={handleConfirmVisit}>
              Confirm visit
            </button>
          ) : (
            <button className="mo-btn-primary mt-16" onClick={goToMakeOffer}>
              Continue to Make Offer →
            </button>
          )}

          <p className="mo-hint">📲 Reminder will be sent 2 hours before via WhatsApp</p>

          <button className="mo-skip-link" onClick={() => setStep(3)}>
            Skip to Make Offer directly →
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          STEP 3 – MAKE AN OFFER
      ══════════════════════════════════════════════════ */}
      {step === 3 && !offerSent && (
        <div className="mo-card mo-animate">
          <h2 className="mo-card-title">Make an offer</h2>
          <p className="mo-card-sub">
            Listed at {fmt(listPrice)} · Market value {fmt(Math.round(listPrice * 0.96))}–{fmt(Math.round(listPrice * 1.05))}
          </p>

          <div className="mo-offer-amount-box">
            <div className="mo-offer-amount-label">Your offer amount</div>
            <div className="mo-offer-amount-val">{fmt(offerAmt)}</div>
            <div className={`mo-offer-pct ${parseFloat(pctDiff) < 0 ? 'below' : 'above'}`}>
              {Math.abs(pctDiff)}% {parseFloat(pctDiff) < 0 ? 'below' : 'above'} asking price
            </div>
          </div>

          {/* Price slider */}
          <div className="mo-slider-wrap">
            <input
              type="range"
              className="mo-slider"
              min={minPrice}
              max={maxPrice}
              step={10000}
              value={offerAmt}
              onChange={e => setOfferAmt(Number(e.target.value))}
            />
            <div className="mo-slider-labels">
              <span>{fmt(minPrice)}</span>
              <span>{fmt(maxPrice)}</span>
            </div>
          </div>

          {/* Payment type */}
          <div className="mo-pay-type-row">
            {['cash', 'loan', 'other'].map(t => (
              <button
                key={t}
                className={`mo-pay-btn ${payType === t ? 'selected' : ''}`}
                onClick={() => setPayType(t)}
              >
                {t === 'cash' ? '💵 Cash' : t === 'loan' ? '🏦 Home Loan' : '🔄 Other'}
              </button>
            ))}
          </div>

          <label className="mo-label mt-20">Message to owner (optional)</label>
          <textarea
            className="mo-msg-textarea"
            rows={3}
            placeholder="We visited the property and loved it. Can we discuss the price?"
            value={msgOwner}
            onChange={e => setMsgOwner(e.target.value)}
          />

          <div className="mo-response-badge">
            ⏱ Owner typically responds within 4 hours
          </div>

          {error && <div className="mo-error">{error}</div>}

          <button
            className="mo-btn-primary mt-16"
            onClick={handleSendOffer}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send offer'}
          </button>
          <button className="mo-btn-secondary" onClick={() => setStep(1)}>
            Negotiate via chat
          </button>
        </div>
      )}

      {/* Sending animation overlay */}
      {step === 3 && offerSent && (
        <div className="mo-card mo-animate mo-center">
          <div className="mo-spinner" />
          <p className="mo-sending-text">Sending your offer to {ownerName}…</p>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          STEP 4 – SECURE THE DEAL
      ══════════════════════════════════════════════════ */}
      {step === 4 && (
        <div className="mo-card mo-animate">
          {/* Progress bar */}
          <div className="mo-deal-progress-bar">
            <div className="mo-deal-progress-fill" style={{ width: '33%' }} />
          </div>

          <h2 className="mo-card-title">Secure the deal</h2>
          <p className="mo-card-sub">
            Offer accepted at {fmt(offerAmt)} — complete these steps to lock the property
          </p>

          {/* Timeline */}
          <div className="mo-timeline">
            {[
              { label: 'Offer accepted',           sub: `${fmt(offerAmt)} agreed with ${ownerName}`,     status: 'done'    },
              { label: `Token payment (₹50,000)`,  sub: 'Held in ManyProp escrow',                       status: tokenPaid ? 'done' : 'active'  },
              { label: 'Document verification',    sub: 'Aadhaar, PAN, property docs',                   status: tokenPaid ? 'active' : 'pending' },
              { label: 'Agreement drafting',       sub: 'e-Stamp + e-Sign',                              status: 'pending' },
              { label: 'Registration & handover',  sub: 'Sub-registrar + key handover',                  status: 'pending' },
            ].map((item, i) => (
              <div key={i} className="mo-timeline-item">
                <div className={`mo-tl-dot ${item.status}`} />
                <div className="mo-tl-info">
                  <div className={`mo-tl-label ${item.status}`}>{item.label}</div>
                  <div className="mo-tl-sub">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Document upload cards */}
          <div className="mo-doc-cards">
            {[
              { key: 'aadhaar', icon: 'A', label: 'Aadhaar card', sub: 'Required for KYC' },
              { key: 'pan',     icon: 'P', label: 'PAN card',     sub: 'For high-value transaction' },
            ].map(doc => (
              <div key={doc.key} className="mo-doc-card">
                <div className="mo-doc-icon" style={{ background: doc.key === 'aadhaar' ? '#f97316' : '#c2850a' }}>
                  {doc.icon}
                </div>
                <div className="mo-doc-info">
                  <div className="mo-doc-label">{doc.label}</div>
                  <div className="mo-doc-sub">{doc.sub}</div>
                </div>
                {docs[doc.key] === 'uploaded' ? (
                  <span className="mo-doc-badge uploaded">Uploaded</span>
                ) : docs[doc.key] === 'uploading' ? (
                  <span className="mo-doc-badge uploading">…</span>
                ) : (
                  <button className="mo-doc-badge upload" onClick={() => uploadDoc(doc.key)}>
                    Upload
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            className="mo-btn-primary mt-20"
            onClick={handlePayToken}
            disabled={tokenPaying || tokenPaid}
          >
            {tokenPaying ? 'Processing payment…' : tokenPaid ? 'Token Paid ✓' : 'Pay ₹50,000 token now'}
          </button>
          <p className="mo-hint">
            Refundable if deal falls through within 7 days for verified reasons
          </p>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          STEP 5 – DEAL CONFIRMED
      ══════════════════════════════════════════════════ */}
      {step === 5 && (
        <div className="mo-card mo-animate mo-center">
          <div className="mo-success-circle">✓</div>
          <h2 className="mo-success-title">Deal confirmed!</h2>
          <p className="mo-success-sub">
            Congratulations, {user.name || 'Buyer'}! Your property is locked.<br />
            Next: agreement signing within 48 hours.
          </p>

          {/* Summary table */}
          <div className="mo-deal-summary">
            <div className="mo-deal-row">
              <span className="mo-deal-key">Property</span>
              <span className="mo-deal-val">{propTitle}{propCity && `, ${propCity}`}</span>
            </div>
            <div className="mo-deal-row">
              <span className="mo-deal-key">Agreed price</span>
              <span className="mo-deal-val">{fmt(agreedPrice)}</span>
            </div>
            <div className="mo-deal-row">
              <span className="mo-deal-key">Token paid</span>
              <span className="mo-deal-val green">₹50,000 (escrowed)</span>
            </div>
            <div className="mo-deal-row">
              <span className="mo-deal-key">Next step</span>
              <span className="mo-deal-val blue">Agreement drafting</span>
            </div>
          </div>

          {/* Actions */}
          <div className="mo-post-deal-actions">
            <button className="mo-post-btn" onClick={() => { handleConfirmDeal(); setShowESign(true); }}>
              📄 View &amp; e-sign agreement
            </button>
            <button className="mo-post-btn" onClick={() => window.open('https://www.google.com/search?q=packers+movers+near+me', '_blank')}>
              🚚 Book packers &amp; movers
            </button>
            <button className="mo-post-btn" onClick={() => window.open('https://www.bankbazaar.com/home-loan.html', '_blank')}>
              🏦 Apply for home loan
            </button>
            <button className="mo-post-btn" onClick={() => navigate('/home')}>
              ⭐ Rate your experience
            </button>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {showESign     && <ESignModal     buyerName={currentUser.name || 'Buyer'} onClose={() => setShowESign(false)} />}
      {showShareDocs && <ShareDocsModal onClose={() => setShowShareDocs(false)} />}
    </div>
  );
};

export default MakeOffer;
