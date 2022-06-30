import React, { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";

import "./AddUser.css";

type TAddUser = {
  open: boolean;
  options: { name: string; id: string }[];

  onClose: () => void;
  onApply: (data: any) => void;
};

function AddUser(props: TAddUser) {
  const [login, setLogin] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [age, setAge] = useState<number>(0);
  const [groups, setGroups] = useState<number[]>([]);
  const [hasError, setHasError] = useState<boolean>(false);

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogin(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAge(+e.target.value);
  };

  const handleGroupChange = (e: SelectChangeEvent<typeof groups>) => {
    setGroups(e.target.value as number[]);
  };

  const handleApply = () => {
    if (!age || !login.length || !password.length || !groups.length) {
      setHasError(true);
      return;
    }
    props.onApply({ login, age, password, groupsIds: groups });
  };

  return (
    <div>
      <Dialog open={props.open} onClose={props.onClose}>
        <DialogTitle>Add User</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            id="login"
            label="Login"
            type="text"
            fullWidth
            variant="standard"
            value={login}
            error={hasError && !login.length}
            onChange={handleLoginChange}
          />
          <TextField
            margin="dense"
            id="password"
            label="Password"
            type="password"
            fullWidth
            variant="standard"
            value={password}
            error={hasError && !password.length}
            onChange={handlePasswordChange}
          />
          <TextField
            margin="dense"
            id="age"
            label="Age"
            type="number"
            fullWidth
            variant="standard"
            value={age || ""}
            error={hasError && !age}
            onChange={handleAgeChange}
          />
          <InputLabel id="user-groups-label">Groups</InputLabel>
          <Select
            labelId="user-groups"
            label="Groups"
            id="user-groups"
            multiple
            value={groups}
            className="add-user-groups"
            error={hasError && !groups.length}
            onChange={handleGroupChange}
            input={<OutlinedInput label="Groups" fullWidth />}
          >
            {props.options.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.name}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onClose}>Cancel</Button>
          <Button onClick={handleApply}>Apply</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default AddUser;
