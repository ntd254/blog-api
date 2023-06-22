import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { Profile } from 'passport-google-oauth20';
import { RoleEntity } from '../user/entities/role.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { createTransport, Transporter } from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserRepository } from '../user/repositories/user.repository';
import * as path from 'path';
import * as fs from 'fs';
import * as handlebars from 'handlebars';

export interface IJwtPayload {
  id: number;
  roles: string[];
}

@Injectable()
export class AuthService {
  private mailTransporter: Transporter;
  private readonly mailTemplate: HandlebarsTemplateDelegate;

  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(UserEntity)
    private readonly usersRepository: UserRepository,
    @InjectRepository(RoleEntity)
    private readonly rolesRepository: Repository<RoleEntity>,
    private readonly configService: ConfigService,
  ) {
    this.mailTransporter = createTransport(
      {
        service: 'gmail',
        auth: {
          user: configService.get<string>('GMAIL_USER'),
          pass: configService.get<string>('GMAIL_PASSWORD'),
        },
      },
      { from: configService.get<string>('GMAIL_USER') },
    );
    const filePath = path.join(__dirname, '../../views/mail.hbs');
    const source = fs.readFileSync(filePath, 'utf-8').toString();
    this.mailTemplate = handlebars.compile(source);
  }

  async signIn(signInDto: SignInDto) {
    const user = await this.usersRepository.findUserWithRoleByUsername(
      signInDto.username,
    );
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (!(await compare(signInDto.password, user.password))) {
      throw new UnauthorizedException('Password is incorrect');
    }
    const accessToken = await this.getAccessTokenFromUserEntity(user);
    return { userId: user.id, accessToken: accessToken };
  }

  async validateLoginByGoogle(profile: Profile) {
    let user = await this.usersRepository.findUserWithRoleByEmail(
      profile._json.email,
    );
    if (user) {
      return user;
    }
    user = this.usersRepository.create({
      email: profile._json.email,
      fullName: profile._json.name,
      avatar: profile._json.picture,
    });
    user.roles = await this.rolesRepository.findBy({ code: 'USER' });
    return this.usersRepository.save(user);
  }

  async validateLoginByFacebook(profile) {
    let user = await this.usersRepository.findUserWithRoleByEmail(
      profile._json.email,
    );
    if (user) {
      return user;
    }
    user = this.usersRepository.create({
      email: profile._json.email,
      fullName: profile._json.name,
      avatar: profile._json.picture.data.url,
    });
    user.roles = await this.rolesRepository.findBy({ code: 'USER' });
    return this.usersRepository.save(user);
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const existedUser = await this.usersRepository.findUserWithRoleById(userId);
    const passwordMatch = await bcrypt.compare(
      changePasswordDto.currentPassword,
      existedUser.password,
    );
    if (!passwordMatch) {
      throw new UnauthorizedException('Current password is not correct');
    }
    existedUser.password = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await this.usersRepository.save(existedUser);
    return { statusCode: 200, message: 'Your password has been changed' };
  }

  async forgotPassword(forgotPassword: ForgotPasswordDto) {
    const existedUser = await this.usersRepository.findUserByEmail(
      forgotPassword.email,
    );
    if (!existedUser) {
      throw new BadRequestException('User not found');
    }
    const secret =
      this.configService.get<string>('JWT_SECRET') + existedUser.password;
    const token = await this.jwtService.signAsync(
      { userId: existedUser.id, email: existedUser.email },
      { secret, expiresIn: '10m' },
    );
    const linkResetPassword = `https://every-blog.onrender.com/reset-password/${existedUser.id}/${token}`;
    this.mailTransporter.sendMail({
      to: existedUser.email,
      subject: 'Reset password',
      html: this.mailTemplate({ link: linkResetPassword, user: existedUser }),
    });
    return {
      statusCode: 200,
      message: 'Link reset password has been sent to your email',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const existedUser = await this.usersRepository.findUserById(
      resetPasswordDto.userId,
    );
    if (!existedUser) {
      throw new UnauthorizedException('User not found');
    }
    const secret =
      this.configService.get<string>('JWT_SECRET') + existedUser.password;
    try {
      await this.jwtService.verifyAsync(resetPasswordDto.token, { secret });
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
    existedUser.password = await bcrypt.hash(resetPasswordDto.newPassword, 10);
    await this.usersRepository.save(existedUser);
    return { statusCode: 200, message: 'Your password has been reset' };
  }

  async getAccessTokenFromUserEntity(user: UserEntity) {
    const payload: IJwtPayload = {
      id: user.id,
      roles: user.roles.map((role) => role.code),
    };
    return await this.jwtService.signAsync(payload, { expiresIn: '60m' });
  }
}
