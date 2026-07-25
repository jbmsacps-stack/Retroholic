const grid = document.getElementById("gameGrid");
import { supabase } from "./supabase-config.js";
games.forEach(game => {

    grid.innerHTML += `

    <div class="game-card">

        <div class="slot">
            <img src="assets/cartridges/slot.svg">
        </div>

        <div class="cartridge">

            <img class="label" src="${game.image}">

            <img class="frame"
                 src="assets/cartridges/retroholic-frame.svg">

        </div>

        <div class="pcb">
            <img src="assets/cartridges/pcb.svg">
        </div>

        <div class="game-info">

            <h3>${game.title}</h3>

            <p>
                ${game.genre}<br>
                ${game.year}
            </p>

        </div>

    </div>

    `;

});

import clerk from "./auth.js";

const nav = document.getElementById("nav-auth");

if (nav) {

    if (clerk.user) {

        nav.innerHTML = `
        <div class="nav-profile">

            <img src="${clerk.user.imageUrl}" class="nav-avatar">

            <span>${clerk.user.username || clerk.user.firstName || "PLAYER"}</span>

        </div>
    `;

        nav.querySelector(".nav-profile").addEventListener("click", async () => {

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

    } else {

        nav.innerHTML = `
        <a href="/login.html" class="login-btn">

            LOGIN

        </a>
    `;

    }

}