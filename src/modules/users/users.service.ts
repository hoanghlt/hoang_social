import { HttpException } from "@core/exceptions";
import { isEmptyObject } from "@core/utils";
import { DataStoredInToken, TokenData } from "@modules/auth";
import RegisterDto from "./dtos/register.dto";
import UserSchema from "./users.model";
import gravatar from 'gravatar';
import bcryptjs from 'bcryptjs';
import IUser from "./users.interface";
import jwt from "jsonwebtoken";
import { IPagination } from "@core/interfaces";
class UserService {
    public userSchema = UserSchema;

    public async createUser(model: RegisterDto): Promise<TokenData> {
        if (isEmptyObject(model)) {
            throw new HttpException(400, 'Model is empty');
        }

        const user = await this.userSchema.findOne({ email: model.email }).exec();
        if (user) {
            throw new HttpException(409, `Your email ${model.email} already exist.`);
        }

        const avatar = gravatar.url(model.email!, {
            size: '200',
            rating: 'g',
            default: 'mm'
        });

        const salt = await bcryptjs.genSalt(10);

        const hashedPassword = await bcryptjs.hash(model.password!, salt);
        const createdUser: IUser = await this.userSchema.create({
            ...model,
            password: hashedPassword,
            avatar: avatar,
            date: Date.now()
        });
        return this.createToken(createdUser);
    }

    public async updateUser(userId: string, model: RegisterDto): Promise<IUser> {
        if (isEmptyObject(model)) {
            throw new HttpException(400, 'Model is empty');
        }

        const user = await this.userSchema.findById(userId).exec();
        if (!user) {
            throw new HttpException(400, `User id is not exist`);
        }
        let avatar = user.avatar;
        if (user.email === model.email) {
            throw new HttpException(400, 'You must using the difference email');
        }

        const checkEmailExist = await this.userSchema.find({
            $and: [{ email: { $eq: model.email } }, { _id: { $ne: userId } }]
        });

        if (checkEmailExist.length !== 0)
            throw new HttpException(400, 'Your email has been use another by user');

        avatar = gravatar.url(model.email!, {
            size: '200',
            rating: 'g',
            default: 'mm',
        });

        let updateUserById;
        if (model.password) {
            const salt = await bcryptjs.genSalt(10);
            const hashedPassword = await bcryptjs.hash(model.password, salt);
            updateUserById = await this.userSchema
                .findByIdAndUpdate(userId, {
                    ...model,
                    avatar: avatar,
                    password: hashedPassword,
                }, { new: true })
                .exec();
        } else {
            updateUserById = await this.userSchema
                .findByIdAndUpdate(userId, {
                    ...model,
                    avatar: avatar,
                }, { new: true })
                .exec();
        }

        if (!updateUserById) throw new HttpException(409, 'You are not an user');

        return updateUserById;
    }

    public async getUserById(userId: string): Promise<IUser> {
        const user = await this.userSchema.findById(userId);
        if (!user) {
            throw new HttpException(404, 'User is not exist');
        }
        return user;
    }


    public async getAll(): Promise<IUser[]> {
        const user = await this.userSchema.find();
        return user;
    }

    public async getAllPaging(
        keyword: string,
        page: number
    ): Promise<IPagination<IUser>> {
        const pageSize: number = Number(process.env.PAGE_SIZE || 10);

        let query = {};
        if (keyword) {
            query = {
                $or: [
                    { email: keyword },
                    { first_name: keyword },
                    { last_name: keyword },
                ],
            };
            //} else {
            //query = this.userSchema.find().sort({ date: -1 });
        }

        const users = await this.userSchema.find(query)
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .exec();

        const rowCount = await this.userSchema.find(query).countDocuments().exec();

        return {
            total: rowCount,
            page: page,
            pageSize: pageSize,
            items: users,
        } as IPagination<IUser>;
    }

    public async deleteUser(userId: string): Promise<IUser> {
        const deleteUser = await this.userSchema.findByIdAndDelete(userId).exec();
        if (!deleteUser)
            throw new HttpException(409, 'User is invalid');
        return deleteUser;
    }

    private createToken(user: IUser): TokenData {
        const dataInToken: DataStoredInToken = { id: user._id };
        const secret: string = process.env.JWT_TOKEN_SECRET!;
        const expiresIn: number = 60;
        return {
            token: jwt.sign(dataInToken, secret, { expiresIn: expiresIn }),
        }
    }
}

export default UserService;