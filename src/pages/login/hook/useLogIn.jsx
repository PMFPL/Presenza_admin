import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { postRequest } from "../../../services/api/APIMethodCaller";

export const useLogIn = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await postRequest('/auth/login', {
        email: username,
        password: password
      });
      console.log(res);
      if (res?.ok || res?.status === 200) {
        localStorage.setItem('authToken', res.data.data.tokens.access.token);
        localStorage.setItem('isAdminLoggedIn', 'true');
        localStorage.setItem('Role',res.data.data.user?.role);
        localStorage.setItem('userName',res.data.data.user?.fullName);
        navigate('/dashboard');
      } else {
        alert(res.message || 'Login failed');
      }
    } catch (error) {
      console.error(error);
      alert('Something went wrong');
    }
  };

  return {
    username, setUsername, password, setPassword, handleLogin
  }
}
