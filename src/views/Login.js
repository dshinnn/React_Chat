import React, { Component } from 'react'

export default class Login extends Component {

  render() {
    return (
      <div className='container'>
        <div className='d-flex justify-content-center align-items-center'>
          <button type="button" className="btn btn-primary btn-lg w-75 h-100 p-5 my-5" onClick={()=>{this.props.signIn()}}>
            Sign In With Google
          </button>
        </div>
      </div>
    )
  }
}
