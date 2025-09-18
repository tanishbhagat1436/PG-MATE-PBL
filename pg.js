import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore, collection, getDocs, query, orderBy } 
  from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// Firebase Config (same as before)
const firebaseConfig = { 
  apiKey: "AIzaSyBRuD7eTDNphi4xiMAMVm5S6KUS7X4N5eg",
  authDomain: "pg-mate-efda5.firebaseapp.com",
  projectId: "pg-mate-efda5",
  storageBucket: "pg-mate-efda5.appspot.com",
  messagingSenderId: "764445496080",
  appId: "1:764445496080:web:24f07c03a4c2926d624b95",
  measurementId: "G-S692YPLXQP"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const authArea = document.getElementById("auth-area");
const pgContainer = document.getElementById("pgContainer");

// 🔹 Auth Check
onAuthStateChanged(auth, async (user) => {
  if (user) {
    authArea.innerHTML = `
      <span style="color:white; margin-right:15px;">${user.email}</span>
      <button id="logoutBtn" class="btn login-btn">Logout</button>
    `;
    document.getElementById("logoutBtn").addEventListener("click", () => {
      signOut(auth).then(() => {
        window.location.href = "auth.html";
      });
    });

    // Fetch PG Listings (order by latest)
    const q = query(collection(db, "pg-listings"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    pgContainer.innerHTML = "";

    if (querySnapshot.empty) {
      pgContainer.innerHTML = `<p style="text-align:center;">No PGs available yet.</p>`;
    } else {
      querySnapshot.forEach((doc) => {
        const pg = doc.data();
        const card = `
          <div class="pg-card">
            <img src="${pg.photoURL}" alt="PG Image"/>
            <div class="pg-details">
              <h3>${pg.title}</h3>
              <p><strong>Price:</strong> ₹${pg.price}/month</p>
              <p><strong>Location:</strong> ${pg.location}</p>
              <p><strong>Owner Contact:</strong> ${pg.contact}</p>
              <p>${pg.description}</p>
              <a href="tel:${pg.contact}" class="contact-btn">Call Owner</a>
            </div>
          </div>
        `;
        pgContainer.innerHTML += card;
      });
    }

  } else {
    window.location.href = "auth.html"; 
  }
});
