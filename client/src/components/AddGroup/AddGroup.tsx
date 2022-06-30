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

type TAddGroup = {
  open: boolean;
  options: { name: string; id: number }[];

  onClose: () => void;
  onApply: (data: any) => void;
};

function AddGroup(props: TAddGroup) {
  const [groups, setGroups] = useState<number[]>([]);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    if (!props.options.length) {
      setGroups([]);
    }
  }, [props.options]);

  const handleGroupChange = (e: SelectChangeEvent<typeof groups>) => {
    setGroups(e.target.value as number[]);
  };

  const handleApply = () => {
    if (!groups.length) {
      setHasError(true);
      return;
    }
    props.onApply(groups);
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
        <DialogTitle>Add Groups to the User</DialogTitle>
        <DialogContent>
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

export default AddGroup;
