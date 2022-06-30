import React from "react";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";

import "./Error.css";

type TError = {
  title: string;
  text: string;
};

function Error(props: TError) {
  return (
    <Alert severity="error">
      <AlertTitle>{props.title}</AlertTitle>
      {props.text}
    </Alert>
  );
}

export default Error;
