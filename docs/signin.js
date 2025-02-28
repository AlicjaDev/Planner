
// // Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyASZJUbaKS5ZeZzhXNtOB9q30LcxlL3Fq4",
//   authDomain: "eventplanner-8daa7.firebaseapp.com",
//   projectId: "eventplanner-8daa7",
//   storageBucket: "eventplanner-8daa7.appspot.com",
//   messagingSenderId: "180139946253",
//   appId: "1:180139946253:web:9b487c5b102dfeded9c044",
//   measurementId: "G-NC4EPER0GW"
// };

// // Initialize Firebase
// const app = firebase.initializeApp(firebaseConfig);
// const auth = firebase.auth();
// const provider = new firebase.auth.GoogleAuthProvider();
  
//   const googleSignInButton = document.getElementById('googleSignIn');
//   googleSignInButton.addEventListener('click', () => {
//     auth.signInWithPopup(provider)
//       .then((result) => {
//         const user = result.user;
//         localStorage.setItem("email", user.email); // Save user email to localStorage
//         window.location.href = "index.html"; // Redirect to main app
//       })
//       .catch((error) => {
//         console.error("Google Sign-In Error:", error);
//         alert("Failed to sign in with Google. Please try again.");
//       });
//   });
  
//   const biometricSignInButton = document.getElementById('biometricSignIn');
// biometricSignInButton.addEventListener('click', async () => {
//   try {
//     if (!window.PublicKeyCredential) {
//       alert("Biometric authentication is not supported in this browser.");
//       return;
//     }

//     const challenge = new Uint8Array(32);
//     window.crypto.getRandomValues(challenge);

//     const options = {
//       challenge: challenge,
//       rp: {
//         name: "Event Planter",
//       },
//       user: {
//         id: new Uint8Array(16),
//         name: "user@example.com",
//         displayName: "User",
//       },
//       pubKeyCredParams: [
//         {
//           type: "public-key",
//           alg: -7, // ES256
//         },
//       ],
//       timeout: 60000,
//       attestation: "direct",
//     };

//     const credential = await navigator.credentials.create({
//       publicKey: options,
//     });

//     console.log("Biometric credential created:", credential);
//     localStorage.setItem("email", "user@example.com"); // Simulate user email
//     window.location.href = "index.html"; // Redirect to main app
//   } catch (error) {
//     console.error("Biometric authentication failed:", error);
//     alert("Biometric authentication failed. Please try again.");
//   }
// });
  
//   // Generate QR Code
//   document.addEventListener('DOMContentLoaded', () => {
//     const qrCodeContainer = document.getElementById('qr-code');
//     const url = "https://github.com/AlicjaDev/event-planner";
  
//     QRCode.toCanvas(qrCodeContainer, url, (error) => {
//       if (error) {
//         console.error("Error generating QR code:", error);
//       } else {
//         console.log("QR code generated successfully.");
//       }
//     });
//   });