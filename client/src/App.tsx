import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";

import UserList from "./containers/UserList/UserList";
import User from "./containers/User/User";
import Login from "./containers/Login/Login";

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  /*useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      navigate("login");
    } else if (location.pathname === "/") {
      navigate("users");
    }
  }, [location, navigate]);*/

  useEffect(() => {
    navigate("charts/linear");
  }, []);

  const handleLogin = () => {
    navigate("users");
  };

  return (
    <div className="App">
      <Routes>
        {/*<Route path="login" element={<Login onLogin={handleLogin} />} />
        <Route path="users" element={<UserList />} />
        <Route path="users/:userId" element={<User />} />*/}
      </Routes>
    </div>
  );
}

export default App;
