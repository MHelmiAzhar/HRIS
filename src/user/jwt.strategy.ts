import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { Model } from "mongoose";
import { User } from "src/schemas/user.schema";




@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<User>
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET
        })
    }

    async validate(payload) {
        const { id, role } = payload;

        const user = await this.userModel.findById(id);


        if (!user) {
            throw new UnauthorizedException('login first to access this endpoint.')
        }
        user.role = role;
        // if (user.role !== 'Admin') {
        //     throw new UnauthorizedException('Anda tidak memiliki akses')
        // }
        return user;
    }

}