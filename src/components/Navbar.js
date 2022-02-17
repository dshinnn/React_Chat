import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export default class Navbar extends Component {
  render() {
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid">
                <a className="navbar-brand" href="#">Chat</a>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarText">
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                    <li className="nav-item">
                    <Link className="nav-link active" aria-current="page" to="/">Home</Link>
                    </li>
                </ul>

                { this.props.loggedIn ? (
                    <span className="navbar-text">
                        <button type="button" className="btn btn-secondary btn-md" onClick = {() => this.props.signOut()}>Sign Out</button>
                    </span>
                ): (
                    <span className="navbar-text">
                        <Link type="button" className="btn btn-primary btn-md text-white" to='/signIn'> Sign In</Link>
                    </span>
                )}
                
                
                </div>
            </div>
        </nav>
    );
  }
}
