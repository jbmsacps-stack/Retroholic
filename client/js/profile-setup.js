import clerk from "./auth.js";
import { supabase } from "./supabase-config.js";

const user = clerk.user;

if (!user) {

    window.location.href = "/login.html";

}

const avatar = document.getElementById("avatar-preview");

const displayName = document.getElementById("display-name");

const username = document.getElementById("username");

const bio = document.getElementById("bio");

const github = document.getElementById("github");

const website = document.getElementById("website");

const youtube = document.getElementById("youtube");

const discord = document.getElementById("discord");

const saveBtn = document.querySelector(".save-btn");

const genreButtons = document.querySelectorAll(".genre-grid button");

let selectedGenres = [];

genreButtons.forEach(button => {

    button.addEventListener("click", () => {

        button.addEventListener("click", () => {

            if (!button.classList.contains("active") && selectedGenres.length >= 3) {

                alert("You can select up to 3 genres.");

                return;

            }

            button.classList.toggle("active");

            selectedGenres = [...document.querySelectorAll(".genre-grid button.active")]

                .map(btn => btn.textContent);

        });

        selectedGenres = [...document.querySelectorAll(".genre-grid button.active")]

            .map(btn => btn.textContent);

    });

});

avatar.src = user.imageUrl;

displayName.value =
    user.fullName ||
    user.firstName ||
    "";

username.value =
    user.username ||
    user.primaryEmailAddress.emailAddress.split("@")[0];

async function loadProfile() {

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("clerk_id", user.id)
        .maybeSingle();

    if (!data) return;

    displayName.value = data.display_name ?? displayName.value;

    username.value = data.username ?? username.value;

    bio.value = data.bio ?? "";

    github.value = data.github ?? "";

    website.value = data.website ?? "";

    youtube.value = data.youtube ?? "";

    discord.value = data.discord ?? "";

    if (data.avatar_url) {

        avatar.src = data.avatar_url;

    }

    selectedGenres = data.genres || [];

    genreButtons.forEach(button => {

        if (selectedGenres.includes(button.textContent)) {

            button.classList.add("active");

        }

    });

}

loadProfile();

saveBtn.addEventListener("click", saveProfile);

async function saveProfile() {

    saveBtn.textContent = "SAVING...";

    const profile = {

        clerk_id: user.id,

        email: user.primaryEmailAddress.emailAddress,

        display_name: displayName.value.trim(),

        username: username.value.trim(),

        bio: bio.value.trim(),

        github: github.value.trim(),

        website: website.value.trim(),

        youtube: youtube.value.trim(),

        discord: discord.value.trim(),

        avatar_url: avatar.src,

        genres: selectedGenres

    };

    const { error } = await supabase

        .from("profiles")

        .upsert(profile, {

            onConflict: "clerk_id"

        });

    if (error) {

        console.error(error);

        saveBtn.textContent = "FAILED";

        return;

    }

    saveBtn.textContent = "PLAYER DATA SAVED";

    setTimeout(() => {

        window.location.href = "/profile.html";

    }, 1000);

}

console.log({
    clerkId: user.id,
    email: user.primaryEmailAddress.emailAddress,
    username: username.value,
    displayName: displayName.value
});