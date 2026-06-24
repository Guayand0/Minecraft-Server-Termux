const API_URL =
    "https://minecraft-server-termux.vercel.app/api/server_versions";

const serverSelect = document.getElementById("server");
const versionSelect = document.getElementById("version");
const results = document.getElementById("results");

async function loadData() {
    const response = await fetch(API_URL);
    const json = await response.json();

    json.servers.forEach(server => {
        const option = document.createElement("option");
        option.value = server.name;
        option.textContent = server.name;
        serverSelect.appendChild(option);
    });

    json.versions.forEach(version => {
        const option = document.createElement("option");
        option.value = version.version;
        option.textContent = version.version;
        versionSelect.appendChild(option);
    });

    renderRows(json.data);
}

function renderRows(data) {
    results.innerHTML = "";

    if (!data.length) {
        results.innerHTML = `
            <tr>
                <td colspan="4">No hay resultados</td>
            </tr>
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
                    <a href="${row.url}" target="_blank">
                        ${row.url}
                    </a>
                </td>
            </tr>
        `;
    });
}

async function search() {
    const params = new URLSearchParams();

    if (serverSelect.value) {
        params.append("server", serverSelect.value);
    }

    if (versionSelect.value) {
        params.append("version", versionSelect.value);
    }

    const response = await fetch(
        `${API_URL}?${params.toString()}`
    );

    const json = await response.json();

    renderRows(json.data);
}

document
    .getElementById("search")
    .addEventListener("click", search);

loadData();