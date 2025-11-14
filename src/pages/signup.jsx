import "../styles/atom.scss";
import "../styles/auth.scss";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../ui/atom/Input";
import PhotoUploader from "../ui/atom/PhotoUploader";
import Button from "../ui/atom/Button";
import Alert from "../ui/atom/Alert.jsx";
import CountryDropDown from "../ui/atom/CountryDropDown";
import DropdownInput from "../ui/atom/DropDown";
import TextArea from "../ui/atom/Textarea";
import { registerUser, isAuthenticated, getCurrentUser } from "../services/pocketbase";

const Signup = () => {
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("info");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    country: "",
    role: "",
    word: "",
    avatar: null,
    avatarPreview: null,
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      const user = getCurrentUser();
      const uname = user?.username || "";
      if (uname) navigate(`/${uname}`);
      else navigate('/');
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleSignupPhotoSelect = (file) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, avatar: file, avatarPreview: previewUrl }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.username || !formData.email || !formData.password || !formData.country || !formData.role) {
      setStatus("Please fill in all required fields");
      setStatusType("error");
      return;
    }
    setLoading(true);
    setStatus("Creating user account...");
    setStatusType("info");
    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("username", formData.username);
    submitData.append("email", formData.email);
    submitData.append("password", formData.password);
    submitData.append("passwordConfirm", formData.password);
    submitData.append("country", formData.country);
    submitData.append("role", formData.role);
    submitData.append("word", formData.word || "");
    if (formData.avatar) submitData.append("photo", formData.avatar);
    const result = await registerUser(submitData);
    if (result.success) {
      setStatus(result.message || "Registration successful!");
      setStatusType("success");
      navigate('/login');
    } else {
      setStatus(`Registration failed: ${result.error}`);
      setStatusType("error");
    }
    setLoading(false);
  };

  return (
    <div className="main_box">
      {status && (
        <Alert message={status} type={statusType} isVisible={true} onClose={() => setStatus("")} />
      )}
      <form onSubmit={handleFormSubmit} className="auth-form">
        <div className="profile-field">
          <PhotoUploader size={120} currentPhoto={formData.avatarPreview || ""} onFileSelect={handleSignupPhotoSelect} />
        </div>
        <Input label="Full Name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter your full name" iconL="user" />
        <Input label="Username" name="username" value={formData.username} onChange={handleInputChange} placeholder="Choose a username" iconL="username" />
        <Input label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Enter your email" iconL="mail" />
        <Input label="Password" name="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="Create a password" iconL="password" />
        <CountryDropDown label="Country" name="country" placeholder="Select Country" value={formData.country} onSelect={(opt) => setFormData(prev => ({ ...prev, country: opt && typeof opt === 'object' ? opt.label : '' }))} />
        <DropdownInput label="Role" iconR="drop_down" focusR="drop_up" placeholder="Select Role" value={formData.role} onSelect={(val) => setFormData(prev => ({ ...prev, role: val }))}>
          <span>Member</span>
          <span>Creator</span>
          <span>Manager</span>
          <span>Admin</span>
          <span>Guest</span>
        </DropdownInput>
        <TextArea title="Work" name="word" placeholder="Describe your work (max 240 chars)" maxLength={240} value={formData.word} onChange={handleInputChange} />
        <Button type="submit" disabled={loading} iconR="signup">{loading ? "Creating Account..." : "Signup"}</Button>
      </form>
    </div>
  );
};

export default Signup;