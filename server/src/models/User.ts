import { Schema, model, Model, HydratedDocument } from 'mongoose';
import bcrypt from 'bcryptjs';

export type Role = 'admin' | 'staff';

export interface IUser {
  name: string;
  username: string;
  password: string;
  role: Role;
  active: boolean;
}
interface IUserMethods {
  matchPassword(plain: string): Promise<boolean>;
}
type UserModel = Model<IUser, {}, IUserMethods>;
export type UserDoc = HydratedDocument<IUser, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'staff'], default: 'staff' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = function (plain: string) {
  return bcrypt.compare(plain, this.password);
};

export default model<IUser, UserModel>('User', userSchema);