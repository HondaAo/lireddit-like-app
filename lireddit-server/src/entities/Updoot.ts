import { ObjectType, Field } from "type-graphql";
import {
  Entity,
  BaseEntity,
  ManyToOne,
  PrimaryColumn,
  Column,
} from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

@ObjectType()
@Entity()
export class Updoot extends BaseEntity {
  @Field()
  @Column({ type: "int"})
  value: number;

  @Field()
  @PrimaryColumn()
  creatorId: number;

  @Field(() => User)
  @ManyToOne(() => User)
  creator: User;

  @Field(() => String)
  @PrimaryColumn()
  postId: number;

  @Field(() => Post)
  @ManyToOne(() => Post)
  post:Post;
}