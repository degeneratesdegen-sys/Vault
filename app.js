/* STABLE DARK THEME ONLY */
:root { 
    --bg: #000; --card: #1C1C1E; --glass: rgba(255,255,255,0.08); 
    --text: #fff; --text-sec: #8E8E93; --primary: #007AFF; 
    --success: #34C759; --danger: #FF3B30; 
}

body { margin: 0; font-family: -apple-system, sans-serif; background: var(--bg); color: var(--text); height: 100vh; overflow: hidden; }
#app { background: var(--bg); min-height: 100vh; }

.login-screen { display: flex; align-items: center; justify-content: center; height: 100vh; padding: 30px; }
.logo { font-size: 40px; font-weight: 800; letter-spacing: -2px; margin-bottom: 20px; text-align: center; }
.f-input { width: 100%; background: var(--glass); border: 1px solid var(--glass); padding: 18px; border-radius: 15px; color: var(--text); margin-bottom: 10px; font-size: 16px; box-sizing: border-box; outline: none; }

.app-wrapper { height: 100vh; display: flex; flex-direction: column; }
.main-header { padding: 60px 24px 10px; display: flex; justify-content: space-between; align-items: center; }
.fintech-title { font-size: 32px; font-weight: 800; margin: 0; }
.user-pill { background: var(--glass); padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
.scroll-content { flex: 1; overflow-y: auto; padding: 10px 24px 120px; }

.balance-card { background: var(--card); border-radius: 28px; padding: 24px; margin-bottom: 25px; border: 1px solid var(--glass); }
.amount { font-size: 44px; font-weight: 800; }
.p-bar { width: 100%; height: 6px; background: var(--glass); border-radius: 10px; margin: 10px 0; overflow: hidden; }
.p-fill { height: 100%; background: var(--primary); transition: 0.5s; }

.t-item { display: flex; align-items: center; padding: 15px 0; border-bottom: 1px solid var(--glass); }
.t-icon { width: 42px; height: 42px; background: var(--glass); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800; margin-right: 15px; }
.t-main { flex: 1; }
.t-cat { font-weight: 600; font-size: 16px; }
.t-sub { font-size: 12px; color: var(--text-sec); }

.bottom-nav { position: fixed; bottom: 0; width: 100%; height: 90px; background: var(--card); display: flex; justify-content: space-around; align-items: center; border-top: 1px solid var(--glass); padding-bottom: env(safe-area-inset-bottom); }
.nav-btn { font-size: 22px; opacity: 0.3; cursor: pointer; }
.nav-btn.active { opacity: 1; }
.fab-btn { width: 56px; height: 56px; background: var(--primary); border: none; border-radius: 18px; color: #fff; font-size: 30px; margin-top: -40px; box-shadow: 0 10px 20px rgba(0,122,255,0.3); }

/* Pro Form Styles */
.amount-entry { display: flex; align-items: center; background: var(--glass); padding: 20px; border-radius: 18px; margin: 10px 0; }
.pro-input { background: none; border: none; color: var(--text); font-size: 40px; font-weight: 800; width: 100%; outline: none; }
.category-scroller { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
.pro-pill { background: var(--glass); padding: 10px 16px; border-radius: 12px; font-weight: 600; }
.pro-active { background: var(--text); color: var(--bg); }

.insight-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.card { background: var(--card); border-radius: 24px; padding: 20px; border: 1px solid var(--glass); }

.setting-list { background: var(--card); border-radius: 20px; overflow: hidden; margin-top: 15px; }
.s-item { display: flex; justify-content: space-between; padding: 18px 20px; border-bottom: 1px solid var(--glass); font-weight: 600; }
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 2000; display: flex; align-items: flex-end; }
.sheet { background: var(--card); width: 100%; border-radius: 30px 30px 0 0; padding: 30px; box-sizing: border-box; }
.btn-primary { width: 100%; background: var(--primary); color: #fff; border: none; padding: 18px; border-radius: 18px; font-weight: 700; }
.hub-btn-special { width: 100%; background: var(--success); color: #fff; padding: 18px; border-radius: 20px; font-weight: 700; text-align: center; margin-bottom: 20px; }
.danger { color: var(--danger); }
.plus { color: var(--success); }
.minus { color: var(--danger); }
