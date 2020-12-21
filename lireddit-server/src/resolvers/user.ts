import { User } from "../entities/User";
import { MyContext } from "../types";
import { Arg, Ctx, Field, FieldResolver, Mutation, ObjectType, Query, Resolver, Root } from "type-graphql";
import bcrypt from 'bcryptjs'
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { sendEmail } from "../utiles/sendEmail";
import { v4 } from 'uuid'
// @InputType()
// class UsernamePasswordInput {
//     @Field()
//     username: string
//     @Field()
//     email: string
//     @Field()
//     password: string
// }
@ObjectType()
class FieldError {
    @Field()
    field: string

    @Field()
    message?: string
}
@ObjectType()
class Userresponse {
    @Field(() => [FieldError],{nullable: true})
    errors?: FieldError[]

    @Field(() => User,{nullable: true})
    user?: User
}

@Resolver(User)
export class UserResolver {
    @FieldResolver(() => String)
    email(@Root() user: User, @Ctx() {req}: MyContext){
      if(req.session.userId === user.id){
         return user.email;
      }
      return null
    }
    @Mutation(() => Userresponse)
    async changePassword(
        @Arg('token') token: string,
        @Arg('newPassword') newPassword: string,
        @Ctx() { redis, req }: MyContext
    ): Promise<Userresponse>{
        if(newPassword.length <= 3){
            return {
                errors: [
                    {
                        field: "Password",
                        message: "length must be more than 3"
                    }
                ]
                
            }
        }
        const userId = await redis.get(FORGET_PASSWORD_PREFIX + token)
        if(!userId){
            return{
                errors: [
                    {
                        field: 'token',
                        message: 'token expired'
                    }
                ]
            }
        }
        const userIdNum = parseInt(userId);
        const user = await User.findOne(parseInt(userId));

        if(!user){
            return{
                errors: [
                    {
                        field: "token",
                        message: "user no longer exists"
                    }
                ]
            }
        }
        await User.update({ id: userIdNum}, { password: await bcrypt.hash(newPassword, 12)})

        await redis.del(userId)
        req.session.userId = user.id;
        
        return { user }
    }
    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg('email') email: string,
        @Ctx() { redis }: MyContext
    ){
        const user = await User.findOne({ where: { email }})
        if(!user){
            return false;
        }
        const token = v4();
        await redis.set(FORGET_PASSWORD_PREFIX + token, user.id, 'ex', 1000 * 60 * 60 * 24 * 3)
        sendEmail(email, `<a href="http://localhost:3000/change-password/${token}">http://localhost:3000/change-password/${token}</a>`);
        return true
    }
    @Query(() => [User])
    users(
        @Ctx() {}: MyContext
    ): Promise<User[]>{
      return User.find();   
    }
    @Query(() => User, { nullable: true})
    async me( @Ctx() { req,  } : MyContext){
       if(!req.session.userId){
           return null
       }
       const user = await User.findOne(req.session.userId);
       return user;
    }
    @Mutation(() => Userresponse)
    async register(
        @Arg("username") username: string,
        @Arg("email") email: string,
        @Arg("password") password: string
    ){
        if(username.length <= 3){
            return {
                errors: [
                    {
                        field: "username",
                        message: "length must be more than 3"
                    }
                ]
                
            }
        }
        if(email.length <= 3){
            return {
                errors: [
                    {
                        field: "username",
                        message: "length must be more than 3"
                    }
                ]
                
            }
        }
        if(password.length <= 3){
            return {
                errors: [
                    {
                        field: "Password",
                        message: "length must be more than 3"
                    }
                ]
                
            }
        }
        let user;
        try{
        const hashedPassword = await bcrypt.hash(password, 12)
            user = User.create({ 
            username:username,
            email:email,
            password: hashedPassword
        }).save()
        }   
        catch(err){
           if(err.detail.includes('already exists.')){
            return{
               errors: [
                   {
                       field: 'username',
                       message: 'username already exists'
                   }
               ]
           }
        }
        }
        return { user }
    }
    @Mutation(() => Userresponse)
    async login(
        @Arg("email") email: string,
        @Arg("password") password: string,
        @Ctx() { req }:MyContext
    ){
        const user = await User.findOne({ where: { email } })
        if(!user){
        return {
         errors: [
            {
              field: "username",
              message: "that username doesnot exist"
            },
        ]
        }
        }
        const valid = await bcrypt.compare(password,user.password)
        if(!valid){
            return {
                errors: [
                    {
                        field: "password",
                        message: "incorrect password"
                    }
                ]
            }
        }
        req.session.userId = user.id;
        return{
            user
        }
    }
    @Mutation(() => Boolean)
    logout(
        @Ctx() { req, res }: MyContext
    ){
       return new Promise(response => req.session.destroy((err: any) => {
               res.clearCookie(COOKIE_NAME);
                if (err) {
                    console.log(err)
                    response(false);
                    return;
                }
                response(true)
            }))
    }
}