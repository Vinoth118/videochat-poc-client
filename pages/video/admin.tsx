import { Button, Flex, Icon, IconButton, Skeleton, Spinner, Table, TableCaption, TableContainer, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react'
import type { GetServerSideProps, NextPage } from 'next'
import NextLink from 'next/link'
import { Link } from '@chakra-ui/react'
import useLocalStorage from '../../components/hooks/use_localstorage'
import { LoggedInUserDetails, User } from '../../components/user_form'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import OneSignal from 'react-onesignal'
import { MyOneSignal } from '../../components/one_signal'
import Header from '../../components/header'
import axios from 'axios'
import useDidMountEffect from '../../components/hooks/use_did_mount_effect'
import { MdCall, MdCallEnd, MdChat, MdRefresh, MdVideoChat } from 'react-icons/md'
import CallRoom from '../../components/admin_video_chat/call_room'
import { ChatMessageType } from '../../components/customer_video_chat/chat/chat-box'

export interface Room {
    _id: string;
    callType: 'chat' | 'video_chat';
    user: User;
    org: 'vinothh' | 'vijayy';
    chats: ChatMessageType[]
}

const Home: NextPage = () => {
    const [loggedInUser, setLoggedInUser] = useLocalStorage<LoggedInUserDetails>('admin_auth_user');
    const [rooms, setRooms] = useState<Room[]>([]);
    const [roomsLoading, setRoomsLoading] = useState(false);
    const [attenededCall, setAttenenedCall] = useState<Room | null>(null);
    const router = useRouter();

    useEffect(() => {
        if(loggedInUser == null) {
            router.push('/admin_login');
        }
    }, [loggedInUser])

    useDidMountEffect(() => {
        getRooms()
    }, [])

    const getRooms = async () => {
        setRoomsLoading(true);
        await new Promise<void>((r, rj) => setTimeout(() => r(), 1000))
        try {
            const res = await axios.get('/video_chat/rooms');
            if(res.data && res.data.success) {
                setRooms(res.data.data);
            }
        } catch(e) {}
        setRoomsLoading(false);
    }

    const onAttendCall = (roomId: string) => {
        setAttenenedCall(rooms.find(e => e._id == roomId)!);
    }

    const onEndCall = () => {
        setAttenenedCall(null)
    }

    return (
        <Flex w = '100%' direction={'column'} gap = '5px' minH = '100vh'>
            <Header />
            <Skeleton display={['none', 'none', 'flex', 'flex', 'flex']} position={'absolute'} top = '75px' h = 'calc(100vh - 75px)' w = '250px' />
            <Flex ml = {['0px', '0px', '255px', '255px', '255px']} w = 'auto' direction={'column'}>
                <CallRoom isOpen = {attenededCall != null} user = {loggedInUser?.user!} roomInfo = {attenededCall} onClose = {onEndCall} />
                <TableContainer>
                    <Table variant='simple'>
                        <TableCaption placement = 'top'>
                            <Flex gap = '10px' h = '35px' alignItems={'center'} justifyContent = 'center'> 
                                <Text fontSize={'16px'}>Call Inbox</Text>
                                <Flex w = '35px' justifyContent={'center'}>
                                    {
                                        roomsLoading ? 
                                        <Spinner size = 'sm' /> :
                                        <IconButton 
                                            aria-label={'refresh'}  
                                            isRound
                                            size = 'sm'
                                            onClick = {() => getRooms()}
                                            variant = 'ghost'
                                            icon = {<Icon w = '20px' h = '20px' as = {MdRefresh} />}                                              
                                        />
                                    }
                                </Flex>
                            </Flex>
                        </TableCaption>
                        <Thead>
                            <Tr>
                                <Th>User</Th>
                                <Th>Call type</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {
                                rooms.map(room => {
                                    return <Tr key = {room._id}>
                                        <Td>{room.user.name}</Td>
                                        <Td><Icon w = '30px' h = '30px' as = {room.callType == 'video_chat' ? MdVideoChat : MdChat} /></Td>
                                        <Td>
                                            <Flex gap = '10px'>
                                                <IconButton 
                                                    onClick = {() => onAttendCall(room._id)}
                                                    aria-label={'attend_call_button'}  
                                                    isRound
                                                    size = 'sm'
                                                    colorScheme={'green'}
                                                    icon = {<Icon w = '20px' h = '20px' as = {MdCall} />}                                              
                                                />
                                                <IconButton 
                                                    aria-label={'reject_call_button'}  
                                                    isRound
                                                    size = 'sm'
                                                    colorScheme={'red'}
                                                    icon = {<Icon w = '20px' h = '20px' as = {MdCallEnd} />}                                              
                                                />
                                            </Flex>
                                        </Td>
                                    </Tr>
                                })
                            }
                        </Tbody>
                    </Table>
                </TableContainer>
            </Flex>
        </Flex>
    )
}

export default Home;
