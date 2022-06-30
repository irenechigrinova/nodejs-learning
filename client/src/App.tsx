import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";

import UserList from "./containers/UserList/UserList";
import User from "./containers/User/User";

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === "/") {
      navigate("users");
    }
  }, [location, navigate]);

  return (
    <div className="App">
      <Routes>
        <Route path="users" element={<UserList />} />
        <Route path="users/:userId" element={<User />} />
      </Routes>
    </div>
  );
}

export default App;
