import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, query, onSnapshot, orderBy, doc, deleteDoc, updateDoc } from "firebase/firestore"

export default function Home(props) {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const scroll = useRef();
    const oldMessage = useRef();
    const inputField = useRef();
    const db = getFirestore();
    const messagesRef = collection(db, 'messages');
    
    function editSettings(option) {

        if (option === 'show') {
            oldMessage.current.style.display = 'none';
            inputField.current.style.display = 'contents';
        } else if (option === 'hide') {
            oldMessage.current.style.display = 'contents';
            inputField.current.style.display = 'none';
        }
    }

    async function updateMessage(messageId, text) {
        console.log('updateMessage ran');
        const msgDoc = doc(db, 'messages', messageId);
        await updateDoc(msgDoc, {
            text: text
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

        loadMessages();
      }, []);

    if (loading) {
        return <h1>Loading...</h1>;
    }

    return (
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
            
                <div className="card-body">
                    <div className="messages p-2 ms-2">
                        { messages.map((msg) => 
                            <div className='message-container p-2 mb-1' key={msg.id}>
                                <div className='d-flex align-items-center'>
                                    <img src={msg.data().profilePicUrl} className='profilePic rounded-circle'></img>
                                    <div className='message ms-2'>
                                        {msg.data().name} 
                                            <span className='date fst-italic ms-2'>
                                                {msg.data().timestamp ? msg.data().timestamp.toDate().toDateString() : Date.now()}
                                            </span>                                           
                                            { props.user === msg.data().user ? (
                                                <div className='me-5 position-absolute end-0 translate-middle-y'>
                                                    <div className="dropdown">
                                                        <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                                                            ...
                                                        </button>
                                                        <ul className="dropdown-menu dropdown-menu-dark" aria-labelledby="dropdownMenuButton1">
                                                            <li><button className='dropdown-item' type='button' onClick={() => { editSettings('show') } }>Edit</button></li>
                                                            <li><button className='dropdown-item' type='button' onClick={() => { deleteMessage(msg.id) } }>Delete</button> </li>
                                                        </ul>
                                                        </div>
                                                    
                                                                                               
                                                </div>
                                                ) : null
                                            }
                                            <div ref={oldMessage} className='text'>{msg.data().text}</div>
                                        </div>
                                </div>
                                
                                <div ref={inputField} style={{display: 'none'}}>
                                    <input type='text' className='text ms-5 ps-1' defaultValue={msg.data().text} onKeyDown={(e) => {
                                            if(e.key === 'Enter') {
                                                e.preventDefault();
                                                console.log(e.target.value);
                                                updateMessage(msg.id, e.target.value);
                                                editSettings('hide')
                                                e.target.value = null;
                                            } else if (e.key === 'Escape'){ 
                                                e.preventDefault();
                                                editSettings('hide')
                                            }
                                        }
                                    }/>
                                    <p className='text-muted fst-italic text ms-5 ps-1'>press esc to cancel</p>
                                </div>
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
