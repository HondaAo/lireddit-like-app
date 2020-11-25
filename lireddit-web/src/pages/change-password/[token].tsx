import { Button } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { NextPage } from 'next' 
import React from 'react';
import { InputField } from '../../components/InputField';
import { Wrapper } from '../../components/Wrapper';
import { toErrorMap } from '../../utils/toErrorMap';
import { useChangePasswordMutation } from '../../generated/graphql'
import { useRouter } from 'next/router';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { withUrqlClient } from 'next-urql'

const ChangePassword: NextPage<{token: string}> = ({ token }) =>{
  const router = useRouter();
  const [, changePassword] = useChangePasswordMutation()
    return (
        <Wrapper variant="small">
        <Formik
        initialValues={{ newPassword: '' }}
        onSubmit={async (values, {setErrors}) => {
          const response = await changePassword({ 
            newPassword: values.newPassword, 
            token
          });
          if(response.data?.changePassword.errors){
             setErrors(toErrorMap(response.data.changePassword.errors))
          }else if(response.data?.changePassword.user){
              router.push('/')
          }
        }}
      >
        {() => (
          <Form>
                <InputField
                name="newPassword"
                placeholder="new password"
                label="new password"
                type="password"
                />
            <Button
              mt={4}
              colorScheme="teal"
              type="submit"
            >
              change password
            </Button>
          </Form>
        )}
      </Formik> 
     </Wrapper>
    );
}
ChangePassword.getInitialProps = ({ query }) => {
    return {
        token:  query.token as string
    }
}
export default withUrqlClient(createUrqlClient, {ssr: false})(ChangePassword)