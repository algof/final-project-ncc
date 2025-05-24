const myUsername = localStorage.getItem("username");
let myRoomName = 'Public Room';
let optionCounter = 1;

if (!myUsername) {
  alert("You must login first.");
  window.location.href = "/public/login.html";
} else {
  document.getElementById("username-display").textContent = `Hello, ${myUsername}!`;
}

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

    case "update-room-name":
      myRoomName = data.roomName;
      updateRoomName();
      break;

    case "send-polling":
      // renderIncomingPoll(data);
      break;
  }
};

// function renderIncomingPoll(data) {
//   // Buat objek pollData baru dari data socket
//   const pollDataSocket = {
//     id: `poll-${Date.now()}`, // ID unik agar tidak bentrok
//     question: data.question,
//     options: data.choices.map((choice, idx) => ({
//       id: `opt-${idx}`,
//       text: choice,
//       votes: 0
//     })),
//     userHasVoted: false,
//     userChoiceId: null
//   };

//   // Simpan ke localStorage agar bisa persist per user
//   localStorage.setItem(`poll_data_${pollDataSocket.id}`, JSON.stringify(pollDataSocket));

//   // Buat container elemen polling
//   // const chatContainer = document.getElementById("chat-box"); // Ganti dengan container chat kamu
//   const chatContainer = document.getElementById("conversation");
//   const pollWrapper = document.createElement("div");
//   pollWrapper.classList.add("my-4", "poll-box");

//   // Inject template polling dari yang sudah kamu buat
//   const pollContainerTemplate = document.getElementById("poll-container-template");
//   const pollOptionTemplate = document.getElementById("poll-option-template");
//   const pollContainerNode = pollContainerTemplate.content.cloneNode(true); // pollContainerTemplate adalah null
//   // ... dan ...
//   const optionNode = pollOptionTemplate.content.cloneNode(true); // pollOptionTemplate adalah null

//   // Render polling manual (pakai fungsi render khusus)
//   renderPollInline(pollDataSocket, pollWrapper, pollContainerNode, optionNode);

//   // Tambahkan ke chat
//   chatContainer.appendChild(pollWrapper);
// }

// function renderPollInline(data, container, pollContainerTemplate, pollOptionTemplate) {
//   const pollContainerNode = pollContainerTemplate.content.cloneNode(true);
//   const pollWrapper = pollContainerNode.querySelector('.poll-wrapper');
//   pollWrapper.dataset.pollId = data.id;
//   pollWrapper.querySelector('.poll-question').textContent = data.question;
//   const optionsContainer = pollWrapper.querySelector('.poll-options-container');

//   data.options.forEach(option => {
//     const optionNode = pollOptionTemplate.content.cloneNode(true);
//     const optionDiv = optionNode.querySelector('.poll-option');
//     optionDiv.dataset.optionId = option.id;
//     optionDiv.querySelector('.option-text').textContent = option.text;

//     const voteHandler = () => {
//       // voting handler untuk polling dari socket
//       if (!data.userHasVoted || data.userChoiceId !== option.id) {
//         if (data.userHasVoted && data.userChoiceId !== null) {
//           const prevOpt = data.options.find(opt => opt.id === data.userChoiceId);
//           if (prevOpt) prevOpt.votes = Math.max(0, prevOpt.votes - 1);
//         }
//         option.votes++;
//         data.userChoiceId = option.id;
//         data.userHasVoted = true;

//         localStorage.setItem(`poll_data_${data.id}`, JSON.stringify(data));
//         updateAllOptionDisplaysSocket(pollWrapper, data);
//         updateFeedbackMessageSocket(pollWrapper, data);
//         updateTotalVotesDisplaySocket(pollWrapper, data);
//       }
//     };

//     optionDiv.addEventListener('click', voteHandler);
//     optionDiv.addEventListener('keydown', (e) => {
//       if (e.key === 'Enter' || e.key === ' ') {
//         e.preventDefault();
//         voteHandler();
//       }
//     });

//     optionsContainer.appendChild(optionNode);
//   });

//   container.appendChild(pollContainerNode);

//   updateAllOptionDisplaysSocket(pollWrapper, data);
//   updateFeedbackMessageSocket(pollWrapper, data);
//   updateTotalVotesDisplaySocket(pollWrapper, data);
// }

// function updateAllOptionDisplaysSocket(pollWrapperElement, data) {
//   const optionElements = pollWrapperElement.querySelectorAll('.poll-option');
//   const totalVotes = data.options.reduce((sum, opt) => sum + opt.votes, 0);

//   optionElements.forEach(optElement => {
//     const optionId = optElement.dataset.optionId;
//     const optionData = data.options.find(o => o.id === optionId);
//     if (!optionData) return;

//     const votesCountEl = optElement.querySelector('.option-votes-count');
//     const percentageEl = optElement.querySelector('.option-percentage');
//     const resultBarEl = optElement.querySelector('.result-bar');
//     const resultBarWrapperEl = optElement.querySelector('.result-bar-wrapper');

//     optElement.classList.remove('border-l-4', 'border-green-500');

//     if (data.userHasVoted) {
//       votesCountEl.textContent = `${optionData.votes} vote${optionData.votes === 1 ? '' : 's'}`;
//       votesCountEl.style.display = 'inline';
//       const percentage = totalVotes > 0 ? ((optionData.votes / totalVotes) * 100) : 0;
//       percentageEl.textContent = `${percentage.toFixed(1)}%`;
//       resultBarEl.style.width = `${percentage}%`;
//       resultBarWrapperEl.style.display = 'block';

//       if (optionData.id === data.userChoiceId) {
//         optElement.classList.add('border-l-4', 'border-green-500');
//       }
//     } else {
//       votesCountEl.style.display = 'none';
//       resultBarWrapperEl.style.display = 'none';
//     }
//   });
// }

// function updateFeedbackMessageSocket(pollWrapperElement, data) {
//   const feedbackEl = pollWrapperElement.querySelector('.poll-feedback');
//   if (data.userHasVoted) {
//     feedbackEl.textContent = "Anda telah memilih. Klik opsi lain untuk mengubah pilihan Anda.";
//     feedbackEl.style.display = 'block';
//   } else {
//     feedbackEl.style.display = 'none';
//   }
// }

// function updateTotalVotesDisplaySocket(pollWrapperElement, data) {
//   const totalVotes = data.options.reduce((sum, opt) => sum + opt.votes, 0);
//   const totalVotesDisplay = pollWrapperElement.querySelector('.poll-total-votes');
//   if (totalVotesDisplay) {
//     totalVotesDisplay.textContent = `Total votes: ${totalVotes}`;
//   }
// }

function updateRoomName() {
  const userRoomNameContainer = document.getElementById('current-room-name');
  userRoomNameContainer.textContent = `${myRoomName}`;
}

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
    roomTitleWrapper.style.marginBottom = "0px";

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

  const conversationDiv = document.getElementById("conversation");
  conversationDiv.append(clone);

  conversationDiv.scrollTop = conversationDiv.scrollHeight;
}

const inputElement = document.getElementById("data");
inputElement.focus();

const form = document.getElementById("form");

form.onsubmit = (e) => {
  e.preventDefault();
  const message = inputElement.value;
  if (message === "") {
    return;
  }
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
    <label for="room-name" class="block text-sm font-medium text-gray-700 sr-only">Room name</label>
    <input 
      type="text" 
      id="room-name" 
      name="room-name"
      placeholder="Room name" 
      required 
      class="w-full m-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
    />
    <label for="room-password" class="block text-sm font-medium text-gray-700 sr-only">Password</label>
    <input 
      type="password" 
      id="room-password" 
      name="room-password"
      placeholder="Password" 
      required 
      class="w-full m-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
    />
  <button 
    type="submit" 
    class="w-full m-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150"
  >
    Create
  </button>
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

const logoutButton = document.getElementById('logoutButton');

logoutButton.addEventListener('click', function () {
  localStorage.clear();
  alert('Logout Successful');
  window.location.href = "/public/login.html";
});

document.getElementById("create-polling-button").addEventListener('click', () => {
  document.getElementById("create-polling-modal").classList.remove("hidden");
});

function createPollingOption() {
  if (optionCounter >= 10) return;

  optionCounter++;

  const input = document.createElement("input");
  input.type = "text";
  input.id = `polling-option-${optionCounter}`;
  input.placeholder = "+ Add option";
  input.classList.add(
    "bg-gray-50",
    "border",
    "border-gray-300",
    "text-gray-900",
    "text-sm",
    "rounded-lg",
    "focus:ring-blue-500",
    "focus:border-blue-500",
    "block",
    "w-full",
    "p-2.5",
    "dark:bg-gray-600",
    "dark:border-gray-500",
    "dark:placeholder-gray-400",
    "dark:text-white"
  );

  // Buang listener dari input sebelumnya (biar cuma satu yang bisa nambah)
  const inputs = document.querySelectorAll('[id^="polling-option-"]');
  inputs.forEach(input => {
    input.removeEventListener("focus", createPollingOption);
  });

  // Tambahkan input ke DOM
  document.getElementById("polling-options-container").appendChild(input);

  // Tambahkan event listener hanya ke input terakhir
  input.addEventListener("focus", createPollingOption);
}

// Saat tombol "Create Polling" diklik, reset polling option
document.getElementById("create-polling-button").addEventListener('click', () => {
  document.getElementById("create-polling-modal").classList.remove("hidden");

  optionCounter = 1;

  const container = document.getElementById("polling-options-container");
  container.innerHTML = "";

  // Buat input pertama
  const firstInput = document.createElement("input");
  firstInput.type = "text";
  firstInput.id = `polling-option-${optionCounter}`;
  firstInput.placeholder = "+ Add option";
  firstInput.classList.add(
    "bg-gray-50",
    "border",
    "border-gray-300",
    "text-gray-900",
    "text-sm",
    "rounded-lg",
    "focus:ring-blue-500",
    "focus:border-blue-500",
    "block",
    "w-full",
    "p-2.5",
    "dark:bg-gray-600",
    "dark:border-gray-500",
    "dark:placeholder-gray-400",
    "dark:text-white"
  );

  // Tambahkan ke container
  container.appendChild(firstInput);

  // Tambahkan event listener hanya ke input pertama
  firstInput.addEventListener("focus", createPollingOption);
});

// Tombol tutup polling
document.getElementById("start-polling-button").addEventListener('click', () => {
  let tempChoices = [];
  let i = 1;

  while (true) {
    let optionPointer = document.getElementById(`polling-option-${i}`);
    if (optionPointer) {
      let val = optionPointer.value.trim();
      if (val) tempChoices.push(val);
      i++;
    } else {
      break;
    }
  }

  let pollingQuestionElem = document.getElementById("polling-question");
  let pollingQuestion = pollingQuestionElem ? pollingQuestionElem.value.trim() : "";

  if (!pollingQuestion) {
    alert("Pertanyaan polling tidak boleh kosong!");
    return;
  }

  if (tempChoices.length === 0) {
    alert("Harap isi minimal satu pilihan polling.");
    return;
  }

  if (socket.readyState !== WebSocket.OPEN) {
    alert("Koneksi WebSocket belum siap. Coba lagi nanti.");
    return;
  }

  console.log("Polling to send:", { pollingQuestion, tempChoices });

  socket.send(JSON.stringify({
    event: "create-new-polling",
    username: myUsername,
    question: pollingQuestion,
    choices: tempChoices,
  }));

  document.getElementById("create-polling-modal").classList.add("hidden");
});


document.getElementById("cancel-create-polling-button").addEventListener('click', () => {
  document.getElementById("create-polling-modal").classList.add("hidden");
});
