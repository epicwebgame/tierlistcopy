let maincont;
let ships;
let changelog;
let identid;
let identmain;
let language;
let languageid;
let changeloglastupdatedate;
let namearr = [];

async function langcookieread() {
  let cookieread = Cookies.get('language')
  return cookieread
}

function changelognotify() {
  if (Cookies.get('changelog') == undefined || Cookies.get('changelog') != changeloglastupdatedate) {
    document.getElementsByClassName("notification")[0].style.display = "block"
  }
}

async function setcookie(a1) {
  Cookies.set('language', a1, {
    expires: 365
  })
}

async function setcookieghost(a1) {
  let str = a1.replace("lang", "")
  Cookies.set('language', str, {
    expires: 365
  })
  languageid = str
}

function scrollwidth() {
  if (window.scrollX <= 5000) {
    document.querySelector(".topbanner").style.left = window.scrollX + "px"
    document.querySelector(".bannertwo").style.left = window.scrollX + "px"
  }
}

function getfilterbuttons() {
  document.querySelectorAll('.filterbtn:not([type=text]').forEach(btn1 => {
    btn1.addEventListener('click', () => {
      if (btn1.className.includes("active")) {
        btn1.className = "filterbtn";
      } else {
        btn1.className = "filterbtn active";
      }

      if (btn1.getAttribute("value") === "all") {
        btn1.parentNode.querySelectorAll('.filterbtn').forEach(btn2 => {
          btn2.className = "filterbtn";
        });
        btn1.className = "filterbtn active";
      } else {
        btn1.parentNode.querySelectorAll('.filterbtn[value=all]').forEach(btn2 => {
          btn2.className = "filterbtn";
        });
      }

      if (btn1.parentNode.querySelectorAll('.filterbtn.active:not([value=all])').length == 0) {
        btn1.parentNode.querySelectorAll('.filterbtn[value=all]').forEach(btn2 => {
          btn2.className = "filterbtn active";
        });
      }
    });
  });
}

function getnamesarr() {
  namearr = []
  for (let hull in ships) {
    let tier = ships[hull];

    for (let hulltier in tier) {
      let fullstr = tier[hulltier];

      fullstr.forEach((ship) => {
        namearr.push(ship.names[languageid])
      });
    }
  }
}

async function createfilters(a1) {
  let filterobj = {};
  let activefilters = document.querySelectorAll('.filterbtn.active');

  activefilters.forEach(e => {
    let filtername = e.getAttribute("filtername");
    let filtervalue = e.getAttribute("value");

    if (filtervalue === null) {
      filtervalue = e.value;
    }

    if (filtervalue === "") {
      filtervalue = "all";
    }

    if (filtervalue !== "all") {
      if (filtername === "name" && filtervalue.length !== 0) {
        filterobj[filtername] = filtervalue;
      } else {
        if (!(filtername in filterobj) && filtername !== "name") {
          filterobj[filtername] = []
        }
        filterobj[filtername].push(filtervalue);
      }
    }
  });

  let returnedfilter = await filterships(filterobj);
  await buildhtmlmain(returnedfilter);
  if (a1 != true) {
    const filters = document.querySelectorAll('.filter.active')
    filters.forEach(filter => {
      closeFilter(filter)
    })
  }
}

async function resetfilters() {
  let filteractives = document.querySelectorAll('.filterbtn.active');

  filteractives.forEach(i => {
    if (i.getAttribute("filtername") !== "name") {
      i.className = "filterbtn";
    }

    i.parentNode.querySelectorAll('.filterbtn[value=all]').forEach(i2 => {
      i2.className = "filterbtn active";
    });
  });

  filteractives[filteractives.length-1].parentNode.querySelectorAll('.filterbtn.active[filtername]')[0].value = "";
  createfilters(true);
}

async function filterships(filterobj) {
  let filterreturn = {};

  for (let hull in ships) {
    let tier = ships[hull];

    for (let hulltier in tier) {
      let fullstr = tier[hulltier];

      fullstr.forEach((ship) => {

        if (checkmatches(ship, filterobj) === Object.keys(filterobj).length) {
          if (!(hull in filterreturn)) {
            filterreturn[hull] = {};
          }

          if (!(hulltier in filterreturn[hull])) {
            filterreturn[hull][hulltier] = [];
          }
          filterreturn[hull][hulltier].push(ship);
        }
      });
    }
  }
  return filterreturn;
}

function checkmatches(ship, filterobj) {
  let retval = 0;

  if ("name" in filterobj) {
    let test_filterobj = filterobj["name"].toLowerCase();
    let test_ship_info = ship['names'][languageid].toLowerCase();

    if (test_ship_info.includes(test_filterobj)) {
      retval += 1;
    }
  }

  if ("hullType" in filterobj) {
    let test_filterobj = filterobj["hullType"];
    let test_ship_info = ship['hullType'];

    if (test_ship_info === "Large Cruiser") {
      test_ship_info = "Heavy Cruiser";
    }

    test_filterobj.forEach(i => {
      if (test_ship_info.includes(i)) {
        retval += 1;
      }

      if (i === "Others") {
        switch (test_ship_info) {
          case "AviationBattleship":
            retval += 1;
            break;

          case "Monitor":
            retval += 1;
            break;
        }
      }

      let vanguard_alias = ["Destroyer", "Light Cruiser", "Heavy Cruiser"];
      let main_alias = ["Battle", "Aircraft", "Repair"];

      if (i === "Vanguard") {
        vanguard_alias.forEach(i2 => {
          if (test_ship_info.includes(i2)) {
            retval += 1;
          }
        });
      } else if (i === "Main") {
        main_alias.forEach(i2 => {
          if (test_ship_info.includes(i2)) {
            retval += 1;
          }
        });
      }
    });
  }

  if ("nationality" in filterobj) {
    let test_filterobj = filterobj["nationality"];
    let test_ship_info = ship['nationality'];

    test_filterobj.forEach(i => {
      if (test_ship_info.toLowerCase().replace(" ", "") === "easternradiance") {
        test_ship_info = "dragonempery";
      }

      if (test_ship_info.toLowerCase().replace(" ", "") === "northunion") {
        test_ship_info = "northernparliament";
      }

      if (test_ship_info.toLowerCase().replace(" ", "") === i.toLowerCase().replace(" ", "")) {
        retval += 1;
      }

      if (i === "Other") {
        let unlabelled_nationality = ["eagleunion", "royalnavy", "sakuraempire", "ironblood", "dragonempery", "sardegnaempire", "northernparliament", "irislibre", "vichyadominion"];

        if (!(unlabelled_nationality.includes(test_ship_info.toLowerCase().replace(" ", "")))) {
          retval += 1;
        }
      }
    });
  }

  if ("rarity" in filterobj) {
    let test_filterobj = filterobj["rarity"];
    let test_ship_info = ship['rarity'];

    test_filterobj.forEach(i => {
      if (test_ship_info === i) {
        retval += 1;
      }
    });
  }

  if ("tags" in filterobj) {
    let test_filterobj = filterobj["tags"];
    let test_ship_info = ship['tags'];

    if (test_filterobj == "NONE") {
      test_filterobj = null
          if (test_filterobj === test_ship_info) {
            retval += 1;
          }
    } else {
      if (test_ship_info !== null) {
        test_filterobj.forEach(i => {
          test_ship_info.forEach(i2 => {
            if (i === i2) {
              retval += 1;
            }
          });
        });
      }
    }
  }

  if ("usagitier" in filterobj) {
    let test_filterobj = filterobj["usagitier"];
    let test_ship_info = "t" + ship['usagitier'];

    test_filterobj.forEach(i => {
      if (test_ship_info === i) {
        retval += 1;
      }
    });
  }
  return retval;
}

window.onload = async function () {
  getfilterbuttons()
  let languagecheck = await langcookieread()
  if (languagecheck == undefined) {
    languageid = "en"
    await setcookie(languageid)
    loaddata()
  } else {
    languageid = languagecheck
    loaddata()
  }
  window.addEventListener(
    "scroll",
    function () {
      scrollwidth();
    },
    false
  );
};

async function loaddata() {
  ships = await getjson("ships");
  changelog = await getjson("changelog");
  changeloglastupdatedate = Object.entries(changelog)[(Object.entries(changelog).length - 1)][1].updatedate
  changelognotify()
  let openChangelogButtons = document.querySelectorAll('[data-changelog-target]')
  let closeChangelogButtons = document.querySelectorAll('[data-close-button]')
  let openFilterButtons = document.querySelectorAll('[data-filter-target]')
  let closeFilterButtons = document.querySelectorAll('[data-close-button2]')
  let overlay = document.getElementById('overlay')

  openChangelogButtons.forEach(button => {
    button.addEventListener('click', () => {
      const changelog = document.querySelector(button.dataset.changelogTarget)
      openChangelog(changelog)
    })
  })

  openFilterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = document.querySelector(button.dataset.filterTarget)
      openFilter(filter)
    })
  })

  overlay.addEventListener('click', () => {
    const changelogs = document.querySelectorAll('.changelog.active')
    changelogs.forEach(changelog => {
      closeChangelog(changelog)
    })
    const filters = document.querySelectorAll('.filter.active')
    filters.forEach(filter => {
      closeFilter(filter)
    })
  })

  closeChangelogButtons.forEach(button => {
    button.addEventListener('click', () => {
      const changelog = button.closest('.changelog')
      closeChangelog(changelog)
    })
  })

  closeFilterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.closest('.filter')
      closeFilter(filter)
    })
  })

  let langchange = document.querySelectorAll(".lang");
  langchange.forEach(function (langadd) {
    langadd.addEventListener(
      "click",
      function () {
        shipnamecheck(this.classList[1], this.id);
      },
      false
    );
  });

  fillchangelog(changelog, "changelog-body-left")
  let changelogleftitems = document.querySelectorAll(".changelog-body-left .item")
  nodrag("changelog-body-left");
  changelogleftitems.forEach(function (itemadd) {
    itemadd.addEventListener(
      "click",
      function () {
        getchangelog(this.id);
      },
      false
    );
  });

  maincont = document.getElementsByClassName("main")[0];
  createfilters();
  getnamesarr()
  autocomplete(document.getElementById("inputtext"), namearr);

  function nodrag(a1) {
    var images = document.getElementsByClassName(a1);
    var i;
    for (i = 0; i < images.length; i++) {
      var addnodrag = images[i];
      if (addnodrag.draggable == true) {
        addnodrag.draggable = false;
      }
    }
  }
}

function fillchangelog(a1, a2) {
  var i = Object.entries(a1).length;
  while (i--) {
    var date = new Date(a1[Object.entries(a1)[i][0]].updatedate * 1000);
    let formateddate = ('0' + date.getDate()).slice(-2) + '/' + ('0' + (date.getMonth() + 1)).slice(-2) + '/' + date.getFullYear()
    if (i != Object.entries(a1).length -1) {
    htmldombuilder("div", "item", {
      addon: {
        innerHTML: `<span>#${a1[Object.entries(a1)[i][0]].number} <br> ${formateddate}</span>`,
        id: "item_" + a1[Object.entries(a1)[i][0]].number
      },
      style: {
        backgroundImage: `url("Assets/Misc/UsagiThumbnails/${a1[Object.entries(a1)[i][0]].number}.png"), linear-gradient(#1e8dff, #3c9dfe)`
      }
    }, document.getElementsByClassName(a2)[0])
  } else {
    htmldombuilder("div", "item active", {
      addon: {
        innerHTML: `<span>#${a1[Object.entries(a1)[i][0]].number} <br> ${formateddate}</span>`,
        id: "item_" + a1[Object.entries(a1)[i][0]].number
      },
      style: {
        backgroundImage: `url("Assets/Misc/UsagiThumbnails/${a1[Object.entries(a1)[i][0]].number}.png"), linear-gradient(#1e8dff, #3c9dfe)`
      }
    }, document.getElementsByClassName(a2)[0])
    getchangelog("item_" + a1[Object.entries(a1)[i][0]].number)
  }
    if ((Object.entries(a1).length - 1) === i) {
      htmldombuilder("img", "notificationinside active", {
        addon: {
          src: `Assets/Misc/Notification.png`,
          id: "notificationinside"
        }
      }, document.getElementsByClassName(a2)[0].getElementsByClassName("item")[0])
    }
  }
}

function htmldombuilder(a1, a2, a3, a4) {
  let a = document.createElement(a1);
  a.className = a2;
  a.draggable = false;
  if (a1 == "img") {
    a.alt = ""
  }
  if (a3 != undefined) {
    if (a3.style != undefined) {
      for (let i = 0; i < Object.entries(a3.style).length; i++) {
        a.style[Object.entries(a3.style)[i][0]] = a3.style[Object.entries(a3.style)[i][0]];
      }
    }
    if (a3.addon != undefined) {
      for (let i = 0; i < Object.entries(a3.addon).length; i++) {
        if (Object.entries(a3.addon)[i][0] == "text") {
          let ttext = tiertext(a3.addon[Object.entries(a3.addon)[i][0]]);
          a.innerHTML = ttext
        }
        if (Object.entries(a3.addon)[i][0] == "innerHTML") {
          a.innerHTML = a3.addon[Object.entries(a3.addon)[i][0]]
        }
        if (Object.entries(a3.addon)[i][0] == "innerText") {
          a.innerText = a3.addon[Object.entries(a3.addon)[i][0]]
        }
        if (Object.entries(a3.addon)[i][0] == "src") {
          a.src = a3.addon[Object.entries(a3.addon)[i][0]]
        }
        if (Object.entries(a3.addon)[i][0] == "href") {
          a.href = a3.addon[Object.entries(a3.addon)[i][0]]
          a.target = "_blank"
          a.rel = "noopener"
          a.ariaLabel = a2
        }
        if (Object.entries(a3.addon)[i][0] == "id") {
          a.id = a3.addon[Object.entries(a3.addon)[i][0]]
        }
      }
    }
  }
  if (a4 != undefined) {
    a4.appendChild(a)
  } else {
    maincont.appendChild(a)
  }
}

function spantextbuild(a1, a2, a3) {
  for (let ii = 0; ii < 4; ii++) {
    let spanclassname
    let spanfontsize
    let spanlineheight
    switch (ii) {
      case 0:
        language = "en";
        lang = "en";
        break;
      case 1:
        language = "jp";
        lang = "jp";
        break;
      case 2:
        language = "cn";
        lang = "cn";
        break;
      case 3:
        language = "kr";
        lang = "kr";
        break;
    }
    if (a1[language] == null || a1[language] == "") {
      lang = "en";
      textcheck = texthandler(
        a2[lang].length,
        a2[lang],
        lang
      );
    } else {
      textcheck = texthandler(
        a1[lang].length,
        a1[lang],
        language
      );
    }
    if (textcheck.className != undefined) {
      spanclassname = textcheck.className;
    }
    if (textcheck.fontSize != undefined) {
      spanfontsize = textcheck.fontSize;
    }
    if (textcheck.lineHeight != undefined) {
      spanlineheight = textcheck.lineHeight;
    }
    htmldombuilder("span", spanclassname, {
      style: {
        fontSize: spanfontsize,
        lineHeight: spanlineheight
      },
      addon: {
        innerHTML: a1[lang]
      }
    }, a3.getElementsByClassName("text_" + language)[0])
  }
}

function getchangelog(a1) {
  a1 = a1.replace("item_", "")
  document.querySelectorAll(".item").forEach((e) => {
    if (e.id.includes(a1)) {
      if (!e.classList.contains("active")) {
        e.classList.add("active");
      }
    } else {
      if (e.classList.contains("active")) {
        e.classList.remove("active")
      }
    }
  })

  if (isNaN(a1) == false) {
    a1 = a1
  } else {
    a1 = this.value
  }

  document.getElementsByClassName("changelogmainbody")[0].innerHTML = "";
  document.getElementsByClassName("changelogmainheader")[0].innerHTML = "";
  document.getElementsByClassName("changelogbuttons")[0].innerHTML = "";

  htmldombuilder("div", "changelogtext", {
    addon: {
      text: changelog[a1].fullname
    }
  }, document.getElementsByClassName("changelogmainheader")[0])

  if (!changelog[a1].changes.new.length < 1) {
    htmldombuilder("button", "changelog-added-button", {
      addon: {
        innerText: "Added"
      }
    }, document.getElementsByClassName("changelogbuttons")[0])

    document.getElementsByClassName("changelog-added-button")[0].addEventListener(
      "click",
      function () {
        changedomanactive(this.innerText, "changelogmainblock");
      },
      false
    );
  }

  if (changelog[a1].changes.support != undefined) {
    if (!changelog[a1].changes.support.length < 1) {
      htmldombuilder("button", "changelog-support-button", {
        addon: {
          innerText: "Support"
        }
      }, document.getElementsByClassName("changelogbuttons")[0])

      document.getElementsByClassName("changelog-support-button")[0].addEventListener(
        "click",
        function () {
          changedomanactive(this.innerText, "changelogmainsupport");
        },
        false
      );
    }
  }

  if (!changelog[a1].changes.promotions.length < 1) {
    htmldombuilder("button", "changelog-promotions-button", {
      addon: {
        innerText: "Promotions"
      }
    }, document.getElementsByClassName("changelogbuttons")[0])

    document.getElementsByClassName("changelog-promotions-button")[0].addEventListener(
      "click",
      function () {
        changedomanactive(this.innerText, "changelogmainpromotions");
      },
      false
    );
  }

  if (!changelog[a1].changes.promotions.length < 1) {
    htmldombuilder("button", "changelog-demotions-button", {
      addon: {
        innerText: "Demotions"
      }
    }, document.getElementsByClassName("changelogbuttons")[0])

    document.getElementsByClassName("changelog-demotions-button")[0].addEventListener(
      "click",
      function () {
        changedomanactive(this.innerText, "changelogmaindemotions");
      },
      false
    );
  }

  function changedomanactive(a1, a2) {
    document.querySelectorAll(".changelogbuttons button").forEach((e) => {
      if (e.innerText == a1) {
        if (!e.classList.contains("active")) {
          e.classList.add("active");
        }
      } else {
        if (e.classList.contains("active")) {
          e.classList.remove("active")
        }
      }
    })
    aeds1(a2)
  }

  function aeds1(a1) {
    document.querySelectorAll(".changelogmainbody [class^=changelogmain]").forEach((e) => {
      if (e.classList.contains(a1)) {
        if (!e.classList.contains("active")) {
          e.classList.add("active");
        }
      } else {
        if (e.classList.contains("active")) {
          e.classList.remove("active")
        }
      }
    })
  }


  htmldombuilder("div", "changelogmainblock active", undefined, document.getElementsByClassName("changelogmainbody")[0])

  htmldombuilder("div", "changelogmainsupport", undefined, document.getElementsByClassName("changelogmainbody")[0])

  htmldombuilder("div", "changelogmainpromotions", undefined, document.getElementsByClassName("changelogmainbody")[0])

  htmldombuilder("div", "changelogmaindemotions", undefined, document.getElementsByClassName("changelogmainbody")[0])

  function getindexforship(b1, b2, b3, b4, b5, b6) {
    for (let a = 0; a < 8; a++) {
      if (ships[b2][Object.entries(ships[b2])[a][0]] != undefined) {
        for (let i = 0; i < ships[b2][Object.entries(ships[b2])[a][0]].length; i++) {
          if (ships[b2][Object.entries(ships[b2])[a][0]][i].names.en == b1) {
            buildchangelogships(b2, b3, i, b4, b5, b6, Object.entries(ships[b2])[a][0])
          }
        }
      }
    }
  }

  for (let i = 0; i < changelog[a1].changes.new.length; i++) {
    getindexforship(changelog[a1].changes.new[i].shipname, changelog[a1].changes.new[i].shiptype, changelog[a1].changes.new[i].changedrank, i, "new")
  }

  if (changelog[a1].changes.support != undefined) {
    for (let i = 0; i < changelog[a1].changes.support.length; i++) {
      getindexforship(changelog[a1].changes.support[i].shipname, changelog[a1].changes.support[i].shiptype, changelog[a1].changes.support[i].changedrank, i, "support")
    }
  }

  for (let i = 0; i < changelog[a1].changes.promotions.length; i++) {
    getindexforship(changelog[a1].changes.promotions[i].shipname, changelog[a1].changes.promotions[i].shiptype, changelog[a1].changes.promotions[i].changedrank, i, "promotions", changelog[a1].changes.promotions[i].oldrank)
  }

  for (let i = 0; i < changelog[a1].changes.demotions.length; i++) {
    getindexforship(changelog[a1].changes.demotions[i].shipname, changelog[a1].changes.demotions[i].shiptype, changelog[a1].changes.demotions[i].changedrank, i, "demotions", changelog[a1].changes.demotions[i].oldrank)
  }

  function buildchangelogships(a1, a2, i, b4, b5, b6, b7) {
    if (b5 == "new" || b5 == "support") {
      let newidf
      let fullidf
      if (b5 == "new") {
        newidf = "block"
        fullidf = "changelogparentadded"
      } else {
        newidf = "support"
        fullidf = "changelogparentsupport"
      }
      if (document.getElementsByClassName("changelogmain" + newidf)[0].getElementsByClassName(a2).length == 0) {
        htmldombuilder("div", a2, {
          style: {
            height: "120px",
            display: "inline-flex",
            marginBottom: "10px"
          }
        }, document.getElementsByClassName("changelogmain" + newidf)[0])

        htmldombuilder("div", "tierbanner", {
          style: {
            height: "120px",
            width: "55px",
            marginRight: "5px",
            marginTop: "5px",
            display: "flex"
          }
        }, document.getElementsByClassName("changelogmain" + newidf)[0].getElementsByClassName(a2)[0])
        htmldombuilder("span", "", {
          style: {
            alignSelf: "center",
            width: "55px",
            fontSize: "47px"
          },
          addon: {
            innerHTML: `${a2.charAt(0).toUpperCase()} <br> ${a2.charAt(1)}`
          }
        }, document.getElementsByClassName("changelogmain" + newidf)[0].getElementsByClassName(a2)[0].getElementsByClassName("tierbanner")[0])
      }

      //Main
      htmldombuilder("div", fullidf, undefined, document.getElementsByClassName("changelogmain" + newidf)[0].getElementsByClassName(a2)[0])
      //WikiUrl
      htmldombuilder("a", "link", {
        addon: {
          href: ships[`${a1}`][`${b7}`][i].wikiUrl
        }
      }, document.getElementsByClassName(fullidf)[b4])
      //Thumbnail
      htmldombuilder("img", "thumbnail", {
        addon: {
          src: ships[`${a1}`][`${b7}`][i].thumbnail
        }
      }, document.getElementsByClassName(fullidf)[b4])
      //Bannerleft
      if (ships[`${a1}`][`${b7}`][i].banneralt != null) {
        if (ships[`${a1}`][`${b7}`][i].banneralt == "NEW") {
          htmldombuilder("img", "bannerleft", {
            addon: {
              src: "Assets/BannerAlt/NEW.png"
            }
          }, document.getElementsByClassName(fullidf)[b4])
        }
      }
      //Tags en
      if (languageid == "en" || languageid == "jp" || languageid == "kr") {
        htmldombuilder("div", "tags_en show", undefined, document.getElementsByClassName(fullidf)[b4])
      } else {
        htmldombuilder("div", "tags_en", undefined, document.getElementsByClassName(fullidf)[b4])
      }
      //Tags cn
      if (languageid == "cn") {
        htmldombuilder("div", "tags_cn show", undefined, document.getElementsByClassName(fullidf)[b4])
      } else {
        htmldombuilder("div", "tags_cn", undefined, document.getElementsByClassName(fullidf)[b4])
      }
      //Tags filler
      if (ships[`${a1}`][`${b7}`][i].tags != null) {
        for (let ii = 0; ii < ships[`${a1}`][`${b7}`][i].tags.length; ii++) {
          htmldombuilder("img", "tag" + (ii + 1), {
            addon: {
              src: "Assets/TagIcons/EN/" + ships[`${a1}`][`${b7}`][i].tags[ii] + ".png"
            }
          }, document.getElementsByClassName(fullidf)[b4].getElementsByClassName("tags_en")[0])
          htmldombuilder("img", "tag" + (ii + 1), {
            addon: {
              src: "Assets/TagIcons/CN/" + ships[`${a1}`][`${b7}`][i].tags[ii] + ".png"
            }
          }, document.getElementsByClassName(fullidf)[b4].getElementsByClassName("tags_cn")[0])
        }
      }
      //Namechange html
      //Textblock en
      if (languageid == "en") {
        htmldombuilder("div", "text_en show", undefined, document.getElementsByClassName(fullidf)[b4])
      } else {
        htmldombuilder("div", "text_en", undefined, document.getElementsByClassName(fullidf)[b4])
      }
      //Textblock jp
      if (languageid == "jp") {
        htmldombuilder("div", "text_jp show", undefined, document.getElementsByClassName(fullidf)[b4])
      } else {
        htmldombuilder("div", "text_jp", undefined, document.getElementsByClassName(fullidf)[b4])
      }
      //Textblock kr
      if (languageid == "kr") {
        htmldombuilder("div", "text_kr show", undefined, document.getElementsByClassName(fullidf)[b4])
      } else {
        htmldombuilder("div", "text_kr", undefined, document.getElementsByClassName(fullidf)[b4])
      }
      //Textblock cn
      if (languageid == "cn") {
        htmldombuilder("div", "text_cn show", undefined, document.getElementsByClassName(fullidf)[b4])
      } else {
        htmldombuilder("div", "text_cn", undefined, document.getElementsByClassName(fullidf)[b4])
      }
      // Span text
      spantextbuild(ships[`${a1}`][`${b7}`][i].names, ships[`${a1}`][`${b7}`][i].names, document.getElementsByClassName(fullidf)[b4])
    }
    if (b5 == "promotions" || b5 == "demotions") {
      //Main div
      htmldombuilder("div", "changelogparent", undefined, document.getElementsByClassName("changelogmain" + b5)[0])
      //WikiUrl
      htmldombuilder("a", "link", {
        addon: {
          href: ships[`${a1}`][`${b7}`][i].wikiUrl
        }
      }, document.getElementsByClassName("changelogmain" + b5)[0].getElementsByClassName("changelogparent")[b4])
      //Thumbnail
      htmldombuilder("img", "thumbnail", {
        addon: {
          src: ships[`${a1}`][`${b7}`][i].thumbnail
        }
      }, document.getElementsByClassName("changelogmain" + b5)[0].getElementsByClassName("changelogparent")[b4])
      //Bannerleft
      if (ships[`${a1}`][`${b7}`][i].banneralt != null) {
        if (ships[`${a1}`][`${b7}`][i].banneralt == "NEW") {
          htmldombuilder("img", "bannerleft", {
            addon: {
              src: "Assets/BannerAlt/NEW.png"
            }
          }, document.getElementsByClassName("changelogmain" + b5)[0].getElementsByClassName("changelogparent")[b4])
        }
      }
      //Tags en
      if (languageid == "en" || languageid == "jp" || languageid == "kr") {
        htmldombuilder("div", "tags_en show", undefined, document.getElementsByClassName("changelogmain" + b5)[0].getElementsByClassName("changelogparent")[b4])
      } else {
        htmldombuilder("div", "tags_en", undefined, document.getElementsByClassName("changelogmain" + b5)[0].getElementsByClassName("changelogparent")[b4])
      }
      //Tags cn
      if (languageid == "cn") {
        htmldombuilder("div", "tags_cn show", undefined, document.getElementsByClassName("changelogmain" + b5)[0].getElementsByClassName("changelogparent")[b4])
      } else {
        htmldombuilder("div", "tags_cn", undefined, document.getElementsByClassName("changelogmain" + b5)[0].getElementsByClassName("changelogparent")[b4])
      }
      //Tags filler
      if (ships[`${a1}`][`${b7}`][i].tags != null) {
        for (let ii = 0; ii < ships[`${a1}`][`${b7}`][i].tags.length; ii++) {
          htmldombuilder("img", "tag" + (ii + 1), {
            addon: {
              src: "Assets/TagIcons/EN/" + ships[`${a1}`][`${b7}`][i].tags[ii] + ".png"
            }
          }, document.getElementsByClassName("changelogmain" + b5)[0].getElementsByClassName("changelogparent")[b4].getElementsByClassName("tags_en")[0])
          htmldombuilder("img", "tag" + (ii + 1), {
            addon: {
              src: "Assets/TagIcons/CN/" + ships[`${a1}`][`${b7}`][i].tags[ii] + ".png"
            }
          }, document.getElementsByClassName("changelogmain" + b5)[0].getElementsByClassName("changelogparent")[b4].getElementsByClassName("tags_cn")[0])
        }
      }
      //Namechange html
      //Textblock en
      if (languageid == "en") {
        htmldombuilder("div", "text_en show", undefined, document.getElementsByClassName("changelogmain" + b5)[0].getElementsByClassName("changelogparent")[b4])
      } else {
        htmldombuilder("div", "text_en", undefined, document.getElementsByClassName("changelogmain" + b5)[0].getElementsByClassName("changelogparent")[b4])
      }
      //Textblock jp
      if (languageid == "jp") {
        htmldombuilder("div", "text_jp show", undefined, document.getElementsByClassName("changelogmain" + b5)[0].getElementsByClassName("changelogparent")[b4])
      } else {
        htmldombuilder("div", "text_jp", undefined, document.getElementsByClassName("changelogmain" + b5)[0].getElementsByClassName("changelogparent")[b4])
      }
      //Textblock kr
      if (languageid == "kr") {
        htmldombuilder("div", "text_kr show", undefined, document.getElementsByClassName("changelogmain" + b5)[0].getElementsByClassName("changelogparent")[b4])
      } else {
        htmldombuilder("div", "text_kr", undefined, document.getElementsByClassName("changelogmain" + b5)[0].getElementsByClassName("changelogparent")[b4])
      }
      //Textblock cn
      if (languageid == "cn") {
        htmldombuilder("div", "text_cn show", undefined, document.getElementsByClassName("changelogmain" + b5)[0].getElementsByClassName("changelogparent")[b4])
      } else {
        htmldombuilder("div", "text_cn", undefined, document.getElementsByClassName("changelogmain" + b5)[0].getElementsByClassName("changelogparent")[b4])
      }
      // Span text
      spantextbuild(ships[`${a1}`][`${b7}`][i].names, ships[`${a1}`][`${b7}`][i].names, document.getElementsByClassName("changelogmain" + b5)[0].getElementsByClassName("changelogparent")[b4])
      //Tierchanges
      htmldombuilder("div", "tierchanges", undefined, document.getElementsByClassName("changelogmain" + b5)[0].getElementsByClassName("changelogparent")[b4])
      htmldombuilder("div", "oldranktext", {
        addon: {
          innerText: b6.toUpperCase()
        }
      }, document.getElementsByClassName("changelogmain" + b5)[0].getElementsByClassName("changelogparent")[b4].getElementsByClassName("tierchanges")[0])

      if (b5 == "promotions") {
        htmldombuilder("img", "rankiconup", {
          addon: {
            src: "Assets/Misc/Arrow.png"
          }
        }, document.getElementsByClassName("changelogmain" + b5)[0].getElementsByClassName("changelogparent")[b4].getElementsByClassName("tierchanges")[0])
      } else if (b5 == "demotions") {
        htmldombuilder("img", "rankicondown", {
          addon: {
            src: "Assets/Misc/Arrow.png"
          }
        }, document.getElementsByClassName("changelogmain" + b5)[0].getElementsByClassName("changelogparent")[b4].getElementsByClassName("tierchanges")[0])
      }
      htmldombuilder("div", "newranktext", {
        addon: {
          innerText: a2.toUpperCase()
        }
      }, document.getElementsByClassName("changelogmain" + b5)[0].getElementsByClassName("changelogparent")[b4].getElementsByClassName("tierchanges")[0])
    }
  }
}

function openChangelog(changelog) {
  if (changelog == null) return
  if (Cookies.get('changelog') != changeloglastupdatedate) {
    Cookies.set('changelog', changeloglastupdatedate, {
      expires: 365
    })
    document.getElementsByClassName("notification")[0].style.display = "none"
  } else {
    document.getElementsByClassName("notification")[0].style.display = "none"
  }
  changelog.classList.add('active')
  overlay.classList.add('active')
  var htmlbody = document.body
  var oldWidth = htmlbody.clientWidth
  htmlbody.style.overflow = "hidden";
  htmlbody.style.width = oldWidth;
  document.getElementsByClassName("language")[0].style.marginRight = "13px";
}

function closeChangelog(changelog) {
  if (changelog == null) return
  changelog.classList.remove('active')
  overlay.classList.remove('active')
  var htmlbody = document.body
  htmlbody.style.overflow = "auto"
  htmlbody.style.width = "auto"
  document.getElementsByClassName("language")[0].style.marginRight = "5px";
}

function openFilter(filter) {
  if (filter == null) return
  filter.classList.add('active')
  overlay.classList.add('active')
  var htmlbody = document.body
  var oldWidth = htmlbody.clientWidth
  htmlbody.style.overflow = "hidden";
  htmlbody.style.width = oldWidth;
  document.getElementsByClassName("language")[0].style.marginRight = "13px";
}

function closeFilter(filter) {
  if (filter == null) return
  filter.classList.remove('active')
  overlay.classList.remove('active')
  var htmlbody = document.body
  htmlbody.style.overflow = "auto"
  htmlbody.style.width = "auto"
  document.getElementsByClassName("language")[0].style.marginRight = "5px";
}

window.onclick = function (event) {
  if (
    !event.target.matches("." + identmain) &&
    !event.target.matches(".filter-dropdown-content") &&
    !event.target.matches(".tierfilterspan") &&
    !event.target.matches(".hulltypefilterspan") &&
    !event.target.matches(".rarityfilterspan") &&
    !event.target.matches(".nationalityfilterspan") &&
    !event.target.matches(".tagfilterspan") &&
    !event.target.matches(".tierfilter") &&
    !event.target.matches(".hulltypefilter") &&
    !event.target.matches(".rarityfilter") &&
    !event.target.matches(".nationalityfilter") &&
    !event.target.matches(".tagfilter_en") &&
    !event.target.matches(".tagfilter_ico") &&
    !event.target.matches(".tagfilter_cn") &&
    !event.target.matches(".tierfiltercont") &&
    !event.target.matches(".hulltypefiltercont") &&
    !event.target.matches(".rarityfiltercont") &&
    !event.target.matches(".nationalityfiltercont") &&
    !event.target.matches(".tagfiltercont")
  ) {
    var dropdowns = document.getElementsByClassName(identid + "-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains("show")) {
        openDropdown.classList.remove("show");
      }
    }
    identmain = undefined;
    identid = undefined;
  }
  if (
    !event.target.matches(".legend-dot-dropbtn") &&
    !event.target.matches(".legend-dropdown-content") &&
    !event.target.matches(".legendicon_en") &&
    !event.target.matches(".legendicon_cn") &&
    !event.target.matches(".legendspan_en") &&
    !event.target.matches(".legendspan_cn")
  ) {
    var dropdowns = document.getElementsByClassName("legend-dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains("show")) {
        openDropdown.classList.remove("show");
      }
    }
  }
};

function languagechangerfunc(a1) {
  getnamesarr()
  setcookieghost(a1)

  document.querySelectorAll(".lang").forEach((e) => {
    if (e.classList.contains(a1) && !e.classList.contains("active")) {
      e.classList.add("active");
    } else {
      e.classList.remove("active")
    }
  })

  document.querySelectorAll("[class*='text_']").forEach((e) => {
    if (!e.classList.contains("text_" + a1)) {
      e.classList.remove("show")
    } else {
      e.classList.add("show")
    }
  })

  if (a1 == "en" || a1 == "cn") {
    document.querySelectorAll("[class*='tagfilter_'], [class*='legendicon_'], [class*='legendspan_'], [class*='tags_']").forEach((e) => {
      if (!e.classList.contains("show") && e.classList.contains("tagfilter_" + a1) || e.classList.contains("legendicon_" + a1) || e.classList.contains("legendspan_" + a1) || e.classList.contains("tags_" + a1)) {
        e.classList.add("show")
      } else {
        e.classList.remove("show")
      }
    })
  }
}

// Namechange function
function shipnamecheck(a1, a2) {
  switch (a1) {
    case "en":
      languageid = "en";
      languagechangerfunc(languageid)
      break;
    case "jp":
      languageid = "jp";
      languagechangerfunc(languageid)
      break;
    case "cn":
      languageid = "cn";
      languagechangerfunc(languageid)
      break;
    case "kr":
      languageid = "kr";
      languagechangerfunc(languageid)
      break;
  }
}

async function getjson(a1) {
  try {
    let data = await fetch([a1] + ".json");
    let result = await data.json();
    return result;
  } catch (e) {
    console.error(e);
  }
}

function legenddropdown() {
  document.getElementById("legend-dropdown").classList.toggle("show");
}

function countspaces(a1) {
  let count = a1.split(" ").length - 1;
  let countafter = a1.match(/^\s*(\S+)\s*(.*?)\s*$/).slice(1);
  return {
    count,
    countafter
  };
}

function removespaces(a1) {
  let result = a1.replace(" ", "");
  return result;
}

function tiersize(a1) {
  let result;
  let rawresult;
  let b1 = (a1 * 100) / 3;
  let b2 = Math.ceil(b1 / 100) * 100;
  let margin = b2 / 10;

  result = b2 + margin + "px";
  rawresult = b2 + margin;

  return {
    result,
    rawresult
  };
}

function texthandler(a1, a2, a3) {
  let className;
  let fontSize;
  let lineHeight;
  let countcheck
  if (a2 != "" || a2 != null) {
    countcheck = countspaces(a2);
  } else {
    a2 = null
    countcheck = countspaces(a2);
  }

  if (a3 == "en") {
    if (a1 >= 13) {
      className = "shipnamealt";
      // If the str has no empty spaces
      if ((countcheck.count) == 0) {
        fontSize = "10px";
        lineHeight = "2";
      }
      // Check if the str has at least one empty space
      if ((countcheck.count) == 1) {
        // If the second str is at least 9 => 10+ long
        if (
          (countcheck.countafter[1].length) == 10 &&
          (countcheck.countafter[1].length) > 8
        ) {
          fontSize = "11px";
        }
        // If the second str is longer then 10
        if ((countcheck.countafter[1].length) > 10) {
          fontSize = "10px";
        }
        // If the second str is smaller or 8 long
        if (countcheck.countafter[1].length <= 8) {
          fontSize = "12px";
        }
      } else if ((countcheck.count) == 2) {
        // If the second str is at least 9 => 10+ long
        if (
          (countcheck.countafter[1].length) == 10 &&
          (countcheck.countafter[1].length) > 8
        ) {
          fontSize = "11px";
        }
        // If the second str is longer then 10
        if ((countcheck.countafter[1].length) > 10) {
          fontSize = "10px";
        }
        // If the second str is smaller or 8 long
        if (countcheck.countafter[1].length <= 8) {
          fontSize = "12px";
        }
      } else {
        fontSize = "10px";
      }
      // If the sting is 17 or longer
      if (a1 >= 17) {
        fontSize = "11px";
      }
      if (a1 == 16) {
        fontSize = "10px";
      }
    } else {
      if ((countcheck.count) == 0 && a1 >= 12) {
        fontSize = "10px";
      }
      if ((countcheck.count) >= 1) {
        fontSize = "10px";
      }
      if ((countcheck.count) == 1 && a1 == 11) {
        fontSize = "10px";
        lineHeight = "20px";
      }
      className = "shipname";
      if ((countcheck.count) == 0 && a1 == 11) {
        fontSize = "11px";
      }
    }
  }

  if (a3 == "jp") {
    if (a1 < 7) {
      fontSize = "10px";
      lineHeight = "20px";
      className = "shipname";
    } else if (a1 > 11) {
      fontSize = "9px";
      lineHeight = "9px";
      className = "shipnamealt";
      if (a1 > 14) {
        fontSize = "8px";
        lineHeight = "9px";
        className = "shipnamealt";
      }
    } else {
      fontSize = "10px";
      lineHeight = "9px";
      className = "shipnamealt";
      if (a1 == 7) {
        fontSize = "11px";
        lineHeight = "9px";
        className = "shipnamealt";
      }
    }
  }

  if (a3 == "kr") {
    if (a1 < 9) {
      fontSize = "10px";
      lineHeight = "20px";
      className = "shipname";
      if (a1 <= 8) {
        fontSize = "9px";
        lineHeight = "20px";
        className = "shipnamealt";
      }
    } else {
      fontSize = "10px";
      lineHeight = "9px";
      className = "shipnamealt";
      if (countcheck.count == 1) {
        fontSize = "10px";
        lineHeight = "20px";
        className = "shipnamealt";
      }
    }
  }

  if (a3 == "cn") {
    if (a1 > 0 && a1 < 6) {
      fontSize = "12px";
      lineHeight = "20px";
      className = "shipname";
    }
    if (a1 > 5) {
      fontSize = "11px";
      lineHeight = "20px";
      className = "shipnamealt";
    }
    if (a1 > 6) {
      fontSize = "10px";
      lineHeight = "20px";
      className = "shipnamealt";
    }
    if (a1 > 7) {
      fontSize = "8px";
      lineHeight = "20px";
      className = "shipnamealt";
    }
  }
  return {
    className,
    fontSize,
    lineHeight
  };
}

function tiertext(a1) {
  var result = a1.toUpperCase();
  return result;
}

async function buildhtmlmain(newshipobj) {
  document.getElementsByClassName("main")[0].innerHTML = "";

  for (let i = 0; i < Object.keys(newshipobj).length; i++) {
    // Hulltype class
    htmldombuilder("div", Object.keys(newshipobj)[i] + " all", undefined, undefined)
    // Hulltype class banner
    let bsrc
    if (Object.keys(newshipobj)[i] == "heavycruiser") {
      bsrc = "Assets/TierClassBanner/HeavyCruiser.png";
    } else if (Object.keys(newshipobj)[i] == "lightcruiser") {
      bsrc = "Assets/TierClassBanner/LightCruiser.png";
    } else {
      bsrc =
        "Assets/TierClassBanner/" +
        Object.keys(newshipobj)[i].charAt(0).toUpperCase() +
        Object.keys(newshipobj)[i].slice(1) +
        ".png";
    }
    htmldombuilder("img", Object.keys(newshipobj)[i] + "banner", {
      style: {
        marginRight: "30px"
      },
      addon: {
        src: bsrc
      }
    }, document.getElementsByClassName(Object.keys(newshipobj)[i])[0])

    for (let ii = 0; ii < Object.keys(Object.entries(newshipobj)[i][1]).length; ii++) {
      // s == t0 t1 t2 usw
      let sizecheck = tiersize(Object.entries(newshipobj)[i][1][Object.keys(Object.entries(newshipobj)[i][1])[ii]].length);
      htmldombuilder("div", Object.keys(Object.entries(newshipobj)[i][1])[ii], {
        style: {
          width: sizecheck.result,
          marginRight: "20px"
        }
      }, document.getElementsByClassName(Object.keys(newshipobj)[i])[0])
      htmldombuilder("div", "tierbanner", {
        style: {
          width: sizecheck.rawresult - 10 + "px"
        },
        addon: {
          text: Object.keys(Object.entries(newshipobj)[i][1])[ii]
        }
      }, document.getElementsByClassName(Object.keys(newshipobj)[i])[0].getElementsByClassName(Object.keys(Object.entries(newshipobj)[i][1])[ii])[0])
      filltier(Object.keys(newshipobj)[i], Object.keys(Object.entries(newshipobj)[i][1])[ii], newshipobj);
    }
  }
}

function filltier(a1, a2, a3) {
  for (let i = 0; i < a3[a1][a2].length; i++) {
    // Main div
    htmldombuilder("div", "parent", undefined, document.getElementsByClassName(a1)[0].getElementsByClassName(a2)[0])
    // Tags en
    if (languageid == "en" || languageid == "jp" || languageid == "kr") {
      htmldombuilder("div", "tags_en show", undefined, document.getElementsByClassName(a1)[0].getElementsByClassName(a2)[0].getElementsByClassName("parent")[i])
    } else {
      htmldombuilder("div", "tags_en", undefined, document.getElementsByClassName(a1)[0].getElementsByClassName(a2)[0].getElementsByClassName("parent")[i])
    }
    if (languageid == "cn") {
      htmldombuilder("div", "tags_cn show", undefined, document.getElementsByClassName(a1)[0].getElementsByClassName(a2)[0].getElementsByClassName("parent")[i])
    } else {
      htmldombuilder("div", "tags_cn", undefined, document.getElementsByClassName(a1)[0].getElementsByClassName(a2)[0].getElementsByClassName("parent")[i])
    }
    // Namechange html builder
    // Textblock en
    if (languageid == "en") {
      htmldombuilder("div", "text_en show", undefined, document.getElementsByClassName(a1)[0].getElementsByClassName(a2)[0].getElementsByClassName("parent")[i])
    } else {
      htmldombuilder("div", "text_en", undefined, document.getElementsByClassName(a1)[0].getElementsByClassName(a2)[0].getElementsByClassName("parent")[i])
    }
    // Textblock jp
    if (languageid == "jp") {
      htmldombuilder("div", "text_jp show", undefined, document.getElementsByClassName(a1)[0].getElementsByClassName(a2)[0].getElementsByClassName("parent")[i])
    } else {
      htmldombuilder("div", "text_jp", undefined, document.getElementsByClassName(a1)[0].getElementsByClassName(a2)[0].getElementsByClassName("parent")[i])
    }
    // Textblock kr
    if (languageid == "kr") {
      htmldombuilder("div", "text_kr show", undefined, document.getElementsByClassName(a1)[0].getElementsByClassName(a2)[0].getElementsByClassName("parent")[i])
    } else {
      htmldombuilder("div", "text_kr", undefined, document.getElementsByClassName(a1)[0].getElementsByClassName(a2)[0].getElementsByClassName("parent")[i])
    }
    // Textblock cn
    if (languageid == "cn") {
      htmldombuilder("div", "text_cn show", undefined, document.getElementsByClassName(a1)[0].getElementsByClassName(a2)[0].getElementsByClassName("parent")[i])
    } else {
      htmldombuilder("div", "text_cn", undefined, document.getElementsByClassName(a1)[0].getElementsByClassName(a2)[0].getElementsByClassName("parent")[i])
    }
    if (a3 == undefined) {
      htmldombuilder("a", "link", {
        addon: {
          href: a3[a1][a2][i].wikiUrl
        }
      }, document.getElementsByClassName(a1)[0].getElementsByClassName(a2)[0].getElementsByClassName("parent")[i])
      // thumbnail
      htmldombuilder("img", "thumbnail", {
        addon: {
          src: a3[a1][a2][i].thumbnail
        }
      }, document.getElementsByClassName(a1)[0].getElementsByClassName(a2)[0].getElementsByClassName("parent")[i])
      // Bannerleft
      if (a3[a1][a2][i].banneralt != null) {
        if (a3[a1][a2][i].banneralt == "NEW") {
          htmldombuilder("img", "bannerleft", {
            addon: {
              src: "Assets/BannerAlt/NEW.png"
            }
          }, document.getElementsByClassName(a1)[0].getElementsByClassName(a2)[0].getElementsByClassName("parent")[i])
        }
      }
      // tags filler
      if (a3[a1][a2][i].tags != null) {
        for (let ii = 0; ii < a3[a1][a2][i].tags.length; ii++) {
          htmldombuilder("img", "tag" + (ii + 1), {
            addon: {
              src: "Assets/TagIcons/EN/" + a3[a1][a2][i].tags[ii] + ".png"
            }
          }, document.getElementsByClassName(a1)[0].getElementsByClassName(a2)[0].getElementsByClassName("tags_en")[i])
          htmldombuilder("img", "tag" + (ii + 1), {
            addon: {
              src: "Assets/TagIcons/CN/" + a3[a1][a2][i].tags[ii] + ".png"
            }
          }, document.getElementsByClassName(a1)[0].getElementsByClassName(a2)[0].getElementsByClassName("tags_cn")[i])
        }
      }
      // Span text
      spantextbuild(a3[a1][a2][i].names, a3[a1][a2][i].names, document.getElementsByClassName(a1)[0].getElementsByClassName(a2)[0].getElementsByClassName("parent")[i])
    } else {
      htmldombuilder("a", "link", {
        addon: {
          href: a3[a1][a2][i].wikiUrl
        }
      }, document.getElementsByClassName(a1)[0].getElementsByClassName(a2)[0].getElementsByClassName("parent")[i])
      htmldombuilder("img", "thumbnail", {
        addon: {
          src: a3[a1][a2][i].thumbnail
        }
      }, document.getElementsByClassName(a1)[0].getElementsByClassName(a2)[0].getElementsByClassName("parent")[i])
      // Bannerleft
      if (a3[a1][a2][i].banneralt != null) {
        if (a3[a1][a2][i].banneralt == "NEW") {
          htmldombuilder("img", "bannerleft", {
            addon: {
              src: "Assets/BannerAlt/NEW.png"
            }
          }, document.getElementsByClassName(a1)[0].getElementsByClassName(a2)[0].getElementsByClassName("parent")[i])
        }
      }
      if (a3[a1][a2][i].tags != null) {
        for (let ii = 0; ii < a3[a1][a2][i].tags.length; ii++) {
          htmldombuilder("img", "tag" + (ii + 1), {
            addon: {
              src: "Assets/TagIcons/EN/" + a3[a1][a2][i].tags[ii] + ".png"
            }
          }, document.getElementsByClassName(a1)[0].getElementsByClassName(a2)[0].getElementsByClassName("tags_en")[i])
          htmldombuilder("img", "tag" + (ii + 1), {
            addon: {
              src: "Assets/TagIcons/CN/" + a3[a1][a2][i].tags[ii] + ".png"
            }
          }, document.getElementsByClassName(a1)[0].getElementsByClassName(a2)[0].getElementsByClassName("tags_cn")[i])
        }
      }
      spantextbuild(a3[a1][a2][i].names, a3[a1][a2][i].names, document.getElementsByClassName(a1)[0].getElementsByClassName(a2)[0].getElementsByClassName("parent")[i])
    }
  }
}

function autocomplete(inp, arr) {
  var currentFocus;
  inp.addEventListener("input", function(e) {
      var a, b, i, val = this.value;
      closeAllLists();
      if (!val) { return false;}
      currentFocus = -1;
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      this.parentNode.appendChild(a);
      for (i = 0; i < arr.length; i++) {
        if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
          b = document.createElement("DIV");
          b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
          b.innerHTML += arr[i].substr(val.length);
          b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
              b.addEventListener("click", function(e) {
              inp.value = this.getElementsByTagName("input")[0].value;
              closeAllLists();
          });
          a.appendChild(b);
        }
      }
  });
  inp.addEventListener("keydown", function(e) {
      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) {
        currentFocus++;
        addActive(x);
      } else if (e.keyCode == 38) {
        currentFocus--;
        addActive(x);
      } else if (e.keyCode == 13) {
        e.preventDefault();
        if (currentFocus > -1) {
          if (x) x[currentFocus].click();
        }
      }
  });
  function addActive(x) {
    if (!x) return false;
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
      x[i].parentNode.removeChild(x[i]);
    }
  }
}
document.addEventListener("click", function (e) {
    closeAllLists(e.target);
});
}