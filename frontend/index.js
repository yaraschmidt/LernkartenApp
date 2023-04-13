// ####################################### 1

let HTML_TEMPLATE = "";

const backendAPI = "http://localhost:3000";

// ####################################### 7

// lösen von Karten
function solveCard(cardId, userId, kind){
    const body = {
        "userId" : userId,
        "cardId" : cardId,
        "answerKind" : kind };

    fetch(backendAPI + "/cards/solve",{
        method: "POST",
        headers : {
            'Content-Type': 'application/json'
        },
        body : JSON.stringify(body)
    })
    .then(() => route("learn/" + userId));
}

// löschen von Karte
function deleteCard(cardId){
    fetch(backendAPI + "/cards/" + cardId,{
        method: "DELETE"
    })
    .then(() => route('cards'));
}

// löschen von User
function deleteUser(userId){
    fetch(backendAPI + "/user/" + userId,{
        method : "DELETE"
    })
    .then(() => route('users'));
}

// führt zu passender Seite
function route (target) {
    if(window.location.hash === "#" + target) return window.location.reload();
    window.location.href = "./#" + target;
    // window.location.reload(true);
}

// zeigt Rückseite der Karte
function showBack(){
    const backSide = document.getElementsByClassName("back")[0];
    backSide.style.display = "flex";
}

// ####################################### 1

window.addEventListener("hashchange", func);
window.addEventListener("load", func);

// routing
async function func(){
    const pageSplit = location.hash.slice(1).split("/");
    const contentDiv = document.getElementById("content");
    contentDiv.innerHTML = "";
    
    
    switch (pageSplit[0]) {
        // ####################################### 2
        case "users":
            // holt template und wartet bis Funktionen ausgeführt werden
            await fetch("./templates/users.html")
                .then(resp => resp.text())
                .then(text => {HTML_TEMPLATE = text});


            const userListDiv = document.createElement("div");
            userListDiv.classList.add("list")

            // holt user aus Backend, bringt es in json Format
            fetch(backendAPI + "/user")
                .then(user => user.json())
                // für jeden User holt es sich HTML template aus user.html 
                .then(arr => arr.forEach(user => {
                    let html = HTML_TEMPLATE;

                    // replaced Placeholder aus datei mit aus Backend gefetchten Daten
                    html = html.replace(/%NAME%/g, user["name"]);
                    html = html.replace(/%AGE%/g, user["age"]);
                    html = html.replace(/%COLOR%/g, user["color"]);
                    html = html.replace(/%USERID%/g, user["_id"]);
                    userListDiv.innerHTML += html;
                }));

                // baut restliche UI
                const createUserButton = document.createElement("button");
                createUserButton.onclick = () => route('user');
                createUserButton.innerText = "Create User"
                contentDiv.appendChild(userListDiv);
                contentDiv.appendChild(createUserButton);

            break;
    
        // ####################################### 3
        case "user":
            await fetch("./templates/user.html")
                .then(resp => resp.text())
                .then(text => {HTML_TEMPLATE = text});
            
            const userForm = document.createElement("form");
            
            var html     = HTML_TEMPLATE;
            // schaut, ob User gerade erstellt oder editiert wird
            var isUpdate = pageSplit.length > 1;
            var user = {
                "name" : "",
                "age" : 0,
                "color" : "#ffffff"
            }
            // wenn editiert, dann gib user zurück
            if(isUpdate){
                await fetch(backendAPI + "/user/" + pageSplit[1])
                .then(resp => (resp.ok) ? resp.json() : user )
                .then(u => {user = u});
            }
            
            html = html.replace(/%NAME%/g, user.name);
            html = html.replace(/%AGE%/g, user.age);
            html = html.replace(/%COLOR%/g, user.color);
            html = html.replace(/%USER_ACTION%/g, (isUpdate) ? 'Update User' : 'Create User');
            
            userForm.innerHTML = html;
            userForm.addEventListener("submit", async (e) => {
                // eventlistener, falls user gespeichert wird
                e.preventDefault();
                // speichern von userinformationen
                const body = {
                    _id : pageSplit[1],
                    name : e.target.name.value,
                    age : e.target.age.value,
                    color : e.target.color.value
                };
                // speichert/aktualisiert (je nach anlegen/updaten) User im Backend
                await fetch(backendAPI + "/user/", {
                    method : (isUpdate) ? 'PUT' : 'POST',
                    headers : {
                        'Content-Type': 'application/json'
                    },
                    body : JSON.stringify(body)
                })
                
                // auf userliste zurück routen
                route('users');
            });
            contentDiv.appendChild(userForm);
            // löschfunktion
            document.getElementById("deleteUser").addEventListener('click', () => {
                deleteUser(user._id);
            })

            break;
            
            // ####################################### 4
            case "cards":
                await fetch("./templates/cards.html")
                    .then(resp => resp.text())
                    .then(text => {HTML_TEMPLATE = text});


                const cardListDiv = document.createElement("div");
                cardListDiv.classList.add("list")

                fetch(backendAPI + "/cards")
                    .then(cards => cards.json())
                    .then(arr => arr.forEach(card => {
                        let html = HTML_TEMPLATE;

                        html = html.replace(/%QUESTION%/g, card["question"]);
                        html = html.replace(/%ANSWER%/g, card["answer"]);
                        html = html.replace(/%COLOR%/g, card["color"]);
                        html = html.replace(/%CARDID%/g, card["_id"]);
                        cardListDiv.innerHTML += html;
                    }));

                    const createCardButton = document.createElement("button");
                    createCardButton.innerHTML = "Create Card";
                    createCardButton.onclick = () => route('card');
                    contentDiv.appendChild(cardListDiv);
                    contentDiv.appendChild(createCardButton);

                break;

        // ####################################### 5
        case "card":
            await fetch("./templates/card.html")
            .then(resp => resp.text())
            .then(text => {HTML_TEMPLATE = text});
        
            const cardForm = document.createElement("form");
            
            var html     = HTML_TEMPLATE;
            var isUpdate = pageSplit.length > 1;
            var card = {
                "question" : "",
                "answer" : "",
                "color" : "#ffffff"
            }
            if(isUpdate){
                await fetch(backendAPI + "/cards/" + pageSplit[1])
                .then(resp => (resp.ok) ? resp.json() : card )
                .then(c => {card = c});
            }
            
            html = html.replace(/%QUESTION%/g, card.question);
            html = html.replace(/%ANSWER%/g, card.answer);
            html = html.replace(/%COLOR%/g, card.color);
            html = html.replace(/%CARD_ACTION%/g, (isUpdate) ? 'Update Card' : 'Create Card');
            
            cardForm.innerHTML = html;
            cardForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                const body = {
                    _id : pageSplit[1],
                    question : e.target.question.value,
                    answer : e.target.answer.value,
                    color : e.target.color.value
                };
                console.log(body);
                await fetch(backendAPI + "/cards/", {
                    method : (isUpdate) ? 'PUT' : 'POST',
                    headers : {
                        'Content-Type': 'application/json'
                    },
                    body : JSON.stringify(body)
                })
                
                route('cards');
            });
            contentDiv.appendChild(cardForm);
            break;

        // ####################################### 6
        case "learn":
            if(pageSplit[1]){
                let user;
                // holt user mit id aus path mit pageSplit
                await fetch(backendAPI + "/user/" + pageSplit[1])
                    .then(resp => resp.json())
                    .then(u => {user = u});
                    
                if(user){
                    let card;
                    // holt Karte mit Lösung
                    await fetch(user.links.nextCard.url)
                        .then(resp => resp.json())
                        .then(c => {card = c});
                    if(card._id){
                        // baut Layout der Lösungsseite mit Daten aus learn.html
                        await fetch("./templates/learn.html")
                            .then(resp => resp.text())
                            .then(text => {HTML_TEMPLATE = text});
                        
                        HTML_TEMPLATE = HTML_TEMPLATE.replace(/%QUESTION%/g, card.question);
                        HTML_TEMPLATE = HTML_TEMPLATE.replace(/%ANSWER%/g, card.answer);
                        HTML_TEMPLATE = HTML_TEMPLATE.replace(/%COLOR%/g, card.color);
                        HTML_TEMPLATE = HTML_TEMPLATE.replace(/%CARDID%/g, card._id);
                        HTML_TEMPLATE = HTML_TEMPLATE.replace(/%USERID%/g, user._id);
    
                        contentDiv.innerHTML = HTML_TEMPLATE;
                        break;
                    }
                }
            }

        default:
            break;
    }
}; // ####################################### 1