import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { TUser } from "../types/user.types";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_SERVER_HOST}`,
  }),
  tagTypes: ["Users"],
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => "/users/",
    }),
    getUserById: builder.query<TUser, string>({
      query: (id) => `/users/${id}`,
    }),
    deleteUser: builder.mutation<{ success: boolean }, number>({
      query(id) {
        return {
          url: `/users/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: [{ type: "Users", id: "LIST" }],
    }),
    addUser: builder.mutation<TUser, Partial<TUser>>({
      query(body) {
        return {
          url: "/users/",
          method: "POST",
          body,
        };
      },
      invalidatesTags: [{ type: "Users", id: "LIST" }],
    }),
    updateUser: builder.mutation<
      void,
      Pick<TUser, "id"> & Partial<TUser> & { groupsIds: number[] }
    >({
      query: ({ id, ...patch }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Users", id: "LIST" },
      ],
    }),
    addUsersToGroup: builder.mutation<
      void,
      { usersIds: number[]; groupId: number }
    >({
      query: (body) => ({
        url: "/users/add-to-group",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error) => [{ type: "Users", id: "LIST" }],
    }),
    removeUsersFromGroup: builder.mutation<
      void,
      { usersIds: number[]; groupId: number }
    >({
      query: (body) => ({
        url: "/users/remove-from-group",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error) => [{ type: "Users", id: "LIST" }],
    }),
  }),
});

export const {
  useGetUserByIdQuery,
  useGetUsersQuery,
  useDeleteUserMutation,
  useAddUserMutation,
  useUpdateUserMutation,
  useAddUsersToGroupMutation,
  useRemoveUsersFromGroupMutation,
} = userApi;
