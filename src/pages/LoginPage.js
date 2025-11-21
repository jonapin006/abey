import React from 'react';
import LoginForm from '../components/LoginForm';
import '../styles/login.css';
import bgLogin from '../assets/bg-login.png';
import logo from '../assets/logo.png';

function LoginPage() {
  return (
    <div className="login-main-bg">
      <div
        className="login-left-img"
        style={{ background: `url(${bgLogin}) center center/cover no-repeat` }}
      />
      <div className="login-side-right">
        <img className="login-logo" src={logo} alt="Abey Consultores" />
        <LoginForm />
      </div>
    </div>
  );
}

export default LoginPage;
