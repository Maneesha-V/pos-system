import type { AxiosResponse } from 'axios';
export const unwrap = <T>(p: Promise<AxiosResponse<T>>): Promise<T> => p.then((r) => r.data);