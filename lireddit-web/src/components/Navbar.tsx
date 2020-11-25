import { Button, Flex } from '@chakra-ui/react';
import { Link } from '@chakra-ui/react';
import { Box } from '@chakra-ui/react';
import React from 'react'
import NextLink from 'next/link'
import { useLogoutMutation, useMeQuery } from '../generated/graphql'
import { isServer } from '../utils/isServer';
interface NavbarProps {

}

export const Navbar: React.FC<NavbarProps> = () =>{
    const [ {fetching: logoutFetching},logout] = useLogoutMutation();
    const [{ data, fetching }] = useMeQuery({
        pause: isServer(),
    })
    let body = null;
    if(!data?.me){
        body = (
            <>
            <NextLink href="/login">
              <Link mr={2}>login</Link>
              </NextLink>
              <NextLink href="/register">
              <Link mr={2}>register</Link>
             </NextLink>
            </>
        )
    }else{
        body = (
            <Flex>
            <Box mr={2}>{data.me.username}</Box>
            <Button variant="link" mr={2} onClick={() => logout()} isLoading={logoutFetching}>logout</Button>
            </Flex>
        )
       
    }
        return (
            <Flex bg="tomato" p={4}>
            <Box  ml={'auto'}>
             {body}
            </Box>
            </Flex>
        );
}