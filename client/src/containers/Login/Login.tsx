import React, { useEffect, useState } from "react";

import { TextField, Button, Alert } from "@mui/material";

import { useLoginMutation } from "../../api/user-api";

import "./Login.css";

const Login = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [passwordError, setPasswordError] = useState<boolean>(false);
  const [serverError, setServerError] = useState<any>(null);

  const [login, { isLoading, error }] = useLoginMutation();

  useEffect(() => {
    setServerError(error);
  }, [error]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailError(false);
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordError(false);
    setPassword(e.target.value);
  };

  const handleButtonClick = async () => {
    if (!email) {
      setEmailError(true);
      return;
    }
    if (!password) {
      setPasswordError(true);
      return;
    }

    login({ login: email, password }).then((response: any) => {
      if (!response.error) {
        localStorage.setItem("accessToken", response.data.accessToken);
        onLogin();
      }
    });
  };

  return (
    <div className="Login">
      <div className="Login__form">
        <h1 className="Login__title">Login</h1>
        <TextField
          required
          error={emailError}
          label="Email"
          color="secondary"
          value={email}
          className="Login__input"
          onChange={handleEmailChange}
        />
        <TextField
          required
          error={passwordError}
          label="Password"
          type="password"
          color="secondary"
          value={password}
          className="Login__input"
          onChange={handlePasswordChange}
        />
        <Button
          variant="contained"
          disabled={isLoading}
          onClick={handleButtonClick}
        >
          Log in
        </Button>
      </div>
      {serverError && (
        <Alert severity="error" onClose={() => setServerError(null)}>
          {serverError.data.error}
        </Alert>
      )}
    </div>
  );
};

export default Login;
