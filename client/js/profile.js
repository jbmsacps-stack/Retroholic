import clerk from "./auth.js";
import { supabase } from "./supabase-config.js";

const user = clerk.user;

if (!user) {

    window.location.href = "/login.html";

}

const { data: profile } = await supabase

    .from("profiles")

    .select("*")

    .eq("clerk_id", user.id)

    .maybeSingle();

if (!profile) {

    window.location.href = "/profile-setup.html";

}

document.getElementById("profile-avatar").src =
    profile.avatar_url || user.imageUrl;

document.getElementById("profile-name").textContent =
    profile.display_name;

document.getElementById("profile-username").textContent =
    "@" + profile.username;

document.getElementById("profile-bio").textContent =
    profile.bio || "No bio yet.";

document.getElementById("joined-date").textContent =
    "Joined " +
    new Date(profile.created_at).toLocaleDateString("en-US", {

        month: "long",

        year: "numeric"

    });

document.getElementById("games-count").textContent = 0;

document.getElementById("downloads-count").textContent = 0;

document.getElementById("likes-count").textContent = 0;

document.getElementById("followers-count").textContent = 0;

document.getElementById("logout-btn").onclick = async () => {

    await clerk.signOut();

    window.location.href = "/";

};