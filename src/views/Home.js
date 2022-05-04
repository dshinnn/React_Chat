import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, query, onSnapshot, orderBy, doc, deleteDoc, updateDoc } from "firebase/firestore"

export default function Home(props) {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const scroll = useRef();
    const db = getFirestore();
    const messagesRef = collection(db, 'messages');
    
    function getFocus(messageId) {
        document.getElementById('editText').focus();
    }
    /*
        params: messageId, option
        description: hides current message and display an input field to edit the current message
    */
    function editSettings(messageId, option) {
        let oldMsg = document.getElementById(messageId + '_oldText');
        let editMsg = document.getElementById(messageId);
        if (option === 'edit') { 
            oldMsg.style.display = 'none';
            editMsg.style.display = 'contents';
            // Focuses on 'edit message' input field after it is shown
            document.getElementById(messageId + '_input').focus();
        }
        else {
            oldMsg.style.display = 'contents';
            editMsg.style.display = 'none';
        }     
    }

    /* 
        params: messageId, newText
        description: updates the old message with the new message in the database once the enter key is pressed
    */
    async function updateMessage(messageId, newText) {
        let msgDoc = doc(db, 'messages', messageId)
        await updateDoc(msgDoc, {
            text: newText
        });
    }

    //  Deletes message by messageId in database
    async function deleteMessage(messageId) {
        await deleteDoc(doc(db, 'messages', messageId));
    }

    useEffect(() => {
        // if user is not logged in, send to login page
        if (!props.user) {
            navigate('/');
            return
        }
        
        function loadMessages() {
            // Queries the firestore database for all the messages and display by oldest to newest message
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

        loadMessages();
      }, []);

    if (loading) {
        return <h1>Loading...</h1>;
    }

    return (
        //  Header for the chat app
        <div className='vh-100'> 
            <div className="card vh-100 w-100 scrollbar">
                <div className='d-flex justify-content-center mb-3'>
                    <h1 className='text-center mt-5'>Chat Web App</h1>
                    <div className='d-flex justify-content-center align-items-center position-absolute end-0 mt-4 me-5 p-3 border border-success border-2 rounded-pill '>
                        <img src={ props.userImg } className='profilePic rounded-circle'/>
                        <h5 className='mx-3 mt-1'>{ props.userName }</h5>
                        <button className="btn btn-secondary btn-sm me-3" onClick={() => props.signOut()}>Sign Out</button>
                    </div>
                    
                </div>

                {/* chat box container */}
                <div className="card-body">
                    {/* container that contains all the individual message containers */}
                    <div className="messages p-2 ms-2">
                        { messages.map((msg) => 
                            // Individual message containers
                            <div className='message-container p-2 mb-1' key={msg.id}>
                                <div className='d-flex align-items-center'>
                                    {/* Displays profile images linked with the users' Google account */}
                                    <img src={msg.data().profilePicUrl} className='profilePic rounded-circle'></img>  
                                    <div className='message ms-2'>
                                        {/* Displays sender's name */}
                                        {msg.data().name} 
                                            {/* Display the date the message was sent  */}
                                            <span className='date fst-italic ms-2'>
                                                {msg.data().timestamp ? msg.data().timestamp.toDate().toDateString() : Date.now()}
                                            </span>
                                            {/* Displays edit and delete settings for messages sent by the current user */}
                                            { props.user === msg.data().user ? (
                                                <div className='me-5 position-absolute end-0 translate-middle-y'>
                                                    <div className="dropdown">
                                                        <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                                                            ...
                                                        </button>
                                                        <ul className="dropdown-menu dropdown-menu-dark" aria-labelledby="dropdownMenuButton1">
                                                            {/* Calls editSettings function when 'edit' is selected */}
                                                            <li><button className='dropdown-item' type='button' onClick={() => { editSettings(msg.id, 'edit') } }>Edit</button></li>
                                                            {/*  Calls deleteMessage function when 'delete' is selected */}
                                                            <li><button className='dropdown-item' type='button' onClick={() => { deleteMessage(msg.id) } }>Delete</button> </li>
                                                        </ul>
                                                        </div>
                                                    
                                                                                               
                                                </div>
                                                ) : null
                                            }
                                            {/* Displays most updated message sent by the user */}
                                            <div id={msg.id + '_oldText'} style={{display: 'contents'}}><br></br>{msg.data().text}</div>
                                            {/* Creates an input field for editing messages but hidden until 'edit' is selected */}
                                            <div id={msg.id} style={{display: 'none'}}>
                                                <br></br>

                                                {/* Input field for editing the message and onKeyDown execution depending on if the user edited the message or not */}
                                                <input type='text' id={msg.id + '_input'} defaultValue={msg.data().text} onKeyDown={(e) => {
                                                    if(e.key === 'Enter') {
                                                        e.preventDefault();
                                                        updateMessage(msg.id, e.target.value);
                                                        editSettings(msg.id, null);
                                                    } else if (e.key === 'Escape'){ 
                                                        e.preventDefault();
                                                        editSettings(msg.id, null);
                                                    }
                                                }
                                                }/>
                                                <p className='text-muted fst-italic text'>press esc to cancel</p>
                                            </div>
                                        </div>
                                </div>
                            </div>
                        )}
                            <div className='text-div bottom-0'>
                                <input type='text' autoFocus className='msg-txt h-100 w-100 border border-secondary rounded-pill text-white p-2 ps-3' name='message' placeholder="Message" 
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
