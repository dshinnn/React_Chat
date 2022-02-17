import React from 'react'

export default function Home(props) {
    function handleSubmit(e) {
        e.preventDefault();
        props.saveMessage(e.target.message.value);
    }

    return (
        <>
            <div className="card w-50">
                <div className="card-body">
                </div>
            </div>
            <form onSubmit={handleSubmit}>
                <fieldset>
                    <input type='text' className='h-100' name='message'/>
                    <input type='submit' className='btn btn-primary btn-sm'/>
                </fieldset>
            </form>
        </>
    )
}
