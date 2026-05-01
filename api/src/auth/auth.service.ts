import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../schemas/user.schema';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userModel.findOne({ email: dto.email });
    if (existing) throw new ConflictException('User already exists');

    // Hash the authKey provided by the client
    const saltRounds = 10;
    const authKeyHash = await bcrypt.hash(dto.authKey, saltRounds);

    const newUser = new this.userModel({
      email: dto.email,
      authKeyHash,
      salt: Buffer.from(dto.salt, 'base64'),
      publicKey: Buffer.from(dto.publicKey, 'base64'),
      encPrivateKey: Buffer.from(dto.encPrivateKey, 'base64'),
    });

    await newUser.save();
    return this.generateToken(newUser);
  }

  async login(dto: LoginDto) {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(dto.authKey, user.authKeyHash);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    return this.generateToken(user);
  }

  async getSalt(email: string) {
    const user = await this.userModel.findOne({ email }).select('salt');
    if (!user) throw new UnauthorizedException('User not found');
    return { salt: user.salt.toString('base64') };
  }

  private generateToken(user: User) {
    const payload = { sub: user._id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        publicKey: user.publicKey.toString('base64'),
        encPrivateKey: user.encPrivateKey.toString('base64'),
      }
    };
  }
}
