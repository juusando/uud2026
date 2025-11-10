import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import pb from '../services/pocketbase';
import "../styles/atom.scss";

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verifyEmail = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. No token provided.');
        return;
      }

      try {
        console.log('Attempting to verify email with token:', token);
        
        // Call PocketBase confirm verification API
        await pb.collection('users').confirmVerification(token);
        
        // Try auto-login using stored credentials from registration
        const pendingEmail = localStorage.getItem('pb_pending_email');
        const pendingPassword = localStorage.getItem('pb_pending_password');

        if (pendingEmail && pendingPassword) {
          try {
            const authData = await pb.collection('users').authWithPassword(pendingEmail, pendingPassword);
            // Clear stored credentials after successful login
            localStorage.removeItem('pb_pending_email');
            localStorage.removeItem('pb_pending_password');
            setStatus('success');
            setMessage('✅ Email verified! Redirecting to your profile...');
            navigate('/lab');
            return;
          } catch (loginErr) {
            console.warn('Auto-login after verification failed:', loginErr);
          }
        }

        // If no credentials or auto-login failed, show success and redirect
        setStatus('success');
        setMessage('✅ Email verified! Please log in to continue.');
        navigate('/lab');
        
      } catch (error) {
        console.error('Email verification failed:', error);
        setStatus('error');
        
        if (error.status === 400) {
          setMessage('❌ Invalid or expired verification link. Please request a new verification email.');
        } else if (error.status === 404) {
          setMessage('❌ Verification token not found. The link may have expired.');
        } else {
          setMessage(`❌ Verification failed: ${error.message || 'Unknown error'}`);
        }
      }
    };

    verifyEmail();
  }, [location.search, navigate]);

  return (
    <div className="lab-container" style={{ textAlign: 'center', padding: '50px 20px' }}>
      <h1>Email Verification</h1>
      
      <div style={{ 
        padding: '30px', 
        borderRadius: '8px', 
        backgroundColor: status === 'success' ? '#d4edda' : status === 'error' ? '#f8d7da' : '#d1ecf1',
        border: `1px solid ${status === 'success' ? '#c3e6cb' : status === 'error' ? '#f5c6cb' : '#bee5eb'}`,
        color: status === 'success' ? '#155724' : status === 'error' ? '#721c24' : '#0c5460',
        maxWidth: '500px',
        margin: '0 auto'
      }}>
        {status === 'verifying' && (
          <div>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
            <p>{message}</p>
          </div>
        )}
        
        {status === 'success' && (
          <div>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
            <h2>Email Verified!</h2>
            <p>{message}</p>
            <p style={{ marginTop: '20px', fontSize: '14px' }}>
              Redirecting to login page in 3 seconds...
            </p>
          </div>
        )}
        
        {status === 'error' && (
          <div>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
            <h2>Verification Failed</h2>
            <p>{message}</p>
            <button 
              onClick={() => navigate('/lab')}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Go to Login Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;