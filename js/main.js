const toggleThemeBtn = document.querySelector("#toggleTheme");
const themeIcon      = document.querySelector("#themeIcon");

if(localStorage.getItem("theme") === "dark"){
    document.body.classList.add("dark-mode");
    themeIcon.className = "bi bi-sun-fill text-warning";
}

toggleThemeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    if(document.body.classList.contains("dark-mode")){
        localStorage.setItem("theme", "dark");
        themeIcon.className = "bi bi-sun-fill text-warning";
    }else{
        localStorage.setItem("theme", "light");
        themeIcon.className = "bi bi-moon-fill text-primary";
    }
})

const API_URL_RANDOM           = "https://api.thedogapi.com/v1/images/search?limit=4";
const API_URL_FAVORITES        = "https://api.thedogapi.com/v1/favourites?&order=DESC";
const API_URL_FAVORITES_DELETE = "https://api.thedogapi.com/v1/favourites/";
const API_URL_UPLOAD           = "https://api.thedogapi.com/v1/images/upload";

async function loadRandomDogImages(){
    const res = await fetch(API_URL_RANDOM, {
        headers: {
            'X-API-KEY' : API_KEY
        }
    } );
    const divMessage = document.querySelector("#message-random-images");
    divMessage.style.display = "none";
    if(!res.ok){
        const textError = await res.text();
        divMessage.classList = "alert alert-danger";
        divMessage.style.display = "block";
        divMessage.innerHTML = `${textError.status} - ${textError}
        <button type="button" class="btn-close float-end" onclick="this.parentElement.style.display='none'"></button>
        `;
    }else{
        const data = await res.json();
        const randomImageSection = document.querySelector("#random-image-section");
        randomImageSection.innerHTML = "";
        const divRow = document.createElement("div");
        divRow.classList = "row";

        data.forEach((dog)=> {
            const divColumn = document.createElement("div");
            divColumn.classList = "col-12 col-xl-3 mx-auto mb-2";

            const divCard = document.createElement("div");
            divCard.classList = "card shadow p-3";

            const article = document.createElement("article");

            const img = document.createElement("img");
            img.classList = "rounded skeleton";
            img.alt = dog.id;

            img.onload = () => {
                img.classList.remove("skeleton");
            }
            img.src = dog.url;

            const button = document.createElement("button");
            button.classList = "btn btn-outline-success mt-3";
            button.innerText = `Save dog to favorites`;
            button.onclick = () => saveFavoriteDog(dog.id);

            article.appendChild(img);
            article.appendChild(button);
            divCard.appendChild(article);
            divColumn.appendChild(divCard);

            divRow.appendChild(divColumn);
            randomImageSection.append(divRow);
        });
    }
}
const uploadForm = document.querySelector("#upload-form");
uploadForm.addEventListener("submit", async function(e){
    e.preventDefault();
    const formdata = new FormData(uploadForm);
    const res = await fetch(API_URL_UPLOAD,{
        method: "POST",
        headers: {
            'X-API-KEY': API_KEY
        },
        body: formdata
    });
    const divMessage = document.querySelector("#upload-message");
    divMessage.style.display = "none";
    if(!res.ok){
        const textError = await res.text();
        divMessage.classList = "alert alert-danger";
        divMessage.style.display = "block";
        divMessage.innerHTML = `${res.status} - ${textError}
        <button type="button" class="btn-close float-end" onclick="this.parentElement.style.display='none'"></button>
        `;
    }else{
        const data = await res.json();
        uploadForm.reset();
        divMessage.classList = "alert alert-success";
        divMessage.style.display = "block";
        divMessage.innerHTML = `dog uploaded!
        <button type="button" class="btn-close float-end" onclick="this.parentElement.style.display='none'"></button>
        `;
        console.log(data);
        saveFavoriteDog(data.id);
    }
    setTimeout(() => {
        divMessage.style.display = "none";
    }, 15000);
}); 
async function saveFavoriteDog(dogId) {
  const res = await fetch(API_URL_FAVORITES,{
    method:'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': API_KEY
    },
    body: JSON.stringify({image_id:dogId})
  });

  const divMessage = document.querySelector("#message-random-images");
  divMessage.style.display = "none";

  if(!res.ok){
    const textError = await res.text();
    divMessage.classList = "alert alert-danger";
    divMessage.style.display = "block";
    divMessage.innerHTML = `${res.status} - ${textError}
    <button type="button" class="btn-close float-end" onclick="this.parentElement.style.display='none'"></button>
    `;
  }else{
    const data = await res.json();
    if(data.message === "SUCCESS"){
        divMessage.classList = "alert alert-success";
        divMessage.style.display = "block";
        divMessage.innerHTML = `dog added to favorites! 
        <button type="button" class="btn-close float-end" onclick="this.parentElement.style.display='none'"></button>
        `;
        loadFavoriteDogImages();
    }

    setTimeout(()=>{
        divMessage.style.display = "none";
    }, 5000);
  }

}

let allFavorites = [];
let currentIndex = 0;
const pageSize = 4;

async function loadFavoriteDogImages(){
    const res = await fetch(API_URL_FAVORITES,{
        headers: {
            'X-API-KEY': API_KEY
        }
    });

    const divMessage = document.querySelector("#message-favorite-dogs"); 
    divMessage.style.display = "none";
    if(!res.ok){
        const textError = await res.text();
        divMessage.classList = "alert alert-danger";
        divMessage.style.display = "block";
        divMessage.innerHTML = `${res.status} - ${textError}
        <button type="button" class="btn-close float-end" onclick="this.parentElement.style.display='none'"></button>`;
    }else{
        const data = await res.json();
        if (data.length !== 0) {
          allFavorites = data;
          currentIndex = 0;

          const favoriteImageSection = document.querySelector("#favorite-image-section");
          favoriteImageSection.innerHTML = "";

          const divRow = document.createElement("div");
          divRow.classList = "row";
          divRow.id = "favorites-row";
          favoriteImageSection.appendChild(divRow);

          renderNextFavorites();
        } else {
          divMessage.style.display = "block";
          divMessage.classList = "alert alert-danger";
          divMessage.innerHTML =
            "You don't have added your favorite dogs. You can do it now!";
          favoriteImageSection.append(h6);
        }  
    }
}
function renderNextFavorites(){
    const divRow = document.getElementById("favorites-row");
    const nextItems = allFavorites.slice(currentIndex, currentIndex + pageSize);

    nextItems.forEach((dogFavorite) => {
        const divColumn = document.createElement("div");
        divColumn.classList = "col-12 col-xl-3 mx-auto mb-3";

        const divCard = document.createElement("div");
        divCard.classList = "card shadow p-3";

        const article = document.createElement("article");
        const img = document.createElement("img");
        img.alt = dogFavorite.id;
        img.classList = "rounded skeleton";
        img.onload = () => img.classList.remove("skeleton");
        img.src = dogFavorite.image.url;

        const button = document.createElement("button");
        button.classList = "btn btn-outline-danger mt-3";
        button.innerHTML = `Remove dog of favorites`;
        button.onclick = () => deleteDogOfFavorites(dogFavorite.id);

        article.appendChild(img);
        article.appendChild(button);
        divCard.appendChild(article);
        divColumn.appendChild(divCard);
        divRow.appendChild(divColumn);
    });
    currentIndex += pageSize;
}
const observer = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    if(currentIndex < allFavorites.length){
        renderNextFavorites();
    }
  }
});
observer.observe(document.getElementById("sentinel"));
async function deleteDogOfFavorites(dogId){
    const res = await fetch(`${API_URL_FAVORITES_DELETE}${dogId}`, {
      method: "DELETE",
      headers: {
        "X-API-KEY": API_KEY,
      },
    });
    const divMessage = document.querySelector("#message-favorite-dogs");
    divMessage.style.display = "none";
    if(!res.ok){
        const textError = await res.text();
        divMessage.classList = "alert alert-danger";
        divMessage.style.display = "block";
        divMessage.innerHTML = `${res.status} - ${textError}
        <button type="button" class="btn-close float-end" onclick="this.parentElement.style.display='none'"></button>
        `;
    }else{
        const data = await res.json();
        console.log(data);
        if (data.message === "SUCCESS") {
            divMessage.classList = "alert alert-success";
            divMessage.style.display = "block";
            divMessage.innerHTML = `Dog deleted! <button type="button" class="btn-close float-end" onclick="this.parentElement.style.display='none'"></button>`;
            loadFavoriteDogImages();
        }
        setTimeout(() => {
          divMessage.style.display = "none";
        }, 5000);
    }
}
loadFavoriteDogImages();
loadRandomDogImages();