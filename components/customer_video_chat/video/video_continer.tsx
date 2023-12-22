import { Button, Text, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, Flex, Icon, IconButton, Menu, MenuButton, MenuList, useDisclosure, useMediaQuery, Spinner } from "@chakra-ui/react";
import { IAgoraRTCClient, IRemoteVideoTrack, UID } from "agora-rtc-sdk-ng";
import axios from "axios";
import { useState } from "react";
import { FcVideoCall } from "react-icons/fc";
import { MdChat, MdClose, MdError, MdVideoCall, MdVideocam } from "react-icons/md";
import { Room } from "../../../pages/video/admin";
import useDidMountEffect from "../../hooks/use_did_mount_effect";
import useLocalStorage from "../../hooks/use_localstorage";
import { LoggedInUserDetails } from "../../user_form";
import ChatBox from "../chat/chat-box";
import VideoBox from "./video-box";

export interface VideoCredentials { 
    rtcToken: string | null, 
    appId: string | null, 
    userId: string | null,
    channelName: string | null,
    isLoading: boolean
}

interface LocalClient {
    client: IAgoraRTCClient | null,
    uid: UID | null,
    videoTrack: IRemoteVideoTrack | null | undefined
}

const localClient: LocalClient = {
    client: null,
    uid: null,
    videoTrack: null
}

const VideoContainer = () => {
    const [loggedInUser, setLoggedInUser] = useLocalStorage<LoggedInUserDetails>('customer_auth_user');
    const [isConnecting, setConnecting] = useState(false);
    const [roomInfo, setRoomInfo] = useState<null | Room>(null);
    const [window, setWindow] = useState<'video' | 'chat'>('video');
    const [error, setError] = useState<null | string>(null);
    const [ credentials, setCredentials ] = useState<VideoCredentials>({ rtcToken: null, appId: null, userId: null, channelName: roomInfo?._id ?? '', isLoading: false })

    useDidMountEffect(() => {
        if(isConnecting == false && roomInfo == null) createRoom();
    }, [])

    const createRoom = async () => {
        setConnecting(true);
        try {
            await new Promise<void>((r, rj) => setTimeout(() => r(), 500))
            const res = await axios.post('/video_chat', { userId: loggedInUser?.user?._id });
            if(res.data && res.data.success) {
                setRoomInfo(res.data.data);
                fetchCredentials(res.data.data);
                setError(null)
            } else {
                setError('Something went wrong!')
                setRoomInfo(null)
            }
        } catch(e) {
            setError('Something went wrong!')
            setRoomInfo(null)
        }
        setConnecting(false);
    }

    const fetchCredentials = async (roomInfo: Room) => {
        setCredentials({ ...credentials, isLoading: true });
        try {
            const res = await axios.post('/video_chat/token', { channelName: roomInfo?._id, userId: roomInfo?.user?._id })
            if(res.data && res.data.success) {
                setCredentials({ ...credentials, ...res.data.data, channelName: roomInfo?._id, isLoading: false })
            } else {
                setCredentials({ ...credentials, isLoading: false });
                alert(res.data.message ?? "Something went wrong! plz try to refresh the page")
            }
        } catch (error) {
            setCredentials({ ...credentials, isLoading: false });
            alert("Something went wrong! plz try to refresh the page")
        }
    }

    const onClickWindow = (window: 'chat' | 'video') => {
        // if(window == 'video') {
        //     setCredentials({ ...credentials, isLoading: true })
        //     setTimeout(() => {
        //         setCredentials({ ...credentials, isLoading: false })
        //     }, 100)
        // }
        setWindow(window)
    }
    
    return (
        <Flex w = '100%' h = '100%' justifyContent = 'center' direction={'column'}>
            {
                isConnecting ? 
                <Flex w = '100%' direction={'column'} gap = '15px' alignItems={'center'}>
                    <Spinner thickness="3px" color = 'black' size = 'lg' />
                    <Text>Connecting....</Text>
                </Flex> : 
                error != null && 
                <Flex w = '100%' direction={'column'} gap = '15px' alignItems={'center'}>
                    <Icon as = {MdError} color = 'red' w = '50px' h = '50px' />
                    <Text>{error}</Text>
                </Flex>
            }
            {
                roomInfo != null && 
                <Flex w = '100%' h = '100%' position={'relative'} direction={'column'}>
                    <Flex w = '100%' h = 'calc(100% - 60px)' position={'relative'}>
                        <Flex zIndex={window == 'video' ? 3000 : 'auto'} bottom = {window == 'video' ? '0px' : '-700px'} transition = 'all 300ms ease-in-out' w = '100%' h = '100%' position={'absolute'} bg = 'white'>
                            <VideoBox credentials={credentials} />
                        </Flex>
                        <Flex zIndex={window == 'chat' ? 3000 : 'auto'} bottom = {window == 'chat' ? '0px' : '-700px'} transition = 'all 300ms ease-in-out' w = '100%' h = '100%' position={'absolute'} bg = 'white'>
                            <ChatBox eventId = {roomInfo._id} user = {{ id: loggedInUser?.user._id ?? '', userName: loggedInUser?.user.name ?? '' }} />
                        </Flex>
                    </Flex>
                    <Flex zIndex={3001} position={'absolute'} bottom = {0} w = '100%' h = '50px' borderRadius = '10px' border = '1px' borderColor = 'gray.300' bg = 'white'>
                        <Button onClick = {() => onClickWindow('video')} bg={window == 'video' ? 'blue.300' : 'initial'} borderRadius = '10px' variant={'ghost'} h = '100%' w = '100%' borderRightRadius={'0px'}><Icon w = '30px' h = '30px' as = {MdVideocam} /></Button>
                        <Button onClick = {() => onClickWindow('chat')} bg={window == 'chat' ? 'blue.300' : 'initial'} borderRadius = '10px' variant={'ghost'} h = '100%' w = '100%' borderLeft = '1px' borderLeftRadius={'0px'} borderColor = 'gray.300'><Icon w = '30px' h = '30px' as = {MdChat} /></Button>
                    </Flex>
                </Flex>
            }
        </Flex>
    );
}

export default VideoContainer;