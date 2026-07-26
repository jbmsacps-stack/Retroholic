import clerk from "./auth.js";
import { supabase } from "./supabase-config.js";

/* =========================================
   AUTH
========================================= */

const user = clerk.user;

if (!user) {

    window.location.href = "/login.html";

}

/* =========================================
   LOAD PROFILE
========================================= */

const { data: profile, error } = await supabase

    .from("profiles")

    .select("*")

    .eq("clerk_id", user.id)

    .maybeSingle();

if (error || !profile) {

    window.location.href = "/profile-setup.html";

}

/* =========================================
   PROFILE INFO
========================================= */

document.getElementById("profile-avatar").src =
    profile.avatar_url || user.imageUrl;

document.getElementById("profile-name").textContent =
    profile.display_name || "PLAYER";

document.getElementById("profile-username").textContent =
    "@" + (profile.username || "player");

document.getElementById("profile-bio").textContent =
    profile.bio || "No bio yet.";

document.getElementById("joined-date").textContent =
    "Joined " +
    new Date(profile.created_at).toLocaleDateString("en-US", {

        month:"long",

        year:"numeric"

    });

/* =========================================
   PLAYER STATS
========================================= */

document.getElementById("games-played").textContent = 0;

document.getElementById("achievements-count").textContent = 0;

document.getElementById("downloads-count").textContent = 0;

document.getElementById("favorites-count").textContent = 0;

/* =========================================
   CREATOR BUTTON
========================================= */

const creatorBtn =
    document.getElementById("creator-btn");

const creatorDescription =
    document.getElementById("creator-description");

const myGames =
    document.getElementById("my-games-section");

switch(profile.creator_status){

    case "approved":

        creatorBtn.textContent =
            "CREATOR DASHBOARD";

        creatorDescription.textContent =
            "You are an approved Retroholic Creator.";

        creatorBtn.onclick = ()=>{

            window.location.href =
                "/creator-dashboard.html";

        };

        myGames.style.display = "block";

        break;

    case "pending":

        creatorBtn.textContent =
            "APPLICATION PENDING";

        creatorDescription.textContent =
            "Your creator application is currently under review.";

        creatorBtn.onclick = ()=>{

            window.location.href =
                "/creator-dashboard.html";

        };

        break;

    case "rejected":

        creatorBtn.textContent =
            "VIEW APPLICATION";

        creatorDescription.textContent =
            "Your application needs some changes before approval.";

        creatorBtn.onclick = ()=>{

            window.location.href =
                "/creator-dashboard.html";

        };

        break;

    default:

        creatorBtn.textContent =
            "BECOME A CREATOR";

        creatorDescription.textContent =
            "Become a verified creator and publish your own games on Retroholic.";

        creatorBtn.onclick = ()=>{

            window.location.href =
                "/creator-application.html";

        };

}

/* =========================================
   LOGOUT
========================================= */

document.getElementById("logout-btn").onclick =
async ()=>{

    await clerk.signOut();

    window.location.href="/";

};

if (clerk.user.publicMetadata.role === "admin") {

    const actions = document.querySelector(".profile-actions");

    actions.insertAdjacentHTML(

        "afterbegin",

        `
        <a href="/admin/dashboard.html"
           class="action-btn">
           ADMIN PANEL
        </a>
        `

    );

}