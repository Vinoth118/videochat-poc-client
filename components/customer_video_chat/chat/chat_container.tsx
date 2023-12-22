import { Button, Text, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, Flex, Icon, IconButton, Menu, MenuButton, MenuList, useDisclosure, useMediaQuery, Spinner } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { FcVideoCall } from "react-icons/fc";
import { MdChat, MdClose, MdError, MdVideocam } from "react-icons/md";
import useDidMountEffect from "../../hooks/use_did_mount_effect";
import useLocalStorage from "../../hooks/use_localstorage";
import { LoggedInUserDetails } from "../../user_form";
import ChatBox from "./chat-box";


const ChatContainer = () => {
    const [loggedInUser, setLoggedInUser] = useLocalStorage<LoggedInUserDetails>('customer_auth_user');
    const [isConnecting, setConnecting] = useState(false);
    const [roomInfo, setRoomInfo] = useState<null | { _id: string }>(null);
    const [error, setError] = useState<null | string>(null);

    useDidMountEffect(() => {
        if(isConnecting == false && roomInfo == null) createRoom();
    }, [])

    const createRoom = async () => {
        setConnecting(true);
        try {
            await new Promise<void>((r, rj) => setTimeout(() => r(), 500))
            const res = await axios.post('/video_chat/chat', { userId: loggedInUser?.user?._id });
            if(res.data && res.data.success) {
                setRoomInfo(res.data.data);
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
            {roomInfo != null && <ChatBox eventId = {roomInfo._id} user = {{ id: loggedInUser?.user._id ?? '', userName: loggedInUser?.user.name ?? '' }} />}
        </Flex>
    );
}

export default ChatContainer;