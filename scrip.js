"use strict";

const btnRepos = document.querySelector("#btnRepos"),
  search = document.querySelector(".search"),
  divResult = document.querySelector(".repos__container"),
  rightContainer = document.querySelector(".right__container"),
  btnsContainer = document.querySelector(".btns__container");

let counter = 1;
//адреса страниц
const baseUrl = "https://api.github.com/search/repositories?q=",
  quantityOfRepos = "&per_page=10",
  popularUrl = "https://api.github.com/search/repositories?q=stars:>100000",
  basePageUrl = "&page=",
  firstPage = "1";

const cleanAll = () => {
  btnsContainer.innerHTML = "";
  rightContainer.innerHTML = "";
  divResult.innerHTML = "";
};

btnRepos.addEventListener("click", (url) => getRepos());

let save = [];

const dataUpdate = function () {
  localStorage.setItem("saveData", JSON.stringify(save));
};

if (localStorage.getItem("saveData")) {
  save = JSON.parse(localStorage.getItem("saveData"));
 
    counter = save[2];
  
  getRepos(save[0], save[1]);
}

async function getRepos(url = baseUrl, searchstring,flag) {


  if(searchstring===undefined){
  counter=1;
  save[2]=counter;
  dataUpdate();
}

  divResult.innerHTML = "";
  let value = search.value;
  if (searchstring !== undefined&&flag===undefined) {
    value = searchstring;

    search.value = searchstring;
  } else save[1] = value;

  if (url === baseUrl) {
    url = baseUrl + value + quantityOfRepos + basePageUrl + firstPage;
  }

  if (value === "") {
    counter = 1;

    url = popularUrl;
  }
  save[0] = url;
  save[2] = counter;
  dataUpdate();
  cleanAll();

  const headers = {
    Accept: "application/vnd.github.mercy-preview+json",
  };
  const response = await fetch(url, {
    method: "GET",
    headers: headers,
  });

  if (value !== "") {
    let maxPages = 10,
      //url без указания страницы и с учетом завпроса
      urlNew = baseUrl + value + quantityOfRepos + basePageUrl,
      link = response.headers.get("link"),
      linkMax = "";

    const cleanNavAndPag = () => {
      btnsContainer.innerHTML = "";
    };

    const currentLinkMAx = () => {
      if (link.includes("next")) {
        linkMax = link.split("next")[1].split("page=")[2].replace(/\D+/g, "");
      } else {
        linkMax = link.split("prev")[0].split("page=")[2].replace(/\D+/g, "");
        linkMax = +linkMax;
        linkMax += +1;
      }
      if (linkMax < 10) {
        maxPages = linkMax;
      }
    };

    //вся навигация и пагинация
    const navAndPag = () => {
      const btnPrev = document.createElement("button");
      btnPrev.textContent = "<";
      btnPrev.addEventListener("click", (e) => {
        counter--;
        if (counter < 1) {
          counter = 1;
          save[2] = counter;
          dataUpdate();
        }
        let urlPrev = urlNew + counter;
        getRepos(urlPrev,"false","false");
      });
      btnsContainer.append(btnPrev);

      const pagesContainer = document.createElement("span");
      btnsContainer.append(pagesContainer);

      for (let i = 1; i <= maxPages; i++) {
        const btn = document.createElement("span");
        if (i <= 5) {
          btn.textContent = i;
          btn.classList.add("page");
          pagesContainer.append(btn);
        }
        if (i === +counter) {
          btn.classList.add("active-page");
        }
      }

      if (counter > 5) {
        pagesContainer.innerHTML = "";
        for (let i = 6; i <= maxPages; i++) {
          const btn = document.createElement("span");
          btn.textContent = i;
          btn.classList.add("page");
          pagesContainer.append(btn);
          if (i === +counter) {
            btn.classList.add("active-page");
          }

        }
      }

      const btnNext = document.createElement("button");
      btnNext.textContent = ">";
      btnNext.addEventListener("click", (e) => {
        counter++;
        if (counter >= maxPages) {
          counter = maxPages;
        }
        let urlNext = urlNew + counter;
        getRepos(urlNext,"false","false");
        save[2] = counter;
        dataUpdate();
      });
      btnsContainer.append(btnNext);
      //переход по страницам при клике на них
      pagesContainer.addEventListener("click", () => {
        let target = event.target;
        if (target.closest(".page")) {
          counter = +target.textContent;
          let urlPage = urlNew + target.textContent;
          getRepos(urlPage,"false","false");
          target.classList.add("active-page");
        }
      });
    };

    cleanNavAndPag();
    currentLinkMAx();
    navAndPag();
  }

  const result = await response.json();

  //10 самых популярных
  if (value === "") {
    result.items = result.items.slice(0, 10);
  }
  result.items.forEach((item) => {
    const anchor = document.createElement("li");
    anchor.classList.add("repos__href");
    anchor.textContent = item.name;
    divResult.append(anchor);
  });

  //карта товара
  const allHrf = document.querySelectorAll(".repos__href"),
    card = document.createElement("div");
  allHrf.forEach((elem) => {
    if (elem.innerHTML === save[4]) {
      elem.classList.add("repos__href-active");
    } else {
      elem.classList.remove("repos__href-active");
    }
  });
  if (save[3] !== undefined) {
    card.innerHTML = save[3];
  }
  card.classList.add("repos__card");
  rightContainer.append(card);
  divResult.addEventListener("click", () => {
    let target = event.target;

    allHrf.forEach((elem) => {
      if (elem === target) {
        save[4] = elem.innerHTML;
        dataUpdate();
        elem.classList.add("repos__href-active");
      } else {
        elem.classList.remove("repos__href-active");
      }
    });

    result.items.forEach((elem) => {
      if (elem.name === target.textContent) {
        let contrArr = [];

        let title = "   <p class='card__title'>Карта репозитория</p> ",
          elemName = "<p class='card__title'>" + "" + elem.name + "</p>",
          stars =
            "<p>" + "колическтво звезд: " + elem.stargazers_count + "</p>",
          lastCommit = "<p>" + "последний коммит: " + elem.pushed_at + "</p>",
          img =
            "<img class= 'repos__avatar' src='" +
            elem.owner.avatar_url +
            "' alt='avatar'>",
          nameHref =
            "<a href='" +
            elem.owner.html_url +
            "'>" +
            elem.owner.login +
            "</a>",
          languages = "",
          description = "<p>" + elem.description + "</p>";

        if (elem.language === null) {
          languages = "<p>" + "язык не указан" + "</p>";
        } else {
          languages = "<p>" + elem.language + "</p>";
        }

        async function getContributors() {
          let urlContributors = elem.contributors_url;

          const responseContributors = await fetch(urlContributors);
          let resultContributors = await responseContributors.json();

          resultContributors = resultContributors.slice(0, 10);
          resultContributors.forEach((elem) => {
            contrArr.push(elem.login);
          });
          let contributors = "<p class='contributors__title'>Авторы</p>";

          contrArr.forEach((e) => {
            contributors += "<p class='contributors'>" + e + "</p>";
          });

          card.innerHTML =
            title +
            elemName +
            stars +
            lastCommit +
            img +
            nameHref +
            languages +
            description +
            contributors;
          save[3] = card.innerHTML;
          save[2] = counter;
          dataUpdate();
        }

        getContributors();
      }
    });

    save[2] = counter;
    dataUpdate();
  });
}
