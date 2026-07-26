import clerk from "../js/auth.js";
import { supabase } from "../js/supabase-config.js";

const user = clerk.user;

if (!user) {

    window.location.href = "/login.html";

}

if (user.publicMetadata.role !== "creator") {

    window.location.href = "/";

}

/* =========================
   DASHBOARD COUNTS
========================= */

async function loadCounts() {

    const [

        creators,

        games,

        users

    ] = await Promise.all([

        supabase

            .from("profiles")

            .select("*", {

                count: "exact",

                head: true

            })

            .eq("creator_status", "pending"),

        supabase

            .from("games")

            .select("*", {

                count: "exact",

                head: true

            })

            .eq("status", "pending"),

        supabase

            .from("profiles")

            .select("*", {

                count: "exact",

                head: true

            })

    ]);

    document.getElementById("pending-creators").textContent =

        creators.count || 0;

    document.getElementById("pending-games").textContent =

        games.count || 0;

    document.getElementById("total-users").textContent =

        users.count || 0;

}

loadCounts();

/* =========================
   PENDING CREATORS
========================= */

async function loadPendingCreators() {

    const { data, error } = await supabase

        .from("profiles")

        .select("*")

        .eq("creator_status", "pending")

        .order("created_at", {

            ascending: false

        })

        .limit(5);

    if (error) {

        console.error(error);

        return;

    }

    const list = document.getElementById("creator-list");

    list.innerHTML = "";

    if (!data.length) {

        list.innerHTML = `

            <div class="empty">

                No pending creator applications.

            </div>

        `;

        return;

    }

    data.forEach(profile => {

        list.innerHTML += `

        <div class="creator-card">

            <img
                src="${profile.avatar_url || "/assets/default-avatar.png"}"
                class="creator-avatar">

            <div class="creator-info">

                <h3>

                    ${profile.creator_name || profile.display_name}

                </h3>

                <p>

                    ${profile.country || "Unknown Country"}

                </p>

                <small>

                    ${profile.creator_type || "Creator"}

                </small>

            </div>

            <button
    class="review-btn"
    data-id="${profile.clerk_id}">

    REVIEW →

</button>

        </div>

        `;

    });

}

loadPendingCreators();

document.addEventListener("click", e => {

    const button = e.target.closest(".review-btn");

    if (!button) return;

    const id = button.dataset.id;

    window.location.href =
        `/creator-review.html?id=${id}`;

});

async function loadPendingGames() {

    const { data, error } = await supabase

        .from("games")

        .select("*")

        .eq("status", "pending")

        .order("created_at", {

            ascending: false

        })

        .limit(5);

    if (error) {

        console.error(error);

        return;

    }

    const list = document.getElementById("game-list");

    list.innerHTML = "";

    if (!data.length) {

        list.innerHTML = `

            <div class="empty">

                No pending game uploads.

            </div>

        `;

        return;

    }

    data.forEach(game => {

        list.innerHTML += `

        <div class="creator-card">

            <img
                src="${game.cartridge_image || "/assets/default-game.png"}"
                class="creator-avatar">

            <div class="creator-info">

                <h3>${game.title}</h3>

                <p>${game.category || game.genre || "Unknown"}</p>

                <small>${game.version}</small>

            </div>

            <button
    class="game-review-btn"
    data-id="${game.id}">

    REVIEW →

</button>

        </div>

        `;

    });

}

loadPendingGames();

document.addEventListener("click", e => {

    const button = e.target.closest(".game-review-btn");

    if (!button) return;

    window.location.href =

        `/game-review.html?id=${button.dataset.id}`;

});