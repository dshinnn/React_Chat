import React, { Component } from 'react';
import { initializeApp } from "firebase/app";
import { getFirebaseConfig } from "./firebase-config";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, serverTimestamp, query, onSnapshot, orderBy, limit } from "firebase/firestore"
import { Route, Routes } from 'react-router-dom';
import Navbar from "./components/Navbar";
import Login from './views/Login';
import Home from './views/Home';

export default class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      loggedIn: null,
    }
  }

  //  Signs in user
  signIn = async () => {
    var provider = new GoogleAuthProvider();
    await signInWithPopup(getAuth(), provider);
    this.setState({
      loggedIn: getAuth().currentUser.displayName
    })
    this.loadMessages();
    // this.displayMessage('1', serverTimestamp(), 'David', 'test hello');
  }

  //  Signs out user
  signOut = () => {
    signOut(getAuth());
    console.log('You have been signed out')
  }

  // Gets username from logged in user
  getUserName = () => {
    return getAuth().currentUser.displayName
  }

  // Gets profile picture from logged in user
  getProfileUrl = () => {
    return getAuth().currentUser.photoURL || '/images/profile_placeholder.png';
  }

  // Saves message to firestore database
  saveMessage = async (messageText) => {
    try{
      // addDoc generates an id and stores specified values in a collection called messages in firestore
      await addDoc(collection(getFirestore(), 'messages'), {
        name: this.getUserName(),
        text: messageText,
        profilePicUrl: this.getProfileUrl(),
        timestamp: serverTimestamp()
      });
    }
    catch(error) {
      console.log('Error writing new message to Firebase Database', error)
    }
  }

  loadMessages = () => {
    // Queries the firestore database for the last 12 messages saved
    const recentMessageQuery = query(collection(getFirestore(), 'messages'), orderBy('timestamp', 'desc'), limit(12));
    console.log('load messages called')
    // Starts listening to query to see if it changes and updates if it does

    onSnapshot(recentMessageQuery, function(snapshot) {
      snapshot.docChanges().forEach(function(change) {
        var message = change.doc.data();
        // this.displayMessage(change.doc.id, message.timestamp, message.name, message.text);
      }) 
    })
  }
  

  // displayMessage = (id, timestamp, name, text) => {
  //   console.log('displayMessage called')
  //   // if message exist, grabs the div with the message (for update), otherwise creates a new div
  //   var div = document.getElementById(id) || this.createAndInsertMessage(id, timestamp);
    
  //   // Sets the name div text to name and message to text
  //   div.querySelector('.name').textContent = name;
  //   div.querySelector('.message').textContent = text;
  // }

  // // Create a new div and insert message
  // createAndInsertMessage = (id, timestamp) =>  {
  //   const container = document.createElement('div');
  //   container.innerHTML = 
  //     "<div class='message-container'" + 
  //     "<div class='name'></div>" +
  //     "<div class='message'></div>" +
  //     "</div>";
    
  //   const div = container.firstChild;
  //   // Sets the id attribute of the div to the message id
  //   div.setAttribute('id', id);

  //   const messages = document.getElementById('messages');
  //   const existingMessages = document.getElementById('messages').children;

  //   // if message with no timestamp we assume we have just received the message
  //   timestamp = timestamp ? timestamp.toMillis() : Date.now();
  //   div.setAttribute('timestamp', timestamp);

  //   // if there are no messages
  //   if (existingMessages.length === 0) {
  //     messages.appendChild(div);
  //   } else {
  //     let messagesList = existingMessages[0];
  //     for(let i=0; i < messages.length; i++) {
  //       const messageTime = existingMessages[i].getAttribute('timestamp');

  //       // if the timestamp of the message is later than now
  //       if(messageTime > timestamp) {
  //         break;
  //       }
  //       // Set the next message before the newest message to the current message
  //       messagesList = messagesList[i].nextSibling;
  //     }
  //     // if there are no message sent later than the current message, it is added to the top 
  //     messages.insertBefore(div, messagesList);
  //   }
  //   return div;
  // }

  render() {
    return (
      <>
        <Navbar loggedIn={ this.state.loggedIn } signOut={ this.signOut }/>
        <Routes>
          <Route path='/' element={ <Home saveMessage={ this.saveMessage } /> } />
          <Route path='signIn' element={ <Login signIn={ this.signIn }/>}/>
        </Routes>
        
      </>
    )
  }
}

const firebaseConfig = getFirebaseConfig();
initializeApp(firebaseConfig);

