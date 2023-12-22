import { Button, Flex, FormControl, FormErrorMessage, FormLabel, Heading, Input, Select, Text, Textarea } from '@chakra-ui/react'
import { ChangeEvent, useState } from 'react';


export interface User {
    _id: string,
    name: string,
    email: string,
}

export interface NewUser extends Omit<User, '_id'> {
    name: string,
    email: string,
}

export interface LoggedInUserDetails {
    user: User,
    oneSignalAppId: string
}  

interface UserFormProps {
    onSubmit: (data: NewUser) => Promise<boolean> | Promise<void> | void,
    formFor: 'LOGIN' | 'REGISTER',
    formFrom?: 'CLIENT' | 'ADMIN',
    isLoading?: boolean
}

const UserForm = ({ onSubmit, formFor, formFrom = 'ADMIN', isLoading = false }: UserFormProps) => {
    const [formData, setFormData] = useState({ name: { value: '', error: false }, email: { value: '', error: false } });

    const onChangeFormData = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
       setFormData(prev => {
           const data = JSON.parse(JSON.stringify(prev));
           data[event.target.name].value = event.target.value;
           data[event.target.name].error = event.target.value == '';
           return data;
       })
    }

    const validate = () => {
        const data: typeof formData = JSON.parse(JSON.stringify(formData));
        data.name.error = formFor == 'REGISTER' && data.name.value == '';
        data.email.error = data.email.value == '';
        setFormData(data);
        return Object.values(data).every(e => e.error == false); 
    }

    const onSubmitForm = async () => {
        if(validate() == false) return ;
        const isSucceeded = await onSubmit({ name: formData.name.value, email: formData.email.value })
        if(isSucceeded) setFormData({ name: { value: '', error: false }, email: { value: '', error: false } })
    }

    return (
        <Flex w = '100%' direction={'column'} alignItems={'center'} gap = '20px'>
            <Heading>{formFor == 'LOGIN' ? formFrom == 'ADMIN' ? 'Admin Login' : 'Login' : formFrom == 'ADMIN' ? 'Admin Register' : 'Register'}</Heading>
            {
                formFor == 'REGISTER' &&
                <FormControl isInvalid= {formData.name.error}>
                    <FormLabel>Name</FormLabel>
                    <Input value = {formData.name.value} onChange={onChangeFormData} name = 'name' placeholder='Enter name' />
                    <FormErrorMessage ml ='10px'>Name is required!</FormErrorMessage>
                </FormControl>
            }
            <FormControl isInvalid= {formData.email.error}>
                <FormLabel>Email</FormLabel>
                <Input value = {formData.email.value} onChange={onChangeFormData} name = 'email' placeholder='Enter email' />
                <FormErrorMessage ml ='10px'>Email is required!</FormErrorMessage>
            </FormControl>
            <Button onClick={onSubmitForm} isLoading = {isLoading} mt = '20px' w = '100%' bg = 'black' color = 'white' _hover={{ bg: 'blackAlpha.700' }}>{formFor == 'REGISTER' ? 'Register' : 'Login'}</Button>
        </Flex>
    );
}

export default UserForm;