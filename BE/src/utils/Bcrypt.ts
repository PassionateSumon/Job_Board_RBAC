import bcrypt from "bcryptjs";

export class Bcrypt {
  static hashPassword(password: string, salt: number = 10) {
    return bcrypt.hash(password, salt);
  }
  static comparePassword(givenPassword: string, existingPassword: string) {
    return bcrypt.compare(givenPassword, existingPassword);
  }
}
