import "../styles/atom.scss";
import "../styles/auth.scss";
import { registerUser, loginUser, logoutUser, getCurrentUser, isAuthenticated, updateUser, updatePassword, getAvatarBlob, requestEmailChange } from '../services/pocketbase';
import pb from '../services/pocketbase';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../ui/atom/Input';
import PhotoUploader from '../ui/atom/PhotoUploader';
import Button from '../ui/atom/Button';
import Alert from '../ui/atom/Alert.jsx';
import Popup from '../ui/atom/Popup';
import CountryDropDown from '../ui/atom/CountryDropDown';
import DropdownInput from '../ui/atom/DropDown';
import CountryFlag from '../data/IconCountry';
import countriesData from '../data/countries.json';

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
  handleLogout,
  handleDeleteAccount
}) => {
  const [avatarBlobUrl, setAvatarBlobUrl] = React.useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [deletePassword, setDeletePassword] = React.useState('');
  const countryIso = React.useMemo(() => {
    if (!currentUser?.country) return null;
    const match = countriesData.find(c => c.label === currentUser.country);
    return match?.iso2 || null;
  }, [currentUser?.country]);

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
      {/* Debug info removed */}

      {isEditMode ? (
        // Edit Mode
        <div className="auth-form">
          {/* Photo Upload Section using PhotoUploader */}
          <div className="profile-field">
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

            <CountryDropDown
              label="Country"
              name="country"
              placeholder="Select Country"
              className="with-label"
              value={editData.country}
              onSelect={(opt) =>
                handleEditInputChange({
                  target: {
                    name: 'country',
                    value: opt && typeof opt === 'object' ? opt.label : ''
                  }
                })
              }
            />

            <DropdownInput
              label="Role"
              iconR="drop_down"
              focusR="drop_up"
              placeholder="Select Role"
              className="with-label"
              value={editData.role}
              onSelect={(val) =>
                handleEditInputChange({ target: { name: 'role', value: val } })
              }
            >
              <span>Member</span>
              <span>Creator</span>
              <span>Manager</span>
              <span>Admin</span>
              <span>Guest</span>
            </DropdownInput>

            <Button
              onClick={handleSaveProfile}
              disabled={loading}
              type="button"
              iconR="ok"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </Button>

          </div>

          <div className="section-box">
            <div>
              Current Email: {currentUser.email}
            </div>
            <Input
              label="New Email Address"
              name="email"
              type="email"
              value={editData.email}
              onChange={handleEditInputChange}
              placeholder=""
              iconL="gmail"
              className="with-label"
            />
            
            {pendingEmail && (
              <p>
                Pending: {pendingEmail}
              </p>
            )}

            {editData.email.trim() && editData.email !== currentUser.email && (
              <>
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
              </>
            )}

            <Button
              onClick={handleSaveProfile}
              disabled={loading}
              type="button"
              iconR="ok"
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
              iconR="ok"
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
              iconR="close"
            >
              Cancel
            </Button>

            <Button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={loading}
              type="button"
              className="sec"
            >
              Delete Account
            </Button>
            <Popup
              isOpen={showDeleteConfirm}
              onClose={() => setShowDeleteConfirm(false)}
              title="Delete Account"
              text="This will permanently delete your account. This action cannot be undone."
              iconName="trash"
            >
              <Input
                label="Confirm Password"
                name="deletePassword"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter your password"
                iconL="lock"
                className="with-label"
              />
              <div style={{display:'flex', gap:'12px'}}>
                <Button
                  onClick={() => handleDeleteAccount(deletePassword)}
                  disabled={loading || !deletePassword.trim()}
                  type="button"
                  iconR="trash"
                >
                  Confirm Delete
                </Button>
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  type="button"
                  className="sec"
                  iconR="close"
                >
                  Cancel
                </Button>
              </div>
            </Popup>
          </div>
          {/* Email change section removed */}
        </div>
      ) : (
        // View Mode
        <div className="auth-form">
          {/* Enhanced Photo Display */}
       
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
            <div className="profile-field">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {countryIso && (
                  <CountryFlag
                    Name={countryIso.toLowerCase()}
                    style={{ width: 32, height: 32, borderRadius: '50%' }}
                  />
                )}
                <span>{(currentUser.country || 'Not provided').slice(0, 16)}</span>
              </div>
            </div>
            <div className="profile-field">
              <span>{currentUser.role || 'Not provided'}</span>
            </div>
            {/* Verified and Created fields removed */}

        <div className="button-box">
          <Button
            onClick={handleEditProfile}
            type="button"
            iconL="setting"
            className="nav-btn"
          />
          <Button
            onClick={handleLogout}
            type="button"
            iconL="logout"
            className="nav-btn"
          />
          </div>
        </div>
      )}
    </div>
  );
};

const Lab = () => {
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState('info');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentMode, setCurrentMode] = useState('login'); // 'login' or 'register'
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState({ name: '', username: '', email: '', emailChangePassword: '' });
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    country: '',
    role: '',
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
                    setStatus('  Email update successful! Re-authenticating with new email...');
                    
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
                          setStatus('  Email update successful! You have been logged in with your new email.');
                          
                          // Reload page to refresh everything
                          setTimeout(() => {
                            window.location.reload();
                          }, 1500);
                        } else {
                          setStatus(' Failed to re-authenticate. Please login manually with your new email.');
                          setCurrentUser(null);
                          // Clear stored credentials on failure
                          localStorage.removeItem('pb_email_change_credentials');
                          setPendingEmail(null);
                        }
                      } catch (loginError) {
                        console.error('Error during re-authentication:', loginError);
                        setStatus(' Failed to re-authenticate. Please login manually with your new email.');
                        setCurrentUser(null);
                        localStorage.removeItem('pb_email_change_credentials');
                        setPendingEmail(null);
                      }
                    }, 500);
                  } else {
                    // Credentials don't match, clear them
                    localStorage.removeItem('pb_email_change_credentials');
                    setPendingEmail(null);
                    setStatus('  Email update successful! Please login with your new email.');
                    setTimeout(() => {
                      window.location.reload();
                    }, 1500);
                  }
                } catch (parseError) {
                  console.error('Error parsing stored credentials:', parseError);
                  localStorage.removeItem('pb_email_change_credentials');
                  setPendingEmail(null);
                  setStatus('  Email update successful! Please login with your new email.');
                  setTimeout(() => {
                    window.location.reload();
                  }, 1500);
                }
              } else {
                // No stored credentials, just show notification and reload
                setPendingEmail(null);
                setStatus('  Email update successful! Please login with your new email.');
                setTimeout(() => {
                  window.location.reload();
                }, 1500);
              }
            } catch (error) {
              console.error('Error processing email change:', error);
              setPendingEmail(null);
              setStatus('  Email update successful! Please login with your new email.');
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
      setStatus('Please enter both email/username and password');
      setStatusType('error');
      return;
    }

    setLoading(true);
    setStatus('Logging in...');
    setStatusType('info');

    const result = await loginUser(loginData.identifier, loginData.password);

    if (result.success) {
      setStatus('Login successful!');
      setStatusType('success');
      setCurrentUser(result.data);
      setLoginData({ identifier: '', password: '' });
    } else {
      setStatus(`Login failed: ${result.error}`);
      setStatusType('error');
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
    setStatus('Logged out successfully');
    setStatusType('success');
    setCurrentMode('login');
  };

  const handleDeleteAccount = async (password) => {
    if (!password || !password.trim()) {
      setStatus('Please enter your password to confirm account deletion');
      setStatusType('error');
      return;
    }

    setLoading(true);
    setStatus('Re-authenticating...');
    setStatusType('info');

    try {
      const auth = await loginUser(currentUser.email, password);
      if (!auth.success) {
        setStatus('Authentication failed. Check your password.');
        setStatusType('error');
        setLoading(false);
        return;
      }

      setStatus('Deleting account...');
      setStatusType('info');
      await pb.collection('users').delete(currentUser.id);
      setStatus('Account deleted successfully');
      setStatusType('success');
      // Clear any stored email change credentials
      localStorage.removeItem('pb_email_change_credentials');
      logoutUser();
      setCurrentUser(null);
      setIsEditMode(false);
      navigate('/');
    } catch (error) {
      setStatus(`Account deletion failed: ${error?.message || 'Unknown error'}`);
      setStatusType('error');
    }
    setLoading(false);
  };

  const handleEditProfile = () => {
    setIsEditMode(true);
    setEditData({
      name: currentUser.name || '',
      username: currentUser.username || '',
      email: '',
      country: currentUser.country || '',
      role: currentUser.role || '',
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
          setStatus('File size must be less than 5MB');
          setStatusType('error');
          return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          setStatus('Please select a valid image file');
          setStatusType('error');
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
        setStatusType('info');
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
      setStatus('Name and username are required');
      setStatusType('error');
      return;
    }

    setLoading(true);
    setStatus('Updating profile...');
    setStatusType('info');

    const result = await updateUser(currentUser.id, editData);
    if (result.success) {
      // Clean up any preview URLs
      if (editData.avatar && editData.avatar.startsWith('blob:')) {
        URL.revokeObjectURL(editData.avatar);
      }

      setCurrentUser(result.data);
      setIsEditMode(false);
      setStatus('Profile updated successfully!');
      setStatusType('success');
    } else {
      console.error('Profile update failed:', result.error);
      setStatus(`Update failed: ${result.error}`);
      setStatusType('error');
    }
    setLoading(false);
  };

  const handleCancelEdit = () => {
    // Clean up any preview URLs
    if (editData.avatar && editData.avatar.startsWith('blob:')) {
      URL.revokeObjectURL(editData.avatar);
    }

    setIsEditMode(false);
    setEditData({ name: '', username: '', email: '', country: '', role: '', avatar: null, emailChangePassword: '' });
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
      setStatus('Please fill in both old and new passwords');
      setStatusType('error');
      return;
    }

    setPasswordLoading(true);
    setStatus('Updating password...');
    setStatusType('info');

    const result = await updatePassword(currentUser.id, passwordData.oldPassword, passwordData.newPassword);

    if (result.success) {
      setStatus('Password updated successfully!');
      setStatusType('success');
      setPasswordData({ oldPassword: '', newPassword: '' });
    } else {
      setStatus(`Password update failed: ${result.error}`);
      setStatusType('error');
    }
    setPasswordLoading(false);
  };

  const handleRequestEmailChange = async (newEmail, password) => {
    if (!newEmail || !newEmail.trim()) {
      setStatus('Please enter a valid email address');
      setStatusType('error');
      return;
    }

    if (!password || !password.trim()) {
      setStatus('Please enter your password to confirm email change');
      setStatusType('error');
      return;
    }

    if (newEmail === currentUser.email) {
      setStatus('New email must be different from current email');
      setStatusType('error');
      return;
    }

    // Verify authentication before making the request
    if (!isAuthenticated() || !currentUser) {
      setStatus('You are not authenticated. Please log out and log back in, then try again.');
      setStatusType('error');
      return;
    }

    setEmailChangeLoading(true);
    setStatus('Requesting email change...');
    setStatusType('info');

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
      
      setStatus(`${result.message || 'Email change verification link has been sent to your new email address. Please check your inbox.'}`);
      setStatusType('success');
      // Reset email field to current email after successful request
      setEditData(prev => ({
        ...prev,
        email: currentUser.email,
        emailChangePassword: ''
      }));
    } else {
      // If 401 error, try to re-authenticate with the provided password
      if (result.error && result.error.includes('Authentication failed')) {
        setStatus('Authentication expired. Attempting to re-authenticate...');
        setStatusType('warning');
        
        try {
          // Try to re-authenticate with current email and provided password
          const loginResult = await loginUser(currentUser.email, password);
          
          if (loginResult.success) {
            // Update current user and retry email change
            const updatedUser = loginResult.data;
            setCurrentUser(updatedUser);
            setStatus('Re-authenticated. Retrying email change request...');
            setStatusType('info');
            
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
              setStatus(`${retryResult.message || 'Email change verification link has been sent to your new email address. Please check your inbox.'}`);
              setStatusType('success');
              setEditData(prev => ({
                ...prev,
                email: updatedUser.email,
                emailChangePassword: ''
              }));
            } else {
              setStatus(`Email change request failed after re-authentication: ${retryResult.error}`);
              setStatusType('error');
            }
          } else {
            setStatus('Failed to re-authenticate. Please log out and log back in, then try again.');
            setStatusType('error');
          }
        } catch (authError) {
          console.error('Re-authentication error:', authError);
          setStatus('Failed to re-authenticate. Please log out and log back in, then try again.');
          setStatusType('error');
        }
      } else {
        setStatus(`Email change request failed: ${result.error}`);
        setStatusType('error');
      }
    }
    setEmailChangeLoading(false);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.username || !formData.email || !formData.password || !formData.country || !formData.role) {
      setStatus('Please fill in all required fields');
      setStatusType('error');
      return;
    }

    setLoading(true);
    setStatus('Creating user account...');
    setStatusType('info');

    // Create FormData object for file upload
    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('username', formData.username);
    submitData.append('email', formData.email);
    submitData.append('password', formData.password);
    // PocketBase requires passwordConfirm; reuse the single password input
    submitData.append('passwordConfirm', formData.password);
    submitData.append('country', formData.country);
    submitData.append('role', formData.role);

    // Use 'photo' field name to match PocketBase schema
    if (formData.avatar) {
      console.log('Adding photo file to registration:', formData.avatar.name, formData.avatar.size);
      submitData.append('photo', formData.avatar);
    }

    const result = await registerUser(submitData);

    if (result.success) {
      // Check if there's a custom message from the registration
      const successMessage = result.message || 'Registration successful!';
      setStatus(successMessage);
      setStatusType('success');

      // Clear form
      setFormData({
        name: '',
        username: '',
        email: '',
        password: '',
        country: '',
        role: '',
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
      setStatus(`Registration failed: ${result.error}`);
      setStatusType('error');
    }
    setLoading(false);
  };

  // statusType is managed explicitly along with status

  return (
    <div className="home">
      {status && (
        <Alert
          message={status}
          type={statusType}
          isVisible={true}
          onClose={() => setStatus('')}
        />
      )}

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
              Signup
            </div>
          </div>

      {currentMode === 'login' ? (
            // Login Form
            <form onSubmit={handleLogin} className="auth-form">
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
                iconL="password"
              />

              <Button
                type="submit"
                disabled={loading}
                iconR="login"
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          ) : (
            // Registration Form
            <form onSubmit={handleFormSubmit} className="auth-form">
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
                iconL="mail"
              />

              <Input
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Create a password"
                iconL="password"
              />

              {/* Country and Role */}
            
                <CountryDropDown
                  label="Country"
                  name="country"
                  placeholder="Select Country"
                  value={formData.country}
                  onSelect={(opt) => setFormData(prev => ({
                    ...prev,
                    country: opt && typeof opt === 'object' ? opt.label : ''
                  }))}
                />

                <DropdownInput
                  label="Role"
                  iconR="drop_down"
                  focusR="drop_up"
                  placeholder="Select Role"
                  value={formData.role}
                  onSelect={(val) => setFormData(prev => ({ ...prev, role: val }))}
                >
                  <span>Member</span>
                  <span>Creator</span>
                  <span>Manager</span>
                  <span>Admin</span>
                  <span>Guest</span>
                </DropdownInput>
              

              <Button
                type="submit"
                disabled={loading}
                iconR="signup"
              >
                {loading ? 'Creating Account...' : 'Signup'}
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
          handleDeleteAccount={handleDeleteAccount}
        />
      )}

      

    </div>
  );
};

export default Lab;