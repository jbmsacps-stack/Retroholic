import { supabase } from "./supabase-config.js";
import clerk from "./auth.js";
let currentStep = 1;

const totalSteps = 4;

const nextBtn = document.getElementById("next-btn");

const backBtn = document.getElementById("back-btn");

const stepNumber = document.getElementById("current-step");

const steps = document.querySelectorAll(".step-content");

const titleInput = document.getElementById("title");

const shortDescriptionInput = document.getElementById("short-description");

const genreSelect = document.getElementById("genre");

const versionInput = document.getElementById("version");

const visibilityInputs = Array.from(document.querySelectorAll('input[name="visibility"]'));

const labelDrop = document.getElementById("label-drop");

const bannerDrop = document.getElementById("banner-drop");

const zipDrop = document.getElementById("zip-drop");

let isPublishing = false;

const allowedImageTypes = ["image/png", "image/jpeg", "image/webp"];

const maxImageSizes = {

    label: 5 * 1024 * 1024,

    banner: 8 * 1024 * 1024,

    screenshot: 5 * 1024 * 1024

};

const maxZipSize = 500 * 1024 * 1024;

const uploadData = {

    title: "",

    shortDescription: "",

    genre: "",

    version: "",

    visibility: "public",

    label: null,

    banner: null,

    screenshots: [],

    gameFile: null

};

/* =========================
   STEP NAVIGATION
========================= */

function showStep(step) {

    if (!steps.length || !stepNumber || !nextBtn || !backBtn) return;

    steps.forEach((section, index) => {

        section.style.display =
            index + 1 === step
                ? "block"
                : "none";

    });

    currentStep = step;

    stepNumber.textContent = step;

    backBtn.disabled = step === 1 || isPublishing;

    nextBtn.disabled = isPublishing;

    nextBtn.textContent =
        step === totalSteps
            ? (isPublishing ? "PUBLISHING..." : "PUBLISH")
            : "NEXT →";

}

createProgressUI();

nextBtn.addEventListener("click", () => {

    if (isPublishing) return;

    if (currentStep === 1 && !validateStep1()) {

        return;

    }

    if (currentStep === 2 && !validateStep2()) {

        return;

    }

    if (currentStep === 3 && !validateStep3()) {

        return;

    }

    if (currentStep === totalSteps) {

        publishGame();

        return;

    }

    currentStep++;

    showStep(currentStep);

});

backBtn.addEventListener("click", () => {

    if (isPublishing) return;

    if (currentStep > 1) {

        currentStep--;

        showStep(currentStep);

    }

});

/* =========================
   DROP ZONES
========================= */

setupDropZone(

    "label-drop",

    "label-input",

    "label-preview",

    "label"

);

setupDropZone(

    "banner-drop",

    "banner-input",

    "banner-preview",

    "banner"

);

function setupDropZone(

    dropId,

    inputId,

    previewId,

    key

) {

    const drop = document.getElementById(dropId);

    const input = document.getElementById(inputId);

    const preview = document.getElementById(previewId);

    if (!drop || !input || drop.dataset.bound === "true") return;

    drop.dataset.bound = "true";

    drop.addEventListener("click", () => {

        clearFieldError(drop);

        input.click();

    });

    input.addEventListener("change", () => {

        if (!input.files.length) return;

        handleImageSelection(input.files[0], preview, drop, key);

    });

    drop.addEventListener("dragenter", (e) => {

        e.preventDefault();

        drop.classList.add("dragging");

    });

    drop.addEventListener("dragover", (e) => {

        e.preventDefault();

        drop.classList.add("dragging");

    });

    drop.addEventListener("dragleave", (e) => {

        e.preventDefault();

        if (!drop.contains(e.relatedTarget)) {

            drop.classList.remove("dragging");

        }

    });

    drop.addEventListener("drop", (e) => {

        e.preventDefault();

        drop.classList.remove("dragging");

        const file = e.dataTransfer.files[0];

        if (!file) return;

        handleImageSelection(file, preview, drop, key);

    });

}

function loadImage(

    file,

    preview,

    key

) {

    uploadData[key] = file;

    if (!preview) return;

    const reader = new FileReader();

    reader.onload = e => {

        preview.src = e.target.result;

        preview.style.display = "block";

    };

    reader.readAsDataURL(file);

}

function validateImageFile(file, key) {

    if (!file) return { valid: false, message: "Please choose an image file." };

    if (!allowedImageTypes.includes(file.type)) {

        return { valid: false, message: "Only PNG, JPEG, or WebP images are allowed." };

    }

    const maxSize = key === "banner"
        ? maxImageSizes.banner
        : key === "label"
            ? maxImageSizes.label
            : maxImageSizes.screenshot;

    if (file.size > maxSize) {

        return { valid: false, message: "This image is too large for the selected upload." };

    }

    return { valid: true };

}

function validateZipFile(file) {

    if (!file) return { valid: false, message: "Please choose a ZIP file." };

    const ext = file.name.split(".").pop()?.toLowerCase();

    const allowedMime = ["application/zip", "application/x-zip-compressed", "application/x-zip", "application/octet-stream"];

    if (ext !== "zip") {

        return { valid: false, message: "Only ZIP files are supported." };

    }

    if (file.type && !allowedMime.includes(file.type)) {

        return { valid: false, message: "Only ZIP files are supported." };

    }

    if (file.size > maxZipSize) {

        return { valid: false, message: "ZIP file is too large." };

    }

    return { valid: true };

}

function handleImageSelection(file, preview, drop, key) {

    const result = validateImageFile(file, key);

    if (!result.valid) {

        showError(drop, result.message);

        return;

    }

    loadImage(file, preview, key);

    clearFieldError(drop);

    syncUploadData();

    setPreviewOverlay(drop, true);

}

function setPreviewOverlay(drop, visible) {

    if (!drop) return;

    let overlay = drop.querySelector(".replace-overlay");

    if (!overlay) {

        overlay = document.createElement("div");

        overlay.className = "replace-overlay";

        overlay.innerHTML = "<span>Replace Image</span>";

        drop.appendChild(overlay);

    }

    overlay.style.display = visible ? "flex" : "none";

}

function formatFileSize(size) {

    if (size < 1024) return `${size} B`;

    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;

}

function createProgressUI() {

    const footer = document.querySelector(".wizard-footer");

    if (!footer || document.getElementById("upload-progress")) return;

    const progress = document.createElement("div");

    progress.id = "upload-progress";
    progress.className = "upload-progress";
    footer.parentNode.insertBefore(progress, footer);

}

function setProgress(message) {

    const progress = document.getElementById("upload-progress");

    if (progress) {

        progress.textContent = message;

    }

}

function uploadImage(file, key = "label", progressLabel = "Uploading Image...") {

    setProgress(progressLabel);

    return new Promise((resolve, reject) => {

        const result = validateImageFile(file, key);

        if (!result.valid) {

            reject(new Error(result.message));

            return;

        }

        setTimeout(() => resolve(file), 120);

    });

}

function uploadZip(file) {

    setProgress("Uploading ZIP...");

    return new Promise((resolve, reject) => {

        const result = validateZipFile(file);

        if (!result.valid) {

            reject(new Error(result.message));

            return;

        }

        setTimeout(() => resolve(file), 120);

    });

}

function uploadScreenshots(files) {

    setProgress("Uploading Screenshots...");

    return new Promise((resolve, reject) => {

        const validFiles = files.filter(Boolean);

        if (!validFiles.length) {

            reject(new Error("Upload at least one screenshot."));

            return;

        }

        validFiles.forEach(file => {

            const result = validateImageFile(file, "screenshot");

            if (!result.valid) {

                reject(new Error(result.message));

                return;

            }

        });

        setTimeout(() => resolve(validFiles), 120);

    });

}

/* =========================
   SCREENSHOTS
========================= */

const screenshotGrid = document.getElementById("screenshots-grid");

if (screenshotGrid) {

    for (let i = 0; i < 6; i++) {

        const slot = document.createElement("div");

        slot.className = "screenshot-slot";

        slot.innerHTML = "+";

        const input = document.createElement("input");

        input.type = "file";

        input.accept = "image/*";

        input.hidden = true;

        slot.appendChild(input);

        slot.addEventListener("click", () => {

            input.click();

        });

        input.addEventListener("change", () => {

            if (!input.files.length) return;

            const file = input.files[0];

            const result = validateImageFile(file, "screenshot");

            if (!result.valid) {

                showError(screenshotGrid, result.message);

                return;

            }

            uploadData.screenshots[i] = file;

            const reader = new FileReader();

            reader.onload = e => {

                slot.innerHTML = "";

                const img = document.createElement("img");

                img.src = e.target.result;

                img.style.width = "100%";

                img.style.height = "100%";

                img.style.objectFit = "cover";

                slot.appendChild(img);

                const removeBtn = document.createElement("button");

                removeBtn.className = "remove-btn";

                removeBtn.textContent = "×";

                removeBtn.addEventListener("click", (event) => {

                    event.stopPropagation();

                    uploadData.screenshots[i] = null;

                    slot.innerHTML = "+";

                    slot.appendChild(input);

                    clearFieldError(screenshotGrid);

                    syncUploadData();

                });

                slot.appendChild(removeBtn);

                slot.appendChild(input);

            };

            reader.readAsDataURL(file);

            clearFieldError(screenshotGrid);

            syncUploadData();

        });

        screenshotGrid.appendChild(slot);

    }

}

/* =========================
   PUBLISH
========================= */

async function uploadScreenshotFiles() {

    const screenshotUrls = [];

    for (const file of uploadData.screenshots) {

        if (!file) continue;

        const url = await uploadFile(
            file,
            "screenshots"
        );

        screenshotUrls.push(url);

    }

    return screenshotUrls;

}

async function publishGame() {

    if (isPublishing) return;

    if (!validateUpload()) {

        return;

    }

    isPublishing = true;

    setPublishingState(true);

    let labelUrl = "";

    let bannerUrl = "";

    let screenshotUrls = [];

    let zipUrl = "";

    let slug = "";

    try {

        setProgress("Uploading Label...");

        labelUrl = await uploadFile(
            uploadData.label,
            "cartridge-labels"
        );

        setProgress("Uploading Banner...");

        bannerUrl = await uploadFile(
            uploadData.banner,
            "banners"
        );

        setProgress("Uploading Screenshots...");

        screenshotUrls = await uploadScreenshotFiles();

        setProgress("Uploading ZIP...");

        zipUrl = await uploadFile(
            uploadData.gameFile,
            "game-files"
        );

        setProgress("Generating Slug...");

        slug = createSlug(uploadData.title);

        setProgress("Saving Game...");

        const { error } = await supabase

            .from("games")

            .insert({

                owner_id: clerk.user.id,

                title: uploadData.title,

                slug: slug,

                description: uploadData.shortDescription,

                category: uploadData.genre,

                version: uploadData.version,

                cartridge_image: labelUrl,

                banner: bannerUrl,

                game_file: zipUrl,

                screenshots: screenshotUrls,

                status: "pending"

            });

        if (error) {

            throw error;

        }

        setProgress("Done.");

        window.location.href = `/game.html?slug=${slug}`;

    } catch (error) {

        console.error(error);

        setProgress(error.message || "Publish failed.");

    } finally {

        isPublishing = false;

        setPublishingState(false);

    }

}

function setPublishingState(publishing) {

    if (!nextBtn || !backBtn) return;

    nextBtn.disabled = publishing;

    backBtn.disabled = publishing || currentStep === 1;

    nextBtn.textContent = publishing
        ? "PUBLISHING..."
        : currentStep === totalSteps
            ? "PUBLISH"
            : "NEXT →";

}

/* =========================
   START
========================= */

function syncUploadData() {

    if (titleInput) uploadData.title = titleInput.value.trim();

    if (shortDescriptionInput) uploadData.shortDescription = shortDescriptionInput.value.trim();

    if (genreSelect) uploadData.genre = genreSelect.value;

    if (versionInput) uploadData.version = versionInput.value.trim();

    if (visibilityInputs.length) {

        const checked = visibilityInputs.find(input => input.checked);

        uploadData.visibility = checked ? checked.value : "public";

    }

}

function bindValidationListeners() {

    [titleInput, shortDescriptionInput, genreSelect, versionInput].forEach(input => {

        if (!input) return;

        input.addEventListener("input", () => {

            syncUploadData();

            clearFieldError(input);

        });

        input.addEventListener("change", () => {

            syncUploadData();

            clearFieldError(input);

        });

    });

    visibilityInputs.forEach(input => {

        input.addEventListener("change", () => {

            syncUploadData();

            clearFieldError(document.querySelector(".visibility") || input);

        });

    });

}

function validateUpload() {

    clearErrors();

    syncUploadData();

    if (!uploadData.title) {

        showError(titleInput, "Please enter a game title.");

        return false;

    }

    if (!uploadData.shortDescription) {

        showError(shortDescriptionInput, "Please add a short description.");

        return false;

    }

    if (!uploadData.version) {

        showError(versionInput, "Please enter a version.");

        return false;

    }

    if (!uploadData.label) {

        showError(labelDrop, "Choose a cartridge label.");

        return false;

    }

    if (!uploadData.banner) {

        showError(bannerDrop, "Choose a banner.");

        return false;

    }

    if (!uploadData.screenshots.some(Boolean)) {

        showError(document.getElementById("screenshots-grid"), "Upload at least one screenshot.");

        return false;

    }

    if (!uploadData.gameFile) {

        showError(zipDrop, "Upload your ZIP file.");

        return false;

    }

    return true;

}

function setupZip() {

    const input = document.getElementById("zip-input");

    const drop = document.getElementById("zip-drop");

    const name = document.getElementById("zip-name");

    if (!input || !drop || !name || drop.dataset.bound === "true") return;

    drop.dataset.bound = "true";

    drop.addEventListener("click", () => {

        clearFieldError(drop);

        input.click();

    });

    input.addEventListener("change", () => {

        if (!input.files.length) return;

        const result = validateZipFile(input.files[0]);

        if (!result.valid) {

            showError(drop, result.message);

            return;

        }

        uploadData.gameFile = input.files[0];

        name.textContent = `${input.files[0].name} (${formatFileSize(input.files[0].size)})`;

        clearFieldError(drop);

        syncUploadData();

    });

    drop.addEventListener("dragenter", (e) => {

        e.preventDefault();

        drop.classList.add("dragging");

    });

    drop.addEventListener("dragover", (e) => {

        e.preventDefault();

        drop.classList.add("dragging");

    });

    drop.addEventListener("dragleave", (e) => {

        e.preventDefault();

        if (!drop.contains(e.relatedTarget)) {

            drop.classList.remove("dragging");

        }

    });

    drop.addEventListener("drop", (e) => {

        e.preventDefault();

        drop.classList.remove("dragging");

        const file = e.dataTransfer.files[0];

        if (!file) return;

        const result = validateZipFile(file);

        if (!result.valid) {

            showError(drop, result.message);

            return;

        }

        uploadData.gameFile = file;

        name.textContent = `${file.name} (${formatFileSize(file.size)})`;

        clearFieldError(drop);

        syncUploadData();

    });

}

function validateStep1() {

    clearErrors();

    syncUploadData();

    if (!uploadData.title) {

        showError(titleInput, "Please enter a game title.");

        return false;

    }

    if (!uploadData.shortDescription) {

        showError(shortDescriptionInput, "Please add a short description.");

        return false;

    }

    if (!uploadData.version) {

        showError(versionInput, "Please enter a version.");

        return false;

    }

    return true;

}

function validateStep2() {

    clearErrors();

    syncUploadData();

    if (!uploadData.label) {

        showError(labelDrop, "Upload a cartridge label.");

        return false;

    }

    if (!uploadData.banner) {

        showError(bannerDrop, "Upload a banner.");

        return false;

    }

    if (!uploadData.screenshots.some(Boolean)) {

        showError(document.getElementById("screenshots-grid"), "Upload at least one screenshot.");

        return false;

    }

    return true;

}

function validateStep3() {

    clearErrors();

    syncUploadData();

    if (!uploadData.gameFile) {

        showError(document.getElementById("zip-drop"), "Upload your ZIP file.");

        return false;

    }

    return true;

}

function clearErrors() {

    document.querySelectorAll(".field, .upload-group").forEach(container => {

        container.classList.remove("error");

        const errorMessage = container.querySelector(".error-message");

        if (errorMessage) {

            errorMessage.textContent = "";

            errorMessage.style.display = "none";

        }

    });

}

function clearFieldError(target) {

    const element = typeof target === "string" ? document.getElementById(target) : target;

    if (!element) return;

    const container = element.closest(".field") || element.closest(".upload-group");

    if (!container) return;

    container.classList.remove("error");

    const errorMessage = container.querySelector(".error-message");

    if (errorMessage) {

        errorMessage.textContent = "";

        errorMessage.style.display = "none";

    }

}

function showError(target, message) {

    const element = typeof target === "string" ? document.getElementById(target) : target;

    if (!element) return;

    const container = element.closest(".field") || element.closest(".upload-group");

    if (!container) return;

    container.classList.add("error");

    const errorMessage = container.querySelector(".error-message");

    if (errorMessage) {

        errorMessage.textContent = message;

        errorMessage.style.display = "block";

    }

    const focusTarget = container.querySelector("input, textarea, select") || element;

    if (focusTarget) {

        focusTarget.focus();

    }

}

bindValidationListeners();

setupZip();

showStep(1);

function generateFileName(file) {

    const ext = file.name.split(".").pop();

    return `${clerk.user.id}_${Date.now()}.${ext}`;

}

async function uploadFile(file, bucket) {

    const fileName = generateFileName(file);

    const { error } = await supabase.storage

        .from(bucket)

        .upload(fileName, file);

    if (error) {

        throw error;

    }

    const { data } = supabase.storage

        .from(bucket)

        .getPublicUrl(fileName);

    return data.publicUrl;

}

function createSlug(title) {

    return title

        .toLowerCase()

        .trim()

        .replace(/[^a-z0-9]+/g, "-")

        .replace(/^-|-$/g, "");

}