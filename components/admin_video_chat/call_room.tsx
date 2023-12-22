import { Flex, Modal, ModalOverlay, ModalContent, ModalBody, ModalFooter, ModalHeader, ModalCloseButton, Button, Icon, IconButton } from "@chakra-ui/react";
import { IAgoraRTC, IAgoraRTCClient, ICameraVideoTrack, ILocalVideoTrack, IMicrophoneAudioTrack, UID } from "agora-rtc-sdk-ng";
import axios from "axios";
import { useEffect, useState } from "react";
import { MdOutlineCameraswitch, MdOutlineScreenShare, MdOutlineStopScreenShare, MdOutlineVideocam, MdOutlineVideocamOff } from "react-icons/md";
import { Room } from "../../pages/video/admin";
import ChatBox from "../customer_video_chat/chat/chat-box";
import { User } from "../user_form";

interface LocalClient {
    client: IAgoraRTCClient | null,
    uid: UID | null,
    joined: boolean,
    published: boolean,
    videoTrack: ILocalVideoTrack | ICameraVideoTrack | null | undefined
}

interface Credentials { 
    rtcToken: string | null, 
    appId: string | null, 
    userId: string | null,
    channelName: string | null,
    isLoading: boolean
}

const localClient: LocalClient = {
    client: null,
    uid: null,
    joined: false,
    published: false,
    videoTrack: null
}

var AgoraRTC: IAgoraRTC;

interface CallRoomProps {
    user: User,
    roomInfo: Room | null,
    isOpen: boolean,
    onClose: () => void
}

const CallRoom = ({ user, roomInfo, isOpen, onClose }: CallRoomProps) => {
    const [ liveType, setLiveType ] = useState<'screen' | 'camera_front' | 'camera_rear'>('camera_front');
    const [canStartLive, setCanStartLive] = useState(roomInfo?.callType == 'video_chat');
    const [isLivePublished, setLivePublished] = useState(false);
    const [ credentials, setCredentials ] = useState<Credentials>({ rtcToken: null, appId: null, userId: null, channelName: roomInfo?._id ?? '', isLoading: false })

    useEffect(() => {
        if(isOpen) {
            initAgoraClient();
            fetchCredentials();
            setLiveType('camera_front')
            setLivePublished(false)
            setCanStartLive(roomInfo?.callType == 'video_chat')
        }
        return () => {
            stopLive();
        }
    }, [isOpen])

    useEffect(() => {
        if(localClient.videoTrack != null && localClient.videoTrack.isPlaying) {
            unPublish();
            startLive();
        }
    }, [liveType])

    const fetchCredentials = async () => {
        setCredentials({ ...credentials, isLoading: true });
        try {
            const res = await axios.post('/video_chat/token', { channelName: roomInfo?._id, userId: user._id })
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

    async function initAgoraClient () {
        AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
        localClient.client = AgoraRTC.createClient({ codec: 'h264', mode: 'live' });
        localClient.client.setClientRole('host');
    }

    async function joinChannel () {
        if(localClient.client != null && credentials.appId && credentials.rtcToken && credentials.channelName) {
            try {
                const uid = await localClient.client.join(credentials.appId, credentials.channelName, credentials.rtcToken, credentials.userId);
                localClient.uid = uid;
                localClient.joined = true;
                console.debug('join success, channel: ' + credentials.channelName + ', uid: ' + uid);
            } catch (error) {
                stopLive();
                if(error == "INVALID_VENDOR_KEY") alert("Invalid Token!")
                console.log(error)
            }
        }
    }

    async function addListeners () {
        if(localClient.client != null) {
            localClient.client.on('user-joined', (user) => {
                console.log('\n\nJoinedUser: ', user, '\n\n')
            })
            localClient.client.on('token-privilege-did-expire', () => {
                stopLive()
                alert('Token Expired!')
            })
        }
    }

    async function createLocalTracks(): Promise<[ICameraVideoTrack, IMicrophoneAudioTrack] | [ILocalVideoTrack]> {
        if(liveType == "screen") {
            const localVideoTrack = await AgoraRTC.createScreenVideoTrack({}, 'disable');
            return [localVideoTrack];
        } else {
            const [microphoneTrack, cameraTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(undefined, { facingMode: liveType == 'camera_front' ? 'user' : 'environment' });
            return [cameraTrack, microphoneTrack];        
        }
    }
    
    async function startLive() {
        setCredentials({ ...credentials, isLoading: true });
        if(!localClient.joined) {
            await joinChannel()
            await addListeners()
        } else if(localClient.published) {
            alert('You are already started live');
            return;
        }
        if(localClient.client != null && credentials.appId && credentials.rtcToken) {
            try {
                const localTracks = await createLocalTracks();
                localClient.client.publish(localTracks);
                localClient.videoTrack = localTracks[0];
                localClient.videoTrack.play('local_stream', { fit: 'contain' });
                localClient.published = true;
                setLivePublished(true);
                setCredentials({ ...credentials, isLoading: false });

                const videoWrapper = document.querySelectorAll('[id^="agora-video-player"]');
                if(videoWrapper[0]) (videoWrapper[0] as HTMLDivElement).style.borderRadius = '10px';
            } catch (error) {
                console.log(error)
                setCredentials({ ...credentials, isLoading: false });
            }
        }
    }
    
    function stopLive() {
        console.log('remote users: ', localClient.client?.remoteUsers)
        unPublish()
        localClient.client?.leave();
        localClient.joined = false;
        setLivePublished(false);
    }

    function unPublish() {
        //if(localClient.videoTrack != null && localClient.videoTrack.isPlaying) {
        if(localClient.videoTrack != null) {
            try {
                localClient.videoTrack.stop();
                localClient.videoTrack.close();

                localClient.client?.localTracks?.[0]?.stop();
                localClient.client?.localTracks?.[0]?.close();
                localClient.client?.localTracks?.[1]?.stop();
                localClient.client?.localTracks?.[1]?.close();

                localClient.client?.unpublish(localClient.videoTrack);
                localClient.published = false;
                localClient.videoTrack = null;
            } catch(e) {}
        }
    }
    
    return (
        <>
            {
                <Modal blockScrollOnMount = {false} isOpen={isOpen} onClose={onClose} isCentered scrollBehavior="inside">
                    <ModalOverlay />
                    <ModalContent minW = '80%' minH = '80%' maxH = '90%'>
                        <ModalHeader>{roomInfo?.user?.name}</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody display={'flex'} flexDirection = {['column', 'column', 'row', 'row', 'row']} gap = '20px'>
                            {
                                roomInfo?.callType == 'video_chat' &&
                                <Flex w = '100%' direction={'column'} gap = '10px'>
                                    <Flex w = '100%' h = '350px' position={'relative'}>
                                        <Flex 
                                            id="local_stream" className="local_stream" 
                                            width={'100%'} height = '100%' position={'absolute'}
                                            borderRadius={'10px'} bg = 'black'
                                            transform = {liveType == 'camera_rear' ? 'rotateY(180deg)' : 'initial'}
                                            //style={{ width: "100%", height: "100%", position: 'absolute', borderRadius: '10px', backgroundColor: 'black', transform: liveType == 'camera_rear' ? 'rotateY(180deg)' : 'initial' }} 
                                        ></Flex>
                                    </Flex>
                                    <Flex gridGap = {"20px"} justifyContent = 'center'>
                                        <IconButton variant = 'ghost' onClick = {() => liveType == 'screen' && setLiveType('camera_front')} icon = {<Icon w = '25px' h = '25px' color = 'black' as = {liveType == 'screen' ? MdOutlineVideocamOff : MdOutlineVideocam} />} aria-label = 'videocamButton' data-testid = 'switch_between_screen_share_and_camera_toggle_button' />
                                        <IconButton variant = 'ghost' onClick = {() => setLiveType(liveType == 'camera_rear' ? 'camera_front' : 'camera_rear')} isDisabled = {liveType == 'screen'} display = {['flex', 'flex', 'none', 'none', 'none']} icon = {<Icon w = '20px' h = '20px' color = 'black' as = {MdOutlineCameraswitch} />} aria-label = 'changeCamera' data-testid = 'switch_between_front_rear_camera_toggle_button' />
                                        <IconButton variant = 'ghost' onClick = {() => setLiveType('screen')} display = {['none', 'none', 'flex', 'flex', 'flex']} icon = {<Icon w = '23px' h = '23px' color = 'black' as = {liveType == 'screen' ? MdOutlineScreenShare : MdOutlineStopScreenShare} />} aria-label = 'screenshareButton' data-testid = 'live_screen_share_button' />
                                    </Flex>
                                    <Button 
                                        w = '100%' 
                                        colorScheme={isLivePublished == false && canStartLive ? 'green' : 'red'}
                                        isLoading = {credentials.isLoading}
                                        isDisabled = {credentials.isLoading || canStartLive == false} 
                                        onClick = {() => isLivePublished ? stopLive() : startLive()}
                                    >{isLivePublished ? 'Stop Video' : 'Start Video'}</Button>
                                </Flex>
                            }
                            <Flex w = '100%'>
                                {
                                    roomInfo != null && 
                                    <ChatBox 
                                        eventId = {roomInfo._id} 
                                        isAdmin
                                        user = {{ id: user._id, userName: user.name }} 
                                    />
                                }
                            </Flex>
                        </ModalBody>
                        <ModalFooter>
                            <Button colorScheme='red' w = '100%' onClick={onClose}>End</Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            }
        </>
    );
}

export default CallRoom;