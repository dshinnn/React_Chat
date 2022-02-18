import React from 'react'

export default function Login (props) {
  return (
    <div className='container'>
      <div className='d-flex justify-content-center align-items-center'>
        <button type="button" className="btn btn-primary btn-lg w-75 h-100 p-5 my-5" onClick={()=>{props.signIn()}}>
          <h1>Sign In With Google</h1>
        </button>
      </div>
    </div>
  )
}
