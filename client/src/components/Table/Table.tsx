import React from "react";
import MuiTable from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";

import TablePagination from "../TablePagination/TablePagination";

import "./Table.css";

type TTable = {
  page: number;
  rowsPerPage: number;
  rows: Record<string, any>[];
  total: number;
  header: string[];
  keys: string[];

  onPageChange: (value: number) => void;
  onRowsPerPageChange: (value: number) => void;
  onDelete: (value: number) => void;
  onRenderArray?: (item: any) => JSX.Element;
};

function Table({
  page,
  rowsPerPage,
  rows,
  total,
  header,
  keys,
  onPageChange,
  onRowsPerPageChange,
  onDelete,
  onRenderArray,
}: TTable) {
  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    onPageChange(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onRowsPerPageChange(parseInt(event.target.value, 10));
    onPageChange(0);
  };

  return (
    <TableContainer component={Paper}>
      <MuiTable sx={{ minWidth: 500 }}>
        <TableBody>
          <TableRow key="header" className="table-header">
            {header.map((item) => (
              <TableCell component="th" scope="row" key={item}>
                {item}
              </TableCell>
            ))}
            <TableCell component="th" scope="row" />
          </TableRow>
          {rows.map((row) => (
            <TableRow key={row.id}>
              {keys.map((key) => (
                <TableCell
                  component="td"
                  scope="row"
                  key={`${key}-${row.id}-${row[key]}`}
                >
                  {Array.isArray(row[key]) && onRenderArray
                    ? onRenderArray(row)
                    : row[key]}
                </TableCell>
              ))}
              <TableCell component="td" scope="row" key={`${row.id}-delete`}>
                <IconButton
                  aria-label="delete"
                  onClick={() => onDelete(row.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </MuiTable>
      <TablePagination
        count={total}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
      />
    </TableContainer>
  );
}

export default Table;
