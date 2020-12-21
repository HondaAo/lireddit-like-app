import { withUrqlClient } from 'next-urql'
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from '../generated/graphql'
import { Layout } from "../components/Layout";
import NextLink from 'next/link'
import { Link, Stack, Box, Heading, Text, Flex, Button } from "@chakra-ui/react";
import React, { useState } from 'react';
import { UpdootSection } from '../components/UpdootSection';

const Index = () => {
const [ variables, setVariables ] = useState({ limit: 15, cursor: null  })
const [{ data, fetching }] = usePostsQuery({
  variables
});
if (!fetching && !data) {
  return <div>you got query failed for some reason</div>;
}

return(
  <Layout>
  <Flex mb={4}>
    <Heading>Lireddit</Heading>
    <NextLink href="/create-post">
     <Link ml="auto">create post</Link>
    </NextLink>
   </Flex>
   {!data && fetching ? (
        <div>loading...</div>
      ) : (
        <Stack spacing={8}>
          {data!.posts.posts.map((p) => (
           <Flex key={p.id} p={5} shadow="md" borderWidth="1px">
           <UpdootSection post={p} />
           <Box>
             <Heading fontSize="xl">{p.title}</Heading>
             <Text>posted by {p.creator.username}</Text>
             <Text mt={4}>{p.text}</Text>
           </Box>
          </Flex>
          ))}
        </Stack>
    )}
   { data &&data.posts.hasMore ? (
   <Flex>
     <Button m="auto" my={4} onClick={() => {
       setVariables({
         limit: variables.limit,
         cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
       })
     }} >Load more</Button>
   </Flex>
   ): null}
  </Layout>
)
};

export default withUrqlClient(createUrqlClient, { ssr: true})(Index);