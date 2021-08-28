const configureClient = async() => {
    // const response = await fetchAuthConfig();
    // const config = await response.json();
    auth0 = await createAuth0Client({
        domain: 'sowndev.us.auth0.com',
        clientId: 'UvdGPyWaumDZkmN30ZaGQL64MJIfkl5Z'
    });
};

window.onload = async() => {
    await configureClient();
    // NEW - update the UI state
    updateUI();
    const isAuthenticated = await auth0.isAuthenticated();
    if (isAuthenticated) {
        return
    }
    const query = window.location.search
    if (query.includes('code=') && query.includes("state=")) {
        try {
            await auth0.handleRedirectCallBack(query)
        } catch (error) {

        }
        window.history.replaceState({}, document.title, "/")

    }
};

const login = async() => {
    await auth0.loginWithRedirect({
        redirect_uri: window.location.origin
    });
};

function logout() {
    auth0.logout({
        returnTo: window.location.origin
    })
}
// NEW
const updateUI = async() => {
    const isAuthenticated = await auth0.isAuthenticated();

    document.getElementById("btn-logout").disabled = !isAuthenticated;
    document.getElementById("btn-login").disabled = isAuthenticated;
};