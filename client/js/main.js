import { supabase } from "./supabase-config.js";
const grid = document.getElementById("gameGrid");

async function loadGames() {

    const { data, error } = await supabase

        .from("games")

        .select("*")

        .eq("status", "approved")

        .order("created_at", { ascending: false });

    if (error) {

        console.error(error);

        return;

    }

    grid.innerHTML = "";

    data.forEach(game => {

        grid.innerHTML += `

        <div class="game-card" data-id="${game.id}">

            <div class="slot">

                <img src="assets/cartridges/slot.svg">

            </div>

            <div class="cartridge">

                <img class="label"

                     src="${game.cartridge_image}">

                <img class="frame"

                     src="assets/cartridges/retroholic-frame.svg">

            </div>

            <div class="pcb">

                <img src="assets/cartridges/pcb.svg">

            </div>

            <div class="game-info">

                <h3>${game.title}</h3>

                <p>

                    ${game.category || "Unknown"}<br>

                    ${new Date(game.created_at).getFullYear()}

                </p>

            </div>

        </div>

        `;

    });

    grid.querySelectorAll(".game-card").forEach(card => {

        card.addEventListener("click", () => {

            window.location.href =

                `game.html?id=${card.dataset.id}`;

        });

    });

}

if (grid) {

    loadGames();

}

grid?.addEventListener("click", (e) => {

    const card = e.target.closest(".game-card");

    if (!card) return;

    window.location.href =

        `game.html?id=${card.dataset.id}`;

});

import clerk from "./auth.js";
const role = clerk.user?.publicMetadata?.role;

const nav = document.getElementById("nav-auth");

if (nav) {

    if (clerk.user) {

        nav.innerHTML = `
<div class="nav-profile">

    <img src="${clerk.user.imageUrl}" class="nav-avatar">

    <span>${clerk.user.username || clerk.user.firstName || "PLAYER"}</span>

    <div class="profile-dropdown">

        <a href="#" id="profile-link">

    👤Profile

</a>

        <a href="/creator-dashboard.html">

            🎮 Creator

        </a>

        ${role === "creator"
                ? `
            <a href="dashboard.html">

                🛠 Admin

            </a>
            `
                : ""
            }

        <button id="logout-dropdown">

            🚪 Logout

        </button>

    </div>

</div>
`;

        const profile = nav.querySelector(".nav-profile");

        document.getElementById("profile-link").addEventListener("click", async (e) => {

            e.preventDefault();

            e.stopPropagation();

            profile.classList.remove("open");

            const { data } = await supabase

                .from("profiles")

                .select("id")

                .eq("clerk_id", clerk.user.id)

                .maybeSingle();

            if (data) {

                window.location.href = "/profile.html";

            } else {

                window.location.href = "/profile-setup.html";

            }

        });

        profile.addEventListener("click", (e) => {

            e.stopPropagation();

            profile.classList.toggle("open");

        });

        document.addEventListener("click", () => {

            profile.classList.remove("open");

        });

        document
            .getElementById("logout-dropdown")
            .addEventListener("click", async (e) => {

                e.stopPropagation();

                await clerk.signOut();

                window.location.href = "/";

            });

    } else {

        nav.innerHTML = `
        <a href="/login.html" class="login-btn">

            LOGIN

        </a>
    `;

    }

}

const logout = document.getElementById("logout-dropdown");

if (logout) {

    logout.addEventListener("mouseenter", () => {

        document.body.classList.add("logout-hover");

    });

    logout.addEventListener("mouseleave", () => {

        document.body.classList.remove("logout-hover");

    });

}
