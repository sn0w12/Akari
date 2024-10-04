let baseUrl: string;

async function fetchBaseUrl() {
    const response = await fetch("/api/base-url");
    const data = await response.json();
    baseUrl = data.baseUrl;
}

(async () => {
    await fetchBaseUrl();
})();

export { baseUrl };
