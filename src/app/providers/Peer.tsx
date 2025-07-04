'use client';
import React , {useMemo , useState , useEffect, useCallback} from "react";

const PeerContext = React.createContext<any>(null);

export const usePeer = () => {
    return React.useContext(PeerContext);
}

export const PeerProvider = (props: any) => {

    const [remoteStream , setRemoteStream] = useState<MediaStream | null>(null);

    const peer = useMemo(() => {
        if (typeof window === 'undefined') return null;
        return new RTCPeerConnection({
            iceServers: [
                {
                    urls: 'stun:stun.l.google.com:19302',
                },
                {
                    urls: 'stun:global.stun.twilio.com:3478',
                }, 
            ],
        });
    }, []);

    const createOffer = async () => {
        if(!peer) return;
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        return offer;
    }

    const createAnswer = async (offer: RTCSessionDescriptionInit) => {
        if(!peer) return;
        await peer.setRemoteDescription(offer);
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        return answer;
    };

   const setRemoteAns = async (ans: RTCSessionDescriptionInit) => {
    if (!peer) return;
    if (peer.signalingState !== "have-local-offer") {
        return;
    }
    await peer.setRemoteDescription(ans);
}

    const sendStream = async (stream: MediaStream | null | undefined) => {
        if (!peer || !stream) return;
        const tracks = stream.getTracks();
        for (const track of tracks) {
            peer.addTrack(track, stream);
        }
    }

    const handleTrackEvent = useCallback((event: RTCTrackEvent) => {
        const stream = event.streams[0];
        setRemoteStream(stream);
    } , []);

    useEffect(()=>{
        peer?.addEventListener('track' ,handleTrackEvent);
        return () => {
            peer?.removeEventListener('track' , handleTrackEvent);
        };
    } , [peer]);

    return (
        <PeerContext.Provider value={{ peer , createOffer , createAnswer , setRemoteAns , sendStream , remoteStream}}>
            {props.children}
        </PeerContext.Provider>
    );
};