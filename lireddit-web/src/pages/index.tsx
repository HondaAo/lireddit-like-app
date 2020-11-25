import { withUrqlClient } from 'next-urql'
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from '../generated/graphql'
import { Layout } from "../components/Layout";
import NextLink from 'next/link'
import { Link, Stack, Box, Heading, Text, Flex, Button } from "@chakra-ui/react";
import React from 'react';

const Index = () => {
const [{ data, fetching }] = usePostsQuery({
  variables: {
    limit: 10
  }
});
return(
  <Layout>
  <Flex mb={4}>
    <Heading>Lireddit</Heading>
    <NextLink href="/create-post">
     <Link ml="auto">create post</Link>
    </NextLink>
   </Flex>
   <Stack spacing={8}>
    {fetching && <h2>Loading....</h2>}
    {data && data.posts.map((p) => (
     <Box key={p.id} p={5} shadow="md" borderWidth="1px">
      <Heading fontSize="xl">{p.title}</Heading>
      <Text mt={4}>{p.text.slice(0,50)}</Text>
    </Box>
    )
    )}
   </Stack>
   <Flex>
     <Button m="auto" my={4}>Load more</Button>
   </Flex>
  </Layout>
)
};

export default withUrqlClient(createUrqlClient, { ssr: true})(Index);