import { apiSlice } from '../../app/api';
import { ApiResponse, Wallet, DepositAddress, PaginatedResponse, Transaction, AssetSymbol } from '@crystal/shared';

export const walletApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWallet: builder.query<ApiResponse<Wallet>, void>({
      query: () => '/wallet',
      providesTags: ['Wallet'],
    }),
    getDepositAddress: builder.query<ApiResponse<DepositAddress>, AssetSymbol>({
      query: (symbol) => `/wallet/deposit/${symbol}`,
    }),
    getTransactions: builder.query<ApiResponse<PaginatedResponse<Transaction>>, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 20 } = {}) => `/wallet/transactions?page=${page}&limit=${limit}`,
      providesTags: ['Transactions'],
    }),
  }),
});

export const { useGetWalletQuery, useGetDepositAddressQuery, useGetTransactionsQuery } = walletApi;
