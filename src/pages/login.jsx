import "../styles/atom.scss";
import "../styles/auth.scss";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../ui/atom/Input";
import Button from "../ui/atom/Button";
import Alert from "../ui/atom/Alert.jsx";
import { loginUser, isAuthenticated, getCurrentUser } from "../services/pocketbase";
import Header from "../ui/compo/Header.jsx";

const Login = () => {
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("info");
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({ identifier: "", password: "" });
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      const user = getCurrentUser();
      const uname = user?.username || "";
      if (uname) navigate(`/${uname}`);
      else navigate('/');
    }
  }, [navigate]);

  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginData.identifier || !loginData.password) {
      setStatus("Please enter both email/username and password");
      setStatusType("error");
      return;
    }
    setLoading(true);
    setStatus("Logging in...");
    setStatusType("info");
    const result = await loginUser(loginData.identifier, loginData.password);
    if (result.success) {
      setStatus("Login successful!");
      setStatusType("success");
      const uname = result.data?.username || loginData.identifier;
      navigate(`/${uname}`);
    } else {
      setStatus(`Login failed: ${result.error}`);
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
        <Button type="submit" disabled={loading} iconR="login">
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>
    </div>
    </>
  );
};

export default Login;