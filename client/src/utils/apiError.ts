import axios from 'axios';

export const errMsg = (e: unknown, fallback = 'Something went wrong') =>
  (axios.isAxiosError(e) && e.response?.data?.message) || (e instanceof Error ? e.message : fallback);