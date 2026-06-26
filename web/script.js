(() => {
            const ROOT_COMMAND = "curl -fsSL https://raw.githubusercontent.com/Guayand0/Minecraft-Server-Termux/main/";
            const DEBIAN_COMMAND = `${ROOT_COMMAND}1_install-Debian.sh | bash`;
            const INSTALL_COMMAND_BASE = `${ROOT_COMMAND}2_install-MC.sh | bash -s `;
            const DEFAULT_INSTALL_COMMAND = `${INSTALL_COMMAND_BASE}"<URL_VERSION>"`;
            const API_URLS = [
                window.MSD_API_URL,
                "https://minecraft-server-termux.vercel.app/api/server_versions",
                window.location && window.location.origin && window.location.origin !== "null"
                    ? `${window.location.origin}/api/server_versions`
                    : "",
                "./api/server_versions"
            ].filter((value, index, array) => typeof value === "string" && value && array.indexOf(value) === index);

            const serverDropdown = document.getElementById("server-dropdown");
            const versionDropdown = document.getElementById("version-dropdown");
            const serverSelect = document.getElementById("server-select");
            const versionSelect = document.getElementById("version-select");
            const serverSelectLabel = document.getElementById("server-select-label");
            const versionSelectLabel = document.getElementById("version-select-label");
            const serverOptions = document.getElementById("server-options");
            const versionOptions = document.getElementById("version-options");
            const debianCommand = document.getElementById("debian-command");
            const installCommand = document.getElementById("install-command");
            const selectionSummary = document.getElementById("selection-summary");
            const urlPreview = document.getElementById("url-preview");
            const toast = document.getElementById("toast");
            const errorModal = document.getElementById("error-modal");
            const errorModalMessage = document.getElementById("error-modal-message");
            const errorModalClose = document.getElementById("error-modal-close");
            const errorModalRetry = document.getElementById("error-modal-retry");
            const copyButtons = document.querySelectorAll("[data-copy-target]");
            const requirementCards = document.querySelectorAll("[data-requirement-card]");
            const requirementsSection = document.querySelector(".requirements");
            const dropdowns = [serverDropdown, versionDropdown];

            const state = {
                rows: [],
                servers: [],
                versions: [],
                selectedServer: "",
                selectedVersion: "",
                toastTimer: null,
                activeDropdown: null
            };

            function compareVersionsDesc(a, b) {
                const pa = String(a).split(".").map((part) => Number.parseInt(part, 10) || 0);
                const pb = String(b).split(".").map((part) => Number.parseInt(part, 10) || 0);
                const len = Math.max(pa.length, pb.length);

                for (let i = 0; i < len; i += 1) {
                    const na = pa[i] ?? 0;
                    const nb = pb[i] ?? 0;

                    if (na !== nb) {
                        return nb - na;
                    }
                }

                return 0;
            }

            function escapeHtml(value) {
                return String(value)
                    .replaceAll("&", "&amp;")
                    .replaceAll("<", "&lt;")
                    .replaceAll(">", "&gt;")
                    .replaceAll('"', "&quot;")
                    .replaceAll("'", "&#39;");
            }

            function normalizeRow(row) {
                return {
                    name: String(row?.name ?? ""),
                    version: String(row?.version ?? ""),
                    url: String(row?.url ?? ""),
                    build: row?.build ?? ""
                };
            }

            function showToast(message) {
                toast.textContent = message;
                toast.classList.add("is-visible");

                if (state.toastTimer) {
                    clearTimeout(state.toastTimer);
                }

                state.toastTimer = window.setTimeout(() => {
                    toast.classList.remove("is-visible");
                }, 1700);
            }

            async function copyText(text) {
                try {
                    await navigator.clipboard.writeText(text);
                    showToast("Comando copiado");
                } catch (error) {
                    console.error("No se pudo copiar:", error);
                    showToast("No se pudo copiar");
                }
            }

            function showErrorModal(message) {
                if (errorModalMessage) {
                    errorModalMessage.textContent = message;
                }

                errorModal.classList.remove("is-hidden");
                document.body.style.overflow = "hidden";
                errorModalClose?.focus();
            }

            function hideErrorModal() {
                errorModal.classList.add("is-hidden");
                document.body.style.overflow = "";
            }

            function getApiUrls() {
                return API_URLS.slice();
            }

            async function loadData() {
                const urls = getApiUrls();
                let lastError = null;

                for (const url of urls) {
                    try {
                        const response = await fetch(url, {
                            cache: "no-store",
                            headers: { Accept: "application/json" }
                        });

                        if (!response.ok) {
                            throw new Error(`HTTP ${response.status}`);
                        }

                        const json = await response.json();
                        if (!json || !Array.isArray(json.data)) {
                            throw new Error("Respuesta invalida");
                        }

                        state.rows = json.data.map(normalizeRow);
                        state.servers = Array.isArray(json.servers)
                            ? json.servers
                                .map((server) => String(server?.name ?? ""))
                                .filter(Boolean)
                            : [];
                        state.versions = Array.isArray(json.versions)
                            ? json.versions
                                .map((version) => String(version?.version ?? ""))
                                .filter(Boolean)
                            : [];

                        if (!state.servers.length) {
                            state.servers = Array.from(new Set(state.rows.map((row) => row.name).filter(Boolean)));
                        }

                        if (!state.versions.length) {
                            state.versions = Array.from(new Set(state.rows.map((row) => row.version).filter(Boolean)));
                        }

                        initializeSelectors();
                        return;
                    } catch (error) {
                        lastError = error;
                    }
                }

                console.error("No se pudo cargar la API:", lastError);
                state.rows = [];
                state.servers = [];
                state.versions = [];
                state.selectedServer = "";
                state.selectedVersion = "";
                renderServerOptions([]);
                renderVersionOptions([]);
                syncServerSelect();
                syncVersionSelect();
                updateCommandPreview();
                showErrorModal("Error al cargar los datos. Intenta de nuevo mas tarde.");
            }

            function initializeSelectors() {
                const uniqueServers = getSortedServers();
                const uniqueVersions = Array.from(new Set(state.versions)).sort(compareVersionsDesc);

                renderServerOptions(uniqueServers);
                renderVersionOptions(uniqueVersions);

                if (uniqueServers.includes("Paper")) {
                    state.selectedServer = "Paper";
                } else if (!state.selectedServer && uniqueServers.length) {
                    state.selectedServer = uniqueServers[0];
                }

                syncServerSelect();
                syncVersionOptions();

                if (!state.selectedVersion) {
                    state.selectedVersion = getAvailableVersionsForServer(state.selectedServer)[0] || uniqueVersions[0] || "";
                }

                syncVersionSelect();
                updateCommandPreview();
            }

            function renderServerOptions(servers) {
                serverOptions.innerHTML = servers.map((server) => `
                    <button class="dropdown-option${server === state.selectedServer ? " is-active" : ""}" type="button" role="option" aria-selected="${String(server === state.selectedServer)}" data-dropdown-value="${escapeHtml(server)}" data-dropdown-target="server">
                        ${escapeHtml(server)}
                    </button>
                `).join("");
            }

            function renderVersionOptions(versions) {
                versionOptions.innerHTML = versions.map((version) => `
                    <button class="dropdown-option${version === state.selectedVersion ? " is-active" : ""}" type="button" role="option" aria-selected="${String(version === state.selectedVersion)}" data-dropdown-value="${escapeHtml(version)}" data-dropdown-target="version">
                        ${escapeHtml(version)}
                    </button>
                `).join("");
            }

            function syncServerSelect() {
                serverSelectLabel.textContent = state.selectedServer || "Sin servidor";
                serverSelect.setAttribute("aria-label", `Servidor seleccionado: ${state.selectedServer || "ninguno"}`);
                renderServerOptions(getSortedServers());
            }

            function getAvailableVersionsForServer(serverName) {
                const filtered = state.rows
                    .filter((row) => !serverName || row.name === serverName)
                    .map((row) => row.version)
                    .filter(Boolean);

                return Array.from(new Set(filtered)).sort(compareVersionsDesc);
            }

            function syncVersionOptions() {
                const availableVersions = getVisibleVersions();
                renderVersionOptions(availableVersions);

                if (state.selectedVersion && availableVersions.includes(state.selectedVersion)) {
                    return;
                }

                state.selectedVersion = availableVersions[0] || "";
            }

            function syncVersionSelect() {
                versionSelectLabel.textContent = state.selectedVersion || "Sin version";
                versionSelect.setAttribute("aria-label", `Version seleccionada: ${state.selectedVersion || "ninguna"}`);
                renderVersionOptions(getVisibleVersions());
            }

            function getSortedServers() {
                return Array.from(new Set(state.servers)).sort((a, b) => {
                    if (a === "Paper" && b !== "Paper") return -1;
                    if (b === "Paper" && a !== "Paper") return 1;
                    return a.localeCompare(b);
                });
            }

            function getVisibleVersions() {
                return state.rows.length > 0
                    ? getAvailableVersionsForServer(state.selectedServer)
                    : Array.from(new Set(state.versions)).sort(compareVersionsDesc);
            }

            function closeDropdown(dropdown = null) {
                const targets = dropdown ? [dropdown] : dropdowns;

                targets.forEach((item) => {
                    item.classList.remove("is-open");
                    const trigger = item.querySelector(".dropdown-trigger");
                    if (trigger) {
                        trigger.setAttribute("aria-expanded", "false");
                    }
                });

                if (!dropdown || state.activeDropdown === dropdown) {
                    state.activeDropdown = null;
                }
            }

            function isInteractiveElement(element) {
                return Boolean(element?.closest("a, button, input, select, textarea, label"));
            }

            function setRequirementCardExpanded(card, expanded) {
                if (!card) {
                    return;
                }

                card.classList.toggle("is-open", expanded);
                card.setAttribute("aria-expanded", String(expanded));
            }

            function toggleRequirementCard(card) {
                if (!card) {
                    return;
                }

                setRequirementCardExpanded(card, !card.classList.contains("is-open"));
            }

            function openDropdown(dropdown) {
                if (!dropdown) {
                    return;
                }

                closeDropdown();
                dropdown.classList.add("is-open");
                const trigger = dropdown.querySelector(".dropdown-trigger");
                if (trigger) {
                    trigger.setAttribute("aria-expanded", "true");
                }
                state.activeDropdown = dropdown;
            }

            function toggleDropdown(dropdown) {
                if (!dropdown) {
                    return;
                }

                if (dropdown.classList.contains("is-open")) {
                    closeDropdown(dropdown);
                    return;
                }

                openDropdown(dropdown);
            }

            function updateServerSelection(value) {
                if (!value || value === state.selectedServer) {
                    closeDropdown();
                    return;
                }

                state.selectedServer = value;
                const availableVersions = getAvailableVersionsForServer(state.selectedServer);

                if (!availableVersions.includes(state.selectedVersion)) {
                    state.selectedVersion = availableVersions[0] || "";
                }

                syncServerSelect();
                syncVersionOptions();
                syncVersionSelect();
                updateCommandPreview();
                closeDropdown();
            }

            function updateVersionSelection(value) {
                if (!value || value === state.selectedVersion) {
                    closeDropdown();
                    return;
                }

                state.selectedVersion = value;
                syncVersionSelect();
                updateCommandPreview();
                closeDropdown();
            }

            function findMatchingRow() {
                if (!state.selectedServer || !state.selectedVersion) {
                    return null;
                }

                return state.rows.find((row) => row.name === state.selectedServer && row.version === state.selectedVersion) || null;
            }

            function updateCommandPreview() {
                const row = findMatchingRow();
                const versionText = state.selectedVersion || "una version";
                const serverText = state.selectedServer || "un servidor";

                if (row && row.url) {
                    const command = `${INSTALL_COMMAND_BASE}"${row.url}"`;
                    installCommand.textContent = command;
                    urlPreview.textContent = row.url;
                    selectionSummary.textContent = `${serverText} - ${versionText}`;
                    return;
                }

                installCommand.textContent = DEFAULT_INSTALL_COMMAND;
                urlPreview.textContent = state.selectedServer && state.selectedVersion
                    ? "No se encontro una URL para esa combinacion"
                    : "La URL aparecera aqui.";
                selectionSummary.textContent = state.selectedServer && state.selectedVersion
                    ? `${serverText} - ${versionText}`
                    : "Selecciona servidor y version";
            }

            copyButtons.forEach((button) => {
                button.addEventListener("click", async () => {
                    const targetId = button.dataset.copyTarget;
                    const target = document.getElementById(targetId);
                    if (!target) {
                        return;
                    }

                    await copyText(target.textContent.trim());
                });
            });

            requirementCards.forEach((card) => {
                setRequirementCardExpanded(card, false);
            });

            requirementsSection?.addEventListener("click", (event) => {
                const card = event.target.closest("[data-requirement-card]");
                if (!card || isInteractiveElement(event.target)) {
                    return;
                }

                toggleRequirementCard(card);
            });

            requirementsSection?.addEventListener("keydown", (event) => {
                const card = event.target.closest("[data-requirement-card]");
                if (!card || isInteractiveElement(event.target)) {
                    return;
                }

                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    toggleRequirementCard(card);
                }
            });

            serverSelect.addEventListener("click", () => toggleDropdown(serverDropdown));
            versionSelect.addEventListener("click", () => toggleDropdown(versionDropdown));

            serverOptions.addEventListener("click", (event) => {
                const button = event.target.closest("[data-dropdown-target='server']");
                if (!button) {
                    return;
                }

                updateServerSelection(button.dataset.dropdownValue || "");
            });

            versionOptions.addEventListener("click", (event) => {
                const button = event.target.closest("[data-dropdown-target='version']");
                if (!button) {
                    return;
                }

                updateVersionSelection(button.dataset.dropdownValue || "");
            });

            document.addEventListener("click", (event) => {
                const clickedInsideDropdown = dropdowns.some((dropdown) => dropdown.contains(event.target));
                if (!clickedInsideDropdown) {
                    closeDropdown();
                }
            });

            document.addEventListener("keydown", (event) => {
                if (event.key === "Escape") {
                    closeDropdown();
                    hideErrorModal();
                }
            });

            errorModalClose?.addEventListener("click", hideErrorModal);
            errorModalRetry?.addEventListener("click", () => {
                window.location.reload();
            });

            errorModal?.addEventListener("click", (event) => {
                if (event.target === errorModal) {
                    hideErrorModal();
                }
            });

            debianCommand.textContent = DEBIAN_COMMAND;
            installCommand.textContent = DEFAULT_INSTALL_COMMAND;
            loadData();
        })();
