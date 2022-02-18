import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, query, onSnapshot, orderBy, doc, deleteDoc, getDoc, where } from "firebase/firestore"

export default function Home(props) {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const scroll = useRef();
    const db = getFirestore();
    const messagesRef = collection(db, 'messages');
    function loadMessages() {
        // Queries the firestore database for the last 12 messages saved
        const recentMessageQuery = query(messagesRef, orderBy('timestamp', 'asc'));
        setLoading(true);
        
        // Grabs a snapshot of the current database and listens for changes
        onSnapshot(recentMessageQuery, (querySnapshot) => {
            const messages = [];
            querySnapshot.forEach((doc) => {
                messages.push(doc);
            }); 
            setTimeout(() => {scroll.current.scrollIntoView({block: 'end', behavior: 'smooth'})}, 0);
            setMessages(messages);
            setLoading(false);
        });
    }

    async function deleteMessage(messageId) {
        console.log(messageId);
        await deleteDoc(doc(db, 'messages', messageId));
    }

    useEffect(() => {
        // if user is not logged in, send to login page
        if (!props.user) {
            navigate('/');
            return
        }
        loadMessages();
      }, [])

    if (loading) {
        return <h1>Loading...</h1>;
    }

    return (
        <div className='vh-100'> 
            <header>
                <button className="btn btn-secondary position-absolute end-0" onClick={() => props.signOut()}>Sign Out</button>
            </header>
            <div className="card vh-100 w-100 scrollbar">
                <div className="card-body">
                    <div className="messages p-2">
                        { messages.map((msg) => 
                            <div className='message-container p-2 mb-1' key={msg.id}>
                                <div className='d-flex align-items-center'>
                                    <img src={msg.data().profilePicUrl} className='profilePic rounded-circle'></img>
                                    <div className='name ms-2'>
                                        {msg.data().name} 
                                            <span className='date fst-italic ms-2'>
                                                {msg.data().timestamp ? msg.data().timestamp.toDate().toDateString() : Date.now()}
                                            </span>
                                            { props.user === msg.data().user ? (
                                                <button className='btn-sm btn-light position-absolute end-0 me-2' onClick={() => {deleteMessage(msg.id)} }>X</button>) : null}
                                            
                                        </div>
                                </div>
                                <div className='text'>{msg.data().text}</div>
                            </div>
                        )}
                            <div className='text-div position-fixed bottom-0 translate-middle-y'>
                                <input type='text' className='msg-txt h-100 w-100 border border-secondary rounded-pill text-white p-2' name='message' placeholder="     Message" 
                                onKeyPress={(e) => {
                                        if(e.key === 'Enter') {
                                            e.preventDefault();
                                            props.saveMessage(e.target.value);
                                            console.log(e.target.value);
                                            e.target.value = null;
                                        }
                                    }}/>
                            </div>
                    </div>
                </div>
                <span ref={scroll} className='bottom-span'></span>
            </div>
        </div>
    )
}
