import { Button } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react' 
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { useCreatePostMutation, useMeQuery } from '../generated/graphql'
import { createUrqlClient } from '../utils/createUrqlClient';
import { withUrqlClient } from 'next-urql'
import { Layout } from '../components/Layout';
import { useIsAuth } from '../utils/useIsAuth';

const CreatePost: React.FC = ({}) =>{
    const router = useRouter();
    useIsAuth();
    const [, createPost] = useCreatePostMutation();
        return (
        <Layout variant="small">
        <Wrapper variant="small">
           <Formik
           initialValues={{ title: '', text: '' }}
           onSubmit={async(values) => {
            const { error } = await createPost({ input: values });
            if(error?.message.includes("Not Authenticated")){
               router.push('/login?next=' + router.pathname);
            }else{
               router.push('/')
            }
           }}
         >
           {() => (
             <Form>
                  <InputField
                   name="title"
                   placeholder="title"
                   label="title"
                   type="text"
                   />
                   <InputField
                   name="text"
                   placeholder="text..."
                   label="text"
                   type="text"
                   textarea
                   />
               <Button
                 mt={4}
                 colorScheme="teal"
                 type="submit"
               >
                 Create Post
               </Button>
             </Form>
           )}
         </Formik> 
        </Wrapper> 
        </Layout>
        );
}
export default withUrqlClient(createUrqlClient)(CreatePost)