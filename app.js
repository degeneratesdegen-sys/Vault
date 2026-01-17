import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAWtso6QR1oyXs6b5aVXjf9Oi-XsCipeTg",
  authDomain: "vaultpro-90a00.firebaseapp.com",
  projectId: "vaultpro-90a00",
  storageBucket: "vaultpro-90a00.firebasestorage.app",
  messagingSenderId: "802795035216",
  appId: "1:802795035216:web:0bf0d3efa72e5bc8004f55"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

Vue.createApp({
  data() {
    return {
      version: "1.0.7",
      currentUser: null, loginEmail: '', loginPass: '', currentTab: 'home', subView: null, newCatName: '', showModal: false, isEditing: false, isSaving: false, exportStatus: 'Export Data', transactions: [],
      settings: JSON.parse(localStorage.getItem('vault_v21')) || { currency:"$", monthlyBudget: 2500, expenseCats:["Groceries","Rent","Dining","Gas","Fun"] },
      entry: { id: null, amount: null, category: 'Groceries', date: null }
    }
  },
  computed: {
    // THIS FILTER SEPARATES THE DATA FOR YOU AND MOM
    userTransactions() {
      if (!this.currentUser) return [];
      return this.transactions.filter(t => t.by === this.currentUser.name);
    },
    totalSpent() { 
      return this.userTransactions.filter(t => t.category !== 'Paycheque').reduce((s, t) => s + (Number(t.amount) || 0), 0); 
    },
    totalIncome() { 
      return this.userTransactions.filter(t => t.category === 'Paycheque').reduce((s, t) => s + (Number(t.amount) || 0), 0); 
    },
    budgetPercent() { return Math.min((this.totalSpent / (this.settings.monthlyBudget || 1)) * 100, 100); },
    dailyAvg() { return (this.totalSpent / (new Date().getDate() || 1)).toFixed(2); },
    forecast() { return (this.dailyAvg * 30).toFixed(2); },
    categoryStats() {
        const colors = ["#007AFF", "#34C759", "#FF9500", "#AF52DE", "#FF3B30"];
        const cats = {};
        this.userTransactions.filter(t => t.category !== 'Paycheque').forEach(t => { cats[t.category] = (cats[t.category] || 0) + t.amount; });
        return Object.keys(cats).map((name, i) => ({
            name, total: cats[name], color: colors[i % colors.length], percent: Math.round((cats[name] / (this.totalSpent || 1)) * 100)
        })).sort((a,b) => b.total - a.total);
    }
  },
  methods: {
    async login() { try { await signInWithEmailAndPassword(auth, this.loginEmail, this.loginPass); } catch (e) { alert("Login Error: " + e.message); } },
    async logout() { await signOut(auth); this.currentUser = null; },
    startListening() {
      onSnapshot(query(collection(db, "transactions"), orderBy("date", "desc")), (snap) => {
        this.transactions = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      });
    },
    formatDate(d) { return new Date(d).toLocaleDateString(undefined, {month:'short', day:'numeric'}); },
    openAdd() { this.isEditing = false; this.isSaving = false; this.entry = { amount: null, category: this.settings.expenseCats[0], date: new Date().toISOString() }; this.showModal = true; },
    addPaychequeDirect() { this.openAdd(); this.entry.category = 'Paycheque'; },
    openEdit(t) { this.isEditing = true; this.isSaving = false; this.entry = { ...t }; this.showModal = true; },
    async saveEntry() {
      if(!this.entry.amount) return;
      this.isSaving = true;
      const data = { amount: Number(this.entry.amount), category: this.entry.category, date: this.entry.date || new Date().toISOString(), by: this.currentUser.name };
      this.isEditing ? await updateDoc(doc(db, "transactions", this.entry.id), data) : await addDoc(collection(db, "transactions"), data);
      setTimeout(() => { this.showModal = false; this.isSaving = false; }, 800);
    },
    async deleteTransaction() { if(confirm("Delete this?")) { await deleteDoc(doc(db, "transactions", this.entry.id)); this.showModal = false; } },
    addCategory() { if(this.newCatName) { this.settings.expenseCats.push(this.newCatName); this.newCatName = ''; } },
    removeCategory(i) { this.settings.expenseCats.splice(i, 1); },
    exportCSV() {
      let csv = "Date,Category,Amount\n";
      this.userTransactions.forEach(t => csv += `${new Date(t.date).toLocaleDateString()},${t.category},${t.amount}\n`);
      const blob = new Blob([csv], {type:'text/csv'});
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download='My_Vault.csv'; a.click();
    },
    checkUpdate() {
        const saved = localStorage.getItem('v_version');
        if(saved && saved !== this.version) { window.location.reload(true); }
        localStorage.setItem('v_version', this.version);
    }
  },
  mounted() {
    this.checkUpdate();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.currentUser = { name: user.email.split('@')[0].toUpperCase(), emoji: user.email.includes("shane") ? "👤" : "👩" };
        this.startListening();
      }
    });
  }
}).mount('#app');
