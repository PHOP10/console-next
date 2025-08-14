export type TUserDto = {
  id: number;
  userId: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  email: string;
  createAt: Date | string;
  updateAt: Date | string;
};

export type UserProfileType = {
  userId: string;
  username: string;
  fullName: string;
  email: string;
  groupRoles?: string[];
  accessToken: string;
  refreshToken: string;
};
