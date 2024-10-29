import { getContext, setContext } from "svelte";

type UserData = {
    nombre: string;
    email: string;
    foto: string;
    };
class User {
    nombre: string = $state('');
    email: string = $state('');
    foto: string = $state('');
    constructor(initialData: UserData = {nombre: '', email:'', foto:''}) {
        this.nombre = initialData.nombre;
        this.email = initialData.email;
        this.foto = initialData.foto;
    }
}
const USER_CTX = 'USER_CTX';

export function setUserState(initialData: UserData) {
    const userState = new User(initialData);
    setContext(USER_CTX, userState);
    return userState;
}
export function getUserState(): User {
    return getContext<UserData>(USER_CTX);
}