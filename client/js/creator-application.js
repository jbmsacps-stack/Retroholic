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
   ELEMENTS
========================================= */

const avatar = document.getElementById("player-avatar");

const playerName = document.getElementById("player-name");

const playerEmail = document.getElementById("player-email");

const creatorName = document.getElementById("creator-name");

const country = document.getElementById("country");

const ageGroup = document.getElementById("age-group");

const creatorType = document.getElementById("creator-type");

const aboutCreator = document.getElementById("about-creator");

const website = document.getElementById("website");

const github = document.getElementById("github");

const itch = document.getElementById("itch-io");

const steam = document.getElementById("steam");

const youtube = document.getElementById("youtube");

const agreement = document.getElementById("agreement");

const submitBtn = document.getElementById("submit-application");

const publishButtons = document.querySelectorAll(".publish-grid button");

const guidelineBtn = document.getElementById("toggle-guidelines");

const guidelineContent = document.getElementById("guidelines-content");

/* =========================================
   STATE
========================================= */

let publishingTypes = [];

/* =========================================
   LOAD CLERK INFO
========================================= */

avatar.src = user.imageUrl;

playerName.textContent =

    user.fullName ||

    user.firstName ||

    "PLAYER";

playerEmail.textContent =

    user.primaryEmailAddress.emailAddress;

/* =========================================
   LOAD PROFILE
========================================= */

async function loadProfile() {

    const { data } = await supabase

        .from("profiles")

        .select("*")

        .eq("clerk_id", user.id)

        .maybeSingle();

    if (!data) return;

    creatorName.value =

        data.creator_name ||

        data.display_name ||

        "";

    website.value = data.website || "";

    github.value = data.github || "";

    itch.value = data.itch_io || "";

    steam.value = data.steam || "";

    youtube.value = data.youtube_channel || "";

    aboutCreator.value = data.about_creator || "";

    creatorType.value = data.creator_type || "";

    country.value = data.country || "";

    ageGroup.value = data.age_group || "";

    publishingTypes = data.publishing_types || [];

    publishButtons.forEach(button => {

        if (publishingTypes.includes(button.textContent)) {

            button.classList.add("active");

        }

    });

}

loadProfile();

const countries = [

    "Australia",
    "Bangladesh",
    "Brazil",
    "Canada",
    "China",
    "France",
    "Germany",
    "India",
    "Indonesia",
    "Italy",
    "Japan",
    "Malaysia",
    "Mexico",
    "Nepal",
    "Pakistan",
    "Philippines",
    "Singapore",
    "South Africa",
    "South Korea",
    "Sri Lanka",
    "Thailand",
    "United Arab Emirates",
    "United Kingdom",
    "United States",
    "Vietnam"

];

countries.forEach(name => {

    const option = document.createElement("option");

    option.value = name;

    option.textContent = name;

    country.appendChild(option);

});

/* =========================================
   PUBLISH TYPES
========================================= */

publishButtons.forEach(button => {

    button.addEventListener("click", () => {

        button.classList.toggle("active");

        publishingTypes =

            [...document.querySelectorAll(".publish-grid button.active")]

                .map(button => button.textContent);

    });

});

/* =========================================
   GUIDELINES
========================================= */

guidelineBtn.addEventListener("click", () => {

    guidelineContent.classList.toggle("open");

    guidelineBtn.textContent =

        guidelineContent.classList.contains("open")

            ? "▼ CREATOR GUIDELINES"

            : "▶ READ CREATOR GUIDELINES";

});

/* =========================================
   VALIDATION
========================================= */

function validate() {

    if (!creatorName.value.trim()) {

        showError(

            creatorName,

            "Creator name is required."

        );

        creatorName.focus();

        return false;

    }

    if (!country.value) {

        showError(country, "Please choose your country.");

        country.focus();

        return false;

    }

    if (!ageGroup.value) {

        showError(ageGroup, "Select your age group.");

        ageGroup.focus();

        return false;

    }

    if (!creatorType.value) {

        showError(creatorType, "Choose your creator type.");

        creatorType.focus();

        return false;

    }

    if (aboutCreator.value.trim().length < 50) {

        showError(
            aboutCreator,
            "Please tell us more about yourself (minimum 50 characters)."
        );

        aboutCreator.focus();

        return false;

    }

    if (publishingTypes.length === 0) {

        showError(publishButtons[0].closest(".field"), "Select what you plan to publish.");

        return false;

    }

    if (!agreement.checked) {

        showError(agreement, "Accept the Creator Agreement.");

        return false;

    }

    return true;

}

/* =========================================
   SUBMIT
========================================= */

submitBtn.addEventListener("click", submitApplication);

async function submitApplication(e) {

    e.preventDefault();

    if (!validate()) return;

    submitBtn.disabled = true;

    submitBtn.textContent = "SUBMITTING...";

    const { error } = await supabase

        .from("profiles")

        .update({

            creator_status: "pending",

            creator_name: creatorName.value.trim(),

            country: country.value,

            age_group: ageGroup.value,

            creator_type: creatorType.value,

            publishing_types: publishingTypes,

            developer_experience:

                document.querySelector(

                    'input[name="experience"]:checked'

                )?.value || "",

            about_creator: aboutCreator.value.trim(),

            website: website.value.trim(),

            github: github.value.trim(),

            itch_io: itch.value.trim(),

            steam: steam.value.trim(),

            youtube_channel: youtube.value.trim()

        })

        .eq("clerk_id", user.id);

    if (error) {

        console.error(error);

        submitBtn.disabled = false;

        submitBtn.textContent = "SUBMIT APPLICATION";

        return;

    }

    window.location.href = "/creator-pending.html";

}

function showError(input,message){

    const field=input.closest(".field");

    if(!field) return;

    field.classList.remove("error");

    field.offsetHeight;

    field.classList.add("error");

    const error=field.querySelector(".error-message");

    if(error){

        error.textContent=message;

    }

}

function clearError(input) {

    const field = input.closest(".field");

    if (!field) return;

    field.classList.remove("error");

}

document.querySelectorAll(

    ".field input, .field textarea, .field select"

).forEach(input => {

    input.addEventListener("input", () => {

        clearError(input);

    });

});