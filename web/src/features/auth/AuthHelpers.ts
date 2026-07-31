export const getAccessToken = ():string|null =>  localStorage.getItem('accessToken');
export const setAccessToken = (token:string):void => localStorage.setItem('accessToken',token);
export const clearAccess = ():void => localStorage.removeItem('accessToken');
