import { MyContext } from "../types";
import { Arg, Ctx, Field, InputType, Int, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { Post } from "../entities/Post";
import { isAuth } from "../middleware/isAuth";
import { getConnection } from 'typeorm'

@InputType()
class PostInput {
  @Field()
  title: string
  @Field()
  text: string
}

@Resolver()
export class PostResolver {
    @Query(() => [Post])
    posts(
        @Arg('limit', () => Int) limit : number,
        @Arg('cursor', () => String, { nullable: true }) cursor: string | null
    ): Promise<Post[]>{
      const realLimit = Math.min(50, limit);
      const qb = getConnection().getRepository(Post).createQueryBuilder("p").orderBy('id','DESC').take(realLimit)
      if(cursor){
        qb.where('"createdAt" > :cursor', { cursor: parseInt(cursor)})
      }
  
      return qb.getMany()
    }

    @Query(() => Post, {nullable: true})
    async post(
        @Arg('id') id: number,
        @Ctx() {}: MyContext
    ): Promise<Post | undefined>{
      const post =  await Post.findOne(id);
      return post 
    }
    @Mutation(() => Post)
    @UseMiddleware(isAuth)
    async createPost(
      @Arg("input") input: PostInput,
      @Ctx() { req }: MyContext
    ): Promise<Post>{
     return Post.create({
       ...input,
       creatorId: req.session.userId
      }).save()
    }
    @Mutation(() => Post)
    async updatePost(
      @Arg("title", () => String, { nullable: true }) title: string,
      @Arg('id') id: number,
      @Ctx() { }:MyContext
    ): Promise<Post | null>{
     const post = await Post.findOne(id)
     if(!post){
         return null
     }
     if( typeof title !== 'undefined'){
        Post.update({id}, {title})
     }
     
     return post;
    }
}