// Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
  import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
  import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyBGVuxmH84CDQRa9wbfJXPgMf-ki__BbLM",
    authDomain: "login-mtb-11df0.firebaseapp.com",
    projectId: "login-mtb-11df0",
    storageBucket: "login-mtb-11df0.firebasestorage.app",
    messagingSenderId: "469931455269",
    appId: "1:469931455269:web:5108597ad2250aa62e20cc"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

  //to showmessage function is created;
  function showMessage(message, divId){
    var messageDiv= document.getElementById(divId);
    messageDiv.style.display="block";
    messageDiv.innerHTML= message;
    messageDiv.style.opacity=1;
    setTimeout(()=>{
      messageDiv.style.opacity=0; 
  },5000); // after 5 seconds opacity set to 0
}

  // when button is clicked the user wants to submit signup form
  const signUp= document.getElementById('submitSignUp');
  signUp.addEventListener('click', (e)=>{
    e.preventDefault();
    const email=document.getElementById('rEmail').value;
    const password=document.getElementById('rPassword').value;
    const firstName=document.getElementById('fName').value;
    const lastName=document.getElementById('lName').value;

    //initialize auth with instance of firebase authentetication
    const auth = getAuth();
    //initialize DB with instance of firestore object.
    const db = getFirestore();
    //if email creation is succesful then promise returned by create user with email and password resolves with user credentials object(contain info abt newly created user).
    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential)=>{
      const user = userCredential.user;
      const userData={
        email: email,
        firstName: firstName,
        lastName: lastName
      }
      //to show error messages or sucess use to store in div container..
      showMessage('Account created successfully!','signUpMessage');

      //doc is function provided by firestore to create reference  to particular document in firestore database.
      const docRef=doc(db,"users", user.uid);
      //setDOc function provided by firestore gets two arguments.
      setDoc(docRef, userData)
      .then(()=>{
        window.location.href="form.html";// redirect to login page after successful registration
      }).catch((err)=>{
        console.error("Error adding document: ", err);
      });



    }).catch((error)=>{
// error while handling the account 
      const errorCode= error.code;
      if(errorCode==='auth/email-already-in-use'){
        showMessage('Email already in use. Please use a different email.','signUpMessage');
      } else {
        showMessage('unable to create user','signUpMessage');
      }

    });

  });

// login functionality with id submitSignIn of sign in button

const signIn=document.getElementById('submitSignIn');
signIn.addEventListener('click',(e)=>{
  e.preventDefault();
  // so here we will match values(username and password ) with values in DB
  const email=document.getElementById('email').value;
  const password=document.getElementById('password').value;
  // auth will hold instance of firebase authentetication service send with email and password;

  const auth=getAuth();

  // a function is called to authenticate below using email and password
  signInWithEmailAndPassword(auth,email,password)
  .then((userCredential)=>{
    // usercredential contains info about signin user if the login is succesfull 
    showMessage('login is successful','signInMessage');
    //locally storing the user info in browser storage
    const user=userCredential.user;
    localStorage.setItem('LoggedInUser',user.uid);
    setTimeout(()=>{
    window.location.href="./homepage/homepage.html";// redirect to welcome page after successful login
    },2000);
  })
  .catch((error)=>{
    const errorCode= error.code;
    if(errorCode==='auth/invalid-credentials'){
      showMessage('Invalid credentials. Please check your email and password.','signInMessage');
    }
    else {
      showMessage('Account doesnot exist','signInMessage');
    }
})
});


