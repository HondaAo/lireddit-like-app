import { FormControl, FormLabel, Input, FormErrorMessage, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import React from 'react' 
import { useRouter } from 'next/router'
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { createUrqlClient } from '../utils/createUrqlClient';
import { withUrqlClient } from 'next-urql'

interface registerProps {

}

const Register: React.FC<registerProps> = ({}) =>{
    const router = useRouter();
    const [,register] = useRegisterMutation();
        return (
        <Wrapper variant="small">
           <Formik
           initialValues={{ username: '', email: '', passsword: '' }}
           onSubmit={async (values: any, {setErrors}) => {
             console.log(values)
             const response = await register(values);
             if(response.data?.register.errors){
                setErrors(toErrorMap(response.data.register.errors))
                console.log(response.data.register.errors)
             }else if(response.data?.register.user){
                 router.push('/')
             }
           }}
         >
           {() => (
             <Form>
                  <InputField
                   name="username"
                   placeholder="username"
                   label="username"
                   />
                   <InputField
                   name="email"
                   placeholder="email"
                   label="email"
                   />
                   <InputField
                   name="password"
                   placeholder="password"
                   label="password"
                   type="password"
                   />
               <Button
                 mt={4}
                 colorScheme="teal"
                 type="submit"
               >
                 Submit
               </Button>
             </Form>
           )}
         </Formik> 
        </Wrapper>
        );
}

export default  withUrqlClient(createUrqlClient)(Register);