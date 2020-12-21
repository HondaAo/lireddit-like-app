import { dedupExchange, fetchExchange, stringifyVariables } from "urql";
import { MeQuery, LogoutMutation, MeDocument, LoginMutation, RegisterMutation, VoteMutation, VoteMutationVariables } from "../generated/graphql";
import { cacheExchange, Resolver } from '@urql/exchange-graphcache';
import { betterUpdateQuery } from './betterUpdateQuery'
import gql from 'graphql-tag'

const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;

    const allFields = cache.inspectFields(entityKey);
    const fieldInfos = allFields.filter(info => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }
    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    const isItInTheCache = cache.resolve(cache.resolveFieldByKey(entityKey, fieldKey)as string, "posts");
    info.partial = !isItInTheCache;
    let hasMore = true
    const results: string[] = [];
    fieldInfos.forEach(fi => {
      const key = cache.resolveFieldByKey(entityKey,fi.fieldKey) as string
      const data = cache.resolve(key, 'posts') as string[];
      const _hasMore = cache.resolve(key, 'hasMore')
      if(!_hasMore){
        hasMore = _hasMore as boolean
      }
      results.push(...data);
    })
    return {
      __typename: "PaginationPosts",
      hasMore,
      posts: results
    };  
};
}
export const createUrqlClient = (ssrExchange: any) => ({
    url: 'http://localhost:4000/graphql',
  fetchOptions: {
    credentials: "include" as const
  },
  exchanges: [
    dedupExchange, 
    cacheExchange({
    keys: {
      PaginationPosts: () => null   
    },
    resolvers: {
     Query: {
       posts: cursorPagination(),
     }
    },
    updates: {
      Mutation: {
        vote:  (_result, args, cache, info) => {
          const { postId, value} = args as VoteMutationVariables
          const data = cache.readFragment(
          gql`
          fragment _ on Post {
            id
            points
          }
          `,
          { id: postId } as any
          )
          if(data){
            const newPoints = (data.points as number) + value;
            cache.writeFragment(
              gql`
               fragment _ on Post {
                 points
               }
              `,
              { id: postId, points: newPoints } as any
            )
          }
        },
        createPost: (_result, args, cache, info) => {
          const allFields = cache.inspectFields("Query");
          const fieldInfos = allFields.filter(
            (info) => info.fieldName === "posts"
          );
          fieldInfos.forEach((fi) => {
            cache.invalidate("Query", "posts", fi.arguments || {});
          });
        }, 
        logout: (_result, args, cache, info) => {
          betterUpdateQuery<MeQuery, LogoutMutation>(
            cache,
            { query: MeDocument},
            _result,
            () => ({ me: null})
          )
        },
        login: (_result, args, cache, info) => {
            betterUpdateQuery<LoginMutation, MeQuery>(
              cache,
              {query: MeDocument},
              _result,
              (result, query) => {
                if(result.login.errors){
                  return query
                }else{
                  return {
                    me: result.login.user,
                  };
                }
              })
          },
          register: (_result, args, cache, info) => {
            betterUpdateQuery<RegisterMutation, MeQuery>(
              cache,
              {query: MeDocument},
              _result,
              (result, query) => {
                if(result.register.errors){
                  return query
                }else{
                  return {
                    me: result.register.user,
                  };
                }
              })
          }
        },
      },
    }),
  ,ssrExchange, fetchExchange],
});