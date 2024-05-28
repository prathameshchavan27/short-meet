const APP_ID="60295049de27496ca83b1fc283d26547"

let uid = sessionStorage.getItem('uid');
if(!uid){
    uid = String(Math.floor(Math.random()*10000))
    sessionStorage.setItem('uid',uid)
}

let token = null;
let client;

let rtmClient;
let channel;

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let roomId = urlParams.get('room')

if(!roomId){
    roomId = 'main'
}

let displayName = sessionStorage.getItem('display_name')
if(!displayName){
   window.location ='lobby.html' 
}

let localTracks = []
let remoteUsers = {}

let localScreenTracks;
let sharingScreen = false;

let joinRoomInit = async () => {
    rtmClient = await AgoraRTM.createInstance(APP_ID)
    await rtmClient.login({uid,token})
    await rtmClient.addOrUpdateLocalUserAttributes({'name':displayName})
    channel = await rtmClient.createChannel(roomId)
    await channel.join();
    channel.on('MemberJoined',handleMemberJoined)
    channel.on('MemberLeft', handleMemberLeft)
    channel.on('ChannelMessage', handleChannelMessage)
    getMembers()
    addBotMessageToDom(`Welcome to the room ${displayName}! 👋`)
    client = AgoraRTC.createClient({mode:'rtc', codec: 'vp8'});
    await client.join(APP_ID,roomId,token,uid)
    await client.on('user-published',handleUserPublished)
    await client.on('user-left',handleUserLeft)
    joinStream();
}

let joinStream = async () => {
    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks({},{encoderConfig:{
        width:{min:640, ideal:1920, max:1920},
        height:{min:480, ideal:1080, max:1080}
    }});
    let player = `<div class="video__container" id="user-container-${uid}">
                    <div class="video-player" id="user-${uid}"></div>
                </div>`
    document.getElementById('streams__container').insertAdjacentHTML('beforeend',player);
    document.getElementById(`user-container-${uid}`).addEventListener('click', expandVideoFrame);
    localTracks[1].play(`user-${uid}`)
    await client.publish([localTracks[0], localTracks[1]])
}

let switchToCamera = async () => {
    let player = `<div class="video__container" id="user-container-${uid}">
                    <div class="video-player" id="user-${uid}"></div>
                </div>`
    displayFrame.insertAdjacentHTML('beforeend',player);
    await localTracks[0].setMuted(true);
    await localTracks[1].setMuted(true);
    document.getElementById('mic-btn').classList.remove('active');
    document.getElementById('screen-btn').classList.remove('active');
    localTracks[1].play(`user-${uid}`)
    await client.publish([localTracks[1]])
}

let handleUserPublished = async (user, mediaType) => {
    remoteUsers[user.uid] = user
    await client.subscribe(user, mediaType)
    let player = document.getElementById(`user-container-${user.uid}`)
    if(player===null){
        player = `<div class="video__container" id="user-container-${user.uid}">
                        <div class="video-player" id="user-${user.uid}"></div>
                    </div>`
        document.getElementById('streams__container').insertAdjacentHTML('beforeend',player);
        document.getElementById(`user-container-${user.uid}`).addEventListener('click', expandVideoFrame);
    }
    if(displayFrame.style.display){
        let videoFrame = document.getElementById(`user-container-${user.uid}`)
        videoFrame.style.height = '100px';
        videoFrame.style.width = '150px';
    }
    if(mediaType==='video'){
        user.videoTrack.play(`user-${user.uid}`)
    }
    if(mediaType==='audio'){
        user.audioTrack.play()
    }
}

let handleUserLeft = async (user) => {
    delete remoteUsers[user.uid]
    let item = document.getElementById(`user-container-${user.uid}`);
    if(item){
        item.remove();
    }
    if(userIdInDisplayFrame===`user-container-${user.uid}`){
        displayFrame.style.display = null
        let videoFrames = document.getElementsByClassName( 'video__container');
        for(let i=0;i<videoFrames.length;i++){
            videoFrames[i].style.height = '200px';
            videoFrames[i].style.width = '300px';
        }
    }
}

let toggleMic = async (e) => {
    let button = e.currentTarget
    if(localTracks[0].muted){
        await localTracks[0].setMuted(false)
        button.classList.add('active')
    }else{
        await localTracks[0].setMuted(true)
        button.classList.remove('active')
    }
}


let toggleCamera = async (e) => {
    let button = e.currentTarget
    if(localTracks[1].muted){
        await localTracks[1].setMuted(false)
        button.classList.add('active')
    }else{
        await localTracks[1].setMuted(true)
        button.classList.remove('active')
    }
}

let toggleScreen = async (e) => {
    let screenButton = e.currentTarget;
    let cameraButton = document.getElementById('camera-btn');
    if(!sharingScreen){
        sharingScreen = true;
        screenButton.classList.add('active');
        cameraButton.classList.remove('active');
        cameraButton.style.display = 'none'
        localScreenTracks = await AgoraRTC.createScreenVideoTrack()
        document.getElementById(`user-container-${uid}`).remove();
        displayFrame.style.display = 'block'
        let player = `<div class="video__container" id="user-container-${uid}">
                    <div class="video-player" id="user-${uid}"></div>
                </div>`
        displayFrame.insertAdjacentHTML('beforeend', player)
        document.getElementById(`user-container-${uid}`).addEventListener('click',expandVideoFrame)
        userIdInDisplayFrame = `user-container-${uid}`
        localScreenTracks.play(`user-${uid}`)
        await client.unpublish([localTracks[1]])
        await client.publish([localScreenTracks])
        let videoFrames = document.getElementsByClassName('video__container')
        for(let i=0;i<videoFrames.length;i++){
            if(videoFrames[i].id!==userIdInDisplayFrame){
              videoFrames[i].style.height = '100px'
              videoFrames[i].style.width = '150px'
            }
        }
    }else{
        sharingScreen = false;
        cameraButton.style.display = 'block'
        document.getElementById(`user-container-${uid}`).remove();
        await client.unpublish([localScreenTracks]);
        switchToCamera(); 
    }
}

let leaveStream = async (e) => {
    e.preventDefault();
    // window.close();
    let participants = await channel.getMembers();
    console.log("participants****->>>>>>>>>",participants);
    let roomDetails = JSON.parse(sessionStorage.getItem('room'));
    
    console.log(roomDetails);
    if(participants.length==1){
        var apiUrl = `https://short-meet-server.onrender.com/room/${roomDetails.roomId}`;

        // Use fetch to send a DELETE request to the API
        try {
            const response = await fetch(apiUrl, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    // Add any other headers if needed, such as authorization tokens
                }
            });
            console.log(response);
            sessionStorage.clear();
            window.location = `home.html`;
        } catch (error) {
            console.log(error);
        }
       
    }
    document.getElementsByClassName('stream__actions')[0].style.display = 'none';
    for(let i=0;i<localTracks.length;i++){
        localTracks[i].stop();
        localTracks[i].close();
    }
    await client.unpublish([localTracks[0], localTracks[1]])
    if(localScreenTracks){
        await client.unpublish([localScreenTracks])
    }
    document.getElementById(`user-container-${uid}`).remove()
    if(userIdInDisplayFrame === `user-container-${uid}`){
        displayFrame.style.display = null;
        for(let i=0;i<videoFrames.length;i++){
            videoFrames[i].style.height = '200px';
            videoFrames[i].style.width = '300px';
        }
    }
    channel.sendMessage({text:JSON.stringify({'type':'user_left','uid':uid})})
    window.location = `home.html`
}

const invite = () => {
    var subject= "Invite to join meeting";
    var body = "Join with credentials, roomId:  ";
    body += roomId;
    body += " password: "
    let room = JSON.parse(sessionStorage.getItem('room'));
    console.log(room);
    body += room.password
    // body += window.location.href;
    // body += ">";
    var uri = "mailto:?subject=";
    uri += encodeURIComponent(subject);
    uri += "&body=";
    uri += encodeURIComponent(body);
    window.open(uri);
}

document.getElementById('mic-btn').addEventListener('click',toggleMic)
document.getElementById('camera-btn').addEventListener('click',toggleCamera)
document.getElementById('screen-btn').addEventListener('click',toggleScreen)
document.getElementById('leave-btn').addEventListener('click',leaveStream)
document.getElementById('invite').addEventListener('click',invite)

joinRoomInit();