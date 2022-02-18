import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, addDoc, serverTimestamp, query, onSnapshot, orderBy, limit } from "firebase/firestore"
export default function Home(props) {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    
    function loadMessages() {
        // Queries the firestore database for the last 12 messages saved
        const recentMessageQuery = query(collection(getFirestore(), 'messages'), orderBy('timestamp', 'asc'), limit(12));
        setLoading(true);
        
        // Grabs a snapshot of the current database and listens for changes
        onSnapshot(recentMessageQuery, (querySnapshot) => {
            const messages = [];
            querySnapshot.forEach((doc) => {
                messages.push(doc);
            }); 
            setMessages(messages);
            setLoading(false);
        });
    }

    useEffect(() => {
        // if user is not logged in, send to login page
        if (!props.user) {
            navigate('/');
            return
        }
        loadMessages();
      }, [])

    function handleSubmit(e) {
        e.preventDefault();
        props.saveMessage(e.target.message.value);
        e.target.message.value = null;
    }

    if (loading) {
        return <h1>Loading...</h1>;
    }
    
    return (
        <>
            <header>
                <button className="btn btn-secondary position-absolute end-0" onClick={() => props.signOut()}>Sign Out</button>
            </header>
            <div className="card w-100">
                <div className="card-body">
                    <div className="messages">
                        { messages.map((msg) => 
                            <div className='message-container border border-secondary rounded p-2 mb-1' key={msg.id}>
                                <div className='name'>{msg.data().name}</div>
                                <div className='message'>{msg.data().text}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <form onSubmit={handleSubmit}>
                <fieldset className='d-flex justify-content-center'>
                    <input type='text' className='h-100 w-100' name='message'/>
                    <input type='submit' className='btn btn-primary btn-sm'/>
                </fieldset>
            </form>
        </>
    )
}
