import { useEffect, useState } from "react";
//Por hacer
//modes.map(e => `"${e}"`).join(" | ")


/**
 * hook mundialmente requerido y codiciado
 * @param {string} url acepta una url en string
 * @param {Object} opt
 * @param {"get" | "head" | "post" | "put" | "delete" | "connect" | "options" | "trace" | "patch"} [opt.method] acepta un unico de estos valores, establece el metodo de la conexion   
 */

export const Fetch = (url, opt = {}) => {
    
    const methods = ["get", "head", "post", "put", "delete", "connect", "options", "trace", "patch"];

    const modes = ["cors", "no-cors", "same-origin"];
    const caches = ["no-cache", "default", "reloaded", "force-cache", "only-if-cached"];
    const credentials = ["same-origin", "omit", "include"];
    const redirects = ["follow", "manual", "error"];
    const referrerPolicies = ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin", "unsafe-url"];

    if(!opt.headers){
        opt.headers = {"Content-Type" : "application/json"};
    }

    if(!(opt.method && methods.includes(opt.method.toLowerCase()))){
        if(!opt.method){
            opt.method = "get";
        } else {
            throw new Error(`The given method (${opt.method}) does not match a valid one from ${methods}`);
        }
    }

    if(!(opt.mode && modes.includes(opt.mode.toLowerCase()))){
        if(!opt.mode){
            opt.mode = "cors";
        } else {
            throw new Error(`The given method (${opt.mode}) does not match a valid one from ${modes}`);
        }
    }

    if(!(opt.cache && caches.includes(opt.cache.toLowerCase()))){
        if(!opt.cache){
            opt.cache = "default";
        } else {
            throw new Error(`The given method (${opt.cache}) does not match a valid one from ${caches}`);
        }
    }

    if(!(opt.credentials && credentials.includes(opt.credentials.toLowerCase()))){
        if(!opt.credentials){
            opt.credentials = "include";
        } else {
            throw new Error(`The given method (${opt.credentials}) does not match a valid one from ${credentials}`);
        }
    }

    if(!(opt.redirect && redirects.includes(opt.redirect.toLowerCase()))){
        if(!opt.redirect){
            opt.redirect = "follow";
        } else {
            throw new Error(`The given method (${opt.redirect}) does not match a valid one from ${redirects}`);
        }
    }

    if(!(opt.referrerPolicy && referrerPolicies.includes(opt.referrerPolicy.toLowerCase()))){
        if(!opt.referrerPolicy){
            opt.referrerPolicy = "no-referrer-when-downgrade";
        } else {
            throw new Error(`The given method (${opt.referrerPolicy}) does not match a valid one from ${referrerPolicies}`);
        }
    }

    if(opt.data){
        if(opt.method.toLowerCase() === "get"){
            //Object.entries(json) => [["a", 1], ["b", 2]]
            //arrayResultante.map(e => e.join("=")) => ["a=1", "b=2"]
            //array.join("&") => "a=1&b=2"
            url = `${url}?${Object.entries(opt.data).map(e => e.join("=")).join("&")}`;

        } else {
            opt.body = JSON.stringify(opt.data);
        }
    }

    return new Promise((resolve, reject) => {
        fetch(url,opt)
        .then(response => opt.response === "text" ? response.text() : response.json())
        .then(resolve)
        .catch(reject)
    })
}

export const useFetch = (url, opt) => {

    const [response, setResponse] = useState({
        response : null,
        error : null,
        isLoading : true
    })

    useEffect(() => {
        Fetch(url, opt)
        .then(data => setResponse({response: data, error : null, isLoading : false}))
        .catch(error => setResponse({response: null, error, isLoading : false}))

    }, [url,opt]);

    return response;
    
}