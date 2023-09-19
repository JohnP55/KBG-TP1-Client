class BookmarksManager_API {
    static API_URL() { return "https://kbg-tp1-serveur.glitch.me/api" };
    static BOOKMARKS_API_URL() { return this.API_URL() + "/bookmarks" };
    static CATEGORIES_API_URL() { return this.API_URL() + "/categories" };
    static async GetBookmarks(id = null, categoryId = null) {
        return new Promise(resolve => {
            $.ajax({
                url: this.BOOKMARKS_API_URL() + (id != null ? "/" + id : "") + (categoryId != null ? "?categoryId=" + categoryId : ""),
                success: bookmarks => { resolve(bookmarks); },
                error: (xhr) => { console.log(xhr); resolve(null); }
            });
        });
    }
    static async SaveBookmark(bookmark, create = true) {
        return new Promise(resolve => {
            $.ajax({
                url: this.BOOKMARKS_API_URL(),
                type: create ? "POST" : "PUT",
                contentType: 'application/json',
                data: JSON.stringify(bookmark),
                success: (/*data*/) => { resolve(true); },
                error: (/*xhr*/) => { resolve(false /*xhr.status*/); }
            });
        });
    }
    static async DeleteBookmark(id) {
        return new Promise(resolve => {
            $.ajax({
                url: this.BOOKMARKS_API_URL() + "/" + id,
                type: "DELETE",
                success: () => { resolve(true); },
                error: (/*xhr*/) => { resolve(false /*xhr.status*/); }
            });
        });
    }

    static async GetCategories(id = null) {
        return new Promise(resolve => {
            $.ajax({
                url: this.CATEGORIES_API_URL() + (id != null ? "/" + id : ""),
                success: categories => { resolve(categories); },
                error: (xhr) => { console.log(xhr); resolve(null); }
            });
        });
    }
}