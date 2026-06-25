const API_URL = getApiUrl();
const STORAGE_KEY = "minecraft-server-termux-language";
const DEFAULT_LANGUAGE = "es";

document.addEventListener("DOMContentLoaded", () => {
    const serverFilters = document.getElementById("server-filters");
    const versionFilters = document.getElementById("version-filters");
    const subversionWrap = document.getElementById("subversion-wrap");
    const subversionFilters = document.getElementById("version-subfilters");
    const results = document.getElementById("results");
    const sortButtons = document.querySelectorAll("[data-sort]");
    const clearFilterButtons = document.querySelectorAll("[data-clear-filter]");
    const loading = document.getElementById("loading");
    const resultCount = document.getElementById("result-count");
    const languageSelect = document.getElementById("language-select");
    const toast = document.getElementById("toast");
    const metaDescription = document.querySelector('meta[name="description"]');

    let cachedData = [];
    let serverNames = [];
    let versionMap = new Map();
    let majorVersions = [];
    let sortOrder = "desc";
    let currentLanguage = getInitialLanguage();
    let currentStatusKey = "loading";
    let currentToastKey = "";
    let toastTimer = null;

    const selectedServers = new Set();
    const selectedMajors = new Set();
    const selectedSubversions = new Map();

    function t(key) {
        return window.MSD_I18N?.[currentLanguage]?.[key]
            ?? window.MSD_I18N?.[DEFAULT_LANGUAGE]?.[key]
            ?? key;
    }

    function getApiUrl() {
        if (typeof window !== "undefined" && window.location && window.location.origin && window.location.origin !== "null") {
            return `${window.location.origin}/api/server_versions`;
        }

        return "https://minecraft-server-termux.vercel.app/api/server_versions";
    }

    function getInitialLanguage() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved === "es" || saved === "en") {
                return saved;
            }
        } catch (err) {
            // Ignore storage failures and fall back to browser language.
        }

        const browserLanguage = (navigator.language || navigator.userLanguage || DEFAULT_LANGUAGE).toLowerCase();
        return browserLanguage.startsWith("en") ? "en" : DEFAULT_LANGUAGE;
    }

    function saveLanguage(language) {
        try {
            localStorage.setItem(STORAGE_KEY, language);
        } catch (err) {
            // Storage is optional; the app still works without it.
        }
    }

    function setLanguage(language, shouldPersist = true) {
        if (language !== "es" && language !== "en") {
            language = DEFAULT_LANGUAGE;
        }

        currentLanguage = language;

        if (shouldPersist) {
            saveLanguage(language);
        }

        document.documentElement.lang = language;

        if (languageSelect) {
            languageSelect.value = language;
        }

        applyStaticTranslations();
        syncSortButtons();
        syncChipState(serverFilters, selectedServers);
        syncChipState(versionFilters, selectedMajors);
        syncSubversionState();

        if (currentToastKey) {
            showToast(currentToastKey);
        }
    }

    function applyStaticTranslations() {
        document.title = t("appName");

        if (metaDescription) {
            metaDescription.setAttribute("content", t("metaDescription"));
        }

        document.querySelectorAll("[data-i18n]").forEach((element) => {
            const key = element.dataset.i18n;
            if (key) {
                element.textContent = t(key);
            }
        });

        loading.textContent = t(currentStatusKey);
    }

    function setStatus(key, isLoading) {
        currentStatusKey = key;
        loading.textContent = t(key);
        loading.classList.toggle("is-idle", !isLoading);
    }

    function showToast(key, autoHide = true) {
        currentToastKey = key;
        toast.textContent = t(key);
        toast.classList.add("is-visible");
        toast.dataset.kind = key === "copyError" ? "error" : "info";

        if (toastTimer) {
            clearTimeout(toastTimer);
        }

        if (autoHide) {
            toastTimer = setTimeout(() => {
                toast.classList.remove("is-visible");
                currentToastKey = "";
            }, 1800);
        }
    }

    async function loadData() {
        setStatus("loading", true);

        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 15000);

        try {
            const response = await fetch(API_URL, {
                signal: controller.signal,
                headers: {
                    Accept: "application/json"
                }
            });

            if (!response.ok) {
                throw new Error(`API responded with ${response.status}`);
            }

            const json = await response.json();

            cachedData = Array.isArray(json.data) ? json.data : [];
            serverNames = Array.isArray(json.servers)
                ? json.servers
                    .slice()
                    .sort((a, b) => Number(a.id ?? 0) - Number(b.id ?? 0))
                    .map((server) => String(server.name))
                : [];

            buildVersionIndex(Array.isArray(json.versions) ? json.versions : []);
            renderFilterButtons();
            applyFilters();
            setStatus("ready", false);
        } catch (err) {
            console.error("Error API:", err);
            renderFilterButtons();
            renderRows([]);
            setStatus("loadError", false);
            showToast("loadError");
        } finally {
            window.clearTimeout(timeout);
        }
    }

    function buildVersionIndex(versions) {
        versionMap = new Map();

        versions
            .slice()
            .sort((a, b) => compareVersions(a.version, b.version))
            .forEach((entry) => {
                const version = String(entry.version);
                const major = getMajorVersion(version);

                if (!versionMap.has(major)) {
                    versionMap.set(major, []);
                }

                versionMap.get(major).push(version);
            });

        majorVersions = Array.from(versionMap.keys()).sort(compareVersions);
    }

    function renderFilterButtons() {
        serverFilters.innerHTML = "";
        versionFilters.innerHTML = "";
        subversionFilters.innerHTML = "";
        subversionWrap.classList.add("is-hidden");

        renderChipGroup(serverFilters, serverNames, selectedServers);

        majorVersions.forEach((major) => {
            versionFilters.appendChild(createChip(major, major, selectedMajors.has(major), false));
        });

        renderSubversionGroups();
    }

    function renderSubversionGroups() {
        subversionFilters.innerHTML = "";

        const activeMajors = selectedMajors.size
            ? Array.from(selectedMajors).sort(compareVersions)
            : [];

        if (!activeMajors.length) {
            subversionWrap.classList.add("is-hidden");
            return;
        }

        let hasVisibleSubversions = false;

        activeMajors.forEach((major) => {
            const versions = versionMap.get(major) || [];
            const selectedForMajor = selectedSubversions.get(major) || new Set();

            if (!versions.length) {
                return;
            }

            const group = document.createElement("div");
            group.className = "subversion-group";

            const title = document.createElement("div");
            title.className = "subversion-title";
            title.textContent = major;
            group.appendChild(title);

            const chips = document.createElement("div");
            chips.className = "chip-group subversion-chips";

            versions.forEach((version) => {
                chips.appendChild(createChip(version, version, selectedForMajor.has(version), false));
            });

            group.appendChild(chips);
            subversionFilters.appendChild(group);
            hasVisibleSubversions = true;
        });

        subversionWrap.classList.toggle("is-hidden", !hasVisibleSubversions);
    }

    function renderChipGroup(container, values, selectedSet) {
        values.forEach((value) => {
            container.appendChild(createChip(value, value, selectedSet.has(value), false));
        });
    }

    function createChip(label, value, active, isReset) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `filter-chip${active ? " is-active" : ""}${isReset ? " is-empty" : ""}`;
        button.textContent = label;
        button.dataset.value = value;
        button.dataset.reset = String(isReset);
        button.setAttribute("aria-pressed", String(active));
        return button;
    }

    function toggleSelection(selectedSet, value) {
        if (selectedSet.has(value)) {
            selectedSet.delete(value);
            return false;
        }

        selectedSet.add(value);
        return true;
    }

    function compareVersions(a, b) {
        const pa = String(a).split(".").map((part) => Number.parseInt(part, 10) || 0);
        const pb = String(b).split(".").map((part) => Number.parseInt(part, 10) || 0);
        const len = Math.max(pa.length, pb.length);

        for (let i = 0; i < len; i += 1) {
            const na = pa[i] ?? 0;
            const nb = pb[i] ?? 0;

            if (na !== nb) {
                return na - nb;
            }
        }

        return 0;
    }

    function getMajorVersion(version) {
        const parts = String(version).split(".");
        if (parts.length >= 2) {
            return `${parts[0]}.${parts[1]}`;
        }

        return String(version);
    }

    function applyFilters() {
        const filtered = cachedData.filter((row) => {
            const serverMatch = selectedServers.size === 0 || selectedServers.has(String(row.name));

            if (!selectedMajors.size) {
                return serverMatch;
            }

            const major = getMajorVersion(row.version);
            if (!selectedMajors.has(major)) {
                return false;
            }

            const selectedForMajor = selectedSubversions.get(major);
            if (!selectedForMajor || selectedForMajor.size === 0) {
                return serverMatch;
            }

            return serverMatch && selectedForMajor.has(String(row.version));
        });

        renderRows(sortRows(filtered));
        syncChipState(serverFilters, selectedServers);
        syncChipState(versionFilters, selectedMajors);
        syncSubversionState();
        renderSubversionGroups();
    }

    function sortRows(rows) {
        return rows.slice().sort((a, b) => {
            const versionResult = compareVersions(a.version, b.version);

            if (versionResult !== 0) {
                return sortOrder === "desc" ? -versionResult : versionResult;
            }

            return String(a.name).localeCompare(String(b.name));
        });
    }

    function syncSortButtons() {
        sortButtons.forEach((button) => {
            const isActive = button.dataset.sort === sortOrder;
            button.classList.toggle("is-active", isActive);
            button.setAttribute("aria-pressed", String(isActive));
        });
    }

    function syncChipState(container, selectedSet) {
        if (!container) {
            return;
        }

        container.querySelectorAll(".filter-chip").forEach((button) => {
            const value = button.dataset.value;
            const isActive = selectedSet.has(value);
            button.classList.toggle("is-active", isActive);
            button.setAttribute("aria-pressed", String(isActive));
        });
    }

    function syncSubversionState() {
        subversionFilters.querySelectorAll(".filter-chip").forEach((button) => {
            const value = button.dataset.value;
            const major = getMajorVersion(value);
            const selectedForMajor = selectedSubversions.get(major);
            const isActive = Boolean(selectedForMajor && selectedForMajor.has(value));
            button.classList.toggle("is-active", isActive);
            button.setAttribute("aria-pressed", String(isActive));
        });
    }

    function renderRows(data) {
        resultCount.textContent = String(data.length);

        if (!data.length) {
            results.innerHTML = `
                <tr class="empty-row">
                    <td colspan="5">${escapeHtml(t("emptyState"))}</td>
                </tr>
            `;
            return;
        }

        results.innerHTML = data.map((row) => `
            <tr>
                <td>${escapeHtml(row.name)}</td>
                <td>${escapeHtml(row.version)}</td>
                <td><span class="build-pill ${getBuildClass(row.build)}">${escapeHtml(String(row.build))}</span></td>
                <td>
                    <a class="download-button" href="${escapeAttr(row.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t("download"))}</a>
                </td>
                <td>
                    <button class="copy-button" type="button" data-copy-url="${escapeAttr(row.url)}">${escapeHtml(t("copy"))}</button>
                </td>
            </tr>
        `).join("");
    }

    function getBuildClass(build) {
        const value = String(build).toLowerCase();

        if (value.includes("stable")) return "build-stable";
        if (value.includes("alpha")) return "build-alpha";
        if (value.includes("beta")) return "build-beta";
        if (value.includes("experimental")) return "build-experimental";

        return "build-unknown";
    }

    function escapeHtml(value) {
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");
    }

    function escapeAttr(value) {
        return escapeHtml(value).replaceAll("`", "&#96;");
    }

    async function copyUrl(url) {
        try {
            await navigator.clipboard.writeText(url);
            showToast("copySuccess");
        } catch (err) {
            console.error("Error copiando:", err);
            showToast("copyError");
        }
    }

    function onServerChipClick(event) {
        const button = event.target.closest(".filter-chip");
        if (!button || button.disabled) return;

        toggleSelection(selectedServers, button.dataset.value);
        applyFilters();
    }

    function onMajorChipClick(event) {
        const button = event.target.closest(".filter-chip");
        if (!button || button.disabled) return;

        const major = button.dataset.value;

        if (selectedMajors.has(major)) {
            selectedMajors.delete(major);
            selectedSubversions.delete(major);
        } else {
            selectedMajors.add(major);
            if (!selectedSubversions.has(major)) {
                selectedSubversions.set(major, new Set());
            }
        }

        applyFilters();
    }

    function onSubversionChipClick(event) {
        const button = event.target.closest(".filter-chip");
        if (!button || button.disabled) return;

        const version = button.dataset.value;
        const major = getMajorVersion(version);

        if (!selectedSubversions.has(major)) {
            selectedSubversions.set(major, new Set());
        }

        const selectedForMajor = selectedSubversions.get(major);
        toggleSelection(selectedForMajor, version);
        applyFilters();
    }

    function onSortClick(event) {
        const button = event.target.closest("[data-sort]");
        if (!button) return;

        sortOrder = button.dataset.sort;
        syncSortButtons();
        applyFilters();
    }

    function onClearFilterClick(event) {
        const button = event.target.closest("[data-clear-filter]");
        if (!button) return;

        if (button.dataset.clearFilter === "server") {
            selectedServers.clear();
        }

        if (button.dataset.clearFilter === "version") {
            selectedMajors.clear();
            selectedSubversions.clear();
        }

        applyFilters();
    }

    function onLanguageChange(event) {
        setLanguage(event.target.value);
    }

    serverFilters.addEventListener("click", onServerChipClick);
    versionFilters.addEventListener("click", onMajorChipClick);
    subversionFilters.addEventListener("click", onSubversionChipClick);
    sortButtons.forEach((button) => {
        button.addEventListener("click", onSortClick);
    });
    clearFilterButtons.forEach((button) => {
        button.addEventListener("click", onClearFilterClick);
    });
    languageSelect.addEventListener("change", onLanguageChange);

    results.addEventListener("click", (event) => {
        const button = event.target.closest("[data-copy-url]");
        if (!button) return;
        copyUrl(button.dataset.copyUrl);
    });

    setLanguage(currentLanguage, false);
    syncSortButtons();
    loadData();
});
