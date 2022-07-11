import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";

import {
  useGetUsersQuery,
  useDeleteUserMutation,
  useAddUserMutation,
  useUpdateUserMutation,
  useAddUsersToGroupMutation,
  useRemoveUsersFromGroupMutation,
} from "../../api/user-api";

import Loading from "../../components/Loading/Loading";
import Table from "../../components/Table/Table";
import Error from "../../components/Error/Error";
import Badge from "../../components/Badge/Badge";
import Confirmation from "../../components/Confirmation/Confirmation";
import AddUser from "../../components/AddUser/AddUser";
import AddGroup from "../../components/AddGroup/AddGroup";
import AddMultipleUsersToGroup from "../../components/AddMultipleUsersToGroup/AddMultipleUsersToGroup";

import "./UserList.css";

import { TUser } from "../../types/user.types";

const TABLE_HEADER = ["ID", "Login", "Age", "Groups"];
const TABLE_KEYS = ["id", "login", "age", "groups"];

function UserList() {
  const { data, error, isLoading } = useGetUsersQuery({});
  const [deleteUser, { isLoading: isDeletingUser, error: isDeletingError }] =
    useDeleteUserMutation();
  const [addUser, { isLoading: isAddingUser, error: isAddingError }] =
    useAddUserMutation();
  const [updateUser, { isLoading: isUpdatingUser, error: isUpdatingError }] =
    useUpdateUserMutation();
  const [
    addUsersToGroup,
    { isLoading: isAddingToGroup, error: isAddingToGroupError },
  ] = useAddUsersToGroupMutation();
  const [
    removeUsersFromGroup,
    { isLoading: isRemovingFromGroup, error: isRemovingFromGroupError },
  ] = useRemoveUsersFromGroupMutation();

  const [currentData, setCurrentData] = useState<Record<string, any> | null>(
    null
  );
  const [page, setPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [deleteUserData, setDeleteUserData] = useState<{
    showConfirmation: boolean;
    id: number;
  }>({ showConfirmation: false, id: 0 });
  const [isAddUser, setIsAddUser] = useState<boolean>(false);
  const [addGroups, setAddGroups] = useState<{
    showDialog: boolean;
    userId: number;
    options: { name: string; id: number }[];
  }>({ showDialog: false, userId: 0, options: [] });
  const [multiple, setMultiple] = useState<{
    isAdd: boolean;
    showDialog: boolean;
  }>({ isAdd: false, showDialog: false });

  useEffect(() => {
    if (!currentData && data) {
      setCurrentData(data);
    }
  }, [data, currentData]);

  const handlePageChange = () => {};
  const handleRowPerPageChange = () => {};

  const handleUpdateUser = (
    id: number,
    data: Partial<TUser> & { groupsIds: number[] }
  ) => {
    updateUser({ id, ...data }).then((response: any) => {
      if (!response.error) {
        setCurrentData((prevState) => ({
          ...prevState,
          users: prevState!.users.map((user: TUser) =>
            user.id === id ? response.data.data : user
          ),
        }));
      }
    });
  };

  const handleDeleteGroup = (id: number, userId: number) => {
    const user = currentData!.users.find((item: TUser) => item.id === userId)!;
    const groupsIds = user.groups.reduce((result: number[], group: number) => {
      if (group !== id) {
        result.push(group);
      }
      return result;
    }, []);
    handleUpdateUser(userId, { groupsIds });
  };

  const handleAddGroup = (userId: number) => {
    // @ts-ignore
    const user = currentData!.users.find(({ id }) => id === userId)!;
    const options = currentData!.meta.groups.filter(
      (group: any) => !user.groups.includes(group.id)
    );
    setAddGroups({ showDialog: true, userId, options });
  };

  const handleRenderGroup = (row: TUser) => (
    <div className="user-groups">
      {row.groups.map((group) => {
        const { name } = data.meta.groups.find(
          (item: { id: number }) => item.id === group
        )!;
        return (
          <Badge
            value={name}
            parentId={row.id}
            id={group}
            onDelete={handleDeleteGroup}
            key={group}
          />
        );
      })}
      <div className="user-add-group">
        <IconButton
          aria-label="add-group"
          size="small"
          onClick={() => handleAddGroup(row.id)}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </div>
    </div>
  );

  const handleDeleteUser = (id: number) => {
    setDeleteUserData({ showConfirmation: true, id });
  };

  const handleApplyDeleteUser = () => {
    deleteUser(deleteUserData.id).then((response: any) => {
      if (response.data.success) {
        setCurrentData((prevState) => ({
          ...prevState,
          users: prevState!.users.filter(
            (user: TUser) => user.id !== deleteUserData.id
          ),
        }));
      }
      setDeleteUserData({ showConfirmation: false, id: 0 });
    });
  };

  const handleAddUser = (data: any) => {
    setIsAddUser(false);
    addUser(data).then((response: any) => {
      if (!response.error) {
        setCurrentData((prevState) => ({
          ...prevState,
          users: [...prevState!.users, response.data.data],
        }));
      }
    });
  };

  const handleAddGroupClose = () => {
    setAddGroups({ showDialog: false, userId: 0, options: [] });
  };

  const handleAddGroupApply = (groups: number[]) => {
    const userGroups = currentData!.users.find(
      (user: TUser) => user.id === addGroups.userId
    )!.groups;
    handleUpdateUser(addGroups.userId, {
      groupsIds: [...userGroups, ...groups],
    });
    handleAddGroupClose();
  };

  const handleApplyMultiple = (groupId: number, usersIds: number[]) => {
    const method = multiple.isAdd ? addUsersToGroup : removeUsersFromGroup;
    method({ groupId, usersIds }).then((response: any) => {
      if (!response.error) {
        setCurrentData((prevState) => ({
          ...prevState,
          users: prevState!.users.map((user: TUser) => {
            const updatedUser = response.data.data.find(
              (item: TUser) => item.id === user.id
            );
            return updatedUser || user;
          }),
        }));
      }
    });
    handleCloseMultiple();
  };

  const handleCloseMultiple = () => {
    setMultiple({ isAdd: false, showDialog: false });
  };

  const renderTable = () => (
    <>
      <h2>Users List</h2>
      <Table
        page={page}
        rowsPerPage={rowsPerPage}
        rows={currentData!.users}
        total={currentData!.total}
        header={TABLE_HEADER}
        keys={TABLE_KEYS}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowPerPageChange}
        onRenderArray={handleRenderGroup}
        onDelete={handleDeleteUser}
      />
      <div className="user-actions">
        <Button
          variant="outlined"
          className="user-add"
          onClick={() => setIsAddUser(true)}
        >
          Add User
        </Button>
        <Button
          variant="outlined"
          className="user-add"
          onClick={() => setMultiple({ showDialog: true, isAdd: true })}
        >
          Add Multiple Users to Group
        </Button>
        <Button
          variant="outlined"
          className="user-add"
          onClick={() => setMultiple({ showDialog: true, isAdd: false })}
        >
          Remove Multiple Users from Group
        </Button>
      </div>
    </>
  );

  if (!isLoading && !!error) {
    return (
      <Error
        title={(error as any).data.error}
        text={(error as any).data.message}
      />
    );
  }

  return (
    <div className="user-list">
      {isLoading || !currentData ? <Loading /> : renderTable()}
      <Confirmation
        open={deleteUserData.showConfirmation}
        title="You are going to delete User"
        text="You won't be able to restore the User"
        onClose={() => setDeleteUserData({ showConfirmation: false, id: 0 })}
        onApply={handleApplyDeleteUser}
      />
      <AddUser
        open={isAddUser}
        options={currentData?.meta.groups || []}
        onClose={() => setIsAddUser(false)}
        onApply={handleAddUser}
      />
      <AddGroup
        open={addGroups.showDialog}
        options={addGroups.options}
        onClose={handleAddGroupClose}
        onApply={handleAddGroupApply}
      />
      <AddMultipleUsersToGroup
        open={multiple.showDialog}
        isAdd={multiple.isAdd}
        groups={currentData?.meta.groups || []}
        users={currentData?.users || []}
        onClose={handleCloseMultiple}
        onApply={handleApplyMultiple}
      />
      {(isDeletingError || isAddingError) && (
        <Error
          title={
            ((isDeletingError || isAddingError || isUpdatingError) as any).data
              .error
          }
          text={
            ((isDeletingError || isAddingError || isUpdatingError) as any).data
              .message
          }
        />
      )}
    </div>
  );
}

export default UserList;
