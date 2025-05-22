const myUsername = prompt("Please enter your name") || "Anonymous";
const url = new URL(`./start_web_socket?username=${myUsername}`, location.href);
url.protocol = url.protocol.replace("http", "ws");
const socket = new WebSocket(url);

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch (data.event) {
    case "update-users":
      updateUserList(data.rooms);
      break;

    case "send-message":
      addMessage(data.username, data.message);
      break;

    case "clear-chat":
      clearChat();
      break;
  }
};

function clearChat() {
  const chatContainer = document.getElementById("conversation");
  chatContainer.innerHTML = "";
}

function updateUserList(rooms) {
  const roomListContainer = document.getElementById("room-list");
  roomListContainer.innerHTML = "";

  rooms.forEach((room) => {
    const roomTitleWrapper = document.createElement("div");
    roomTitleWrapper.style.display = "flex";
    roomTitleWrapper.style.justifyContent = "space-between";
    roomTitleWrapper.style.alignItems = "center";
    roomTitleWrapper.style.marginBottom = "5px";

    const roomTitle = document.createElement("h3");
    roomTitle.textContent = room.roomName;
    roomTitle.style.cursor = "pointer";

    roomTitle.addEventListener("click", () => {
      if (room.members.includes(myUsername)) {
        alert(`Kamu sudah ada di room "${room.roomName}", tidak bisa masuk lagi.`);
        return;
      }

      if (room.roomName === "Public Room") {
        socket.send(JSON.stringify({
          event: "join-room",
          roomName: room.roomName,
          username: myUsername,
        }));
        return;
      }

      const password = prompt(`Masukkan password untuk masuk ke room "${room.roomName}":`);
      if (password === null) {
        alert("Password kosong.");
        return;
      }

      socket.send(JSON.stringify({
        event: "join-room",
        roomName: room.roomName,
        roomPassword: password,
        username: myUsername,
      }));
    });

    // Buat ikon delete
    const deleteIcon = document.createElement("span");
    deleteIcon.className = "delete-room-icon";
    deleteIcon.title = "Delete Room";
    deleteIcon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
      </svg>
    `;

    deleteIcon.style.cursor = "pointer";
    deleteIcon.addEventListener("click", (e) => {
      e.stopPropagation(); // Supaya tidak trigger klik ke room
      if (confirm(`Yakin ingin menghapus room "${room.roomName}"?`)) {
        socket.send(JSON.stringify({
          event: "delete-room",
          roomName: room.roomName,
        }));
      }
    });

    // Gabungkan h3 dan ikon ke dalam wrapper
    roomTitleWrapper.appendChild(roomTitle);
    if (room.roomName !== "Public Room") {
      roomTitleWrapper.appendChild(deleteIcon);
    }

    // Tampilkan wrapper ke dalam daftar room
    roomListContainer.appendChild(roomTitleWrapper);

    // Tampilkan daftar member di dalam room
    const memberList = document.createElement("ul");
    if (room.members.length === 0) {
      const noMember = document.createElement("li");
      noMember.textContent = "(No members)";
      memberList.appendChild(noMember);
    } else {
      room.members.forEach((memberName) => {
        const memberItem = document.createElement("li");
        memberItem.textContent = memberName;
        memberList.appendChild(memberItem);
      });
    }

    roomListContainer.appendChild(memberList);
  });
}

function addMessage(username, message) {
  const template = document.getElementById("message");
  const clone = template.content.cloneNode(true);

  clone.querySelector("span").textContent = username;
  clone.querySelector("p").textContent = message;
  document.getElementById("conversation").prepend(clone);
}

const inputElement = document.getElementById("data");
inputElement.focus();

const form = document.getElementById("form");

form.onsubmit = (e) => {
  e.preventDefault();
  const message = inputElement.value;
  inputElement.value = "";
  socket.send(JSON.stringify({ event: "send-message", message }));
};

const createButton = document.getElementById("create-room-button");
const formContainer = document.getElementById("create-room-form-container");

createButton.addEventListener("click", () => {
  if (formContainer.children.length > 0) return;

  createButton.textContent = "Cancel";

  const form = document.createElement("form");

  form.innerHTML = `
    <input type="text" id="room-name" placeholder="Room name" required />
    <input type="password" id="room-password" placeholder="Password" required />
    <button type="submit">Create</button>
  `;

  formContainer.appendChild(form);

  form.onsubmit = (e) => {
    e.preventDefault();

    const name = document.getElementById("room-name").value;
    const password = document.getElementById("room-password").value;

    socket.send(JSON.stringify({
      event: "create-private-room",
      roomName: name,
      password: password
    }));

    formContainer.innerHTML = "";
    createButton.textContent = "Create Private Room";
  };

  createButton.onclick = () => {
    formContainer.innerHTML = "";
    createButton.textContent = "Create Private Room";

    createButton.onclick = null;
    createButton.addEventListener("click", arguments.callee);
  };
});