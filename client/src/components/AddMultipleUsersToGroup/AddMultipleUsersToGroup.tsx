import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";

import { TUser } from "../../types/user.types";

type TAddGroup = {
  open: boolean;
  isAdd: boolean;
  groups: { name: string; id: number }[];
  users: TUser[];

  onClose: () => void;
  onApply: (groupId: number, users: number[]) => void;
};

function AddGroup(props: TAddGroup) {
  const [group, setGroup] = useState<number | null>(null);
  const [users, setUsers] = useState<number[]>([]);
  const [hasError, setHasError] = useState<boolean>(false);

  const handleGroupChange = (e: SelectChangeEvent) => {
    setGroup(+e.target.value);
  };

  const handleUsersChange = (e: SelectChangeEvent<typeof users>) => {
    setUsers(e.target.value as number[]);
  };

  const handleApply = () => {
    if (!group || !users.length) {
      setHasError(true);
      return;
    }
    props.onApply(group, users);
  };

  return (
    <div>
      <Dialog
        open={props.open}
        onClose={props.onClose}
        sx={{
          "& .MuiDialog-container": {
            "& .MuiPaper-root": {
              width: "100%",
              maxWidth: "500px",
            },
          },
        }}
      >
        <DialogTitle>
          {props.isAdd ? "Add users to group" : "Remove users from group"}
        </DialogTitle>
        <DialogContent>
          <InputLabel id="user-groups-label">Users</InputLabel>
          <Select
            labelId="users"
            label="Groups"
            id="users"
            multiple
            value={users}
            className="add-user-groups"
            error={hasError && !users.length}
            onChange={handleUsersChange}
            input={<OutlinedInput label="Users" fullWidth />}
          >
            {props.users.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                {user.login}
              </MenuItem>
            ))}
          </Select>
          <InputLabel id="user-groups-label">Group</InputLabel>
          <Select
            labelId="user-group"
            label="Groups"
            id="user-group"
            value={group?.toString() || ""}
            className="add-user-groups"
            error={hasError && !group}
            onChange={handleGroupChange}
            input={<OutlinedInput label="Users" fullWidth />}
          >
            {props.groups.map((option) => (
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

export default AddGroup;
