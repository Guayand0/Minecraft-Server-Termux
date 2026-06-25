const API_URL = "https://minecraft-server-termux.vercel.app/api/server_versions";

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

    let cachedData = [];
    let serverNames = [];
    let versionMap = new Map();
    let majorVersions = [];
    let sortOrder = "desc";
    const selectedServers = new Set();
    const selectedMajors = new Set();
    const selectedSubversions = new Map();

    async function loadData() {
        setLoadingState(true, "Cargando datos...");

        try {
            const response = await fetch(API_URL);
            const json = await response.json();

            cachedData = Array.isArray(json.data) ? json.data : [];
            serverNames = Array.isArray(json.servers)
                ? json.servers
                    .slice()
                    .sort((a, b) => a.id - b.id)
                    .map((server) => server.name)
                : [];

            buildVersionIndex(Array.isArray(json.versions) ? json.versions : []);
            renderFilterButtons();
            applyFilters();
            setLoadingState(false, "Datos listos");
        } catch (err) {
            console.error("Error API:", err);
            renderFilterButtons();
            renderRows([]);
            setLoadingState(false, "No se pudo cargar");
        }
    }

    function setLoadingState(isLoading, label) {
        loading.textContent = label;
        loading.classList.toggle("is-idle", !isLoading);

        document.querySelectorAll(".filter-chip").forEach((button) => {
            button.disabled = isLoading;
        });
    }

    function buildVersionIndex(versions) {
        versionMap = new Map();

        versions
            .slice()
            .sort((a, b) => compareVersions(a.version, b.version))
            .forEach((entry) => {
                const version = entry.version;
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

            if (versions.length) {
                hasVisibleSubversions = true;
                group.appendChild(chips);
                subversionFilters.appendChild(group);
            }
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
        const pa = String(a).split(".").map(Number);
        const pb = String(b).split(".").map(Number);
        const len = Math.max(pa.length, pb.length);

        for (let i = 0; i < len; i++) {
            const na = pa[i] ?? 0;
            const nb = pb[i] ?? 0;

            if (na !== nb) return na - nb;
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
            const serverMatch = selectedServers.size === 0 || selectedServers.has(row.name);

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

            return serverMatch && selectedForMajor.has(row.version);
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
                    <td colspan="5">No hay resultados para estos filtros</td>
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
                    <a class="download-button" href="${escapeAttr(row.url)}" target="_blank" rel="noopener noreferrer">Descargar</a>
                </td>
                <td>
                    <button class="copy-button" type="button" data-copy-url="${escapeAttr(row.url)}">Copiar</button>
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
            const previousStatus = loading.textContent;
            loading.textContent = "URL copiada";
            setTimeout(() => {
                loading.textContent = previousStatus;
            }, 1200);
        } catch (err) {
            console.error("Error copiando:", err);
            const previousStatus = loading.textContent;
            loading.textContent = "No se pudo copiar";
            setTimeout(() => {
                loading.textContent = previousStatus;
            }, 1200);
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

    serverFilters.addEventListener("click", onServerChipClick);
    versionFilters.addEventListener("click", onMajorChipClick);
    subversionFilters.addEventListener("click", onSubversionChipClick);
    sortButtons.forEach((button) => {
        button.addEventListener("click", onSortClick);
    });
    clearFilterButtons.forEach((button) => {
        button.addEventListener("click", onClearFilterClick);
    });

    results.addEventListener("click", (event) => {
        const button = event.target.closest("[data-copy-url]");
        if (!button) return;
        copyUrl(button.dataset.copyUrl);
    });

    syncSortButtons();
    loadData();
});
