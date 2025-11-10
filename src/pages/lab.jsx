import "../styles/atom.scss";
import "../styles/auth.scss";
import { testConnection, registerUser, loginUser, logoutUser, getCurrentUser, isAuthenticated, updateUser, updatePassword, getAvatarBlob, requestEmailChange } from '../services/pocketbase';
import pb from '../services/pocketbase';
import React, { useState, useEffect, useRef } from 'react';
import Input from '../ui/atom/Input';
import PhotoUploader from '../ui/atom/PhotoUploader';
import Button from '../ui/atom/Button';

// User Profile Component (moved outside to prevent re-creation)
const UserProfile = ({
  currentUser,
  isEditMode,
  editData,
  passwordData,
  loading,
  passwordLoading,
  emailChangeLoading,
  pendingEmail,
  handleEditProfile,
  handleEditInputChange,
  handleSaveProfile,
  handleCancelEdit,
  handlePasswordInputChange,
  handleSavePassword,
  handleRequestEmailChange,
  handleLogout
}) => {
  const [avatarBlobUrl, setAvatarBlobUrl] = React.useState(null);

  // Debug info logging removed

  // Load avatar blob when component mounts or user changes
  React.useEffect(() => {
    const loadAvatar = async () => {
      if (currentUser && (currentUser.avatar || currentUser.photo)) {
        const avatarField = currentUser.avatar || currentUser.photo;

        try {
          const avatarUrl = await getAvatarBlob(currentUser, avatarField);
          setAvatarBlobUrl(avatarUrl);
        } catch (error) {
          setAvatarBlobUrl(null);
        }
      } else {
        setAvatarBlobUrl(null);
      }
    };

    loadAvatar();

    // No cleanup needed since we're not using blob URLs anymore
  }, [currentUser?.id, currentUser?.avatar, currentUser?.photo]);

  // Helper function to get the proper avatar URL
  const getAvatarUrl = (user) => {
    if (!user || (!user.avatar && !user.photo)) {
      return null;
    }

    // If it's a blob URL (preview during editing), return as is
    if ((user.avatar && user.avatar.startsWith('blob:')) || (user.photo && user.photo.startsWith('blob:'))) {
      return user.avatar || user.photo;
    }

    // Use the loaded avatar URL (now direct PocketBase URL, not blob)
    return avatarBlobUrl;
  };

  return (
    <div className="main_box">
      <h2 className="ds_title">User Profile</h2>

      {/* Debug info removed */}

      {isEditMode ? (
        // Edit Mode
        <div className="form-box" >
          {/* Photo Upload Section using PhotoUploader */}
          <div className="profile-field">
            <label>PHOTO UPLOADER</label>
            <PhotoUploader
              size={120}
              currentPhoto={editData.avatar || getAvatarUrl(currentUser)}
              onFileSelect={(file) => {
                // Forward as synthetic event to reuse existing handler
                handleEditInputChange({
                  target: { name: 'avatarFile', type: 'file', files: [file], value: '' }
                });
              }}
            />
          </div>
          <div className="section-box">
            <Input
              label="Name"
              name="name"
              value={editData.name}
              onChange={handleEditInputChange}
              placeholder="Enter your name"
              iconL="user"
              className="with-label"
            />

            <Input
              label="Username"
              name="username"
              value={editData.username}
              onChange={handleEditInputChange}
              placeholder="Enter your username"
              iconL="username"
              className="with-label"
            />

            <Button
              onClick={handleSaveProfile}
              disabled={loading}
              type="button"
              iconL="check_on"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </Button>

          </div>

          <div className="section-box">
            <Input
              label="Email"
              name="email"
              type="email"
              value={editData.email}
              onChange={handleEditInputChange}
              placeholder="Enter your new email"
              iconL="gmail"
              className="with-label"
            />
            
            {pendingEmail && (
              <div style={{ marginTop: '8px', fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
                Pending: {pendingEmail}
              </div>
            )}

            {editData.email !== currentUser.email && (
              <div>
                <Input
                  label="Password"
                  name="emailChangePassword"
                  type="password"
                  value={editData.emailChangePassword || ''}
                  onChange={handleEditInputChange}
                  placeholder="Enter your password to confirm email change"
                  iconL="lock"
                  className="with-label"
                />
                <Button
                  onClick={() => handleRequestEmailChange(editData.email, editData.emailChangePassword)}
                  disabled={emailChangeLoading || !editData.email.trim() || !editData.emailChangePassword}
                  type="button"
                  iconL="gmail"
                  className="sec"
                >
                  {emailChangeLoading ? 'Sending...' : 'Request Email Change'}
                </Button>
                <p>
                  A verification link will be sent to your new email address.
                </p>
              </div>
            )}

                        <Button
              onClick={handleSaveProfile}
              disabled={loading}
              type="button"
              iconL="check_on"
            >
              {loading ? 'Saving...' : 'Change Email'}
            </Button>

          </div>
          {/* Password Change Section */}
          <div className="section-box">

            <Input
              label="Current Password"
              name="oldPassword"
              type="password"
              value={passwordData.oldPassword}
              onChange={handlePasswordInputChange}
              placeholder="Enter current password"
              iconL="lock"
              className="with-label"
            />

            <Input
              label="New Password"
              name="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={handlePasswordInputChange}
              placeholder="Enter new password"
              iconL="lock"
              className="with-label"
            />


            <Button
              onClick={handleSavePassword}
              disabled={passwordLoading}
              type="button"
              iconL="check_on"
            >
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </Button>


          </div>
          <div className="section-box">
            <Button
              onClick={handleCancelEdit}
              disabled={loading}
              type="button"
              className="sec"
              iconL="close"
            >
              Cancel
            </Button>
          </div>
          {/* Email change section removed */}
        </div>
      ) : (
        // View Mode
        <div className="profile-info">
          {/* Enhanced Photo Display */}
          <div className="section-box">
            <div className="profile-field" >
              <div>
                {getAvatarUrl(currentUser) ? (
                  <img
                    src={getAvatarUrl(currentUser)}
                    alt="User Profile"
                    className="profile-avatar"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}

                <div className="profile-avatar-fallback" style={{ display: getAvatarUrl(currentUser) ? 'none' : 'flex' }}>
                  No Photo<br />Uploaded
                </div>
              </div>
            </div>

            <div className="profile-field">
              {/* <label >Name:</label> */}
              <span>{currentUser.name || 'Not provided'}</span>
            </div>
            <div className="profile-field">
              {/* <label >Username:</label> */}
              <span>{currentUser.username}</span>
            </div>
            <div className="profile-field">
              {/* <label >Email:</label> */}
              <span>{currentUser.email}</span>
              {pendingEmail && (
                <div style={{ marginTop: '8px', fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
                  Pending: {pendingEmail}
                </div>
              )}
            </div>
            {/* Verified and Created fields removed */}

          </div>
          <Button
            onClick={handleEditProfile}
            type="button"
            iconL="edit"
          >
            Edit Profile
          </Button>
          <Button
            onClick={handleLogout}
            type="button"
            className="lined"
            iconL="user"
          >
            Logout
          </Button>

        </div>
      )}
    </div>
  );
};

const Lab = () => {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentMode, setCurrentMode] = useState('login'); // 'login' or 'register'
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState({ name: '', username: '', email: '', emailChangePassword: '' });
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    avatar: null,
    avatarPreview: null
  });
  const [loginData, setLoginData] = useState({
    identifier: '', // email or username
    password: ''
  });

  // Ref to store the initial email to compare against
  const initialEmailRef = useRef(null);
  const subscribedUserIdRef = useRef(null);

  // Check authentication status on component mount
  useEffect(() => {
    if (isAuthenticated()) {
      const user = getCurrentUser();
      setCurrentUser(user);
      // Store initial email for comparison
      initialEmailRef.current = user?.email;
      
      // Load pending email from localStorage
      const storedCredentials = localStorage.getItem('pb_email_change_credentials');
      if (storedCredentials) {
        try {
          const credentials = JSON.parse(storedCredentials);
          // Only show pending email if it's for the current user
          if (credentials.userId === user?.id && credentials.newEmail) {
            setPendingEmail(credentials.newEmail);
          } else {
            setPendingEmail(null);
          }
        } catch (error) {
          console.error('Error parsing stored credentials:', error);
          setPendingEmail(null);
        }
      } else {
        setPendingEmail(null);
      }
    } else {
      setPendingEmail(null);
    }
  }, []);
  
  // Update pending email when currentUser changes
  useEffect(() => {
    if (currentUser?.id) {
      const storedCredentials = localStorage.getItem('pb_email_change_credentials');
      if (storedCredentials) {
        try {
          const credentials = JSON.parse(storedCredentials);
          if (credentials.userId === currentUser.id && credentials.newEmail) {
            setPendingEmail(credentials.newEmail);
          } else {
            setPendingEmail(null);
          }
        } catch (error) {
          setPendingEmail(null);
        }
      } else {
        setPendingEmail(null);
      }
    } else {
      setPendingEmail(null);
    }
  }, [currentUser?.id]);

  // Subscribe to realtime updates to detect email changes
  useEffect(() => {
    if (!currentUser || !currentUser.id) {
      // Unsubscribe if user is no longer available
      if (subscribedUserIdRef.current) {
        try {
          pb.collection('users').unsubscribe(subscribedUserIdRef.current);
        } catch (error) {
          console.error('Error unsubscribing:', error);
        }
        subscribedUserIdRef.current = null;
      }
      return;
    }

    // Skip if already subscribed to this user
    if (subscribedUserIdRef.current === currentUser.id) {
      return;
    }

    // Unsubscribe from previous user if switching users
    if (subscribedUserIdRef.current && subscribedUserIdRef.current !== currentUser.id) {
      try {
        pb.collection('users').unsubscribe(subscribedUserIdRef.current);
      } catch (error) {
        console.error('Error unsubscribing from previous user:', error);
      }
    }

    // Subscribe to changes in the user's record
    console.log('Setting up realtime subscription for user:', currentUser.id);
    
    try {
      const subscribePromise = pb.collection('users').subscribe(currentUser.id, async function (e) {
        console.log('=== Realtime update received ===');
        console.log('Action:', e.action);
        console.log('Updated record:', e.record);

        if (e.record && e.record.email) {
          const newEmail = e.record.email;
          const currentEmail = currentUser?.email;

          // Check if email has changed
          if (newEmail && newEmail !== currentEmail) {
            console.log('Email change detected via realtime! Old:', currentEmail, 'New:', newEmail);
            
            try {
              // Get stored credentials from localStorage
              const storedCredentials = localStorage.getItem('pb_email_change_credentials');
              
              if (storedCredentials) {
                try {
                  const credentials = JSON.parse(storedCredentials);
                  
                  // Verify this is for the current user and matches the new email
                  if (credentials.userId === e.record.id && credentials.newEmail === newEmail) {
                    console.log('Found stored credentials for email change');
                    
                    // Show success notification
                    setStatus('✅ Email update successful! Re-authenticating with new email...');
                    
                    // Unsubscribe from realtime before logout
                    if (subscribedUserIdRef.current) {
                      try {
                        pb.collection('users').unsubscribe(subscribedUserIdRef.current);
                        subscribedUserIdRef.current = null;
                      } catch (unsubError) {
                        console.error('Error unsubscribing:', unsubError);
                      }
                    }
                    
                    // Logout first
                    logoutUser();
                    
                    // Small delay before login
                    setTimeout(async () => {
                      try {
                        // Login with new email and saved password
                        console.log('Logging in with new email:', newEmail);
                        const loginResult = await loginUser(newEmail, credentials.password);
                        
                        if (loginResult.success) {
                          // Clear stored credentials
                          localStorage.removeItem('pb_email_change_credentials');
                          setPendingEmail(null);
                          
                          // Update current user
                          setCurrentUser(loginResult.data);
                          setStatus('✅ Email update successful! You have been logged in with your new email.');
                          
                          // Reload page to refresh everything
                          setTimeout(() => {
                            window.location.reload();
                          }, 1500);
                        } else {
                          setStatus('❌ Failed to re-authenticate. Please login manually with your new email.');
                          setCurrentUser(null);
                          // Clear stored credentials on failure
                          localStorage.removeItem('pb_email_change_credentials');
                          setPendingEmail(null);
                        }
                      } catch (loginError) {
                        console.error('Error during re-authentication:', loginError);
                        setStatus('❌ Failed to re-authenticate. Please login manually with your new email.');
                        setCurrentUser(null);
                        localStorage.removeItem('pb_email_change_credentials');
                        setPendingEmail(null);
                      }
                    }, 500);
                  } else {
                    // Credentials don't match, clear them
                    localStorage.removeItem('pb_email_change_credentials');
                    setPendingEmail(null);
                    setStatus('✅ Email update successful! Please login with your new email.');
                    setTimeout(() => {
                      window.location.reload();
                    }, 1500);
                  }
                } catch (parseError) {
                  console.error('Error parsing stored credentials:', parseError);
                  localStorage.removeItem('pb_email_change_credentials');
                  setPendingEmail(null);
                  setStatus('✅ Email update successful! Please login with your new email.');
                  setTimeout(() => {
                    window.location.reload();
                  }, 1500);
                }
              } else {
                // No stored credentials, just show notification and reload
                setPendingEmail(null);
                setStatus('✅ Email update successful! Please login with your new email.');
                setTimeout(() => {
                  window.location.reload();
                }, 1500);
              }
            } catch (error) {
              console.error('Error processing email change:', error);
              setPendingEmail(null);
              setStatus('✅ Email update successful! Please login with your new email.');
              setTimeout(() => {
                window.location.reload();
              }, 1500);
            }
          }
        }
      });

      // Handle Promise if subscribe returns one
      if (subscribePromise && typeof subscribePromise.then === 'function') {
        subscribePromise
          .then(() => {
            subscribedUserIdRef.current = currentUser.id;
            console.log('Successfully subscribed to user:', currentUser.id);
          })
          .catch((error) => {
            console.error('Failed to subscribe to user updates:', error);
          });
      } else {
        // If subscribe is synchronous, set ref immediately
        subscribedUserIdRef.current = currentUser.id;
        console.log('Successfully subscribed to user (sync):', currentUser.id);
      }
    } catch (error) {
      console.error('Exception during subscription setup:', error);
    }

    // Cleanup: unsubscribe when component unmounts or user changes
    return () => {
      if (subscribedUserIdRef.current) {
        try {
          pb.collection('users').unsubscribe(subscribedUserIdRef.current);
          console.log('Cleaned up subscription for user:', subscribedUserIdRef.current);
        } catch (error) {
          console.error('Error unsubscribing during cleanup:', error);
        }
        subscribedUserIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  const handleTestConnection = async () => {
    setLoading(true);
    setStatus('Testing connection...');

    const result = await testConnection();

    if (result.success) {
      setStatus(`✅ Connection successful! Found ${result.data.items.length} users.`);
    } else {
      setStatus(`❌ Connection failed: ${result.error}`);
    }
    setLoading(false);
  };

  // Removed: create dummy user handler

  // Removed email verification testing handler

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignupPhotoSelect = (file) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setFormData(prev => ({
      ...prev,
      avatar: file,
      avatarPreview: previewUrl
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!loginData.identifier || !loginData.password) {
      setStatus('❌ Please enter both email/username and password');
      return;
    }

    setLoading(true);
    setStatus('Logging in...');

    const result = await loginUser(loginData.identifier, loginData.password);

    if (result.success) {
      setStatus('✅ Login successful!');
      setCurrentUser(result.data);
      setLoginData({ identifier: '', password: '' });
    } else {
      setStatus(`❌ Login failed: ${result.error}`);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    // Unsubscribe from realtime updates before logging out
    if (subscribedUserIdRef.current) {
      try {
        pb.collection('users').unsubscribe(subscribedUserIdRef.current);
      } catch (error) {
        console.error('Error unsubscribing during logout:', error);
      }
      subscribedUserIdRef.current = null;
    }
    
    logoutUser();
    setCurrentUser(null);
    setPendingEmail(null);
    setStatus('✅ Logged out successfully');
    setCurrentMode('login');
  };

  const handleEditProfile = () => {
    setIsEditMode(true);
    setEditData({
      name: currentUser.name || '',
      username: currentUser.username || '',
      email: currentUser.email || '',
      avatar: currentUser.avatar || null,
      emailChangePassword: ''
    });
  };

  const handleEditInputChange = (e) => {
    const { name, type, files, value } = e.target;

    if (type === 'file' && name === 'avatarFile') {
      const file = files[0];
      if (file) {
        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          setStatus('❌ File size must be less than 5MB');
          return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          setStatus('❌ Please select a valid image file');
          return;
        }

        // Create preview URL and store file
        const previewUrl = URL.createObjectURL(file);
        setEditData(prev => {
          const newData = {
            ...prev,
            avatar: previewUrl,
            avatarFile: file // Store the actual file for upload
          };
          return newData;
        });
        setStatus(''); // Clear any previous error messages
      }
    } else {
      setEditData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSaveProfile = async () => {
    if (!editData.name.trim() || !editData.username.trim()) {
      setStatus('❌ Name and username are required');
      return;
    }

    setLoading(true);
    setStatus('Updating profile...');

    const result = await updateUser(currentUser.id, editData);
    if (result.success) {
      // Clean up any preview URLs
      if (editData.avatar && editData.avatar.startsWith('blob:')) {
        URL.revokeObjectURL(editData.avatar);
      }

      setCurrentUser(result.data);
      setIsEditMode(false);
      setStatus('✅ Profile updated successfully!');
    } else {
      console.error('Profile update failed:', result.error);
      setStatus(`❌ Update failed: ${result.error}`);
    }
    setLoading(false);
  };

  const handleCancelEdit = () => {
    // Clean up any preview URLs
    if (editData.avatar && editData.avatar.startsWith('blob:')) {
      URL.revokeObjectURL(editData.avatar);
    }

    setIsEditMode(false);
    setEditData({ name: '', username: '', email: '', emailChangePassword: '' });
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSavePassword = async () => {
    if (!passwordData.oldPassword || !passwordData.newPassword) {
      setStatus('❌ Please fill in both old and new passwords');
      return;
    }

    setPasswordLoading(true);
    setStatus('Updating password...');

    const result = await updatePassword(currentUser.id, passwordData.oldPassword, passwordData.newPassword);

    if (result.success) {
      setStatus('✅ Password updated successfully!');
      setPasswordData({ oldPassword: '', newPassword: '' });
    } else {
      setStatus(`❌ Password update failed: ${result.error}`);
    }
    setPasswordLoading(false);
  };

  const handleRequestEmailChange = async (newEmail, password) => {
    if (!newEmail || !newEmail.trim()) {
      setStatus('❌ Please enter a valid email address');
      return;
    }

    if (!password || !password.trim()) {
      setStatus('❌ Please enter your password to confirm email change');
      return;
    }

    if (newEmail === currentUser.email) {
      setStatus('❌ New email must be different from current email');
      return;
    }

    // Verify authentication before making the request
    if (!isAuthenticated() || !currentUser) {
      setStatus('❌ You are not authenticated. Please log out and log back in, then try again.');
      return;
    }

    setEmailChangeLoading(true);
    setStatus('Requesting email change...');

    const result = await requestEmailChange(newEmail);

    if (result.success) {
      // Store new email and password in localStorage for re-login after confirmation
      const emailChangeData = {
        newEmail: newEmail,
        password: password,
        userId: currentUser.id
      };
      localStorage.setItem('pb_email_change_credentials', JSON.stringify(emailChangeData));
      setPendingEmail(newEmail);
      
      setStatus(`✅ ${result.message || 'Email change verification link has been sent to your new email address. Please check your inbox.'}`);
      // Reset email field to current email after successful request
      setEditData(prev => ({
        ...prev,
        email: currentUser.email,
        emailChangePassword: ''
      }));
    } else {
      // If 401 error, try to re-authenticate with the provided password
      if (result.error && result.error.includes('Authentication failed')) {
        setStatus('❌ Authentication expired. Attempting to re-authenticate...');
        
        try {
          // Try to re-authenticate with current email and provided password
          const loginResult = await loginUser(currentUser.email, password);
          
          if (loginResult.success) {
            // Update current user and retry email change
            const updatedUser = loginResult.data;
            setCurrentUser(updatedUser);
            setStatus('✅ Re-authenticated. Retrying email change request...');
            
            // Retry the email change request
            const retryResult = await requestEmailChange(newEmail);
            
            if (retryResult.success) {
              const emailChangeData = {
                newEmail: newEmail,
                password: password,
                userId: updatedUser.id
              };
              localStorage.setItem('pb_email_change_credentials', JSON.stringify(emailChangeData));
              setPendingEmail(newEmail);
              setStatus(`✅ ${retryResult.message || 'Email change verification link has been sent to your new email address. Please check your inbox.'}`);
              setEditData(prev => ({
                ...prev,
                email: updatedUser.email,
                emailChangePassword: ''
              }));
            } else {
              setStatus(`❌ Email change request failed after re-authentication: ${retryResult.error}`);
            }
          } else {
            setStatus('❌ Failed to re-authenticate. Please log out and log back in, then try again.');
          }
        } catch (authError) {
          console.error('Re-authentication error:', authError);
          setStatus('❌ Failed to re-authenticate. Please log out and log back in, then try again.');
        }
      } else {
        setStatus(`❌ Email change request failed: ${result.error}`);
      }
    }
    setEmailChangeLoading(false);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.username || !formData.email || !formData.password) {
      setStatus('❌ Please fill in all required fields');
      return;
    }

    setLoading(true);
    setStatus('Creating user account...');

    // Create FormData object for file upload
    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('username', formData.username);
    submitData.append('email', formData.email);
    submitData.append('password', formData.password);
    // PocketBase requires passwordConfirm; reuse the single password input
    submitData.append('passwordConfirm', formData.password);

    // Use 'photo' field name to match PocketBase schema
    if (formData.avatar) {
      console.log('Adding photo file to registration:', formData.avatar.name, formData.avatar.size);
      submitData.append('photo', formData.avatar);
    }

    const result = await registerUser(submitData);

    if (result.success) {
      // Check if there's a custom message from the registration
      const successMessage = result.message || 'Registration successful!';
      setStatus(`✅ ${successMessage}`);

      // Clear form
      setFormData({
        name: '',
        username: '',
        email: '',
        password: '',
        avatar: null,
        avatarPreview: null
      });

      // If user was auto-logged in, update current user
      if (result.data && result.data.record) {
        setCurrentUser(result.data.record);
      } else {
        // Switch to login mode if not auto-logged in
        setCurrentMode('login');
      }
    } else {
      setStatus(`❌ Registration failed: ${result.error}`);
    }
    setLoading(false);
  };

  return (
    <div className="home">
      {(() => {
        const statusType = status.includes('✅') ? 'success' : status.includes('❌') ? 'error' : 'info';
        return (
          // Status Display
          status && (
            <div className={`main_box status status--${statusType}`}>
              <p>{status}</p>
            </div>
          )
        );
      })()}

      {/* Connection Test moved to bottom */}

      {/* Authentication Section */}
      {!currentUser ? (
        <div className="main_box">
          <div className="tab-container">
            <div
              className={`tab ${currentMode === 'login' ? 'selected' : ''}`}
              onClick={() => setCurrentMode('login')}
            >
              Login
            </div>
            <div
              className={`tab ${currentMode === 'register' ? 'selected' : ''}`}
              onClick={() => setCurrentMode('register')}
            >
              Register
            </div>
          </div>

          {currentMode === 'login' ? (
            // Login Form
            <form onSubmit={handleLogin}>
              <h2 className="ds_title">Login</h2>

              <Input
                label="Email or Username"
                name="identifier"
                value={loginData.identifier}
                onChange={handleLoginInputChange}
                placeholder="Enter your email or username"
                iconL="user"
              />

              <Input
                label="Password"
                name="password"
                type="password"
                value={loginData.password}
                onChange={handleLoginInputChange}
                placeholder="Enter your password"
                iconL="eye_off"
              />

              <Button
                type="submit"
                disabled={loading}
                iconL="user"
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          ) : (
            // Registration Form
            <form onSubmit={handleFormSubmit} className="auth-form">
              <h2 className="ds_title">Register New User</h2>
              <div className="profile-field">
                <PhotoUploader
                  size={120}
                  currentPhoto={formData.avatarPreview || ''}
                  onFileSelect={handleSignupPhotoSelect}
                />
              </div>
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                iconL="user"
              />

              <Input
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Choose a username"
                iconL="username"
              />

              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                iconL="gmail"
              />

              <Input
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Create a password"
                iconL="eye_off"
              />

              <Button
                type="submit"
                disabled={loading}
                iconL="user"
              >
                {loading ? 'Creating Account...' : 'Register'}
              </Button>
            </form>
          )}
        </div>
      ) : (
        // User Profile Section
        <UserProfile
          currentUser={currentUser}
          isEditMode={isEditMode}
          editData={editData}
          passwordData={passwordData}
          loading={loading}
          passwordLoading={passwordLoading}
          emailChangeLoading={emailChangeLoading}
          pendingEmail={pendingEmail}
          handleEditProfile={handleEditProfile}
          handleEditInputChange={handleEditInputChange}
          handleSaveProfile={handleSaveProfile}
          handleCancelEdit={handleCancelEdit}
          handlePasswordInputChange={handlePasswordInputChange}
          handleSavePassword={handleSavePassword}
          handleRequestEmailChange={handleRequestEmailChange}
          handleLogout={handleLogout}
        />
      )}

      {/* Bottom Connection Test Icon Button */}

      <div className="btn-row" >
        <Button
          onClick={handleTestConnection}
          disabled={loading}
          type="button"
          iconL="global"
          className="icon"
        />
      </div>

    </div>
  );
};

export default Lab;