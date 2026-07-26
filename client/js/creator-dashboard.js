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

const statusIcon = document.getElementById("status-icon");

const statusTitle = document.getElementById("status-title");

const statusDescription = document.getElementById("status-description");

const rejectionBox = document.getElementById("rejection-box");

const rejectionReason = document.getElementById("rejection-reason");

const actionButton = document.getElementById("status-action");

/* =========================================
   LOAD PROFILE
========================================= */

loadCreatorStatus();

async function loadCreatorStatus() {

    const { data, error } = await supabase

        .from("profiles")

        .select("*")

        .eq("clerk_id", user.id)

        .maybeSingle();

    if (error || !data) {

        statusIcon.textContent = "⚠️";

        statusTitle.textContent = "PROFILE NOT FOUND";

        statusDescription.textContent =
            "Please complete your profile first.";

        actionButton.textContent = "CREATE PROFILE";

        actionButton.onclick = () => {

            window.location.href = "/profile-setup.html";

        };

        return;

    }

    switch (data.creator_status) {

        case "approved":

            showApproved();

            break;

        case "pending":

            showPending();

            break;

        case "rejected":

            showRejected(data.creator_rejection_reason);

            break;

        default:

            showNone();

            break;

    }

}

/* =========================================
   STATES
========================================= */

function showNone() {

    rejectionBox.style.display = "none";

    statusIcon.textContent = "📝";

    statusTitle.textContent = "CREATOR APPLICATION";

    statusTitle.className = "status-none";

    statusDescription.textContent =
        "You haven't applied to become a Retroholic Creator yet.";

    actionButton.disabled = false;

    actionButton.textContent = "APPLY NOW";

    actionButton.onclick = () => {

        window.location.href =
            "/creator-application.html";

    };

}

function showPending() {

    rejectionBox.style.display = "none";

    statusIcon.textContent = "🟡";

    statusTitle.textContent = "APPLICATION PENDING";

    statusTitle.className = "status-pending";

    statusDescription.textContent =
        "Your application is currently being reviewed. Average review time is 24–72 hours.";

    actionButton.disabled = false;

    actionButton.textContent = "REFRESH STATUS";

    setInterval(() => {

        loadCreatorStatus();

    }, 30000);

    actionButton.onclick = () => {

        window.location.reload();

    };

}

function showApproved() {

    rejectionBox.style.display = "none";

    statusIcon.textContent = "🟢";

    statusTitle.textContent = "CREATOR APPROVED";

    statusTitle.className = "status-approved";

    statusDescription.textContent =
        "Congratulations! You are now an official Retroholic Creator.";

    actionButton.disabled = false;

    actionButton.textContent = "UPLOAD GAME";

    actionButton.onclick = () => {

        window.location.href =
            "/upload.html";

    };

}

function showRejected(reason) {

    rejectionBox.style.display = "block";

    rejectionReason.textContent =
        reason || "No reason provided.";

    statusIcon.textContent = "🔴";

    statusTitle.textContent = "APPLICATION REJECTED";

    statusTitle.className = "status-rejected";

    statusDescription.textContent =
        "Your application wasn't approved this time. You may edit your application and submit it again.";

    actionButton.disabled = false;

    actionButton.textContent = "EDIT APPLICATION";

    actionButton.onclick = () => {

        window.location.href =
            "/creator-application.html";

    };

}