const API_URL = "https://minecraft-server-termux.vercel.app/api/server_versions";

document.addEventListener("DOMContentLoaded", () => {

    const serverSelect = document.getElementById("server");
    const versionSelect = document.getElementById("version");
    const results = document.getElementById("results");
    const searchBtn = document.getElementById("search");
    const loading = document.getElementById("loading");

    async function loadData() {

        loading.style.display = "block";

        try {
            const response = await fetch(API_URL);
            const json = await response.json();

            console.log("API:", json);

            fillServers(json.servers);
            fillVersions(json.versions);
            renderRows(json.data);

        } catch (err) {
            console.error("Error API:", err);
        } finally {
            loading.style.display = "none";
        }
    }

    // 🔴 servidores ordenados por ID
    function fillServers(servers) {
        serverSelect.innerHTML = `<option value="">Todos los servidores</option>`;

        servers
            .sort((a, b) => a.id - b.id)
            .forEach(s => {
                serverSelect.innerHTML += `
                    <option value="${s.name}">${s.name}</option>
                `;
            });
    }

    // 🔴 versiones ordenadas tipo Minecraft
    function fillVersions(versions) {
        versionSelect.innerHTML = `<option value="">Todas las versiones</option>`;

        versions
            .sort((a, b) => compareVersions(a.version, b.version))
            .forEach(v => {
                versionSelect.innerHTML += `
                    <option value="${v.version}">${v.version}</option>
                `;
            });
    }

    function compareVersions(a, b) {
        const pa = a.split(".").map(Number);
        const pb = b.split(".").map(Number);

        const len = Math.max(pa.length, pb.length);

        for (let i = 0; i < len; i++) {
            const na = pa[i] || 0;
            const nb = pb[i] || 0;

            if (na !== nb) return na - nb;
        }

        return 0;
    }

    function renderRows(data) {
        results.innerHTML = "";

        if (!data.length) {
            results.innerHTML = `
                <tr><td colspan="4">No hay resultados</td></tr>
            `;
            return;
        }

        data.forEach(row => {
            results.innerHTML += `
                <tr>
                    <td>${row.name}</td>
                    <td>${row.version}</td>
                    <td>${row.build}</td>
                    <td>
                        <a href="${row.url}" target="_blank">Descargar</a>
                        <button onclick="copyUrl('${row.url}')">Copiar</button>
                    </td>
                </tr>
            `;
        });
    }

    async function search() {
        const params = new URLSearchParams();

        if (serverSelect.value) params.append("server", serverSelect.value);
        if (versionSelect.value) params.append("version", versionSelect.value);

        const response = await fetch(`${API_URL}?${params.toString()}`);
        const json = await response.json();

        renderRows(json.data);
    }

    searchBtn.addEventListener("click", search);

    function copyUrl(url) {
        navigator.clipboard.writeText(url)
            .then(() => {
                alert("URL copiada");
            })
            .catch(err => {
                console.error("Error copiando:", err);
            });
    }

    loadData();
});

function copyUrl(url) {
    navigator.clipboard.writeText(url)
        .then(() => {
            alert("URL copiada");
        })
        .catch(err => {
            console.error("Error copiando:", err);
        });
}