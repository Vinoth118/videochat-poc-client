import type { NextPage } from 'next';
import { Button, Flex, FormControl, FormErrorMessage, FormLabel, Heading, Input, Text, Textarea, useToast } from '@chakra-ui/react'
import { ChangeEvent, useEffect, useState } from 'react';
import UserForm, { NewUser, User } from '../components/user_form';
import useLocalStorage from '../components/hooks/use_localstorage';
import axios from 'axios';
import { useRouter } from 'next/router';
import { MyOneSignal } from '../components/one_signal';
import useClient from '../components/hooks/use_client';

interface LoggedInUserDetails {
    user: User,
    oneSignalAppId: string
}  

let OneSingalInstance: MyOneSignal;

const AdminLogin: NextPage = () => {
    const [loggedInUser, setLoggedInUser] = useLocalStorage<LoggedInUserDetails>('admin_auth_user');
    const [formType, setFormType] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
    const [isSubmitLoading, setSubmitLoading] = useState(false);
    const isClient = useClient();
    const toast = useToast();
    const router = useRouter();

    useEffect(() => {
        OneSingalInstance = new MyOneSignal();
    }, [])

    useEffect(() => {
        if(loggedInUser != null) {
            router.push('/video/admin');
        }
    }, [loggedInUser])

    const onLoginOrRegister = (data: NewUser) => {
        if(formType == 'LOGIN') {
            onLogin(data);
        } else {
            onRegister(data);
        }
    }

    const onLogin = async (data: NewUser) => {
        setSubmitLoading(true);
        try {
            const res = await axios.post('/login', { email: data.email, type: 'admin' });
            if(res.data && res.data.success) {
                onLoginSuccess(res.data.data);
                setSubmitLoading(false);
                return true;
            } else {
                toast({
                    title: 'Email not registered yet!',
                    position: 'top-right',
                    isClosable: true,
                    status: 'error'
                })
                setSubmitLoading(false);
                return false;
            }
        } catch(e) {
            toast({
                title: 'Invalid email!',
                position: 'top-right',
                isClosable: true,
                status: 'error'
            })
            setSubmitLoading(false);
            return false;
        } 
    }

    const onRegister = async (data: NewUser) => {
        setSubmitLoading(true);
        try {
            const res = await axios.post('/register', { email: data.email, name: data.name, type: 'admin' });
            if(res.data && res.data.success) {
                onLoginSuccess(res.data.data);
                setSubmitLoading(false);
                return true;
            } else {
                toast({
                    title: 'Email already registered!',
                    position: 'top-right',
                    isClosable: true,
                    status: 'error'
                })
                setSubmitLoading(false);
                return false;
            }
        } catch(e) {
            toast({
                title: 'Something went wrong!',
                position: 'top-right',
                isClosable: true,
                status: 'error'
            })
            setSubmitLoading(false);
            return false;
        } 
    }

    const onLoginSuccess = async (resData: { user: User, oneSignalAppId: string }) => {
        console.log('login success: ', resData);
        setLoggedInUser(resData);
        await OneSingalInstance.initializeOneSignal(resData.oneSignalAppId);
        OneSingalInstance.login(resData.user._id);   
    }

    const onLogout = async () => {
        setSubmitLoading(true);
        await OneSingalInstance.logout(loggedInUser!.oneSignalAppId)
        setSubmitLoading(false);
        setLoggedInUser(null);
    }

    if(isClient == false) return <></>
    
    return (
        <Flex w = '100%' h = '100vh'>
            {
                loggedInUser == null ?
                <Flex minW = {['350px', '400px', '400px', '400px', '400px']} m = 'auto' direction={'column'}>
                    <UserForm onSubmit = {onLoginOrRegister} isLoading = {isSubmitLoading} formFor = {formType} formFrom = 'ADMIN' />
                    <Flex my = '20px' w = '100%' position={'relative'} alignItems = 'center' h = '50px'>
                        <Flex top = {'50%'} left = {'50%'} transform = 'translate(-50%, -50%)' position={'absolute'} w = '150px' h = '2px' bg = 'black' />
                        <Flex top = {'50%'} left = {'50%'} transform = 'translate(-50%, -50%)' w = 'fit-content' h = 'fit-content' position={'absolute'} p = '5px' borderRadius={'40%'} bg = 'white'>Or</Flex>
                    </Flex>
                    <Button onClick={() => setFormType(prev => prev == 'REGISTER' ? 'LOGIN' : 'REGISTER')} flexShrink = {0} w = '100%' bg = 'black' color = 'white' _hover={{ bg: 'blackAlpha.700' }}>{formType == 'REGISTER' ? 'Have account? Login' : "Doesn't have account? Sign Up"}</Button>
                </Flex> :
                <Flex direction={'column'} minW = {['350px', '400px', '400px', '400px', '400px']} m = 'auto' gap = '20px' alignItems={'center'}>
                    <Heading w = 'fit-content'>Hi, {loggedInUser.user.name}</Heading>
                    <Button onClick={onLogout} isLoading = {isSubmitLoading} w = '100%' bg = 'black' color = 'white' _hover={{ bg: 'blackAlpha.700' }}>Logout</Button>
                </Flex>
            }
        </Flex>
    )
}
  
export default AdminLogin;