import clerk from "./auth.js";
import { supabase } from "./supabase-config.js";

/* =========================================
   ADMIN CHECK
========================================= */

const user = clerk.user;

if (!user) {

    window.location.href = "/login.html";

}

if (user.publicMetadata.role !== "creator") {

    window.location.href = "/";

}

/* =========================================
   GET GAME ID
========================================= */

const gameId = new URLSearchParams(

    window.location.search

).get("id");

if (!gameId) {

    window.location.href = "/dashboard.html";

}

/* =========================================
   ELEMENTS
========================================= */

const label = document.getElementById("game-label");

const banner = document.getElementById("game-banner");

const title = document.getElementById("game-title");

const meta = document.getElementById("game-meta");

const owner = document.getElementById("game-owner");

const description = document.getElementById("game-description");

const screenshots = document.getElementById("screenshots");

const status = document.getElementById("game-status");

const download = document.getElementById("download-game");

const rejectionReason = document.getElementById("rejection-reason");

const approveBtn = document.getElementById("approve-btn");

const rejectBtn = document.getElementById("reject-btn");

/* =========================================
   LOAD GAME
========================================= */

async function loadGame() {

    const { data, error } = await supabase

        .from("games")

        .select("*")

        .eq("id", gameId)

        .single();

    if (error || !data) {

        console.error(error);

        return;

    }

    label.src =

        data.cartridge_image ||

        "/assets/default-game.png";

    banner.src =

        data.banner ||

        "/assets/default-banner.png";

    title.textContent =

        data.title;

    meta.textContent =

        `${data.category || "Unknown"} • Version ${data.version}`;

    description.textContent =

        data.description ||

        "No description.";

    status.textContent =

        data.status.toUpperCase();

    status.className =

        `status ${data.status}`;

    download.href =

        data.game_file;

    screenshots.innerHTML = "";

    (data.screenshots || []).forEach(image => {

        screenshots.innerHTML += `

            <img src="${image}">

        `;

    });

    /* =========================
       LOAD CREATOR NAME
    ========================= */

    const { data: creator } = await supabase

        .from("profiles")

        .select("display_name, creator_name")

        .eq("clerk_id", data.owner_id)

        .maybeSingle();

    owner.textContent =

        creator?.creator_name ||

        creator?.display_name ||

        "Unknown Creator";

}

loadGame();

/* =========================================
   APPROVE
========================================= */

approveBtn.addEventListener("click", async () => {

    approveBtn.disabled = true;

    const { error } = await supabase

        .from("games")

        .update({

            status: "approved",

            rejection_reason: null

        })

        .eq("id", gameId);

    if (error) {

        console.error(error);

        approveBtn.disabled = false;

        return;

    }

    window.location.href = "/dashboard.html";

});

/* =========================================
   REJECT
========================================= */

rejectBtn.addEventListener("click", async () => {

    rejectBtn.disabled = true;

    const { error } = await supabase

        .from("games")

        .update({

            status: "rejected",

            rejection_reason:

                rejectionReason.value.trim()

        })

        .eq("id", gameId);

    if (error) {

        console.error(error);

        rejectBtn.disabled = false;

        return;

    }

    window.location.href = "/dashboard.html";

});