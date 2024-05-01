import { Actor, HttpAgent } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";


const IDENTITY_PROVIDER = `http://${process.env.IDENTITY_CANISTER_ID}.${window.location.hostname}:4943`;

process.env.II_URL =
    process.env.DFX_NETWORK === "local"
        ? `http://${process.env.INTERNET_IDENTITY_CANISTER_ID}.localhost:4943/`
        : `https://identity.ic0.app`;

const MAX_TTL = 7 * 24 * 60 * 60 * 1000 * 1000 * 1000; // 7 * 24 * 60 * 60 * 1000 * 1000 * 1000; 7 dni

export async function getAuthClient() {
    return await AuthClient.create();
}

export async function getPrincipal() {
    const authClient = await getAuthClient();
    return authClient.getIdentity()?.getPrincipal();
}

export async function getIdentityText() {
    const authClient = await getAuthClient();
    return (authClient.getIdentity()).toText();
}

export async function getPrincipalText() {
    return (await getPrincipal()).toText();
}

export async function isAuthenticated() {
    try {
        const authClient = await getAuthClient();
        return await authClient.isAuthenticated();
    } catch (err) {
        logout();
    }
}

export async function login() {
    console.log("Attempting login...");
    console.log("Identity Provider URL:", process.env.II_URL); 

    try {
        const authClient = await getAuthClient();
        const isAuthenticated = await authClient.isAuthenticated();
        
        //  ------------do połączenia backendu - przesłania mu ii   !!!!!!!!!!! - wymaga jeszcze implementacji tych funkcji Actor.createActor oraz HttpAgent - znajdę to w icp 201 ts - 
        // https://github.com/dacadeorg/icp-azle-201/blob/main/src/dfinity_js_frontend/src/utils/canisterFactory.js
        // const identity = authClient.getIdentity();
        // console.log(identity.getPrincipal().toText());
        // const agent = new HttpAgent({ identity });
        // const backend = Actor.createActor(canisterId, { agent });   
        // const res = await backend.set_open_hours(chosen);

        if (!isAuthenticated) {
            console.log("User is not authenticated, initiating login...");
            await authClient?.login({
                identityProvider: process.env.II_URL,
                onSuccess: async () => {
                    console.log("Login successful, reloading page...");
                    window.location.reload();
                },
                maxTimeToLive: MAX_TTL,
            });
        } else {
            console.log("User is already authenticated, no need to login.");
        }
    } catch (error) {
        console.error("Error occurred during login:", error);
    }
}



export async function logout() {
    const authClient = await getAuthClient();
    authClient.logout();
    window.location.reload();
}


