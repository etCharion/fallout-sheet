// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDG9JaKzdjbuUVem3O63-JxLFv9ItDwo",
  authDomain: "fallout-sheet.firebaseapp.com",
  projectId: "fallout-sheet",
  storageBucket: "fallout-sheet.firebaseStorage.app",
  messagingSenderId: "1013179280650",
  appId: "1:1013179280650:web:72c246cc5357b1d05def3"
};

let currentCharacterId = null;
const SPECIAL_ATTRIBUTES = ['Strength', 'Perception', 'Endurance', 'Charisma', 'Intelligence', 'Agility', 'Luck'];

let app, auth, db;

window.addEventListener('DOMContentLoaded', () => {
  app = firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db = firebase.firestore();
  
  auth.onAuthStateChanged((user) => {
    if (user) {
      document.getElementById('loginStatus').textContent = 'Prihlasene';
      setupListeners();
      generateSPECIAL();
    } else {
      auth.signInAnonymously();
    }
  });
});

function setupListeners() {
  document.getElementById('newCharBtn').addEventListener('click', newChar);
  document.getElementById('loadCharBtn').addEventListener('click', loadChar);
  document.getElementById('editCharBtn').addEventListener('click', editChar);
  document.getElementById('deleteCharBtn').addEventListener('click', delChar);
  document.getElementById('charForm').addEventListener('submit', saveChar);
  document.getElementById('addWeaponBtn').addEventListener('click', addWeapon);
  document.getElementById('addPerkBtn').addEventListener('click', addPerk);
}

function newChar() {
  currentCharacterId = null;
  document.getElementById('charForm').reset();
  document.getElementById('weaponsContainer').innerHTML = '';
  document.getElementById('perksContainer').innerHTML = '';
  alert('Nova postava');
}

async function loadChar() {
  const snap = await db.collection('characters').get();
  if (snap.empty) { alert('Zadne postavy'); return; }
  const names = snap.docs.map(d => d.data().characterName);
  const sel = prompt('Postava:\n' + names.join('\n'));
  if (sel) {
    const doc = snap.docs.find(d => d.data().characterName === sel);
    if (doc) {
      currentCharacterId = doc.id;
      loadData(doc.data());
    }
  }
}

function loadData(char) {
  document.querySelector('input[name="characterName"]').value = char.characterName || '';
  document.querySelector('input[name="origin"]').value = char.origin || '';
  SPECIAL_ATTRIBUTES.forEach(a => {
    const inp = document.querySelector(`input[name="${a}"]`);
    if (inp) inp.value = char[a] || 5;
  });
  document.getElementById('weaponsContainer').innerHTML = '';
  if (char.weapons) char.weapons.forEach(w => addWeapon(w.name, w.damage));
  document.getElementById('perksContainer').innerHTML = '';
  if (char.perks) char.perks.forEach(p => addPerk(p));
}

function editChar() {
  if (!currentCharacterId) { alert('Vyberte postavu'); return; }
  const pwd = document.getElementById('passwordInput').value;
  const name = document.querySelector('input[name="characterName"]').value;
  if (pwd !== name.toLowerCase().split(' ')[0]) { alert('Spatne heslo'); return; }
  saveChar(null, true);
}

async function delChar() {
  if (!currentCharacterId) { alert('Vyberte postavu'); return; }
  const pwd = document.getElementById('passwordInput').value;
  const name = document.querySelector('input[name="characterName"]').value;
  if (pwd !== name.toLowerCase().split(' ')[0]) { alert('Spatne heslo'); return; }
  if (confirm('Vymazat?')) {
    await db.collection('characters').doc(currentCharacterId).delete();
    alert('Smazano');
    newChar();
  }
}

async function saveChar(e, edit = false) {
  if (e) e.preventDefault();
  const name = document.querySelector('input[name="characterName"]').value.trim();
  if (!name) { alert('Zadej jmeno'); return; }
  const char = {
    characterName: name,
    origin: document.querySelector('input[name="origin"]').value,
    timestamp: new Date(),
    weapons: [],
    perks: []
  };
  SPECIAL_ATTRIBUTES.forEach(a => {
    char[a] = parseInt(document.querySelector(`input[name="${a}"]`).value) || 5;
  });
  document.querySelectorAll('.weapon-row').forEach(r => {
    const ins = r.querySelectorAll('input');
    if (ins[0].value.trim()) char.weapons.push({name: ins[0].value, damage: ins[1].value});
  });
  document.querySelectorAll('.perk-row').forEach(r => {
    const inp = r.querySelector('input');
    if (inp.value.trim()) char.perks.push(inp.value);
  });
  if (currentCharacterId && edit) {
    await db.collection('characters').doc(currentCharacterId).update(char);
    alert('Aktualizovano');
  } else {
    const ref = await db.collection('characters').add(char);
    currentCharacterId = ref.id;
    alert('Ulozeno');
  }
}

function addWeapon(n = '', d = '') {
  const cnt = document.getElementById('weaponsContainer');
  const row = document.createElement('div');
  row.className = 'weapon-row';
  row.innerHTML = `<input type="text" placeholder="Zbran" value="${n}"><input type="text" placeholder="Damage" value="${d}"><button type="button" class="btn-rem">Odebrat</button>`;
  row.querySelector('.btn-rem').addEventListener('click', () => row.remove());
  cnt.appendChild(row);  row.querySelector('.btn-rem').addEventListener('click', () => row.remove());
  cnt.appendChild(row);
}

function addPerk(n = '') {
  const cnt = document.getElementById('perksContainer');
  const row = document.createElement('div');
  row.className = 'perk-row';
  row.innerHTML = `<input type="text" placeholder="Perk" value="${n}"><button type="button" class="btn-rem">Odebrat</button>`;
  row.querySelector('.btn-rem').addEventListener('click', () => row.remove());
  cnt.appendChild(row);  row.querySelector('.btn-rem').addEventListener('click', () => row.remove());
  cnt.appendChild(row);
}

function generateSPECIAL() {
  const c = document.getElementById('specialContainer');
  c.innerHTML = '';
  SPECIAL_ATTRIBUTES.forEach(a => {
    const g = document.createElement('div');
    g.className = 'form-group';
    g.innerHTML = `<label>${a}:</label><input type="number" name="${a}" min="1" max="10" value="5">`;
    c.appendChild(g);
  });
}
