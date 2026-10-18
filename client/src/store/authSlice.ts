import {
  createSlice,
  createAsyncThunk,
  type Dispatch,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { authApi } from "../api/authApi";
import { loadUser, saveSession, clearSession } from "../utils/session";
import { errMsg } from "../utils/apiError";
import type { User } from "../types/userTypes";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: loadUser(),
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk<
  User,
  { username: string; password: string },
  { rejectValue: string }
>("auth/login", async (creds, { rejectWithValue }) => {
  try {
    const { token, user } = await authApi.login(creds);
    saveSession(token, user);
    return user;
  } catch (e) {
    return rejectWithValue(errMsg(e, "Login failed"));
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearUser: (s) => {
      s.user = null;
      s.error = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(loginUser.pending, (s) => {
      s.loading = true;
      s.error = null;
    })
      .addCase(loginUser.fulfilled, (s, a: PayloadAction<User>) => {
        s.loading = false;
        s.user = a.payload;
      })
      .addCase(loginUser.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload ?? "Login failed";
      });
  },
});

export const logout = () => (dispatch: Dispatch) => {
  clearSession();
  dispatch(authSlice.actions.clearUser());
};

export default authSlice.reducer;
