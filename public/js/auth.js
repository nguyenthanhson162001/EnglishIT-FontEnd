var auth0 = null;
const url = "http://localhost:3004";
const myStorage = window.localStorage;
(function() {
    {
        let name = myStorage.getItem('name')
        let avatar = myStorage.getItem('avatar')
        if (name && avatar) {
            updateloggerUIUser(avatar, name)
        }
    }
}())
const fetchAuthConfig = () => fetch(`${url}/api/auth0/config`);
// const fetchAuthConfig = () => fetch(`/auth_config.json`);
const configureClient = async() => {
    console.time("answer time")
    const response = await fetchAuthConfig();
    const config = await response.json();
    console.timeLog("answer time");
    auth0 = await createAuth0Client({
        domain: config.domain,
        client_id: config.clientId,
        audience: config.audience,
    });
    console.timeEnd("answer time");
};
const updateUIAndSetStorage = async() => {
    const isAuthenticated = await auth0.isAuthenticated();
    if (isAuthenticated) {
        // change info user in header and
        let user = await auth0.getUser()
        let name = user.given_name || user.nickname
        if (name != myStorage.getItem('name') || user.picture != myStorage.getItem('name')) {
            updateloggerUIUser(user.picture, name)
            myStorage.setItem('avatar', user.picture)
            myStorage.setItem('name', name)
        }
    }
};

function updateloggerUIUser(picture, name) {
    document.querySelector('.nav-info-user').innerHTML = `
            <div class="avatar">
                <img src="${picture}" alt="">
            </div>
            <div class="border-right "><a class="name">${name}</a></div> </a> </div>
            <a><i class="fad fa-clipboard-list"></i></a>
            <a><i class="fad fa-bell"></i></a>
            <a onclick="logout()"><i class="fad fa-sign-out"></i></a>
        `
}


const login = async() => {
    await auth0.loginWithRedirect({
        redirect_uri: window.location.origin
    });
};

const logout = () => {
    myStorage.removeItem('name');
    myStorage.removeItem('avatar');
    auth0.logout({
        returnTo: window.location.origin
    });
};