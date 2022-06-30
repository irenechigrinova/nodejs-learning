import * as React from "react";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";

import "./Loading.style.css";

function Loading() {
  return (
    <div className="loading">
      <Stack>
        <CircularProgress color="secondary" size="10rem" />
      </Stack>
    </div>
  );
}

export default Loading;
