// const { text } = require("express");

const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
const socket = io('/');
myVideo.muted = true;
var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '3030' //443
});

// Audio Video Permission
let myVideoStream

// Promise
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', (userId) => {
        connectToNewUser(userId, stream);
    })

    let text = $('input');
    // when press enter send message
    $('html').keydown((e) => {
        if(e.which == 13 && text.val().length !== 0) {
            socket.emit('message', text.val());
            text.val('')
        }
    });

    socket.on('createMessage', message => {
        $('ul').append(`<li class="message"><b>user</b><br/>${message}</li>`)
        scrollToBottom();
    })
})

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
})

const connectToNewUser = (userId, stream) => {
    const call = peer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
}

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videoGrid.append(video);
}

const scrollToBottom = () => {
    let d = $('.main__chat_window');
    d.scrollTop(d.prop("scrollHeight"));
}

// Mute Video
const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if(enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const setMuteButton = () => {
    const html = `<i class="fas fa-microphone" title="Turn off Microphone"></i>`

    document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
    const html = `<i class="unmute fas fa-microphone-slash" title="Turn on Microphone"></i>`

    document.querySelector('.main__mute_button').innerHTML = html;
}

const playStop = () => {
    console.log('object')
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if(enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo()
    } else {
        setStopVideo();
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const setPlayVideo = () => {
    const html = `<i class="stop fas fa-video-slash" title="Turn on Camera"></i>`

    document.querySelector('.main__video_button').innerHTML = html;
}

const setStopVideo = () => {
    const html = `<i class="fas fa-video"></i>`

    document.querySelector('.main__video_button').innerHTML = html;
}

const shareScreen = async () => {

    // playStop()
    myVideoStream.getVideoTracks()[0].enabled = false;

    const socket = io('/')
    const videoGrid = document.getElementById('video-grid')
    const peer = new Peer(undefined, {
        path: './peerjs',
        host: '/',
        port: '3030'
    })

    const myVideo2  = document.createElement('video')
    myVideo2.muted = true;
    const peers = {}
    navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
    }).then(stream => {
        myVideoStream = stream;
        addVideoStream(myVideo2, stream)
        peer.on('call', call => {
            call.answer(stream)
            const video2 = document.createElement('video')
            call.on('stream', userVideoStream => {
                addVideoStream(video2, userVideoStream)
            })
        })
        socket.on('user-connected', userId => {
            connectToNewUser(userId, stream)
        })
    })
    socket.on('user-disconnected', userId => {
        if(peers[userId]) peers[userId].close()
    })

    peer.on('open', id => {
        socket.emit('join-room', ROOM_ID, id)
    })

    function connectToNewUser(userId, stream) {
        const call = peer.call(userId, stream)
        const video2 = document.createElement('video')
        call.on('stream', userVideoStream => {

        })
        call.on('close', () => {
            video2.remove()
        })
        perrs[userId] = call;
    }

    function addVideoStream(video2, stream) {
        video2.srcObject = stream
        video2.addEventListener('loadedmetadata', () => {
            video2.play()
        })
        videoGrid.append(video2)
    }

    document.querySelector('.main__screen_button').innerHTML = `<i class="far fa-caret-square-up"></i><span>You are presenting</span>`;
}


// Socket.io
// With http you can only make a request and server will only reponds
// not start a request but with socket.io you can communicate with others