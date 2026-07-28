import { supabase } from "./supabase-config.js";

const params = new URLSearchParams(window.location.search);
const gameId = params.get("id");

if (!gameId) {

    window.location.href = "/";

}

/* ==========================================
   LOAD GAME
========================================== */

async function loadGame() {

    const { data: game, error } = await supabase

        .from("games")

        .select("*")

        .eq("id", gameId)

        .single();

    if (error || !game) {

        console.error(error);

        return;

    }

    await supabase

        .from("games")

        .update({

            views: (game.views || 0) + 1

        })

        .eq("id", game.id);

    game.views = (game.views || 0) + 1;

    /* -------------------------
       Banner
    ------------------------- */

    document.getElementById("game-banner").src =

        game.banner;

    /* -------------------------
       Cartridge
    ------------------------- */

    document.getElementById("game-label").src =

        game.cartridge_image;

    /* -------------------------
       Title
    ------------------------- */

    document.getElementById("game-title").textContent =

        game.title;

    /* -------------------------
       Description
    ------------------------- */

    document.getElementById("game-description").textContent =

        game.description;

    /* -------------------------
       Category
    ------------------------- */

    document.getElementById("game-category").textContent =

        game.category || "Unknown";

    /* -------------------------
       Version
    ------------------------- */

    document.getElementById("game-version").textContent =

        game.version || "-";

    /* -------------------------
       Upload Date
    ------------------------- */

    document.getElementById("game-date").textContent =

        new Date(game.created_at)

            .toLocaleDateString();

    /* -------------------------
       Downloads
    ------------------------- */

    document.getElementById("game-downloads").textContent =

        game.downloads || 0;

    document.getElementById("game-views").textContent =
        game.views || 0;

    /* =====================================
       LOAD CREATOR
    ===================================== */

    const { data: creator } = await supabase

        .from("profiles")

        .select("*")

        .eq("clerk_id", game.owner_id)

        .single();

    if (creator) {

        document.getElementById("game-creator").textContent =

            "by " +

            (creator.creator_name ||

                creator.display_name);

        document.getElementById("creator-name").textContent =

            creator.creator_name ||

            creator.display_name;

        document.getElementById("creator-avatar").src =

            creator.avatar_url ||

            "/assets/default-avatar.png";

        document.getElementById("creator-bio").textContent =

            creator.bio ||

            "Independent Retroholic Creator";

        loadMoreGames(game.owner_id, game.id);

    }

    /* =====================================
       DOWNLOAD
    ===================================== */

    document
        .getElementById("download-btn")
        .onclick = async () => {

            const downloads =
                (game.downloads || 0) + 1;

            await supabase

                .from("games")

                .update({

                    downloads

                })

                .eq("id", game.id);

            document.getElementById(
                "game-downloads"
            ).textContent = downloads;

            window.open(
                game.game_file,
                "_blank"
            );

        };

}

loadGame();

/* ==========================================
   MORE FROM THIS CREATOR
========================================== */

async function loadMoreGames(ownerId, currentGame) {

    const { data } = await supabase

        .from("games")

        .select("*")

        .eq("owner_id", ownerId)

        .eq("status", "approved")

        .neq("id", currentGame)

        .limit(4);

    const container =

        document.getElementById(

            "creator-games"

        );

    container.innerHTML = "";

    if (!data?.length) {

        container.innerHTML =

            "<p>No more games.</p>";

        return;

    }

    data.forEach(game => {

        container.innerHTML += `

<div
class="mini-game"
onclick="location.href='game.html?id=${game.id}'">

<img
src="${game.cartridge_image}">

<p>

${game.title}

</p>

</div>

`;

    });

}