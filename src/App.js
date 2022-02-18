import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirebaseConfig } from "./firebase-config.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, serverTimestamp, query, onSnapshot, orderBy, limit } from "firebase/firestore"
import { Route, Routes, useNavigate } from 'react-router-dom';
import Navbar from "./components/Navbar";
import Login from './views/Login';
import Home from './views/Home';

// TODO: Try using https://blog.logrocket.com/how-to-use-react-hooks-firebase-firestore/ to get loadMessages and displayMessages working
export default function App (){
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  //  Signs in user
  let logIn = async () => {
    var provider = new GoogleAuthProvider();
    await signInWithPopup(getAuth(), provider);
    setUser(getAuth().currentUser.uid);
    navigate('/chat');
  }

  //  Signs out user
  let logOut = () => {
    signOut(getAuth());
    console.log('You have been signed out')
    navigate('/');
  }

  // Gets username from logged in user
  let getUserName = () => {
    return getAuth().currentUser.displayName
  }

  // Gets profile picture from logged in user
  let getProfileUrl = () => {
    return getAuth().currentUser.photoURL || '/images/profile_placeholder.png';
  }

  // Saves message to firestore database
  let saveMessage = async (messageText) => {
    try{
      // addDoc generates an id and stores specified values in a collection called messages in firestore
      await addDoc(collection(getFirestore(), 'messages'), {
        name: getUserName(),
        text: messageText,
        profilePicUrl: getProfileUrl(),
        timestamp: serverTimestamp(),
        user: user
      });
    }
    catch(error) {
      console.log('Error writing new message to Firebase Database', error)
    }
  }

  return (
    <>
      {/* <Navbar loggedIn={ loggedIn } signOut={ logOut }/> */}
        <Routes>
          <Route path='chat' element={ <Home saveMessage={ saveMessage } user={ user } signOut={ logOut }/> } />
          <Route path='/' element={ <Login signIn={ logIn }/>}/>
        </Routes>
    </>
  )
}

const firebaseConfig = getFirebaseConfig();
initializeApp(firebaseConfig);

