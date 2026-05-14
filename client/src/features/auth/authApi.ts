import { apiSlice } from '../../app/api';
import { ApiResponse, AuthTokens, LoginPayload, RegisterPayload, User } from '@crystal/shared';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<ApiResponse<AuthTokens>, RegisterPayload>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),
    login: builder.mutation<ApiResponse<{ requiresOtp: boolean; sessionId: string; expiresIn: number; devOtp?: string }>, LoginPayload>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    verifyLoginOtp: builder.mutation<ApiResponse<AuthTokens>, { sessionId: string; otp: string }>({
      query: (body) => ({ url: '/auth/login/verify-otp', method: 'POST', body }),
    }),
    resendLoginOtp: builder.mutation<ApiResponse<{ expiresIn: number; devOtp?: string }>, { sessionId: string }>({
      query: (body) => ({ url: '/auth/login/resend-otp', method: 'POST', body }),
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
    checkUsername: builder.query<ApiResponse<{ available: boolean }>, string>({
      query: (username) => `/auth/check-username?username=${encodeURIComponent(username)}`,
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useVerifyLoginOtpMutation,
  useResendLoginOtpMutation,
  useLogoutMutation,
  useRefreshMutation,
  useGetMeQuery,
  useCheckUsernameQuery,
} = authApi;
