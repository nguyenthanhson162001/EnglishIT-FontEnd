const configureClient = async() => {
    // const response = await fetchAuthConfig();
    // const config = await response.json();
    auth0 = await createAuth0Client({
        domain: 'dev-az6c4dx3.us.auth0.com',
        clientID: 'oU2OclAGrCxQpRAHLaYVCdzMxhCiO9xj'
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

async function login() {
    await auth0.loginWithRedirect({
        redirect_uri: window.location.origin
    });
}

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