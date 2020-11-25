import { FormControl, FormLabel, Input, FormErrorMessage, Button, Link, Flex } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import React from 'react' 
import { useRouter } from 'next/router'
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { useLoginMutation, useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { createUrqlClient } from '../utils/createUrqlClient';
import { withUrqlClient } from 'next-urql'
import NextLink from 'next/link';

interface registerProps {

}

const Login: React.FC<registerProps> = ({}) =>{
    const router = useRouter();
    const [,login] = useLoginMutation();
        return (
        <Wrapper variant="small">
           <Formik
           initialValues={{ email: '', passsword: '' }}
           onSubmit={async (values: any, {setErrors}) => {
             console.log(values)
             const response = await login(values);
             if(response.data?.login.errors){
                setErrors(toErrorMap(response.data.login.errors))
                console.log(response.data.login.errors)
             }else if(response.data?.login.user){
               if(typeof router.query.next === 'string'){
                 router.push(router.query.next)
               }else{
                 router.push('/')
               }
             }
           }}
         >
           {() => (
             <Form>
                  <InputField
                   name="email"
                   placeholder="email"
                   label="email"
                   type="email"
                   />
                   <InputField
                   name="password"
                   placeholder="password"
                   label="password"
                   type="password"
                   />
                <Flex mt={2}>
                 <NextLink href="/forgot-password">
                   <Link ml='auto'>forgot password</Link>
                 </NextLink>
               </Flex>
               <Button
                 mt={4}
                 colorScheme="teal"
                 type="submit"
               >
                 Login
               </Button>
             </Form>
           )}
         </Formik> 
        </Wrapper>
        );
}

export default withUrqlClient(createUrqlClient)(Login);