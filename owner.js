// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";

// 🔹 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBRuD7eTDNphi4xiMAMVm5S6KUS7X4N5eg",
  authDomain: "pg-mate-efda5.firebaseapp.com",
  projectId: "pg-mate-efda5",
  storageBucket: "pg-mate-efda5.appspot.com",
  messagingSenderId: "764445496080",
  appId: "1:764445496080:web:24f07c03a4c2926d624b95",
  measurementId: "G-S692YPLXQP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const authArea = document.getElementById("auth-area");
const pgForm = document.getElementById("pgForm");

// 🔹 Auth Check
onAuthStateChanged(auth, (user) => {
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
  } else {
    window.location.href = "auth.html"; // redirect if not logged in
  }
});

// 🔹 Handle PG Form Submit
pgForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const price = document.getElementById("price").value.trim();
  const location = document.getElementById("location").value.trim();
  const contact = document.getElementById("contact").value.trim();
  const photoFile = document.getElementById("photo").files[0];

  if (!photoFile) {
    alert("Please upload a photo!");
    return;
  }

  try {
    // ✅ Upload photo to Firebase Storage
    const photoRef = ref(storage, "pg-photos/" + Date.now() + "-" + photoFile.name);
    await uploadBytes(photoRef, photoFile);
    const photoURL = await getDownloadURL(photoRef);

    // ✅ Save data to Firestore
    await addDoc(collection(db, "pg-listings"), {
      title,
      description,
      price,
      location,
      contact,
      photoURL,
      owner: auth.currentUser ? auth.currentUser.email : "unknown",
      createdAt: serverTimestamp()
    });

    alert("✅ PG added successfully!");
    pgForm.reset();

  } catch (error) {
    console.error("Error adding PG:", error);
    alert("❌ Error: " + error.message);
  }
});
