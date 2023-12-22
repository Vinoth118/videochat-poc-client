import { Button, Flex, Skeleton, SkeletonText, Text } from '@chakra-ui/react'
import type { GetServerSideProps, NextPage } from 'next'
import NextLink from 'next/link'
import { Link } from '@chakra-ui/react'
import VideoChatContainer from '../../components/customer_video_chat/video_chat/video_chat_button'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import useLocalStorage from '../../components/hooks/use_localstorage'
import { User } from '../../components/user_form'
import OneSignal from 'react-onesignal'
import { MyOneSignal } from '../../components/one_signal'
import Header from '../../components/header'

interface LoggedInUserDetails {
    user: User,
    oneSignalAppId: string
}  

const Home: NextPage = () => {
    const [loggedInUser, setLoggedInUser] = useLocalStorage<LoggedInUserDetails>('customer_auth_user');
    const router = useRouter();

    useEffect(() => {
        if(loggedInUser == null) {
            router.push('/customer_login');
        }
    }, [loggedInUser])
    
    return (
        <Flex w = '100%' direction={'column'} gap = '50px' minH = '100vh'>
            <Header />
            <Flex flex = {1} margin={'auto'} w = '100%' maxW = '1400px' direction={'column'} gap = '30px' px = '20px'>   
                <Flex gap = '30px' direction={['column', 'column', 'column', 'row', 'row']}>
                    <Skeleton w = '100%' h = '500px' borderRadius={'10px'} />
                    <Flex w = '100%' direction={'column'} gap = '30px'>
                        <Skeleton w = '100%' h = '60px' borderRadius={'10px'} />
                        <SkeletonText  w = '80%' borderRadius={'10px'} />
                        <Skeleton w = '40%' h = '120px' borderRadius={'10px'} />
                        <Skeleton w = '100%' h = '320px' borderRadius={'10px'} />
                    </Flex>
                </Flex>
                <Skeleton alignSelf={'flex-end'} w = {Array.from(Array(5).keys()).map(e => e > 3 ? 'calc(50% - 15px)' : '100%')} h = '400px' borderRadius={'10px'} />
                <Skeleton alignSelf={'flex-end'} w = {Array.from(Array(5).keys()).map(e => e > 3 ? 'calc(50% - 15px)' : '100%')} h = '400px' borderRadius={'10px'} />
                <Skeleton alignSelf={'flex-end'} w = '100%' h = '300px' borderRadius={'10px'} />
            </Flex>
            <Skeleton w = '100%' h = '450px' />
            <VideoChatContainer />
        </Flex>
    )
}

export default Home;
