import React from "react";

import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

import "./Badge.css";

type TBadge = {
  id: number;
  parentId: number;
  value: string;
  onDelete: (id: number, parentId: number) => void;
};

function Badge(props: TBadge) {
  return (
    <div className="badge">
      {props.value}{" "}
      <IconButton
        aria-label="delete"
        size="small"
        onClick={() => props.onDelete(props.id, props.parentId)}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </div>
  );
}

export default Badge;
