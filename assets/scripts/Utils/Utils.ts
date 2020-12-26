import { sys } from "cc";

//
export namespace Utils{

    //禁用log
    const DEBUG  = true;
    if(!DEBUG){
        console.log = function() {}
        console.warn = function() {}
        console.error = function() {}
    }

    export const getPlayerPrefs = function(key : any,defaultValue : any) : any{

        let v : any = sys.localStorage.getItem(key);

        if(v === null){
            return defaultValue;
        }
        
        return v;
    }
    export const setPlayerPrefs = function(key : any,v : any) : void{
        sys.localStorage.setItem(key,v);
    }
}
