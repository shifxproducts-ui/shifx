import { useState, useCallback, useRef, useEffect, createContext, useContext, useMemo, memo } from "react";

/* ══════════════════════════════════════════════════════
   GLOBAL STYLES
══════════════════════════════════════════════════════ */
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{
      /* ── Cool Sky-to-Violet palette ── */
      --p:#6366f1;--p-lt:#eef2ff;--p-dk:#4338ca;--p-xlt:#f5f3ff;
      --cyan:#06b6d4;--cyan-dk:#0891b2;--cyan-lt:#ecfeff;
      --rose:#f43f5e;--rose-lt:#fff1f2;
      --emerald:#10b981;--emerald-lt:#ecfdf5;
      --amber:#f59e0b;--amber-dk:#d97706;--amber-lt:#fffbeb;
      /* ── Neutrals ── */
      --bg:#f0f4ff;--surface:#ffffff;--surface2:#f8faff;--surface3:#eef2ff;
      --border:#e0e7ff;--border2:#c7d2fe;
      --text:#1e1b4b;--text2:#4c4f7a;--text3:#a5b4fc;
      /* ── Semantic ── */
      --success:#10b981;--success-bg:#ecfdf5;
      --danger:#f43f5e;--danger-bg:#fff1f2;
      --warn:#f59e0b;--warn-bg:#fffbeb;
      /* ── Shadows ── */
      --sh-sm:0 1px 4px rgba(99,102,241,.10);
      --sh:0 4px 20px rgba(99,102,241,.12),0 1px 6px rgba(99,102,241,.06);
      --sh-lg:0 20px 60px rgba(99,102,241,.18),0 4px 20px rgba(99,102,241,.10);
      --r:10px;--r-lg:16px;--r-xl:22px;
    }
    html,body{height:100%;background:var(--bg)}
    body{font-family:'Inter',sans-serif;color:var(--text);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
    h1,h2,h3,h4,h5{font-family:'Plus Jakarta Sans',sans-serif;color:var(--text)}
    input,textarea,button,select{font-family:inherit}
    ::-webkit-scrollbar{width:4px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:var(--border2);border-radius:4px}

    @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}
    @keyframes pop{0%{transform:scale(.82);opacity:0}65%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
    @keyframes glow{0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,.4)}50%{box-shadow:0 0 0 8px rgba(99,102,241,.0)}}

    .fu{animation:fadeUp .38s cubic-bezier(.22,1,.36,1) both}
    .fi{animation:fadeIn .22s ease both}
    .shake{animation:shake .38s ease}
    .pop{animation:pop .32s cubic-bezier(.22,1,.36,1) both}

    /* ── Buttons ── */
    .btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:9px 18px;border-radius:var(--r);font-size:13px;font-weight:600;cursor:pointer;border:none;transition:all .16s ease;white-space:nowrap;letter-spacing:.01em}
    .btn-primary{background:linear-gradient(135deg,var(--p),var(--p-dk));color:#fff;box-shadow:0 2px 12px rgba(99,102,241,.28)}
    .btn-primary:hover:not(:disabled){background:linear-gradient(135deg,#7c3aed,var(--p-dk));transform:translateY(-1px);box-shadow:0 6px 20px rgba(99,102,241,.38)}
    .btn-primary:active:not(:disabled){transform:translateY(0)}
    .btn-primary:disabled{opacity:.48;cursor:not-allowed;box-shadow:none}
    .btn-secondary{background:var(--surface);color:var(--text2);border:1.5px solid var(--border2)}
    .btn-secondary:hover{background:var(--surface3);border-color:var(--p);color:var(--p)}
    .btn-cyan{background:linear-gradient(135deg,var(--cyan),var(--cyan-dk));color:#fff;box-shadow:0 2px 12px rgba(6,182,212,.25)}
    .btn-cyan:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(6,182,212,.35)}
    .btn-amber{background:linear-gradient(135deg,#fbbf24,var(--amber-dk));color:#fff;box-shadow:0 2px 10px rgba(245,158,11,.25)}
    .btn-amber:hover{transform:translateY(-1px);box-shadow:0 5px 16px rgba(245,158,11,.35)}
    .btn-ghost{background:transparent;color:var(--text2);padding:8px 12px;border-radius:var(--r)}
    .btn-ghost:hover{background:var(--surface3);color:var(--p)}
    .btn-danger{background:var(--danger-bg);color:var(--danger);border:1px solid #fda4af}
    .btn-danger:hover{background:#ffe4e6}
    .btn-success{background:linear-gradient(135deg,#34d399,var(--emerald));color:#fff;box-shadow:0 2px 10px rgba(16,185,129,.25)}
    .btn-success:hover{transform:translateY(-1px);box-shadow:0 5px 16px rgba(16,185,129,.35)}

    /* ── Cards ── */
    .card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);box-shadow:var(--sh)}

    /* ── Fields ── */
    .field{margin-bottom:15px}
    .field label{display:block;font-size:12px;font-weight:600;color:var(--text2);margin-bottom:5px;letter-spacing:.03em;text-transform:uppercase}
    .field input,.field select,.field textarea{width:100%;padding:10px 14px;border:1.5px solid var(--border2);border-radius:var(--r);font-size:13.5px;color:var(--text);background:var(--surface2);transition:border .15s,box-shadow .15s,background .15s;outline:none}
    .field input:focus,.field select:focus,.field textarea:focus{border-color:var(--p);box-shadow:0 0 0 3px rgba(99,102,241,.12);background:var(--surface)}
    .field input.err{border-color:var(--danger);background:#fff5f5}
    .field .hint{font-size:11px;color:var(--text3);margin-top:4px}
    .field .errmsg{font-size:11px;color:var(--danger);margin-top:4px;font-weight:500}

    /* ── Tables ── */
    .tbl{width:100%;border-collapse:collapse}
    .tbl th{padding:10px 14px;text-align:left;font-size:10.5px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.07em;border-bottom:1.5px solid var(--border)}
    .tbl td{padding:12px 14px;font-size:13px;color:var(--text2);border-bottom:1px solid var(--border)}
    .tbl tr:last-child td{border-bottom:none}
    .tbl tr:hover td{background:var(--p-xlt)}

    /* ── Nav links ── */
    .nav-link{display:flex;align-items:center;gap:9px;padding:8px 11px;border-radius:var(--r);font-size:13px;font-weight:500;color:var(--text2);cursor:pointer;transition:all .13s;border:none;background:none;width:100%;text-align:left}
    .nav-link:hover{background:var(--surface3);color:var(--text)}
    .nav-link.active{background:var(--nav-bg,var(--p-lt));color:var(--nav-color,var(--p));font-weight:700}

    /* ── Misc ── */
    .stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:14px}
    .badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:.02em}
    .divider{height:1px;background:var(--border);margin:16px 0}

    /* ── OTP inputs ── */
    .otp-box{display:flex;gap:8px;justify-content:center}
    .otp-box input{width:48px;height:56px;text-align:center;font-size:22px;font-weight:700;font-family:'JetBrains Mono',monospace;border:1.5px solid var(--border2);border-radius:var(--r);background:var(--surface2);color:var(--text);outline:none;transition:all .15s}
    .otp-box input:focus{border-color:var(--p);box-shadow:0 0 0 3px rgba(99,102,241,.14);background:var(--surface)}
    .otp-box input.filled{border-color:var(--p);background:var(--p-lt);color:var(--p-dk)}

    /* ── Sidebar ── */
    .sidebar{width:224px;min-width:224px;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;flex-shrink:0}

    /* ── Strength bar ── */
    .str-bar{height:4px;border-radius:2px;transition:background .3s}

    /* ── Responsive ── */
    @media(max-width:900px){
      .sidebar{position:fixed;top:0;left:0;height:100vh;z-index:200;transform:translateX(-100%);transition:transform .25s}
      .sidebar.sb-open{transform:translateX(0)}
      .mob-btn{display:flex!important}
      .detail-grid{grid-template-columns:1fr!important}
      .profile-grid{grid-template-columns:1fr!important}
      .two-col{grid-template-columns:1fr!important}
    }
    @media(min-width:901px){.mob-btn{display:none!important}}
    @media(max-width:768px){.hide-mob{display:none!important}.stat-grid{grid-template-columns:1fr 1fr!important}}
    @media(max-width:480px){.stat-grid{grid-template-columns:1fr!important}.otp-box input{width:40px;height:48px;font-size:18px}}
  `}</style>
);

/* ══════════════════════════════════════════════════════
   CONSTANTS & HELPERS
══════════════════════════════════════════════════════ */
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Indian Rupee formatter – no decimals, Indian grouping
const inr = n => '₹' + Math.round(n).toLocaleString('en-IN');


function mkMath() {
  const a = Math.floor(Math.random() * 12) + 1;
  const b = Math.floor(Math.random() * 12) + 1;
  return { a, b, ans: a + b };
}

function pwStrength(pw) {
  let s = 0;
  if (pw.length >= 8)            s++;
  if (/[A-Z]/.test(pw))          s++;
  if (/[0-9]/.test(pw))          s++;
  if (/[^A-Za-z0-9]/.test(pw))   s++;
  return s; // 0-4
}

const STR_LABEL = ["","Weak","Fair","Good","Strong"];
const STR_COLOR = ["","var(--danger)","#f59e0b","#6366f1","#10b981"];

/* ══════════════════════════════════════════════════════
   API CLIENT  (all calls go through here)
══════════════════════════════════════════════════════ */
// API base — empty string uses Vite dev proxy (see vite.config.js)
// Change to "http://localhost:8000" if running without Vite proxy
const API = import.meta.env.VITE_API_URL || "";

async function apiFetch(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = "Bearer " + token;
  const res = await fetch(API + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || "Request failed.");
  return data;
}

/* ── Normalize product from API shape → internal shape ── */
function normProduct(p) {
  return {
    id: p.id, name: p.name, price: p.price,
    rating: p.rating ?? 0, reviews: p.review_count ?? 0,
    cat: p.category, desc: p.description ?? "",
    img: p.image_url ?? "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&q=80",
    stock: p.stock,
  };
}

/* ══════════════════════════════════════════════════════
   AUTH CONTEXT
══════════════════════════════════════════════════════ */
const AuthCtx = createContext(null);

function AuthProvider({ children }) {
  const [auth,     setAuth]     = useState(() => {
    try {
      const s = sessionStorage.getItem("shifx_auth");
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });
  const [token,    setToken]    = useState(() => sessionStorage.getItem("shifx_token") || null);
  const [cart,     setCart]     = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [products,   setProducts]   = useState([]);
  const [orders,     setOrders]     = useState([]);
  const [reviews,    setReviews]    = useState({});
  const [apiStatus,  setApiStatus]  = useState("loading"); // loading | ok | error

  /* ── Load products on mount ── */
  useEffect(() => {
    apiFetch("/products?limit=100")
      .then(data => { setProducts((data.products || []).map(normProduct)); setApiStatus("ok"); })
      .catch(() => setApiStatus("error"));
  }, []);

  /* ── Load user-specific data when logged in ── */
  useEffect(() => {
    if (!token || !auth) return;
    // wishlist
    apiFetch("/wishlist", { token })
      .then(items => setWishlist(items.map(i => normProduct(i.product))))
      .catch(() => {});
    // orders
    apiFetch("/orders", { token })
      .then(data => {
        const mapped = data.map(o => ({
          id: o.id,
          total: o.total,
          date: new Date(o.created_at).toLocaleDateString("en-IN"),
          status: o.status,
          items: (o.items || []).map(i => ({
            ...normProduct(i.product),
            qty: i.quantity,
            price: i.unit_price,
          })),
        }));
        setOrders(mapped);
      })
      .catch(() => {});
  }, [token, auth]);

  /* ── Auth actions ── */
  const _setSession = (tokenStr, userData) => {
    setToken(tokenStr);
    setAuth(userData);
    sessionStorage.setItem("shifx_token", tokenStr);
    sessionStorage.setItem("shifx_auth", JSON.stringify(userData));
  };

  const login = useCallback(async (email, password) => {
    const data = await apiFetch("/auth/login", { method: "POST", body: { email, password } });
    const u = {
      id: data.user.id,
      name: data.user.full_name,
      email: data.user.email,
      role: data.role,
      avatar: data.user.avatar || data.user.full_name.slice(0,2).toUpperCase(),
      verified: data.user.is_verified,
    };
    _setSession(data.access_token, u);
  }, []);

  const logout = useCallback(() => {
    setAuth(null); setToken(null);
    setCart([]); setWishlist([]); setOrders([]);
    sessionStorage.removeItem("shifx_token");
    sessionStorage.removeItem("shifx_auth");
  }, []);

  /* ── Signup: step 1 ── */
  const signupRequest = useCallback(async (name, email, password) => {
    const data = await apiFetch("/auth/register", {
      method: "POST",
      body: { full_name: name, email, password },
    });
    return data.demo_otp || null;
  }, []);

  /* ── Signup: step 2 ── */
  const verifyOtp = useCallback(async (email, inputCode) => {
    const data = await apiFetch("/auth/verify-otp", {
      method: "POST",
      body: { email, code: inputCode.trim() },
    });
    return data;
  }, []);

  /* ── Resend OTP ── */
  const resendOtp = useCallback(async (email) => {
    const data = await apiFetch("/auth/resend-otp", { method: "POST", body: { email } });
    return data.demo_otp || null;
  }, []);

  /* ── Cart (local state — submitted on place order) ── */
  const addToCart = useCallback((product, qty = 1) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      if (ex) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { ...product, qty }];
    });
  }, []);
  const removeFromCart = useCallback(id => setCart(p => p.filter(i => i.id !== id)), []);
  const updateQty = useCallback((id, qty) =>
    setCart(p => qty < 1 ? p.filter(i => i.id !== id) : p.map(i => i.id === id ? { ...i, qty } : i)), []);

  /* ── Wishlist ── */
  const toggleWishlist = useCallback(async (product) => {
    const inList = wishlist.find(i => i.id === product.id);
    if (inList) {
      await apiFetch("/wishlist/" + product.id, { method: "DELETE", token }).catch(() => {});
      setWishlist(p => p.filter(i => i.id !== product.id));
    } else {
      await apiFetch("/wishlist?product_id=" + product.id, { method: "POST", token }).catch(() => {});
      setWishlist(p => [...p, product]);
    }
  }, [wishlist, token]);

  /* ── Orders ── */
  const placeOrder = useCallback(async (cartItems) => {
    const items = cartItems.map(i => ({ product_id: i.id, quantity: i.qty }));
    const data = await apiFetch("/orders", { method: "POST", body: { items }, token });
    const order = {
      id: data.id, total: data.total,
      date: new Date(data.created_at).toLocaleDateString("en-IN"),
      status: data.status,
      items: cartItems,
    };
    setOrders(p => [order, ...p]);
    setCart([]);
    return order;
  }, [token]);

  /* ── Reviews ── */
  const addReview = useCallback(async (pid, review) => {
    await apiFetch("/reviews", {
      method: "POST",
      body: { product_id: pid, rating: review.rating, text: review.text },
      token,
    });
    setReviews(p => ({ ...p, [pid]: [...(p[pid]||[]), review] }));
    // Refresh product list to get updated rating
    apiFetch("/products?limit=100")
      .then(data => setProducts((data.products || []).map(normProduct)))
      .catch(() => {});
  }, [token]);

  /* ── Products (company upload) ── */
  const addProduct = useCallback(async (product) => {
    const data = await apiFetch("/products", {
      method: "POST",
      body: {
        name: product.name, price: product.price,
        category: product.cat, description: product.desc,
        image_url: product.img, stock: product.stock,
      },
      token,
    });
    setProducts(p => [...p, normProduct(data)]);
  }, [token]);

  /* ── Load reviews for a product ── */
  const loadReviews = useCallback(async (pid) => {
    const data = await apiFetch("/reviews/" + pid).catch(() => []);
    const mapped = data.map(r => ({
      user: r.user?.full_name || "Anonymous",
      rating: r.rating, text: r.text,
      date: new Date(r.created_at).toLocaleDateString("en-IN"),
    }));
    setReviews(p => ({ ...p, [pid]: mapped }));
    return mapped;
  }, []);

  const cartCount = cart.reduce((s,i) => s+i.qty, 0);

  return (
    <AuthCtx.Provider value={{
      auth, token, login, logout, apiStatus,
      signupRequest, verifyOtp, resendOtp,
      cart, cartCount, addToCart, removeFromCart, updateQty,
      wishlist, toggleWishlist,
      products, addProduct,
      orders, placeOrder,
      reviews, addReview, loadReviews,
    }}>
      {children}
    </AuthCtx.Provider>
  );
}

const useAuth = () => useContext(AuthCtx);

/* ══════════════════════════════════════════════════════
   ROUTER
══════════════════════════════════════════════════════ */
function Router() {
  const { auth } = useAuth();
  const [screen, setScreen] = useState("login"); // login | signup | otp | success
  const [pending, setPending] = useState(null);  // { name, email, demoCode }

  if (auth) {
    if (auth.role === "admin")   return <AdminDash />;
    if (auth.role === "company") return <CompanyDash />;
    return <ShopPage />;
  }

  if (screen === "signup")  return <SignupPage  setScreen={setScreen} setPending={setPending} />;
  if (screen === "otp")     return <OtpPage     setScreen={setScreen} pending={pending} />;
  if (screen === "success") return <SuccessPage setScreen={setScreen} pending={pending} />;
  return <LoginPage setScreen={setScreen} />;
}

/* ══════════════════════════════════════════════════════
   AUTH SHELL  (shared wrapper for login/signup/otp)
══════════════════════════════════════════════════════ */
function AuthShell({ children, title, subtitle, step, totalSteps }) {
  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,var(--p-lt) 0%,var(--bg) 55%,var(--cyan-lt) 100%)", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px 16px" }}>
      <div style={{ width:"100%", maxWidth:460 }}>
        {/* Brand */}
        <div className="fu" style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:10, marginBottom:12 }}>
            <div style={{ width:44, height:44, borderRadius:12, background:"linear-gradient(135deg,#6366f1,#06b6d4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, fontWeight:800, color:"#fff", boxShadow:"0 6px 20px rgba(99,102,241,.32)" }}>S</div>
            <div>
              <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:20, letterSpacing:"-.02em", lineHeight:1 }}>SHIFX</div>
              <div style={{ fontSize:9, color:"var(--cyan)", fontWeight:700, letterSpacing:".14em", textTransform:"uppercase" }}>PRODUCTS</div>
            </div>
          </div>
          {/* Step indicator */}
          {totalSteps && (
            <div style={{ display:"flex", justifyContent:"center", gap:6, marginBottom:12 }}>
              {Array.from({ length: totalSteps }).map((_,i) => (
                <div key={i} style={{ width: i+1 <= step ? 24 : 8, height:4, borderRadius:2, background: i+1 <= step ? "var(--p)" : "var(--border2)", transition:"all .3s" }} />
              ))}
            </div>
          )}
          <h1 style={{ fontSize:22, fontWeight:800, letterSpacing:"-.03em", marginBottom:4 }}>{title}</h1>
          {subtitle && <p style={{ color:"var(--text3)", fontSize:13 }}>{subtitle}</p>}
        </div>
        <div className="card fu" style={{ padding:"28px 28px", animationDelay:".06s" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   LOGIN PAGE
══════════════════════════════════════════════════════ */
function LoginPage({ setScreen }) {
  const { login } = useAuth();
  const [email,   setEmail]   = useState("");
  const [pass,    setPass]    = useState("");
  const [showPw,  setShowPw]  = useState(false);
  const [busy,    setBusy]    = useState(false);
  const [err,     setErr]     = useState("");
  const [shaking, setShaking] = useState(false);
  const [mathQ,   setMathQ]   = useState(mkMath);
  const [mathAns, setMathAns] = useState("");

  const trigShake = () => { setShaking(true); setTimeout(() => setShaking(false), 400); };
  const resetMath = () => { setMathQ(mkMath()); setMathAns(""); };

  const submit = async () => {
    if (!email.trim() || !pass) { setErr("Please fill in all fields."); trigShake(); return; }
    if (parseInt(mathAns, 10) !== mathQ.ans) {
      setErr("Robot check failed — " + mathQ.a + " + " + mathQ.b + " = ?");
      trigShake(); resetMath(); return;
    }
    setBusy(true); setErr("");
    try { await login(email.trim(), pass); }
    catch (e) { setErr(e.message); trigShake(); resetMath(); }
    finally { setBusy(false); }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your SHIFX account">
      <div className={shaking ? "shake" : ""}>
        <div className="field">
          <label>Email / Username</label>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="e.g. admin1@123"
            onKeyDown={e => e.key === "Enter" && submit()} autoComplete="username" />
        </div>
        <div className="field">
          <label>Password</label>
          <div style={{ position:"relative" }}>
            <input value={pass} onChange={e => setPass(e.target.value)} type={showPw?"text":"password"} placeholder="••••••••"
              style={{ paddingRight:42 }} onKeyDown={e => e.key === "Enter" && submit()} autoComplete="current-password" />
            <button type="button" onClick={() => setShowPw(v=>!v)}
              style={{ position:"absolute", right:11, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"var(--text3)", fontSize:15, padding:0 }}>
              {showPw ? "🙈" : "👁️"}
            </button>
          </div>
        </div>
        <div className="field">
          <label>Robot Check — What is {mathQ.a} + {mathQ.b}?</label>
          <input value={mathAns} onChange={e => setMathAns(e.target.value)} placeholder="Your answer"
            type="number" style={{ maxWidth:160 }} onKeyDown={e => e.key === "Enter" && submit()} />
        </div>

        {err && <ErrBox msg={err} />}

        <button className="btn btn-primary" style={{ width:"100%", padding:"12px", fontSize:14, marginBottom:14 }}
          onClick={submit} disabled={busy}>
          {busy ? <><Spin /> Signing in…</> : "Sign In →"}
        </button>

        <div className="divider" />

        <p style={{ textAlign:"center", fontSize:13, color:"var(--text3)" }}>
          Don't have an account?{" "}
          <button type="button" onClick={() => setScreen("signup")}
            style={{ background:"none", border:"none", color:"var(--p)", fontWeight:700, cursor:"pointer", fontSize:13 }}>
            Create account
          </button>
        </p>
      </div>
    </AuthShell>
  );
}

/* ══════════════════════════════════════════════════════
   SIGNUP PAGE
══════════════════════════════════════════════════════ */
function SignupPage({ setScreen, setPending }) {
  const { signupRequest } = useAuth();
  const [form, setForm] = useState({ fullName:"", email:"", password:"", confirm:"" });
  const [showPw,  setShowPw]  = useState(false);
  const [showCf,  setShowCf]  = useState(false);
  const [busy,    setBusy]    = useState(false);
  const [err,     setErr]     = useState("");
  const [fErr,    setFErr]    = useState({});
  const [shaking, setShaking] = useState(false);

  const upd = (k, v) => { setForm(f => ({ ...f, [k]:v })); setFErr(e => ({ ...e, [k]:"" })); };
  const trigShake = () => { setShaking(true); setTimeout(() => setShaking(false), 400); };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim() || form.fullName.trim().split(" ").length < 2)
      e.fullName = "Enter your full name (first & last)";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email address";
    if (form.password.length < 8)
      e.password = "Password must be at least 8 characters";
    if (form.password !== form.confirm)
      e.confirm = "Passwords do not match";
    return e;
  };

  const submit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setFErr(errs); setErr(""); trigShake(); return; }
    setBusy(true); setErr("");
    try {
      const code = await signupRequest(form.fullName.trim(), form.email.trim().toLowerCase(), form.password);
      setPending({ name: form.fullName.trim(), email: form.email.trim().toLowerCase(), demoCode: code });
      setScreen("otp");
    } catch (e) { setErr(e.message); trigShake(); }
    finally { setBusy(false); }
  };

  const str = pwStrength(form.password);

  return (
    <AuthShell title="Create account" subtitle="Join SHIFX — it's free" step={1} totalSteps={3}>
      <div className={shaking ? "shake" : ""}>
        {/* Full Name */}
        <div className="field">
          <label>Full Name <span style={{ color:"var(--danger)" }}>*</span></label>
          <input value={form.fullName} onChange={e => upd("fullName", e.target.value)}
            placeholder="e.g. Jordan Lee" className={fErr.fullName ? "err" : ""}
            autoComplete="name" />
          {fErr.fullName && <div className="errmsg">{fErr.fullName}</div>}
          <div className="hint">First name and last name required</div>
        </div>

        {/* Email */}
        <div className="field">
          <label>Email Address <span style={{ color:"var(--danger)" }}>*</span></label>
          <input value={form.email} onChange={e => upd("email", e.target.value)}
            placeholder="you@example.com" type="email" className={fErr.email ? "err" : ""}
            autoComplete="email" />
          {fErr.email && <div className="errmsg">{fErr.email}</div>}
        </div>

        {/* Password */}
        <div className="field">
          <label>Password <span style={{ color:"var(--danger)" }}>*</span></label>
          <div style={{ position:"relative" }}>
            <input value={form.password} onChange={e => upd("password", e.target.value)}
              type={showPw?"text":"password"} placeholder="Min. 8 characters"
              style={{ paddingRight:42 }} className={fErr.password ? "err" : ""}
              autoComplete="new-password" />
            <button type="button" onClick={() => setShowPw(v=>!v)}
              style={{ position:"absolute", right:11, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"var(--text3)", fontSize:15, padding:0 }}>
              {showPw ? "🙈" : "👁️"}
            </button>
          </div>
          {/* Strength bar */}
          {form.password && (
            <div style={{ marginTop:7 }}>
              <div style={{ display:"flex", gap:4, marginBottom:4 }}>
                {[1,2,3,4].map(i => (
                  <div key={i} className="str-bar" style={{ flex:1, background: i <= str ? STR_COLOR[str] : "var(--border2)" }} />
                ))}
              </div>
              <div style={{ fontSize:11, color:STR_COLOR[str], fontWeight:600 }}>{STR_LABEL[str]}</div>
            </div>
          )}
          {fErr.password && <div className="errmsg">{fErr.password}</div>}
        </div>

        {/* Confirm Password */}
        <div className="field">
          <label>Confirm Password <span style={{ color:"var(--danger)" }}>*</span></label>
          <div style={{ position:"relative" }}>
            <input value={form.confirm} onChange={e => upd("confirm", e.target.value)}
              type={showCf?"text":"password"} placeholder="Repeat your password"
              style={{ paddingRight:42 }} className={fErr.confirm ? "err" : ""}
              autoComplete="new-password" />
            <button type="button" onClick={() => setShowCf(v=>!v)}
              style={{ position:"absolute", right:11, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"var(--text3)", fontSize:15, padding:0 }}>
              {showCf ? "🙈" : "👁️"}
            </button>
          </div>
          {fErr.confirm && <div className="errmsg">{fErr.confirm}</div>}
        </div>

        {err && <ErrBox msg={err} />}

        <button className="btn btn-primary" style={{ width:"100%", padding:"12px", fontSize:14, marginBottom:14 }}
          onClick={submit} disabled={busy}>
          {busy ? <><Spin /> Creating account…</> : "Continue — Verify Email →"}
        </button>

        <div className="divider" />
        <p style={{ textAlign:"center", fontSize:13, color:"var(--text3)" }}>
          Already have an account?{" "}
          <button type="button" onClick={() => setScreen("login")}
            style={{ background:"none", border:"none", color:"var(--p)", fontWeight:700, cursor:"pointer", fontSize:13 }}>
            Sign in
          </button>
        </p>
      </div>
    </AuthShell>
  );
}

/* ══════════════════════════════════════════════════════
   OTP PAGE
══════════════════════════════════════════════════════ */
function OtpPage({ setScreen, pending }) {
  const { verifyOtp, resendOtp } = useAuth();
  const [digits,   setDigits]   = useState(["","","","","",""]);
  const [busy,     setBusy]     = useState(false);
  const [err,      setErr]      = useState("");
  const [shaking,  setShaking]  = useState(false);
  const [timer,    setTimer]    = useState(600);     // 10 min
  const [resendCd, setResendCd] = useState(60);      // 1 min cooldown
  const [demoCode, setDemoCode] = useState(pending?.demoCode || "");
  const refs = useRef([]);

  useEffect(() => {
    const t = setInterval(() => setTimer(s => s > 0 ? s-1 : 0), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (resendCd <= 0) return;
    const t = setInterval(() => setResendCd(s => s > 0 ? s-1 : 0), 1000);
    return () => clearInterval(t);
  }, [resendCd]);

  const fmt = s => String(Math.floor(s/60)).padStart(2,"0") + ":" + String(s%60).padStart(2,"0");
  const trigShake = () => { setShaking(true); setTimeout(() => setShaking(false), 400); };

  const handleInput = (i, val) => {
    const ch = val.replace(/\D/g,"").slice(-1);
    const n = [...digits]; n[i] = ch; setDigits(n);
    if (ch && i < 5) refs.current[i+1]?.focus();
  };
  const handleKey = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i-1]?.focus();
    if (e.key === "ArrowLeft"  && i > 0) refs.current[i-1]?.focus();
    if (e.key === "ArrowRight" && i < 5) refs.current[i+1]?.focus();
  };
  const handlePaste = e => {
    const t = e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6);
    if (t.length === 6) { setDigits(t.split("")); refs.current[5]?.focus(); }
    e.preventDefault();
  };

  const code = digits.join("");

  const verify = async () => {
    if (code.length < 6) { setErr("Enter the complete 6-digit code."); trigShake(); return; }
    setBusy(true); setErr("");
    try {
      await verifyOtp(pending.email, code);
      setScreen("success");
    } catch (e) { setErr(e.message); trigShake(); setDigits(["","","","","",""]); refs.current[0]?.focus(); }
    finally { setBusy(false); }
  };

  const handleResend = async () => {
    if (resendCd > 0) return;
    try {
      const newCode = await resendOtp(pending.email);
      setDemoCode(newCode);
      setDigits(["","","","","",""]);
      setTimer(600); setResendCd(60); setErr("");
      refs.current[0]?.focus();
    } catch (e) { setErr(e.message); }
  };

  const pct = (timer / 600) * 100;
  const timerColor = timer > 120 ? "var(--p)" : timer > 60 ? "var(--warn)" : "var(--danger)";

  return (
    <AuthShell title="Verify your email" subtitle={"Code sent to " + pending?.email} step={2} totalSteps={3}>
      {/* Circular timer */}
      <div style={{ textAlign:"center", marginBottom:24 }}>
        <div style={{ position:"relative", display:"inline-block" }}>
          <svg width="72" height="72" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15" fill="none" stroke="var(--border)" strokeWidth="2.5"/>
            <circle cx="18" cy="18" r="15" fill="none" stroke={timerColor} strokeWidth="2.5"
              strokeDasharray="94.25" strokeDashoffset={94.25 - (pct/100)*94.25}
              strokeLinecap="round" transform="rotate(-90 18 18)"
              style={{ transition:"stroke-dashoffset 1s linear, stroke .3s" }}/>
          </svg>
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:600, color:timerColor }}>
            {fmt(timer)}
          </div>
        </div>
        <p style={{ fontSize:12, color:"var(--text3)", marginTop:6 }}>
          {timer > 0 ? "Code expires in" : "Code expired"}
        </p>
      </div>

      

      {/* OTP inputs */}
      <div className={shaking ? "shake" : ""}>
        <div className="otp-box" style={{ marginBottom:20 }} onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input key={i}
              ref={el => refs.current[i] = el}
              value={d}
              onChange={e => handleInput(i, e.target.value)}
              onKeyDown={e => handleKey(i, e)}
              maxLength={1}
              inputMode="numeric"
              className={d ? "filled" : ""}
              aria-label={"Digit " + (i+1)}
            />
          ))}
        </div>

        {err && <ErrBox msg={err} />}

        <button className="btn btn-primary" style={{ width:"100%", padding:"12px", fontSize:14, marginBottom:12 }}
          onClick={verify} disabled={busy || timer === 0}>
          {busy ? <><Spin /> Verifying…</> : "Verify & Activate →"}
        </button>

        <div style={{ textAlign:"center", fontSize:13, color:"var(--text3)", marginBottom:4 }}>
          Didn't receive it?{" "}
          <button type="button" onClick={handleResend} disabled={resendCd > 0}
            style={{ background:"none", border:"none", cursor: resendCd>0 ? "not-allowed":"pointer", color: resendCd>0 ? "var(--text3)":"var(--p)", fontWeight:700, fontSize:13 }}>
            {resendCd > 0 ? "Resend in " + resendCd + "s" : "Resend code"}
          </button>
        </div>
      </div>

      <div className="divider" />
      <button type="button" className="btn btn-ghost" style={{ width:"100%", fontSize:13 }} onClick={() => setScreen("signup")}>
        ← Back to Sign Up
      </button>
    </AuthShell>
  );
}

/* ══════════════════════════════════════════════════════
   SUCCESS PAGE
══════════════════════════════════════════════════════ */
function SuccessPage({ setScreen, pending }) {
  return (
    <AuthShell title="" subtitle="" step={3} totalSteps={3}>
      <div className="pop" style={{ textAlign:"center", padding:"10px 0 16px" }}>
        <div style={{ width:72, height:72, borderRadius:"50%", background:"var(--success-bg)", border:"2px solid #6ee7b7", display:"flex", alignItems:"center", justifyContent:"center", fontSize:34, margin:"0 auto 20px" }}>✓</div>
        <h2 style={{ fontSize:22, fontWeight:800, letterSpacing:"-.02em", marginBottom:8 }}>Account activated!</h2>
        <p style={{ color:"var(--text3)", fontSize:14, lineHeight:1.6, marginBottom:6 }}>
          Welcome to SHIFX,{" "}
          <strong style={{ color:"var(--text2)" }}>{pending?.name?.split(" ")[0]}</strong>!
        </p>
        <p style={{ color:"var(--text3)", fontSize:13, marginBottom:28 }}>
          Your email <strong style={{ color:"var(--text2)" }}>{pending?.email}</strong> has been verified.
        </p>
        <button className="btn btn-success" style={{ width:"100%", padding:"12px", fontSize:14 }}
          onClick={() => setScreen("login")}>
          Sign In to Your Account →
        </button>
      </div>
    </AuthShell>
  );
}

/* ══════════════════════════════════════════════════════
   SHOP PAGE
══════════════════════════════════════════════════════ */
function ShopPage() {
  /* ── All hooks MUST be called before any conditional return (React rules) ── */
  const { auth, logout, cartCount, wishlist, products, apiStatus } = useAuth();
  const [view,     setView]    = useState("shop");
  const [selected, setSelected]= useState(null);
  const [search,   setSearch]  = useState("");
  const [cat,      setCat]     = useState("All");
  const [sort,     setSort]    = useState("default");
  const [toast,    setToast]   = useState(null);

  /* ── Early returns for connection states (after all hooks) ── */
  if (apiStatus === "loading") return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,background:"var(--bg)"}}>
      <div style={{width:48,height:48,border:"4px solid var(--border2)",borderTopColor:"var(--p)",borderRadius:"50%",animation:"spin .8s linear infinite"}}/>
      <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:700,color:"var(--text2)",fontSize:15}}>Connecting to SHIFX…</div>
      <div style={{fontSize:12,color:"var(--text3)"}}>Make sure the backend is running on port 8000</div>
    </div>
  );
  if (apiStatus === "error") return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12,background:"var(--bg)",padding:20}}>
      <div style={{fontSize:48}}>🔌</div>
      <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:800,fontSize:20,color:"var(--text)"}}>Backend not reachable</div>
      <div style={{fontSize:13,color:"var(--text3)",textAlign:"center",maxWidth:360}}>Could not connect to <code style={{background:"var(--surface2)",padding:"2px 6px",borderRadius:4,fontSize:12}}>http://localhost:8000</code>. Start the FastAPI server and refresh.</div>
      <button className="btn btn-primary" style={{marginTop:8}} onClick={()=>window.location.reload()}>↻ Retry</button>
    </div>
  );

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 2500); };
  const openProduct = p => { setSelected(p); setView("product"); };
  const cats = ["All", ...new Set(products.map(p => p.cat))];

  const filtered = useMemo(() => {
    let list = products.filter(p => {
      const q = search.toLowerCase();
      return (!q || p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)) && (cat==="All"||p.cat===cat);
    });
    if (sort==="price-asc")  list = [...list].sort((a,b)=>a.price-b.price);
    if (sort==="price-desc") list = [...list].sort((a,b)=>b.price-a.price);
    if (sort==="rating")     list = [...list].sort((a,b)=>b.rating-a.rating);
    return list;
  }, [products, search, cat, sort]);

  const hdr = <ShopHeader auth={auth} logout={logout} cartCount={cartCount} wishlist={wishlist} setView={setView} />;

  if (view==="product" && selected) return <ProductDetail product={selected} onBack={()=>setView("shop")} showToast={showToast} setView={setView} header={hdr}/>;
  if (view==="cart")    return <CartPage     onBack={()=>setView("shop")} showToast={showToast} setView={setView} header={hdr}/>;
  if (view==="wishlist")return <WishlistPage onBack={()=>setView("shop")} openProduct={openProduct} showToast={showToast} header={hdr}/>;
  if (view==="orders")  return <OrdersPage   onBack={()=>setView("shop")} header={hdr}/>;

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      {hdr}
      {/* Hero */}
      <div style={{ background:"linear-gradient(135deg,#312e81 0%,#6366f1 52%,#06b6d4 100%)", padding:"52px 24px 44px", textAlign:"center", color:"#fff" }}>
        <h1 className="fu" style={{ fontSize:"clamp(24px,5vw,42px)", fontWeight:800, letterSpacing:"-.03em", marginBottom:10 }}>Shop the Future</h1>
        <p className="fu" style={{ fontSize:15, opacity:.85, marginBottom:26, animationDelay:".06s" }}>Premium tech — fast shipping, best prices</p>
        <div className="fu" style={{ maxWidth:480, margin:"0 auto", position:"relative", animationDelay:".12s" }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products…"
            style={{ width:"100%", padding:"13px 20px 13px 46px", borderRadius:50, border:"none", fontSize:14, outline:"none", background:"rgba(255,255,255,.18)", color:"#fff", backdropFilter:"blur(10px)" }}/>
          <span style={{ position:"absolute", left:17, top:"50%", transform:"translateY(-50%)", fontSize:16 }}>🔍</span>
        </div>
      </div>

      <div style={{ maxWidth:1280, margin:"0 auto", padding:"24px 20px" }}>
        <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
            {cats.map(c=>(
              <button key={c} type="button" onClick={()=>setCat(c)}
                style={{ padding:"6px 16px", borderRadius:20, border:"1.5px solid "+(cat===c?"var(--p)":"var(--border)"), background:cat===c?"var(--p)":"var(--surface)", color:cat===c?"#fff":"var(--text2)", fontSize:13, fontWeight:600, cursor:"pointer", transition:"all .15s" }}>
                {c}
              </button>
            ))}
          </div>
          <select value={sort} onChange={e=>setSort(e.target.value)}
            style={{ padding:"7px 12px", borderRadius:8, border:"1.5px solid var(--border)", fontSize:13, background:"var(--surface)", color:"var(--text)", outline:"none", cursor:"pointer" }}>
            <option value="default">Sort: Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
        <p style={{ fontSize:13, color:"var(--text3)", marginBottom:16 }}>{filtered.length} product{filtered.length!==1?"s":""}</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:18 }}>
          {filtered.map((p,i)=><ProductCard key={p.id} product={p} idx={i} onView={()=>openProduct(p)} showToast={showToast}/>)}
        </div>
        {filtered.length===0&&(
          <div style={{ textAlign:"center", padding:"64px 20px", color:"var(--text3)" }}>
            <div style={{ fontSize:42, marginBottom:12 }}>🔍</div>
            <p style={{ fontSize:16, fontWeight:700 }}>No products found</p>
          </div>
        )}
      </div>
      {toast && <Toast msg={toast}/>}
    </div>
  );
}

function ShopHeader({ auth, logout, cartCount, wishlist, setView }) {
  return (
    <header style={{ background:"var(--surface)", borderBottom:"1px solid var(--border)", position:"sticky", top:0, zIndex:100, boxShadow:"var(--sh-sm)" }}>
      <div style={{ maxWidth:1280, margin:"0 auto", padding:"0 20px", height:58, display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg,#6366f1,#06b6d4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:"#fff" }}>S</div>
          <span style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:16 }}>SHIFX</span>
          <span className="hide-mob" style={{ fontSize:10, color:"var(--cyan)", fontWeight:700, letterSpacing:".12em", textTransform:"uppercase" }}>PRODUCTS</span>
        </div>
        <div style={{ flex:1 }}/>
        <nav style={{ display:"flex", alignItems:"center", gap:2 }}>
          <button type="button" className="btn btn-ghost" onClick={()=>setView("shop")}>🏠 <span className="hide-mob">Shop</span></button>
          <button type="button" className="btn btn-ghost" onClick={()=>setView("wishlist")} style={{ position:"relative" }}>
            ❤️ <span className="hide-mob">Wishlist</span>
            {wishlist.length>0&&<span style={{ position:"absolute",top:5,right:5,width:15,height:15,borderRadius:"50%",background:"var(--danger)",color:"#fff",fontSize:9,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center" }}>{wishlist.length}</span>}
          </button>
          <button type="button" className="btn btn-ghost" onClick={()=>setView("orders")}>📦 <span className="hide-mob">Orders</span></button>
          <button type="button" className="btn btn-primary" onClick={()=>setView("cart")} style={{ position:"relative" }}>
            🛒 Cart
            {cartCount>0&&<span style={{ background:"var(--amber)",borderRadius:20,padding:"1px 7px",fontSize:10,fontWeight:800 }}>{cartCount}</span>}
          </button>
          <div style={{ width:1, height:22, background:"var(--border)", margin:"0 6px" }}/>
          <div onClick={logout} title="Sign out" style={{ display:"flex", alignItems:"center", gap:7, padding:"5px 10px", borderRadius:8, background:"var(--surface2)", cursor:"pointer" }}>
            <div style={{ width:26, height:26, borderRadius:6, background:"var(--p)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:10, fontWeight:800 }}>{auth.avatar}</div>
            <span className="hide-mob" style={{ fontSize:12, fontWeight:600, color:"var(--text2)" }}>{auth.name.split(" ")[0]}</span>
          </div>
        </nav>
      </div>
    </header>
  );
}

const ProductCard = memo(function ProductCard({ product, idx, onView, showToast }) {
  const { addToCart, toggleWishlist, wishlist } = useAuth();
  const liked = wishlist.some(w=>w.id===product.id);
  return (
    <div className="fu card" style={{ overflow:"hidden", animationDelay:(idx*0.04)+"s", transition:"transform .2s,box-shadow .2s" }}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="var(--sh-lg)"}}
      onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="var(--sh)"}}>
      <div style={{ position:"relative", cursor:"pointer" }} onClick={onView}>
        <img src={product.img} alt={product.name} style={{ width:"100%", height:200, objectFit:"cover", display:"block" }} loading="lazy"/>
        <span style={{ position:"absolute",top:10,left:10,background:"var(--p)",color:"#fff",fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:20 }}>{product.cat}</span>
        <button type="button"
          onClick={e=>{e.stopPropagation();toggleWishlist(product);showToast(liked?"Removed from wishlist":"Added to wishlist ❤️")}}
          style={{ position:"absolute",top:10,right:10,width:34,height:34,borderRadius:"50%",background:"rgba(255,255,255,.92)",border:"none",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"var(--sh-sm)",transition:"transform .15s" }}
          onMouseEnter={e=>e.currentTarget.style.transform="scale(1.18)"}
          onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
          aria-label={liked?"Remove from wishlist":"Add to wishlist"}>
          {liked?"❤️":"🤍"}
        </button>
      </div>
      <div style={{ padding:"14px 16px 16px" }}>
        <h3 style={{ fontSize:14,fontWeight:700,marginBottom:5,letterSpacing:"-.01em",cursor:"pointer" }} onClick={onView}>{product.name}</h3>
        <p style={{ fontSize:12,color:"var(--text3)",marginBottom:10,lineHeight:1.5,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical" }}>{product.desc}</p>
        <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:12 }}>
          <Stars rating={product.rating}/><span style={{ fontSize:11,color:"var(--text3)" }}>({product.reviews})</span>
        </div>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <span style={{ fontSize:18,fontWeight:800,color:"var(--p)" }}>{inr(product.price)}</span>
          <div style={{ display:"flex",gap:6 }}>
            <button type="button" className="btn btn-secondary" style={{ padding:"7px 11px",fontSize:12 }} onClick={onView}>Details</button>
            <button type="button" className="btn btn-primary"   style={{ padding:"7px 11px",fontSize:12 }} onClick={()=>{addToCart(product);showToast("Added to cart 🛒")}}>+ Cart</button>
          </div>
        </div>
      </div>
    </div>
  );
});

function ProductDetail({ product, onBack, showToast, setView, header }) {
  const { addToCart, toggleWishlist, wishlist, reviews, addReview, loadReviews, placeOrder, auth } = useAuth();
  const liked       = wishlist.some(w=>w.id===product.id);
  const prodReviews = reviews[product.id]||[];
  const [reviewText,   setReviewText]   = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [qty,          setQty]          = useState(1);
  const [ordered,      setOrdered]      = useState(false);
  useEffect(() => { loadReviews(product.id); }, [product.id]);

  const handleBuyNow = async () => {
    try {
      await placeOrder([{...product,qty}]);
      setOrdered(true);
      showToast("Order placed successfully! 🎉");
      setTimeout(()=>{setOrdered(false);setView("orders")},2000);
    } catch(e) { showToast("Order failed: " + e.message); }
  };
  const submitReview = () => {
    if (!reviewText.trim()) return;
    addReview(product.id,{user:auth.name,rating:reviewRating,text:reviewText,date:new Date().toLocaleDateString()}).catch(()=>{});
    setReviewText(""); setReviewRating(5); showToast("Review submitted ✓");
  };
  return (
    <div style={{ minHeight:"100vh",background:"var(--bg)" }}>
      {header}
      <div style={{ maxWidth:1100,margin:"0 auto",padding:"28px 20px" }}>
        <button type="button" className="btn btn-ghost" style={{ marginBottom:20 }} onClick={onBack}>← Back to Shop</button>
        <div className="fu card detail-grid" style={{ overflow:"hidden",marginBottom:24,display:"grid",gridTemplateColumns:"1fr 1fr" }}>
          <img src={product.img} alt={product.name} style={{ width:"100%",height:420,objectFit:"cover" }}/>
          <div style={{ padding:"32px 36px" }}>
            <span style={{ background:"var(--p-lt)",color:"var(--p)",fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20 }}>{product.cat}</span>
            <h1 style={{ fontSize:"clamp(20px,3vw,28px)",fontWeight:800,margin:"12px 0 10px",letterSpacing:"-.02em" }}>{product.name}</h1>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:14 }}>
              <Stars rating={product.rating} size={15}/><span style={{ fontSize:13,color:"var(--text3)" }}>{product.rating} · {prodReviews.length+product.reviews} reviews</span>
            </div>
            <p style={{ fontSize:14,color:"var(--text2)",lineHeight:1.75,marginBottom:20 }}>{product.desc}</p>
            <div style={{ fontSize:32,fontWeight:800,color:"var(--p)",marginBottom:20 }}>{inr(product.price)}</div>
            <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:20 }}>
              <span style={{ fontSize:13,fontWeight:600 }}>Qty:</span>
              <div style={{ display:"flex",alignItems:"center",background:"var(--surface2)",borderRadius:8,padding:"3px 6px",gap:8 }}>
                <button type="button" onClick={()=>setQty(q=>Math.max(1,q-1))} style={{ width:28,height:28,borderRadius:6,border:"none",background:"var(--surface)",cursor:"pointer",fontSize:16,fontWeight:700 }}>−</button>
                <span style={{ fontSize:14,fontWeight:700,minWidth:20,textAlign:"center" }}>{qty}</span>
                <button type="button" onClick={()=>setQty(q=>q+1)} style={{ width:28,height:28,borderRadius:6,border:"none",background:"var(--surface)",cursor:"pointer",fontSize:16,fontWeight:700 }}>+</button>
              </div>
              <span style={{ fontSize:12,color:"var(--success)" }}>✓ {product.stock} in stock</span>
            </div>
            <div style={{ display:"flex",gap:10,flexWrap:"wrap",marginBottom:10 }}>
              <button type="button" className="btn btn-primary" style={{ flex:1,padding:"13px" }} onClick={()=>{addToCart(product,qty);showToast("Added to cart 🛒")}}>🛒 Add to Cart</button>
              <button type="button" className="btn btn-amber"   style={{ flex:1,padding:"13px" }} onClick={handleBuyNow} disabled={ordered}>
                {ordered?"✓ Order Placed!":"⚡ Buy Now"}
              </button>
            </div>
            <button type="button"
              onClick={()=>{toggleWishlist(product);showToast(liked?"Removed from wishlist":"Added to wishlist ❤️")}}
              style={{ width:"100%",padding:"10px",borderRadius:8,border:"1.5px solid "+(liked?"var(--danger)":"var(--border)"),background:liked?"var(--danger-bg)":"transparent",color:liked?"var(--danger)":"var(--text2)",cursor:"pointer",fontSize:13,fontWeight:600 }}>
              {liked?"❤️ Wishlisted":"🤍 Add to Wishlist"}
            </button>
          </div>
        </div>
        <div className="card" style={{ padding:"24px 28px" }}>
          <h2 style={{ fontSize:18,fontWeight:800,marginBottom:20 }}>Customer Reviews ({prodReviews.length+product.reviews})</h2>
          {prodReviews.length>0&&(
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:14,marginBottom:24 }}>
              {prodReviews.map((r,i)=>(
                <div key={i} style={{ padding:"14px 16px",background:"var(--surface2)",borderRadius:10 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
                    <span style={{ fontWeight:700,fontSize:13 }}>{r.user}</span>
                    <span style={{ fontSize:11,color:"var(--text3)" }}>{r.date}</span>
                  </div>
                  <Stars rating={r.rating} size={13}/>
                  <p style={{ fontSize:13,color:"var(--text2)",marginTop:8,lineHeight:1.5 }}>{r.text}</p>
                </div>
              ))}
            </div>
          )}
          <div style={{ borderTop:"1px solid var(--border)",paddingTop:20 }}>
            <h3 style={{ fontSize:15,fontWeight:700,marginBottom:14 }}>Write a Review</h3>
            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:12,fontWeight:600,color:"var(--text2)",display:"block",marginBottom:6 }}>Rating</label>
              <div style={{ display:"flex",gap:4 }}>
                {[1,2,3,4,5].map(s=>(
                  <button key={s} type="button" onClick={()=>setReviewRating(s)} style={{ fontSize:22,background:"none",border:"none",cursor:"pointer",opacity:s<=reviewRating?1:.3,transition:"opacity .15s" }}>⭐</button>
                ))}
              </div>
            </div>
            <textarea value={reviewText} onChange={e=>setReviewText(e.target.value)} placeholder="Share your experience…"
              style={{ width:"100%",padding:"11px 14px",borderRadius:8,border:"1.5px solid var(--border)",fontSize:13,resize:"vertical",minHeight:90,outline:"none",color:"var(--text)" }}/>
            <button type="button" className="btn btn-primary" style={{ marginTop:10 }} onClick={submitReview}>Submit Review →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartPage({ onBack, showToast, setView, header }) {
  const { cart, removeFromCart, updateQty, placeOrder, token } = useAuth();
  const [ordered, setOrdered] = useState(false);
  const [step, setStep] = useState(1); // 1=cart, 2=address, 3=payment
  const [payMethod, setPayMethod] = useState("cod");
  const [addr, setAddr] = useState({
    name:"", phone:"", street:"", city:"", state:"Andhra Pradesh", pincode:"", landmark:""
  });
  const [addrErr, setAddrErr] = useState({});

  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);

  // Delivery charge based on pincode
  const getDeliveryCharge = (pincode) => {
    const nearPincodes = ["534101","534102","534103","534201","534202","534203","534301"];
    if (nearPincodes.includes(pincode.trim())) return 0;
    if (pincode.trim().startsWith("534")) return 50;
    return 100;
  };

  const deliveryCharge = addr.pincode.length === 6 ? getDeliveryCharge(addr.pincode) : 0;
  const grandTotal = total + deliveryCharge + (payMethod === "cod" ? 0 : 0);

  const validateAddr = () => {
    const e = {};
    if (!addr.name.trim())    e.name    = "Name required";
    if (!addr.phone.trim() || addr.phone.length < 10) e.phone = "Valid phone required";
    if (!addr.street.trim())  e.street  = "Address required";
    if (!addr.city.trim())    e.city    = "City required";
    if (!addr.pincode.trim() || addr.pincode.length !== 6) e.pincode = "Valid 6-digit pincode required";
    return e;
  };

  const handleOrder = async () => {
    if (!cart.length) return;
    try {
      await placeOrder(cart);
      setOrdered(true);
      showToast("Order placed successfully! 🎉");
      setTimeout(()=>{ setOrdered(false); setView("orders"); }, 2500);
    } catch(e) {
      showToast("Failed to place order. Try again.");
    }
  };

  // Step 1 — Cart Items
  if (step === 1) return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      {header}
      <div style={{ maxWidth:900, margin:"0 auto", padding:"28px 20px" }}>
        <button type="button" className="btn btn-ghost" style={{ marginBottom:20 }} onClick={onBack}>← Continue Shopping</button>
        <h1 style={{ fontSize:24, fontWeight:800, marginBottom:20 }}>Shopping Cart ({cart.length})</h1>
        {cart.length === 0 ? (
          <div className="card" style={{ padding:"64px 20px", textAlign:"center" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🛒</div>
            <p style={{ fontSize:16, fontWeight:700, marginBottom:12 }}>Your cart is empty</p>
            <button type="button" className="btn btn-primary" onClick={onBack}>Shop Now →</button>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:20, alignItems:"start" }} className="two-col">
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {cart.map((item,i) => (
                <div key={item.id} className="fu card" style={{ display:"flex", gap:14, padding:"14px 16px", animationDelay:(i*0.05)+"s" }}>
                  <img src={item.img} alt={item.name} style={{ width:80, height:80, objectFit:"cover", borderRadius:8, flexShrink:0 }}/>
                  <div style={{ flex:1 }}>
                    <h3 style={{ fontSize:14, fontWeight:700, marginBottom:4 }}>{item.name}</h3>
                    <p style={{ fontSize:12, color:"var(--text3)", marginBottom:10 }}>{item.cat}</p>
                    <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:7, background:"var(--surface2)", borderRadius:8, padding:"3px 6px" }}>
                        <button type="button" onClick={()=>updateQty(item.id,item.qty-1)} style={{ width:26, height:26, borderRadius:6, border:"none", background:"var(--surface)", cursor:"pointer", fontWeight:700 }}>−</button>
                        <span style={{ fontSize:14, fontWeight:700, minWidth:18, textAlign:"center" }}>{item.qty}</span>
                        <button type="button" onClick={()=>updateQty(item.id,item.qty+1)} style={{ width:26, height:26, borderRadius:6, border:"none", background:"var(--surface)", cursor:"pointer", fontWeight:700 }}>+</button>
                      </div>
                      <span style={{ fontSize:15, fontWeight:800, color:"var(--p)" }}>{inr(item.price*item.qty)}</span>
                      <button type="button" className="btn btn-danger" style={{ padding:"5px 10px", fontSize:12 }} onClick={()=>{ removeFromCart(item.id); showToast("Removed from cart"); }}>Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="card" style={{ padding:20, position:"sticky", top:78 }}>
              <h3 style={{ fontSize:16, fontWeight:800, marginBottom:16 }}>Order Summary</h3>
              {cart.map(i => (
                <div key={i.id} style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:8, color:"var(--text2)" }}>
                  <span>{i.name} x{i.qty}</span>
                  <span style={{ fontWeight:600 }}>{inr(i.price*i.qty)}</span>
                </div>
              ))}
              <div className="divider"/>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:16, fontWeight:800, marginBottom:20 }}>
                <span>Total</span>
                <span style={{ color:"var(--p)" }}>{inr(total)}</span>
              </div>
              <div style={{ background:"var(--emerald-lt)", border:"1px solid #6ee7b7", borderRadius:8, padding:"10px 14px", marginBottom:14, fontSize:12, color:"var(--emerald)" }}>
                🚚 Same day delivery for orders before 2PM
              </div>
              <button type="button" className="btn btn-primary" style={{ width:"100%", padding:"13px", fontSize:14 }} onClick={()=>setStep(2)}>
                Proceed to Delivery →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Step 2 — Delivery Address
  if (step === 2) return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      {header}
      <div style={{ maxWidth:700, margin:"0 auto", padding:"28px 20px" }}>
        <button type="button" className="btn btn-ghost" style={{ marginBottom:20 }} onClick={()=>setStep(1)}>← Back to Cart</button>
        <h1 style={{ fontSize:24, fontWeight:800, marginBottom:6 }}>📍 Delivery Address</h1>
        <p style={{ fontSize:13, color:"var(--text3)", marginBottom:24 }}>Store: Tadepalligudem, AP — Free delivery within 10km</p>
        <div className="card" style={{ padding:28 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }} className="two-col">
            <div className="field">
              <label>Full Name *</label>
              <input value={addr.name} onChange={e=>setAddr(p=>({...p,name:e.target.value}))} placeholder="Your full name" className={addrErr.name?"err":""}/>
              {addrErr.name && <div className="errmsg">{addrErr.name}</div>}
            </div>
            <div className="field">
              <label>Phone Number *</label>
              <input value={addr.phone} onChange={e=>setAddr(p=>({...p,phone:e.target.value}))} placeholder="10-digit mobile number" maxLength={10} className={addrErr.phone?"err":""}/>
              {addrErr.phone && <div className="errmsg">{addrErr.phone}</div>}
            </div>
          </div>
          <div className="field">
            <label>Street Address *</label>
            <textarea value={addr.street} onChange={e=>setAddr(p=>({...p,street:e.target.value}))} placeholder="House No, Street, Area" style={{ resize:"vertical", minHeight:70 }} className={addrErr.street?"err":""}/>
            {addrErr.street && <div className="errmsg">{addrErr.street}</div>}
          </div>
          <div className="field">
            <label>Landmark (Optional)</label>
            <input value={addr.landmark} onChange={e=>setAddr(p=>({...p,landmark:e.target.value}))} placeholder="Near school, temple etc."/>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }} className="two-col">
            <div className="field">
              <label>City *</label>
              <input value={addr.city} onChange={e=>setAddr(p=>({...p,city:e.target.value}))} placeholder="City" className={addrErr.city?"err":""}/>
              {addrErr.city && <div className="errmsg">{addrErr.city}</div>}
            </div>
            <div className="field">
              <label>State</label>
              <input value={addr.state} onChange={e=>setAddr(p=>({...p,state:e.target.value}))} placeholder="State"/>
            </div>
            <div className="field">
              <label>Pincode *</label>
              <input value={addr.pincode} onChange={e=>setAddr(p=>({...p,pincode:e.target.value}))} placeholder="6-digit pincode" maxLength={6} className={addrErr.pincode?"err":""}/>
              {addrErr.pincode && <div className="errmsg">{addrErr.pincode}</div>}
            </div>
          </div>

          {/* Delivery charge preview */}
          {addr.pincode.length === 6 && (
            <div style={{ background: deliveryCharge===0 ? "var(--emerald-lt)" : "var(--amber-lt)", border:"1px solid "+(deliveryCharge===0?"#6ee7b7":"#fcd34d"), borderRadius:8, padding:"12px 16px", marginBottom:16 }}>
              <div style={{ fontSize:13, fontWeight:700, color: deliveryCharge===0 ? "var(--emerald)" : "var(--amber-dk)" }}>
                {deliveryCharge === 0 ? "🎉 Free Delivery for your area!" : `🚚 Delivery charge: ${inr(deliveryCharge)}`}
              </div>
              <div style={{ fontSize:12, color:"var(--text3)", marginTop:3 }}>
                {deliveryCharge === 0 ? "You are within 10km of our store" : "Based on distance from Tadepalligudem"}
              </div>
            </div>
          )}

          <button type="button" className="btn btn-primary" style={{ width:"100%", padding:"13px", fontSize:14 }}
            onClick={()=>{ const e=validateAddr(); if(Object.keys(e).length){setAddrErr(e);return;} setAddrErr({}); setStep(3); }}>
            Continue to Payment →
          </button>
        </div>
      </div>
    </div>
  );

  // Step 3 — Payment
  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      {header}
      <div style={{ maxWidth:700, margin:"0 auto", padding:"28px 20px" }}>
        <button type="button" className="btn btn-ghost" style={{ marginBottom:20 }} onClick={()=>setStep(2)}>← Back to Address</button>
        <h1 style={{ fontSize:24, fontWeight:800, marginBottom:24 }}>💳 Payment</h1>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:20 }} className="two-col">
          {/* COD */}
          <div onClick={()=>setPayMethod("cod")} style={{ cursor:"pointer", border:"2px solid "+(payMethod==="cod"?"var(--p)":"var(--border)"), borderRadius:12, padding:"18px 20px", background: payMethod==="cod"?"var(--p-lt)":"var(--surface)", transition:"all .2s" }}>
            <div style={{ fontSize:28, marginBottom:8 }}>💵</div>
            <div style={{ fontWeight:800, fontSize:15, marginBottom:4 }}>Cash on Delivery</div>
            <div style={{ fontSize:12, color:"var(--text3)" }}>Pay when your order arrives</div>
            {deliveryCharge > 0 && <div style={{ fontSize:11, color:"var(--amber-dk)", marginTop:6, fontWeight:600 }}>+ {inr(deliveryCharge)} delivery charge</div>}
            {deliveryCharge === 0 && <div style={{ fontSize:11, color:"var(--emerald)", marginTop:6, fontWeight:600 }}>✓ Free delivery</div>}
          </div>
          {/* UPI */}
          <div onClick={()=>setPayMethod("upi")} style={{ cursor:"pointer", border:"2px solid "+(payMethod==="upi"?"var(--p)":"var(--border)"), borderRadius:12, padding:"18px 20px", background: payMethod==="upi"?"var(--p-lt)":"var(--surface)", transition:"all .2s" }}>
            <div style={{ fontSize:28, marginBottom:8 }}>📱</div>
            <div style={{ fontWeight:800, fontSize:15, marginBottom:4 }}>UPI Payment</div>
            <div style={{ fontSize:12, color:"var(--text3)" }}>PhonePe / GPay / Paytm</div>
            <div style={{ fontSize:11, color:"var(--emerald)", marginTop:6, fontWeight:600 }}>✓ Instant payment</div>
          </div>
        </div>

        {/* UPI QR Code */}
        {payMethod === "upi" && (
          <div className="card fu" style={{ padding:24, textAlign:"center", marginBottom:20 }}>
            <h3 style={{ fontSize:16, fontWeight:800, marginBottom:4 }}>Scan & Pay</h3>
            <p style={{ fontSize:13, color:"var(--text3)", marginBottom:16 }}>Open PhonePe / GPay / Paytm → Scan QR</p>
            <div style={{ display:"inline-block", padding:12, background:"#fff", borderRadius:12, border:"2px solid var(--border)", boxShadow:"var(--sh)" }}>
              <img src="/qr-code.jpg" alt="UPI QR Code"
                style={{ width:200, height:200, display:"block" }}
                onError={e=>{ e.target.style.display="none"; e.target.nextSibling.style.display="block"; }}
              />
              <div style={{ display:"none", width:200, height:200, background:"var(--surface2)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:8 }}>
                <div style={{ fontSize:32 }}>📱</div>
                <div style={{ fontSize:12, color:"var(--text3)" }}>QR Code</div>
              </div>
            </div>
            <div style={{ marginTop:16, padding:"10px 16px", background:"var(--p-lt)", borderRadius:8, display:"inline-block" }}>
              <div style={{ fontSize:11, color:"var(--text3)", marginBottom:2 }}>UPI ID</div>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:14, fontWeight:700, color:"var(--p)" }}>9182772300-2@axl</div>
            </div>
            <p style={{ fontSize:12, color:"var(--text3)", marginTop:12 }}>Amount to pay: <strong style={{ color:"var(--p)" }}>{inr(grandTotal)}</strong></p>
          </div>
        )}

        {/* Order Summary */}
        <div className="card" style={{ padding:20, marginBottom:20 }}>
          <h3 style={{ fontSize:15, fontWeight:800, marginBottom:14 }}>Order Summary</h3>
          {cart.map(i => (
            <div key={i.id} style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:8, color:"var(--text2)" }}>
              <span>{i.name} x{i.qty}</span>
              <span style={{ fontWeight:600 }}>{inr(i.price*i.qty)}</span>
            </div>
          ))}
          <div className="divider"/>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:6, color:"var(--text2)" }}>
            <span>Subtotal</span><span>{inr(total)}</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:6, color:"var(--text2)" }}>
            <span>Delivery</span>
            <span style={{ color: deliveryCharge===0?"var(--emerald)":"var(--text2)", fontWeight:600 }}>
              {deliveryCharge === 0 ? "FREE" : inr(deliveryCharge)}
            </span>
          </div>
          <div className="divider"/>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:17, fontWeight:800 }}>
            <span>Grand Total</span>
            <span style={{ color:"var(--p)" }}>{inr(grandTotal)}</span>
          </div>
        </div>

        {/* Delivery Address Summary */}
        <div className="card" style={{ padding:16, marginBottom:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <h3 style={{ fontSize:14, fontWeight:700 }}>📍 Delivering to</h3>
            <button type="button" onClick={()=>setStep(2)} style={{ background:"none", border:"none", color:"var(--p)", fontWeight:700, cursor:"pointer", fontSize:12 }}>Change</button>
          </div>
          <div style={{ fontSize:13, color:"var(--text2)", lineHeight:1.7 }}>
            <strong>{addr.name}</strong> · {addr.phone}<br/>
            {addr.street}{addr.landmark?`, ${addr.landmark}`:""}<br/>
            {addr.city}, {addr.state} — {addr.pincode}
          </div>
        </div>

        {/* Estimated Delivery */}
        <div style={{ background:"var(--emerald-lt)", border:"1px solid #6ee7b7", borderRadius:10, padding:"12px 16px", marginBottom:20, display:"flex", gap:12, alignItems:"center" }}>
          <span style={{ fontSize:22 }}>🚚</span>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:"var(--emerald)" }}>Estimated Delivery: 3-5 Business Days</div>
            <div style={{ fontSize:12, color:"var(--text3)" }}>From Tadepalligudem store · Agent pickup → Door delivery</div>
          </div>
        </div>

        <button type="button" className="btn btn-amber" style={{ width:"100%", padding:"14px", fontSize:15, fontWeight:800 }}
          onClick={handleOrder} disabled={ordered}>
          {ordered ? "✓ Order Placed!" : payMethod==="cod" ? "⚡ Place Order (COD)" : "✅ Confirm UPI Payment & Place Order"}
        </button>

        {/* Customer Care */}
        <div style={{ textAlign:"center", marginTop:16, fontSize:13, color:"var(--text3)" }}>
          Need help? Call us: <a href="tel:9182772300" style={{ color:"var(--p)", fontWeight:700, textDecoration:"none" }}>📞 9182772300</a>
        </div>
      </div>
    </div>
  );
}

function WishlistPage({ onBack, openProduct, showToast, header }) {
  const { wishlist, toggleWishlist, addToCart } = useAuth();
  return (
    <div style={{ minHeight:"100vh",background:"var(--bg)" }}>
      {header}
      <div style={{ maxWidth:1100,margin:"0 auto",padding:"28px 20px" }}>
        <button type="button" className="btn btn-ghost" style={{ marginBottom:20 }} onClick={onBack}>← Back to Shop</button>
        <h1 style={{ fontSize:24,fontWeight:800,marginBottom:20 }}>My Wishlist ({wishlist.length})</h1>
        {wishlist.length===0?(
          <div className="card" style={{ padding:"64px 20px",textAlign:"center" }}>
            <div style={{ fontSize:48,marginBottom:12 }}>❤️</div>
            <p style={{ fontSize:16,fontWeight:700,marginBottom:12 }}>Your wishlist is empty</p>
            <button type="button" className="btn btn-primary" onClick={onBack}>Discover Products →</button>
          </div>
        ):(
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:16 }}>
            {wishlist.map((p,i)=>(
              <div key={p.id} className="fu card" style={{ overflow:"hidden",animationDelay:(i*0.05)+"s" }}>
                <img src={p.img} alt={p.name} style={{ width:"100%",height:170,objectFit:"cover",cursor:"pointer" }} onClick={()=>openProduct(p)}/>
                <div style={{ padding:"12px 14px 14px" }}>
                  <h3 style={{ fontSize:14,fontWeight:700,marginBottom:4 }}>{p.name}</h3>
                  <div style={{ fontSize:16,fontWeight:800,color:"var(--p)",marginBottom:10 }}>{inr(p.price)}</div>
                  <div style={{ display:"flex",gap:7 }}>
                    <button type="button" className="btn btn-primary" style={{ flex:1,padding:"8px",fontSize:12 }} onClick={()=>{addToCart(p);showToast("Added to cart 🛒")}}>+ Cart</button>
                    <button type="button" className="btn btn-danger"  style={{ padding:"8px 11px",fontSize:13 }} onClick={()=>{toggleWishlist(p);showToast("Removed from wishlist")}} aria-label="Remove">🗑</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OrdersPage({ onBack, header }) {
  const { orders } = useAuth();
  return (
    <div style={{ minHeight:"100vh",background:"var(--bg)" }}>
      {header}
      <div style={{ maxWidth:860,margin:"0 auto",padding:"28px 20px" }}>
        <button type="button" className="btn btn-ghost" style={{ marginBottom:20 }} onClick={onBack}>← Back to Shop</button>
        <h1 style={{ fontSize:24,fontWeight:800,marginBottom:20 }}>My Orders ({orders.length})</h1>
        {orders.length===0?(
          <div className="card" style={{ padding:"64px 20px",textAlign:"center" }}>
            <div style={{ fontSize:48,marginBottom:12 }}>📦</div>
            <p style={{ fontSize:16,fontWeight:700,marginBottom:12 }}>No orders yet</p>
            <button type="button" className="btn btn-primary" onClick={onBack}>Shop Now →</button>
          </div>
        ):(
          <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
            {orders.map((o,i)=>(
              <div key={o.id} className="fu card" style={{ padding:"18px 20px",animationDelay:(i*0.05)+"s" }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,flexWrap:"wrap",gap:10 }}>
                  <div>
                    <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:"var(--text3)",marginBottom:3 }}>ORDER #{o.id}</div>
                    <div style={{ fontSize:13,color:"var(--text2)" }}>Placed on {o.date}</div>
                  </div>
                  <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                    <span style={{ fontSize:18,fontWeight:800,color:"var(--p)" }}>{inr(o.total)}</span>
                    <Bdg color="var(--success)">✓ {o.status}</Bdg>
                  </div>
                </div>
                <div style={{ display:"flex",gap:10,flexWrap:"wrap" }}>
                  {o.items.map(item=>(
                    <div key={item.id} style={{ display:"flex",alignItems:"center",gap:8,background:"var(--surface2)",borderRadius:8,padding:"6px 10px" }}>
                      <img src={item.img} alt={item.name} style={{ width:32,height:32,borderRadius:6,objectFit:"cover" }}/>
                      <div>
                        <div style={{ fontSize:12,fontWeight:600 }}>{item.name}</div>
                        <div style={{ fontSize:11,color:"var(--text3)" }}>x{item.qty} · {inr(item.price)}</div>
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

/* ══════════════════════════════════════════════════════
   DASHBOARD SHELL
══════════════════════════════════════════════════════ */
function DashShell({ nav, accentColor, accentBg, roleName }) {
  const { auth, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(nav[0].key);
  const [sideOpen,  setSideOpen]  = useState(false);
  const cur = nav.find(n=>n.key===activeTab);
  return (
    <div style={{ display:"flex",height:"100vh",overflow:"hidden",background:"var(--bg)" }}>
      <style>{":root{--nav-bg:"+accentBg+";--nav-color:"+accentColor+"}"}</style>
      {sideOpen&&<div onClick={()=>setSideOpen(false)} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:199 }}/>}
      <aside className={"sidebar"+(sideOpen?" sb-open":"")}>
        <div style={{ padding:"16px 14px 12px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ width:32,height:32,borderRadius:8,background:"linear-gradient(135deg,#6366f1,#06b6d4)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:14,fontWeight:800,flexShrink:0 }}>S</div>
          <div>
            <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:800,fontSize:14 }}>SHIFX</div>
            <div style={{ fontSize:9,color:accentColor,fontWeight:700,textTransform:"uppercase",letterSpacing:".1em" }}>{roleName}</div>
          </div>
        </div>
        <nav style={{ flex:1,padding:"10px 8px",overflowY:"auto" }}>
          {nav.map(n=>(
            <button key={n.key} type="button" className={"nav-link"+(activeTab===n.key?" active":"")} onClick={()=>{setActiveTab(n.key);setSideOpen(false)}}>
              <span style={{ fontSize:15 }}>{n.icon}</span><span>{n.label}</span>
              {n.badge&&<span style={{ marginLeft:"auto",background:accentColor,color:"#fff",borderRadius:20,padding:"1px 7px",fontSize:10,fontWeight:800 }}>{n.badge}</span>}
            </button>
          ))}
        </nav>
        <div style={{ padding:"10px",borderTop:"1px solid var(--border)" }}>
          <div style={{ display:"flex",alignItems:"center",gap:8,padding:"9px 10px",borderRadius:8,background:"var(--surface2)" }}>
            <div style={{ width:28,height:28,borderRadius:7,background:accentColor,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:10,fontWeight:800,flexShrink:0 }}>{auth.avatar}</div>
            <div style={{ flex:1,minWidth:0 }}>
              <div style={{ fontSize:12,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{auth.name}</div>
              <div style={{ fontSize:9,color:accentColor,fontWeight:700,textTransform:"uppercase" }}>{auth.role}</div>
            </div>
            <button type="button" onClick={logout} title="Sign out" style={{ background:"none",border:"none",cursor:"pointer",color:"var(--text3)",fontSize:15,flexShrink:0 }}>↩</button>
          </div>
        </div>
      </aside>
      <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden" }}>
        <header style={{ height:52,padding:"0 22px",borderBottom:"1px solid var(--border)",background:"var(--surface)",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0 }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <button type="button" className="mob-btn" onClick={()=>setSideOpen(v=>!v)}
              style={{ background:"none",border:"none",cursor:"pointer",fontSize:18,color:"var(--text2)",padding:4,display:"none" }} aria-label="Menu">☰</button>
            <h2 style={{ fontSize:14,fontWeight:700 }}>{cur?.icon} {cur?.label}</h2>
          </div>
          <button type="button" className="btn btn-secondary" style={{ fontSize:12 }} onClick={logout}>Sign out</button>
        </header>
        <div style={{ flex:1,overflowY:"auto",padding:"24px" }}>
          <div className="fu" key={activeTab}>{cur?.component}</div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   ADMIN DASHBOARD
══════════════════════════════════════════════════════ */
function AdminDash() {
  const nav = [
    { key:"overview",  label:"Overview",        icon:"◈", component:<AdminOverview/> },
    { key:"users",     label:"User Management", icon:"👥", component:<AdminUsers/> },
    { key:"products",  label:"Products",        icon:"📦", component:<AdminProducts/> },
    { key:"orders",    label:"Orders",          icon:"🛒", component:<AdminOrders/> },
    { key:"analytics", label:"Analytics",       icon:"📊", component:<AdminAnalytics/> },
    { key:"settings",  label:"Settings",        icon:"⚙️", component:<AdminSettings/> },
  ];
  return <DashShell nav={nav} accentColor="#f43f5e" accentBg="rgba(244,63,94,.08)" roleName="Admin Portal"/>;
}

function AdminOverview() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  useEffect(() => {
    apiFetch("/admin/analytics", { token }).then(setData).catch(() => {});
  }, [token]);
  const stats = data ? [
    {label:"Total Users",   value:data.total_users.toLocaleString("en-IN"),   delta:"live", icon:"👥", c:"#6366f1"},
    {label:"Total Products",value:data.total_products.toLocaleString("en-IN"),delta:"live", icon:"📦", c:"#06b6d4"},
    {label:"Total Revenue", value:"₹"+Math.round(data.total_revenue/100000).toLocaleString("en-IN")+"L", delta:"live", icon:"💰", c:"#10b981"},
    {label:"Total Orders",  value:data.total_orders.toLocaleString("en-IN"),  delta:"live", icon:"🛒", c:"#F59E0B"},
  ] : [{label:"Loading…",value:"—",delta:"",icon:"⏳",c:"var(--text3)"}];
  return (
    <div>
      <PgHdr title="Admin Overview" subtitle="Platform health at a glance">
        <button type="button" className="btn btn-secondary" style={{ fontSize:12 }}>↓ Export</button>
        <button type="button" className="btn btn-primary"   style={{ fontSize:12 }}>+ Add User</button>
      </PgHdr>
      <div className="stat-grid" style={{ marginBottom:20 }}>{stats.map(s=><StatBox key={s.label} {...s}/>)}</div>
      <div style={{ display:"grid",gridTemplateColumns:"3fr 2fr",gap:14,marginBottom:20 }} className="two-col">
        <div className="card" style={{ padding:20 }}>
          <h3 style={{ fontSize:14,fontWeight:700,marginBottom:14 }}>Platform Revenue (2025)</h3>
          <BarChart data={[42,68,55,78,90,82,95,88,103,115,98,124]} color="#6366f1"/>
          <MonthLabels/>
        </div>
        <div className="card" style={{ padding:20 }}>
          <h3 style={{ fontSize:14,fontWeight:700,marginBottom:14 }}>User Roles</h3>
          {[{r:"Regular Users",p:72,c:"#6366f1"},{r:"Companies",p:20,c:"#06b6d4"},{r:"Admins",p:8,c:"var(--danger)"}].map(x=>(
            <div key={x.r} style={{ marginBottom:14 }}>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5,fontSize:12 }}>
                <span style={{ color:"var(--text2)" }}>{x.r}</span><span style={{ color:x.c,fontWeight:700 }}>{x.p}%</span>
              </div>
              <div style={{ height:6,background:"var(--surface2)",borderRadius:3,overflow:"hidden" }}>
                <div style={{ width:x.p+"%",height:"100%",background:x.c,borderRadius:3 }}/>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="card" style={{ padding:20 }}>
        <h3 style={{ fontSize:14,fontWeight:700,marginBottom:14 }}>Recent Activity</h3>
        <div style={{ overflowX:"auto" }}>
          <table className="tbl">
            <thead><tr><th>Event</th><th>User</th><th>Role</th><th>Time</th><th>Status</th></tr></thead>
            <tbody>
              {[{ev:"New Registration",u:"alex@mail.com",r:"user",t:"2m ago",s:"success"},{ev:"Company Login",u:"corp@tech.io",r:"company",t:"8m ago",s:"success"},{ev:"Failed Login",u:"unknown@mail.com",r:"—",t:"15m ago",s:"error"},{ev:"Product Added",u:"employee1@123",r:"company",t:"1h ago",s:"success"},{ev:"Order Placed",u:"user@mail.com",r:"user",t:"2h ago",s:"success"}].map((row,i)=>(
                <tr key={i}>
                  <td style={{ fontWeight:600,color:"var(--text)" }}>{row.ev}</td><td>{row.u}</td>
                  <td><Bdg color={row.r==="user"?"#6366f1":row.r==="company"?"#06b6d4":"var(--text3)"}>{row.r}</Bdg></td>
                  <td style={{ color:"var(--text3)" }}>{row.t}</td>
                  <td><Bdg color={row.s==="success"?"#10b981":"var(--danger)"}>{row.s}</Bdg></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminUsers() {
  const { token } = useAuth();
  const [users,setUsers]=useState([]);
  const [q,setQ]=useState("");
  const [busy,setBusy]=useState({});
  useEffect(()=>{
    apiFetch("/admin/users",{token}).then(setUsers).catch(()=>{});
  },[token]);
  const filtered=users.filter(u=>
    u.full_name?.toLowerCase().includes(q.toLowerCase())||
    u.email?.toLowerCase().includes(q.toLowerCase())
  );
  const toggleStatus=async(u)=>{
    setBusy(p=>({...p,[u.id]:true}));
    try{
      const updated=await apiFetch("/admin/users/"+u.id+"/status",{method:"PATCH",body:{is_active:!u.is_active},token});
      setUsers(p=>p.map(x=>x.id===u.id?updated:x));
    }catch(e){alert(e.message);}
    finally{setBusy(p=>({...p,[u.id]:false}));}
  };
  return (
    <div>
      <PgHdr title="User Management" subtitle={users.length+" accounts"}>
        <button type="button" className="btn btn-primary" style={{ fontSize:12 }}>+ Add User</button>
      </PgHdr>
      <div className="card" style={{ padding:20 }}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍  Search users…"
          style={{ padding:"9px 14px",borderRadius:8,border:"1.5px solid var(--border)",fontSize:13,width:"100%",maxWidth:300,marginBottom:16,background:"var(--surface2)",color:"var(--text)",outline:"none" }}/>
        <div style={{ overflowX:"auto" }}>
          <table className="tbl">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map((u,i)=>{
                const st=u.is_active?(u.is_verified?"active":"unverified"):"suspended";
                return (
                  <tr key={u.id||i}>
                    <td style={{ fontWeight:600,color:"var(--text)" }}>{u.full_name}</td>
                    <td>{u.email}</td>
                    <td><Bdg color={u.role==="admin"?"var(--danger)":u.role==="company"?"#06b6d4":"#6366f1"}>{u.role}</Bdg></td>
                    <td><Bdg color={st==="active"?"#10b981":st==="unverified"?"#f59e0b":"var(--danger)"}>{st}</Bdg></td>
                    <td style={{color:"var(--text3)",fontSize:12}}>{new Date(u.created_at).toLocaleDateString("en-IN")}</td>
                    <td>
                      <button type="button" className={u.is_active?"btn btn-danger":"btn btn-success"} style={{ padding:"5px 10px",fontSize:11 }}
                        disabled={!!busy[u.id]} onClick={()=>toggleStatus(u)}>
                        {busy[u.id]?"…":u.is_active?"Suspend":"Activate"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminProducts() {
  const { products } = useAuth();
  return (
    <div>
      <PgHdr title="Product Management" subtitle={products.length+" products"}>
        <button type="button" className="btn btn-primary" style={{ fontSize:12 }}>+ Add Product</button>
      </PgHdr>
      <div className="card" style={{ padding:20 }}>
        <div style={{ overflowX:"auto" }}>
          <table className="tbl">
            <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Rating</th><th>Actions</th></tr></thead>
            <tbody>
              {products.map((p,i)=>(
                <tr key={i}>
                  <td><div style={{ display:"flex",alignItems:"center",gap:10 }}><img src={p.img} alt={p.name} style={{ width:36,height:36,borderRadius:6,objectFit:"cover" }}/><span style={{ fontWeight:600,color:"var(--text)" }}>{p.name}</span></div></td>
                  <td><Bdg color="#6366f1">{p.cat}</Bdg></td>
                  <td style={{ fontWeight:700,color:"var(--p)" }}>{inr(p.price)}</td>
                  <td style={{ fontWeight:600,color:p.stock<20?"var(--danger)":"#10b981" }}>{p.stock}</td>
                  <td><Stars rating={p.rating} size={12}/></td>
                  <td><div style={{ display:"flex",gap:5 }}><button type="button" className="btn btn-secondary" style={{ padding:"5px 10px",fontSize:11 }}>Edit</button><button type="button" className="btn btn-danger" style={{ padding:"5px 10px",fontSize:11 }}>Remove</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminOrders() {
  const { token } = useAuth();
  const [orders,setOrders]=useState([]);
  useEffect(()=>{
    apiFetch("/admin/orders",{token}).then(setOrders).catch(()=>{});
  },[token]);
  return (
    <div>
      <PgHdr title="Orders Overview" subtitle={orders.length+" orders"}><button type="button" className="btn btn-secondary" style={{ fontSize:12 }}>↓ Export</button></PgHdr>
      <div className="card" style={{ padding:20 }}><div style={{ overflowX:"auto" }}>
        <table className="tbl">
          <thead><tr><th>Order ID</th><th>Items</th><th>Total</th><th>Date</th><th>Status</th></tr></thead>
          <tbody>
            {orders.length===0&&<tr><td colSpan={5} style={{textAlign:"center",color:"var(--text3)",padding:24}}>No orders yet</td></tr>}
            {orders.map((o,i)=>(
              <tr key={i}>
                <td style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:12,fontWeight:600 }}>#{o.id}</td>
                <td style={{ textAlign:"center" }}>{(o.items||[]).length}</td>
                <td style={{ fontWeight:700,color:"var(--p)" }}>{inr(o.total)}</td>
                <td style={{ color:"var(--text3)",fontSize:12 }}>{new Date(o.created_at).toLocaleDateString("en-IN")}</td>
                <td><Bdg color={o.status==="delivered"?"#10b981":o.status==="shipped"?"#06b6d4":o.status==="processing"?"#f59e0b":"#6366f1"}>{o.status}</Bdg></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div></div>
    </div>
  );
}

function AdminAnalytics() {
  const { token } = useAuth();
  const [data,setData]=useState(null);
  useEffect(()=>{ apiFetch("/admin/analytics",{token}).then(setData).catch(()=>{}); },[token]);
  const avgOrder = data && data.total_orders>0 ? Math.round(data.total_revenue/data.total_orders) : 0;
  const stats = data ? [
    {label:"Total Users",   value:data.total_users.toLocaleString("en-IN"),   delta:"all time", icon:"👥", c:"#6366f1"},
    {label:"Total Products",value:data.total_products.toLocaleString("en-IN"),delta:"active",   icon:"📦", c:"#10b981"},
    {label:"Avg Order",     value:inr(avgOrder),                               delta:"per order",icon:"💳", c:"#F59E0B"},
    {label:"Total Revenue", value:"₹"+Math.round(data.total_revenue/100000).toLocaleString("en-IN")+"L", delta:"cumulative", icon:"💰", c:"#06b6d4"},
  ] : [{label:"Loading…",value:"—",delta:"",icon:"⏳",c:"var(--text3)"}];
  return (
    <div>
      <PgHdr title="Analytics" subtitle="Platform performance"/>
      <div className="stat-grid" style={{ marginBottom:20 }}>
        {stats.map(s=><StatBox key={s.label} {...s}/>)}
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }} className="two-col">
        <div className="card" style={{ padding:20 }}><h3 style={{ fontSize:14,fontWeight:700,marginBottom:14 }}>Daily Active Users</h3><BarChart data={[1200,1450,1100,1800,1620,2100,1950,2400,2200,2800,2650,3100]} color="#6366f1"/><MonthLabels/></div>
        <div className="card" style={{ padding:20 }}>
          <h3 style={{ fontSize:14,fontWeight:700,marginBottom:14 }}>Sales by Category</h3>
          {[{cat:"Phones",p:32,c:"#6366f1"},{cat:"Audio",p:24,c:"#06b6d4"},{cat:"Peripherals",p:18,c:"#F59E0B"},{cat:"Wearables",p:14,c:"#10b981"},{cat:"Others",p:12,c:"#9CA3AF"}].map(x=>(
            <div key={x.cat} style={{ display:"flex",alignItems:"center",gap:10,marginBottom:10 }}>
              <span style={{ fontSize:12,width:82,color:"var(--text2)" }}>{x.cat}</span>
              <div style={{ flex:1,height:6,background:"var(--surface2)",borderRadius:3,overflow:"hidden" }}><div style={{ width:x.p+"%",height:"100%",background:x.c,borderRadius:3 }}/></div>
              <span style={{ fontSize:11,fontWeight:700,color:x.c,width:32 }}>{x.p}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminSettings() {
  const items=[{label:"Email Notifications",desc:"Critical system event alerts",on:true},{label:"Two-Factor Auth",desc:"Enforce 2FA for all admins",on:true},{label:"Auto-approve Signups",desc:"Skip manual review",on:false},{label:"Maintenance Mode",desc:"Read-only platform mode",on:false},{label:"OTP Rate Limiting",desc:"Block >5 OTP requests per 10 min",on:true}];
  const [ts,setTs]=useState(items.map(x=>x.on));
  return (
    <div>
      <PgHdr title="Platform Settings" subtitle="System-wide configuration"/>
      <div style={{ display:"grid",gap:10,maxWidth:560 }}>
        {items.map((s,i)=>(
          <div key={i} className="card" style={{ padding:"15px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:14 }}>
            <div><div style={{ fontWeight:600,fontSize:14,marginBottom:2 }}>{s.label}</div><div style={{ fontSize:12,color:"var(--text3)" }}>{s.desc}</div></div>
            <Toggle on={ts[i]} onChange={()=>setTs(p=>{const n=[...p];n[i]=!n[i];return n})} color="var(--danger)"/>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   COMPANY DASHBOARD
══════════════════════════════════════════════════════ */
function CompanyDash() {
  const { products, addProduct } = useAuth();
  const nav=[
    { key:"overview", label:"Overview",       icon:"◈", component:<CompanyOverview/> },
    { key:"upload",   label:"Upload Product", icon:"📤", component:<CompanyUpload addProduct={addProduct}/> },
    { key:"inventory",label:"Inventory",      icon:"📦", component:<CompanyInventory/> },
    { key:"sales",    label:"Sales Report",   icon:"📊", component:<CompanySales/> },
    { key:"profile",  label:"Company Profile",icon:"🏢", component:<CompanyProfilePage/> },
  ];
  return <DashShell nav={nav} accentColor="#0891b2" accentBg="rgba(6,182,212,.1)" roleName="Company Portal"/>;
}

function CompanyOverview() {
  const { token } = useAuth();
  const [cs,setCs]=useState(null);
  useEffect(()=>{ apiFetch("/company/stats",{token}).then(setCs).catch(()=>{}); },[token]);
  const stats = cs ? [
    {label:"Active Products",value:cs.product_count.toLocaleString("en-IN"),   delta:"your listings", icon:"📦",c:"#06b6d4"},
    {label:"Total Revenue",  value:"₹"+Math.round(cs.total_revenue/100000).toLocaleString("en-IN")+"L", delta:"all time", icon:"💰",c:"#10b981"},
    {label:"Total Orders",   value:cs.total_orders.toLocaleString("en-IN"),     delta:"involving your items", icon:"🛒",c:"#6366f1"},
    {label:"Avg Rating",     value:cs.avg_rating.toFixed(1)+"★",               delta:"across products", icon:"⭐",c:"#F59E0B"},
  ] : [{label:"Loading…",value:"—",delta:"",icon:"⏳",c:"var(--text3)"}];
  return (
    <div>
      <PgHdr title="Company Dashboard" subtitle="SHIFX Products Partner"><button type="button" className="btn btn-cyan" style={{ fontSize:12 }}>+ Upload Product</button></PgHdr>
      <div className="stat-grid" style={{ marginBottom:20 }}>{stats.map(s=><StatBox key={s.label} {...s}/>)}</div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }} className="two-col">
        <div className="card" style={{ padding:20 }}><h3 style={{ fontSize:14,fontWeight:700,marginBottom:14 }}>Monthly Sales</h3><BarChart data={[3200,4500,3800,6000,5200,7500,6800,8000,7300,9000,8500,9500]} color="#06b6d4"/><MonthLabels/></div>
        <div className="card" style={{ padding:20 }}>
          <h3 style={{ fontSize:14,fontWeight:700,marginBottom:14 }}>Top Products</h3>
          {[{n:"Wireless Headphones",sales:234,rev:"₹17.4L"},{n:"Smart Watch",sales:189,rev:"₹30.7L"},{n:"Mechanical Keyboard",sales:156,rev:"₹16.6L"},{n:"Gaming Mouse",sales:143,rev:"₹7.1L"}].map((p,i)=>(
            <div key={i} style={{ display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:i<3?"1px solid var(--border)":"none" }}>
              <div><div style={{ fontSize:13,fontWeight:600 }}>{p.n}</div><div style={{ fontSize:11,color:"var(--text3)" }}>{p.sales} sold</div></div>
              <span style={{ fontSize:13,fontWeight:700,color:"#06b6d4" }}>{p.rev}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CompanyUpload({ addProduct }) {
  const [form,setForm]=useState({name:"",price:"",cat:"Audio",desc:"",stock:"",img:""});
  const [busy,setBusy]=useState(false);
  const [done,setDone]=useState(false);
  const [err,setErr]=useState("");
  const cats=["Audio","Wearables","Accessories","Peripherals","Phones","Computers"];
  const upd=(k,v)=>setForm(f=>({...f,[k]:v}));
  const submit=async()=>{
    if (!form.name.trim()||!form.price||!form.desc.trim()){setErr("Name, price and description are required.");return;}
    setErr("");setBusy(true);
    try {
      await addProduct({name:form.name.trim(),price:parseFloat(form.price),cat:form.cat,desc:form.desc.trim(),stock:parseInt(form.stock,10)||0,img:form.img.trim()||"https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&q=80"});
      setDone(true);
    } catch(e){ setErr(e.message||"Upload failed. Check backend connection."); }
    finally{ setBusy(false); }
  };
  if (done) return (
    <div style={{ textAlign:"center",padding:"64px 20px" }}>
      <div style={{ fontSize:52,marginBottom:14 }}>✅</div>
      <h2 style={{ fontSize:20,fontWeight:800,marginBottom:8 }}>Product Added!</h2>
      <p style={{ color:"var(--text3)",marginBottom:20 }}>Your product is now live in the store.</p>
      <button type="button" className="btn btn-cyan" onClick={()=>{setDone(false);setForm({name:"",price:"",cat:"Audio",desc:"",stock:"",img:""})}}>+ Add Another</button>
    </div>
  );
  return (
    <div>
      <PgHdr title="Upload Product" subtitle="Add a new product to SHIFX"/>
      <div className="card" style={{ padding:28,maxWidth:640 }}>
        {err&&<ErrBox msg={err}/>}
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }} className="two-col">
          <div className="field"><label>Product Name *</label><input value={form.name} onChange={e=>upd("name",e.target.value)} placeholder="e.g. Smart Speaker"/></div>
          <div className="field"><label>Price (₹) *</label><input value={form.price} onChange={e=>upd("price",e.target.value)} placeholder="e.g. 4999" type="number" min="0"/></div>
          <div className="field"><label>Category</label><select value={form.cat} onChange={e=>upd("cat",e.target.value)}>{cats.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
          <div className="field"><label>Stock Quantity</label><input value={form.stock} onChange={e=>upd("stock",e.target.value)} placeholder="100" type="number" min="0"/></div>
        </div>
        <div className="field"><label>Description *</label><textarea value={form.desc} onChange={e=>upd("desc",e.target.value)} placeholder="Describe the product…" style={{ resize:"vertical",minHeight:80 }}/></div>
        <div className="field"><label>Image URL (optional)</label><input value={form.img} onChange={e=>upd("img",e.target.value)} placeholder="https://images.unsplash.com/…"/></div>
        <button type="button" className="btn btn-cyan" style={{ padding:"12px 28px",fontSize:14 }} onClick={submit} disabled={busy}>
          {busy?<><Spin/> Uploading…</>:"📤 Upload Product"}
        </button>
      </div>
    </div>
  );
}

function CompanyInventory() {
  const { token } = useAuth();
  const [myProducts,setMyProducts]=useState([]);
  useEffect(()=>{
    apiFetch("/company/products",{token})
      .then(d=>setMyProducts((d.products||[]).map(normProduct)))
      .catch(()=>{});
  },[token]);
  return (
    <div>
      <PgHdr title="Inventory" subtitle={myProducts.length+" your products"}><button type="button" className="btn btn-cyan" style={{ fontSize:12 }}>+ Upload New</button></PgHdr>
      <div className="card" style={{ padding:20 }}><div style={{ overflowX:"auto" }}>
        <table className="tbl">
          <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Rating</th><th>Status</th></tr></thead>
          <tbody>
            {myProducts.length===0&&<tr><td colSpan={6} style={{textAlign:"center",color:"var(--text3)",padding:24}}>No products uploaded yet</td></tr>}
            {myProducts.map((p,i)=>(
              <tr key={i}>
                <td><div style={{ display:"flex",alignItems:"center",gap:10 }}><img src={p.img} alt={p.name} style={{ width:36,height:36,borderRadius:6,objectFit:"cover" }}/><span style={{ fontWeight:600,color:"var(--text)" }}>{p.name}</span></div></td>
                <td><Bdg color="#06b6d4">{p.cat}</Bdg></td>
                <td style={{ fontWeight:700,color:"#06b6d4" }}>{inr(p.price)}</td>
                <td style={{ fontWeight:600,color:p.stock<20?"var(--danger)":"#10b981" }}>{p.stock}</td>
                <td><Stars rating={p.rating} size={12}/></td>
                <td><Bdg color={p.stock>0?"#10b981":"var(--danger)"}>{p.stock>0?"In Stock":"Out of Stock"}</Bdg></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div></div>
    </div>
  );
}

function CompanySales() {
  const { token } = useAuth();
  const [orders,setOrders]=useState([]);
  const [cs,setCs]=useState(null);
  useEffect(()=>{
    apiFetch("/company/stats",{token}).then(setCs).catch(()=>{});
    apiFetch("/company/orders",{token}).then(setOrders).catch(()=>{});
  },[token]);
  const avgOrderVal = cs && cs.total_orders>0 ? Math.round(cs.total_revenue/cs.total_orders) : 0;
  const stats = cs ? [
    {label:"Total Revenue",  value:"₹"+Math.round(cs.total_revenue/100000).toLocaleString("en-IN")+"L", delta:"all time",  icon:"💰",c:"#10b981"},
    {label:"Total Orders",   value:cs.total_orders.toLocaleString("en-IN"),  delta:"involving your products", icon:"📦",c:"#06b6d4"},
    {label:"Avg Order Value",value:inr(avgOrderVal),                          delta:"per order",  icon:"💳",c:"#6366f1"},
    {label:"Avg Rating",     value:cs.avg_rating.toFixed(1)+"★",              delta:"customer rating",icon:"⭐",c:"#F59E0B"},
  ] : [{label:"Loading…",value:"—",delta:"",icon:"⏳",c:"var(--text3)"}];
  return (
    <div>
      <PgHdr title="Sales Report" subtitle="Your product performance"><button type="button" className="btn btn-secondary" style={{ fontSize:12 }}>↓ Download PDF</button></PgHdr>
      <div className="stat-grid" style={{ marginBottom:20 }}>{stats.map(s=><StatBox key={s.label} {...s}/>)}</div>
      <div className="card" style={{ padding:20 }}>
        <h3 style={{ fontSize:14,fontWeight:700,marginBottom:14 }}>Recent Orders</h3>
        <div style={{ overflowX:"auto" }}>
          <table className="tbl">
            <thead><tr><th>Order ID</th><th>Items</th><th>Total</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {orders.length===0&&<tr><td colSpan={5} style={{textAlign:"center",color:"var(--text3)",padding:24}}>No orders yet</td></tr>}
              {orders.map((o,i)=>(
                <tr key={i}>
                  <td style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:12,fontWeight:600 }}>#{o.id}</td>
                  <td style={{ textAlign:"center" }}>{(o.items||[]).length}</td>
                  <td style={{ fontWeight:700,color:"#06b6d4" }}>{inr(o.total)}</td>
                  <td style={{ color:"var(--text3)",fontSize:12 }}>{new Date(o.created_at).toLocaleDateString("en-IN")}</td>
                  <td><Bdg color={o.status==="delivered"?"#10b981":o.status==="shipped"?"#06b6d4":o.status==="processing"?"#f59e0b":"#6366f1"}>{o.status}</Bdg></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CompanyProfilePage() {
  const { auth } = useAuth();
  return (
    <div>
      <PgHdr title="Company Profile" subtitle="Manage your seller account"/>
      <div style={{ display:"grid",gridTemplateColumns:"240px 1fr",gap:16,alignItems:"start" }} className="profile-grid">
        <div className="card" style={{ padding:20,textAlign:"center" }}>
          <div style={{ width:68,height:68,borderRadius:16,background:"linear-gradient(135deg,#06b6d4,#0891b2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,fontWeight:800,color:"#fff",margin:"0 auto 12px" }}>{auth.avatar}</div>
          <div style={{ fontWeight:800,fontSize:15,marginBottom:6 }}>{auth.name}</div>
          <Bdg color="#06b6d4">Verified Seller</Bdg>
          <div style={{ marginTop:16,display:"flex",flexDirection:"column",gap:7 }}>
            {[["⭐","4.8 Rating"],["📦","24 Products"],["💰","₹1.03 Cr Revenue"],["📅","Since 2023"]].map(([ic,t])=>(
              <div key={t} style={{ display:"flex",gap:8,alignItems:"center",fontSize:12,color:"var(--text2)" }}><span>{ic}</span><span>{t}</span></div>
            ))}
          </div>
        </div>
        <div className="card" style={{ padding:24 }}>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }} className="two-col">
            {[{l:"Contact Name",v:auth.name},{l:"Email",v:auth.email},{l:"Company ID",v:"SHIFX-CO-001"},{l:"Business Type",v:"Electronics Retailer"},{l:"Country",v:"United States"},{l:"Phone",v:"+1 (555) 000-0000"}].map(f=>(
              <div key={f.l} className="field" style={{ margin:0 }}>
                <label>{f.l}</label>
                <input defaultValue={f.v} style={{ background:"var(--surface2)",color:"var(--text)" }}/>
              </div>
            ))}
          </div>
          <button type="button" className="btn btn-cyan" style={{ marginTop:18 }}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MICRO COMPONENTS
══════════════════════════════════════════════════════ */
function Stars({ rating, size=13 }) {
  return (
    <div style={{ display:"flex",gap:1 }}>
      {[1,2,3,4,5].map(s=>(
        <span key={s} style={{ fontSize:size,opacity:s<=Math.round(rating)?1:.22 }}>⭐</span>
      ))}
    </div>
  );
}

function Spin() {
  return <span style={{ width:13,height:13,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite",flexShrink:0 }}/>;
}

function Toast({ msg }) {
  return (
    <div className="fi" style={{ position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:"#1F2937",color:"#fff",padding:"12px 22px",borderRadius:50,boxShadow:"var(--sh-lg)",fontSize:14,fontWeight:600,zIndex:9999,whiteSpace:"nowrap" }}>
      {msg}
    </div>
  );
}

function ErrBox({ msg }) {
  return (
    <div style={{ padding:"10px 13px",background:"var(--danger-bg)",border:"1px solid #fecaca",borderRadius:8,color:"var(--danger)",fontSize:13,marginBottom:14,lineHeight:1.5 }}>
      ⚠ {msg}
    </div>
  );
}

function Bdg({ color, children }) {
  return <span className="badge" style={{ background:color+"18",color,border:"1px solid "+color+"28" }}>{children}</span>;
}

function Toggle({ on, onChange, color }) {
  return (
    <div role="switch" aria-checked={on} onClick={onChange} style={{ width:40,height:22,borderRadius:11,background:on?color:"var(--border2)",cursor:"pointer",position:"relative",transition:"background .18s",flexShrink:0 }}>
      <div style={{ position:"absolute",top:3,left:on?21:3,width:16,height:16,borderRadius:"50%",background:"#fff",boxShadow:"0 1px 3px rgba(0,0,0,.2)",transition:"left .18s" }}/>
    </div>
  );
}

function StatBox({ label, value, delta, icon, c }) {
  return (
    <div style={{ background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,padding:"18px 20px",transition:"box-shadow .15s",cursor:"default" }}
      onMouseEnter={e=>{e.currentTarget.style.boxShadow="var(--sh)"}}
      onMouseLeave={e=>{e.currentTarget.style.boxShadow="none"}}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12 }}>
        <span style={{ fontSize:10,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".08em" }}>{label}</span>
        <span style={{ fontSize:18 }}>{icon}</span>
      </div>
      <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:800,fontSize:26,letterSpacing:"-.02em",marginBottom:5,color:"var(--text)" }}>{value}</div>
      <div style={{ fontSize:12,color:c,fontWeight:700 }}>{delta} <span style={{ color:"var(--text3)",fontWeight:400 }}>vs last month</span></div>
    </div>
  );
}

function BarChart({ data, color }) {
  const max = Math.max(...data);
  return (
    <div style={{ display:"flex",alignItems:"flex-end",gap:4,height:72 }}>
      {data.map((v,i)=>(
        <div key={i} title={String(v)} style={{ flex:1,borderRadius:"3px 3px 0 0",height:((v/max)*100)+"%",background:"linear-gradient(to top,"+color+","+color+"60)",transition:"height .6s ease "+(i*0.04)+"s",cursor:"pointer" }}
          onMouseEnter={e=>e.currentTarget.style.opacity=".7"}
          onMouseLeave={e=>e.currentTarget.style.opacity="1"}/>
      ))}
    </div>
  );
}

function MonthLabels() {
  return (
    <div style={{ display:"flex",justifyContent:"space-between",marginTop:8 }}>
      {["J","F","M","A","M","J","J","A","S","O","N","D"].map((m,i)=>(
        <span key={i} style={{ fontSize:10,color:"var(--text3)" }}>{m}</span>
      ))}
    </div>
  );
}

function PgHdr({ title, subtitle, children }) {
  return (
    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:20,flexWrap:"wrap",gap:12 }}>
      <div>
        <h1 style={{ fontSize:"clamp(18px,3vw,22px)",fontWeight:800,letterSpacing:"-.02em",marginBottom:3 }}>{title}</h1>
        {subtitle&&<p style={{ fontSize:13,color:"var(--text3)" }}>{subtitle}</p>}
      </div>
      {children&&<div style={{ display:"flex",gap:8 }}>{children}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   ROOT
══════════════════════════════════════════════════════ */
export default function App() {
  return (
    <AuthProvider>
      <Styles/>
      <Router/>
    </AuthProvider>
  );
}
