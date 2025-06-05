import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { Claim } from '../../common/enums/claim.enum';
import { Transform } from 'class-transformer';
import { PasswordHasher } from '../../shared/utils/password-hasher.util';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({
    required: true,
    unique: true,
    index: true,
    trim: true,
    lowercase: true,
  })
  email: string;

  @Transform(({ value }) => undefined)
  @Prop({
    required: true,
    validate: {
      validator: (value: string) =>
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value),
      message: 'Password too weak',
    },
  })
  password: string;

  @Prop({
    default: '',
    trim: true,
  })
  firstName: string;

  @Prop({
    default: '',
    trim: true,
  })
  lastName: string;

  @Prop({
    default: true,
    index: true,
  })
  isActive: boolean;

  @Prop({
    default: false,
  })
  isStaff: boolean;

  @Prop({
    default: false,
  })
  isSuperuser: boolean;

  @Prop({
    default: [],
    enum: Claim,
    type: [String],
    index: true,
  })
  claims: Claim[];

  @Prop({
    default: null,
  })
  lastLogin: Date;

  @Prop({
    default: '',
  })
  bio: string;

  @Prop({
    default: false,
  })
  isTwoFactorAuthenticationEnabled: boolean;

  @Prop({
    default: null,
  })
  twoFactorSecret: string;

  @Prop({
    default: false,
  })
  isEmailVerified: boolean;

  @Prop({
    default: null,
  })
  emailVerificationToken: string;

  @Prop({
    default: false,
  })
  isDeleted: boolean;

  @Prop({ virtual: true })
  fullName: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Enable optimistic concurrency control (OCC)
UserSchema.set('optimisticConcurrency', true);

// Set JSON transformation
UserSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});

UserSchema.set('toObject', { virtuals: true });

// Hash password before saving
UserSchema.pre<UserDocument>('save', async function (next) {
  if (this.isModified('password') && this.password) {
    try {
      const rawSalt = process.env.BCRYPT_SALT_ROUNDS ?? '10';
      const saltRounds = parseInt(rawSalt, 10);

      if (isNaN(saltRounds) || saltRounds < 1 || saltRounds > 31) {
        throw new Error(
          'BCRYPT_SALT_ROUNDS must be an integer between 1 and 31',
        );
      }

      this.password = await PasswordHasher.hashPassword(this.password);
    } catch (error) {
      return next(error);
    }
  }

  next();
});

// Virtual property for full name
UserSchema.virtual('full Name').get(function () {
  return `${this.firstName} ${this.lastName}`.trim();
});
