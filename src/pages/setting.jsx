import "../styles/atom.scss";
import "../styles/auth.scss";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../ui/atom/Input";
import PhotoUploader from "../ui/atom/PhotoUploader";
import Button from "../ui/atom/Button";
import Alert from "../ui/atom/Alert.jsx";
import Popup from "../ui/atom/Popup";
import CountryDropDown from "../ui/atom/CountryDropDown";
import DropdownInput from "../ui/atom/DropDown";
import TextArea from "../ui/atom/Textarea";
import pb, { getCurrentUser, isAuthenticated, updateUser, updatePassword, requestEmailChange, getUserAvatarUrl } from "../services/pocketbase";
import Header from "../ui/compo/Header.jsx";

const Setting = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("info");
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    username: "",
    country: "",
    role: "",
    word: "",
    avatar: null,
    avatarPreview: null,
    email: "",
    currentEmail: "",
  });
  const [passwordData, setPasswordData] = useState({ oldPassword: "", newPassword: "" });
  const [deletePopup, setDeletePopup] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    const user = getCurrentUser();
    if (user) {
      setEditData({
        name: user.name || "",
        username: user.username || "",
        country: user.country || "",
        role: user.role || "",
        word: user.word || "",
        avatar: null,
        avatarPreview: getUserAvatarUrl(user, user?.photo) || "",
        email: "",
        currentEmail: user.email || "",
      });
    }
  }, [navigate]);

  const handleEditInputChange = (e) => {
    const { name, value, files } = e.target;
    setEditData((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleEditPhotoSelect = (file) => {
    if (!file) {
      setEditData((prev) => ({ ...prev, avatar: null, avatarPreview: "" }));
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setEditData((prev) => ({ ...prev, avatar: file, avatarPreview: previewUrl }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("Saving profile...");
    setStatusType("info");
    const result = await updateUser(pb.authStore.model.id, {
      name: editData.name,
      username: editData.username,
      country: editData.country,
      role: editData.role,
      word: editData.word || "",
      avatarFile: editData.avatar || null,
      removePhoto: editData.avatar === null && !editData.avatarPreview,
    });
    if (result.success) {
      setStatus("Profile updated successfully!");
      setStatusType("success");
    } else {
      setStatus(`Update failed: ${result.error}`);
      setStatusType("error");
    }
    setLoading(false);
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!passwordData.oldPassword || !passwordData.newPassword) {
      setStatus("Enter current and new password");
      setStatusType("error");
      return;
    }
    setLoading(true);
    const result = await updatePassword(pb.authStore.model.id, passwordData.oldPassword, passwordData.newPassword);
    if (result.success) {
      setStatus("Password updated successfully!");
      setStatusType("success");
      setPasswordData({ oldPassword: "", newPassword: "" });
    } else {
      setStatus(`Password update failed: ${result.error}`);
      setStatusType("error");
    }
    setLoading(false);
  };

  const handleRequestEmailChange = async (e, newEmail) => {
    e.preventDefault();
    if (!newEmail) {
      setStatus("Enter a new email");
      setStatusType("error");
      return;
    }
    setLoading(true);
    const result = await requestEmailChange(newEmail);
    if (result.success) {
      setStatus("Email change requested. Check your inbox.");
      setStatusType("success");
    } else {
      setStatus(`Email change failed: ${result.error}`);
      setStatusType("error");
    }
    setLoading(false);
  };

  return (
    <>
    <Header />
    <div className="main_box">
      {status && (
        <Alert message={status} type={statusType} isVisible={true} onClose={() => setStatus("")} />
      )}
      <form onSubmit={handleSaveProfile} className="auth-form">
        <div className="profile-field">
          <PhotoUploader size={120} currentPhoto={editData.avatarPreview || ""} onFileSelect={handleEditPhotoSelect} />
        </div>
        <Input label="Full Name" name="name" value={editData.name} onChange={handleEditInputChange} placeholder="Enter your full name" iconL="user" />
        <Input label="Username" name="username" value={editData.username} onChange={handleEditInputChange} placeholder="Choose a username" iconL="username" />
        <CountryDropDown label="Country" name="country" placeholder="Select Country" value={editData.country} onSelect={(opt) => setEditData(prev => ({ ...prev, country: opt && typeof opt === 'object' ? opt.label : '' }))} />
        <DropdownInput label="Role" iconR="drop_down" focusR="drop_up" placeholder="Select Role" value={editData.role} onSelect={(val) => setEditData(prev => ({ ...prev, role: val }))}>
          <span>Member</span>
          <span>Creator</span>
          <span>Manager</span>
          <span>Admin</span>
          <span>Guest</span>
        </DropdownInput>
        <TextArea title="Work" name="word" placeholder="Describe your work (max 240 chars)" maxLength={240} value={editData.word} onChange={handleEditInputChange} />
        <Button type="submit" disabled={loading} iconR="save">{loading ? "Saving..." : "Save Profile"}</Button>
      </form>

      <form onSubmit={(e) => handleRequestEmailChange(e, editData.email)} className="auth-form">
        <div className="profile-field">
          <div className="input-label">Current Email</div>
          <div>{editData.currentEmail || ""}</div>
        </div>
        <Input label="New Email" name="email" type="email" value={editData.email || ""} onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))} placeholder="Enter new email" iconL="mail" />
        <Button type="submit" disabled={loading} iconR="mail">Request Email fix setting</Button>
      </form>

      <form onSubmit={handleSavePassword} className="auth-form">
        <Input label="Current Password" name="oldPassword" type="password" value={passwordData.oldPassword} onChange={handlePasswordInputChange} placeholder="Enter current password" iconL="password" />
        <Input label="New Password" name="newPassword" type="password" value={passwordData.newPassword} onChange={handlePasswordInputChange} placeholder="Enter new password" iconL="password" />
        <Button type="submit" disabled={loading} iconR="save">Update Password</Button>
      </form>

      {deletePopup && (
        <Popup title="Confirm Delete" acceptTitle="Delete" cancelTitle="Cancel" onAccept={() => {}} onCancel={() => setDeletePopup(false)}>
          <div className="profile-field">
            <span>Are you sure you want to delete your account?</span>
          </div>
        </Popup>
      )}
    </div>
    </>
  );
};

export default Setting;