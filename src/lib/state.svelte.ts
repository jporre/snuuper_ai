import { getContext, setContext } from "svelte";

type UserData = {
    firstname: string;
    lastname: string;
    secondlastname: string;
    gender: string;
    cellphone: string;
    email: string;
    status: string;
    role: string;
    companyId: string;
    isCompanyAdmin: boolean;
    picture: string;
    };
class User {
    firstname: string = $state('');
    lastname: string = $state('');
    secondlastname: string = $state('');
    gender: string = $state('');
    cellphone: string = $state('');
    email: string = $state('');
    status: string = $state('');
    role: string = $state('');
    companyId: string = $state('');
    isCompanyAdmin: boolean = $state(false);
    picture: string = $state('');

    constructor(initialData: UserData = {firstname: '', lastname: '', secondlastname:'', gender:'', cellphone : '', email: '',  status: '', role: '', companyId: '', isCompanyAdmin: false, picture: ''}) {
        this.firstname = initialData.firstname;
        this.lastname = initialData.lastname;
        this.secondlastname = initialData.secondlastname;
        this.gender = initialData.gender;
        this.cellphone = initialData.cellphone;
        this.email = initialData.email;
        this.status = initialData.status;
        this.role = initialData.role;
        this.companyId = initialData.companyId;
        this.isCompanyAdmin = initialData.isCompanyAdmin;
        this.picture = initialData.picture;
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