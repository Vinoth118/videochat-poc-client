import { Avatar, Flex, Icon, IconButton, Input, Spinner, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { MdEmojiEmotions } from "react-icons/md";
import { IoPaperPlane } from "react-icons/io5";
import { UtilSocket } from "../../socket";
import { IAgoraRTCClient, IAgoraRTCRemoteUser, IRemoteVideoTrack, UID } from "agora-rtc-sdk-ng";
import { VideoCredentials } from "./video_continer";

interface User {
    id: string,
    userName: string,
}

interface VideoBoxProps {
    credentials: VideoCredentials,
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

const VideoBox = ({ credentials }: VideoBoxProps) => {
    const [isConnecting, setConnecting] = useState(false);
    useEffect(() => {
        if(credentials.isLoading == false && credentials.rtcToken && isConnecting == false) {
            startVideo();
        }
        
        return () => {
            localClient.videoTrack?.stop();
            localClient.client?.leave();
        }
    }, [credentials])

    const startVideo = async () => {
        const { appId, userId, rtcToken, channelName } = credentials;
        if(appId == null || channelName == null || credentials.isLoading) return ;
        setConnecting(true)
        const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
        localClient.client = AgoraRTC.createClient({ codec: 'h264', mode: 'live' });
        localClient.client.setClientRole('audience');
        try {
            const uid = await localClient.client.join(appId, channelName, rtcToken, localClient?.uid ?? userId ?? null);
            console.debug('join success, channel: ' + channelName + ', uid: ' + uid)
            localClient.uid = uid;
        } catch (error) {
            console.log('join failed: ', error)
        }
        localClient.client.on('user-published', onUserPublished)
        localClient.client.on('user-unpublished', onUserUnPublished)
        setConnecting(false)
    }

    const onUserPublished = async (remoteUser: IAgoraRTCRemoteUser, mediaType: "video") => {
        console.debug(`onUserPublished ${remoteUser.uid}, mediaType= ${mediaType}`);
        try {
            localClient.videoTrack = await localClient.client?.subscribe(remoteUser, mediaType)
            localClient.videoTrack?.play('remote_video_', { fit: "contain" })

            const videoWrapper = document.querySelectorAll('[id^="agora-video-player-track-video"]');
            if(videoWrapper[0]) (videoWrapper[0] as HTMLDivElement).style.borderRadius = '10px';
            
        } catch (error) {
            console.log(error)
        }
    }

    const onUserUnPublished = async (remoteUser: IAgoraRTCRemoteUser, mediaType: "video") => {
        console.debug(`onUserUnPublished ${remoteUser.uid}`)
        if(localClient.videoTrack?.isPlaying) {
            localClient.videoTrack.stop();
        }
        //localClient.client?.leave();
    }

    return (
        <Flex flexGrow={1} position={'relative'} w = '100%' h = '100%' bg = '#F2F2F2' borderRadius={'10px'} direction={"column"}>
            <Flex 
                id="remote_video_" className="remote_video_" 
                width={'100%'} height = '100%' position={'absolute'}
                borderRadius={'10px'} bg = 'black'
                alignItems={'center'} justifyContent = 'center'
            >
                {credentials.isLoading && <Spinner size = 'lg' color = 'white' thickness="3px" />}
            </Flex>
        </Flex>
    );
}
 
export default VideoBox;