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

const fbApp = initializeApp(firebaseConfig);
const db = getFirestore(fbApp);
const auth = getAuth(fbApp);

const { createApp } = Vue;

createApp({
  data() {
    return {
      currentUser: null, loginEmail: '', loginPass: '', currentTab: 'home', subView: null, showModal: false, isEditing: false, transactions: [],
      settings: JSON.parse(localStorage.getItem('vault_v300')) || { currency:"$", monthlyBudget: 2500, expenseCats:["Groceries","Rent","Dining","Gas","Fun"], initialCrypto: 0 },
      entry: { id: null, amount: null, category: 'Groceries', asset: '', date: null },
      emojis: { 'Paycheque':'💰', 'Groceries':'🛒', 'Rent':'🏠', 'Dining':'🍔', 'Gas':'⛽', 'Fun':'🎡', 'Crypto Buy':'🪙', 'Crypto Sell':'📈', 'Investment':'💎' }
    }
  },
  watch: {
    settings: { handler(v) { localStorage.setItem('vault_v300', JSON.stringify(v)); }, deep: true }
  },
  computed: {
    allCategories() { return ['Paycheque', 'Investment', 'Crypto Buy', 'Crypto Sell', ...this.settings.expenseCats]; },
    userTransactions() { return this.transactions.filter(t => t.by === this.currentUser?.name); },
    cryptoTransactions() { return this.userTransactions.filter(t => t.category.includes('Crypto')); },
    cashBalance() {
        return this.userTransactions.reduce((acc, t) => {
            if (t.category === 'Paycheque' || t.category === 'Crypto Sell') return acc + t.amount;
            if (t.category === 'Investment') return acc; // IGNORE FOR CASH
            return acc - t.amount;
        }, 0);
    },
    cryptoTotal() {
        const history = this.cryptoTransactions.reduce((acc, t) => t.category === 'Crypto Buy' ? acc + t.amount : acc - t.amount, 0);
        return Number(this.settings.initialCrypto || 0) + history;
    },
    totalSpent() { 
        return this.userTransactions
            .filter(t => !this.isPositive(t.category) && !t.category.includes('Crypto') && t.category !== 'Investment')
            .reduce((s, t) => s + t.amount, 0); 
    },
    totalIncome() { return this.userTransactions.filter(t => t.category === 'Paycheque').reduce((s, t) => s + t.amount, 0); },
    budgetPercent() { return Math.min((this.totalSpent / (this.settings.monthlyBudget || 1)) * 100, 100); }
  },
  methods: {
    getEmoji(cat) { return this.emojis[cat] || '💸'; },
    isPositive(cat) { return cat === 'Paycheque' || cat === 'Crypto Sell' || cat === 'Investment'; },
    async login() { 
        try { await signInWithEmailAndPassword(auth, this.loginEmail, this.loginPass); } 
        catch (e) { alert("Error: " + e.message); } 
    },
    async logout() { await signOut(auth); location.reload(); },
    formatDate(d) { return new Date(d).toLocaleDateString(undefined, {month:'short', day:'numeric'}); },
    quickAdd(cat) { this.openAdd(); this.entry.category = cat; },
    openAdd() { this.isEditing = false; this.entry = { amount: null, category: 'Groceries', asset: '', date: new Date().toISOString() }; this.showModal = true; },
    openEdit(t) { this.isEditing = true; this.entry = { ...t }; this.showModal = true; },
    async saveEntry() {
      if(!this.entry.amount) return;
      const data = { amount: Number(this.entry.amount), category: this.entry.category, asset: (this.entry.asset || '').toUpperCase(), date: this.entry.date, by: this.currentUser.name };
      this.isEditing ? await updateDoc(doc(db, "transactions", this.entry.id), data) : await addDoc(collection(db, "transactions"), data);
      this.showModal = false;
    },
    async deleteTransaction() { if(confirm("Delete?")) { await deleteDoc(doc(db, "transactions", this.entry.id)); this.showModal = false; } },
    exportCSV() { this.downloadCSV(this.userTransactions, 'Vault_Full.csv'); },
    exportCryptoCSV() { this.downloadCSV(this.cryptoTransactions, 'Vault_Crypto.csv'); },
    downloadCSV(list, filename) {
      let csv = "Date,Category,Asset,Amount\n";
      list.forEach(t => csv += `${new Date(t.date).toLocaleDateString()},${t.category},${t.asset || ''},${t.amount}\n`);
      const blob = new Blob([csv], {type:'text/csv'});
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download=filename; a.click();
    }
  },
  mounted() {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.currentUser = { name: user.email.split('@')[0].toUpperCase() };
        onSnapshot(query(collection(db, "transactions"), orderBy("date", "desc")), (snap) => {
            this.transactions = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        });
      } else {
        this.currentUser = null;
      }
    });
  }
}).mount('#app');
