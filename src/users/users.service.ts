import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UpdateUserDto } from './dto/update-user.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserRegisteredEvent } from '../events/events/user-registered.event/user-registered.event';
import { PasswordGeneratorUtil } from '../shared/utils/password-generator.util';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // const password = crypto.randomBytes(8).toString('hex');
    const password = PasswordGeneratorUtil.generateStrongPassword();

    const createdUser = new this.userModel({ ...createUserDto, password });
    await createdUser.save();

    // TODO: Send password to user via email or secure channel
    this.eventEmitter.emit(
      'user.register',
      new UserRegisteredEvent(createdUser._id.toHexString(), createdUser.email),
    );

    return createdUser;
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select(['-password', '-isSuperuser']).exec();
  }

  async findOneByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findOneById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async updateLastLogin(id) {
    await this.userModel.findByIdAndUpdate(id, { lastLogin: new Date() });
  }

  async enableTwoFactor(userId: Types.ObjectId, secret: string) {
    await this.userModel.findByIdAndUpdate(userId, {
      isTwoFactorAuthenticationEnabled: true,
      twoFactorSecret: secret,
    });
  }

  async disableTwoFactor(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, {
      isTwoFactorAuthenticationEnabled: false,
      twoFactorSecret: null,
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const updated = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<User> {
    const deleted = await this.userModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return deleted;
  }
}
