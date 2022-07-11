import React from "react";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";

import "./Error.css";

type TError = {
  title: string;
  text: string | string[];
};

function Error(props: TError) {
  return (
    <Alert severity="error">
      <AlertTitle>{props.title}</AlertTitle>
      {!Array.isArray(props.text)
        ? props.text
        : props.text.map((item) => <p>{item}</p>)}
    </Alert>
  );
}

export default Error;
