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

Vue.createApp({
  data() {
    return {
      currentUser: null, loginEmail: '', loginPass: '', currentTab: 'home', subView: null, showModal: false, isEditing: false, 
      transactions: [], toastMsg: null,
      settings: JSON.parse(localStorage.getItem('vault_v300')) || { currency:"$", monthlyBudget: 2500, expenseCats:["Groceries","Rent","Dining","Gas","Fun"] },
      entry: { id: null, amount: null, category: 'Groceries', asset: '', notes: '', date: null },
      emojis: { 'Paycheque':'💰', 'Groceries':'🛒', 'Rent':'🏠', 'Dining':'🍔', 'Gas':'⛽', 'Fun':'🎡', 'Crypto Buy':'🪙', 'Crypto Sell':'📈', 'Investment':'💎', 'E-Transfer':'💸' }
    }
  },
  watch: { settings: { handler(v) { localStorage.setItem('vault_v300', JSON.stringify(v)); }, deep: true } },
  computed: {
    allCategories() { return ['Paycheque', 'E-Transfer', 'Investment', 'Crypto Buy', 'Crypto Sell', ...this.settings.expenseCats]; },
    userTransactions() { return this.transactions.filter(t => t.by === this.currentUser?.name); },
    cryptoTransactions() { return this.userTransactions.filter(t => t.category.includes('Crypto') || t.category === 'Investment'); },
    
    // CASH BALANCE: Excludes all Crypto transactions entirely
    cashBalance() { 
      return this.userTransactions
        .filter(t => !t.category.includes('Crypto') && t.category !== 'Investment')
        .reduce((acc, t) => this.isPositive(t.category) ? acc + t.amount : acc - t.amount, 0); 
    },

    totalSpent() { return this.userTransactions.filter(t => !this.isPositive(t.category) && !t.category.includes('Crypto')).reduce((s, t) => s + t.amount, 0); },
    totalIncome() { return this.userTransactions.filter(t => t.category === 'Paycheque').reduce((s, t) => s + t.amount, 0); },
    budgetPercent() { return Math.min((this.totalSpent / (this.settings.monthlyBudget || 1)) * 100, 100); }
  },
  methods: {
    getEmoji(cat) { return this.emojis[cat] || '💸'; },
    isPositive(cat) { return cat === 'Paycheque'; },
    async login() { try { await signInWithEmailAndPassword(auth, this.loginEmail, this.loginPass); } catch (e) { alert(e.message); } },
    async logout() { await signOut(auth); location.reload(); },
    formatDate(d) { return new Date(d).toLocaleDateString(undefined, {month:'short', day:'numeric'}); },
    triggerToast(msg) { this.toastMsg = msg; setTimeout(() => this.toastMsg = null, 2500); },
    openAdd() { this.isEditing = false; this.entry = { amount: null, category: 'Groceries', asset: '', notes: '', date: new Date().toISOString() }; this.showModal = true; },
    quickAdd(cat) { this.openAdd(); this.entry.category = cat; },
    openEdit(t) { this.isEditing = true; this.entry = { ...t }; this.showModal = true; },
    async saveEntry() {
        if(!this.entry.amount) return;
        const data = { 
            amount: Number(this.entry.amount), 
            category: this.entry.category, 
            asset: (this.entry.asset || '').toUpperCase(), 
            notes: this.entry.notes || '',
            date: this.entry.date, 
            by: this.currentUser.name 
        };
        this.isEditing ? await updateDoc(doc(db, "transactions", this.entry.id), data) : await addDoc(collection(db, "transactions"), data);
        this.showModal = false; this.triggerToast("Saved! ✅");
    },
    async deleteTransaction() { if(confirm("Delete?")) { await deleteDoc(doc(db, "transactions", this.entry.id)); this.showModal = false; this.triggerToast("Deleted"); } },
    exportCSV() { this.downloadCSV(this.userTransactions, 'Vault_Full.csv'); },
    exportCryptoCSV() { this.downloadCSV(this.cryptoTransactions, 'Vault_Crypto.csv'); },
    downloadCSV(list, filename) {
        let csv = "Date,Category,Asset,Notes,Amount\n";
        list.forEach(t => csv += `${new Date(t.date).toLocaleDateString()},${t.category},${t.asset || ''},"${t.notes || ''}",${t.amount}\n`);
        const blob = new Blob([csv], {type:'text/csv'});
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click();
        this.triggerToast("Downloaded 📥");
    }
  },
  mounted() {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.currentUser = { name: user.email.split('@')[0].toUpperCase() };
        onSnapshot(query(collection(db, "transactions"), orderBy("date", "desc")), (snap) => {
            this.transactions = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        });
      }
    });
  }
}).mount('#app');
