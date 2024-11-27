import { redirect, type Actions } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async (event) => {
    if (!event.locals.user) {
        return redirect(302, "/login");
    }
    //console.log(event.locals);
    const countryFromURI = event.params.country || 'JP';
    event.locals.country = [countryFromURI];
    return {
        userData: { 
            firstname: event.locals.user.personalData.firstname, 
            lastname: event.locals.user.personalData.lastname,
            secondlastname: event.locals.user.personalData.secondlastname,
            gender: event.locals.user.personalData.gender,
            role: event.locals.user.accountData.role,
            cellphone: event.locals.user.personalData.cellphone,
            email: event.locals.user.email, 
            picture: event.locals.user.accountData.picture ,
            status: event.locals.user.accountData.status,
            companyId: event.locals.user.accountData.companyId?.toString() || '',
            isCompanyAdmin: event.locals.user.accountData.isCompanyAdmin,
            country: event.locals.country
        }
    };
}) satisfies LayoutServerLoad;
