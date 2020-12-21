import { MyContext } from "../types";
import { Arg, Ctx, Field, InputType, Int, Mutation, ObjectType, Query, Resolver, UseMiddleware } from "type-graphql";
import { Post } from "../entities/Post";
import { isAuth } from "../middleware/isAuth";
import { getConnection } from 'typeorm'
import { Updoot } from "../entities/Updoot";

@InputType()
class PostInput {
  @Field()
  title: string
  @Field()
  text: string
}
@ObjectType()
class PaginationPosts{
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
}

@Resolver()
export class PostResolver {
   @Mutation(() => Boolean)
   async vote(
     @Arg('postId',() => Int) postId: number,
     @Arg('value',() => Int) value: number,
     @Ctx() { req }: MyContext
   ) {
    const isUpdoot = value !== -1;
    const { userId } = req.session
    const realValue= isUpdoot ? 1 : -1
    const updoot = await Updoot.findOne({ where: { postId, userId}})
    if(updoot && updoot.value !== realValue){
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
          update updoot
          set value = $1
          where "postId" = $2 and "userId" = $3
          `,[realValue, postId, userId]
        );
        await tm.query(`
         update post
         set points = points + $1
         where id = $2
       `,[ 2 * realValue, postId])
      })
    }else if(!updoot){
     await getConnection().transaction(async tm => {
       await tm.query(`
         insert into updoot ("userId","postId", value)
         values ($1,$2,$3)
       `,[userId, postId, realValue]);
       await tm.query(`
         update post
         set points = points + $1
         where id = $2
       `,[realValue, postId])
     })
    }
    // Updoot.insert({
    //   creatorId: req.session,
    //   postId,
    //   value: realValue,
    // })
    getConnection().query(`
     START TRANSACTION;

     insert into updoot ("userId", "postId", value)
     values (${userId},${postId},${realValue});

     update post 
     set points = points + ${realValue}
     where id = ${postId};

     COMMIT;
    `
    )
    return true
   }
    @Query(() => PaginationPosts)
    async posts(
        @Arg('limit', () => Int) limit : number,
        @Arg('cursor', () => String, { nullable: true }) cursor: string | null
    ): Promise<PaginationPosts>{
      const realLimit = Math.min(50, limit);

      const qb = getConnection().getRepository(Post).createQueryBuilder("p").innerJoinAndSelect("p.creator","u",'u.id = p."creatorId"').take(realLimit + 1)
      if(cursor){
        qb.where('"createdAt" < :cursor', { cursor: new Date(parseInt(cursor))})
      }
      const posts = await qb.getMany()
  
      return { posts: posts.slice(0, realLimit), hasMore: posts.length === realLimit + 1 }
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
    @Mutation(() => Boolean)
    async deletePost(
      @Arg('id',() => Int) id: number
    ): Promise<Boolean>{
      const post = await Post.findOne(id)
      if(!post){
        return false
      }
      await post.remove();
      return true
    }
}