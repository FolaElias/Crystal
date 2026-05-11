import { apiSlice } from '../../app/api';
import { ApiResponse, AuthTokens, LoginPayload, RegisterPayload, User } from '@crystal/shared';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<ApiResponse<AuthTokens>, RegisterPayload>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),
    login: builder.mutation<ApiResponse<AuthTokens>, LoginPayload>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    logout: builder.mutation<ApiResponse, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      invalidatesTags: ['User', 'Wallet'],
    }),
    refresh: builder.mutation<ApiResponse<AuthTokens>, void>({
      query: () => ({ url: '/auth/refresh', method: 'POST' }),
    }),
    getMe: builder.query<ApiResponse<User>, void>({
      query: () => '/users/me',
      providesTags: ['User'],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useRefreshMutation,
  useGetMeQuery,
} = authApi;
