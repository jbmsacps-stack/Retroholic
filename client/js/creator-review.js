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
   GET CREATOR ID
========================================= */

const creatorId = new URLSearchParams(window.location.search).get("id");

if (!creatorId) {

    window.location.href = "/dashboard.html";

}

/* =========================================
   ELEMENTS
========================================= */

const avatar = document.getElementById("creator-avatar");

const creatorName = document.getElementById("creator-name");

const creatorType = document.getElementById("creator-type");

const creatorCountry = document.getElementById("creator-country");

const creatorDate = document.getElementById("creator-date");

const creatorAbout = document.getElementById("creator-about");

const creatorExperience = document.getElementById("creator-experience");

const publishingTypes = document.getElementById("publishing-types");

const website = document.getElementById("website-link");

const github = document.getElementById("github-link");

const itch = document.getElementById("itch-link");

const youtube = document.getElementById("youtube-link");

const status = document.getElementById("creator-status");

const rejectionReason = document.getElementById("rejection-reason");

const approveBtn = document.getElementById("approve-btn");

const rejectBtn = document.getElementById("reject-btn");

/* =========================================
   LOAD CREATOR
========================================= */

async function loadCreator() {

    const { data, error } = await supabase

        .from("profiles")

        .select("*")

        .eq("clerk_id", creatorId)

        .single();

    if (error || !data) {

        console.error(error);

        return;

    }

    avatar.src = data.avatar_url || "/assets/default-avatar.png";

    creatorName.textContent =

        data.creator_name ||

        data.display_name ||

        "Unknown";

    creatorType.textContent =

        data.creator_type ||

        "Creator";

    creatorCountry.textContent =

        data.country ||

        "Unknown Country";

    creatorDate.textContent =

        "Applied " +

        new Date(data.created_at).toLocaleDateString();

    creatorAbout.textContent =

        data.about_creator ||

        "No information provided.";

    creatorExperience.textContent =

        data.developer_experience ||

        "Unknown";

    status.textContent =

        data.creator_status.toUpperCase();

    status.className =

        "status " + data.creator_status;

    publishingTypes.innerHTML = "";

    (data.publishing_types || []).forEach(type => {

        publishingTypes.innerHTML += `

            <span>${type}</span>

        `;

    });

    setupLink(

        website,

        data.website,

        "Website"

    );

    setupLink(

        github,

        data.github,

        "GitHub"

    );

    setupLink(

        itch,

        data.itch_io,

        "itch.io"

    );

    setupLink(

        youtube,

        data.youtube_channel,

        "YouTube"

    );

}

loadCreator();

/* =========================================
   LINKS
========================================= */

function setupLink(element, url, label) {

    if (url) {

        element.href = url;

        element.textContent = label;

    } else {

        element.removeAttribute("href");

        element.textContent = "Not Provided";

        element.style.opacity = ".45";

        element.style.pointerEvents = "none";

    }

}

/* =========================================
   APPROVE
========================================= */

approveBtn.addEventListener("click", async () => {

    approveBtn.disabled = true;

    const { error } = await supabase

        .from("profiles")

        .update({

            creator_status: "approved",

            creator_rejection_reason: null

        })

        .eq("clerk_id", creatorId);

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

        .from("profiles")

        .update({

            creator_status: "rejected",

            creator_rejection_reason:

                rejectionReason.value.trim()

        })

        .eq("clerk_id", creatorId);

    if (error) {

        console.error(error);

        rejectBtn.disabled = false;

        return;

    }

    window.location.href = "/dashboard.html";

});