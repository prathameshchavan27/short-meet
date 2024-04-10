let form = document.getElementById('newRoomForm')
let displayName = sessionStorage.getItem('display_name')
if(displayName){
    form.name.value = displayName
}

form.addEventListener('submit', (e)=>{
    e.preventDefault();
    sessionStorage.setItem('display_name',e.target.hostName.value)
    let inviteCode = e.target.roomId.value;
    if(!inviteCode){
        inviteCode = String(Math.floor(Math.random()*10000))
    }
    window.location = `room.html?room=${inviteCode}`
})