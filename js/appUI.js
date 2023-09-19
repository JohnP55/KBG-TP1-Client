//<span class="cmdIcon fa-solid fa-ellipsis-vertical"></span>
let contentScrollPosition = 0;
let currentCategory = null;
Init_UI();

function Init_UI() {
    renderBookmarks();
    $("#allCategoriesCmd").on("click", () => {
        currentCategory = null;
        renderBookmarks();
    });
    $('#createBookmark').on("click", async function () {
        saveContentScrollPosition();
        renderCreateBookmarkForm();
    });
    $('#abort').on("click", async function () {
        renderBookmarks();
    });
    $('#aboutCmd').on("click", function () {
        renderAbout();
    });
}

function renderAbout() {
    saveContentScrollPosition();
    eraseContent();
    $("#createBookmark").hide();
    $("#abort").show();
    $("#actionTitle").text("À propos...");
    $("#content").append(
        $(`
            <div class="aboutContainer">
                <h2>Gestionnaire de favoris</h2>
                <hr>
                <p>
                    Petite application de gestion de favoris à titre de démonstration
                    d'interface utilisateur monopage réactive.
                </p>
                <p>
                    Auteur: Nicolas Chourot et Yannick Turpin
                </p>
                <p>
                    Collège Lionel-Groulx, automne 2023
                </p>
            </div>
        `))
}
async function renderBookmarks() {
    showWaitingGif();
    $("#actionTitle").text("Liste des favoris");
    $("#createBookmark").show();
    $("#abort").hide();
    let bookmarks = await BookmarksManager_API.GetBookmarks(null, currentCategory);
    let categories = await BookmarksManager_API.GetCategories();
    eraseContent();
    if (bookmarks !== null) {
        bookmarks.forEach(bookmark => {
            $("#content").append(renderBookmark(bookmark, categories));
        });
        if ($("#content").children().length == 0) {
            $("#content").append(`<div class="noBookmarksContainer"><h2>Aucun favori${currentCategory != null ? " dans cette catégorie" : ""}.</h2></div>`);
        }
        $("#categoriesCmds").empty();
        categories.forEach((category) => {
            $("#categoriesCmds").append(`<div class="dropdown-item" id="category${category.Id}Cmd">${category.Name}</div>`);
            $(`#category${category.Id}Cmd`).on("click", () => {
                currentCategory = category.Id;
                renderBookmarks();
            });
        });
        $("#selectedCategoryCheckmark").remove();
        $(currentCategory == null ? "#allCategoriesCmd" : `#category${currentCategory}Cmd`).prepend('<i id="selectedCategoryCheckmark" class="fa fa-check"></i>    ');
        restoreContentScrollPosition();
        // Attached click events on command icons
        $(".editCmd").on("click", function () {
            saveContentScrollPosition();
            renderEditBookmarkForm(parseInt($(this).attr("editBookmarkId")));
        });
        $(".deleteCmd").on("click", function () {
            saveContentScrollPosition();
            renderDeleteBookmarkForm(parseInt($(this).attr("deleteBookmarkId")));
        });
    } else {
        renderError("Service introuvable");
    }
}
function showWaitingGif() {
    $("#content").empty();
    $("#content").append($("<div class='waitingGifcontainer'><img class='waitingGif' src='Loading_icon.gif' /></div>'"));
}
function eraseContent() {
    $("#content").empty();
}
function saveContentScrollPosition() {
    contentScrollPosition = $("#content")[0].scrollTop;
}
function restoreContentScrollPosition() {
    $("#content")[0].scrollTop = contentScrollPosition;
}
function renderError(message) {
    eraseContent();
    $("#content").append(
        $(`
            <div class="errorContainer">
                ${message}
            </div>
        `)
    );
}
function renderCreateBookmarkForm() {
    renderBookmarkForm();
}
async function renderEditBookmarkForm(id) {
    showWaitingGif();
    let bookmark = await BookmarksManager_API.GetBookmarks(id);
    if (bookmark !== null)
        renderBookmarkForm(bookmark);
    else
        renderError("Favori introuvable!");
}
async function renderDeleteBookmarkForm(id) {
    showWaitingGif();
    $("#createBookmark").hide();
    $("#abort").show();
    $("#actionTitle").text("Retrait");
    let bookmark = await BookmarksManager_API.GetBookmarks(id);
    let category = await BookmarksManager_API.GetCategories(bookmark.CategoryId);
    eraseContent();
    if (bookmark !== null) {
        $("#content").append(`
        <div class="bookmarkdeleteForm">
            <h4>Effacer le bookmark suivant?</h4>
            <br>
            <div class="bookmarkRow" bookmark_id=${bookmark.Id}">
                <div class="bookmarkContainer">
                    <div class="bookmarkLayout">
                        <div class="bookmarkName"><img class="bookmarkFavicon" src="https://www.google.com/s2/favicons?domain=${bookmark.Url}&sz=64" alt="">    ${bookmark.Name}</div>
                        <div class="bookmarkLink"><i>${bookmark.Url}</i></div>
                        <span class="bookmarkCategory">${category.Name}</span>
                    </div>
                </div>  
            </div>   
            <br>
            <input type="button" value="Effacer" id="deleteBookmark" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </div>    
        `);
        $('#deleteBookmark').on("click", async function () {
            showWaitingGif();
            let result = await BookmarksManager_API.DeleteBookmark(bookmark.Id);
            if (result)
                renderBookmarks();
            else
                renderError("Une erreur est survenue!");
        });
        $('#cancel').on("click", function () {
            renderBookmarks();
        });
    } else {
        renderError("Favori introuvable!");
    }
}
function newBookmark() {
    bookmark = {};
    bookmark.Id = 0;
    bookmark.Name = "";
    bookmark.Url = "";
    bookmark.CategoryId = 0;
    return bookmark;
}
async function renderBookmarkForm(bookmark = null) {
    $("#createBookmark").hide();
    $("#abort").show();
    eraseContent();

    let categories = await BookmarksManager_API.GetCategories();
    let catSelect = '<select class="form-control" id="CategoryId" name="CategoryId" required RequireMessage="Veuillez sélectionner une catégorie." InvalidMessage="Veuillez sélectionner une catégorie valide">';

    categories.forEach(x => {
        catSelect += `<option value="${x.Id}">${x.Name}</option>`;
    });
    catSelect += '</select>';

    let create = bookmark == null;
    if (create) bookmark = newBookmark();
    $("#actionTitle").text(create ? "Création" : "Modification");

    let favicon = create ? "" : `<img class="bookmarkFavicon" src="https://www.google.com/s2/favicons?domain=${bookmark.Url}&sz=64" alt=""></img><br>`
    $("#content").append(`
        <form class="form" id="bookmarkForm">
            <input type="hidden" name="Id" value="${bookmark.Id}"/>
            ${favicon}
            <label for="Name" class="form-label"><b>Titre</b> </label>
            <input 
                class="form-control"
                name="Name" 
                id="Name" 
                placeholder="Nom"
                required
                RequireMessage="Veuillez entrer un nom"
                InvalidMessage="Le nom comporte un caractère illégal" 
                value="${bookmark.Name}"
            />
            <label for="Url" class="form-label"><b>Url</b> </label>
            <input
                class="form-control URL"
                name="Url"
                id="Url"
                placeholder="http://www.example.com/"
                required
                RequireMessage="Veuillez entrer l'URL." 
                InvalidMessage="Veuillez entrer une URL valide"
                value="${bookmark.Url}" 
            />
            <label for="CategoryId" class="form-label"><b>Catégorie</b> </label>
            ${catSelect}
            <br>
            <input type="submit" value="Enregistrer" id="saveBookmark" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </form>
    `);
    initFormValidation();
    $('#bookmarkForm').on("submit", async function (event) {
        event.preventDefault();
        let bookmark = getFormData($("#bookmarkForm"));
        bookmark.Id = parseInt(bookmark.Id);
        bookmark.CategoryId = parseInt(bookmark.CategoryId);
        showWaitingGif();
        let result = await BookmarksManager_API.SaveBookmark(bookmark, create);
        if (result)
            renderBookmarks();
        else
            renderError("Une erreur est survenue!");
    });
    $('#cancel').on("click", function () {
        renderBookmarks();
    });
}

function getFormData($form) {
    const removeTag = new RegExp("(<[a-zA-Z0-9]+>)|(</[a-zA-Z0-9]+>)", "g");
    var jsonObject = {};
    $.each($form.serializeArray(), (index, control) => {
        jsonObject[control.name] = control.value.replace(removeTag, "");
    });
    return jsonObject;
}

function renderBookmark(bookmark, categories) {
    return $(`
        <div class="bookmarkRow" bookmark_id="${bookmark.Id}">
            <div class="bookmarkContainer noselect">
                <div class="bookmarkLayout">
                    <span class="bookmarkName"><img class="bookmarkFavicon" src="https://www.google.com/s2/favicons?domain=${bookmark.Url}&sz=64" alt="">    ${bookmark.Name}</span>
                    <a target="_blank" href="${bookmark.Url}"><i>${bookmark.Url}</i></a>
                    <span class="bookmarkCategory">${categories[bookmark.CategoryId-1].Name}</span>
                </div>
                <div class="bookmarkCommandPanel">
                    <span class="editCmd cmdIcon fa fa-pencil" editBookmarkId="${bookmark.Id}" title="Modifier ${bookmark.Name}"></span>
                    <span class="deleteCmd cmdIcon fa fa-trash" deleteBookmarkId="${bookmark.Id}" title="Effacer ${bookmark.Name}"></span>
                </div>
            </div>
        </div>
    `);
}