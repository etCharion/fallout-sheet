// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDG9JaKzdjbuUVem3O63-JxLFv9ItDwo",
  authDomain: "fallout-sheet.firebaseapp.com",
  projectId: "fallout-sheet",
  storageBucket: "fallout-sheet.firebaseStorage.app",
  messagingSenderId: "1013179280650",
  appId: "1:1013179280650:web:72c246cc5357b1d05def3"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Sign in anonymously
auth.onAuthStateChanged((user) => {
  if (user) {
    document.getElementById('loginStatus').textContent = 'Přihlášené';
  } else {
    auth.signInAnonymously().catch(console.error);
  }
});

// DOM Elements
const charForm = document.getElementById('charForm');
const loadCharBtn = document.getElementById('loadCharBtn');
const newCharBtn = document.getElementById('newCharBtn');
const editCharBtn = document.getElementById('editCharBtn');
const deleteCharBtn = document.getElementById('deleteCharBtn');
const passwordInput = document.getElementById('passwordInput');
const addWeaponBtn = document.getElementById('addWeaponBtn');
const addPerkBtn = document.getElementById('addPerkBtn');

let currentCharacter = null;
const SPECIAL_ATTRIBUTES = ['Strength', 'Perception', 'Endurance', 'Charisma', 'Intelligence', 'Agility', 'Luck'];

// Load character list
loadCharBtn.addEventListener('click', async () => {
  const snapshot = await db.collection('characters').get();
  const characters = snapshot.docs.map(doc => doc.data().characterName).join('\\n');
  const selectedChar = prompt('Dostupné postavy:\\n' + characters + '\\n\\nZadej jméno:');
  if (selectedChar) loadCharacter(selectedChar);
});

// Load character from Firestore
async function loadCharacter(name) {
  const doc = await db.collection('characters').where('characterName', '==', name).get();
  if (!doc.empty) {
    currentCharacter = doc.docs[0].data();
    populateForm(currentCharacter);
  } else {
    alert('Postava nenalezena!');
  }
}

// Save character
charForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(charForm);
  const charName = formData.get('characterName');
  const password = passwordInput.value || charName.toLowerCase().split(' ')[0];
  
  const char = Object.fromEntries(formData);
  
  if (currentCharacter && currentCharacter.id) {
    // Update
    await db.collection('characters').doc(currentCharacter.id).update(char);
  } else {
    // Create new
    await db.collection('characters').add(char);
  }
  alert('Š`stávka uložena!');
});

// Populate form from character data
function populateForm(char) {
  document.querySelector('input[name="characterName"]').value = char.characterName || '';
  document.querySelector('input[name="origin"]').value = char.origin || '';
}

// Add weapon row
addWeaponBtn.addEventListener('click', () => {
  const container = document.getElementById('weaponsContainer');
  const row = document.createElement('div');
  row.className = 'weapon-row';
  row.innerHTML = `<input placeholder="Zb raň"> <input placeholder="Zranění"> <button type="button">Odebrat</button>`;
  row.querySelector('button').addEventListener('click', () => row.remove());
  container.appendChild(row);
});

// Add perk row
addPerkBtn.addEventListener('click', () => {
  const container = document.getElementById('perksContainer');
  const row = document.createElement('div');
  row.className = 'perk-row';
  row.innerHTML = `<input placeholder="Perk/Rys"> <button type="button">Odebrat</button>`;
  row.querySelector('button').addEventListener('click', () => row.remove());
  container.appendChild(row);
});

// Generate SPECIAL form
function initSPECIAL() {
  const container = document.getElementById('specialContainer');
  SPECIAL_ATTRIBUTES.forEach(attr => {
    const group = document.createElement('div');
    group.className = 'form-group';
    group.innerHTML = `<label>${attr}:</label><input type="number" name="${attr}" min="1" max="10" value="5">`;
    container.appendChild(group);
  });
}

initSPECIAL();
